// /api/suppliers/[id]
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { logAction } from "@/lib/audit";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(["ADMIN", "INVENTORY_MANAGER", "ACCOUNTANT"]);
  if (auth.error || !auth.user) return NextResponse.json({ error: "غير مصرّح" }, { status: auth.status });
  try {
    const { id } = await params;
    const body = await req.json();
    const existing = await db.supplier.findFirst({ where: { id, organizationId: auth.user.organizationId } });
    if (!existing) return NextResponse.json({ error: "المورد غير موجود" }, { status: 404 });
    const allowed = ["name", "contactPerson", "phone", "email", "taxNumber", "address", "city", "paymentTerms", "balanceDue"];
    const data: any = {};
    for (const k of allowed) {
      if (body[k] !== undefined) data[k] = k === "balanceDue" ? parseFloat(body[k]) : body[k];
    }
    const updated = await db.supplier.update({ where: { id }, data });
    await logAction({
      organizationId: auth.user.organizationId, userId: auth.user.id,
      action: "UPDATE", entity: "Supplier", entityId: id,
      description: `تحديث مورد: ${updated.name}`,
    });
    return NextResponse.json({ success: true });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(["ADMIN"]);
  if (auth.error || !auth.user) return NextResponse.json({ error: "غير مصرّح" }, { status: auth.status });
  try {
    const { id } = await params;
    const existing = await db.supplier.findFirst({ where: { id, organizationId: auth.user.organizationId } });
    if (!existing) return NextResponse.json({ error: "المورد غير موجود" }, { status: 404 });
    await db.supplier.delete({ where: { id } });
    await logAction({
      organizationId: auth.user.organizationId, userId: auth.user.id,
      action: "DELETE", entity: "Supplier", entityId: id,
      description: `حذف مورد: ${existing.name}`,
    });
    return NextResponse.json({ success: true });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
