// Accounting: chart of accounts tree + balances
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  const auth = await requireAuth();
  if (auth.error || !auth.user) return NextResponse.json({ error: "غير مصرّح" }, { status: auth.status });
  const org = { id: auth.user.organizationId };

  const accounts = await db.account.findMany({
    where: { organizationId: org.id },
    orderBy: { code: "asc" },
  });

  // Trial balance: compute debit/credit per account from journal lines
  const journalAgg = await db.journalLine.groupBy({
    by: ["accountId"],
    _sum: { debit: true, credit: true },
  });
  const balMap = new Map<string, { debit: number; credit: number }>();
  for (const j of journalAgg) {
    balMap.set(j.accountId, {
      debit: j._sum.debit || 0,
      credit: j._sum.credit || 0,
    });
  }

  // Group accounts by type for the trial balance
  const byType: Record<string, typeof accounts> = {
    ASSET: [],
    LIABILITY: [],
    EQUITY: [],
    REVENUE: [],
    EXPENSE: [],
    COST_OF_SALES: [],
  };
  for (const a of accounts) {
    if (!a.isGroup && byType[a.type]) byType[a.type].push(a);
  }

  const result = (byType.ASSET).map((a) => ({
    code: a.code,
    name: a.name,
    type: a.type,
    debit: balMap.get(a.id)?.debit || 0,
    credit: balMap.get(a.id)?.credit || 0,
    balance: (balMap.get(a.id)?.debit || 0) - (balMap.get(a.id)?.credit || 0),
  })).concat(
    (byType.LIABILITY).map((a) => ({
      code: a.code, name: a.name, type: a.type,
      debit: balMap.get(a.id)?.debit || 0,
      credit: balMap.get(a.id)?.credit || 0,
      balance: (balMap.get(a.id)?.credit || 0) - (balMap.get(a.id)?.debit || 0),
    }))
  ).concat(
    (byType.EQUITY).map((a) => ({
      code: a.code, name: a.name, type: a.type,
      debit: balMap.get(a.id)?.debit || 0,
      credit: balMap.get(a.id)?.credit || 0,
      balance: (balMap.get(a.id)?.credit || 0) - (balMap.get(a.id)?.debit || 0),
    }))
  ).concat(
    (byType.REVENUE).map((a) => ({
      code: a.code, name: a.name, type: a.type,
      debit: balMap.get(a.id)?.debit || 0,
      credit: balMap.get(a.id)?.credit || 0,
      balance: (balMap.get(a.id)?.credit || 0) - (balMap.get(a.id)?.debit || 0),
    }))
  ).concat(
    (byType.EXPENSE).map((a) => ({
      code: a.code, name: a.name, type: a.type,
      debit: balMap.get(a.id)?.debit || 0,
      credit: balMap.get(a.id)?.credit || 0,
      balance: (balMap.get(a.id)?.debit || 0) - (balMap.get(a.id)?.credit || 0),
    }))
  ).concat(
    (byType.COST_OF_SALES).map((a) => ({
      code: a.code, name: a.name, type: a.type,
      debit: balMap.get(a.id)?.debit || 0,
      credit: balMap.get(a.id)?.credit || 0,
      balance: (balMap.get(a.id)?.debit || 0) - (balMap.get(a.id)?.credit || 0),
    }))
  );

  return NextResponse.json({
    accounts: result,
    rawAccounts: accounts.map((a) => ({ id: a.id, code: a.code, name: a.name, type: a.type, isGroup: a.isGroup, parentId: a.parentId })),
  });
}
