// /api/employees/[id]/terminate - Terminate employee contract (keeps record)
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { logAction } from "@/lib/audit";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(["ADMIN", "HR_MANAGER"]);
  if (auth.error || !auth.user) {
    return NextResponse.json({ error: "غير مصرّح" }, { status: auth.status });
  }
  try {
    const { id } = await params;
    const body = await req.json();
    const { terminationDate, reason } = body;

    const existing = await db.employee.findFirst({
      where: { id, organizationId: auth.user.organizationId },
    });
    if (!existing) {
      return NextResponse.json({ error: "الموظف غير موجود" }, { status: 404 });
    }
    if (existing.status === "TERMINATED") {
      return NextResponse.json({ error: "الموظف منتهي العقد بالفعل" }, { status: 400 });
    }

    const updated = await db.employee.update({
      where: { id },
      data: {
        status: "TERMINATED",
        terminationDate: terminationDate ? new Date(terminationDate) : new Date(),
        terminationReason: reason || null,
      },
    });

    await logAction({
      organizationId: auth.user.organizationId,
      userId: auth.user.id,
      action: "UPDATE",
      entity: "Employee",
      entityId: id,
      description: `إنهاء عقد الموظف: ${updated.fullName} (${updated.employeeCode}) — السبب: ${reason || "غير محدد"}`,
      metadata: { terminationDate, reason },
      ipAddress: req.headers.get("x-forwarded-for")?.split(",")[0] || null,
    });

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// Reactivate employee
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(["ADMIN", "HR_MANAGER"]);
  if (auth.error || !auth.user) {
    return NextResponse.json({ error: "غير مصرّح" }, { status: auth.status });
  }
  try {
    const { id } = await params;
    const existing = await db.employee.findFirst({
      where: { id, organizationId: auth.user.organizationId },
    });
    if (!existing) {
      return NextResponse.json({ error: "الموظف غير موجود" }, { status: 404 });
    }
    const updated = await db.employee.update({
      where: { id },
      data: {
        status: "ACTIVE",
        terminationDate: null,
        terminationReason: null,
      },
    });
    await logAction({
      organizationId: auth.user.organizationId,
      userId: auth.user.id,
      action: "UPDATE",
      entity: "Employee",
      entityId: id,
      description: `إعادة تفعيل الموظف: ${updated.fullName}`,
    });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
