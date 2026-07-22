// /api/categories - CRUD
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { logAction } from "@/lib/audit";

export async function GET() {
  const auth = await requireAuth();
  if (auth.error || !auth.user) return NextResponse.json({ error: "غير مصرّح" }, { status: auth.status });
  const cats = await db.category.findMany({
    where: { organizationId: auth.user.organizationId },
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });
  return NextResponse.json({
    categories: cats.map((c) => ({
      id: c.id, name: c.name, parentId: c.parentId,
      productCount: c._count.products, createdAt: c.createdAt,
    })),
  });
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(["ADMIN", "INVENTORY_MANAGER"]);
  if (auth.error || !auth.user) return NextResponse.json({ error: "غير مصرّح" }, { status: auth.status });
  try {
    const body = await req.json();
    const { name, parentId } = body;
    if (!name) return NextResponse.json({ error: "الاسم مطلوب" }, { status: 400 });
    const cat = await db.category.create({
      data: {
        organizationId: auth.user.organizationId,
        name, parentId: parentId || null,
      },
    });
    await logAction({
      organizationId: auth.user.organizationId, userId: auth.user.id,
      action: "CREATE", entity: "Category", entityId: cat.id,
      description: `إضافة فئة: ${cat.name}`,
    });
    return NextResponse.json({ success: true, categoryId: cat.id });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
