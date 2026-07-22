"use client";

import { useState, useEffect, useCallback, createContext, useContext, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, ShoppingCart, Calculator, Users, Package,
  TrendingUp, TrendingDown, Wallet, AlertTriangle, Receipt,
  Plus, Search, Barcode, CreditCard, Banknote, Smartphone,
  CheckCircle2, Clock, XCircle, Calendar, Phone, Mail, MapPin,
  ChevronLeft, Activity, ShieldCheck, Boxes, Building2,
  FileText, LogOut, Settings, Bell, RefreshCw, ArrowDownLeft,
  ArrowUpRight, Percent, UserCheck, UserX, Coffee, ShieldAlert,
  Edit, Trash2, UserPlus, KeyRound, Eye, EyeOff, History, Save,
  Lock, Crown, Database, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

// ============================================================
// AUTH CONTEXT
// ============================================================
type AuthUser = {
  id: string; name: string; email: string; role: string;
  branchId?: string | null; organizationId: string;
  avatarColor: string; isActive: boolean;
};
type AuthOrg = { id: string; name: string; currency: string; vatRate: number };

type AuthCtx = {
  user: AuthUser | null;
  org: AuthOrg | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};
const AuthContext = createContext<AuthCtx>({} as any);
export const useAuth = () => useContext(AuthContext);

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "مدير النظام", ACCOUNTANT: "محاسب", HR_MANAGER: "مدير موارد بشرية",
  CASHIER: "كاشير", INVENTORY_MANAGER: "أمين مخزن", BRANCH_MANAGER: "مدير فرع",
};

const ROLE_PERMISSIONS: Record<string, string[]> = {
  ADMIN: ["*"],
  ACCOUNTANT: ["dashboard", "cashier", "accounting", "hr.view", "erp.view", "reports"],
  HR_MANAGER: ["dashboard", "hr", "erp.view", "reports"],
  CASHIER: ["dashboard", "cashier", "erp.view"],
  INVENTORY_MANAGER: ["dashboard", "erp", "reports"],
  BRANCH_MANAGER: ["dashboard", "cashier", "hr.view", "erp.view", "reports"],
};

function hasPermission(role: string, perm: string): boolean {
  return ROLE_PERMISSIONS[role]?.includes("*") || ROLE_PERMISSIONS[role]?.includes(perm);
}

// ============================================================
// ROOT APP
// ============================================================
export default function Home() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [org, setOrg] = useState<AuthOrg | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/auth/me");
      const j = await r.json();
      setUser(j.user || null);
      setOrg(j.organization || null);
    } catch {
      setUser(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (cancelled) return;
      await refresh();
    })();
    return () => { cancelled = true; };
  }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    const r = await fetch("/api/auth/login", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const j = await r.json();
    if (!r.ok) {
      toast.error(j.error || "فشل تسجيل الدخول");
      return false;
    }
    setUser(j.user);
    setOrg(j.organization);
    toast.success(`أهلاً ${j.user.name}!`);
    return true;
  }, []);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setOrg(null);
    toast.success("تم تسجيل الخروج");
  }, []);

  if (loading) return <FullScreenLoader />;

  return (
    <AuthContext.Provider value={{ user, org, loading, login, logout, refresh }}>
      {!user ? <LoginScreen /> : <AppShell />}
    </AuthContext.Provider>
  );
}

function FullScreenLoader() {
  return (
    <div className="min-h-screen bg-background cyber-grid flex items-center justify-center" dir="rtl">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-700 flex items-center justify-center font-extrabold text-white text-2xl glow-primary animate-pulse">
          K
        </div>
        <Loader2 className="w-5 h-5 animate-spin text-cyan-400 mx-auto" />
        <p className="text-xs text-muted-foreground mt-2">جارٍ التحميل...</p>
      </div>
    </div>
  );
}

// ============================================================
// LOGIN SCREEN
// ============================================================
function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState("admin@kmh-erp.sa");
  const [password, setPassword] = useState("admin123");
  const [showPass, setShowPass] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fillDemo = (em: string, pw: string) => {
    setEmail(em); setPassword(pw);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await login(email, password);
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background cyber-grid flex items-center justify-center p-4" dir="rtl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-700 flex items-center justify-center font-extrabold text-white text-3xl glow-primary">
            K
          </div>
          <h1 className="text-2xl font-bold">KMH ERP Suite</h1>
          <p className="text-xs text-muted-foreground mt-1">نظام الإدارة المتكامل — كاشير + محاسبة + موارد بشرية + ERP</p>
        </div>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Lock className="w-4 h-4 text-cyan-400" />
              تسجيل الدخول
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-xs">البريد الإلكتروني</Label>
                <Input
                  id="email" type="email" required value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-muted/40 mt-1" placeholder="you@company.sa"
                />
              </div>
              <div>
                <Label htmlFor="password" className="text-xs">كلمة المرور</Label>
                <div className="relative mt-1">
                  <Input
                    id="password" type={showPass ? "text" : "password"} required
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    className="bg-muted/40 pl-10" placeholder="••••••••"
                  />
                  <button
                    type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" disabled={submitting} className="w-full glow-primary" size="lg">
                {submitting ? <Loader2 className="w-4 h-4 ml-2 animate-spin" /> : <Lock className="w-4 h-4 ml-2" />}
                {submitting ? "جارٍ الدخول..." : "دخول"}
              </Button>
            </form>

            <Separator className="my-4" />
            <div className="text-[10px] text-muted-foreground mb-2">حسابات تجريبية سريعة:</div>
            <div className="grid grid-cols-1 gap-1.5">
              {[
                { role: "👑 Admin", email: "admin@kmh-erp.sa", pw: "admin123", color: "text-cyan-400" },
                { role: "🛒 Cashier", email: "cashier@kmh-erp.sa", pw: "cashier123", color: "text-emerald-400" },
                { role: "🧮 Accountant", email: "accountant@kmh-erp.sa", pw: "acc123", color: "text-amber-400" },
                { role: "👥 HR Manager", email: "hr@kmh-erp.sa", pw: "hr123", color: "text-purple-400" },
                { role: "📦 Inventory", email: "inventory@kmh-erp.sa", pw: "inv123", color: "text-rose-400" },
              ].map((d) => (
                <button
                  key={d.email} type="button" onClick={() => fillDemo(d.email, d.pw)}
                  className="text-right text-[11px] p-2 rounded-md bg-muted/30 hover:bg-muted/60 border border-transparent hover:border-border transition-all flex items-center justify-between"
                >
                  <span className={d.color}>{d.role}</span>
                  <span className="text-muted-foreground font-mono">{d.email}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

// ============================================================
// APP SHELL - main layout after login
// ============================================================
type ModuleKey = "dashboard" | "cashier" | "accounting" | "hr" | "erp" | "admin";

function AppShell() {
  const { user, logout } = useAuth();
  const [active, setActive] = useState<ModuleKey>("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  if (!user) return null;

  const modules: { key: ModuleKey; label: string; icon: any; color: string; perm: string }[] = [
    { key: "dashboard", label: "لوحة التحكم", icon: LayoutDashboard, color: "text-cyan-400", perm: "dashboard" },
    { key: "cashier", label: "نقطة البيع", icon: ShoppingCart, color: "text-emerald-400", perm: "cashier" },
    { key: "accounting", label: "المحاسبة", icon: Calculator, color: "text-amber-400", perm: "accounting" },
    { key: "hr", label: "الموارد البشرية", icon: Users, color: "text-purple-400", perm: "hr" },
    { key: "erp", label: "إدارة المخزون", icon: Package, color: "text-rose-400", perm: "erp" },
    { key: "admin", label: "لوحة الإدارة", icon: ShieldCheck, color: "text-yellow-400", perm: "admin" },
  ].filter((m) => hasPermission(user.role, m.perm));

  const avatarColorMap: Record<string, string> = {
    cyan: "from-cyan-500 to-blue-700",
    emerald: "from-emerald-500 to-teal-700",
    amber: "from-amber-500 to-orange-700",
    purple: "from-purple-500 to-fuchsia-700",
    rose: "from-rose-500 to-pink-700",
    blue: "from-blue-500 to-indigo-700",
  };

  return (
    <div className="min-h-screen bg-background cyber-grid flex" dir="rtl">
      <aside
        className={`${sidebarCollapsed ? "w-20" : "w-72"} shrink-0 bg-sidebar border-l border-sidebar-border flex flex-col transition-all duration-300 sticky top-0 h-screen`}
      >
        <div className="h-20 flex items-center gap-3 px-5 border-b border-sidebar-border">
          <div className="w-10 h-10 shrink-0 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-700 flex items-center justify-center font-extrabold text-white text-lg glow-primary">
            K
          </div>
          {!sidebarCollapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-foreground truncate">KMH ERP Suite</div>
              <div className="text-[10px] text-muted-foreground truncate">نظام الإدارة المتكامل</div>
            </div>
          )}
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {modules.map((m) => {
            const Icon = m.icon;
            const isActive = active === m.key;
            return (
              <button
                key={m.key} onClick={() => setActive(m.key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive ? "bg-primary/15 text-primary" : "text-sidebar-foreground hover:bg-sidebar-accent"
                }`}
                title={m.label}
              >
                <Icon className={`w-5 h-5 ${isActive ? m.color : ""}`} />
                {!sidebarCollapsed && <span className="flex-1 text-right">{m.label}</span>}
                {isActive && !sidebarCollapsed && <ChevronLeft className="w-4 h-4 rotate-180" />}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-sidebar-border space-y-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-sidebar-accent">
                <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${avatarColorMap[user.avatarColor] || avatarColorMap.cyan} flex items-center justify-center text-white text-xs font-bold`}>
                  {user.name.charAt(0)}
                </div>
                {!sidebarCollapsed && (
                  <div className="flex-1 min-w-0 text-right">
                    <div className="text-xs font-semibold text-foreground truncate">{user.name}</div>
                    <div className="text-[10px] text-muted-foreground">{ROLE_LABELS[user.role]}</div>
                  </div>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem className="flex-col items-start">
                <span className="text-sm font-medium">{user.name}</span>
                <span className="text-[10px] text-muted-foreground font-mono">{user.email}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
                <Settings className="w-4 h-4 ml-2" />
                {sidebarCollapsed ? "توسيع القائمة" : "طيّ القائمة"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => logout()} className="text-rose-400">
                <LogOut className="w-4 h-4 ml-2" />
                تسجيل الخروج
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      <main className="flex-1 min-w-0 flex flex-col">
        <header className="h-16 sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-bold">
              {modules.find((m) => m.key === active)?.label}
            </h1>
            <Badge variant="outline" className="text-cyan-400 border-cyan-400/30 bg-cyan-400/5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 pulse-cyan ml-1.5" />
              مباشر
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-[10px]">
              <Crown className="w-3 h-3 ml-1 text-amber-400" />
              {ROLE_LABELS[user.role]}
            </Badge>
            <Button variant="ghost" size="icon" className="text-muted-foreground">
              <Bell className="w-5 h-5" />
            </Button>
            <div className="text-sm text-muted-foreground hidden md:block">
              {new Intl.DateTimeFormat("ar-SA", { weekday: "long", day: "numeric", month: "long" }).format(new Date())}
            </div>
          </div>
        </header>

        <div className="flex-1 p-6 overflow-x-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {active === "dashboard" && <DashboardModule />}
              {active === "cashier" && <CashierModule />}
              {active === "accounting" && <AccountingModule />}
              {active === "hr" && <HRModule />}
              {active === "erp" && <ERPModule />}
              {active === "admin" && <AdminModule />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

// ============================================================
// DASHBOARD MODULE
// ============================================================
function DashboardModule() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const r = await fetch("/api/dashboard");
        if (!r.ok) return;
        const j = await r.json();
        if (!cancelled) { setData(j); }
      } catch {}
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  if (loading || !data) return <SkeletonRow />;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="مبيعات اليوم" value={fmtSAR(data.today.sales)} subtitle={`${data.today.invoices} فاتورة`} icon={ShoppingCart} color="emerald" />
        <KpiCard title="مبيعات الشهر" value={fmtSAR(data.month.sales)} subtitle={`${data.month.invoices} فاتورة`} icon={TrendingUp} color="cyan" />
        <KpiCard title="الذمم المدينة" value={fmtSAR(data.receivables)} subtitle={`${data.customers} عميل`} icon={Wallet} color="amber" />
        <KpiCard title="قيمة المخزون" value={fmtSAR(data.inventory.costValue)} subtitle={`${data.inventory.items} منتج`} icon={Boxes} color="purple" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MiniStat label="مستحقات الموردين" value={fmtSAR(data.payables)} icon={Building2} />
        <MiniStat label="الرواتب الشهرية" value={fmtSAR(data.hr.monthlyPayroll)} icon={Users} />
        <MiniStat label="موظفين نشطين" value={String(data.hr.activeEmployees)} icon={UserCheck} />
        <MiniStat label="طلبات إجازة معلّقة" value={String(data.hr.pendingLeaves)} icon={Clock} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              مبيعات آخر 14 يوم
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SalesChart data={data.sales14Days} />
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              الأكثر مبيعًا (30 يوم)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.topProducts.map((p: any, i: number) => (
              <div key={p.sku} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center">{i + 1}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium truncate">{p.name}</div>
                  <div className="text-[10px] text-muted-foreground">{p.qty} قطعة</div>
                </div>
                <div className="text-xs font-bold text-emerald-400">{fmtSAR(p.revenue)}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-purple-400" />
              توزيع طرق الدفع (30 يوم)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PaymentMethods methods={data.paymentMethods} />
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Receipt className="w-4 h-4 text-cyan-400" />
              أحدث الفواتير
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="max-h-72">
              <div className="space-y-2">
                {data.recentInvoices.map((inv: any) => (
                  <div key={inv.id} className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0">
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-mono font-semibold">{inv.invoiceNumber}</div>
                      <div className="text-[10px] text-muted-foreground">{inv.customer?.name || "عميل نقدي"} • {new Date(inv.invoiceDate).toLocaleDateString("ar-SA")}</div>
                    </div>
                    <Badge variant="outline" className="text-[10px]">{paymentLabel(inv.paymentMethod)}</Badge>
                    <div className="text-sm font-bold text-emerald-400">{fmtSAR(inv.grandTotal)}</div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border">
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Clock className="w-4 h-4 text-emerald-400" />حضور اليوم</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {data.hr.attendanceToday.map((a: any) => (
              <div key={a.status} className="text-center p-3 rounded-lg bg-muted/40">
                <div className="text-2xl font-bold">{a._count}</div>
                <div className="text-[10px] text-muted-foreground mt-1">{attendanceLabel(a.status)}</div>
              </div>
            ))}
            {data.hr.attendanceToday.length === 0 && (
              <div className="col-span-5 text-center text-muted-foreground py-6 text-sm">لا توجد سجلات حضور لليوم بعد</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function KpiCard({ title, value, subtitle, icon: Icon, color }: any) {
  const colorMap: any = {
    emerald: "text-emerald-400 bg-emerald-400/10",
    cyan: "text-cyan-400 bg-cyan-400/10",
    amber: "text-amber-400 bg-amber-400/10",
    purple: "text-purple-400 bg-purple-400/10",
  };
  return (
    <Card className="bg-card border-border hover:border-primary/40 transition-colors">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="text-xs text-muted-foreground mb-1">{title}</div>
            <div className="text-2xl font-bold tracking-tight">{value}</div>
            <div className="text-[10px] text-muted-foreground mt-1">{subtitle}</div>
          </div>
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorMap[color]}`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MiniStat({ label, value, icon: Icon }: any) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/30 border border-border/50">
      <Icon className="w-4 h-4 text-muted-foreground" />
      <div className="flex-1 min-w-0">
        <div className="text-[10px] text-muted-foreground">{label}</div>
        <div className="text-sm font-bold truncate">{value}</div>
      </div>
    </div>
  );
}

function SalesChart({ data }: any) {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data.map((d: any) => d.total), 1);
  return (
    <div className="flex items-end gap-1 h-44">
      {data.map((d: any, i: number) => {
        const h = (d.total / max) * 100;
        return (
          <div key={i} className="flex-1 group relative flex flex-col items-center">
            <div className="text-[9px] text-muted-foreground mb-1 opacity-0 group-hover:opacity-100 whitespace-nowrap">{fmtShort(d.total)}</div>
            <div className="w-full rounded-t-md bg-gradient-to-t from-cyan-500/30 to-cyan-400 hover:from-cyan-500/50 hover:to-cyan-300 transition-all" style={{ height: `${h}%` }} />
            <div className="text-[8px] text-muted-foreground mt-1">{new Date(d.date).toLocaleDateString("ar-SA", { day: "numeric" })}</div>
          </div>
        );
      })}
    </div>
  );
}

function PaymentMethods({ methods }: any) {
  if (!methods || methods.length === 0) return null;
  const total = methods.reduce((s: number, m: any) => s + (m._sum.grandTotal || 0), 0);
  const colors = ["#00a8e8", "#10b981", "#f59e0b", "#a855f7", "#ef4444"];
  return (
    <div className="space-y-3">
      {methods.map((m: any, i: number) => {
        const amt = m._sum.grandTotal || 0;
        const pct = total > 0 ? (amt / total) * 100 : 0;
        return (
          <div key={m.paymentMethod}>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colors[i] }} />
                {paymentLabel(m.paymentMethod)}
                <span className="text-muted-foreground">({m._count})</span>
              </span>
              <span className="font-bold">{fmtSAR(amt)}</span>
            </div>
            <Progress value={pct} className="h-1.5" style={{ backgroundColor: colors[i] + "30" } as any} />
          </div>
        );
      })}
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-32 rounded-lg bg-muted/30 animate-pulse" />)}
      </div>
      <div className="h-64 rounded-lg bg-muted/30 animate-pulse" />
    </div>
  );
}

// ============================================================
// CASHIER MODULE
// ============================================================
function CashierModule() {
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [paidAmount, setPaidAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [lastReceipt, setLastReceipt] = useState<any>(null);
  const [showInvoices, setShowInvoices] = useState(false);
  const [invoices, setInvoices] = useState<any[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const r = await fetch("/api/cashier/products");
        if (!r.ok) { if (!cancelled) setLoading(false); return; }
        const j = await r.json();
        if (!cancelled) { setProducts(j.products || []); setLoading(false); }
      } catch { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, []);

  const filtered = products.filter((p) => !search || p.name.includes(search) || p.sku.toLowerCase().includes(search.toLowerCase()) || p.barcode?.includes(search));
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const vat = cart.reduce((s, i) => s + i.price * i.qty * (i.vat / 100), 0);
  const total = subtotal + vat;
  const paid = parseFloat(paidAmount) || 0;
  const change = Math.max(0, paid - total);

  const addToCart = (p: any) => {
    setCart((prev) => {
      const ex = prev.find((i) => i.id === p.id);
      if (ex) return prev.map((i) => (i.id === p.id ? { ...i, qty: i.qty + 1 } : i));
      return [...prev, { id: p.id, name: p.name, price: p.salePrice, qty: 1, vat: p.vatRate }];
    });
  };
  const updateQty = (id: string, delta: number) => setCart((prev) => prev.map((i) => (i.id === id ? { ...i, qty: i.qty + delta } : i)).filter((i) => i.qty > 0));

  const checkout = async () => {
    if (cart.length === 0) { toast.error("السلة فارغة"); return; }
    setProcessing(true);
    try {
      const r = await fetch("/api/cashier/checkout", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: cart.map((i) => ({ productId: i.id, quantity: i.qty, unitPrice: i.price, vatRate: i.vat })), paymentMethod, paidAmount: paid || total }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error);
      setLastReceipt(j.invoice);
      setCart([]); setPaidAmount("");
      toast.success(`فاتورة ${j.invoice.number} + قيد محاسبي تلقائي`);
    } catch (e: any) { toast.error(e.message); }
    finally { setProcessing(false); }
  };

  const loadInvoices = async () => {
    const r = await fetch("/api/cashier/invoices");
    const j = await r.json();
    setInvoices(j.invoices || []);
    setShowInvoices(true);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-9rem)]">
      <div className="lg:col-span-2 flex flex-col">
        <Card className="bg-card border-border flex-1 flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-base">منتجات الفرع</CardTitle>
              <Button variant="outline" size="sm" onClick={loadInvoices}><Receipt className="w-4 h-4 ml-1.5" />الفواتير</Button>
            </div>
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="ابحث بالاسم، SKU، أو امسح الباركود..." value={search} onChange={(e) => setSearch(e.target.value)} className="pr-10 bg-muted/40" />
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden">
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-32 rounded-lg bg-muted/30 animate-pulse" />)}
              </div>
            ) : (
              <ScrollArea className="h-full">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pb-4">
                  {filtered.map((p) => (
                    <button key={p.id} onClick={() => addToCart(p)} className="group text-right p-3 rounded-lg bg-muted/30 border border-border/50 hover:border-primary/60 hover:bg-primary/5 transition-all">
                      <div className="aspect-square mb-2 rounded-md bg-gradient-to-br from-cyan-500/20 to-purple-600/20 flex items-center justify-center">
                        <Barcode className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <div className="text-xs font-medium line-clamp-2 h-8">{p.name}</div>
                      <div className="text-[10px] text-muted-foreground font-mono mt-1">{p.sku}</div>
                      <div className="text-sm font-bold text-primary mt-1">{fmtSAR(p.salePrice)}</div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center justify-between">
            <span className="flex items-center gap-2"><ShoppingCart className="w-4 h-4 text-emerald-400" />الفاتورة الحالية</span>
            {cart.length > 0 && <Button variant="ghost" size="sm" onClick={() => setCart([])}>تفريغ</Button>}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          <ScrollArea className="flex-1 -mx-2 px-2">
            <div className="space-y-2">
              {cart.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p className="text-xs">اضغط على منتج لإضافته</p>
                </div>
              ) : (
                cart.map((it) => (
                  <div key={it.id} className="flex items-center gap-2 p-2 rounded-md bg-muted/30">
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium truncate">{it.name}</div>
                      <div className="text-[10px] text-muted-foreground font-mono">{fmtSAR(it.price)} × {it.qty}</div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => updateQty(it.id, -1)}>−</Button>
                      <span className="w-6 text-center text-xs font-bold">{it.qty}</span>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => updateQty(it.id, 1)}>+</Button>
                    </div>
                    <div className="text-xs font-bold text-emerald-400 w-16 text-left">{fmtSAR(it.price * it.qty)}</div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
          {cart.length > 0 && (
            <div className="space-y-3 pt-3 border-t border-border">
              <div className="space-y-1 text-xs">
                <Row label="المجموع الفرعي" value={fmtSAR(subtotal)} />
                <Row label="ضريبة القيمة المضافة (15%)" value={fmtSAR(vat)} />
                <div className="h-px bg-border my-2" />
                <div className="flex items-center justify-between text-base font-bold"><span>الإجمالي</span><span className="text-primary">{fmtSAR(total)}</span></div>
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground">طريقة الدفع</label>
                <div className="grid grid-cols-4 gap-1 mt-1">
                  {[{ v: "CASH", icon: Banknote, label: "نقدي" }, { v: "CARD", icon: CreditCard, label: "بطاقة" }, { v: "TRANSFER", icon: Smartphone, label: "تحويل" }, { v: "WALLET", icon: Wallet, label: "محفظة" }].map((m) => {
                    const Icon = m.icon;
                    return (
                      <button key={m.v} onClick={() => setPaymentMethod(m.v)} className={`p-2 rounded-md flex flex-col items-center gap-1 text-[10px] transition-all ${paymentMethod === m.v ? "bg-primary/15 text-primary border border-primary/40" : "bg-muted/30 border border-transparent hover:bg-muted/50"}`}>
                        <Icon className="w-4 h-4" />{m.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground">المبلغ المدفوع</label>
                <Input type="number" placeholder={total.toFixed(2)} value={paidAmount} onChange={(e) => setPaidAmount(e.target.value)} className="bg-muted/40" />
                {paid > 0 && <div className="text-[10px] text-emerald-400 mt-1">الباقي للعميل: {fmtSAR(change)}</div>}
              </div>
              <Button onClick={checkout} disabled={processing} className="w-full glow-primary" size="lg">
                {processing ? <Loader2 className="w-4 h-4 ml-2 animate-spin" /> : null}
                {processing ? "جارٍ المعالجة..." : `إصدار الفاتورة • ${fmtSAR(total)}`}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {lastReceipt && <ReceiptDialog receipt={lastReceipt} onClose={() => setLastReceipt(null)} />}
      {showInvoices && <InvoicesListDialog invoices={invoices} onClose={() => setShowInvoices(false)} />}
    </div>
  );
}

function ReceiptDialog({ receipt, onClose }: any) {
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <div className="text-center mb-4">
          <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          </div>
          <h3 className="text-lg font-bold">تم إصدار الفاتورة</h3>
          <p className="text-xs text-muted-foreground font-mono">{receipt.number}</p>
        </div>
        <div className="bg-muted/30 rounded-lg p-4 space-y-2 text-xs font-mono">
          <div className="text-center pb-2 border-b border-border">
            <div className="font-bold">مؤسسة الحربي التجارية</div>
            <div className="text-[10px] text-muted-foreground">الرقم الضريبي: 300123456700003</div>
            <div className="text-[10px] text-muted-foreground">{new Date(receipt.date).toLocaleString("ar-SA")}</div>
          </div>
          {receipt.items.map((it: any, i: number) => (
            <div key={i} className="flex justify-between">
              <span className="truncate flex-1">{it.name} × {it.qty}</span>
              <span>{fmtSAR(it.total)}</span>
            </div>
          ))}
          <div className="border-t border-border pt-2 space-y-1">
            <div className="flex justify-between"><span>المجموع</span><span>{fmtSAR(receipt.subtotal)}</span></div>
            <div className="flex justify-between"><span>ضريبة 15%</span><span>{fmtSAR(receipt.vat)}</span></div>
            <div className="flex justify-between font-bold text-sm"><span>الإجمالي</span><span>{fmtSAR(receipt.total)}</span></div>
            <div className="flex justify-between"><span>المدفوع</span><span>{fmtSAR(receipt.paid)}</span></div>
            <div className="flex justify-between"><span>الباقي</span><span>{fmtSAR(receipt.change)}</span></div>
          </div>
        </div>
        <div className="mt-4 p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-xs text-cyan-300">
          <div className="font-semibold mb-1">⚙️ الأتمتة المُنفَّذة:</div>
          <ul className="space-y-0.5 text-[11px]">
            <li>✓ قيد محاسبي تلقائي للفاتورة</li>
            <li>✓ قيد تكلفة البضاعة المباعة (COGS)</li>
            <li>✓ {receipt.items.length} حركة مخزون (صادر)</li>
            <li>✓ تحديث أرصدة 4 حسابات محاسبية</li>
            <li>✓ تسجيل العملية في سجل التدقيق</li>
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function InvoicesListDialog({ invoices, onClose }: any) {
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader><DialogTitle>آخر الفواتير ({invoices.length})</DialogTitle></DialogHeader>
        <ScrollArea className="max-h-[60vh]">
          <Table>
            <TableHeader><TableRow>
              <TableHead>رقم الفاتورة</TableHead><TableHead>العميل</TableHead>
              <TableHead>التاريخ</TableHead><TableHead>الدفع</TableHead>
              <TableHead className="text-left">الإجمالي</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {invoices.map((inv: any) => (
                <TableRow key={inv.id}>
                  <TableCell className="font-mono text-xs">{inv.invoiceNumber}</TableCell>
                  <TableCell className="text-xs">{inv.customer?.name || "عميل نقدي"}</TableCell>
                  <TableCell className="text-xs">{new Date(inv.invoiceDate).toLocaleDateString("ar-SA")}</TableCell>
                  <TableCell><Badge variant="outline" className="text-[10px]">{paymentLabel(inv.paymentMethod)}</Badge></TableCell>
                  <TableCell className="text-left font-bold text-emerald-400">{fmtSAR(inv.grandTotal)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================
// ACCOUNTING MODULE
// ============================================================
function AccountingModule() {
  const [tab, setTab] = useState("trial");
  const [accounts, setAccounts] = useState<any[]>([]);
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [ar, jr] = await Promise.all([
          fetch("/api/accounting/accounts").then((r) => r.json()),
          fetch("/api/accounting/journal?limit=30").then((r) => r.json()),
        ]);
        if (!cancelled) { setAccounts(ar.accounts || []); setEntries(jr.entries || []); }
      } catch {}
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  if (loading) return <SkeletonRow />;

  const totalDebit = accounts.reduce((s, a) => s + a.debit, 0);
  const totalCredit = accounts.reduce((s, a) => s + a.credit, 0);
  const revenue = accounts.filter((a) => a.type === "REVENUE").reduce((s, a) => s + a.balance, 0);
  const cogs = accounts.filter((a) => a.type === "COST_OF_SALES").reduce((s, a) => s + a.balance, 0);
  const expenses = accounts.filter((a) => a.type === "EXPENSE").reduce((s, a) => s + a.balance, 0);
  const grossProfit = revenue - cogs;
  const netProfit = grossProfit - expenses;

  return (
    <div className="space-y-4">
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-muted/40">
          <TabsTrigger value="trial">ميزان المراجعة</TabsTrigger>
          <TabsTrigger value="income">قائمة الدخل</TabsTrigger>
          <TabsTrigger value="journal">اليومية</TabsTrigger>
          <TabsTrigger value="chart">دليل الحسابات</TabsTrigger>
        </TabsList>
        <TabsContent value="trial">
          <Card className="bg-card border-border">
            <CardHeader><CardTitle className="text-base">ميزان المراجعة — {new Date().toLocaleDateString("ar-SA", { month: "long", year: "numeric" })}</CardTitle></CardHeader>
            <CardContent>
              <ScrollArea className="max-h-[60vh]">
                <Table>
                  <TableHeader><TableRow>
                    <TableHead className="w-24">الرمز</TableHead><TableHead>اسم الحساب</TableHead>
                    <TableHead>النوع</TableHead><TableHead className="text-left">مدين</TableHead>
                    <TableHead className="text-left">دائن</TableHead><TableHead className="text-left">الرصيد</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {accounts.map((a) => (
                      <TableRow key={a.code} className={a.balance === 0 ? "opacity-50" : ""}>
                        <TableCell className="font-mono text-xs">{a.code}</TableCell>
                        <TableCell className="text-sm">{a.name}</TableCell>
                        <TableCell><Badge variant="outline" className="text-[10px]">{accountTypeLabel(a.type)}</Badge></TableCell>
                        <TableCell className="text-left font-mono text-xs">{a.debit > 0 ? fmtSAR(a.debit) : "—"}</TableCell>
                        <TableCell className="text-left font-mono text-xs">{a.credit > 0 ? fmtSAR(a.credit) : "—"}</TableCell>
                        <TableCell className={`text-left font-mono text-xs font-bold ${a.balance >= 0 ? "text-emerald-400" : "text-rose-400"}`}>{fmtSAR(a.balance)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="border-t-2 border-primary/30 bg-primary/5">
                      <TableCell colSpan={3} className="font-bold">الإجمالي</TableCell>
                      <TableCell className="text-left font-mono font-bold text-primary">{fmtSAR(totalDebit)}</TableCell>
                      <TableCell className="text-left font-mono font-bold text-primary">{fmtSAR(totalCredit)}</TableCell>
                      <TableCell />
                    </TableRow>
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="income">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
            <Card className="bg-card border-border"><CardContent className="p-5"><div className="text-xs text-muted-foreground mb-1">إجمالي الإيرادات</div><div className="text-2xl font-bold text-emerald-400">{fmtSAR(revenue)}</div></CardContent></Card>
            <Card className="bg-card border-border"><CardContent className="p-5"><div className="text-xs text-muted-foreground mb-1">تكلفة المبيعات</div><div className="text-2xl font-bold text-rose-400">{fmtSAR(cogs)}</div></CardContent></Card>
            <Card className="bg-card border-border"><CardContent className="p-5"><div className="text-xs text-muted-foreground mb-1">المصروفات العمومية</div><div className="text-2xl font-bold text-amber-400">{fmtSAR(expenses)}</div></CardContent></Card>
          </div>
          <Card className="bg-card border-border">
            <CardHeader><CardTitle className="text-base">قائمة الدخل — {new Date().toLocaleDateString("ar-SA", { month: "long", year: "numeric" })}</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Row label="إجمالي المبيعات" value={fmtSAR(revenue)} bold />
              <Row label="(−) تكلفة البضاعة المباعة" value={`(${fmtSAR(cogs)})`} negative />
              <Separator />
              <Row label="إجمالي الربح" value={fmtSAR(grossProfit)} bold positive={grossProfit > 0} />
              <Row label="(−) المصروفات العمومية والإدارية" value={`(${fmtSAR(expenses)})`} negative />
              <Separator />
              <Row label="صافي الربح قبل الضريبة" value={fmtSAR(netProfit)} bold positive={netProfit > 0} />
              <Row label="(−) ضريبة الدخل (20%)" value={`(${fmtSAR(netProfit * 0.2)})`} negative />
              <Separator />
              <Row label="صافي الربح بعد الضريبة" value={fmtSAR(netProfit * 0.8)} bold positive={netProfit > 0} large />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="journal">
          <Card className="bg-card border-border">
            <CardHeader><CardTitle className="text-base">دفتر اليومية — آخر {entries.length} قيد</CardTitle></CardHeader>
            <CardContent>
              <ScrollArea className="max-h-[65vh]">
                <div className="space-y-3">
                  {entries.map((e) => (
                    <div key={e.id} className="border border-border rounded-lg overflow-hidden">
                      <div className="flex items-center justify-between p-3 bg-muted/30">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="text-[10px] font-mono">{e.entryNumber}</Badge>
                          <span className="text-xs font-medium">{e.description}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                          <Badge variant="secondary" className="text-[10px]">{journalSourceLabel(e.source)}</Badge>
                          <span>{new Date(e.entryDate).toLocaleDateString("ar-SA")}</span>
                          <span className="font-bold text-primary">{fmtSAR(e.totalDebit)}</span>
                        </div>
                      </div>
                      <Table>
                        <TableHeader><TableRow>
                          <TableHead className="w-20">الرمز</TableHead><TableHead>الحساب</TableHead>
                          <TableHead>البيان</TableHead><TableHead className="text-left w-32">مدين</TableHead>
                          <TableHead className="text-left w-32">دائن</TableHead>
                        </TableRow></TableHeader>
                        <TableBody>
                          {e.lines.map((l: any) => (
                            <TableRow key={l.id}>
                              <TableCell className="font-mono text-xs">{l.account.code}</TableCell>
                              <TableCell className="text-xs">{l.account.name}</TableCell>
                              <TableCell className="text-xs text-muted-foreground">{l.description || "—"}</TableCell>
                              <TableCell className="text-left font-mono text-xs">{l.debit > 0 ? fmtSAR(l.debit) : "—"}</TableCell>
                              <TableCell className="text-left font-mono text-xs">{l.credit > 0 ? fmtSAR(l.credit) : "—"}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="chart">
          <Card className="bg-card border-border">
            <CardHeader><CardTitle className="text-base">دليل الحسابات ({accounts.length} حساب)</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {accounts.map((a) => (
                  <div key={a.code} className="p-3 rounded-lg bg-muted/30 border border-border/50">
                    <div className="flex items-center justify-between mb-1">
                      <Badge variant="outline" className="font-mono text-[10px]">{a.code}</Badge>
                      <Badge variant="outline" className="text-[10px]">{accountTypeLabel(a.type)}</Badge>
                    </div>
                    <div className="text-sm font-medium">{a.name}</div>
                    <div className={`text-xs font-mono mt-1 ${a.balance >= 0 ? "text-emerald-400" : "text-rose-400"}`}>الرصيد: {fmtSAR(a.balance)}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ============================================================
// HR MODULE (with full CRUD for employees)
// ============================================================
function HRModule() {
  const { user } = useAuth();
  const [tab, setTab] = useState("employees");
  const [employees, setEmployees] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [payroll, setPayroll] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editingEmployee, setEditingEmployee] = useState<any | null>(null);
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);

  const canEdit = user && hasPermission(user.role, "hr");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [emp, att, lv] = await Promise.all([
        fetch("/api/hr/employees").then((r) => r.json()),
        fetch("/api/hr/attendance").then((r) => r.json()),
        fetch("/api/hr/leaves").then((r) => r.json()),
      ]);
      setEmployees(emp.employees || []);
      setAttendance(att.attendance || []);
      setLeaves(lv.leaves || []);
      const now = new Date();
      const pr = await fetch(`/api/hr/payroll?month=${now.getMonth() + 1}&year=${now.getFullYear()}`);
      if (pr.ok) { const pj = await pr.json(); setPayroll(pj.batch); }
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => { if (!cancelled) await load(); })();
    return () => { cancelled = true; };
  }, [load]);

  const approveLeave = async (id: string, status: string) => {
    const r = await fetch("/api/hr/leaves", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) });
    if (r.ok) { toast.success(status === "APPROVED" ? "تمت الموافقة" : "تم الرفض"); load(); }
  };

  const approvePayroll = async () => {
    const now = new Date();
    const r = await fetch(`/api/hr/payroll?month=${now.getMonth() + 1}&year=${now.getFullYear()}`, { method: "POST" });
    const j = await r.json();
    if (j.success) { toast.success("تم صرف الرواتب + القيود المحاسبية"); load(); }
    else toast.error(j.error);
  };

  const deleteEmployee = async (id: string, name: string) => {
    if (!confirm(`هل أنت متأكد من حذف الموظف "${name}"؟`)) return;
    const r = await fetch(`/api/employees/${id}`, { method: "DELETE" });
    if (r.ok) { toast.success("تم حذف الموظف"); load(); }
    else { const j = await r.json(); toast.error(j.error); }
  };

  if (loading) return <SkeletonRow />;

  return (
    <div className="space-y-4">
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-muted/40">
          <TabsTrigger value="employees">الموظفون ({employees.length})</TabsTrigger>
          <TabsTrigger value="attendance">الحضور والانصراف</TabsTrigger>
          <TabsTrigger value="payroll">الرواتب</TabsTrigger>
          <TabsTrigger value="leaves">الإجازات ({leaves.filter((l) => l.status === "PENDING").length})</TabsTrigger>
        </TabsList>
        <TabsContent value="employees">
          <div className="space-y-4">
            {canEdit && (
              <div className="flex justify-end">
                <Button onClick={() => { setEditingEmployee(null); setShowEmployeeForm(true); }}>
                  <UserPlus className="w-4 h-4 ml-2" />
                  إضافة موظف
                </Button>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {employees.map((e) => (
                <Card key={e.id} className="bg-card border-border hover:border-primary/40 transition-colors">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-cyan-600 flex items-center justify-center text-white font-bold">
                        {(e.name || "?").charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm">{e.name}</div>
                        <div className="text-[10px] text-muted-foreground font-mono">{e.code}</div>
                        <Badge variant="outline" className="text-[10px] mt-1">{e.position}</Badge>
                      </div>
                      {canEdit && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <Settings className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => { setEditingEmployee(e); setShowEmployeeForm(true); }}>
                              <Edit className="w-3 h-3 ml-2" /> تعديل
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-rose-400" onClick={() => deleteEmployee(e.id, e.name)}>
                              <Trash2 className="w-3 h-3 ml-2" /> حذف
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                      <div className="flex items-center gap-1.5 text-muted-foreground"><Building2 className="w-3 h-3" /> {e.department || "—"}</div>
                      <div className="flex items-center gap-1.5 text-muted-foreground"><Phone className="w-3 h-3" /> {e.phone ? e.phone.slice(-9) : "—"}</div>
                    </div>
                    <Separator className="my-3" />
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div><div className="text-sm font-bold text-emerald-400">{fmtShort(e.baseSalary + e.allowances)}</div><div className="text-[9px] text-muted-foreground">الإجمالي</div></div>
                      <div><div className="text-sm font-bold text-cyan-400">{(e.attendance30Days?.PRESENT || 0) + (e.attendance30Days?.LATE || 0)}</div><div className="text-[9px] text-muted-foreground">حضور 30ي</div></div>
                      <div><div className="text-sm font-bold text-amber-400">{e.pendingLeaves}</div><div className="text-[9px] text-muted-foreground">إجازات معلّقة</div></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>
        <TabsContent value="attendance">
          <Card className="bg-card border-border">
            <CardHeader><CardTitle className="text-base">حضور اليوم وآخر 7 أيام</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow>
                  <TableHead>الموظف</TableHead><TableHead>القسم</TableHead><TableHead>حالة اليوم</TableHead>
                  <TableHead className="text-center">حضور 7 أيام</TableHead><TableHead className="text-center">غياب 7 أيام</TableHead><TableHead className="text-center">ساعات إضافية</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {attendance.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell><div className="font-medium text-sm">{a.fullName}</div><div className="text-[10px] text-muted-foreground font-mono">{a.employeeCode}</div></TableCell>
                      <TableCell className="text-xs">{a.department}</TableCell>
                      <TableCell><Badge variant="outline" className={a.todayStatus === "PRESENT" ? "text-emerald-400 border-emerald-400/30" : a.todayStatus === "LATE" ? "text-amber-400 border-amber-400/30" : a.todayStatus === "ABSENT" ? "text-rose-400 border-rose-400/30" : ""}>{attendanceLabel(a.todayStatus)}</Badge></TableCell>
                      <TableCell className="text-center font-bold text-emerald-400">{a.last7.present}</TableCell>
                      <TableCell className="text-center font-bold text-rose-400">{a.last7.absent}</TableCell>
                      <TableCell className="text-center font-bold text-amber-400">{a.last7.overtimeHours}h</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="payroll">
          {payroll && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-card border-border"><CardContent className="p-5"><div className="text-xs text-muted-foreground mb-1">إجمالي الرواتب</div><div className="text-2xl font-bold text-emerald-400">{fmtSAR(payroll.totalGross)}</div></CardContent></Card>
                <Card className="bg-card border-border"><CardContent className="p-5"><div className="text-xs text-muted-foreground mb-1">إجمالي الاستقطاعات (GOSI)</div><div className="text-2xl font-bold text-rose-400">{fmtSAR(payroll.totalDeductions)}</div></CardContent></Card>
                <Card className="bg-card border-border"><CardContent className="p-5"><div className="text-xs text-muted-foreground mb-1">الصافي للصرف</div><div className="text-2xl font-bold text-cyan-400">{fmtSAR(payroll.totalNet)}</div></CardContent></Card>
              </div>
              <Card className="bg-card border-border">
                <CardHeader><div className="flex items-center justify-between"><CardTitle className="text-base">دفعة رواتب {payroll.batchNumber} — {payroll.items.length} موظف</CardTitle><Badge variant={payroll.status === "PAID" ? "default" : "secondary"}>{payroll.status === "PAID" ? "تم الصرف" : payroll.status === "APPROVED" ? "معتمدة" : "مسودة"}</Badge></div></CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader><TableRow>
                      <TableHead>الموظف</TableHead><TableHead>المنصب</TableHead>
                      <TableHead className="text-left">الأساسي</TableHead><TableHead className="text-left">البدلات</TableHead>
                      <TableHead className="text-left">الإجمالي</TableHead><TableHead className="text-left">GOSI 10%</TableHead><TableHead className="text-left">الصافي</TableHead>
                    </TableRow></TableHeader>
                    <TableBody>
                      {payroll.items.map((it: any) => (
                        <TableRow key={it.id}>
                          <TableCell><div className="font-medium text-sm">{it.employee.fullName}</div><div className="text-[10px] text-muted-foreground font-mono">{it.employee.employeeCode}</div></TableCell>
                          {/* payroll API returns fullName/employeeCode so this is fine */}
                          <TableCell className="text-xs">{it.employee.position}</TableCell>
                          <TableCell className="text-left font-mono text-xs">{fmtSAR(it.baseSalary)}</TableCell>
                          <TableCell className="text-left font-mono text-xs">{fmtSAR(it.allowances)}</TableCell>
                          <TableCell className="text-left font-mono text-xs font-bold">{fmtSAR(it.grossPay)}</TableCell>
                          <TableCell className="text-left font-mono text-xs text-rose-400">-{fmtSAR(it.gosiDeduction)}</TableCell>
                          <TableCell className="text-left font-mono text-xs font-bold text-emerald-400">{fmtSAR(it.netPay)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {canEdit && (
                    <div className="mt-4 flex items-center gap-3">
                      <Button onClick={approvePayroll} disabled={payroll.status === "PAID"} className="glow-primary">
                        <CheckCircle2 className="w-4 h-4 ml-2" />
                        {payroll.status === "PAID" ? "تم الصرف بالفعل" : "اعتماد وصرف الرواتب"}
                      </Button>
                      <p className="text-xs text-muted-foreground">⚙️ سيتم توليد قيد محاسبي تلقائيًا</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
        <TabsContent value="leaves">
          <Card className="bg-card border-border">
            <CardHeader><CardTitle className="text-base">طلبات الإجازات ({leaves.length})</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow>
                  <TableHead>الموظف</TableHead><TableHead>النوع</TableHead><TableHead>من</TableHead>
                  <TableHead>إلى</TableHead><TableHead className="text-center">عدد الأيام</TableHead>
                  <TableHead>السبب</TableHead><TableHead className="text-center">الحالة</TableHead>
                  {canEdit && <TableHead className="text-center">الإجراء</TableHead>}
                </TableRow></TableHeader>
                <TableBody>
                  {leaves.map((l) => (
                    <TableRow key={l.id}>
                      <TableCell><div className="font-medium text-sm">{l.employee?.fullName || l.employee?.name || "—"}</div><div className="text-[10px] text-muted-foreground">{l.employee?.position}</div></TableCell>
                      <TableCell><Badge variant="outline" className="text-[10px]">{leaveTypeLabel(l.type)}</Badge></TableCell>
                      <TableCell className="text-xs">{new Date(l.startDate).toLocaleDateString("ar-SA")}</TableCell>
                      <TableCell className="text-xs">{new Date(l.endDate).toLocaleDateString("ar-SA")}</TableCell>
                      <TableCell className="text-center font-bold">{l.daysCount}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{l.reason || "—"}</TableCell>
                      <TableCell className="text-center"><Badge variant="outline" className={l.status === "APPROVED" ? "text-emerald-400 border-emerald-400/30" : l.status === "REJECTED" ? "text-rose-400 border-rose-400/30" : l.status === "PENDING" ? "text-amber-400 border-amber-400/30" : ""}>{leaveStatusLabel(l.status)}</Badge></TableCell>
                      {canEdit && (
                        <TableCell>
                          {l.status === "PENDING" && (
                            <div className="flex gap-1 justify-center">
                              <Button size="sm" onClick={() => approveLeave(l.id, "APPROVED")} className="h-7 text-[10px]">موافقة</Button>
                              <Button size="sm" variant="outline" onClick={() => approveLeave(l.id, "REJECTED")} className="h-7 text-[10px]">رفض</Button>
                            </div>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      {showEmployeeForm && (
        <EmployeeFormDialog
          employee={editingEmployee}
          onClose={() => setShowEmployeeForm(false)}
          onSaved={() => { setShowEmployeeForm(false); load(); }}
        />
      )}
    </div>
  );
}

function EmployeeFormDialog({ employee, onClose, onSaved }: any) {
  const [form, setForm] = useState({
    employeeCode: employee?.employeeCode || employee?.code || "",
    fullName: employee?.fullName || employee?.name || "",
    nationalId: employee?.nationalId || "",
    phone: employee?.phone || "",
    email: employee?.email || "",
    position: employee?.position || "",
    department: employee?.department || "",
    baseSalary: employee?.baseSalary || 0,
    allowances: employee?.allowances || 0,
    hireDate: employee?.hireDate ? new Date(employee.hireDate).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
  });
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!form.employeeCode || !form.fullName || !form.position) {
      toast.error("كود الموظف، الاسم، والمنصب مطلوبة");
      return;
    }
    setSaving(true);
    try {
      const url = employee ? `/api/employees/${employee.id}` : "/api/employees";
      const method = employee ? "PATCH" : "POST";
      const r = await fetch(url, {
        method, headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error);
      toast.success(employee ? "تم تحديث الموظف" : "تمت إضافة الموظف");
      onSaved();
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>{employee ? "تعديل موظف" : "إضافة موظف جديد"}</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">كود الموظف *</Label>
            <Input value={form.employeeCode} onChange={(e) => setForm({ ...form, employeeCode: e.target.value })} className="bg-muted/40 mt-1" />
          </div>
          <div>
            <Label className="text-xs">الاسم الكامل *</Label>
            <Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="bg-muted/40 mt-1" />
          </div>
          <div>
            <Label className="text-xs">رقم الهوية</Label>
            <Input value={form.nationalId} onChange={(e) => setForm({ ...form, nationalId: e.target.value })} className="bg-muted/40 mt-1" />
          </div>
          <div>
            <Label className="text-xs">الجوال</Label>
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="bg-muted/40 mt-1" />
          </div>
          <div className="col-span-2">
            <Label className="text-xs">البريد الإلكتروني</Label>
            <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="bg-muted/40 mt-1" />
          </div>
          <div>
            <Label className="text-xs">المنصب *</Label>
            <Input value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} className="bg-muted/40 mt-1" />
          </div>
          <div>
            <Label className="text-xs">القسم</Label>
            <Input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className="bg-muted/40 mt-1" />
          </div>
          <div>
            <Label className="text-xs">الراتب الأساسي</Label>
            <Input type="number" value={form.baseSalary} onChange={(e) => setForm({ ...form, baseSalary: parseFloat(e.target.value) })} className="bg-muted/40 mt-1" />
          </div>
          <div>
            <Label className="text-xs">البدلات</Label>
            <Input type="number" value={form.allowances} onChange={(e) => setForm({ ...form, allowances: parseFloat(e.target.value) })} className="bg-muted/40 mt-1" />
          </div>
          <div className="col-span-2">
            <Label className="text-xs">تاريخ التعيين</Label>
            <Input type="date" value={form.hireDate} onChange={(e) => setForm({ ...form, hireDate: e.target.value })} className="bg-muted/40 mt-1" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>إلغاء</Button>
          <Button onClick={submit} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 ml-2 animate-spin" /> : <Save className="w-4 h-4 ml-2" />}
            حفظ
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================
// ERP MODULE (with full CRUD for products/suppliers)
// ============================================================
function ERPModule() {
  const { user } = useAuth();
  const [tab, setTab] = useState("inventory");
  const [data, setData] = useState<any>(null);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [pos, setPos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<any | null>(null);
  const [showSupplierForm, setShowSupplierForm] = useState(false);

  const canEdit = user && hasPermission(user.role, "erp");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [inv, sup, po] = await Promise.all([
        fetch("/api/erp/products").then((r) => r.json()),
        fetch("/api/suppliers").then((r) => r.json()),
        fetch("/api/erp/purchase-orders").then((r) => r.json()),
      ]);
      setData(inv);
      setSuppliers(sup.suppliers || []);
      setPos(po.purchaseOrders || []);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => { if (!cancelled) await load(); })();
    return () => { cancelled = true; };
  }, [load]);

  const deleteProduct = async (id: string, name: string) => {
    if (!confirm(`حذف المنتج "${name}"؟`)) return;
    const r = await fetch(`/api/products/${id}`, { method: "DELETE" });
    if (r.ok) { toast.success("تم حذف المنتج"); load(); }
    else { const j = await r.json(); toast.error(j.error); }
  };

  const deleteSupplier = async (id: string, name: string) => {
    if (!confirm(`حذف المورد "${name}"؟`)) return;
    const r = await fetch(`/api/suppliers/${id}`, { method: "DELETE" });
    if (r.ok) { toast.success("تم حذف المورد"); load(); }
  };

  if (loading || !data) return <SkeletonRow />;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border"><CardContent className="p-4"><div className="text-xs text-muted-foreground mb-1">إجمالي المنتجات</div><div className="text-2xl font-bold">{data.summary.totalProducts}</div></CardContent></Card>
        <Card className="bg-card border-border"><CardContent className="p-4"><div className="text-xs text-muted-foreground mb-1">قيمة المخزون (تكلفة)</div><div className="text-2xl font-bold text-cyan-400">{fmtSAR(data.summary.totalCostValue)}</div></CardContent></Card>
        <Card className="bg-card border-border"><CardContent className="p-4"><div className="text-xs text-muted-foreground mb-1">قيمة المخزون (بيع)</div><div className="text-2xl font-bold text-emerald-400">{fmtSAR(data.summary.totalRetailValue)}</div></CardContent></Card>
        <Card className="bg-card border-border"><CardContent className="p-4"><div className="text-xs text-muted-foreground mb-1">منتجات تحت الحد الأدنى</div><div className={`text-2xl font-bold ${data.summary.lowStockCount > 0 ? "text-rose-400" : "text-emerald-400"}`}>{data.summary.lowStockCount}</div></CardContent></Card>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-muted/40">
          <TabsTrigger value="inventory">المخزون ({data.products.length})</TabsTrigger>
          <TabsTrigger value="suppliers">الموردون ({suppliers.length})</TabsTrigger>
          <TabsTrigger value="purchase">أوامر الشراء ({pos.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="inventory">
          <div className="space-y-3">
            {canEdit && (
              <div className="flex justify-end">
                <Button onClick={() => { setEditingProduct(null); setShowProductForm(true); }}>
                  <Plus className="w-4 h-4 ml-2" />إضافة منتج
                </Button>
              </div>
            )}
            <Card className="bg-card border-border">
              <CardContent className="p-0">
                <ScrollArea className="max-h-[60vh]">
                  <Table>
                    <TableHeader><TableRow>
                      <TableHead>SKU</TableHead><TableHead>المنتج</TableHead><TableHead>الفئة</TableHead>
                      <TableHead className="text-left">تكلفة</TableHead><TableHead className="text-left">سعر بيع</TableHead>
                      <TableHead className="text-center">المخزون</TableHead><TableHead className="text-left">قيمة المخزون</TableHead>
                      <TableHead className="text-center">الحالة</TableHead>
                      {canEdit && <TableHead className="text-center">إجراءات</TableHead>}
                    </TableRow></TableHeader>
                    <TableBody>
                      {data.products.map((p: any) => (
                        <TableRow key={p.id} className={p.isLowStock ? "bg-rose-500/5" : ""}>
                          <TableCell className="font-mono text-xs">{p.sku}</TableCell>
                          <TableCell><div className="font-medium text-sm">{p.name}</div>{p.barcode && <div className="text-[10px] text-muted-foreground font-mono">{p.barcode}</div>}</TableCell>
                          <TableCell><Badge variant="outline" className="text-[10px]">{p.category}</Badge></TableCell>
                          <TableCell className="text-left font-mono text-xs">{fmtSAR(p.costPrice)}</TableCell>
                          <TableCell className="text-left font-mono text-xs text-emerald-400">{fmtSAR(p.salePrice)}</TableCell>
                          <TableCell className="text-center font-bold"><span className={p.isLowStock ? "text-rose-400" : ""}>{p.stock}</span><span className="text-[10px] text-muted-foreground"> {p.unit}</span></TableCell>
                          <TableCell className="text-left font-mono text-xs">{fmtSAR(p.stockValue)}</TableCell>
                          <TableCell className="text-center">{p.isLowStock ? <Badge variant="outline" className="text-rose-400 border-rose-400/30"><AlertTriangle className="w-3 h-3 ml-1" />منخفض</Badge> : <Badge variant="outline" className="text-emerald-400 border-emerald-400/30">متوفر</Badge>}</TableCell>
                          {canEdit && (
                            <TableCell>
                              <div className="flex gap-1 justify-center">
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditingProduct(p); setShowProductForm(true); }}><Edit className="w-3.5 h-3.5" /></Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-rose-400" onClick={() => deleteProduct(p.id, p.name)}><Trash2 className="w-3.5 h-3.5" /></Button>
                              </div>
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="suppliers">
          <div className="space-y-3">
            {canEdit && (
              <div className="flex justify-end">
                <Button onClick={() => { setEditingSupplier(null); setShowSupplierForm(true); }}>
                  <Plus className="w-4 h-4 ml-2" />إضافة مورد
                </Button>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {suppliers.map((s) => (
                <Card key={s.id} className="bg-card border-border">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm">{s.name}</div>
                        <div className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1"><MapPin className="w-3 h-3" /> {s.city || "—"}</div>
                      </div>
                      <div className="flex items-center gap-1">
                        {canEdit && (
                          <>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditingSupplier(s); setShowSupplierForm(true); }}><Edit className="w-3.5 h-3.5" /></Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-rose-400" onClick={() => deleteSupplier(s.id, s.name)}><Trash2 className="w-3.5 h-3.5" /></Button>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5"><Users className="w-3 h-3" /> {s.contactPerson || "—"}</div>
                      <div className="flex items-center gap-1.5"><Phone className="w-3 h-3" /> {s.phone || "—"}</div>
                      <div className="flex items-center gap-1.5"><FileText className="w-3 h-3" /> {s.paymentTerms || "—"}</div>
                    </div>
                    <Separator className="my-3" />
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">أوامر شراء: {s.poCount || 0}</span>
                      <span className="font-bold text-rose-400">{fmtSAR(s.balanceDue)}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>
        <TabsContent value="purchase">
          <Card className="bg-card border-border">
            <CardHeader><CardTitle className="text-base flex items-center justify-between">
              <span>أوامر الشراء</span>
              <Button size="sm"><Plus className="w-4 h-4 ml-1.5" />أمر شراء جديد</Button>
            </CardTitle></CardHeader>
            <CardContent>
              {pos.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">لا توجد أوامر شراء بعد</p>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {showProductForm && (
        <ProductFormDialog
          product={editingProduct}
          onClose={() => setShowProductForm(false)}
          onSaved={() => { setShowProductForm(false); load(); }}
        />
      )}
      {showSupplierForm && (
        <SupplierFormDialog
          supplier={editingSupplier}
          onClose={() => setShowSupplierForm(false)}
          onSaved={() => { setShowSupplierForm(false); load(); }}
        />
      )}
    </div>
  );
}

function ProductFormDialog({ product, onClose, onSaved }: any) {
  const [form, setForm] = useState({
    sku: product?.sku || "",
    barcode: product?.barcode || "",
    name: product?.name || "",
    nameEn: product?.nameEn || "",
    description: product?.description || "",
    unit: product?.unit || "قطعة",
    costPrice: product?.costPrice || 0,
    salePrice: product?.salePrice || 0,
    vatRate: product?.vatRate ?? 15,
    reorderLevel: product?.reorderLevel ?? 10,
  });
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!form.sku || !form.name || form.salePrice === undefined) {
      toast.error("SKU، الاسم، وسعر البيع مطلوبة");
      return;
    }
    setSaving(true);
    try {
      const url = product ? `/api/products/${product.id}` : "/api/products";
      const method = product ? "PATCH" : "POST";
      const r = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error);
      toast.success(product ? "تم تحديث المنتج" : "تمت إضافة المنتج");
      onSaved();
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>{product ? "تعديل منتج" : "إضافة منتج جديد"}</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div><Label className="text-xs">SKU *</Label><Input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} className="bg-muted/40 mt-1" /></div>
          <div><Label className="text-xs">الباركود</Label><Input value={form.barcode} onChange={(e) => setForm({ ...form, barcode: e.target.value })} className="bg-muted/40 mt-1" /></div>
          <div className="col-span-2"><Label className="text-xs">الاسم *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-muted/40 mt-1" /></div>
          <div><Label className="text-xs">الوحدة</Label><Input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} className="bg-muted/40 mt-1" /></div>
          <div><Label className="text-xs">الحد الأدنى للإعادة</Label><Input type="number" value={form.reorderLevel} onChange={(e) => setForm({ ...form, reorderLevel: parseInt(e.target.value) })} className="bg-muted/40 mt-1" /></div>
          <div><Label className="text-xs">سعر التكلفة</Label><Input type="number" value={form.costPrice} onChange={(e) => setForm({ ...form, costPrice: parseFloat(e.target.value) })} className="bg-muted/40 mt-1" /></div>
          <div><Label className="text-xs">سعر البيع *</Label><Input type="number" value={form.salePrice} onChange={(e) => setForm({ ...form, salePrice: parseFloat(e.target.value) })} className="bg-muted/40 mt-1" /></div>
          <div><Label className="text-xs">نسبة الضريبة %</Label><Input type="number" value={form.vatRate} onChange={(e) => setForm({ ...form, vatRate: parseFloat(e.target.value) })} className="bg-muted/40 mt-1" /></div>
          <div className="col-span-2"><Label className="text-xs">الوصف</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="bg-muted/40 mt-1" rows={2} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>إلغاء</Button>
          <Button onClick={submit} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 ml-2 animate-spin" /> : <Save className="w-4 h-4 ml-2" />}
            حفظ
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SupplierFormDialog({ supplier, onClose, onSaved }: any) {
  const [form, setForm] = useState({
    name: supplier?.name || "",
    contactPerson: supplier?.contactPerson || "",
    phone: supplier?.phone || "",
    email: supplier?.email || "",
    taxNumber: supplier?.taxNumber || "",
    address: supplier?.address || "",
    city: supplier?.city || "",
    paymentTerms: supplier?.paymentTerms || "",
  });
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!form.name) { toast.error("اسم المورد مطلوب"); return; }
    setSaving(true);
    try {
      const url = supplier ? `/api/suppliers/${supplier.id}` : "/api/suppliers";
      const method = supplier ? "PATCH" : "POST";
      const r = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error);
      toast.success(supplier ? "تم تحديث المورد" : "تمت إضافة المورد");
      onSaved();
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>{supplier ? "تعديل مورد" : "إضافة مورد جديد"}</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2"><Label className="text-xs">اسم المورد *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-muted/40 mt-1" /></div>
          <div><Label className="text-xs">مسؤول التواصل</Label><Input value={form.contactPerson} onChange={(e) => setForm({ ...form, contactPerson: e.target.value })} className="bg-muted/40 mt-1" /></div>
          <div><Label className="text-xs">الهاتف</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="bg-muted/40 mt-1" /></div>
          <div><Label className="text-xs">البريد الإلكتروني</Label><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="bg-muted/40 mt-1" /></div>
          <div><Label className="text-xs">الرقم الضريبي</Label><Input value={form.taxNumber} onChange={(e) => setForm({ ...form, taxNumber: e.target.value })} className="bg-muted/40 mt-1" /></div>
          <div><Label className="text-xs">المدينة</Label><Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="bg-muted/40 mt-1" /></div>
          <div><Label className="text-xs">شروط الدفع</Label><Input value={form.paymentTerms} onChange={(e) => setForm({ ...form, paymentTerms: e.target.value })} className="bg-muted/40 mt-1" placeholder="نقدي / آجل 30 يوم" /></div>
          <div className="col-span-2"><Label className="text-xs">العنوان</Label><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="bg-muted/40 mt-1" /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>إلغاء</Button>
          <Button onClick={submit} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 ml-2 animate-spin" /> : <Save className="w-4 h-4 ml-2" />}
            حفظ
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================
// ADMIN MODULE - User Management + Audit Log + Settings
// ============================================================
function AdminModule() {
  const [tab, setTab] = useState("users");
  const [users, setUsers] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [org, setOrg] = useState<any>(null);
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [showUserForm, setShowUserForm] = useState(false);
  const [showSettingsForm, setShowSettingsForm] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [u, a, s] = await Promise.all([
        fetch("/api/admin/users").then((r) => r.json()),
        fetch("/api/admin/audit?limit=100").then((r) => r.json()),
        fetch("/api/admin/settings").then((r) => r.json()),
      ]);
      setUsers(u.users || []);
      setAuditLogs(a.logs || []);
      setOrg(s.organization);
      setBranches(s.organization?.branches || []);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => { if (!cancelled) await load(); })();
    return () => { cancelled = true; };
  }, [load]);

  const toggleActive = async (id: string, isActive: boolean, name: string) => {
    const r = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    if (r.ok) { toast.success(isActive ? `تم إيقاف ${name}` : `تم تفعيل ${name}`); load(); }
  };

  const changeRole = async (id: string, role: string) => {
    const r = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    if (r.ok) { toast.success("تم تحديث الدور"); load(); }
    else { const j = await r.json(); toast.error(j.error); }
  };

  const deleteUser = async (id: string, name: string) => {
    if (!confirm(`حذف المستخدم "${name}"؟ سيتم إيقاف الحساب وحذف الجلسات.`)) return;
    const r = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    if (r.ok) { toast.success("تم حذف المستخدم"); load(); }
    else { const j = await r.json(); toast.error(j.error); }
  };

  if (loading) return <SkeletonRow />;

  return (
    <div className="space-y-4">
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-muted/40">
          <TabsTrigger value="users"><ShieldCheck className="w-3 h-3 ml-1.5" />المستخدمون ({users.length})</TabsTrigger>
          <TabsTrigger value="audit"><History className="w-3 h-3 ml-1.5" />سجل التدقيق ({auditLogs.length})</TabsTrigger>
          <TabsTrigger value="settings"><Settings className="w-3 h-3 ml-1.5" />الإعدادات</TabsTrigger>
          <TabsTrigger value="branches"><Building2 className="w-3 h-3 ml-1.5" />الفروع</TabsTrigger>
        </TabsList>

        {/* USERS TAB */}
        <TabsContent value="users">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold">إدارة المستخدمين والصلاحيات</h3>
                <p className="text-xs text-muted-foreground">تحكم كامل في حسابات المستخدمين وأدوارهم وحالتهم</p>
              </div>
              <Button onClick={() => { setEditingUser(null); setShowUserForm(true); }}>
                <UserPlus className="w-4 h-4 ml-2" />
                إضافة مستخدم
              </Button>
            </div>
            <Card className="bg-card border-border">
              <CardContent className="p-0">
                <Table>
                  <TableHeader><TableRow>
                    <TableHead>المستخدم</TableHead><TableHead>الدور</TableHead>
                    <TableHead>الفرع</TableHead><TableHead>آخر دخول</TableHead>
                    <TableHead className="text-center">الحالة</TableHead>
                    <TableHead className="text-center">إجراءات</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {users.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${u.avatarColor === "cyan" ? "from-cyan-500 to-blue-700" : u.avatarColor === "emerald" ? "from-emerald-500 to-teal-700" : u.avatarColor === "amber" ? "from-amber-500 to-orange-700" : u.avatarColor === "purple" ? "from-purple-500 to-fuchsia-700" : u.avatarColor === "rose" ? "from-rose-500 to-pink-700" : "from-blue-500 to-indigo-700"} flex items-center justify-center text-white text-xs font-bold`}>
                              {u.name.charAt(0)}
                            </div>
                            <div>
                              <div className="text-sm font-medium">{u.name}</div>
                              <div className="text-[10px] text-muted-foreground font-mono">{u.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Select value={u.role} onValueChange={(v) => changeRole(u.id, v)}>
                            <SelectTrigger className="h-7 text-xs w-36"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {Object.entries(ROLE_LABELS).map(([k, v]) => (
                                <SelectItem key={k} value={k}>{v}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-xs">{u.branchName || "—"}</TableCell>
                        <TableCell className="text-xs">{u.lastLogin ? new Date(u.lastLogin).toLocaleDateString("ar-SA") : "—"}</TableCell>
                        <TableCell className="text-center">
                          <Switch checked={u.isActive} onCheckedChange={() => toggleActive(u.id, u.isActive, u.name)} />
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1 justify-center">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditingUser(u); setShowUserForm(true); }}><Edit className="w-3.5 h-3.5" /></Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-rose-400" onClick={() => deleteUser(u.id, u.name)}><Trash2 className="w-3.5 h-3.5" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Roles legend */}
            <Card className="bg-card border-border">
              <CardHeader><CardTitle className="text-sm">دليل الأدوار والصلاحيات</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                {[
                  { role: "ADMIN", label: "مدير النظام", perms: "صلاحيات كاملة على كل النظام" },
                  { role: "ACCOUNTANT", label: "محاسب", perms: "لوحة التحكم + الكاشير + المحاسبة + عرض HR + عرض ERP" },
                  { role: "HR_MANAGER", label: "مدير موارد بشرية", perms: "لوحة التحكم + HR (تعديل) + عرض ERP" },
                  { role: "CASHIER", label: "كاشير", perms: "لوحة التحكم + نقطة البيع + عرض المخزون" },
                  { role: "INVENTORY_MANAGER", label: "أمين مخزن", perms: "لوحة التحكم + ERP (تعديل) + التقارير" },
                  { role: "BRANCH_MANAGER", label: "مدير فرع", perms: "لوحة التحكم + الكاشير + عرض HR + عرض ERP" },
                ].map((r) => (
                  <div key={r.role} className="p-3 rounded-lg bg-muted/30 border border-border/50">
                    <div className="flex items-center gap-2 mb-1">
                      <Crown className={`w-3 h-3 ${r.role === "ADMIN" ? "text-amber-400" : "text-muted-foreground"}`} />
                      <span className="font-semibold">{r.label}</span>
                    </div>
                    <div className="text-[10px] text-muted-foreground">{r.perms}</div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* AUDIT TAB */}
        <TabsContent value="audit">
          <Card className="bg-card border-border">
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><History className="w-4 h-4 text-cyan-400" />سجل التدقيق — آخر {auditLogs.length} عملية</CardTitle></CardHeader>
            <CardContent>
              <ScrollArea className="max-h-[65vh]">
                <Table>
                  <TableHeader><TableRow>
                    <TableHead>الوقت</TableHead><TableHead>النوع</TableHead>
                    <TableHead>المستخدم</TableHead><TableHead>الكيان</TableHead>
                    <TableHead>الوصف</TableHead><TableHead>IP</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {auditLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="text-[10px] text-muted-foreground font-mono">{new Date(log.createdAt).toLocaleString("ar-SA")}</TableCell>
                        <TableCell><Badge variant="outline" className={`text-[10px] ${log.action === "DELETE" ? "text-rose-400 border-rose-400/30" : log.action === "CREATE" ? "text-emerald-400 border-emerald-400/30" : log.action === "UPDATE" ? "text-amber-400 border-amber-400/30" : log.action === "LOGIN" ? "text-cyan-400 border-cyan-400/30" : log.action === "LOGOUT" ? "text-muted-foreground" : ""}`}>{auditActionLabel(log.action)}</Badge></TableCell>
                        <TableCell className="text-xs">{log.user?.name || "—"}</TableCell>
                        <TableCell><Badge variant="secondary" className="text-[10px]">{log.entity}</Badge></TableCell>
                        <TableCell className="text-xs">{log.description}</TableCell>
                        <TableCell className="text-[10px] text-muted-foreground font-mono">{log.ipAddress || "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SETTINGS TAB */}
        <TabsContent value="settings">
          <Card className="bg-card border-border">
            <CardHeader><CardTitle className="text-base">إعدادات المنشأة</CardTitle></CardHeader>
            <CardContent>
              {org && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div><Label className="text-xs">اسم المنشأة</Label><div className="font-medium mt-1">{org.name}</div></div>
                  <div><Label className="text-xs">الاسم القانوني</Label><div className="font-medium mt-1">{org.legalName || "—"}</div></div>
                  <div><Label className="text-xs">الرقم الضريبي</Label><div className="font-mono mt-1">{org.taxNumber || "—"}</div></div>
                  <div><Label className="text-xs">العملة</Label><div className="mt-1">{org.currency}</div></div>
                  <div><Label className="text-xs">نسبة الضريبة (%)</Label><div className="mt-1">{org.vatRate}%</div></div>
                  <div><Label className="text-xs">الهاتف</Label><div className="mt-1">{org.phone || "—"}</div></div>
                  <div><Label className="text-xs">البريد</Label><div className="mt-1">{org.email || "—"}</div></div>
                  <div><Label className="text-xs">المدينة</Label><div className="mt-1">{org.city || "—"}</div></div>
                  <div className="md:col-span-2"><Label className="text-xs">العنوان</Label><div className="mt-1">{org.address || "—"}</div></div>
                </div>
              )}
              <div className="mt-4">
                <Button onClick={() => setShowSettingsForm(true)}><Edit className="w-4 h-4 ml-2" />تعديل الإعدادات</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* BRANCHES TAB */}
        <TabsContent value="branches">
          <Card className="bg-card border-border">
            <CardHeader><CardTitle className="text-base">فروع المنشأة ({branches.length})</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {branches.map((b) => (
                  <div key={b.id} className="p-4 rounded-lg bg-muted/30 border border-border/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Building2 className="w-4 h-4 text-cyan-400" />
                      <span className="font-semibold text-sm">{b.name}</span>
                      <Badge variant="outline" className="text-[10px] font-mono mr-auto">{b.code}</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div className="flex items-center gap-1.5"><MapPin className="w-3 h-3" /> {b.city || "—"}</div>
                      <div className="flex items-center gap-1.5"><Phone className="w-3 h-3" /> {b.phone || "—"}</div>
                      <div className="flex items-center gap-1.5"><Activity className="w-3 h-3" /> {b.isActive ? "نشط" : "متوقف"}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {showUserForm && (
        <UserFormDialog
          user={editingUser}
          branches={branches}
          onClose={() => setShowUserForm(false)}
          onSaved={() => { setShowUserForm(false); load(); }}
        />
      )}
      {showSettingsForm && org && (
        <SettingsFormDialog
          org={org}
          onClose={() => setShowSettingsForm(false)}
          onSaved={() => { setShowSettingsForm(false); load(); }}
        />
      )}
    </div>
  );
}

function UserFormDialog({ user, branches, onClose, onSaved }: any) {
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    password: "",
    role: user?.role || "CASHIER",
    branchId: user?.branchId || "",
    isActive: user?.isActive ?? true,
  });
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!form.name || !form.email || (!user && !form.password)) {
      toast.error("الاسم، البريد، وكلمة المرور مطلوبة");
      return;
    }
    setSaving(true);
    try {
      const url = user ? `/api/admin/users/${user.id}` : "/api/admin/users";
      const method = user ? "PATCH" : "POST";
      const payload: any = { ...form };
      if (user && !form.password) delete payload.password;
      const r = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error);
      toast.success(user ? "تم تحديث المستخدم" : "تمت إضافة المستخدم");
      onSaved();
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>{user ? "تعديل مستخدم" : "إضافة مستخدم جديد"}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label className="text-xs">الاسم الكامل *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-muted/40 mt-1" /></div>
          <div><Label className="text-xs">البريد الإلكتروني *</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="bg-muted/40 mt-1" /></div>
          <div>
            <Label className="text-xs">{user ? "كلمة مرور جديدة (اتركها فارغة للإبقاء)" : "كلمة المرور *"}</Label>
            <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="bg-muted/40 mt-1" placeholder="••••••" />
          </div>
          <div>
            <Label className="text-xs">الدور</Label>
            <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
              <SelectTrigger className="bg-muted/40 mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(ROLE_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">الفرع</Label>
            <Select value={form.branchId} onValueChange={(v) => setForm({ ...form, branchId: v === "none" ? "" : v })}>
              <SelectTrigger className="bg-muted/40 mt-1"><SelectValue placeholder="بدون فرع" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">بدون فرع</SelectItem>
                {branches.map((b: any) => (
                  <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between p-2 rounded-md bg-muted/30">
            <Label className="text-xs">الحساب نشط</Label>
            <Switch checked={form.isActive} onCheckedChange={(v) => setForm({ ...form, isActive: v })} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>إلغاء</Button>
          <Button onClick={submit} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 ml-2 animate-spin" /> : <Save className="w-4 h-4 ml-2" />}
            حفظ
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SettingsFormDialog({ org, onClose, onSaved }: any) {
  const [form, setForm] = useState({
    name: org.name || "",
    legalName: org.legalName || "",
    taxNumber: org.taxNumber || "",
    vatRate: org.vatRate ?? 15,
    phone: org.phone || "",
    email: org.email || "",
    city: org.city || "",
    address: org.address || "",
  });
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    setSaving(true);
    try {
      const r = await fetch("/api/admin/settings", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!r.ok) { const j = await r.json(); throw new Error(j.error); }
      toast.success("تم تحديث الإعدادات");
      onSaved();
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>تعديل إعدادات المنشأة</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div><Label className="text-xs">اسم المنشأة</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-muted/40 mt-1" /></div>
          <div><Label className="text-xs">الاسم القانوني</Label><Input value={form.legalName} onChange={(e) => setForm({ ...form, legalName: e.target.value })} className="bg-muted/40 mt-1" /></div>
          <div><Label className="text-xs">الرقم الضريبي</Label><Input value={form.taxNumber} onChange={(e) => setForm({ ...form, taxNumber: e.target.value })} className="bg-muted/40 mt-1" /></div>
          <div><Label className="text-xs">نسبة الضريبة (%)</Label><Input type="number" value={form.vatRate} onChange={(e) => setForm({ ...form, vatRate: parseFloat(e.target.value) })} className="bg-muted/40 mt-1" /></div>
          <div><Label className="text-xs">الهاتف</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="bg-muted/40 mt-1" /></div>
          <div><Label className="text-xs">البريد الإلكتروني</Label><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="bg-muted/40 mt-1" /></div>
          <div><Label className="text-xs">المدينة</Label><Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="bg-muted/40 mt-1" /></div>
          <div className="col-span-2"><Label className="text-xs">العنوان</Label><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="bg-muted/40 mt-1" /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>إلغاء</Button>
          <Button onClick={submit} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 ml-2 animate-spin" /> : <Save className="w-4 h-4 ml-2" />}
            حفظ
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================
// SHARED HELPERS
// ============================================================
function Row({ label, value, bold, negative, positive, large }: any) {
  return (
    <div className="flex items-center justify-between">
      <span className={`text-sm ${bold ? "font-bold" : "text-muted-foreground"}`}>{label}</span>
      <span className={`font-mono ${large ? "text-xl" : "text-sm"} ${bold ? "font-bold" : ""} ${negative ? "text-rose-400" : positive ? "text-emerald-400" : ""}`}>{value}</span>
    </div>
  );
}

function fmtSAR(n: number): string {
  return new Intl.NumberFormat("ar-SA", { style: "currency", currency: "SAR", maximumFractionDigits: 0 }).format(n || 0);
}

function fmtShort(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return String(Math.round(n));
}

function paymentLabel(m: string): string {
  const map: any = { CASH: "نقدي", CARD: "بطاقة", TRANSFER: "تحويل", WALLET: "محفظة", CREDIT: "آجل", MIXED: "مختلط" };
  return map[m] || m;
}

function accountTypeLabel(t: string): string {
  const map: any = { ASSET: "أصول", LIABILITY: "التزامات", EQUITY: "حقوق ملكية", REVENUE: "إيرادات", EXPENSE: "مصروفات", COST_OF_SALES: "تكلفة مبيعات" };
  return map[t] || t;
}

function journalSourceLabel(s: string): string {
  const map: any = { MANUAL: "يدوي", SALES_INVOICE: "فاتورة مبيعات", PURCHASE_ORDER: "أمر شراء", PAYMENT_RECEIVED: "تحصيل", PAYMENT_MADE: "صرف", PAYROLL: "رواتب", ADJUSTMENT: "تسوية", OPENING_BALANCE: "رصيد افتتاحي" };
  return map[s] || s;
}

function attendanceLabel(s: string): string {
  const map: any = { PRESENT: "حاضر", ABSENT: "غائب", LATE: "متأخر", HALF_DAY: "نصف يوم", WEEKEND: "عطلة", HOLIDAY: "إجازة" };
  return map[s] || s;
}

function leaveTypeLabel(t: string): string {
  const map: any = { ANNUAL: "سنوية", SICK: "مرضية", EMERGENCY: "طارئة", UNPAID: "بدون راتب", MATERNITY: "وضع", HAJJ: "حج" };
  return map[t] || t;
}

function leaveStatusLabel(s: string): string {
  const map: any = { PENDING: "قيد الانتظار", APPROVED: "موافق عليها", REJECTED: "مرفوضة", CANCELLED: "ملغاة" };
  return map[s] || s;
}

function auditActionLabel(a: string): string {
  const map: any = { CREATE: "إنشاء", UPDATE: "تحديث", DELETE: "حذف", LOGIN: "دخول", LOGOUT: "خروج", APPROVE: "اعتماد", REJECT: "رفض" };
  return map[a] || a;
}

function Trophy(props: any) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  );
}
