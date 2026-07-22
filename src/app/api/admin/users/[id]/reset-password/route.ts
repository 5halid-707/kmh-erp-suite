// /api/admin/users/[id]/reset-password - Admin resets a user's password
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth, hashPassword } from "@/lib/auth";
import { logAction } from "@/lib/audit";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(["ADMIN"]);
  if (auth.error || !auth.user) {
    return NextResponse.json({ error: "غير مصرّح" }, { status: auth.status });
  }
  try {
    const { id } = await params;
    const body = await req.json();
    const { newPassword } = body;

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json({ error: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" }, { status: 400 });
    }

    const target = await db.user.findUnique({ where: { id } });
    if (!target || target.organizationId !== auth.user.organizationId) {
      return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 });
    }

    await db.user.update({
      where: { id },
      data: { passwordHash: hashPassword(newPassword) },
    });
    // Invalidate all sessions for this user (force re-login)
    await db.session.deleteMany({ where: { userId: id } });

    await logAction({
      organizationId: auth.user.organizationId,
      userId: auth.user.id,
      action: "UPDATE",
      entity: "User",
      entityId: id,
      description: `إعادة تعيين كلمة مرور المستخدم: ${target.name} (${target.email})`,
      ipAddress: req.headers.get("x-forwarded-for")?.split(",")[0] || null,
    });

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
