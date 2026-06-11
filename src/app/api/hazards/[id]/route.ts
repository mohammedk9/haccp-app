import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getUserFacilityIds } from "@/lib/permissions";

async function checkHazardAccess(hazardId: string, userId: string, role: string) {
  const hazard = await prisma.hazard.findUnique({ where: { id: hazardId }, select: { facilityId: true } });
  if (!hazard) return null;
  const facilityIds = await getUserFacilityIds(userId, role);
  if (facilityIds !== null && !facilityIds.includes(hazard.facilityId)) return null;
  return hazard;
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

    const access = await checkHazardAccess(params.id, session.user.id, session.user.role);
    if (!access) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });

    const hazard = await prisma.hazard.findUnique({
      where: { id: params.id },
      include: {
        facility: { select: { name: true } },
        user: { select: { id: true, name: true, email: true, role: true } },
      },
    });
    return NextResponse.json(hazard);
  } catch (error) {
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

    const access = await checkHazardAccess(params.id, session.user.id, session.user.role);
    if (!access) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });

    const body = await req.json();
    const { name, type, description, severity, facilityId } = body;

    if (facilityId) {
      const facilityIds = await getUserFacilityIds(session.user.id, session.user.role);
      if (facilityIds !== null && !facilityIds.includes(facilityId)) {
        return NextResponse.json({ error: "منشأة غير مصرح بها" }, { status: 403 });
      }
    }

    const updated = await prisma.hazard.update({
      where: { id: params.id },
      data: { name, type, description, severity, facilityId },
      include: {
        facility: { select: { name: true } },
        user: { select: { id: true, name: true, email: true, role: true } },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

    const access = await checkHazardAccess(params.id, session.user.id, session.user.role);
    if (!access) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });

    await prisma.hazard.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}