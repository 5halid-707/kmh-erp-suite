// /api/admin/audit - audit log viewer (ADMIN only)
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const auth = await requireAuth(["ADMIN"]);
  if (auth.error || !auth.user) {
    return NextResponse.json({ error: "غير مصرّح" }, { status: auth.status });
  }
  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get("limit") || "50", 10);
  const entity = searchParams.get("entity");
  const action = searchParams.get("action");

  const where: any = { organizationId: auth.user.organizationId };
  if (entity) where.entity = entity;
  if (action) where.action = action;

  const logs = await db.auditLog.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { user: { select: { name: true, email: true } } },
  });

  return NextResponse.json({
    logs: logs.map((l) => ({
      id: l.id,
      action: l.action,
      entity: l.entity,
      entityId: l.entityId,
      description: l.description,
      metadata: l.metadata ? JSON.parse(l.metadata) : null,
      ipAddress: l.ipAddress,
      createdAt: l.createdAt,
      user: l.user ? { name: l.user.name, email: l.user.email } : null,
    })),
  });
}
