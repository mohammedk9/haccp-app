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
      return NextResponse.json({ facilities: [], pagination: { page: 1, limit: 10, total: 0, pages: 0 } });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const skip = (page - 1) * limit;

    const where: any = {};
    if (facilityIds !== null) where.id = { in: facilityIds };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" as const } },
        { location: { contains: search, mode: "insensitive" as const } },
      ];
    }

    const [facilities, total] = await Promise.all([
      prisma.facility.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { id: true, name: true, email: true, role: true } } },
      }),
      prisma.facility.count({ where }),
    ]);

    return NextResponse.json({
      facilities,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Facilities GET Error:", error);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

    const body = await req.json();
    const { name, location, type, description } = body;
    if (!name || !location || !type) {
      return NextResponse.json({ error: "الاسم والموقع والنوع مطلوبون" }, { status: 400 });
    }

    const facility = await prisma.facility.create({
      data: {
        name,
        location,
        type,
        description,
        user: { connect: { id: session.user.id } },
      },
    });

    // ربط المستخدم الحالي بالمنشأة الجديدة تلقائياً
    await prisma.userFacility.create({
      data: { userId: session.user.id, facilityId: facility.id },
    });

    await prisma.auditLog.create({
      data: {
        action: "CREATE_FACILITY",
        targetId: facility.id,
        targetType: "FACILITY",
        userId: session.user.id,
        details: `تم إنشاء منشأة: ${name}`,
      },
    });

    return NextResponse.json(facility, { status: 201 });
  } catch (error) {
    console.error("Facilities POST Error:", error);
    return NextResponse.json({ error: "خطأ في إنشاء المنشأة" }, { status: 500 });
  }
}