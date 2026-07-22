// /api/admin/settings - organization settings (ADMIN only)
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { logAction } from "@/lib/audit";

export async function GET() {
  const auth = await requireAuth(["ADMIN"]);
  if (auth.error || !auth.user) {
    return NextResponse.json({ error: "غير مصرّح" }, { status: auth.status });
  }
  const org = await db.organization.findUnique({
    where: { id: auth.user.organizationId },
    include: { branches: true },
  });
  return NextResponse.json({ organization: org });
}

export async function PATCH(req: NextRequest) {
  const auth = await requireAuth(["ADMIN"]);
  if (auth.error || !auth.user) {
    return NextResponse.json({ error: "غير مصرّح" }, { status: auth.status });
  }
  try {
    const body = await req.json();
    const allowed = ["name", "legalName", "taxNumber", "currency", "vatRate", "address", "city", "phone", "email"];
    const data: any = {};
    for (const k of allowed) {
      if (body[k] !== undefined) data[k] = body[k];
    }
    const updated = await db.organization.update({
      where: { id: auth.user.organizationId },
      data,
    });
    await logAction({
      organizationId: auth.user.organizationId,
      userId: auth.user.id,
      action: "UPDATE",
      entity: "Organization",
      entityId: updated.id,
      description: `تحديث إعدادات المنشأة: ${Object.keys(data).join(", ")}`,
      metadata: { updatedFields: Object.keys(data) },
    });
    return NextResponse.json({ success: true, organization: updated });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
