// /api/admin/users/[id]/sessions - Get login/logout session history for a user
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(["ADMIN"]);
  if (auth.error || !auth.user) {
    return NextResponse.json({ error: "غير مصرّح" }, { status: auth.status });
  }
  try {
    const { id } = await params;
    const target = await db.user.findUnique({ where: { id } });
    if (!target || target.organizationId !== auth.user.organizationId) {
      return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 });
    }

    // Active sessions
    const activeSessions = await db.session.findMany({
      where: { userId: id, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        createdAt: true,
        expiresAt: true,
        ipAddress: true,
        userAgent: true,
      },
    });

    // Login/logout events from audit log
    const loginEvents = await db.auditLog.findMany({
      where: {
        userId: id,
        action: { in: ["LOGIN", "LOGOUT"] },
      },
      orderBy: { createdAt: "desc" },
      take: 30,
      select: {
        id: true,
        action: true,
        description: true,
        ipAddress: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      user: {
        id: target.id,
        name: target.name,
        email: target.email,
        lastLogin: target.lastLogin,
        lastLogout: target.lastLogout,
      },
      activeSessions,
      loginHistory: loginEvents,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
