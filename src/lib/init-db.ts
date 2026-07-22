// Auto-initialize database on Vercel serverless
// Runs `prisma db push` + seed when DB is empty
import { db } from './db'
import { hashPassword } from './auth'

let initPromise: Promise<void> | null = null

async function ensureDbSchema() {
  // Use Prisma's internal $executeRaw to create tables if they don't exist
  // We do this by trying a simple query and catching the error
  try {
    await db.organization.count()
  } catch (e: any) {
    // Tables don't exist — we need to create them
    // On Vercel, we can't run `prisma db push` directly, so we use SQL migrations
    console.log('[init-db] Tables missing, creating schema via SQL...')
    await createSchemaViaSQL()
  }
}

async function createSchemaViaSQL() {
  const statements = [
    `CREATE TABLE IF NOT EXISTS "Organization" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "name" TEXT NOT NULL,
      "legalName" TEXT,
      "taxNumber" TEXT,
      "currency" TEXT NOT NULL DEFAULT 'SAR',
      "vatRate" REAL NOT NULL DEFAULT 15.0,
      "address" TEXT,
      "city" TEXT,
      "phone" TEXT,
      "email" TEXT,
      "logoUrl" TEXT,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS "Branch" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "organizationId" TEXT NOT NULL,
      "name" TEXT NOT NULL,
      "code" TEXT NOT NULL,
      "address" TEXT,
      "city" TEXT,
      "phone" TEXT,
      "isActive" BOOLEAN NOT NULL DEFAULT true,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "Branch_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS "User" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "organizationId" TEXT NOT NULL,
      "email" TEXT NOT NULL UNIQUE,
      "name" TEXT NOT NULL,
      "passwordHash" TEXT NOT NULL,
      "role" TEXT NOT NULL DEFAULT 'CASHIER',
      "branchId" TEXT,
      "isActive" BOOLEAN NOT NULL DEFAULT true,
      "avatarColor" TEXT NOT NULL DEFAULT 'cyan',
      "lastLogin" DATETIME,
      "lastLogout" DATETIME,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL,
      CONSTRAINT "User_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE,
      CONSTRAINT "User_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id")
    )`,
    `CREATE TABLE IF NOT EXISTS "Session" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "userId" TEXT NOT NULL,
      "token" TEXT NOT NULL UNIQUE,
      "expiresAt" DATETIME NOT NULL,
      "ipAddress" TEXT,
      "userAgent" TEXT,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS "AuditLog" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "organizationId" TEXT NOT NULL,
      "userId" TEXT,
      "action" TEXT NOT NULL,
      "entity" TEXT NOT NULL,
      "entityId" TEXT,
      "description" TEXT NOT NULL,
      "metadata" TEXT,
      "ipAddress" TEXT,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "AuditLog_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE,
      CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL
    )`,
    `CREATE TABLE IF NOT EXISTS "Category" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "organizationId" TEXT NOT NULL,
      "name" TEXT NOT NULL,
      "parentId" TEXT,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "Category_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE,
      CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Category"("id")
    )`,
    `CREATE TABLE IF NOT EXISTS "Product" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "organizationId" TEXT NOT NULL,
      "branchId" TEXT,
      "categoryId" TEXT,
      "sku" TEXT NOT NULL,
      "barcode" TEXT,
      "name" TEXT NOT NULL,
      "nameEn" TEXT,
      "description" TEXT,
      "unit" TEXT NOT NULL DEFAULT 'قطعة',
      "costPrice" REAL NOT NULL DEFAULT 0,
      "salePrice" REAL NOT NULL DEFAULT 0,
      "vatRate" REAL NOT NULL DEFAULT 15.0,
      "reorderLevel" INTEGER NOT NULL DEFAULT 10,
      "imageUrl" TEXT,
      "isActive" BOOLEAN NOT NULL DEFAULT true,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL,
      CONSTRAINT "Product_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE,
      CONSTRAINT "Product_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id"),
      CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id")
    )`,
    `CREATE TABLE IF NOT EXISTS "Supplier" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "organizationId" TEXT NOT NULL,
      "name" TEXT NOT NULL,
      "contactPerson" TEXT,
      "phone" TEXT,
      "email" TEXT,
      "taxNumber" TEXT,
      "address" TEXT,
      "city" TEXT,
      "paymentTerms" TEXT,
      "balanceDue" REAL NOT NULL DEFAULT 0,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "Supplier_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS "Customer" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "organizationId" TEXT NOT NULL,
      "name" TEXT NOT NULL,
      "phone" TEXT,
      "email" TEXT,
      "taxNumber" TEXT,
      "address" TEXT,
      "city" TEXT,
      "creditLimit" REAL NOT NULL DEFAULT 0,
      "balanceDue" REAL NOT NULL DEFAULT 0,
      "loyaltyPoints" INTEGER NOT NULL DEFAULT 0,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "Customer_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS "Employee" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "organizationId" TEXT NOT NULL,
      "branchId" TEXT,
      "employeeCode" TEXT NOT NULL UNIQUE,
      "fullName" TEXT NOT NULL,
      "nationalId" TEXT,
      "phone" TEXT,
      "email" TEXT,
      "position" TEXT NOT NULL,
      "department" TEXT,
      "hireDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "terminationDate" DATETIME,
      "terminationReason" TEXT,
      "baseSalary" REAL NOT NULL DEFAULT 0,
      "allowances" REAL NOT NULL DEFAULT 0,
      "status" TEXT NOT NULL DEFAULT 'ACTIVE',
      "bankAccount" TEXT,
      "iban" TEXT,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL,
      "userId" TEXT UNIQUE,
      "departmentId" TEXT,
      "jobPositionId" TEXT,
      CONSTRAINT "Employee_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE,
      CONSTRAINT "Employee_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id"),
      CONSTRAINT "Employee_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id")
    )`,
    `CREATE TABLE IF NOT EXISTS "Attendance" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "employeeId" TEXT NOT NULL,
      "date" DATETIME NOT NULL,
      "checkIn" DATETIME,
      "checkOut" DATETIME,
      "status" TEXT NOT NULL DEFAULT 'PRESENT',
      "workHours" REAL NOT NULL DEFAULT 0,
      "overtimeHours" REAL NOT NULL DEFAULT 0,
      "notes" TEXT,
      CONSTRAINT "Attendance_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS "LeaveRequest" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "employeeId" TEXT NOT NULL,
      "type" TEXT NOT NULL,
      "startDate" DATETIME NOT NULL,
      "endDate" DATETIME NOT NULL,
      "daysCount" REAL NOT NULL,
      "reason" TEXT,
      "status" TEXT NOT NULL DEFAULT 'PENDING',
      "approvedBy" TEXT,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "LeaveRequest_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS "PayrollBatch" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "batchNumber" TEXT NOT NULL UNIQUE,
      "month" INTEGER NOT NULL,
      "year" INTEGER NOT NULL,
      "totalGross" REAL NOT NULL DEFAULT 0,
      "totalDeductions" REAL NOT NULL DEFAULT 0,
      "totalNet" REAL NOT NULL DEFAULT 0,
      "status" TEXT NOT NULL DEFAULT 'DRAFT',
      "processedAt" DATETIME,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS "PayrollItem" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "payrollBatchId" TEXT NOT NULL,
      "employeeId" TEXT NOT NULL,
      "baseSalary" REAL NOT NULL,
      "allowances" REAL NOT NULL,
      "overtimePay" REAL NOT NULL DEFAULT 0,
      "grossPay" REAL NOT NULL,
      "gosiDeduction" REAL NOT NULL DEFAULT 0,
      "vatDeduction" REAL NOT NULL DEFAULT 0,
      "loanDeduction" REAL NOT NULL DEFAULT 0,
      "otherDeductions" REAL NOT NULL DEFAULT 0,
      "totalDeductions" REAL NOT NULL,
      "netPay" REAL NOT NULL,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "PayrollItem_payrollBatchId_fkey" FOREIGN KEY ("payrollBatchId") REFERENCES "PayrollBatch"("id") ON DELETE CASCADE,
      CONSTRAINT "PayrollItem_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id")
    )`,
    `CREATE TABLE IF NOT EXISTS "Account" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "organizationId" TEXT NOT NULL,
      "code" TEXT NOT NULL,
      "name" TEXT NOT NULL,
      "nameEn" TEXT,
      "type" TEXT NOT NULL,
      "parentId" TEXT,
      "isGroup" BOOLEAN NOT NULL DEFAULT false,
      "balance" REAL NOT NULL DEFAULT 0,
      "isActive" BOOLEAN NOT NULL DEFAULT true,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "Account_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE,
      CONSTRAINT "Account_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Account"("id")
    )`,
    `CREATE TABLE IF NOT EXISTS "JournalEntry" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "organizationId" TEXT NOT NULL,
      "entryNumber" TEXT NOT NULL UNIQUE,
      "reference" TEXT,
      "description" TEXT NOT NULL,
      "totalDebit" REAL NOT NULL,
      "totalCredit" REAL NOT NULL,
      "entryDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "postedAt" DATETIME,
      "source" TEXT NOT NULL DEFAULT 'MANUAL',
      "createdById" TEXT NOT NULL,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "JournalEntry_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE,
      CONSTRAINT "JournalEntry_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id")
    )`,
    `CREATE TABLE IF NOT EXISTS "JournalLine" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "journalEntryId" TEXT NOT NULL,
      "accountId" TEXT NOT NULL,
      "debit" REAL NOT NULL DEFAULT 0,
      "credit" REAL NOT NULL DEFAULT 0,
      "description" TEXT,
      CONSTRAINT "JournalLine_journalEntryId_fkey" FOREIGN KEY ("journalEntryId") REFERENCES "JournalEntry"("id") ON DELETE CASCADE,
      CONSTRAINT "JournalLine_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id")
    )`,
    `CREATE TABLE IF NOT EXISTS "SalesInvoice" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "organizationId" TEXT NOT NULL,
      "branchId" TEXT NOT NULL,
      "invoiceNumber" TEXT NOT NULL UNIQUE,
      "customerId" TEXT,
      "salesRepId" TEXT,
      "status" TEXT NOT NULL DEFAULT 'COMPLETED',
      "paymentMethod" TEXT NOT NULL,
      "subtotal" REAL NOT NULL DEFAULT 0,
      "discountAmount" REAL NOT NULL DEFAULT 0,
      "vatAmount" REAL NOT NULL DEFAULT 0,
      "grandTotal" REAL NOT NULL DEFAULT 0,
      "paidAmount" REAL NOT NULL DEFAULT 0,
      "changeAmount" REAL NOT NULL DEFAULT 0,
      "invoiceDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "notes" TEXT,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "SalesInvoice_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE,
      CONSTRAINT "SalesInvoice_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id"),
      CONSTRAINT "SalesInvoice_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id"),
      CONSTRAINT "SalesInvoice_salesRepId_fkey" FOREIGN KEY ("salesRepId") REFERENCES "User"("id")
    )`,
    `CREATE TABLE IF NOT EXISTS "InvoiceItem" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "salesInvoiceId" TEXT NOT NULL,
      "productId" TEXT NOT NULL,
      "quantity" INTEGER NOT NULL,
      "unitPrice" REAL NOT NULL,
      "discountPct" REAL NOT NULL DEFAULT 0,
      "vatRate" REAL NOT NULL DEFAULT 15.0,
      "lineTotal" REAL NOT NULL,
      CONSTRAINT "InvoiceItem_salesInvoiceId_fkey" FOREIGN KEY ("salesInvoiceId") REFERENCES "SalesInvoice"("id") ON DELETE CASCADE,
      CONSTRAINT "InvoiceItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id")
    )`,
    `CREATE TABLE IF NOT EXISTS "StockMovement" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "organizationId" TEXT NOT NULL,
      "branchId" TEXT NOT NULL,
      "productId" TEXT NOT NULL,
      "type" TEXT NOT NULL,
      "quantity" INTEGER NOT NULL,
      "reference" TEXT,
      "balanceAfter" INTEGER NOT NULL,
      "notes" TEXT,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "StockMovement_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE,
      CONSTRAINT "StockMovement_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id"),
      CONSTRAINT "StockMovement_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS "PurchaseOrder" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "organizationId" TEXT NOT NULL,
      "supplierId" TEXT NOT NULL,
      "poNumber" TEXT NOT NULL UNIQUE,
      "status" TEXT NOT NULL DEFAULT 'DRAFT',
      "totalAmount" REAL NOT NULL DEFAULT 0,
      "vatAmount" REAL NOT NULL DEFAULT 0,
      "grandTotal" REAL NOT NULL DEFAULT 0,
      "paidAmount" REAL NOT NULL DEFAULT 0,
      "orderDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "expectedDate" DATETIME,
      "receivedDate" DATETIME,
      "notes" TEXT,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "PurchaseOrder_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE,
      CONSTRAINT "PurchaseOrder_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id")
    )`,
    `CREATE TABLE IF NOT EXISTS "PurchaseOrderItem" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "purchaseOrderId" TEXT NOT NULL,
      "productId" TEXT NOT NULL,
      "quantity" INTEGER NOT NULL,
      "unitCost" REAL NOT NULL,
      "vatRate" REAL NOT NULL DEFAULT 15.0,
      "lineTotal" REAL NOT NULL,
      CONSTRAINT "PurchaseOrderItem_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "PurchaseOrder"("id") ON DELETE CASCADE,
      CONSTRAINT "PurchaseOrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id")
    )`,
  ]

  for (const sql of statements) {
    try {
      await db.$executeRawUnsafe(sql)
    } catch (e: any) {
      // Table might already exist — that's OK
      if (!e.message.includes('already exists')) {
        console.error('[init-db] SQL error:', e.message)
      }
    }
  }
  console.log('[init-db] Schema created')
}

async function seedIfEmpty() {
  const orgCount = await db.organization.count()
  if (orgCount > 0) return // already seeded

  console.log('[init-db] Seeding initial data...')

  const org = await db.organization.create({
    data: {
      name: 'مؤسسة الحربي التجارية',
      legalName: 'مؤسسة خالد محمد الحربي التجارية',
      taxNumber: '300123456700003',
      currency: 'SAR',
      vatRate: 15.0,
      address: 'حي العليا، طريق الملك فهد',
      city: 'الرياض',
      phone: '+966112345678',
      email: 'info@alharbi-trading.sa',
    },
  })

  const branch = await db.branch.create({
    data: {
      organizationId: org.id,
      name: 'الفرع الرئيسي - الرياض',
      code: 'RUH-01',
      city: 'الرياض',
    },
  })

  // 5 users
  const users = [
    { email: 'admin@kmh-erp.sa', name: 'خالد الحربي', role: 'ADMIN', pw: 'admin123', color: 'cyan' },
    { email: 'cashier@kmh-erp.sa', name: 'أحمد العتيبي', role: 'CASHIER', pw: 'cashier123', color: 'emerald' },
    { email: 'accountant@kmh-erp.sa', name: 'سارة الدوسري', role: 'ACCOUNTANT', pw: 'acc123', color: 'amber' },
    { email: 'hr@kmh-erp.sa', name: 'نورة العنزي', role: 'HR_MANAGER', pw: 'hr123', color: 'purple' },
    { email: 'inventory@kmh-erp.sa', name: 'فهد القحطاني', role: 'INVENTORY_MANAGER', pw: 'inv123', color: 'rose' },
  ]
  for (const u of users) {
    await db.user.create({
      data: {
        organizationId: org.id,
        branchId: branch.id,
        email: u.email,
        name: u.name,
        role: u.role as any,
        passwordHash: hashPassword(u.pw),
        avatarColor: u.color,
      },
    })
  }

  // Categories
  const catNames = ['إلكترونيات', 'أجهزة منزلية', 'هواتف ذكية', 'إكسسوارات', 'مستلزمات مكتبية', 'كابلات وشواحن']
  const cats: any[] = []
  for (const name of catNames) {
    cats.push(await db.category.create({ data: { organizationId: org.id, name } }))
  }

  // Products
  const productsData = [
    { sku: 'PHN-IP15', barcode: '6291000010015', name: 'آيفون 15 برو ماكس 256GB', cat: 'هواتف ذكية', cost: 4200, sale: 5499 },
    { sku: 'PHN-S24', barcode: '6291000010022', name: 'سامسونج جالاكسي S24 الترا', cat: 'هواتف ذكية', cost: 3600, sale: 4799 },
    { sku: 'LPT-MAC', barcode: '6291000010039', name: 'ماك بوك برو 14 إنش M3', cat: 'إلكترونيات', cost: 6500, sale: 8499 },
    { sku: 'LPT-HP', barcode: '6291000010046', name: 'إتش بي بفيليون 15 i7', cat: 'إلكترونيات', cost: 2800, sale: 3699 },
    { sku: 'TV-LG55', barcode: '6291000010053', name: 'إل جي تلفاز 55 إنش OLED', cat: 'أجهزة منزلية', cost: 3500, sale: 4499 },
    { sku: 'TV-SAM50', barcode: '6291000010060', name: 'سامسونج تلفاز 50 إنش QLED', cat: 'أجهزة منزلية', cost: 2400, sale: 3199 },
    { sku: 'ACC-CHG', barcode: '6291000010077', name: 'شاحن سريع 65W USB-C', cat: 'كابلات وشواحن', cost: 45, sale: 89 },
    { sku: 'ACC-CBL', barcode: '6291000010084', name: 'كابل USB-C إلى Lightning أصلي', cat: 'كابلات وشواحن', cost: 35, sale: 75 },
    { sku: 'ACC-PWB', barcode: '6291000010091', name: 'باور بانك 20000mAh', cat: 'إكسسوارات', cost: 80, sale: 149 },
    { sku: 'ACC-HDP', barcode: '6291000010107', name: 'سماعات آبل AirPods Pro 2', cat: 'إكسسوارات', cost: 750, sale: 1099 },
    { sku: 'ACC-CSE', barcode: '6291000010114', name: 'جراب جلد لآيفون 15 برو', cat: 'إكسسوارات', cost: 25, sale: 69 },
    { sku: 'OFC-PAP', barcode: '6291000010121', name: 'كرتون ورق تصوير A4 (5 rim)', cat: 'مستلزمات مكتبية', cost: 95, sale: 145 },
    { sku: 'OFC-PEN', barcode: '6291000010138', name: 'علبة أقلام بيك بلو (50 قطعة)', cat: 'مستلزمات مكتبية', cost: 35, sale: 65 },
    { sku: 'HOM-VAC', barcode: '6291000010145', name: 'مكنسة كهربائية لاسلكية', cat: 'أجهزة منزلية', cost: 480, sale: 699 },
    { sku: 'HOM-MIC', barcode: '6291000010152', name: 'ميكروويف 30 لتر رقمي', cat: 'أجهزة منزلية', cost: 380, sale: 549 },
  ]
  for (const p of productsData) {
    const cat = cats.find((c) => c.name === p.cat)!
    await db.product.create({
      data: {
        organizationId: org.id,
        branchId: branch.id,
        categoryId: cat.id,
        sku: p.sku,
        barcode: p.barcode,
        name: p.name,
        unit: 'قطعة',
        costPrice: p.cost,
        salePrice: p.sale,
        vatRate: 15.0,
        reorderLevel: 10,
      },
    })
  }

  // Suppliers
  const suppliersData = [
    { name: 'شركة التقنية المتقدمة للتجارة', contact: 'محمد القحطاني', city: 'الرياض', terms: 'آجل 30 يوم' },
    { name: 'مؤسسة الإلكترونيات الحديثة', contact: 'عبدالله الشهري', city: 'جدة', terms: 'آجل 45 يوم' },
    { name: 'شركة الأجهزة المنزلية العالمية', contact: 'فهد المطيري', city: 'الدمام', terms: 'آجل 60 يوم' },
    { name: 'مكتبة العاصمة للمستلزمات المكتبية', contact: 'سعود العنزي', city: 'الرياض', terms: 'نقدي' },
  ]
  for (const s of suppliersData) {
    await db.supplier.create({
      data: { organizationId: org.id, name: s.name, contactPerson: s.contact, city: s.city, paymentTerms: s.terms },
    })
  }

  // Customers
  const customersData = [
    { name: 'محمد العمري', phone: '+966501234567', city: 'الرياض', creditLimit: 10000 },
    { name: 'عبدالعزيز السبيعي', phone: '+966502345678', city: 'الرياض', creditLimit: 25000 },
    { name: 'فيصل الحربي', phone: '+966553456789', city: 'جدة', creditLimit: 15000 },
    { name: 'بندر الدوسري', phone: '+966564567890', city: 'الدمام', creditLimit: 8000 },
    { name: 'ماجد القحطاني', phone: '+966575678901', city: 'مكة', creditLimit: 20000 },
    { name: 'طلال العنزي', phone: '+966586789012', city: 'الرياض', creditLimit: 5000 },
  ]
  for (const c of customersData) {
    await db.customer.create({
      data: { organizationId: org.id, name: c.name, phone: c.phone, city: c.city, creditLimit: c.creditLimit },
    })
  }

  // Employees
  const employeesData = [
    { code: 'EMP-001', name: 'أحمد العتيبي', pos: 'كاشير', dept: 'المبيعات', salary: 4500 },
    { code: 'EMP-002', name: 'خالد الشمري', pos: 'كاشير', dept: 'المبيعات', salary: 4500 },
    { code: 'EMP-003', name: 'سارة الدوسري', pos: 'محاسبة', dept: 'المالية', salary: 7500 },
    { code: 'EMP-004', name: 'نورة العنزي', pos: 'مدير موارد بشرية', dept: 'الموارد البشرية', salary: 9000 },
    { code: 'EMP-005', name: 'فهد القحطاني', pos: 'أمين مخزن', dept: 'المخزون', salary: 5500 },
    { code: 'EMP-006', name: 'عبدالله الحربي', pos: 'مندوب مبيعات', dept: 'المبيعات', salary: 5000 },
    { code: 'EMP-007', name: 'ماجد المطيري', pos: 'فني صيانة', dept: 'الصيانة', salary: 6000 },
    { code: 'EMP-008', name: 'سعود العتيبي', pos: 'مدير فرع جدة', dept: 'الإدارة', salary: 12000 },
  ]
  for (const e of employeesData) {
    await db.employee.create({
      data: {
        organizationId: org.id,
        branchId: branch.id,
        employeeCode: e.code,
        fullName: e.name,
        phone: '+9665' + Math.floor(10000000 + Math.random() * 89999999),
        email: e.name.split(' ')[0] + '@alharbi-trading.sa',
        position: e.pos,
        department: e.dept,
        baseSalary: e.salary,
        allowances: Math.round(e.salary * 0.15),
        status: 'ACTIVE',
      },
    })
  }

  // Chart of accounts
  const accounts = [
    { code: '1101', name: 'الصندوق - فرع الرياض', type: 'ASSET' },
    { code: '4100', name: 'إيرادات المبيعات', type: 'REVENUE' },
    { code: '2200', name: 'ضريبة القيمة المضافة المستحقة', type: 'LIABILITY' },
    { code: '5000', name: 'تكلفة المبيعات', type: 'COST_OF_SALES' },
    { code: '1300', name: 'المخزون', type: 'ASSET' },
    { code: '3100', name: 'رأس المال', type: 'EQUITY' },
    { code: '6100', name: 'رواتب وأجور', type: 'EXPENSE' },
    { code: '2300', name: 'الرواتب المستحقة', type: 'LIABILITY' },
  ]
  for (const a of accounts) {
    await db.account.create({
      data: {
        organizationId: org.id,
        code: a.code,
        name: a.name,
        type: a.type as any,
        isGroup: false,
        balance: a.code === '3100' ? 500000 : 0,
      },
    })
  }

  console.log('[init-db] Seed complete')
}

export async function initDb(): Promise<void> {
  if (initPromise) return initPromise
  initPromise = (async () => {
    try {
      await ensureDbSchema()
      await seedIfEmpty()
    } catch (e) {
      initPromise = null // allow retry
      console.error('[init-db] failed:', e)
      throw e
    }
  })()
  return initPromise
}
