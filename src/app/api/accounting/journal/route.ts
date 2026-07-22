// Accounting: journal entries list with lines
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getFirstOrg } from "@/lib/erp-helpers";

export async function GET(req: NextRequest) {
  const org = await getFirstOrg();
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
