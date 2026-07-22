// Dashboard aggregate stats API
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { daysAgo } from "@/lib/erp-helpers";

export async function GET() {
  const auth = await requireAuth();
  if (auth.error || !auth.user) {
    return NextResponse.json({ error: "غير مصرّح" }, { status: auth.status });
  }
  const org = { id: auth.user.organizationId };
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const last30Start = daysAgo(30);

  // Today's sales
  const todaySales = await db.salesInvoice.aggregate({
    where: {
      organizationId: org.id,
      invoiceDate: { gte: todayStart },
      status: "COMPLETED",
    },
    _sum: { grandTotal: true, vatAmount: true },
    _count: true,
  });

  // This month sales
  const monthSales = await db.salesInvoice.aggregate({
    where: {
      organizationId: org.id,
      invoiceDate: { gte: monthStart },
      status: "COMPLETED",
    },
    _sum: { grandTotal: true, vatAmount: true },
    _count: true,
  });

  const customers = await db.customer.aggregate({
    where: { organizationId: org.id },
    _sum: { balanceDue: true },
    _count: true,
  });

  const suppliers = await db.supplier.aggregate({
    where: { organizationId: org.id },
    _sum: { balanceDue: true },
    _count: true,
  });

  const products = await db.product.findMany({
    where: { organizationId: org.id },
    select: { costPrice: true, salePrice: true },
  });
  const inventoryValue = products.reduce((s, p) => s + p.costPrice, 0);
  const inventoryRetailValue = products.reduce((s, p) => s + p.salePrice, 0);

  const activeEmployees = await db.employee.count({
    where: { organizationId: org.id, status: "ACTIVE" },
  });
  const employees = await db.employee.findMany({
    where: { organizationId: org.id, status: "ACTIVE" },
    select: { baseSalary: true, allowances: true },
  });
  const monthlyPayroll = employees.reduce((s, e) => s + e.baseSalary + e.allowances, 0);

  const attendanceToday = await db.attendance.groupBy({
    by: ["status"],
    where: {
      employee: { organizationId: org.id },
      date: { gte: todayStart },
    },
    _count: true,
  });

  const pendingLeaves = await db.leaveRequest.count({
    where: { employee: { organizationId: org.id }, status: "PENDING" },
  });

  const sales14: { date: string; total: number; count: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const dayStart = daysAgo(i);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayStart.getDate() + 1);
    const agg = await db.salesInvoice.aggregate({
      where: {
        organizationId: org.id,
        invoiceDate: { gte: dayStart, lt: dayEnd },
        status: "COMPLETED",
      },
      _sum: { grandTotal: true },
      _count: true,
    });
    sales14.push({
      date: dayStart.toISOString(),
      total: agg._sum.grandTotal || 0,
      count: agg._count,
    });
  }

  const topProductsRaw = await db.invoiceItem.findMany({
    where: {
      salesInvoice: {
        organizationId: org.id,
        status: "COMPLETED",
        invoiceDate: { gte: last30Start },
      },
    },
    select: {
      quantity: true,
      lineTotal: true,
      product: { select: { name: true, sku: true } },
    },
  });
  const prodMap = new Map<string, { name: string; sku: string; qty: number; revenue: number }>();
  for (const it of topProductsRaw) {
    const key = it.product.sku;
    if (!prodMap.has(key)) {
      prodMap.set(key, { name: it.product.name, sku: it.product.sku, qty: 0, revenue: 0 });
    }
    const p = prodMap.get(key)!;
    p.qty += it.quantity;
    p.revenue += it.lineTotal;
  }
  const topProducts = Array.from(prodMap.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const payMethodRaw = await db.salesInvoice.groupBy({
    by: ["paymentMethod"],
    where: {
      organizationId: org.id,
      status: "COMPLETED",
      invoiceDate: { gte: last30Start },
    },
    _sum: { grandTotal: true },
    _count: true,
  });

  const recentInvoices = await db.salesInvoice.findMany({
    where: { organizationId: org.id, status: "COMPLETED" },
    orderBy: { invoiceDate: "desc" },
    take: 8,
    include: {
      customer: { select: { name: true } },
      salesRep: { select: { name: true } },
    },
  });

  return NextResponse.json({
    today: {
      sales: todaySales._sum.grandTotal || 0,
      vat: todaySales._sum.vatAmount || 0,
      invoices: todaySales._count,
    },
    month: {
      sales: monthSales._sum.grandTotal || 0,
      vat: monthSales._sum.vatAmount || 0,
      invoices: monthSales._count,
    },
    receivables: customers._sum.balanceDue || 0,
    customers: customers._count,
    payables: suppliers._sum.balanceDue || 0,
    suppliers: suppliers._count,
    inventory: {
      items: products.length,
      costValue: inventoryValue,
      retailValue: inventoryRetailValue,
    },
    hr: {
      activeEmployees,
      monthlyPayroll,
      attendanceToday,
      pendingLeaves,
    },
    sales14Days: sales14,
    topProducts,
    paymentMethods: payMethodRaw,
    recentInvoices,
  });
}
