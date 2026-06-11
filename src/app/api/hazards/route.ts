import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getUserFacilityIds } from "@/lib/permissions";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

    const facilityIds = await getUserFacilityIds(session.user.id, session.user.role);
    if (facilityIds !== null && facilityIds.length === 0) {
      return NextResponse.json({ hazards: [], pagination: { page: 1, limit: 10, total: 0, pages: 0 } });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const reqFacilityId = searchParams.get("facilityId");
    const skip = (page - 1) * limit;

    const where: any = {};
    if (facilityIds !== null) {
      where.facilityId = reqFacilityId && facilityIds.includes(reqFacilityId) ? reqFacilityId : { in: facilityIds };
    } else if (reqFacilityId) {
      where.facilityId = reqFacilityId;
    }

    const [hazards, total] = await Promise.all([
      prisma.hazard.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          facility: { select: { name: true } },
          user: { select: { id: true, name: true, email: true, role: true } },
        },
      }),
      prisma.hazard.count({ where }),
    ]);

    return NextResponse.json({
      hazards,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Hazards GET Error:", error);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

    const body = await req.json();
    const { name, type, description, severity, facilityId } = body;
    if (!name || !type || !facilityId) {
      return NextResponse.json({ error: "الاسم والنوع والمنشأة مطلوبة" }, { status: 400 });
    }

    const facilityIds = await getUserFacilityIds(session.user.id, session.user.role);
    if (facilityIds !== null && !facilityIds.includes(facilityId)) {
      return NextResponse.json({ error: "منشأة غير مصرح بها" }, { status: 403 });
    }

    const hazard = await prisma.hazard.create({
      data: {
        name,
        type,
        description,
        severity,
        facility: { connect: { id: facilityId } },
        user: { connect: { id: session.user.id } },
      },
      include: {
        facility: { select: { name: true } },
        user: { select: { id: true, name: true, email: true, role: true } },
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "CREATE_HAZARD",
        targetId: hazard.id,
        targetType: "HAZARD",
        userId: session.user.id,
        details: `تم إنشاء خطر: ${name}`,
      },
    });

    return NextResponse.json(hazard, { status: 201 });
  } catch (error) {
    console.error("Hazards POST Error:", error);
    return NextResponse.json({ error: "خطأ في إنشاء الخطر" }, { status: 500 });
  }
}