// POS products endpoint - list products for cashier interface
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getFirstOrg, getMainBranch } from "@/lib/erp-helpers";

export async function GET() {
  const org = await getFirstOrg();
  const branch = await getMainBranch();

  const products = await db.product.findMany({
    where: {
      organizationId: org.id,
      branchId: branch.id,
      isActive: true,
    },
    include: { category: { select: { name: true } } },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({
    branch: { id: branch.id, name: branch.name, code: branch.code },
    products: products.map((p) => ({
      id: p.id,
      sku: p.sku,
      barcode: p.barcode,
      name: p.name,
      category: p.category?.name || "غير مصنف",
      salePrice: p.salePrice,
      costPrice: p.costPrice,
      vatRate: p.vatRate,
      unit: p.unit,
    })),
  });
}
