// /api/categories/[id]
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { logAction } from "@/lib/audit";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(["ADMIN", "INVENTORY_MANAGER"]);
  if (auth.error || !auth.user) return NextResponse.json({ error: "غير مصرّح" }, { status: auth.status });
  try {
    const { id } = await params;
    const body = await req.json();
    const existing = await db.category.findFirst({ where: { id, organizationId: auth.user.organizationId } });
    if (!existing) return NextResponse.json({ error: "الفئة غير موجودة" }, { status: 404 });
    const data: any = {};
    if (body.name) data.name = body.name;
    if (body.parentId !== undefined) data.parentId = body.parentId || null;
    const updated = await db.category.update({ where: { id }, data });
    await logAction({
      organizationId: auth.user.organizationId, userId: auth.user.id,
      action: "UPDATE", entity: "Category", entityId: id,
      description: `تحديث فئة: ${updated.name}`,
    });
    return NextResponse.json({ success: true });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(["ADMIN"]);
  if (auth.error || !auth.user) return NextResponse.json({ error: "غير مصرّح" }, { status: auth.status });
  try {
    const { id } = await params;
    const existing = await db.category.findFirst({ where: { id, organizationId: auth.user.organizationId } });
    if (!existing) return NextResponse.json({ error: "الفئة غير موجودة" }, { status: 404 });
    await db.category.delete({ where: { id } });
    await logAction({
      organizationId: auth.user.organizationId, userId: auth.user.id,
      action: "DELETE", entity: "Category", entityId: id,
      description: `حذف فئة: ${existing.name}`,
    });
    return NextResponse.json({ success: true });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
