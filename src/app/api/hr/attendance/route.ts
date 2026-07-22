// HR: attendance summary
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getFirstOrg, daysAgo } from "@/lib/erp-helpers";

export async function GET() {
  const org = await getFirstOrg();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const last7 = daysAgo(7);

  const employees = await db.employee.findMany({
    where: { organizationId: org.id, status: "ACTIVE" },
    select: { id: true, fullName: true, employeeCode: true, position: true, department: true },
  });

  const result = [];
  for (const emp of employees) {
    const today = await db.attendance.findFirst({
      where: { employeeId: emp.id, date: { gte: todayStart } },
    });
    const last7Att = await db.attendance.findMany({
      where: { employeeId: emp.id, date: { gte: last7 } },
      orderBy: { date: "desc" },
    });
    const present7 = last7Att.filter((a) => a.status === "PRESENT" || a.status === "LATE").length;
    const absent7 = last7Att.filter((a) => a.status === "ABSENT").length;
    const overtime7 = last7Att.reduce((s, a) => s + (a.overtimeHours || 0), 0);
    result.push({
      ...emp,
      todayStatus: today?.status || "غياب",
      checkIn: today?.checkIn,
      checkOut: today?.checkOut,
      last7: { present: present7, absent: absent7, overtimeHours: overtime7 },
    });
  }
  return NextResponse.json({ attendance: result });
}
