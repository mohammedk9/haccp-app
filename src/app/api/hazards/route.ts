// src/app/api/hazards/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PublicUser } from "@/types/user";

// GET جميع المخاطر
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const facilityId = searchParams.get("facilityId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const skip = (page - 1) * limit;

    const where = facilityId ? { facilityId } : {};

    const hazards = await prisma.hazard.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        facility: { select: { name: true } },
        user: { select: { id: true, name: true, email: true, role: true } },
      },
    });

    const total = await prisma.hazard.count({ where });

    return NextResponse.json({
      hazards,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Hazards GET Error:", error);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}

// POST إنشاء خطر جديد
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
    const { name, type, description, severity, facilityId } = body;

    if (!name || !type || !facilityId) {
      return NextResponse.json(
        { error: "الاسم والنوع والمنشأة مطلوبة" },
        { status: 400 }
      );
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
