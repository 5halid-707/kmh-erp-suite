// src/lib/audit.ts
// Audit log helper - call from any API route to record an action
import { db } from "@/lib/db";

export async function logAction(params: {
  organizationId: string;
  userId?: string | null;
  action: "CREATE" | "UPDATE" | "DELETE" | "LOGIN" | "LOGOUT" | "APPROVE" | "REJECT";
  entity: string;
  entityId?: string | null;
  description: string;
  metadata?: Record<string, any>;
  ipAddress?: string | null;
}) {
  try {
    await db.auditLog.create({
      data: {
        organizationId: params.organizationId,
        userId: params.userId || null,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId || null,
        description: params.description,
        metadata: params.metadata ? JSON.stringify(params.metadata) : null,
        ipAddress: params.ipAddress || null,
      },
    });
  } catch (e) {
    // Audit log should never fail the main operation
    console.error("[audit] failed to log:", e);
  }
}
