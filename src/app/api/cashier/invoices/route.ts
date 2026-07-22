// List recent invoices for cashier module
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getFirstOrg } from "@/lib/erp-helpers";

export async function GET() {
  const org = await getFirstOrg();
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
