import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getUserFacilityIds } from "@/lib/permissions";

// GET: جميع الخطط (مع فلترة حسب المنشأة)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: "غير مصرح" }, { status: 401 });

    const facilityIds = await getUserFacilityIds(session.user.id, session.user.role);

    const plans = await prisma.haccpPlan.findMany({
      where: facilityIds !== null
        ? { facilityId: { in: facilityIds } }
        : {},
      include: {
        steps: true,
        user: { select: { name: true } },
        facility: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(plans);
  } catch (error) {
    console.error("Error fetching HACCP plans:", error);
    return NextResponse.json({ message: "حدث خطأ عند جلب الخطط" }, { status: 500 });
  }
}

// POST: إنشاء خطة جديدة (التحقق من صلاحية المنشأة)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: "غير مصرح" }, { status: 401 });

    const body = await req.json();
    const { title, description, facilityId, userId } = body;

    if (!title || !userId) {
      return NextResponse.json({ message: "Title و userId مطلوبان" }, { status: 400 });
    }

    // التحقق من صلاحية المنشأة إذا تم إرسالها
    if (facilityId) {
      const facilityIds = await getUserFacilityIds(session.user.id, session.user.role);
      if (facilityIds !== null && !facilityIds.includes(facilityId)) {
        return NextResponse.json({ message: "منشأة غير مصرح بها" }, { status: 403 });
      }
    }

    const plan = await prisma.haccpPlan.create({
      data: { title, description, facilityId, userId },
      include: {
        steps: true,
        user: { select: { name: true } },
        facility: { select: { name: true } },
      },
    });

    return NextResponse.json(plan, { status: 201 });
  } catch (error) {
    console.error("Error creating HACCP plan:", error);
    return NextResponse.json({ message: "حدث خطأ عند إنشاء الخطة" }, { status: 500 });
  }
}