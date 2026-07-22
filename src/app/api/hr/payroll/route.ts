// HR: payroll - generate monthly payroll batch with GOSI deduction (auto)
// GOSI = 22% of salary (employer 12% + employee 10%) on Saudi employees; simplified to 10% employee deduction here
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getFirstOrg } from "@/lib/erp-helpers";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const month = parseInt(searchParams.get("month") || String(new Date().getMonth() + 1), 10);
  const year = parseInt(searchParams.get("year") || String(new Date().getFullYear()), 10);

  const org = await getFirstOrg();
  const employees = await db.employee.findMany({
    where: { organizationId: org.id, status: "ACTIVE" },
  });

  // Look for an existing batch
  const existing = await db.payrollBatch.findFirst({
    where: { month, year },
    include: { items: { include: { employee: true } } },
  });

  if (existing) {
    return NextResponse.json({ batch: existing });
  }

  // Auto-generate the batch with GOSI deduction
  const batchNumber = `PAY-${year}-${String(month).padStart(2, "0")}`;
  const items = employees.map((e) => {
    const gross = e.baseSalary + e.allowances;
    const gosiDeduction = Math.round(gross * 0.10 * 100) / 100; // 10% employee GOSI contribution
    const otherDeductions = 0;
    const loanDeduction = 0;
    const totalDeductions = gosiDeduction + otherDeductions + loanDeduction;
    const net = gross - totalDeductions;
    return {
      employeeId: e.id,
      baseSalary: e.baseSalary,
      allowances: e.allowances,
      overtimePay: 0,
      grossPay: gross,
      gosiDeduction,
      loanDeduction,
      otherDeductions,
      totalDeductions,
      netPay: net,
    };
  });

  const totalGross = items.reduce((s, i) => s + i.grossPay, 0);
  const totalDeductions = items.reduce((s, i) => s + i.totalDeductions, 0);
  const totalNet = items.reduce((s, i) => s + i.netPay, 0);

  const batch = await db.payrollBatch.create({
    data: {
      batchNumber,
      month,
      year,
      totalGross,
      totalDeductions,
      totalNet,
      status: "DRAFT",
      items: { create: items },
    },
    include: { items: { include: { employee: true } } },
  });

  return NextResponse.json({ batch, created: true });
}

export async function POST(req: NextRequest) {
  // Approve & post payroll - generates accounting journal entries automatically
  const { searchParams } = new URL(req.url);
  const month = parseInt(searchParams.get("month") || String(new Date().getMonth() + 1), 10);
  const year = parseInt(searchParams.get("year") || String(new Date().getFullYear()), 10);

  const org = await getFirstOrg();
  const batch = await db.payrollBatch.findFirst({
    where: { month, year },
    include: { items: true },
  });
  if (!batch) return NextResponse.json({ error: "Batch not found" }, { status: 404 });
  if (batch.status === "PAID") return NextResponse.json({ error: "Already paid" }, { status: 400 });

  const [salariesAccount, gosiLiabAccount, cashAccount, adminUser] = await Promise.all([
    db.account.findFirst({ where: { organizationId: org.id, code: "6100" } }),
    db.account.findFirst({ where: { organizationId: org.id, code: "2300" } }),
    db.account.findFirst({ where: { organizationId: org.id, code: "1101" } }),
    db.user.findFirst({ where: { organizationId: org.id, role: "ADMIN" } }),
  ]);

  if (!salariesAccount || !gosiLiabAccount || !cashAccount || !adminUser) {
    return NextResponse.json({ error: "Accounts not configured" }, { status: 500 });
  }

  await db.$transaction(async (tx) => {
    // Update batch status
    await tx.payrollBatch.update({
      where: { id: batch.id },
      data: { status: "PAID", processedAt: new Date() },
    });

    // Generate journal entry: Debit Salaries Expense / Credit Cash + Credit GOSI payable
    const jeCount = await tx.journalEntry.count();
    const entryNumber = `JE-PAY-${year}-${String(month).padStart(2, "0")}-${jeCount + 1}`;
    await tx.journalEntry.create({
      data: {
        organizationId: org.id,
        entryNumber,
        reference: batch.batchNumber,
        description: `سند صرف رواتب ${batch.batchNumber}`,
        totalDebit: batch.totalGross,
        totalCredit: batch.totalGross,
        entryDate: new Date(),
        postedAt: new Date(),
        source: "PAYROLL",
        createdById: adminUser.id,
        lines: {
          create: [
            // Debit salaries expense (full gross)
            { accountId: salariesAccount.id, debit: batch.totalGross, credit: 0, description: "إثبات مصروف الرواتب" },
            // Credit cash (net paid)
            { accountId: cashAccount.id, debit: 0, credit: batch.totalNet, description: "صرف الرواتب الصافية نقدًا" },
            // Credit GOSI payable (employee contribution)
            { accountId: gosiLiabAccount.id, debit: 0, credit: batch.totalDeductions, description: "التأمينات الاجتماعية المستحقة" },
          ],
        },
      },
    });

    // Update account balances
    await tx.account.update({
      where: { id: salariesAccount.id },
      data: { balance: { increment: batch.totalGross } },
    });
    await tx.account.update({
      where: { id: cashAccount.id },
      data: { balance: { decrement: batch.totalNet } },
    });
    await tx.account.update({
      where: { id: gosiLiabAccount.id },
      data: { balance: { increment: batch.totalDeductions } },
    });
  });

  return NextResponse.json({ success: true, message: "تم صرف الرواتب وتوليد القيود المحاسبية تلقائيًا" });
}
