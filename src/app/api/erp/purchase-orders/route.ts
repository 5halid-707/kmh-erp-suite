// ERP: purchase orders list
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getFirstOrg } from "@/lib/erp-helpers";

export async function GET() {
  const org = await getFirstOrg();
  const pos = await db.purchaseOrder.findMany({
    where: { organizationId: org.id },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      supplier: { select: { name: true, city: true } },
      items: { include: { product: { select: { name: true, sku: true } } } },
    },
  });
  return NextResponse.json({ purchaseOrders: pos });
}
