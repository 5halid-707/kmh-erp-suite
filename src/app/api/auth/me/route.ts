// GET /api/auth/me - return current user info
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { initDb } from "@/lib/init-db";

export async function GET() {
  try {
    await initDb();
  } catch (e) {
    console.error("[me] initDb failed:", e);
  }
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ user: null }, { status: 200 });
  }
  // Fetch organization details from DB (best-effort)
  let org = null;
  try {
    org = await db.organization.findUnique({
      where: { id: user.organizationId },
      select: { id: true, name: true, legalName: true, currency: true, vatRate: true, taxNumber: true },
    });
  } catch (e) {
    console.error("[me] failed to fetch org:", e);
  }
  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      branchId: user.branchId,
      organizationId: user.organizationId,
      avatarColor: user.avatarColor,
      isActive: user.isActive,
    },
    organization: org || {
      id: user.organizationId,
      name: "مؤسسة الحربي التجارية",
      currency: "SAR",
      vatRate: 15,
    },
  });
}
