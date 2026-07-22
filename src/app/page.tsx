"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, ShoppingCart, Calculator, Users, Package,
  TrendingUp, TrendingDown, Wallet, AlertTriangle, Receipt,
  Plus, Search, Barcode, CreditCard, Banknote, Smartphone,
  CheckCircle2, Clock, XCircle, Calendar, Phone, Mail, MapPin,
  ChevronLeft, Activity, ShieldCheck, Boxes, Building2,
  FileText, LogOut, Settings, Bell, RefreshCw, ArrowDownLeft,
  ArrowUpRight, Percent, UserCheck, UserX, Coffee,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { toast } from "sonner";

type ModuleKey = "dashboard" | "cashier" | "accounting" | "hr" | "erp";

export default function Home() {
  const [activeModule, setActiveModule] = useState<ModuleKey>("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const modules: { key: ModuleKey; label: string; icon: any; color: string }[] = [
    { key: "dashboard", label: "لوحة التحكم", icon: LayoutDashboard, color: "text-cyan-400" },
    { key: "cashier", label: "نقطة البيع", icon: ShoppingCart, color: "text-emerald-400" },
    { key: "accounting", label: "المحاسبة", icon: Calculator, color: "text-amber-400" },
    { key: "hr", label: "الموارد البشرية", icon: Users, color: "text-purple-400" },
    { key: "erp", label: "إدارة المخزون", icon: Package, color: "text-rose-400" },
  ];

  return (
    <div className="min-h-screen bg-background cyber-grid flex" dir="rtl">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarCollapsed ? "w-20" : "w-72"
        } shrink-0 bg-sidebar border-l border-sidebar-border flex flex-col transition-all duration-300 sticky top-0 h-screen`}
      >
        {/* Logo */}
        <div className="h-20 flex items-center gap-3 px-5 border-b border-sidebar-border">
          <div className="relative w-10 h-10 shrink-0 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-700 flex items-center justify-center font-extrabold text-white text-lg glow-primary">
            K
          </div>
          {!sidebarCollapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-foreground truncate">KMH ERP Suite</div>
              <div className="text-[10px] text-muted-foreground truncate">نظام الإدارة المتكامل</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {modules.map((m) => {
            const Icon = m.icon;
            const active = activeModule === m.key;
            return (
              <button
                key={m.key}
                onClick={() => setActiveModule(m.key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? "bg-primary/15 text-primary"
                    : "text-sidebar-foreground hover:bg-sidebar-accent"
                }`}
                title={m.label}
              >
                <Icon className={`w-5 h-5 ${active ? m.color : ""}`} />
                {!sidebarCollapsed && <span className="flex-1 text-right">{m.label}</span>}
                {active && !sidebarCollapsed && (
                  <ChevronLeft className="w-4 h-4 rotate-180" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-sidebar-border space-y-1">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-sidebar-accent"
          >
            <Settings className="w-5 h-5" />
            {!sidebarCollapsed && <span>الإعدادات</span>}
          </button>
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center text-white text-xs font-bold">
              خ.ح
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-foreground truncate">خالد الحربي</div>
                <div className="text-[10px] text-muted-foreground">مدير النظام</div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0 flex flex-col">
        {/* Top bar */}
        <header className="h-16 sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-bold">
              {modules.find((m) => m.key === activeModule)?.label}
            </h1>
            <Badge variant="outline" className="text-cyan-400 border-cyan-400/30 bg-cyan-400/5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 pulse-cyan ml-1.5" />
              مباشر
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="text-muted-foreground">
              <Bell className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-muted-foreground">
              <RefreshCw className="w-5 h-5" />
            </Button>
            <div className="h-6 w-px bg-border" />
            <div className="text-sm text-muted-foreground">
              {new Intl.DateTimeFormat("ar-SA", {
                weekday: "long",
                day: "numeric",
                month: "long",
              }).format(new Date())}
            </div>
          </div>
        </header>

        {/* Module content */}
        <div className="flex-1 p-6 overflow-x-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeModule}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              {activeModule === "dashboard" && <DashboardModule />}
              {activeModule === "cashier" && <CashierModule />}
              {activeModule === "accounting" && <AccountingModule />}
              {activeModule === "hr" && <HRModule />}
              {activeModule === "erp" && <ERPModule />}
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
      const r = await fetch("/api/dashboard");
      const j = await r.json();
      if (!cancelled) {
        setData(j);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (loading || !data) return <DashboardSkeleton />;

  return (
    <div className="space-y-6">
      {/* KPI cards row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="مبيعات اليوم"
          value={fmtSAR(data.today.sales)}
          subtitle={`${data.today.invoices} فاتورة`}
          icon={ShoppingCart}
          trend={+12.5}
          color="emerald"
        />
        <KpiCard
          title="مبيعات الشهر"
          value={fmtSAR(data.month.sales)}
          subtitle={`${data.month.invoices} فاتورة`}
          icon={TrendingUp}
          trend={+8.2}
          color="cyan"
        />
        <KpiCard
          title="الذمم المدينة"
          value={fmtSAR(data.receivables)}
          subtitle={`${data.customers} عميل`}
          icon={Wallet}
          color="amber"
        />
        <KpiCard
          title="قيمة المخزون"
          value={fmtSAR(data.inventory.costValue)}
          subtitle={`${data.inventory.items} منتج`}
          icon={Boxes}
          color="purple"
        />
      </div>

      {/* Secondary KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MiniStat label="مستحقات الموردين" value={fmtSAR(data.payables)} icon={Building2} />
        <MiniStat label="الرواتب الشهرية" value={fmtSAR(data.hr.monthlyPayroll)} icon={Users} />
        <MiniStat label="موظفين نشطين" value={String(data.hr.activeEmployees)} icon={UserCheck} />
        <MiniStat label="طلبات إجازة معلّقة" value={String(data.hr.pendingLeaves)} icon={Clock} />
      </div>

      {/* Sales chart + Top products */}
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
                <div className="w-7 h-7 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center">
                  {i + 1}
                </div>
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

      {/* Payment methods + recent invoices */}
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
                      <div className="text-[10px] text-muted-foreground">
                        {inv.customer?.name || "عميل نقدي"} • {new Date(inv.invoiceDate).toLocaleDateString("ar-SA")}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[10px]">
                      {paymentLabel(inv.paymentMethod)}
                    </Badge>
                    <div className="text-sm font-bold text-emerald-400">{fmtSAR(inv.grandTotal)}</div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Today's attendance summary */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            حضور اليوم
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {data.hr.attendanceToday.map((a: any) => (
              <div key={a.status} className="text-center p-3 rounded-lg bg-muted/40">
                <div className="text-2xl font-bold">{a._count}</div>
                <div className="text-[10px] text-muted-foreground mt-1">{attendanceLabel(a.status)}</div>
              </div>
            ))}
            {data.hr.attendanceToday.length === 0 && (
              <div className="col-span-5 text-center text-muted-foreground py-6 text-sm">
                لا توجد سجلات حضور لليوم بعد
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function KpiCard({
  title, value, subtitle, icon: Icon, trend, color,
}: {
  title: string; value: string; subtitle: string; icon: any;
  trend?: number; color: "emerald" | "cyan" | "amber" | "purple";
}) {
  const colorMap = {
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
        {trend !== undefined && (
          <div className={`mt-3 flex items-center gap-1 text-xs ${trend > 0 ? "text-emerald-400" : "text-rose-400"}`}>
            {trend > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownLeft className="w-3 h-3" />}
            <span>{Math.abs(trend)}% عن الفترة السابقة</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function MiniStat({ label, value, icon: Icon }: { label: string; value: string; icon: any }) {
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

function SalesChart({ data }: { data: any[] }) {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data.map((d) => d.total), 1);
  return (
    <div className="space-y-2">
      <div className="flex items-end gap-1 h-44">
        {data.map((d, i) => {
          const h = (d.total / max) * 100;
          return (
            <div key={i} className="flex-1 group relative flex flex-col items-center">
              <div className="text-[9px] text-muted-foreground mb-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {fmtShort(d.total)}
              </div>
              <div
                className="w-full rounded-t-md bg-gradient-to-t from-cyan-500/30 to-cyan-400 hover:from-cyan-500/50 hover:to-cyan-300 transition-all"
                style={{ height: `${h}%` }}
              />
              <div className="text-[8px] text-muted-foreground mt-1">
                {new Date(d.date).toLocaleDateString("ar-SA", { day: "numeric" })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PaymentMethods({ methods }: { methods: any[] }) {
  if (!methods || methods.length === 0) return null;
  const total = methods.reduce((s, m) => s + (m._sum.grandTotal || 0), 0);
  const colors = ["#00a8e8", "#10b981", "#f59e0b", "#a855f7", "#ef4444"];
  return (
    <div className="space-y-3">
      {methods.map((m, i) => {
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

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 rounded-lg bg-muted/30 animate-pulse" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 h-64 rounded-lg bg-muted/30 animate-pulse" />
        <div className="h-64 rounded-lg bg-muted/30 animate-pulse" />
      </div>
    </div>
  );
}

// ============================================================
// CASHIER MODULE (POS)
// ============================================================
function CashierModule() {
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<{ id: string; name: string; price: number; qty: number; vat: number }[]>([]);
  const [search, setSearch] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<string>("CASH");
  const [paidAmount, setPaidAmount] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [lastReceipt, setLastReceipt] = useState<any>(null);
  const [showInvoiceList, setShowInvoiceList] = useState(false);
  const [invoices, setInvoices] = useState<any[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const r = await fetch("/api/cashier/products");
      const j = await r.json();
      if (!cancelled) {
        setProducts(j.products || []);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filtered = products.filter((p) =>
    !search ||
    p.name.includes(search) ||
    p.sku.toLowerCase().includes(search.toLowerCase()) ||
    p.barcode?.includes(search)
  );

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

  const updateQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) => (i.id === id ? { ...i, qty: i.qty + delta } : i))
        .filter((i) => i.qty > 0)
    );
  };

  const checkout = async () => {
    if (cart.length === 0) { toast.error("السلة فارغة"); return; }
    setProcessing(true);
    try {
      const r = await fetch("/api/cashier/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map((i) => ({
            productId: i.id,
            quantity: i.qty,
            unitPrice: i.price,
            vatRate: i.vat,
          })),
          paymentMethod,
          paidAmount: paid || total,
        }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error);
      setLastReceipt(j.invoice);
      setCart([]);
      setPaidAmount("");
      toast.success(`تم إصدار الفاتورة ${j.invoice.number} + ${j.invoice.items.length} حركة مخزون + قيد محاسبي تلقائي`);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setProcessing(false);
    }
  };

  const loadInvoices = async () => {
    const r = await fetch("/api/cashier/invoices");
    const j = await r.json();
    setInvoices(j.invoices || []);
    setShowInvoiceList(true);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-9rem)]">
      {/* Products grid */}
      <div className="lg:col-span-2 flex flex-col">
        <Card className="bg-card border-border flex-1 flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-base">منتجات الفرع</CardTitle>
              <Button variant="outline" size="sm" onClick={loadInvoices}>
                <Receipt className="w-4 h-4 ml-1.5" />
                الفواتير
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="ابحث بالاسم، SKU، أو امسح الباركود..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pr-10 bg-muted/40"
              />
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden">
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-32 rounded-lg bg-muted/30 animate-pulse" />
                ))}
              </div>
            ) : (
              <ScrollArea className="h-full">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pb-4">
                  {filtered.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => addToCart(p)}
                      className="group text-right p-3 rounded-lg bg-muted/30 border border-border/50 hover:border-primary/60 hover:bg-primary/5 transition-all"
                    >
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

      {/* Cart / Checkout panel */}
      <Card className="bg-card border-border flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center justify-between">
            <span className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-emerald-400" />
              الفاتورة الحالية
            </span>
            {cart.length > 0 && (
              <Button variant="ghost" size="sm" onClick={() => setCart([])}>
                تفريغ
              </Button>
            )}
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
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => updateQty(it.id, -1)}>
                        −
                      </Button>
                      <span className="w-6 text-center text-xs font-bold">{it.qty}</span>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => updateQty(it.id, 1)}>
                        +
                      </Button>
                    </div>
                    <div className="text-xs font-bold text-emerald-400 w-16 text-left">
                      {fmtSAR(it.price * it.qty)}
                    </div>
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
                <div className="flex items-center justify-between text-base font-bold">
                  <span>الإجمالي</span>
                  <span className="text-primary">{fmtSAR(total)}</span>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-muted-foreground">طريقة الدفع</label>
                <div className="grid grid-cols-4 gap-1 mt-1">
                  {[
                    { v: "CASH", icon: Banknote, label: "نقدي" },
                    { v: "CARD", icon: CreditCard, label: "بطاقة" },
                    { v: "TRANSFER", icon: Smartphone, label: "تحويل" },
                    { v: "WALLET", icon: Wallet, label: "محفظة" },
                  ].map((m) => {
                    const Icon = m.icon;
                    return (
                      <button
                        key={m.v}
                        onClick={() => setPaymentMethod(m.v)}
                        className={`p-2 rounded-md flex flex-col items-center gap-1 text-[10px] transition-all ${
                          paymentMethod === m.v
                            ? "bg-primary/15 text-primary border border-primary/40"
                            : "bg-muted/30 border border-transparent hover:bg-muted/50"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {m.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-[10px] text-muted-foreground">المبلغ المدفوع</label>
                <Input
                  type="number"
                  placeholder={total.toFixed(2)}
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(e.target.value)}
                  className="bg-muted/40"
                />
                {paid > 0 && (
                  <div className="text-[10px] text-emerald-400 mt-1">
                    الباقي للعميل: {fmtSAR(change)}
                  </div>
                )}
              </div>

              <Button
                onClick={checkout}
                disabled={processing}
                className="w-full glow-primary"
                size="lg"
              >
                {processing ? "جارٍ المعالجة..." : `إصدار الفاتورة • ${fmtSAR(total)}`}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Receipt dialog */}
      {lastReceipt && (
        <ReceiptDialog receipt={lastReceipt} onClose={() => setLastReceipt(null)} />
      )}

      {/* Invoices list dialog */}
      {showInvoiceList && (
        <InvoicesListDialog
          invoices={invoices}
          onClose={() => setShowInvoiceList(false)}
        />
      )}
    </div>
  );
}

function ReceiptDialog({ receipt, onClose }: { receipt: any; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-card border border-border rounded-xl max-w-md w-full max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="text-center mb-4">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
            <h3 className="text-lg font-bold">تم إصدار الفاتورة</h3>
            <p className="text-xs text-muted-foreground">{receipt.number}</p>
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
            </ul>
          </div>

          <Button onClick={onClose} className="w-full mt-4">إغلاق</Button>
        </div>
      </motion.div>
    </div>
  );
}

function InvoicesListDialog({ invoices, onClose }: { invoices: any[]; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-card border border-border rounded-xl max-w-3xl w-full max-h-[85vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 sticky top-0 bg-card border-b border-border flex items-center justify-between">
          <h3 className="font-bold">آخر الفواتير ({invoices.length})</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>إغلاق</Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>رقم الفاتورة</TableHead>
              <TableHead>العميل</TableHead>
              <TableHead>التاريخ</TableHead>
              <TableHead>الدفع</TableHead>
              <TableHead className="text-left">الإجمالي</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((inv) => (
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
      </motion.div>
    </div>
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
      const [ar, jr] = await Promise.all([
        fetch("/api/accounting/accounts").then((r) => r.json()),
        fetch("/api/accounting/journal?limit=50").then((r) => r.json()),
      ]);
      if (!cancelled) {
        setAccounts(ar.accounts || []);
        setEntries(jr.entries || []);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (loading) return <div className="h-96 rounded-lg bg-muted/30 animate-pulse" />;

  // Compute trial balance totals
  const totalDebit = accounts.reduce((s, a) => s + a.debit, 0);
  const totalCredit = accounts.reduce((s, a) => s + a.credit, 0);

  // Income statement
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

        {/* Trial balance */}
        <TabsContent value="trial">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base">ميزان المراجعة — {new Date().toLocaleDateString("ar-SA", { month: "long", year: "numeric" })}</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="max-h-[60vh]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-24">الرمز</TableHead>
                      <TableHead>اسم الحساب</TableHead>
                      <TableHead>النوع</TableHead>
                      <TableHead className="text-left">مدين</TableHead>
                      <TableHead className="text-left">دائن</TableHead>
                      <TableHead className="text-left">الرصيد</TableHead>
                    </TableRow>
                  </TableHeader>
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

        {/* Income statement */}
        <TabsContent value="income">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="bg-card border-border">
              <CardContent className="p-5">
                <div className="text-xs text-muted-foreground mb-1">إجمالي الإيرادات</div>
                <div className="text-2xl font-bold text-emerald-400">{fmtSAR(revenue)}</div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-5">
                <div className="text-xs text-muted-foreground mb-1">تكلفة المبيعات</div>
                <div className="text-2xl font-bold text-rose-400">{fmtSAR(cogs)}</div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-5">
                <div className="text-xs text-muted-foreground mb-1">المصروفات العمومية</div>
                <div className="text-2xl font-bold text-amber-400">{fmtSAR(expenses)}</div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-card border-border mt-4">
            <CardHeader>
              <CardTitle className="text-base">قائمة الدخل — {new Date().toLocaleDateString("ar-SA", { month: "long", year: "numeric" })}</CardTitle>
            </CardHeader>
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

        {/* Journal */}
        <TabsContent value="journal">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base">دفتر اليومية — آخر {entries.length} قيد</CardTitle>
            </CardHeader>
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
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-20">الرمز</TableHead>
                            <TableHead>الحساب</TableHead>
                            <TableHead>البيان</TableHead>
                            <TableHead className="text-left w-32">مدين</TableHead>
                            <TableHead className="text-left w-32">دائن</TableHead>
                          </TableRow>
                        </TableHeader>
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

        {/* Chart of accounts */}
        <TabsContent value="chart">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base">دليل الحسابات ({accounts.length} حساب)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {accounts.map((a) => (
                  <div key={a.code} className="p-3 rounded-lg bg-muted/30 border border-border/50">
                    <div className="flex items-center justify-between mb-1">
                      <Badge variant="outline" className="font-mono text-[10px]">{a.code}</Badge>
                      <Badge variant="outline" className="text-[10px]">{accountTypeLabel(a.type)}</Badge>
                    </div>
                    <div className="text-sm font-medium">{a.name}</div>
                    <div className={`text-xs font-mono mt-1 ${a.balance >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                      الرصيد: {fmtSAR(a.balance)}
                    </div>
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
// HR MODULE
// ============================================================
function HRModule() {
  const [tab, setTab] = useState("employees");
  const [employees, setEmployees] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [payroll, setPayroll] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadPayroll = useCallback(async () => {
    const now = new Date();
    const r = await fetch(`/api/hr/payroll?month=${now.getMonth() + 1}&year=${now.getFullYear()}`);
    const j = await r.json();
    setPayroll(j.batch);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    const [emp, att, lv] = await Promise.all([
      fetch("/api/hr/employees").then((r) => r.json()),
      fetch("/api/hr/attendance").then((r) => r.json()),
      fetch("/api/hr/leaves").then((r) => r.json()),
    ]);
    setEmployees(emp.employees || []);
    setAttendance(att.attendance || []);
    setLeaves(lv.leaves || []);
    setLoading(false);
    await loadPayroll();
  }, [loadPayroll]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (cancelled) return;
      await load();
    })();
    return () => { cancelled = true; };
  }, [load]);

  const approvePayroll = async () => {
    const now = new Date();
    const r = await fetch(`/api/hr/payroll?month=${now.getMonth() + 1}&year=${now.getFullYear()}`, { method: "POST" });
    const j = await r.json();
    if (j.success) {
      toast.success("تم صرف الرواتب + توليد القيود المحاسبية تلقائيًا");
      loadPayroll();
    } else {
      toast.error(j.error);
    }
  };

  const approveLeave = async (id: string, status: string) => {
    const r = await fetch("/api/hr/leaves", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    if (r.ok) {
      toast.success(status === "APPROVED" ? "تمت الموافقة على الإجازة" : "تم رفض الإجازة");
      load();
    }
  };

  if (loading) return <div className="h-96 rounded-lg bg-muted/30 animate-pulse" />;

  return (
    <div className="space-y-4">
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-muted/40">
          <TabsTrigger value="employees">الموظفون ({employees.length})</TabsTrigger>
          <TabsTrigger value="attendance">الحضور والانصراف</TabsTrigger>
          <TabsTrigger value="payroll">الرواتب</TabsTrigger>
          <TabsTrigger value="leaves">الإجازات ({leaves.filter((l) => l.status === "PENDING").length})</TabsTrigger>
        </TabsList>

        {/* Employees */}
        <TabsContent value="employees">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {employees.map((e) => (
              <Card key={e.id} className="bg-card border-border hover:border-primary/40 transition-colors">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-cyan-600 flex items-center justify-center text-white font-bold">
                      {e.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm">{e.name}</div>
                      <div className="text-[10px] text-muted-foreground font-mono">{e.code}</div>
                      <Badge variant="outline" className="text-[10px] mt-1">{e.position}</Badge>
                    </div>
                    <Badge variant={e.status === "ACTIVE" ? "default" : "secondary"} className="text-[10px]">
                      {e.status === "ACTIVE" ? "نشط" : "متوقف"}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Building2 className="w-3 h-3" /> {e.department || "—"}
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Phone className="w-3 h-3" /> {e.phone ? e.phone.slice(-9) : "—"}
                    </div>
                  </div>
                  <Separator className="my-3" />
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div className="text-sm font-bold text-emerald-400">{fmtShort(e.baseSalary + e.allowances)}</div>
                      <div className="text-[9px] text-muted-foreground">الإجمالي</div>
                    </div>
                    <div>
                      <div className="text-sm font-bold text-cyan-400">{e.attendance30Days.PRESENT || e.attendance30Days.present || 0 + (e.attendance30Days.LATE || 0)}</div>
                      <div className="text-[9px] text-muted-foreground">حضور 30ي</div>
                    </div>
                    <div>
                      <div className="text-sm font-bold text-amber-400">{e.pendingLeaves}</div>
                      <div className="text-[9px] text-muted-foreground">إجازات معلّقة</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Attendance */}
        <TabsContent value="attendance">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base">حضور اليوم وآخر 7 أيام</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الموظف</TableHead>
                    <TableHead>القسم</TableHead>
                    <TableHead>حالة اليوم</TableHead>
                    <TableHead className="text-center">حضور 7 أيام</TableHead>
                    <TableHead className="text-center">غياب 7 أيام</TableHead>
                    <TableHead className="text-center">ساعات إضافية</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendance.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell>
                        <div className="font-medium text-sm">{a.fullName}</div>
                        <div className="text-[10px] text-muted-foreground font-mono">{a.employeeCode}</div>
                      </TableCell>
                      <TableCell className="text-xs">{a.department}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={
                          a.todayStatus === "PRESENT" ? "text-emerald-400 border-emerald-400/30" :
                          a.todayStatus === "LATE" ? "text-amber-400 border-amber-400/30" :
                          a.todayStatus === "ABSENT" ? "text-rose-400 border-rose-400/30" :
                          ""
                        }>
                          {attendanceLabel(a.todayStatus)}
                        </Badge>
                      </TableCell>
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

        {/* Payroll */}
        <TabsContent value="payroll">
          {payroll && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-card border-border">
                  <CardContent className="p-5">
                    <div className="text-xs text-muted-foreground mb-1">إجمالي الرواتب</div>
                    <div className="text-2xl font-bold text-emerald-400">{fmtSAR(payroll.totalGross)}</div>
                  </CardContent>
                </Card>
                <Card className="bg-card border-border">
                  <CardContent className="p-5">
                    <div className="text-xs text-muted-foreground mb-1">إجمالي الاستقطاعات (GOSI)</div>
                    <div className="text-2xl font-bold text-rose-400">{fmtSAR(payroll.totalDeductions)}</div>
                  </CardContent>
                </Card>
                <Card className="bg-card border-border">
                  <CardContent className="p-5">
                    <div className="text-xs text-muted-foreground mb-1">الصافي للصرف</div>
                    <div className="text-2xl font-bold text-cyan-400">{fmtSAR(payroll.totalNet)}</div>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-card border-border">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">
                      دفعة رواتب {payroll.batchNumber} — {payroll.items.length} موظف
                    </CardTitle>
                    <Badge variant={payroll.status === "PAID" ? "default" : "secondary"}>
                      {payroll.status === "PAID" ? "تم الصرف" : payroll.status === "APPROVED" ? "معتمدة" : "مسودة"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>الموظف</TableHead>
                        <TableHead>المنصب</TableHead>
                        <TableHead className="text-left">الأساسي</TableHead>
                        <TableHead className="text-left">البدلات</TableHead>
                        <TableHead className="text-left">الإجمالي</TableHead>
                        <TableHead className="text-left">GOSI 10%</TableHead>
                        <TableHead className="text-left">الصافي</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payroll.items.map((it: any) => (
                        <TableRow key={it.id}>
                          <TableCell>
                            <div className="font-medium text-sm">{it.employee.fullName}</div>
                            <div className="text-[10px] text-muted-foreground font-mono">{it.employee.employeeCode}</div>
                          </TableCell>
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
                  <div className="mt-4 flex items-center gap-3">
                    <Button
                      onClick={approvePayroll}
                      disabled={payroll.status === "PAID"}
                      className="glow-primary"
                    >
                      <CheckCircle2 className="w-4 h-4 ml-2" />
                      {payroll.status === "PAID" ? "تم الصرف بالفعل" : "اعتماد وصرف الرواتب"}
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      ⚙️ سيتم توليد قيد محاسبي تلقائيًا (مدين: مصروف الرواتب، دائن: الصندوق + التأمينات)
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Leaves */}
        <TabsContent value="leaves">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base">طلبات الإجازات ({leaves.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الموظف</TableHead>
                    <TableHead>النوع</TableHead>
                    <TableHead>من</TableHead>
                    <TableHead>إلى</TableHead>
                    <TableHead className="text-center">عدد الأيام</TableHead>
                    <TableHead>السبب</TableHead>
                    <TableHead className="text-center">الحالة</TableHead>
                    <TableHead className="text-center">الإجراء</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaves.map((l) => (
                    <TableRow key={l.id}>
                      <TableCell>
                        <div className="font-medium text-sm">{l.employee.fullName}</div>
                        <div className="text-[10px] text-muted-foreground">{l.employee.position}</div>
                      </TableCell>
                      <TableCell><Badge variant="outline" className="text-[10px]">{leaveTypeLabel(l.type)}</Badge></TableCell>
                      <TableCell className="text-xs">{new Date(l.startDate).toLocaleDateString("ar-SA")}</TableCell>
                      <TableCell className="text-xs">{new Date(l.endDate).toLocaleDateString("ar-SA")}</TableCell>
                      <TableCell className="text-center font-bold">{l.daysCount}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{l.reason || "—"}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className={
                          l.status === "APPROVED" ? "text-emerald-400 border-emerald-400/30" :
                          l.status === "REJECTED" ? "text-rose-400 border-rose-400/30" :
                          l.status === "PENDING" ? "text-amber-400 border-amber-400/30" : ""
                        }>
                          {leaveStatusLabel(l.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {l.status === "PENDING" && (
                          <div className="flex gap-1 justify-center">
                            <Button size="sm" variant="default" onClick={() => approveLeave(l.id, "APPROVED")} className="h-7 text-[10px]">
                              موافقة
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => approveLeave(l.id, "REJECTED")} className="h-7 text-[10px]">
                              رفض
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ============================================================
// ERP MODULE (Inventory + Suppliers + Purchase Orders)
// ============================================================
function ERPModule() {
  const [tab, setTab] = useState("inventory");
  const [data, setData] = useState<any>(null);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [pos, setPos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [inv, sup, po] = await Promise.all([
        fetch("/api/erp/products").then((r) => r.json()),
        fetch("/api/erp/suppliers").then((r) => r.json()),
        fetch("/api/erp/purchase-orders").then((r) => r.json()),
      ]);
      if (!cancelled) {
        setData(inv);
        setSuppliers(sup.suppliers || []);
        setPos(po.purchaseOrders || []);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (loading || !data) return <div className="h-96 rounded-lg bg-muted/30 animate-pulse" />;

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground mb-1">إجمالي المنتجات</div>
            <div className="text-2xl font-bold">{data.summary.totalProducts}</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground mb-1">قيمة المخزون (تكلفة)</div>
            <div className="text-2xl font-bold text-cyan-400">{fmtSAR(data.summary.totalCostValue)}</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground mb-1">قيمة المخزون (بيع)</div>
            <div className="text-2xl font-bold text-emerald-400">{fmtSAR(data.summary.totalRetailValue)}</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground mb-1">منتجات تحت الحد الأدنى</div>
            <div className={`text-2xl font-bold ${data.summary.lowStockCount > 0 ? "text-rose-400" : "text-emerald-400"}`}>
              {data.summary.lowStockCount}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-muted/40">
          <TabsTrigger value="inventory">المخزون ({data.products.length})</TabsTrigger>
          <TabsTrigger value="suppliers">الموردون ({suppliers.length})</TabsTrigger>
          <TabsTrigger value="purchase">أوامر الشراء ({pos.length})</TabsTrigger>
        </TabsList>

        {/* Inventory */}
        <TabsContent value="inventory">
          <Card className="bg-card border-border">
            <CardContent className="p-0">
              <ScrollArea className="max-h-[65vh]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>SKU</TableHead>
                      <TableHead>المنتج</TableHead>
                      <TableHead>الفئة</TableHead>
                      <TableHead className="text-left">تكلفة</TableHead>
                      <TableHead className="text-left">سعر بيع</TableHead>
                      <TableHead className="text-center">المخزون</TableHead>
                      <TableHead className="text-left">قيمة المخزون</TableHead>
                      <TableHead className="text-center">الحالة</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.products.map((p: any) => (
                      <TableRow key={p.id} className={p.isLowStock ? "bg-rose-500/5" : ""}>
                        <TableCell className="font-mono text-xs">{p.sku}</TableCell>
                        <TableCell>
                          <div className="font-medium text-sm">{p.name}</div>
                          {p.barcode && <div className="text-[10px] text-muted-foreground font-mono">{p.barcode}</div>}
                        </TableCell>
                        <TableCell><Badge variant="outline" className="text-[10px]">{p.category}</Badge></TableCell>
                        <TableCell className="text-left font-mono text-xs">{fmtSAR(p.costPrice)}</TableCell>
                        <TableCell className="text-left font-mono text-xs text-emerald-400">{fmtSAR(p.salePrice)}</TableCell>
                        <TableCell className="text-center font-bold">
                          <span className={p.isLowStock ? "text-rose-400" : ""}>{p.stock}</span>
                          <span className="text-[10px] text-muted-foreground"> {p.unit}</span>
                        </TableCell>
                        <TableCell className="text-left font-mono text-xs">{fmtSAR(p.stockValue)}</TableCell>
                        <TableCell className="text-center">
                          {p.isLowStock ? (
                            <Badge variant="outline" className="text-rose-400 border-rose-400/30">
                              <AlertTriangle className="w-3 h-3 ml-1" />
                              منخفض
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-emerald-400 border-emerald-400/30">
                              متوفر
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Suppliers */}
        <TabsContent value="suppliers">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {suppliers.map((s) => (
              <Card key={s.id} className="bg-card border-border">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm">{s.name}</div>
                      <div className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" /> {s.city || "—"}
                      </div>
                    </div>
                    <Building2 className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5"><Users className="w-3 h-3" /> {s.contactPerson || "—"}</div>
                    <div className="flex items-center gap-1.5"><Phone className="w-3 h-3" /> {s.phone || "—"}</div>
                    <div className="flex items-center gap-1.5"><FileText className="w-3 h-3" /> {s.paymentTerms || "—"}</div>
                  </div>
                  <Separator className="my-3" />
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">أوامر شراء: {s.poCount}</span>
                    <span className="font-bold text-rose-400">{fmtSAR(s.balanceDue)}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Purchase orders */}
        <TabsContent value="purchase">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base flex items-center justify-between">
                <span>أوامر الشراء</span>
                <Button size="sm">
                  <Plus className="w-4 h-4 ml-1.5" />
                  أمر شراء جديد
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pos.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">لا توجد أوامر شراء بعد</p>
                  <p className="text-xs mt-1">عند إنشاء أمر شراء وتوريد البضاعة، سيتم:</p>
                  <ul className="text-xs mt-2 space-y-0.5 text-cyan-400">
                    <li>✓ توليد قيد محاسبي تلقائيًا</li>
                    <li>✓ تحديث المخزون بحركة وارد</li>
                    <li>✓ تحديث رصيد المورد المستحق</li>
                  </ul>
                </div>
              ) : (
                <Table>...</Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ============================================================
// HELPERS
// ============================================================
function Row({
  label, value, bold, negative, positive, large,
}: {
  label: string; value: string; bold?: boolean; negative?: boolean; positive?: boolean; large?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className={`text-sm ${bold ? "font-bold" : "text-muted-foreground"}`}>{label}</span>
      <span
        className={`font-mono ${large ? "text-xl" : "text-sm"} ${bold ? "font-bold" : ""} ${
          negative ? "text-rose-400" : positive ? "text-emerald-400" : ""
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function fmtSAR(n: number): string {
  return new Intl.NumberFormat("ar-SA", {
    style: "currency",
    currency: "SAR",
    maximumFractionDigits: 0,
  }).format(n || 0);
}

function fmtShort(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return String(Math.round(n));
}

function paymentLabel(m: string): string {
  const map: Record<string, string> = {
    CASH: "نقدي", CARD: "بطاقة", TRANSFER: "تحويل", WALLET: "محفظة", CREDIT: "آجل", MIXED: "مختلط",
  };
  return map[m] || m;
}

function accountTypeLabel(t: string): string {
  const map: Record<string, string> = {
    ASSET: "أصول", LIABILITY: "التزامات", EQUITY: "حقوق ملكية", REVENUE: "إيرادات", EXPENSE: "مصروفات", COST_OF_SALES: "تكلفة مبيعات",
  };
  return map[t] || t;
}

function journalSourceLabel(s: string): string {
  const map: Record<string, string> = {
    MANUAL: "يدوي", SALES_INVOICE: "فاتورة مبيعات", PURCHASE_ORDER: "أمر شراء", PAYMENT_RECEIVED: "تحصيل", PAYMENT_MADE: "صرف", PAYROLL: "رواتب", ADJUSTMENT: "تسوية", OPENING_BALANCE: "رصيد افتتاحي",
  };
  return map[s] || s;
}

function attendanceLabel(s: string): string {
  const map: Record<string, string> = {
    PRESENT: "حاضر", ABSENT: "غائب", LATE: "متأخر", HALF_DAY: "نصف يوم", WEEKEND: "عطلة", HOLIDAY: "إجازة",
  };
  return map[s] || s;
}

function leaveTypeLabel(t: string): string {
  const map: Record<string, string> = {
    ANNUAL: "سنوية", SICK: "مرضية", EMERGENCY: "طارئة", UNPAID: "بدون راتب", MATERNITY: "وضع", HAJJ: "حج",
  };
  return map[t] || t;
}

function leaveStatusLabel(s: string): string {
  const map: Record<string, string> = {
    PENDING: "قيد الانتظار", APPROVED: "موافق عليها", REJECTED: "مرفوضة", CANCELLED: "ملغاة",
  };
  return map[s] || s;
}

// missing icon imports fallback (kept local to avoid extra imports)
function Trophy(props: any) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  );
}
