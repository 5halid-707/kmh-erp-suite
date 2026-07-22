// /api/stock-movements - list all stock movements (in/out) for audit
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  const auth = await requireAuth();
  if (auth.error || !auth.user) {
    return NextResponse.json({ error: "غير مصرّح" }, { status: auth.status });
  }
  const moves = await db.stockMovement.findMany({
    where: { organizationId: auth.user.organizationId },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      product: { select: { name: true, sku: true } },
      branch: { select: { name: true } },
    },
  });
  return NextResponse.json({
    movements: moves.map((m) => ({
      id: m.id,
      type: m.type,
      quantity: m.quantity,
      reference: m.reference,
      notes: m.notes,
      createdAt: m.createdAt,
      product: m.product.name,
      sku: m.product.sku,
      branch: m.branch?.name || "—",
    })),
  });
}
