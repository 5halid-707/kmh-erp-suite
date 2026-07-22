// POST /api/auth/logout
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { getCurrentUser, destroySession, SESSION_COOKIE_NAME } from "@/lib/auth";
import { logAction } from "@/lib/audit";

export async function POST() {
  const user = await getCurrentUser();
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (token) {
    await destroySession(token);
  }
  if (user) {
    await logAction({
      organizationId: user.organizationId,
      userId: user.id,
      action: "LOGOUT",
      entity: "User",
      entityId: user.id,
      description: `تسجيل خروج: ${user.name}`,
    });
  }
  const res = NextResponse.json({ success: true });
  res.cookies.delete(SESSION_COOKIE_NAME);
  return res;
}
