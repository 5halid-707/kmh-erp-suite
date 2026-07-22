// /api/products/[id] - update + delete
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { logAction } from "@/lib/audit";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(["ADMIN", "INVENTORY_MANAGER"]);
  if (auth.error || !auth.user) {
    return NextResponse.json({ error: "غير مصرّح" }, { status: auth.status });
  }
  try {
    const { id } = await params;
    const body = await req.json();
    const existing = await db.product.findFirst({
      where: { id, organizationId: auth.user.organizationId },
    });
    if (!existing) {
      return NextResponse.json({ error: "المنتج غير موجود" }, { status: 404 });
    }
    const allowed = ["sku", "barcode", "name", "nameEn", "description", "categoryId", "branchId", "unit", "costPrice", "salePrice", "vatRate", "reorderLevel", "isActive"];
    const data: any = {};
    for (const k of allowed) {
      if (body[k] !== undefined) {
        if (["costPrice", "salePrice", "vatRate"].includes(k)) data[k] = parseFloat(body[k]);
        else if (k === "reorderLevel") data[k] = parseInt(body[k]);
        else data[k] = body[k];
      }
    }
    const updated = await db.product.update({ where: { id }, data });
    await logAction({
      organizationId: auth.user.organizationId,
      userId: auth.user.id,
      action: "UPDATE",
      entity: "Product",
      entityId: id,
      description: `تحديث منتج: ${updated.name}`,
      metadata: { updatedFields: Object.keys(data) },
    });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(["ADMIN", "INVENTORY_MANAGER"]);
  if (auth.error || !auth.user) {
    return NextResponse.json({ error: "غير مصرّح" }, { status: auth.status });
  }
  try {
    const { id } = await params;
    const existing = await db.product.findFirst({
      where: { id, organizationId: auth.user.organizationId },
    });
    if (!existing) {
      return NextResponse.json({ error: "المنتج غير موجود" }, { status: 404 });
    }
    // Soft delete by deactivating
    await db.product.update({ where: { id }, data: { isActive: false } });
    await logAction({
      organizationId: auth.user.organizationId,
      userId: auth.user.id,
      action: "DELETE",
      entity: "Product",
      entityId: id,
      description: `حذف منتج: ${existing.name} (${existing.sku})`,
    });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
