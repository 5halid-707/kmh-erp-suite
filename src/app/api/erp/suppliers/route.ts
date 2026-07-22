// ERP: suppliers list
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  const auth = await requireAuth();
  if (auth.error || !auth.user) return NextResponse.json({ error: "غير مصرّح" }, { status: auth.status });
  const org = { id: auth.user.organizationId };
  const suppliers = await db.supplier.findMany({
    where: { organizationId: org.id },
    include: {
      _count: { select: { purchaseOrders: true } },
    },
    orderBy: { name: "asc" },
  });
  return NextResponse.json({
    suppliers: suppliers.map((s) => ({
      id: s.id,
      name: s.name,
      contactPerson: s.contactPerson,
      phone: s.phone,
      email: s.email,
      city: s.city,
      paymentTerms: s.paymentTerms,
      balanceDue: s.balanceDue,
      poCount: s._count.purchaseOrders,
    })),
  });
}
