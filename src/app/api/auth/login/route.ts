// POST /api/auth/login
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyPassword, createSession, hashPassword, SESSION_COOKIE_NAME, SESSION_MAX_AGE } from "@/lib/auth";
import { logAction } from "@/lib/audit";
import { initDb } from "@/lib/init-db";

// Auto-bootstrap on first run - create org + admin user if DB is empty
async function bootstrap() {
  const orgCount = await db.organization.count();
  if (orgCount > 0) return null;

  const org = await db.organization.create({
    data: {
      name: "مؤسسة الحربي التجارية",
      legalName: "مؤسسة خالد محمد الحربي التجارية",
      taxNumber: "300123456700003",
      currency: "SAR",
      vatRate: 15.0,
      address: "حي العليا، طريق الملك فهد",
      city: "الرياض",
      phone: "+966112345678",
      email: "info@alharbi-trading.sa",
    },
  });
  const branch = await db.branch.create({
    data: {
      organizationId: org.id,
      name: "الفرع الرئيسي",
      code: "MAIN-01",
      city: "الرياض",
    },
  });
  const admin = await db.user.create({
    data: {
      organizationId: org.id,
      branchId: branch.id,
      email: "admin@kmh-erp.sa",
      name: "خالد الحربي",
      role: "ADMIN",
      passwordHash: hashPassword("admin123"),
      avatarColor: "cyan",
    },
  });
  return { org, admin };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "البريد الإلكتروني وكلمة المرور مطلوبة" }, { status: 400 });
    }

    // Ensure DB is initialized (creates schema + seed on Vercel serverless)
    await initDb();

    const user = await db.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: { organization: true, branch: true },
    });

    if (!user || !user.passwordHash) {
      return NextResponse.json({ error: "بيانات الدخول غير صحيحة" }, { status: 401 });
    }
    if (!user.isActive) {
      return NextResponse.json({ error: "هذا الحساب موقوف. تواصل مع مدير النظام" }, { status: 403 });
    }
    if (!verifyPassword(password, user.passwordHash)) {
      return NextResponse.json({ error: "بيانات الدخول غير صحيحة" }, { status: 401 });
    }

    const { token, expiresAt } = await createSession(user.id, req);

    // Update last login
    await db.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // Audit log
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || null;
    await logAction({
      organizationId: user.organizationId,
      userId: user.id,
      action: "LOGIN",
      entity: "User",
      entityId: user.id,
      description: `تسجيل دخول: ${user.name} (${user.email})`,
      ipAddress: ip,
    });

    // Set HTTP-only cookie
    const res = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        branchId: user.branchId,
        organizationId: user.organizationId,
      },
      organization: {
        id: user.organization.id,
        name: user.organization.name,
        currency: user.organization.currency,
        vatRate: user.organization.vatRate,
      },
    });
    res.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_MAX_AGE,
      path: "/",
    });
    return res;
  } catch (e: any) {
    console.error("[login] error:", e);
    return NextResponse.json({ error: "فشل تسجيل الدخول" }, { status: 500 });
  }
}
