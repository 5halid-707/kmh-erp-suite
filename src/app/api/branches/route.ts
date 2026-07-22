// /api/branches - CRUD
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { logAction } from "@/lib/audit";

export async function GET() {
  const auth = await requireAuth();
  if (auth.error || !auth.user) return NextResponse.json({ error: "غير مصرّح" }, { status: auth.status });
  const branches = await db.branch.findMany({
    where: { organizationId: auth.user.organizationId },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json({ branches });
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(["ADMIN"]);
  if (auth.error || !auth.user) return NextResponse.json({ error: "غير مصرّح" }, { status: auth.status });
  try {
    const body = await req.json();
    const { name, code, address, city, phone } = body;
    if (!name || !code) return NextResponse.json({ error: "الاسم والكود مطلوبان" }, { status: 400 });
    const existing = await db.branch.findFirst({
      where: { organizationId: auth.user.organizationId, code },
    });
    if (existing) return NextResponse.json({ error: "كود الفرع مستخدم بالفعل" }, { status: 400 });
    const branch = await db.branch.create({
      data: {
        organizationId: auth.user.organizationId,
        name, code, address: address || null, city: city || null, phone: phone || null,
      },
    });
    await logAction({
      organizationId: auth.user.organizationId, userId: auth.user.id,
      action: "CREATE", entity: "Branch", entityId: branch.id,
      description: `إضافة فرع: ${branch.name} (${branch.code})`,
    });
    return NextResponse.json({ success: true, branchId: branch.id });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
