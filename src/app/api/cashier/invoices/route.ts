// List recent invoices for cashier module
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  const auth = await requireAuth();
  if (auth.error || !auth.user) return NextResponse.json({ error: "غير مصرّح" }, { status: auth.status });
  const org = { id: auth.user.organizationId };
  const invoices = await db.salesInvoice.findMany({
    where: { organizationId: org.id, status: "COMPLETED" },
    orderBy: { invoiceDate: "desc" },
    take: 50,
    include: {
      customer: { select: { name: true } },
      salesRep: { select: { name: true } },
      items: { include: { product: { select: { name: true, sku: true } } } },
    },
  });
  return NextResponse.json({ invoices });
}
