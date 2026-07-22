// /api/employees - CRUD (HR_MANAGER + ADMIN write)
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { logAction } from "@/lib/audit";

export async function GET() {
  const auth = await requireAuth();
  if (auth.error || !auth.user) {
    return NextResponse.json({ error: "غير مصرّح" }, { status: auth.status });
  }
  const employees = await db.employee.findMany({
    where: { organizationId: auth.user.organizationId },
    include: { branch: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({
    employees: employees.map((e) => ({
      id: e.id,
      employeeCode: e.employeeCode,
      fullName: e.fullName,
      nationalId: e.nationalId,
      phone: e.phone,
      email: e.email,
      position: e.position,
      department: e.department,
      hireDate: e.hireDate,
      terminationDate: e.terminationDate,
      baseSalary: e.baseSalary,
      allowances: e.allowances,
      status: e.status,
      bankAccount: e.bankAccount,
      iban: e.iban,
      branchId: e.branchId,
      branch: e.branch?.name || null,
      createdAt: e.createdAt,
    })),
  });
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(["ADMIN", "HR_MANAGER"]);
  if (auth.error || !auth.user) {
    return NextResponse.json({ error: "غير مصرّح" }, { status: auth.status });
  }
  try {
    const body = await req.json();
    const { employeeCode, fullName, nationalId, phone, email, position, department, hireDate, baseSalary, allowances, branchId, bankAccount, iban } = body;
    if (!employeeCode || !fullName || !position) {
      return NextResponse.json({ error: "كود الموظف، الاسم، والمنصب مطلوبة" }, { status: 400 });
    }
    const existing = await db.employee.findFirst({
      where: { organizationId: auth.user.organizationId, OR: [{ employeeCode }, ...(nationalId ? [{ nationalId }] : [])] },
    });
    if (existing) {
      return NextResponse.json({ error: "كود الموظف أو رقم الهوية مستخدم بالفعل" }, { status: 400 });
    }
    const emp = await db.employee.create({
      data: {
        organizationId: auth.user.organizationId,
        branchId: branchId || auth.user.branchId || null,
        employeeCode,
        fullName,
        nationalId: nationalId || null,
        phone: phone || null,
        email: email || null,
        position,
        department: department || null,
        hireDate: hireDate ? new Date(hireDate) : new Date(),
        baseSalary: parseFloat(baseSalary) || 0,
        allowances: parseFloat(allowances) || 0,
        bankAccount: bankAccount || null,
        iban: iban || null,
      },
    });
    await logAction({
      organizationId: auth.user.organizationId,
      userId: auth.user.id,
      action: "CREATE",
      entity: "Employee",
      entityId: emp.id,
      description: `إضافة موظف: ${emp.fullName} (${emp.employeeCode}) - ${emp.position}`,
    });
    return NextResponse.json({ success: true, employeeId: emp.id });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
