// ERP: products + inventory + categories
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getFirstOrg } from "@/lib/erp-helpers";

export async function GET() {
  const org = await getFirstOrg();

  const [products, categories] = await Promise.all([
    db.product.findMany({
      where: { organizationId: org.id },
      include: {
        category: { select: { name: true } },
        branch: { select: { name: true } },
      },
      orderBy: { name: "asc" },
    }),
    db.category.findMany({
      where: { organizationId: org.id },
      include: { _count: { select: { products: true } } },
    }),
  ]);

  // Compute stock from movements
  const stockMap = new Map<string, number>();
  for (const p of products) {
    const moves = await db.stockMovement.findMany({
      where: { productId: p.id },
      select: { type: true, quantity: true },
    });
    let stock = 0;
    for (const m of moves) {
      if (["PURCHASE_IN", "RETURN_IN", "ADJUSTMENT_IN", "TRANSFER_IN"].includes(m.type)) {
        stock += m.quantity;
      } else {
        stock -= m.quantity;
      }
    }
    stockMap.set(p.id, stock);
  }

  // Stock valuation
  const totalCostValue = products.reduce((s, p) => s + p.costPrice * (stockMap.get(p.id) || 0), 0);
  const totalRetailValue = products.reduce((s, p) => s + p.salePrice * (stockMap.get(p.id) || 0), 0);
  const lowStock = products.filter((p) => (stockMap.get(p.id) || 0) <= p.reorderLevel).length;

  return NextResponse.json({
    summary: {
      totalProducts: products.length,
      totalCategories: categories.length,
      totalCostValue,
      totalRetailValue,
      lowStockCount: lowStock,
    },
    categories: categories.map((c) => ({ id: c.id, name: c.name, productCount: c._count.products })),
    products: products.map((p) => ({
      id: p.id,
      sku: p.sku,
      barcode: p.barcode,
      name: p.name,
      category: p.category?.name || "-",
      branch: p.branch?.name || "-",
      unit: p.unit,
      costPrice: p.costPrice,
      salePrice: p.salePrice,
      stock: stockMap.get(p.id) || 0,
      stockValue: p.costPrice * (stockMap.get(p.id) || 0),
      reorderLevel: p.reorderLevel,
      isLowStock: (stockMap.get(p.id) || 0) <= p.reorderLevel,
      vatRate: p.vatRate,
      isActive: p.isActive,
    })),
  });
}
