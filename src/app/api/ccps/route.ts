import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth"; // استخدم named export
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const facilityId = searchParams.get("facilityId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const where = facilityId ? { facilityId } : {};

    const ccps = await prisma.cCP.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        facility: { select: { name: true } },
        hazard: { select: { name: true } },
        user: { select: { name: true, email: true } }, // استخدم field relation
      },
    });

    const total = await prisma.cCP.count({ where });

    return NextResponse.json({
      ccps,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("CCPs GET Error:", error);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

    if (!["ADMIN", "QUALITY_MANAGER"].includes(session.user.role)) {
      return NextResponse.json({ error: "ليس لديك صلاحية" }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, criticalLimit, monitoringProcedure, facilityId, hazardId } = body;
    if (!name || !facilityId || !hazardId) {
      return NextResponse.json({ error: "الاسم والمنشأة والخطر مطلوبة" }, { status: 400 });
    }

    const ccp = await prisma.cCP.create({
      data: {
        name,
        description,
        criticalLimit,
        monitoringProcedure,
        facility: { connect: { id: facilityId } },
        hazard: { connect: { id: hazardId } },
        user: { connect: { id: session.user.id } }, // ✅ هنا
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
    console.error("CCPs POST Error:", error);
    return NextResponse.json({ error: "خطأ في إنشاء نقطة التحكم" }, { status: 500 });
  }
}
