import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getUserFacilityIds } from "@/lib/permissions";

// التحقق من صلاحية الوصول إلى الخطوة (عبر خطتها ومنشأتها)
async function checkStepAccess(stepId: string, userId: string, role: string) {
  const step = await prisma.haccpStep.findUnique({
    where: { id: stepId },
    select: { plan: { select: { facilityId: true } } }
  });
  if (!step) return false;
  const facilityIds = await getUserFacilityIds(userId, role);
  if (facilityIds !== null) {
    if (!step.plan.facilityId || !facilityIds.includes(step.plan.facilityId)) return false;
  }
  return true;
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: "غير مصرح" }, { status: 401 });

  if (!(await checkStepAccess(params.id, session.user.id, session.user.role))) {
    return NextResponse.json({ message: "غير مصرح" }, { status: 403 });
  }

  const body = await req.json();
  const { title, description, order, type } = body;

  const step = await prisma.haccpStep.update({
    where: { id: params.id },
    data: {
      title,
      description,
      stepNumber: order,
      type
    }
  });

  return NextResponse.json(step);
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: "غير مصرح" }, { status: 401 });

  if (!(await checkStepAccess(params.id, session.user.id, session.user.role))) {
    return NextResponse.json({ message: "غير مصرح" }, { status: 403 });
  }

  await prisma.haccpStep.delete({ where: { id: params.id } });
  return NextResponse.json({ message: "Deleted successfully" });
}