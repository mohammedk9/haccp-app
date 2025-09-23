// src/app/api/facilities/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PublicUser } from "@/types/user";

interface Params {
  id: string;
}

// GET منشأة محددة
export async function GET(req: NextRequest, { params }: { params: Params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const facility = await prisma.facility.findUnique({
      where: { id: params.id },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } }, // المالك
        hazards: true,
        ccps: true,
      },
    });

    if (!facility) {
      return NextResponse.json({ error: "المنشأة غير موجودة" }, { status: 404 });
    }

    return NextResponse.json(facility);
  } catch (error) {
    console.error("Facility GET Error:", error);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}

// PUT تحديث منشأة
export async function PUT(req: NextRequest, { params }: { params: Params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    if (!["ADMIN", "QUALITY_MANAGER"].includes(session.user.role)) {
      return NextResponse.json({ error: "ليس لديك صلاحية" }, { status: 403 });
    }

    const body = await req.json();
    const { name, location, type, description } = body;

    const facility = await prisma.facility.update({
      where: { id: params.id },
      data: { name, location, type, description },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "UPDATE_FACILITY",
        targetId: facility.id,
        targetType: "FACILITY",
        userId: session.user.id,
        details: `تم تحديث منشأة: ${name}`,
      },
    });

    return NextResponse.json(facility);
  } catch (error) {
    console.error("Facility PUT Error:", error);
    return NextResponse.json({ error: "خطأ في تحديث المنشأة" }, { status: 500 });
  }
}

// DELETE حذف منشأة
export async function DELETE(req: NextRequest, { params }: { params: Params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "ليس لديك صلاحية" }, { status: 403 });
    }

    const facility = await prisma.facility.delete({
      where: { id: params.id },
    });

    await prisma.auditLog.create({
      data: {
        action: "DELETE_FACILITY",
        targetId: params.id,
        targetType: "FACILITY",
        userId: session.user.id,
        details: `تم حذف منشأة: ${facility.name}`,
      },
    });

    return NextResponse.json({ message: "تم حذف المنشأة" });
  } catch (error) {
    console.error("Facility DELETE Error:", error);
    return NextResponse.json({ error: "خطأ في حذف المنشأة" }, { status: 500 });
  }
}
