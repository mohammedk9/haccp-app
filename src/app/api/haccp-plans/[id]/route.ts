import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getUserFacilityIds } from "@/lib/permissions";

// دالة مساعدة: هل الخطة مسموحة؟
async function checkPlanAccess(planId: string, userId: string, role: string) {
  const plan = await prisma.haccpPlan.findUnique({ where: { id: planId }, select: { facilityId: true } });
  if (!plan) return null;
  const facilityIds = await getUserFacilityIds(userId, role);
  if (facilityIds !== null) {
    if (!plan.facilityId || !facilityIds.includes(plan.facilityId)) return null;
  }
  return plan;
}

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: "غير مصرح" }, { status: 401 });

  const access = await checkPlanAccess(params.id, session.user.id, session.user.role);
  if (!access) return NextResponse.json({ message: "غير مصرح" }, { status: 403 });

  const plan = await prisma.haccpPlan.findUnique({
    where: { id: params.id },
    include: { steps: true },
  });
  if (!plan) return NextResponse.json({ message: "Plan not found" }, { status: 404 });
  return NextResponse.json(plan);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: "غير مصرح" }, { status: 401 });

  const access = await checkPlanAccess(params.id, session.user.id, session.user.role);
  if (!access) return NextResponse.json({ message: "غير مصرح" }, { status: 403 });

  const body = await req.json();
  const { name, description, facilityId } = body;

  // إذا حاول تغيير المنشأة، نتحقق من صلاحيته للمنشأة الجديدة
  if (facilityId) {
    const facilityIds = await getUserFacilityIds(session.user.id, session.user.role);
    if (facilityIds !== null && !facilityIds.includes(facilityId)) {
      return NextResponse.json({ message: "منشأة غير مصرح بها" }, { status: 403 });
    }
  }

  const plan = await prisma.haccpPlan.update({
    where: { id: params.id },
    data: {
      title: name,
      description,
      facilityId,
    },
  });

  return NextResponse.json(plan);
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: "غير مصرح" }, { status: 401 });

  const access = await checkPlanAccess(params.id, session.user.id, session.user.role);
  if (!access) return NextResponse.json({ message: "غير مصرح" }, { status: 403 });

  await prisma.haccpPlan.delete({ where: { id: params.id } });
  return NextResponse.json({ message: "Deleted successfully" });
}