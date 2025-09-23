import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// DELETE حذف منتج حسب الـ id
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

    if (!["ADMIN", "QUALITY_MANAGER"].includes(session.user.role)) {
      return NextResponse.json({ error: "ليس لديك صلاحية" }, { status: 403 });
    }

    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: "معرف المنتج مطلوب" }, { status: 400 });
    }

    // تحقق أن المنتج موجود قبل الحذف (اختياري)
    const existingProduct = await prisma.product.findUnique({ where: { id } });
    if (!existingProduct) {
      return NextResponse.json({ error: "المنتج غير موجود" }, { status: 404 });
    }

    await prisma.product.delete({ where: { id } });

    return NextResponse.json({ message: "تم حذف المنتج بنجاح" }, { status: 200 });
  } catch (error) {
    console.error("Products DELETE Error:", error);
    return NextResponse.json({ error: "تعذر حذف المنتج" }, { status: 500 });
  }
}
