// /api/products - CRUD (Admin/Inventory Manager write; all read)
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { logAction } from "@/lib/audit";

export async function GET() {
  const auth = await requireAuth();
  if (auth.error || !auth.user) {
    return NextResponse.json({ error: "غير مصرّح" }, { status: auth.status });
  }
  const products = await db.product.findMany({
    where: { organizationId: auth.user.organizationId },
    include: { category: { select: { name: true } }, branch: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
  // Compute stock for each
  const result = [];
  for (const p of products) {
    const moves = await db.stockMovement.findMany({
      where: { productId: p.id },
      select: { type: true, quantity: true },
    });
    let stock = 0;
    for (const m of moves) {
      if (["PURCHASE_IN", "RETURN_IN", "ADJUSTMENT_IN", "TRANSFER_IN"].includes(m.type)) stock += m.quantity;
      else stock -= m.quantity;
    }
    result.push({
      id: p.id,
      sku: p.sku,
      barcode: p.barcode,
      name: p.name,
      nameEn: p.nameEn,
      description: p.description,
      categoryId: p.categoryId,
      category: p.category?.name || null,
      branchId: p.branchId,
      branch: p.branch?.name || null,
      unit: p.unit,
      costPrice: p.costPrice,
      salePrice: p.salePrice,
      vatRate: p.vatRate,
      reorderLevel: p.reorderLevel,
      imageUrl: p.imageUrl,
      stock,
      isLowStock: stock <= p.reorderLevel,
      isActive: p.isActive,
      createdAt: p.createdAt,
    });
  }
  return NextResponse.json({ products: result });
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(["ADMIN", "INVENTORY_MANAGER"]);
  if (auth.error || !auth.user) {
    return NextResponse.json({ error: "غير مصرّح" }, { status: auth.status });
  }
  try {
    const body = await req.json();
    const { sku, barcode, name, nameEn, description, categoryId, branchId, unit, costPrice, salePrice, vatRate, reorderLevel, imageUrl } = body;
    if (!sku || !name || salePrice === undefined) {
      return NextResponse.json({ error: "SKU، الاسم، وسعر البيع مطلوبة" }, { status: 400 });
    }
    const existing = await db.product.findFirst({
      where: { organizationId: auth.user.organizationId, OR: [{ sku }, ...(barcode ? [{ barcode }] : [])] },
    });
    if (existing) {
      return NextResponse.json({ error: "SKU أو الباركود مستخدم بالفعل" }, { status: 400 });
    }
    const product = await db.product.create({
      data: {
        organizationId: auth.user.organizationId,
        branchId: branchId || auth.user.branchId || null,
        categoryId: categoryId || null,
        sku, barcode: barcode || null,
        name, nameEn: nameEn || null,
        description: description || null,
        unit: unit || "قطعة",
        costPrice: parseFloat(costPrice) || 0,
        salePrice: parseFloat(salePrice) || 0,
        vatRate: vatRate !== undefined ? parseFloat(vatRate) : 15.0,
        reorderLevel: parseInt(reorderLevel) || 10,
        imageUrl: imageUrl || null,
      },
    });
    await logAction({
      organizationId: auth.user.organizationId,
      userId: auth.user.id,
      action: "CREATE",
      entity: "Product",
      entityId: product.id,
      description: `إضافة منتج: ${product.name} (${product.sku})`,
      metadata: { sku, name, salePrice },
    });
    return NextResponse.json({ success: true, productId: product.id });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
