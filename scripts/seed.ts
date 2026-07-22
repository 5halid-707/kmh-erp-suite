// scripts/seed.ts
// Saudi-realistic seed data for KMH ERP Suite - v2 with passwords + audit log
import { PrismaClient } from "@prisma/client";
import { randomUUID, scryptSync, randomBytes } from "crypto";

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

async function main() {
  console.log("🌱 Seeding KMH ERP Suite v2 (with auth + audit)...");

  // Wipe DB first
  await prisma.$transaction([
    prisma.auditLog.deleteMany(),
    prisma.quotationItem.deleteMany(),
    prisma.quotation.deleteMany(),
    prisma.payrollItem.deleteMany(),
    prisma.payrollBatch.deleteMany(),
    prisma.attendance.deleteMany(),
    prisma.leaveRequest.deleteMany(),
    prisma.employee.deleteMany(),
    prisma.jobPosition.deleteMany(),
    prisma.department.deleteMany(),
    prisma.journalLine.deleteMany(),
    prisma.journalEntry.deleteMany(),
    prisma.invoiceItem.deleteMany(),
    prisma.salesInvoice.deleteMany(),
    prisma.purchaseOrderItem.deleteMany(),
    prisma.purchaseOrder.deleteMany(),
    prisma.stockMovement.deleteMany(),
    prisma.product.deleteMany(),
    prisma.category.deleteMany(),
    prisma.supplier.deleteMany(),
    prisma.customer.deleteMany(),
    prisma.account.deleteMany(),
    prisma.user.deleteMany(),
    prisma.branch.deleteMany(),
    prisma.organization.deleteMany(),
  ]);

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
      name: "فرع الرياض - الرئيسي",
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

  // 3. Departments
  const departments = await Promise.all(
    ["الإدارة", "المبيعات", "المالية", "الموارد البشرية", "المخزون", "الصيانة", "التسويق"].map(
      (name) => prisma.department.create({ data: { organizationId: org.id, name } })
    )
  );

  // 4. Job Positions
  const jobPositions = await Promise.all([
    prisma.jobPosition.create({ data: { organizationId: org.id, title: "مدير عام", baseSalary: 18000, departmentId: departments[0].id } }),
    prisma.jobPosition.create({ data: { organizationId: org.id, title: "كاشير", baseSalary: 4500, departmentId: departments[1].id } }),
    prisma.jobPosition.create({ data: { organizationId: org.id, title: "محاسب", baseSalary: 7500, departmentId: departments[2].id } }),
    prisma.jobPosition.create({ data: { organizationId: org.id, title: "مدير موارد بشرية", baseSalary: 9000, departmentId: departments[3].id } }),
    prisma.jobPosition.create({ data: { organizationId: org.id, title: "أمين مخزن", baseSalary: 5500, departmentId: departments[4].id } }),
    prisma.jobPosition.create({ data: { organizationId: org.id, title: "مندوب مبيعات", baseSalary: 5000, departmentId: departments[1].id } }),
    prisma.jobPosition.create({ data: { organizationId: org.id, title: "فني صيانة", baseSalary: 6000, departmentId: departments[5].id } }),
    prisma.jobPosition.create({ data: { organizationId: org.id, title: "مدير فرع", baseSalary: 12000, departmentId: departments[0].id } }),
  ]);

  // 5. Users - all with passwords (default: 123456)
  const usersData = [
    { email: "admin@alharbi-trading.sa", name: "خالد الحربي", role: "ADMIN" as const, branch: riyadhBranch.id, empIdx: 0 },
    { email: "cashier@alharbi-trading.sa", name: "أحمد العتيبي", role: "CASHIER" as const, branch: riyadhBranch.id, empIdx: 1 },
    { email: "accountant@alharbi-trading.sa", name: "سارة الدوسري", role: "ACCOUNTANT" as const, branch: riyadhBranch.id, empIdx: 2 },
    { email: "hr@alharbi-trading.sa", name: "نورة العنزي", role: "HR_MANAGER" as const, branch: riyadhBranch.id, empIdx: 3 },
    { email: "inventory@alharbi-trading.sa", name: "فهد القحطاني", role: "INVENTORY_MANAGER" as const, branch: riyadhBranch.id, empIdx: 4 },
    { email: "sales@alharbi-trading.sa", name: "عبدالله الحربي", role: "CASHIER" as const, branch: riyadhBranch.id, empIdx: 5 },
    { email: "tech@alharbi-trading.sa", name: "ماجد المطيري", role: "CASHIER" as const, branch: riyadhBranch.id, empIdx: 6 },
    { email: "jeddah@alharbi-trading.sa", name: "سعود العتيبي", role: "BRANCH_MANAGER" as const, branch: jeddahBranch.id, empIdx: 7 },
  ];

  const users = [];
  for (const u of usersData) {
    users.push(await prisma.user.create({
      data: {
        organizationId: org.id,
        branchId: u.branch,
        email: u.email,
        name: u.name,
        role: u.role,
        passwordHash: hashPassword("123456"),
      },
    }));
  }

  // 6. Chart of Accounts (Saudi-standard structure)
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
    { code: "6600", name: "تأمينات اجتماعية (GOSI)", type: "EXPENSE", isGroup: false, parent: "6000" },
  ];
  const codeToId = new Map<string, string>();
  for (const a of accountDefs) {
    const id = randomUUID();
    codeToId.set(a.code, id);
  }
  for (const a of accountDefs) {
    await prisma.account.create({
      data: {
        id: codeToId.get(a.code)!,
        organizationId: org.id,
        code: a.code,
        name: a.name,
        type: a.type as any,
        parentId: a.parent ? codeToId.get(a.parent)! : null,
        isGroup: a.isGroup,
        balance: a.code === "3100" ? 500000 : 0,
      },
    });
  }

  // 7. Categories
  const catNames = ["إلكترونيات", "أجهزة منزلية", "هواتف ذكية", "إكسسوارات", "مستلزمات مكتبية", "كابلات وشواحن"];
  const categories: any[] = [];
  for (const name of catNames) {
    categories.push(await prisma.category.create({ data: { organizationId: org.id, name } }));
  }

  // 8. Products (Saudi market) - with opening stock
  const productsData = [
    { sku: "PHN-IP15", barcode: "6291000010015", name: "آيفون 15 برو ماكس 256GB", cat: "هواتف ذكية", cost: 4200, sale: 5499, opening: 25 },
    { sku: "PHN-S24", barcode: "6291000010022", name: "سامسونج جالاكسي S24 الترا", cat: "هواتف ذكية", cost: 3600, sale: 4799, opening: 18 },
    { sku: "LPT-MAC", barcode: "6291000010039", name: "ماك بوك برو 14 إنش M3", cat: "إلكترونيات", cost: 6500, sale: 8499, opening: 12 },
    { sku: "LPT-HP", barcode: "6291000010046", name: "إتش بي بفيليون 15 i7", cat: "إلكترونيات", cost: 2800, sale: 3699, opening: 15 },
    { sku: "TV-LG55", barcode: "6291000010053", name: "إل جي تلفاز 55 إنش OLED", cat: "أجهزة منزلية", cost: 3500, sale: 4499, opening: 8 },
    { sku: "TV-SAM50", barcode: "6291000010060", name: "سامسونج تلفاز 50 إنش QLED", cat: "أجهزة منزلية", cost: 2400, sale: 3199, opening: 10 },
    { sku: "ACC-CHG", barcode: "6291000010077", name: "شاحن سريع 65W USB-C", cat: "كابلات وشواحن", cost: 45, sale: 89, opening: 50 },
    { sku: "ACC-CBL", barcode: "6291000010084", name: "كابل USB-C إلى Lightning أصلي", cat: "كابلات وشواحن", cost: 35, sale: 75, opening: 80 },
    { sku: "ACC-PWB", barcode: "6291000010091", name: "باور بانك 20000mAh", cat: "إكسسوارات", cost: 80, sale: 149, opening: 30 },
    { sku: "ACC-HDP", barcode: "6291000010107", name: "سماعات آبل AirPods Pro 2", cat: "إكسسوارات", cost: 750, sale: 1099, opening: 20 },
    { sku: "ACC-CSE", barcode: "6291000010114", name: "جراب جلد لآيفون 15 برو", cat: "إكسسوارات", cost: 25, sale: 69, opening: 100 },
    { sku: "OFC-PAP", barcode: "6291000010121", name: "كرتون ورق تصوير A4 (5 rim)", cat: "مستلزمات مكتبية", cost: 95, sale: 145, opening: 40 },
    { sku: "OFC-PEN", barcode: "6291000010138", name: "علبة أقلام بيك بلو (50 قطعة)", cat: "مستلزمات مكتبية", cost: 35, sale: 65, opening: 60 },
    { sku: "HOM-VAC", barcode: "6291000010145", name: "مكنسة كهربائية لاسلكية", cat: "أجهزة منزلية", cost: 480, sale: 699, opening: 6 },
    { sku: "HOM-MIC", barcode: "6291000010152", name: "ميكروويف 30 لتر رقمي", cat: "أجهزة منزلية", cost: 380, sale: 549, opening: 8 },
  ];

  const createdProducts: any[] = [];
  for (const p of productsData) {
    const cat = categories.find(c => c.name === p.cat)!;
    const prod = await prisma.product.create({
      data: {
        organizationId: org.id,
        branchId: riyadhBranch.id,
        categoryId: cat.id,
        sku: p.sku,
        barcode: p.barcode,
        name: p.name,
        unit: "قطعة",
        costPrice: p.cost,
        salePrice: p.sale,
        vatRate: 15.0,
        reorderLevel: 10,
      },
    });
    createdProducts.push(prod);
    // Create opening stock movement
    await prisma.stockMovement.create({
      data: {
        organizationId: org.id,
        branchId: riyadhBranch.id,
        productId: prod.id,
        type: "PURCHASE_IN",
        quantity: p.opening,
        reference: "OPENING-BALANCE",
        balanceAfter: p.opening,
        notes: "رصيد افتتاحي",
      },
    });
  }

  // 9. Suppliers
  const suppliersData = [
    { name: "شركة التقنية المتقدمة للتجارة", contact: "محمد القحطاني", city: "الرياض", terms: "آجل 30 يوم" },
    { name: "مؤسسة الإلكترونيات الحديثة", contact: "عبدالله الشهري", city: "جدة", terms: "آجل 45 يوم" },
    { name: "شركة الأجهزة المنزلية العالمية", contact: "فهد المطيري", city: "الدمام", terms: "آجل 60 يوم" },
    { name: "مكتبة العاصمة للمستلزمات المكتبية", contact: "سعود العنزي", city: "الرياض", terms: "نقدي" },
  ];
  for (const s of suppliersData) {
    await prisma.supplier.create({
      data: {
        organizationId: org.id,
        name: s.name,
        contactPerson: s.contact,
        phone: "+9665" + Math.floor(10000000 + Math.random() * 89999999),
        email: s.name.split(" ")[0] + "@supplier.sa",
        city: s.city,
        paymentTerms: s.terms,
        balanceDue: 0,
      },
    });
  }

  // 10. Customers
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
        organizationId: org.id,
        name: c.name,
        phone: c.phone,
        city: c.city,
        creditLimit: c.creditLimit,
        loyaltyPoints: Math.floor(Math.random() * 500),
      },
    });
  }

  // 11. Employees (linked to users)
  const employeesData = [
    { code: "EMP-001", name: "أحمد العتيبي", pos: "كاشير", dept: "المبيعات", salary: 4500, userId: users[1].id, deptIdx: 1, jobIdx: 1 },
    { code: "EMP-002", name: "خالد الشمري", pos: "كاشير", dept: "المبيعات", salary: 4500, deptIdx: 1, jobIdx: 1 },
    { code: "EMP-003", name: "سارة الدوسري", pos: "محاسب", dept: "المالية", salary: 7500, userId: users[2].id, deptIdx: 2, jobIdx: 2 },
    { code: "EMP-004", name: "نورة العنزي", pos: "مدير موارد بشرية", dept: "الموارد البشرية", salary: 9000, userId: users[3].id, deptIdx: 3, jobIdx: 3 },
    { code: "EMP-005", name: "فهد القحطاني", pos: "أمين مخزن", dept: "المخزون", salary: 5500, userId: users[4].id, deptIdx: 4, jobIdx: 4 },
    { code: "EMP-006", name: "عبدالله الحربي", pos: "مندوب مبيعات", dept: "المبيعات", salary: 5000, userId: users[5].id, deptIdx: 1, jobIdx: 5 },
    { code: "EMP-007", name: "ماجد المطيري", pos: "فني صيانة", dept: "الصيانة", salary: 6000, userId: users[6].id, deptIdx: 5, jobIdx: 6 },
    { code: "EMP-008", name: "سعود العتيبي", pos: "مدير فرع جدة", dept: "الإدارة", salary: 12000, userId: users[7].id, deptIdx: 0, jobIdx: 7 },
  ];
  for (let i = 0; i < employeesData.length; i++) {
    const e = employeesData[i];
    await prisma.employee.create({
      data: {
        organizationId: org.id,
        branchId: e.code === "EMP-008" ? jeddahBranch.id : riyadhBranch.id,
        departmentId: departments[e.deptIdx].id,
        jobPositionId: jobPositions[e.jobIdx].id,
        userId: e.userId || null,
        employeeCode: e.code,
        fullName: e.name,
        nationalId: "10" + Math.floor(10000000 + Math.random() * 89999999).toString(),
        phone: "+9665" + Math.floor(10000000 + Math.random() * 89999999).toString(),
        email: e.name.split(" ")[0] + "@alharbi-trading.sa",
        position: e.pos,
        department: e.dept,
        hireDate: new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        baseSalary: e.salary,
        allowances: Math.round(e.salary * 0.15),
        status: "ACTIVE",
      },
    });
  }

  // 12. Admin user record (without employee link)
  await prisma.employee.create({
    data: {
      organizationId: org.id,
      branchId: riyadhBranch.id,
      departmentId: departments[0].id,
      jobPositionId: jobPositions[0].id,
      userId: users[0].id,
      employeeCode: "EMP-000",
      fullName: "خالد الحربي",
      phone: "+966575015019",
      email: "admin@alharbi-trading.sa",
      position: "مدير عام",
      department: "الإدارة",
      hireDate: new Date(2018, 0, 1),
      baseSalary: 18000,
      allowances: 3000,
      status: "ACTIVE",
    },
  });

  // 13. Generate 30 days of attendance
  const employees = await prisma.employee.findMany();
  const today = new Date();
  for (let d = 0; d < 30; d++) {
    const date = new Date(today);
    date.setDate(today.getDate() - d);
    for (const emp of employees) {
      const weekend = date.getDay() === 5 || date.getDay() === 6;
      if (weekend) continue;
      const checkIn = new Date(date);
      checkIn.setHours(8, Math.floor(Math.random() * 30), 0, 0);
      const checkOut = new Date(date);
      checkOut.setHours(17, Math.floor(Math.random() * 30), 0, 0);
      const isLate = checkIn.getHours() > 8 || (checkIn.getHours() === 8 && checkIn.getMinutes() > 15);
      await prisma.attendance.create({
        data: {
          employeeId: emp.id,
          date,
          checkIn,
          checkOut,
          status: Math.random() > 0.95 ? "ABSENT" : isLate ? "LATE" : "PRESENT",
          workHours: 9,
          overtimeHours: Math.random() > 0.8 ? Math.floor(Math.random() * 3) : 0,
        },
      });
    }
  }

  // 14. Sample sales invoices (last 30 days)
  const products = await prisma.product.findMany();
  const customers = await prisma.customer.findMany();
  const cashAccount = await prisma.account.findFirst({ where: { code: "1101" } });
  const salesAccount = await prisma.account.findFirst({ where: { code: "4100" } });
  const vatAccount = await prisma.account.findFirst({ where: { code: "2200" } });
  const cogsAccount = await prisma.account.findFirst({ where: { code: "5000" } });
  const invAccount = await prisma.account.findFirst({ where: { code: "1300" } });

  let invoiceCounter = 1001;
  let jeCounter = 1;
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
      const cashier = users[1];

      const invoice = await prisma.salesInvoice.create({
        data: {
          organizationId: org.id,
          branchId: riyadhBranch.id,
          invoiceNumber: invNum,
          customerId: customer?.id,
          salesRepId: cashier.id,
          status: "COMPLETED",
          paymentMethod: payMethod,
          subtotal,
          discountAmount: 0,
          vatAmount: vat,
          grandTotal: grand,
          paidAmount: grand,
          changeAmount: 0,
          invoiceDate: date,
          items: {
            create: items.map(it => ({
              productId: it.product.id,
              quantity: it.qty,
              unitPrice: it.product.salePrice,
              discountPct: 0,
              vatRate: 15.0,
              lineTotal: it.lineTotal,
            })),
          },
        },
        include: { items: { include: { product: true } } },
      });

      await prisma.journalEntry.create({
        data: {
          organizationId: org.id,
          entryNumber: `JE-${date.getFullYear()}-${String(jeCounter++).padStart(5, "0")}`,
          reference: invNum,
          description: `قيد مبيعات فاتورة ${invNum}`,
          totalDebit: grand,
          totalCredit: grand,
          entryDate: date,
          postedAt: date,
          source: "SALES_INVOICE",
          createdById: users[0].id,
          lines: {
            create: [
              { accountId: cashAccount!.id, debit: grand, credit: 0, description: "إثبات تحصيل المبيعات" },
              { accountId: salesAccount!.id, debit: 0, credit: subtotal, description: "إيراد المبيعات" },
              { accountId: vatAccount!.id, debit: 0, credit: vat, description: "ضريبة القيمة المضافة المستحقة" },
            ],
          },
        },
      });

      const totalCost = items.reduce((sum, it) => sum + it.product.costPrice * it.qty, 0);
      if (totalCost > 0) {
        await prisma.journalEntry.create({
          data: {
            organizationId: org.id,
            entryNumber: `JE-${date.getFullYear()}-${String(jeCounter++).padStart(5, "0")}-COGS`,
            reference: invNum,
            description: `قيد تكلفة بضاعة مباعة - فاتورة ${invNum}`,
            totalDebit: totalCost,
            totalCredit: totalCost,
            entryDate: date,
            postedAt: date,
            source: "SALES_INVOICE",
            createdById: users[0].id,
            lines: {
              create: [
                { accountId: cogsAccount!.id, debit: totalCost, credit: 0, description: "تكلفة البضاعة المباعة" },
                { accountId: invAccount!.id, debit: 0, credit: totalCost, description: "إخراج بضاعة من المخزون" },
              ],
            },
          },
        });
      }

      for (const it of items) {
        await prisma.stockMovement.create({
          data: {
            organizationId: org.id,
            branchId: riyadhBranch.id,
            productId: it.product.id,
            type: "SALE_OUT",
            quantity: it.qty,
            reference: invNum,
            balanceAfter: 0,
            notes: `صادر من بيع فاتورة ${invNum}`,
          },
        });
      }
    }
  }

  // 15. Sample leave requests
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
        startDate: start,
        endDate: end,
        daysCount: days,
        reason: "ظرف شخصي",
        status: ["PENDING", "APPROVED", "APPROVED", "REJECTED"][Math.floor(Math.random() * 4)] as any,
        approvedBy: users[3].id,
      },
    });
  }

  console.log("✅ Seed v2 complete!");
  console.log("   👤 Login credentials (all passwords: 123456):");
  usersData.forEach(u => console.log(`      - ${u.email} (${u.role})`));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
