// POS checkout - creates invoice + automated journal entry + stock movement
// Cross-module automation: Sale → Journal Entry → (COGS entry) → stock movement
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { logAction } from "@/lib/audit";

interface CheckoutItem {
  productId: string;
  quantity: number;
  unitPrice: number;
  vatRate: number;
}

interface CheckoutBody {
  items: CheckoutItem[];
  paymentMethod: "CASH" | "CARD" | "TRANSFER" | "WALLET" | "CREDIT" | "MIXED";
  customerId?: string | null;
  paidAmount?: number;
  salesRepId?: string;
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(["ADMIN", "CASHIER", "BRANCH_MANAGER"]);
  if (auth.error || !auth.user) {
    return NextResponse.json({ error: "غير مصرّح" }, { status: auth.status });
  }
  try {
    const body = (await req.json()) as CheckoutBody;
    if (!body.items || body.items.length === 0) {
      return NextResponse.json({ error: "السلة فارغة" }, { status: 400 });
    }

    const orgId = auth.user.organizationId;
    const org = await db.organization.findUnique({ where: { id: orgId } });
    if (!org) return NextResponse.json({ error: "المنشأة غير موجودة" }, { status: 500 });
    const branch = auth.user.branchId
      ? await db.branch.findUnique({ where: { id: auth.user.branchId } })
      : await db.branch.findFirst({ where: { organizationId: orgId } });
    if (!branch) return NextResponse.json({ error: "لا يوجد فرع" }, { status: 500 });

    // Validate all products
    const productIds = body.items.map((i) => i.productId);
    const products = await db.product.findMany({
      where: { id: { in: productIds }, organizationId: orgId },
    });

    if (products.length !== productIds.length) {
      return NextResponse.json({ error: "بعض المنتجات غير موجودة" }, { status: 400 });
    }

    // Calculate totals
    let subtotal = 0;
    let vatAmount = 0;
    const lineItems = body.items.map((item) => {
      const prod = products.find((p) => p.id === item.productId)!;
      const lineTotal = item.unitPrice * item.quantity;
      const lineVat = lineTotal * (item.vatRate / 100);
      subtotal += lineTotal;
      vatAmount += lineVat;
      return {
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discountPct: 0,
        vatRate: item.vatRate,
        lineTotal,
        costPrice: prod.costPrice,
      };
    });
    const grandTotal = subtotal + vatAmount;
    const paid = body.paidAmount ?? grandTotal;
    const change = Math.max(0, paid - grandTotal);

    // Generate sequential invoice number
    const year = new Date().getFullYear();
    const lastInvoice = await db.salesInvoice.findFirst({
      where: { invoiceNumber: { startsWith: `INV-${year}-` } },
      orderBy: { invoiceNumber: "desc" },
    });
    const nextNum = lastInvoice
      ? parseInt(lastInvoice.invoiceNumber.split("-")[2], 10) + 1
      : 1001;
    const invoiceNumber = `INV-${year}-${String(nextNum).padStart(5, "0")}`;

    // The logged-in user is the sales rep
    const salesRepUser = auth.user;
    const adminUser = auth.user; // for journal entry createdBy

    // Get accounting references
    const [cashAccount, salesAccount, vatAccount, cogsAccount, invAccount] = await Promise.all([
      db.account.findFirst({ where: { organizationId: orgId, code: "1101" } }),
      db.account.findFirst({ where: { organizationId: orgId, code: "4100" } }),
      db.account.findFirst({ where: { organizationId: orgId, code: "2200" } }),
      db.account.findFirst({ where: { organizationId: orgId, code: "5000" } }),
      db.account.findFirst({ where: { organizationId: orgId, code: "1300" } }),
    ]);

    if (!cashAccount || !salesAccount || !vatAccount || !cogsAccount || !invAccount) {
      return NextResponse.json({ error: "إعداد دليل الحسابات غير مكتمل" }, { status: 500 });
    }

    // Use a transaction to ensure atomicity across all 3 modules
    const result = await db.$transaction(async (tx) => {
      // 1) Create the invoice
      const invoice = await tx.salesInvoice.create({
        data: {
          organizationId: orgId,
          branchId: branch.id,
          invoiceNumber,
          customerId: body.customerId || null,
          salesRepId: salesRepUser.id,
          status: "COMPLETED",
          paymentMethod: body.paymentMethod,
          subtotal,
          discountAmount: 0,
          vatAmount,
          grandTotal,
          paidAmount: paid,
          changeAmount: change,
          invoiceDate: new Date(),
          items: {
            create: lineItems.map((li) => ({
              productId: li.productId,
              quantity: li.quantity,
              unitPrice: li.unitPrice,
              discountPct: 0,
              vatRate: li.vatRate,
              lineTotal: li.lineTotal,
            })),
          },
        },
        include: { items: { include: { product: true } } },
      });

      // 2) Auto-generate the sales journal entry
      const jeCount = await tx.journalEntry.count();
      const entryNumber = `JE-${year}-${String(jeCount + 1).padStart(5, "0")}`;
      await tx.journalEntry.create({
        data: {
          organizationId: orgId,
          entryNumber,
          reference: invoiceNumber,
          description: `قيد مبيعات فاتورة ${invoiceNumber}`,
          totalDebit: grandTotal,
          totalCredit: grandTotal,
          entryDate: new Date(),
          postedAt: new Date(),
          source: "SALES_INVOICE",
          createdById: adminUser.id,
          lines: {
            create: [
              { accountId: cashAccount.id, debit: grandTotal, credit: 0, description: "إثبات تحصيل المبيعات" },
              { accountId: salesAccount.id, debit: 0, credit: subtotal, description: "إيراد المبيعات" },
              { accountId: vatAccount.id, debit: 0, credit: vatAmount, description: "ضريبة القيمة المضافة المستحقة" },
            ],
          },
        },
      });

      // 3) Auto-generate COGS entry (cost of goods sold)
      const totalCost = lineItems.reduce((s, li) => s + li.costPrice * li.quantity, 0);
      if (totalCost > 0) {
        await tx.journalEntry.create({
          data: {
            organizationId: orgId,
            entryNumber: `JE-${year}-${String(jeCount + 2).padStart(5, "0")}-COGS`,
            reference: invoiceNumber,
            description: `قيد تكلفة بضاعة مباعة - فاتورة ${invoiceNumber}`,
            totalDebit: totalCost,
            totalCredit: totalCost,
            entryDate: new Date(),
            postedAt: new Date(),
            source: "SALES_INVOICE",
            createdById: adminUser.id,
            lines: {
              create: [
                { accountId: cogsAccount.id, debit: totalCost, credit: 0, description: "تكلفة البضاعة المباعة" },
                { accountId: invAccount.id, debit: 0, credit: totalCost, description: "إخراج بضاعة من المخزون" },
              ],
            },
          },
        });
      }

      // 4) Auto-create stock movements for inventory tracking
      for (const li of lineItems) {
        await tx.stockMovement.create({
          data: {
            organizationId: orgId,
            branchId: branch.id,
            productId: li.productId,
            type: "SALE_OUT",
            quantity: li.quantity,
            reference: invoiceNumber,
            balanceAfter: 0, // simplified - would compute from running balance
            notes: `صادر من بيع فاتورة ${invoiceNumber}`,
          },
        });
      }

      // 5) Update account balances
      await tx.account.update({
        where: { id: cashAccount.id },
        data: { balance: { increment: grandTotal } },
      });
      await tx.account.update({
        where: { id: salesAccount.id },
        data: { balance: { increment: subtotal } },
      });
      await tx.account.update({
        where: { id: vatAccount.id },
        data: { balance: { increment: vatAmount } },
      });
      if (totalCost > 0) {
        await tx.account.update({
          where: { id: cogsAccount.id },
          data: { balance: { increment: totalCost } },
        });
        await tx.account.update({
          where: { id: invAccount.id },
          data: { balance: { decrement: totalCost } },
        });
      }

      // 6) Update customer loyalty points (1 point per 10 SAR)
      if (body.customerId) {
        await tx.customer.update({
          where: { id: body.customerId },
          data: { loyaltyPoints: { increment: Math.floor(grandTotal / 10) } },
        });
      }

      return invoice;
    });

    // Audit log
    await logAction({
      organizationId: orgId,
      userId: auth.user.id,
      action: "CREATE",
      entity: "SalesInvoice",
      entityId: result.id,
      description: `فاتورة بيع ${result.invoiceNumber} بقيمة ${grandTotal.toFixed(2)} ${org.currency} (${body.paymentMethod})`,
      metadata: {
        invoiceNumber: result.invoiceNumber,
        total: grandTotal,
        paymentMethod: body.paymentMethod,
        itemsCount: lineItems.length,
      },
      ipAddress: req.headers.get("x-forwarded-for")?.split(",")[0] || null,
    });

    return NextResponse.json({
      success: true,
      invoice: {
        id: result.id,
        number: result.invoiceNumber,
        subtotal,
        vat: vatAmount,
        total: grandTotal,
        paid,
        change,
        date: result.invoiceDate,
        items: result.items.map((it) => ({
          name: it.product.name,
          qty: it.quantity,
          price: it.unitPrice,
          total: it.lineTotal,
        })),
      },
      automation: {
        journalEntries: 2,
        stockMovements: lineItems.length,
        accountUpdates: total_cost_updates_count(lineItems),
      },
    });
  } catch (e: any) {
    console.error("[checkout] error:", e);
    return NextResponse.json({ error: e.message || "فشل إتمام البيع" }, { status: 500 });
  }
}

function total_cost_updates_count(items: { costPrice: number; quantity: number }[]): number {
  const totalCost = items.reduce((s, i) => s + i.costPrice * i.quantity, 0);
  return totalCost > 0 ? 4 : 2; // cash + sales + vat + (cogs + inv if cost>0)
}
