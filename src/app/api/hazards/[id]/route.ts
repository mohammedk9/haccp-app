// src/app/api/hazards/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// ✅ GET: جلب خطر واحد
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const hazard = await prisma.hazard.findUnique({
      where: { id: params.id },
      include: {
        facility: { select: { name: true } },
        user: { select: { id: true, name: true, email: true, role: true } },
      },
    });

    if (!hazard) {
      return NextResponse.json({ error: "الخطر غير موجود" }, { status: 404 });
    }

    return NextResponse.json(hazard);
  } catch (error) {
    console.error("Hazard GET Error:", error);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}

// ✅ PUT: تحديث خطر
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    if (!["ADMIN", "QUALITY_MANAGER"].includes(session.user.role)) {
      return NextResponse.json({ error: "ليس لديك صلاحية" }, { status: 403 });
    }

    const body = await req.json();
    const { name, type, description, severity, facilityId } = body;

    const updatedHazard = await prisma.hazard.update({
      where: { id: params.id },
      data: {
        name,
        type,
        description,
        severity,
        facility: facilityId ? { connect: { id: facilityId } } : undefined,
      },
      include: {
        facility: { select: { name: true } },
        user: { select: { id: true, name: true, email: true, role: true } },
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "UPDATE_HAZARD",
        targetId: updatedHazard.id,
        targetType: "HAZARD",
        userId: session.user.id,
        details: `تم تحديث خطر: ${updatedHazard.name}`,
      },
    });

    return NextResponse.json(updatedHazard);
  } catch (error) {
    console.error("Hazard PUT Error:", error);
    return NextResponse.json({ error: "خطأ في تحديث الخطر" }, { status: 500 });
  }
}

// ✅ DELETE: حذف خطر
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    if (!["ADMIN", "QUALITY_MANAGER"].includes(session.user.role)) {
      return NextResponse.json({ error: "ليس لديك صلاحية" }, { status: 403 });
    }

    const hazardId = params.id;

    await prisma.hazard.delete({
      where: { id: hazardId },
    });

    await prisma.auditLog.create({
      data: {
        action: "DELETE_HAZARD",
        targetId: hazardId,
        targetType: "HAZARD",
        userId: session.user.id,
        details: `تم حذف خطر بالمعرّف: ${hazardId}`,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Hazard DELETE Error:", error);
    return NextResponse.json({ error: "خطأ أثناء حذف الخطر" }, { status: 500 });
  }
}
