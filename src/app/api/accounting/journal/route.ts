// Accounting: journal entries list with lines
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const auth = await requireAuth();
  if (auth.error || !auth.user) return NextResponse.json({ error: "غير مصرّح" }, { status: auth.status });
  const org = { id: auth.user.organizationId };
  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get("limit") || "30", 10);

  const entries = await db.journalEntry.findMany({
    where: { organizationId: org.id },
    orderBy: { entryDate: "desc" },
    take: limit,
    include: {
      lines: { include: { account: { select: { code: true, name: true } } } },
      createdBy: { select: { name: true } },
    },
  });
  return NextResponse.json({ entries });
}
