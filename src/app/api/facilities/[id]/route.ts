import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getUserFacilityIds } from "@/lib/permissions";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

    const facilityIds = await getUserFacilityIds(session.user.id, session.user.role);
    if (facilityIds !== null && !facilityIds.includes(params.id)) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    const facility = await prisma.facility.findUnique({
      where: { id: params.id },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
        hazards: true,
        ccps: true,
      },
    });

    if (!facility) return NextResponse.json({ error: "المنشأة غير موجودة" }, { status: 404 });
    return NextResponse.json(facility);
  } catch (error) {
    console.error("Facility GET Error:", error);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

    const facilityIds = await getUserFacilityIds(session.user.id, session.user.role);
    if (facilityIds !== null && !facilityIds.includes(params.id)) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    const body = await req.json();
    const { name, location, type, description } = body;

    const facility = await prisma.facility.update({
      where: { id: params.id },
      data: { name, location, type, description },
      include: { user: { select: { id: true, name: true, email: true, role: true } } },
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

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

    const facilityIds = await getUserFacilityIds(session.user.id, session.user.role);
    if (facilityIds !== null && !facilityIds.includes(params.id)) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    const facility = await prisma.facility.delete({ where: { id: params.id } });

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