// /api/admin/users/[id] - update + delete user (ADMIN only)
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth, hashPassword, ROLE_LABELS } from "@/lib/auth";
import { logAction } from "@/lib/audit";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(["ADMIN"]);
  if (auth.error || !auth.user) {
    return NextResponse.json({ error: "غير مصرّح" }, { status: auth.status });
  }
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, email, password, role, branchId, isActive } = body;

    const target = await db.user.findUnique({ where: { id } });
    if (!target || target.organizationId !== auth.user.organizationId) {
      return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 });
    }

    // Prevent admin from demoting themselves
    if (target.id === auth.user.id && role && role !== "ADMIN") {
      return NextResponse.json({ error: "لا يمكنك تخفيض صلاحياتك الخاصة" }, { status: 400 });
    }
    if (target.id === auth.user.id && isActive === false) {
      return NextResponse.json({ error: "لا يمكنك إيقاف حسابك الخاص" }, { status: 400 });
    }

    const data: any = {};
    if (name) data.name = name;
    if (email) data.email = email.toLowerCase().trim();
    if (role && ROLE_LABELS[role]) data.role = role;
    if (branchId !== undefined) data.branchId = branchId || null;
    if (isActive !== undefined) data.isActive = isActive;
    if (password && password.length >= 6) {
      data.passwordHash = hashPassword(password);
    }

    const updated = await db.user.update({ where: { id }, data });

    await logAction({
      organizationId: auth.user.organizationId,
      userId: auth.user.id,
      action: "UPDATE",
      entity: "User",
      entityId: id,
      description: `تحديث مستخدم: ${updated.name} — ${Object.keys(data).join(", ")}`,
      metadata: { updatedFields: Object.keys(data) },
    });

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(["ADMIN"]);
  if (auth.error || !auth.user) {
    return NextResponse.json({ error: "غير مصرّح" }, { status: auth.status });
  }
  try {
    const { id } = await params;
    if (id === auth.user.id) {
      return NextResponse.json({ error: "لا يمكنك حذف حسابك الخاص" }, { status: 400 });
    }
    const target = await db.user.findUnique({ where: { id } });
    if (!target || target.organizationId !== auth.user.organizationId) {
      return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 });
    }
    // Soft delete by deactivating (to preserve audit history)
    await db.user.update({ where: { id }, data: { isActive: false } });
    await db.session.deleteMany({ where: { userId: id } });

    await logAction({
      organizationId: auth.user.organizationId,
      userId: auth.user.id,
      action: "DELETE",
      entity: "User",
      entityId: id,
      description: `حذف مستخدم: ${target.name} (${target.email})`,
    });

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
