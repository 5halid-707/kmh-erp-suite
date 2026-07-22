// POS products endpoint - list products for cashier interface
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  const auth = await requireAuth(["ADMIN", "CASHIER", "BRANCH_MANAGER"]);
  if (auth.error || !auth.user) {
    return NextResponse.json({ error: "غير مصرّح" }, { status: auth.status });
  }

  const branch = auth.user.branchId
    ? await db.branch.findUnique({ where: { id: auth.user.branchId } })
    : await db.branch.findFirst({ where: { organizationId: auth.user.organizationId } });

  if (!branch) return NextResponse.json({ error: "لا يوجد فرع" }, { status: 404 });

  const products = await db.product.findMany({
    where: {
      organizationId: auth.user.organizationId,
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
