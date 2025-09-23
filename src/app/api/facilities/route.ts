// src/app/api/facilities/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PublicUser } from "@/types/user";

// GET جميع المنشآت (للادمن ومدير الجودة فقط)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    if (!["ADMIN", "QUALITY_MANAGER"].includes(session.user.role)) {
      return NextResponse.json({ error: "ليس لديك صلاحية" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { location: { contains: search, mode: "insensitive" } },
          ],
        }
      : {};

    const facilities = await prisma.facility.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
      },
    });

    const total = await prisma.facility.count({ where });

    return NextResponse.json({
      facilities,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Facilities GET Error:", error);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}

// POST إنشاء منشأة جديدة (للادمن ومدير الجودة فقط)
export async function POST(req: NextRequest) {
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

    if (!name || !location || !type) {
      return NextResponse.json(
        { error: "الاسم والموقع والنوع مطلوبون" },
        { status: 400 }
      );
    }

    const facility = await prisma.facility.create({
      data: {
        name,
        location,
        type,
        description,
        user: { connect: { id: session.user.id } },
      },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
      },
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
