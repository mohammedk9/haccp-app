import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getUserFacilityIds } from "@/lib/permissions";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

    const record = await prisma.record.findUnique({
      where: { id: params.id },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
        facility: { select: { id: true, name: true } },
        ccp: { select: { id: true, name: true } },
      },
    });

    if (!record) return NextResponse.json({ error: "السجل غير موجود" }, { status: 404 });

    const facilityIds = await getUserFacilityIds(session.user.id, session.user.role);
    if (facilityIds !== null && !facilityIds.includes(record.facilityId)) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    return NextResponse.json(record);
  } catch (error) {
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

    const existing = await prisma.record.findUnique({ where: { id: params.id } });
    if (!existing) return NextResponse.json({ error: "السجل غير موجود" }, { status: 404 });

    const facilityIds = await getUserFacilityIds(session.user.id, session.user.role);
    if (facilityIds !== null && !facilityIds.includes(existing.facilityId)) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    if (session.user.role === "OPERATOR" && existing.createdBy !== session.user.id) {
      return NextResponse.json({ error: "لا يمكنك تعديل سجلات الآخرين" }, { status: 403 });
    }

    const body = await req.json();
    const { value, status, notes } = body;
    if (!value) return NextResponse.json({ error: "القيمة مطلوبة" }, { status: 400 });

    const updated = await prisma.record.update({
      where: { id: params.id },
      data: { value, status, notes },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
        facility: { select: { id: true, name: true } },
        ccp: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "خطأ في تعديل السجل" }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

    const existing = await prisma.record.findUnique({ where: { id: params.id } });
    if (!existing) return NextResponse.json({ error: "السجل غير موجود" }, { status: 404 });

    const facilityIds = await getUserFacilityIds(session.user.id, session.user.role);
    if (facilityIds !== null && !facilityIds.includes(existing.facilityId)) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    if (session.user.role === "OPERATOR" && existing.createdBy !== session.user.id) {
      return NextResponse.json({ error: "لا يمكنك حذف سجلات الآخرين" }, { status: 403 });
    }

    await prisma.record.delete({ where: { id: params.id } });
    return NextResponse.json({ message: "تم حذف السجل بنجاح" });
  } catch (error) {
    return NextResponse.json({ error: "خطأ في حذف السجل" }, { status: 500 });
  }
}