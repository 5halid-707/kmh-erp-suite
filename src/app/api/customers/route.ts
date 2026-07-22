// /api/customers - CRUD
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { logAction } from "@/lib/audit";

export async function GET() {
  const auth = await requireAuth();
  if (auth.error || !auth.user) return NextResponse.json({ error: "غير مصرّح" }, { status: auth.status });
  const customers = await db.customer.findMany({
    where: { organizationId: auth.user.organizationId },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ customers });
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(["ADMIN", "CASHIER", "ACCOUNTANT", "BRANCH_MANAGER"]);
  if (auth.error || !auth.user) return NextResponse.json({ error: "غير مصرّح" }, { status: auth.status });
  try {
    const body = await req.json();
    const { name, phone, email, taxNumber, address, city, creditLimit } = body;
    if (!name) return NextResponse.json({ error: "الاسم مطلوب" }, { status: 400 });
    const cust = await db.customer.create({
      data: {
        organizationId: auth.user.organizationId,
        name, phone: phone || null, email: email || null,
        taxNumber: taxNumber || null, address: address || null,
        city: city || null, creditLimit: parseFloat(creditLimit) || 0,
      },
    });
    await logAction({
      organizationId: auth.user.organizationId, userId: auth.user.id,
      action: "CREATE", entity: "Customer", entityId: cust.id,
      description: `إضافة عميل: ${cust.name}`,
    });
    return NextResponse.json({ success: true, customerId: cust.id });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
