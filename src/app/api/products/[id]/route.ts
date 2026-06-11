import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getUserFacilityIds } from "@/lib/permissions";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

    const product = await prisma.product.findUnique({ where: { id: params.id } });
    if (!product) return NextResponse.json({ error: "المنتج غير موجود" }, { status: 404 });

    if (product.facilityId) {
      const facilityIds = await getUserFacilityIds(session.user.id, session.user.role);
      if (facilityIds !== null && !facilityIds.includes(product.facilityId)) {
        return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
      }
    }

    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

    const existing = await prisma.product.findUnique({ where: { id: params.id } });
    if (!existing) return NextResponse.json({ error: "المنتج غير موجود" }, { status: 404 });

    const facilityIds = await getUserFacilityIds(session.user.id, session.user.role);
    if (facilityIds !== null && existing.facilityId && !facilityIds.includes(existing.facilityId)) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    const body = await req.json();
    const { name, description, category } = body;

    const updated = await prisma.product.update({
      where: { id: params.id },
      data: { name, description, category },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "تعذر تعديل المنتج" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

    const existing = await prisma.product.findUnique({ where: { id: params.id } });
    if (!existing) return NextResponse.json({ error: "المنتج غير موجود" }, { status: 404 });

    const facilityIds = await getUserFacilityIds(session.user.id, session.user.role);
    if (facilityIds !== null && existing.facilityId && !facilityIds.includes(existing.facilityId)) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    await prisma.product.delete({ where: { id: params.id } });

    await prisma.auditLog.create({
      data: {
        action: "DELETE_PRODUCT",
        targetId: params.id,
        targetType: "PRODUCT",
        userId: session.user.id,
        details: `تم حذف المنتج: ${existing.name}`,
      },
    });

    return NextResponse.json({ message: "تم حذف المنتج بنجاح" });
  } catch (error) {
    return NextResponse.json({ error: "تعذر حذف المنتج" }, { status: 500 });
  }
}