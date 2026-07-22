// /api/suppliers - CRUD
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { logAction } from "@/lib/audit";

export async function GET() {
  const auth = await requireAuth();
  if (auth.error || !auth.user) return NextResponse.json({ error: "غير مصرّح" }, { status: auth.status });
  const suppliers = await db.supplier.findMany({
    where: { organizationId: auth.user.organizationId },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ suppliers });
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(["ADMIN", "INVENTORY_MANAGER", "ACCOUNTANT"]);
  if (auth.error || !auth.user) return NextResponse.json({ error: "غير مصرّح" }, { status: auth.status });
  try {
    const body = await req.json();
    const { name, contactPerson, phone, email, taxNumber, address, city, paymentTerms } = body;
    if (!name) return NextResponse.json({ error: "اسم المورد مطلوب" }, { status: 400 });
    const sup = await db.supplier.create({
      data: {
        organizationId: auth.user.organizationId,
        name, contactPerson: contactPerson || null, phone: phone || null,
        email: email || null, taxNumber: taxNumber || null, address: address || null,
        city: city || null, paymentTerms: paymentTerms || null,
      },
    });
    await logAction({
      organizationId: auth.user.organizationId, userId: auth.user.id,
      action: "CREATE", entity: "Supplier", entityId: sup.id,
      description: `إضافة مورد: ${sup.name}`,
    });
    return NextResponse.json({ success: true, supplierId: sup.id });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
