// POS checkout - creates invoice + automated journal entry + stock movement
// Cross-module automation: Sale → Journal Entry → (COGS entry) → stock movement
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getFirstOrg, getMainBranch } from "@/lib/erp-helpers";

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
  try {
    const body = (await req.json()) as CheckoutBody;
    if (!body.items || body.items.length === 0) {
      return NextResponse.json({ error: "السلة فارغة" }, { status: 400 });
    }

    const org = await getFirstOrg();
    const branch = await getMainBranch();

    // Validate all products
    const productIds = body.items.map((i) => i.productId);
    const products = await db.product.findMany({
      where: { id: { in: productIds }, organizationId: org.id },
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

    // Find cashier user (first user with CASHIER role)
    const cashier = body.salesRepId
      ? await db.user.findUnique({ where: { id: body.salesRepId } })
      : await db.user.findFirst({
          where: { organizationId: org.id, role: "CASHIER" },
        });

    // Get accounting references
    const [cashAccount, salesAccount, vatAccount, cogsAccount, invAccount, adminUser] = await Promise.all([
      db.account.findFirst({ where: { organizationId: org.id, code: "1101" } }),
      db.account.findFirst({ where: { organizationId: org.id, code: "4100" } }),
      db.account.findFirst({ where: { organizationId: org.id, code: "2200" } }),
      db.account.findFirst({ where: { organizationId: org.id, code: "5000" } }),
      db.account.findFirst({ where: { organizationId: org.id, code: "1300" } }),
      db.user.findFirst({ where: { organizationId: org.id, role: "ADMIN" } }),
    ]);

    if (!cashAccount || !salesAccount || !vatAccount || !cogsAccount || !invAccount || !adminUser) {
      return NextResponse.json({ error: "إعداد دليل الحسابات غير مكتمل" }, { status: 500 });
    }

    // Use a transaction to ensure atomicity across all 3 modules
    const result = await db.$transaction(async (tx) => {
      // 1) Create the invoice
      const invoice = await tx.salesInvoice.create({
        data: {
          organizationId: org.id,
          branchId: branch.id,
          invoiceNumber,
          customerId: body.customerId || null,
          salesRepId: cashier?.id || adminUser.id,
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
          organizationId: org.id,
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
            organizationId: org.id,
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
            organizationId: org.id,
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
