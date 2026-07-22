// HR: list employees with branch + department + status
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getFirstOrg } from "@/lib/erp-helpers";

export async function GET() {
  const org = await getFirstOrg();
  const employees = await db.employee.findMany({
    where: { organizationId: org.id },
    include: { branch: { select: { name: true } } },
    orderBy: { employeeCode: "asc" },
  });

  // Compute attendance summary for last 30 days
  const thirtyAgo = new Date();
  thirtyAgo.setDate(thirtyAgo.getDate() - 30);

  const result = [];
  for (const emp of employees) {
    const attendance = await db.attendance.groupBy({
      by: ["status"],
      where: { employeeId: emp.id, date: { gte: thirtyAgo } },
      _count: true,
    });
    const pendingLeaves = await db.leaveRequest.count({
      where: { employeeId: emp.id, status: "PENDING" },
    });
    const attMap: Record<string, number> = {};
    attendance.forEach((a) => (attMap[a.status] = a._count));
    result.push({
      id: emp.id,
      code: emp.employeeCode,
      name: emp.fullName,
      phone: emp.phone,
      email: emp.email,
      position: emp.position,
      department: emp.department,
      branch: emp.branch?.name || "-",
      baseSalary: emp.baseSalary,
      allowances: emp.allowances,
      status: emp.status,
      hireDate: emp.hireDate,
      attendance30Days: attMap,
      pendingLeaves,
    });
  }
  return NextResponse.json({ employees: result });
}
