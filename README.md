# KMH ERP Suite — نظام الإدارة المتكامل

نظام إدارة أعمال احترافي متكامل يحاكي أضخم الأنظمة العالمية (SAP / Oracle / Odoo / QuickBooks) مع أتمتة كاملة بين الوحدات.

> **تطوير:** خالد الحربي — خبير أمن سيبراني معتمد  
> **التقنية:** Next.js 16 + TypeScript + Prisma + Tailwind CSS 4 + shadcn/ui

---

## ✨ المميزات

### 8 وحدات متكاملة

| الوحدة | الوصف |
|--------|-------|
| 📊 **لوحة التحكم** | KPIs + مبيعات 14 يوم + الأكثر مبيعًا + طرق الدفع + Activity Timeline |
| 🛒 **نقطة البيع (POS)** | شبكة منتجات + سلة + 4 طرق دفع + فاتورة ضريبية سعودية + اختصارات لوحة مفاتيح |
| 👥 **العملاء** | إدارة كاملة + حد ائتمان + نقاط ولاء + مستحقات |
| 🧮 **المحاسبة** | ميزان مراجعة + قائمة الدخل + الميزانية العمومية + دفتر اليومية + دليل الحسابات |
| 👤 **الموارد البشرية** | موظفين + حضور/انصراف + رواتب (GOSI تلقائي) + إجازات + إنهاء عقد |
| 📦 **إدارة المخزون** | منتجات (مع صور) + موردين + حركات المخزون + أوامر شراء + تنبيهات |
| 📈 **التقارير** | تحليل الربح + أعلى المنتجات/العملاء + المبيعات حسب الفئة + تصدير CSV |
| 🛡️ **لوحة الإدارة** | إدارة المستخدمين + سجل التدقيق + سجل الجلسات + الإعدادات + الفروع |

### 🔐 الأمان والصلاحيات
- مصادقة كاملة (scrypt password hashing + HTTP-only session cookies)
- 6 أدوار مع صلاحيات مختلفة (RBAC): ADMIN, ACCOUNTANT, HR_MANAGER, CASHIER, INVENTORY_MANAGER, BRANCH_MANAGER
- سجل تدقيق (Audit Log) يسجّل كل عملية
- حماية جميع الـ APIs بـ `requireAuth()`

### ⚙️ الأتمتة الذكية (Cross-Module)
- **بيع في الكاشير** → قيد محاسبي تلقائي + قيد COGS + حركة مخزون صادر + تحديث أرصدة الحسابات + نقاط ولاء للعميل — في معاملة واحدة (transaction)
- **صرف الرواتب** → قيد محاسبي تلقائي (مدين: مصروف الرواتب، دائن: الصندوق + التأمينات)
- **سجل تدقيق** لكل عملية CREATE/UPDATE/DELETE/LOGIN/LOGOUT

### 📱 توافق كامل مع جميع الأجهزة
- Sidebar يتحول إلى drawer على الجوال
- Grid layouts متجاوبة (1 → 5 أعمدة)
- جداول scrollable أفقياً
- RTL كامل + خط Cairo العربي

---

## 🚀 التشغيل

### المتطلبات
- Node.js 18+ أو Bun
- npm / bun

### التثبيت
```bash
# استنساخ المشروع
git clone https://github.com/5halid-707/kmh-erp-suite.git
cd kmh-erp-suite

# تثبيت الحزم
bun install

# إعداد قاعدة البيانات
bun run db:push

# بذر البيانات التجريبية
bun run scripts/seed.ts

# تشغيل الخادم
bun run dev
```

### 🔐 حسابات الدخول الجاهزة

| الدور | البريد | كلمة المرور |
|------|--------|-------------|
| 👑 مدير النظام | `admin@kmh-erp.sa` | `admin123` |
| 🛒 كاشير | `cashier@kmh-erp.sa` | `cashier123` |
| 🧮 محاسب | `accountant@kmh-erp.sa` | `acc123` |
| 👥 مدير موارد بشرية | `hr@kmh-erp.sa` | `hr123` |
| 📦 أمين مخزن | `inventory@kmh-erp.sa` | `inv123` |

---

## 🛠️ التقنيات المستخدمة

| التقنية | الإصدار | الاستخدام |
|---------|---------|-----------|
| Next.js | 16 | Framework (App Router) |
| TypeScript | 5 | لغة البرمجة |
| Prisma | 6 | ORM + SQLite |
| Tailwind CSS | 4 | التنسيق |
| shadcn/ui | latest | مكونات UI |
| Framer Motion | latest | الانتقالات |
| Lucide Icons | latest | الأيقونات |
| Sonner | latest | الإشعارات |

---

## 📁 بنية المشروع

```
├── prisma/
│   └── schema.prisma          # 18 model (User, Product, Invoice, Account, Employee...)
├── src/
│   ├── app/
│   │   ├── api/               # 18+ API routes
│   │   │   ├── auth/          # login, logout, me
│   │   │   ├── admin/         # users CRUD, audit, settings, sessions
│   │   │   ├── cashier/       # products, checkout, invoices
│   │   │   ├── accounting/    # accounts, journal
│   │   │   ├── hr/            # employees, payroll, attendance, leaves
│   │   │   ├── erp/           # products, suppliers, purchase-orders
│   │   │   ├── reports/       # analytics + CSV export
│   │   │   └── stock-movements/
│   │   ├── layout.tsx         # RTL + Cairo font + dark theme
│   │   ├── page.tsx           # Full UI (8 modules)
│   │   └── globals.css        # Dark cyber theme (#05080f + cyan)
│   ├── lib/
│   │   ├── auth.ts            # scrypt + sessions + RBAC
│   │   ├── audit.ts           # Audit log helper
│   │   ├── db.ts              # Prisma client
│   │   └── erp-helpers.ts     # Shared utilities
│   └── components/ui/         # shadcn/ui components
├── scripts/
│   └── seed.ts                # Saudi-realistic seed data
└── prisma/schema.prisma       # Database schema
```

---

## 🎯 مقارنة مع الأنظمة العالمية

| الميزة | SAP | Odoo | QuickBooks | **KMH ERP** |
|--------|-----|------|------------|-------------|
| نقطة بيع POS | ✓ | ✓ | ✓ | ✓ |
| محاسبة كاملة | ✓ | ✓ | ✓ | ✓ |
| موارد بشرية | ✓ | ✓ | × | ✓ |
| مخزون + حركات | ✓ | ✓ | ✓ | ✓ |
| عملاء + ولاء | ✓ | ✓ | ✓ | ✓ |
| تقارير + CSV | ✓ | ✓ | ✓ | ✓ |
| صلاحيات RBAC | ✓ | ✓ | ✓ | ✓ |
| سجل تدقيق | ✓ | ✓ | × | ✓ |
| أتمتة cross-module | ✓ | ✓ | × | ✓ |
| Responsive + RTL | × | ✓ | × | ✓ |

---

## 📊 البيانات التجريبية

تتضمن البيانات التجريبية:
- **منشأة:** مؤسسة الحربي التجارية
- **فرعين:** الرياض + جدة
- **15 منتج** (إلكترونيات، أجهزة منزلية، هواتف، إكسسوارات...)
- **8 موظفين** سعوديين
- **6 عملاء** + **4 موردين**
- **25 حساب** محاسبي (دليل حسابات سعودي)
- **30 يوم** من المبيعات + القيود المحاسبية
- **سجل حضور** كامل

---

## 🔒 ملاحظات أمنية

- كلمات المرور مشفّرة بـ scrypt
- الجلسات مخزّنة في DB مع HTTP-only cookies
- جميع الـ APIs محمية بصلاحيات RBAC
- ملف `.env` و `db/*.db` مستبعدان من Git

---

## 📝 الترخيص

© 2026 خالد الحربي — KMH ERP Suite. جميع الحقوق محفوظة.
