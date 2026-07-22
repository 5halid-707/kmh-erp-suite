// HR: leaves
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  const auth = await requireAuth();
  if (auth.error || !auth.user) return NextResponse.json({ error: "غير مصرّح" }, { status: auth.status });
  const org = { id: auth.user.organizationId };
  const leaves = await db.leaveRequest.findMany({
    where: { employee: { organizationId: org.id } },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { employee: { select: { fullName: true, employeeCode: true, position: true } } },
  });
  return NextResponse.json({ leaves });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { employeeId, type, startDate, endDate, daysCount, reason } = body;
    if (!employeeId || !type || !startDate || !endDate) {
      return NextResponse.json({ error: "بيانات ناقصة" }, { status: 400 });
    }
    const auth = await requireAuth();
  if (auth.error || !auth.user) return NextResponse.json({ error: "غير مصرّح" }, { status: auth.status });
  const org = { id: auth.user.organizationId };
    const leave = await db.leaveRequest.create({
      data: {
        employeeId,
        type,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        daysCount: parseFloat(daysCount),
        reason,
        status: "PENDING",
      },
    });
    return NextResponse.json({ success: true, leave });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status } = body;
    const leave = await db.leaveRequest.update({
      where: { id },
      data: { status },
    });
    return NextResponse.json({ success: true, leave });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
