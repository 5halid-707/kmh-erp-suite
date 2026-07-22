// /api/admin/users - CRUD for user management (ADMIN only)
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth, hashPassword, ROLE_LABELS } from "@/lib/auth";
import { logAction } from "@/lib/audit";

// GET - list all users
export async function GET() {
  const auth = await requireAuth(["ADMIN"]);
  if (auth.error || !auth.user) {
    return NextResponse.json({ error: auth.error === "FORBIDDEN" ? "لا تملك صلاحية" : "غير مصرّح" }, { status: auth.status });
  }
  const users = await db.user.findMany({
    where: { organizationId: auth.user.organizationId },
    include: { branch: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({
    users: users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      roleLabel: ROLE_LABELS[u.role],
      branchId: u.branchId,
      branchName: u.branch?.name || null,
      isActive: u.isActive,
      avatarColor: u.avatarColor,
      lastLogin: u.lastLogin,
      lastLogout: u.lastLogout,
      createdAt: u.createdAt,
    })),
  });
}

// POST - create new user
export async function POST(req: NextRequest) {
  const auth = await requireAuth(["ADMIN"]);
  if (auth.error || !auth.user) {
    return NextResponse.json({ error: "غير مصرّح" }, { status: auth.status });
  }
  try {
    const body = await req.json();
    const { name, email, password, role, branchId, isActive = true } = body;

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: "الاسم، البريد، كلمة المرور، والدور مطلوبة" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" }, { status: 400 });
    }
    if (!ROLE_LABELS[role]) {
      return NextResponse.json({ error: "دور غير صالح" }, { status: 400 });
    }

    const existing = await db.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (existing) {
      return NextResponse.json({ error: "البريد الإلكتروني مستخدم بالفعل" }, { status: 400 });
    }

    const colors = ["cyan", "emerald", "amber", "purple", "rose", "blue"];
    const user = await db.user.create({
      data: {
        organizationId: auth.user.organizationId,
        branchId: branchId || null,
        name,
        email: email.toLowerCase().trim(),
        passwordHash: hashPassword(password),
        role,
        isActive,
        avatarColor: colors[Math.floor(Math.random() * colors.length)],
      },
    });

    await logAction({
      organizationId: auth.user.organizationId,
      userId: auth.user.id,
      action: "CREATE",
      entity: "User",
      entityId: user.id,
      description: `إنشاء مستخدم: ${user.name} (${user.email}) بدور ${ROLE_LABELS[role]}`,
    });

    return NextResponse.json({ success: true, userId: user.id });
  } catch (e: any) {
    console.error("[users.create] error:", e);
    return NextResponse.json({ error: e.message || "فشل الإنشاء" }, { status: 500 });
  }
}
