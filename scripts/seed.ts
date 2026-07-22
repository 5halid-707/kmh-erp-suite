// scripts/seed.ts
// Saudi-realistic seed data for KMH ERP Suite v2 (with auth)
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/auth";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding KMH ERP Suite v2 (with auth)...");

  // 1. Organization
  const org = await prisma.organization.create({
    data: {
      name: "مؤسسة الحربي التجارية",
      legalName: "مؤسسة خالد محمد الحربي التجارية",
      taxNumber: "300123456700003",
      currency: "SAR",
      vatRate: 15.0,
      address: "حي العليا، طريق الملك فهد",
      city: "الرياض",
      phone: "+966112345678",
      email: "info@alharbi-trading.sa",
    },
  });

  // 2. Branches
  const riyadhBranch = await prisma.branch.create({
    data: {
      organizationId: org.id,
      name: "الفرع الرئيسي - الرياض",
      code: "RUH-01",
      address: "حي العليا، الرياض",
      city: "الرياض",
      phone: "+966112345678",
    },
  });
  const jeddahBranch = await prisma.branch.create({
    data: {
      organizationId: org.id,
      name: "فرع جدة",
      code: "JED-02",
      address: "حي الروضة، جدة",
      city: "جدة",
      phone: "+966122345678",
    },
  });

  // 3. Users with different roles (with hashed passwords)
  const admin = await prisma.user.create({
    data: {
      organizationId: org.id, branchId: riyadhBranch.id,
      email: "admin@kmh-erp.sa", name: "خالد الحربي",
      role: "ADMIN", passwordHash: hashPassword("admin123"),
      avatarColor: "cyan",
    },
  });
  const cashier = await prisma.user.create({
    data: {
      organizationId: org.id, branchId: riyadhBranch.id,
      email: "cashier@kmh-erp.sa", name: "أحمد العتيبي",
      role: "CASHIER", passwordHash: hashPassword("cashier123"),
      avatarColor: "emerald",
    },
  });
  const accountant = await prisma.user.create({
    data: {
      organizationId: org.id, branchId: riyadhBranch.id,
      email: "accountant@kmh-erp.sa", name: "سارة الدوسري",
      role: "ACCOUNTANT", passwordHash: hashPassword("acc123"),
      avatarColor: "amber",
    },
  });
  const hrMgr = await prisma.user.create({
    data: {
      organizationId: org.id, branchId: riyadhBranch.id,
      email: "hr@kmh-erp.sa", name: "نورة العنزي",
      role: "HR_MANAGER", passwordHash: hashPassword("hr123"),
      avatarColor: "purple",
    },
  });
  const invMgr = await prisma.user.create({
    data: {
      organizationId: org.id, branchId: riyadhBranch.id,
      email: "inventory@kmh-erp.sa", name: "فهد القحطاني",
      role: "INVENTORY_MANAGER", passwordHash: hashPassword("inv123"),
      avatarColor: "rose",
    },
  });

  // 4. Chart of Accounts
  const accountDefs = [
    { code: "1000", name: "الأصول", type: "ASSET", isGroup: true, parent: null },
    { code: "1100", name: "النقدية وما في حكمها", type: "ASSET", isGroup: true, parent: "1000" },
    { code: "1101", name: "الصندوق - فرع الرياض", type: "ASSET", isGroup: false, parent: "1100" },
    { code: "1102", name: "الصندوق - فرع جدة", type: "ASSET", isGroup: false, parent: "1100" },
    { code: "1103", name: "البنك الأهلي - حساب جاري", type: "ASSET", isGroup: false, parent: "1100" },
    { code: "1200", name: "الذمم المدينة (العملاء)", type: "ASSET", isGroup: false, parent: "1000" },
    { code: "1300", name: "المخزون", type: "ASSET", isGroup: false, parent: "1000" },
    { code: "2000", name: "الالتزامات", type: "LIABILITY", isGroup: true, parent: null },
    { code: "2100", name: "الذمم الدائنة (الموردون)", type: "LIABILITY", isGroup: false, parent: "2000" },
    { code: "2200", name: "ضريبة القيمة المضافة المستحقة", type: "LIABILITY", isGroup: false, parent: "2000" },
    { code: "2300", name: "الرواتب المستحقة", type: "LIABILITY", isGroup: false, parent: "2000" },
    { code: "3000", name: "حقوق الملكية", type: "EQUITY", isGroup: true, parent: null },
    { code: "3100", name: "رأس المال", type: "EQUITY", isGroup: false, parent: "3000" },
    { code: "3200", name: "الأرباح المحتجزة", type: "EQUITY", isGroup: false, parent: "3000" },
    { code: "4000", name: "الإيرادات", type: "REVENUE", isGroup: true, parent: null },
    { code: "4100", name: "إيرادات المبيعات", type: "REVENUE", isGroup: false, parent: "4000" },
    { code: "4200", name: "إيرادات الخصم المكتسب", type: "REVENUE", isGroup: false, parent: "4000" },
    { code: "5000", name: "تكلفة المبيعات", type: "COST_OF_SALES", isGroup: false, parent: null },
    { code: "6000", name: "المصروفات العمومية والإدارية", type: "EXPENSE", isGroup: true, parent: null },
    { code: "6100", name: "رواتب وأجور", type: "EXPENSE", isGroup: false, parent: "6000" },
    { code: "6200", name: "إيجارات", type: "EXPENSE", isGroup: false, parent: "6000" },
    { code: "6300", name: "كهرباء ومياه", type: "EXPENSE", isGroup: false, parent: "6000" },
    { code: "6400", name: "اتصالات وإنترنت", type: "EXPENSE", isGroup: false, parent: "6000" },
    { code: "6500", name: "صيانة وقطع غيار", type: "EXPENSE", isGroup: false, parent: "6000" },
    { code: "6600", name: "تأمينات اجتماعية (GOISI)", type: "EXPENSE", isGroup: false, parent: "6000" },
  ];

  const codeToId = new Map<string, string>();
  for (const a of accountDefs) {
    const id = (await prisma.account.create({
      data: {
        organizationId: org.id,
        code: a.code, name: a.name, type: a.type as any,
        parentId: a.parent ? null : null, // set below
        isGroup: a.isGroup,
        balance: a.code === "3100" ? 500000 : 0,
      },
    })).id;
    codeToId.set(a.code, id);
  }
  // Set parent IDs
  for (const a of accountDefs) {
    if (a.parent) {
      await prisma.account.update({
        where: { id: codeToId.get(a.code)! },
        data: { parentId: codeToId.get(a.parent)! },
      });
    }
  }

  // 5. Categories
  const catNames = ["إلكترونيات", "أجهزة منزلية", "هواتف ذكية", "إكسسوارات", "مستلزمات مكتبية", "كابلات وشواحن"];
  const categories: any[] = [];
  for (const name of catNames) {
    categories.push(await prisma.category.create({ data: { organizationId: org.id, name } }));
  }

  // 6. Products
  const productsData = [
    { sku: "PHN-IP15", barcode: "6291000010015", name: "آيفون 15 برو ماكس 256GB", cat: "هواتف ذكية", cost: 4200, sale: 5499 },
    { sku: "PHN-S24", barcode: "6291000010022", name: "سامسونج جالاكسي S24 الترا", cat: "هواتف ذكية", cost: 3600, sale: 4799 },
    { sku: "LPT-MAC", barcode: "6291000010039", name: "ماك بوك برو 14 إنش M3", cat: "إلكترونيات", cost: 6500, sale: 8499 },
    { sku: "LPT-HP", barcode: "6291000010046", name: "إتش بي بفيليون 15 i7", cat: "إلكترونيات", cost: 2800, sale: 3699 },
    { sku: "TV-LG55", barcode: "6291000010053", name: "إل جي تلفاز 55 إنش OLED", cat: "أجهزة منزلية", cost: 3500, sale: 4499 },
    { sku: "TV-SAM50", barcode: "6291000010060", name: "سامسونج تلفاز 50 إنش QLED", cat: "أجهزة منزلية", cost: 2400, sale: 3199 },
    { sku: "ACC-CHG", barcode: "6291000010077", name: "شاحن سريع 65W USB-C", cat: "كابلات وشواحن", cost: 45, sale: 89 },
    { sku: "ACC-CBL", barcode: "6291000010084", name: "كابل USB-C إلى Lightning أصلي", cat: "كابلات وشواحن", cost: 35, sale: 75 },
    { sku: "ACC-PWB", barcode: "6291000010091", name: "باور بانك 20000mAh", cat: "إكسسوارات", cost: 80, sale: 149 },
    { sku: "ACC-HDP", barcode: "6291000010107", name: "سماعات آبل AirPods Pro 2", cat: "إكسسوارات", cost: 750, sale: 1099 },
    { sku: "ACC-CSE", barcode: "6291000010114", name: "جراب جلد لآيفون 15 برو", cat: "إكسسوارات", cost: 25, sale: 69 },
    { sku: "OFC-PAP", barcode: "6291000010121", name: "كرتون ورق تصوير A4 (5 rim)", cat: "مستلزمات مكتبية", cost: 95, sale: 145 },
    { sku: "OFC-PEN", barcode: "6291000010138", name: "علبة أقلام بيك بلو (50 قطعة)", cat: "مستلزمات مكتبية", cost: 35, sale: 65 },
    { sku: "HOM-VAC", barcode: "6291000010145", name: "مكنسة كهربائية لاسلكية", cat: "أجهزة منزلية", cost: 480, sale: 699 },
    { sku: "HOM-MIC", barcode: "6291000010152", name: "ميكروويف 30 لتر رقمي", cat: "أجهزة منزلية", cost: 380, sale: 549 },
  ];

  for (const p of productsData) {
    const cat = categories.find(c => c.name === p.cat)!;
    await prisma.product.create({
      data: {
        organizationId: org.id, branchId: riyadhBranch.id, categoryId: cat.id,
        sku: p.sku, barcode: p.barcode, name: p.name, unit: "قطعة",
        costPrice: p.cost, salePrice: p.sale, vatRate: 15.0, reorderLevel: 10,
      },
    });
  }

  // 7. Suppliers
  const suppliersData = [
    { name: "شركة التقنية المتقدمة للتجارة", contact: "محمد القحطاني", city: "الرياض", terms: "آجل 30 يوم" },
    { name: "مؤسسة الإلكترونيات الحديثة", contact: "عبدالله الشهري", city: "جدة", terms: "آجل 45 يوم" },
    { name: "شركة الأجهزة المنزلية العالمية", contact: "فهد المطيري", city: "الدمام", terms: "آجل 60 يوم" },
    { name: "مكتبة العاصمة للمستلزمات المكتبية", contact: "سعود العنزي", city: "الرياض", terms: "نقدي" },
  ];
  for (const s of suppliersData) {
    await prisma.supplier.create({
      data: {
        organizationId: org.id, name: s.name, contactPerson: s.contact,
        phone: "+9665" + Math.floor(10000000 + Math.random() * 89999999),
        email: s.name.split(" ")[0] + "@supplier.sa",
        city: s.city, paymentTerms: s.terms, balanceDue: 0,
      },
    });
  }

  // 8. Customers
  const customersData = [
    { name: "محمد العمري", phone: "+966501234567", city: "الرياض", creditLimit: 10000 },
    { name: "عبدالعزيز السبيعي", phone: "+966502345678", city: "الرياض", creditLimit: 25000 },
    { name: "فيصل الحربي", phone: "+966553456789", city: "جدة", creditLimit: 15000 },
    { name: "بندر الدوسري", phone: "+966564567890", city: "الدمام", creditLimit: 8000 },
    { name: "ماجد القحطاني", phone: "+966575678901", city: "مكة", creditLimit: 20000 },
    { name: "طلال العنزي", phone: "+966586789012", city: "الرياض", creditLimit: 5000 },
  ];
  for (const c of customersData) {
    await prisma.customer.create({
      data: {
        organizationId: org.id, name: c.name, phone: c.phone,
        city: c.city, creditLimit: c.creditLimit,
        loyaltyPoints: Math.floor(Math.random() * 500),
      },
    });
  }

  // 9. Employees
  const employeesData = [
    { code: "EMP-001", name: "أحمد العتيبي", pos: "كاشير", dept: "المبيعات", salary: 4500 },
    { code: "EMP-002", name: "خالد الشمري", pos: "كاشير", dept: "المبيعات", salary: 4500 },
    { code: "EMP-003", name: "سارة الدوسري", pos: "محاسبة", dept: "المالية", salary: 7500 },
    { code: "EMP-004", name: "نورة العنزي", pos: "مدير موارد بشرية", dept: "الموارد البشرية", salary: 9000 },
    { code: "EMP-005", name: "فهد القحطاني", pos: "أمين مخزن", dept: "المخزون", salary: 5500 },
    { code: "EMP-006", name: "عبدالله الحربي", pos: "مندوب مبيعات", dept: "المبيعات", salary: 5000 },
    { code: "EMP-007", name: "ماجد المطيري", pos: "فني صيانة", dept: "الصيانة", salary: 6000 },
    { code: "EMP-008", name: "سعود العتيبي", pos: "مدير فرع جدة", dept: "الإدارة", salary: 12000 },
  ];
  for (const e of employeesData) {
    await prisma.employee.create({
      data: {
        organizationId: org.id,
        branchId: e.code === "EMP-008" ? jeddahBranch.id : riyadhBranch.id,
        employeeCode: e.code, fullName: e.name,
        nationalId: "10" + Math.floor(10000000 + Math.random() * 89999999).toString(),
        phone: "+9665" + Math.floor(10000000 + Math.random() * 89999999).toString(),
        email: e.name.split(" ")[0] + "@alharbi-trading.sa",
        position: e.pos, department: e.dept,
        hireDate: new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        baseSalary: e.salary, allowances: Math.round(e.salary * 0.15),
        status: "ACTIVE",
      },
    });
  }

  // 10. Attendance for 30 days
  const employees = await prisma.employee.findMany();
  const today = new Date();
  for (let d = 0; d < 30; d++) {
    const date = new Date(today);
    date.setDate(today.getDate() - d);
    const weekend = date.getDay() === 5 || date.getDay() === 6;
    if (weekend) continue;
    for (const emp of employees) {
      const checkIn = new Date(date);
      checkIn.setHours(8, Math.floor(Math.random() * 30), 0, 0);
      const checkOut = new Date(date);
      checkOut.setHours(17, Math.floor(Math.random() * 30), 0, 0);
      const isLate = checkIn.getHours() > 8 || (checkIn.getHours() === 8 && checkIn.getMinutes() > 15);
      await prisma.attendance.create({
        data: {
          employeeId: emp.id, date, checkIn, checkOut,
          status: Math.random() > 0.95 ? "ABSENT" : isLate ? "LATE" : "PRESENT",
          workHours: 9,
          overtimeHours: Math.random() > 0.8 ? Math.floor(Math.random() * 3) : 0,
        },
      });
    }
  }

  // 11. Sample sales invoices for 30 days (with auto journal entries)
  const products = await prisma.product.findMany();
  const customers = await prisma.customer.findMany();
  const cashAccount = await prisma.account.findFirst({ where: { code: "1101" } });
  const salesAccount = await prisma.account.findFirst({ where: { code: "4100" } });
  const vatAccount = await prisma.account.findFirst({ where: { code: "2200" } });
  const cogsAccount = await prisma.account.findFirst({ where: { code: "5000" } });
  const invAccount = await prisma.account.findFirst({ where: { code: "1300" } });

  let invoiceCounter = 1001;
  for (let d = 29; d >= 0; d--) {
    const date = new Date(today);
    date.setDate(today.getDate() - d);
    const invoicesToday = Math.floor(2 + Math.random() * 6);
    for (let i = 0; i < invoicesToday; i++) {
      const numItems = Math.floor(1 + Math.random() * 4);
      const items = [];
      let subtotal = 0;
      for (let n = 0; n < numItems; n++) {
        const prod = products[Math.floor(Math.random() * products.length)];
        const qty = Math.floor(1 + Math.random() * 3);
        const lineTotal = prod.salePrice * qty;
        items.push({ product: prod, qty, lineTotal });
        subtotal += lineTotal;
      }
      const vat = subtotal * 0.15;
      const grand = subtotal + vat;
      const invNum = `INV-${date.getFullYear()}-${String(invoiceCounter++).padStart(5, "0")}`;
      const customer = Math.random() > 0.4 ? customers[Math.floor(Math.random() * customers.length)] : null;
      const payMethod = ["CASH", "CARD", "TRANSFER", "WALLET"][Math.floor(Math.random() * 4)] as any;

      const invoice = await prisma.salesInvoice.create({
        data: {
          organizationId: org.id, branchId: riyadhBranch.id,
          invoiceNumber: invNum, customerId: customer?.id,
          salesRepId: cashier.id, status: "COMPLETED", paymentMethod: payMethod,
          subtotal, discountAmount: 0, vatAmount: vat, grandTotal: grand,
          paidAmount: grand, changeAmount: 0, invoiceDate: date,
          items: {
            create: items.map(it => ({
              productId: it.product.id, quantity: it.qty,
              unitPrice: it.product.salePrice, discountPct: 0, vatRate: 15.0, lineTotal: it.lineTotal,
            })),
          },
        },
      });

      // Sales journal entry
      const entryNum = `JE-${date.getFullYear()}-${String(invoiceCounter).padStart(5, "0")}`;
      await prisma.journalEntry.create({
        data: {
          organizationId: org.id, entryNumber: entryNum, reference: invNum,
          description: `قيد مبيعات فاتورة ${invNum}`,
          totalDebit: grand, totalCredit: grand,
          entryDate: date, postedAt: date, source: "SALES_INVOICE", createdById: accountant.id,
          lines: {
            create: [
              { accountId: cashAccount!.id, debit: grand, credit: 0, description: "إثبات تحصيل المبيعات" },
              { accountId: salesAccount!.id, debit: 0, credit: subtotal, description: "إيراد المبيعات" },
              { accountId: vatAccount!.id, debit: 0, credit: vat, description: "ضريبة القيمة المضافة المستحقة" },
            ],
          },
        },
      });

      // COGS entry
      const totalCost = items.reduce((sum, it) => sum + it.product.costPrice * it.qty, 0);
      if (totalCost > 0) {
        await prisma.journalEntry.create({
          data: {
            organizationId: org.id,
            entryNumber: `JE-${date.getFullYear()}-${String(invoiceCounter).padStart(5, "0")}-COGS`,
            reference: invNum, description: `قيد تكلفة بضاعة مباعة - فاتورة ${invNum}`,
            totalDebit: totalCost, totalCredit: totalCost,
            entryDate: date, postedAt: date, source: "SALES_INVOICE", createdById: accountant.id,
            lines: {
              create: [
                { accountId: cogsAccount!.id, debit: totalCost, credit: 0, description: "تكلفة البضاعة المباعة" },
                { accountId: invAccount!.id, debit: 0, credit: totalCost, description: "إخراج بضاعة من المخزون" },
              ],
            },
          },
        });
      }
    }
  }

  // 12. Sample leave requests
  for (let i = 0; i < 5; i++) {
    const emp = employees[Math.floor(Math.random() * employees.length)];
    const start = new Date(today);
    start.setDate(today.getDate() + Math.floor(Math.random() * 30) + 1);
    const end = new Date(start);
    end.setDate(start.getDate() + Math.floor(Math.random() * 5) + 1);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    await prisma.leaveRequest.create({
      data: {
        employeeId: emp.id,
        type: ["ANNUAL", "SICK", "EMERGENCY", "HAJJ"][Math.floor(Math.random() * 4)] as any,
        startDate: start, endDate: end, daysCount: days, reason: "ظرف شخصي",
        status: ["PENDING", "APPROVED", "APPROVED", "REJECTED"][Math.floor(Math.random() * 4)] as any,
        approvedBy: hrMgr.id,
      },
    });
  }

  console.log("\n✅ Seed complete!\n");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🔐 LOGIN CREDENTIALS:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("👑 Admin:        admin@kmh-erp.sa / admin123");
  console.log("🛒 Cashier:      cashier@kmh-erp.sa / cashier123");
  console.log("🧮 Accountant:   accountant@kmh-erp.sa / acc123");
  console.log("👥 HR Manager:   hr@kmh-erp.sa / hr123");
  console.log("📦 Inventory:    inventory@kmh-erp.sa / inv123");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
