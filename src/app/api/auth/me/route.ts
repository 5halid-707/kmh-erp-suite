// GET /api/auth/me - return current user info
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ user: null }, { status: 200 });
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
      lastLogin: user.lastLogin,
    },
    organization: {
      id: user.organization.id,
      name: user.organization.name,
      legalName: user.organization.legalName,
      currency: user.organization.currency,
      vatRate: user.organization.vatRate,
      taxNumber: user.organization.taxNumber,
    },
  });
}
