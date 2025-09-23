import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET: جلب منتج محدد
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

    const product = await prisma.product.findUnique({
      where: { id: params.id },
    });

    if (!product) {
      return NextResponse.json({ error: "المنتج غير موجود" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Products GET Error:", error);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}

// PUT: تعديل منتج (فقط الحقول الموجودة في schema)
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

    if (!["ADMIN", "QUALITY_MANAGER"].includes(session.user.role)) {
      return NextResponse.json({ error: "ليس لديك صلاحية" }, { status: 403 });
    }

    const body = await req.json();
    const { name, description, category } = body; // ✅ فقط الحقول الصحيحة

    const updatedProduct = await prisma.product.update({
      where: { id: params.id },
      data: { name, description, category },
    });

    // تسجيل العملية في Audit Log
    await prisma.auditLog.create({
      data: {
        action: "UPDATE_PRODUCT",
        targetId: updatedProduct.id,
        targetType: "PRODUCT",
        userId: session.user.id,
        details: `تم تعديل المنتج: ${updatedProduct.name}`,
      },
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error("Products PUT Error:", error);
    return NextResponse.json({ error: "تعذر تعديل المنتج" }, { status: 500 });
  }
}

// DELETE: حذف منتج
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

    if (!["ADMIN", "QUALITY_MANAGER"].includes(session.user.role)) {
      return NextResponse.json({ error: "ليس لديك صلاحية" }, { status: 403 });
    }

    const existingProduct = await prisma.product.findUnique({
      where: { id: params.id },
    });
    if (!existingProduct) {
      return NextResponse.json({ error: "المنتج غير موجود" }, { status: 404 });
    }

    await prisma.product.delete({ where: { id: params.id } });

    await prisma.auditLog.create({
      data: {
        action: "DELETE_PRODUCT",
        targetId: params.id,
        targetType: "PRODUCT",
        userId: session.user.id,
        details: `تم حذف المنتج: ${existingProduct.name}`,
      },
    });

    return NextResponse.json({ message: "تم حذف المنتج بنجاح" });
  } catch (error) {
    console.error("Products DELETE Error:", error);
    return NextResponse.json({ error: "تعذر حذف المنتج" }, { status: 500 });
  }
}
