// /api/employees/[id] - update + delete
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { logAction } from "@/lib/audit";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(["ADMIN", "HR_MANAGER"]);
  if (auth.error || !auth.user) {
    return NextResponse.json({ error: "غير مصرّح" }, { status: auth.status });
  }
  try {
    const { id } = await params;
    const body = await req.json();
    const existing = await db.employee.findFirst({ where: { id, organizationId: auth.user.organizationId } });
    if (!existing) return NextResponse.json({ error: "الموظف غير موجود" }, { status: 404 });

    const allowed = ["employeeCode", "fullName", "nationalId", "phone", "email", "position", "department", "hireDate", "terminationDate", "baseSalary", "allowances", "status", "bankAccount", "iban", "branchId"];
    const data: any = {};
    for (const k of allowed) {
      if (body[k] !== undefined) {
        if (["baseSalary", "allowances"].includes(k)) data[k] = parseFloat(body[k]);
        else if (k === "hireDate" || k === "terminationDate") data[k] = body[k] ? new Date(body[k]) : null;
        else data[k] = body[k];
      }
    }
    const updated = await db.employee.update({ where: { id }, data });
    await logAction({
      organizationId: auth.user.organizationId,
      userId: auth.user.id,
      action: "UPDATE",
      entity: "Employee",
      entityId: id,
      description: `تحديث موظف: ${updated.fullName}`,
      metadata: { updatedFields: Object.keys(data) },
    });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(["ADMIN", "HR_MANAGER"]);
  if (auth.error || !auth.user) {
    return NextResponse.json({ error: "غير مصرّح" }, { status: auth.status });
  }
  try {
    const { id } = await params;
    const existing = await db.employee.findFirst({ where: { id, organizationId: auth.user.organizationId } });
    if (!existing) return NextResponse.json({ error: "الموظف غير موجود" }, { status: 404 });

    // Hard delete (employee records kept in audit/payroll)
    await db.employee.delete({ where: { id } });
    await logAction({
      organizationId: auth.user.organizationId,
      userId: auth.user.id,
      action: "DELETE",
      entity: "Employee",
      entityId: id,
      description: `حذف موظف: ${existing.fullName} (${existing.employeeCode})`,
    });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
