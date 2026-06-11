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
      return NextResponse.json({ ccps: [], pagination: { page: 1, limit: 10, total: 0, pages: 0 } });
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

    const [ccps, total] = await Promise.all([
      prisma.cCP.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          facility: { select: { name: true } },
          hazard: { select: { name: true } },
          user: { select: { name: true, email: true } },
        },
      }),
      prisma.cCP.count({ where }),
    ]);

    return NextResponse.json({
      ccps,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

    const body = await req.json();
    const { name, description, criticalLimit, monitoringProcedure, facilityId, hazardId } = body;
    if (!name || !facilityId || !hazardId) {
      return NextResponse.json({ error: "الاسم والمنشأة والخطر مطلوبة" }, { status: 400 });
    }

    const facilityIds = await getUserFacilityIds(session.user.id, session.user.role);
    if (facilityIds !== null && !facilityIds.includes(facilityId)) {
      return NextResponse.json({ error: "منشأة غير مصرح بها" }, { status: 403 });
    }

    const ccp = await prisma.cCP.create({
      data: {
        name,
        description,
        criticalLimit,
        monitoringProcedure,
        facility: { connect: { id: facilityId } },
        hazard: { connect: { id: hazardId } },
        user: { connect: { id: session.user.id } },
      },
      include: {
        facility: { select: { name: true } },
        hazard: { select: { name: true } },
        user: { select: { name: true, email: true } },
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "CREATE_CCP",
        targetId: ccp.id,
        targetType: "CCP",
        userId: session.user.id,
        details: `تم إنشاء نقطة تحكم: ${name}`,
      },
    });

    return NextResponse.json(ccp, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "خطأ في إنشاء نقطة التحكم" }, { status: 500 });
  }
}