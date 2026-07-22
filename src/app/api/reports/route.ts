// /api/reports - Comprehensive reports for ERP
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const auth = await requireAuth();
  if (auth.error || !auth.user) {
    return NextResponse.json({ error: "غير مصرّح" }, { status: auth.status });
  }
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "sales";
  const orgId = auth.user.organizationId;
  const last30 = new Date(); last30.setDate(last30.getDate() - 30);

  // Sales by day (last 30 days)
  const salesByDay = await db.salesInvoice.groupBy({
    by: ["invoiceDate"],
    where: { organizationId: orgId, status: "COMPLETED", invoiceDate: { gte: last30 } },
    _sum: { grandTotal: true, vatAmount: true },
    _count: true,
  });

  // Top customers
  const topCustomersRaw = await db.salesInvoice.findMany({
    where: { organizationId: orgId, status: "COMPLETED", customerId: { not: null } },
    select: { customerId: true, grandTotal: true, customer: { select: { name: true, phone: true } } },
  });
  const custMap = new Map<string, { name: string; phone: string; total: number; invoices: number }>();
  for (const inv of topCustomersRaw) {
    if (!inv.customerId) continue;
    if (!custMap.has(inv.customerId)) {
      custMap.set(inv.customerId, { name: inv.customer?.name || "—", phone: inv.customer?.phone || "—", total: 0, invoices: 0 });
    }
    const c = custMap.get(inv.customerId)!;
    c.total += inv.grandTotal;
    c.invoices += 1;
  }
  const topCustomers = Array.from(custMap.values()).sort((a, b) => b.total - a.total).slice(0, 10);

  // Top products by revenue (last 30 days)
  const topProductsRaw = await db.invoiceItem.findMany({
    where: { salesInvoice: { organizationId: orgId, status: "COMPLETED", invoiceDate: { gte: last30 } } },
    select: { quantity: true, lineTotal: true, product: { select: { name: true, sku: true } } },
  });
  const prodMap = new Map<string, { name: string; sku: string; qty: number; revenue: number }>();
  for (const it of topProductsRaw) {
    if (!prodMap.has(it.product.sku)) {
      prodMap.set(it.product.sku, { name: it.product.name, sku: it.product.sku, qty: 0, revenue: 0 });
    }
    const p = prodMap.get(it.product.sku)!;
    p.qty += it.quantity;
    p.revenue += it.lineTotal;
  }
  const topProducts = Array.from(prodMap.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 10);

  // Sales by payment method
  const paymentBreakdown = await db.salesInvoice.groupBy({
    by: ["paymentMethod"],
    where: { organizationId: orgId, status: "COMPLETED" },
    _sum: { grandTotal: true },
    _count: true,
  });

  // Sales by category
  const categoryRaw = await db.invoiceItem.findMany({
    where: { salesInvoice: { organizationId: orgId, status: "COMPLETED" } },
    select: { quantity: true, lineTotal: true, product: { select: { category: { select: { name: true } } } } },
  });
  const catMap = new Map<string, { qty: number; revenue: number }>();
  for (const it of categoryRaw) {
    const catName = it.product.category?.name || "غير مصنف";
    if (!catMap.has(catName)) catMap.set(catName, { qty: 0, revenue: 0 });
    const c = catMap.get(catName)!;
    c.qty += it.quantity;
    c.revenue += it.lineTotal;
  }
  const salesByCategory = Array.from(catMap.entries()).map(([name, v]) => ({ name, ...v })).sort((a, b) => b.revenue - a.revenue);

  // Profit analysis
  const totalRevenue = topProductsRaw.reduce((s, p) => s + p.lineTotal, 0);
  const productCosts = await db.invoiceItem.findMany({
    where: { salesInvoice: { organizationId: orgId, status: "COMPLETED" } },
    select: { quantity: true, product: { select: { costPrice: true } } },
  });
  const totalCOGS = productCosts.reduce((s, it) => s + it.product.costPrice * it.quantity, 0);
  const grossProfit = totalRevenue - totalCOGS;
  const grossMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

  // Inventory valuation
  const products = await db.product.findMany({ where: { organizationId: orgId }, select: { costPrice: true, salePrice: true } });
  const inventoryCost = products.reduce((s, p) => s + p.costPrice, 0);
  const inventoryRetail = products.reduce((s, p) => s + p.salePrice, 0);

  // HR stats
  const employeeCount = await db.employee.count({ where: { organizationId: orgId, status: "ACTIVE" } });
  const totalPayroll = await db.employee.aggregate({
    where: { organizationId: orgId, status: "ACTIVE" },
    _sum: { baseSalary: true, allowances: true },
  });

  return NextResponse.json({
    salesByDay: salesByDay.slice(0, 30).reverse(),
    topCustomers,
    topProducts,
    paymentBreakdown,
    salesByCategory,
    profitAnalysis: {
      totalRevenue,
      totalCOGS,
      grossProfit,
      grossMargin: Math.round(grossMargin * 100) / 100,
    },
    inventory: { cost: inventoryCost, retail: inventoryRetail },
    hr: {
      employeeCount,
      totalPayroll: (totalPayroll._sum.baseSalary || 0) + (totalPayroll._sum.allowances || 0),
    },
  });
}
