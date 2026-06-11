import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getUserFacilityIds } from "@/lib/permissions";

// دالة للتحقق من أن الخطة مسموحة
async function verifyPlanAccess(planId: string, userId: string, role: string) {
  const plan = await prisma.haccpPlan.findUnique({ where: { id: planId }, select: { facilityId: true } });
  if (!plan) return false;
  const facilityIds = await getUserFacilityIds(userId, role);
  if (facilityIds !== null) {
    if (!plan.facilityId || !facilityIds.includes(plan.facilityId)) return false;
  }
  return true;
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: "غير مصرح" }, { status: 401 });

  const planId = req.nextUrl.searchParams.get("planId");
  if (!planId) return NextResponse.json({ message: "planId is required" }, { status: 400 });

  if (!(await verifyPlanAccess(planId, session.user.id, session.user.role))) {
    return NextResponse.json({ message: "غير مصرح" }, { status: 403 });
  }

  const steps = await prisma.haccpStep.findMany({
    where: { planId },
    orderBy: { stepNumber: "asc" },
    include: {
      user: { select: { id: true, name: true, email: true } },
      plan: { select: { id: true, title: true } },
    },
  });

  return NextResponse.json(steps);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: "غير مصرح" }, { status: 401 });

  const body = await req.json();
  const { planId, userId, title, description, type, stepNumber } = body;
  if (!planId || !userId || !title) {
    return NextResponse.json({ message: "planId, userId and title are required" }, { status: 400 });
  }

  if (!(await verifyPlanAccess(planId, session.user.id, session.user.role))) {
    return NextResponse.json({ message: "غير مصرح" }, { status: 403 });
  }

  const step = await prisma.haccpStep.create({
    data: {
      planId,
      userId,
      title,
      description: description || null,
      type: type || null,
      stepNumber: stepNumber || null,
    },
  });

  return NextResponse.json(step, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: "غير مصرح" }, { status: 401 });

  const body = await req.json();
  const { id, title, description, type, stepNumber } = body;
  if (!id) return NextResponse.json({ message: "id is required" }, { status: 400 });

  // جلب الخطة المرتبطة بالخطوة للتحقق
  const step = await prisma.haccpStep.findUnique({ where: { id }, select: { planId: true } });
  if (!step) return NextResponse.json({ message: "Step not found" }, { status: 404 });
  if (!(await verifyPlanAccess(step.planId, session.user.id, session.user.role))) {
    return NextResponse.json({ message: "غير مصرح" }, { status: 403 });
  }

  const updated = await prisma.haccpStep.update({
    where: { id },
    data: { title, description, type, stepNumber },
  });

  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: "غير مصرح" }, { status: 401 });

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ message: "id is required" }, { status: 400 });

  const step = await prisma.haccpStep.findUnique({ where: { id }, select: { planId: true } });
  if (!step) return NextResponse.json({ message: "Step not found" }, { status: 404 });
  if (!(await verifyPlanAccess(step.planId, session.user.id, session.user.role))) {
    return NextResponse.json({ message: "غير مصرح" }, { status: 403 });
  }

  await prisma.haccpStep.delete({ where: { id } });
  return NextResponse.json({ message: "Step deleted successfully" });
}