import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PUT لتعديل سجل
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

    const recordId = params.id;
    const body = await req.json();
    const { value, status, notes } = body;

    if (!value) return NextResponse.json({ error: "القيمة مطلوبة" }, { status: 400 });

    // التأكد أن المستخدم يملك الصلاحية (ADMIN / QUALITY_MANAGER) أو هو مالك السجل
    const record = await prisma.record.findUnique({ where: { id: recordId } });
    if (!record) return NextResponse.json({ error: "السجل غير موجود" }, { status: 404 });

    if (session.user.role === "OPERATOR" && record.createdBy !== session.user.id) {
      return NextResponse.json({ error: "لا يمكنك تعديل سجلات الآخرين" }, { status: 403 });
    }

    const updatedRecord = await prisma.record.update({
      where: { id: recordId },
      data: { value, status, notes },
    });

    return NextResponse.json(updatedRecord);
  } catch (error) {
    console.error("Records PUT Error:", error);
    return NextResponse.json({ error: "خطأ في تعديل السجل" }, { status: 500 });
  }
}

// DELETE لحذف سجل
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

    const recordId = params.id;

    const record = await prisma.record.findUnique({ where: { id: recordId } });
    if (!record) return NextResponse.json({ error: "السجل غير موجود" }, { status: 404 });

    // التأكد من الصلاحيات
    if (session.user.role === "OPERATOR" && record.createdBy !== session.user.id) {
      return NextResponse.json({ error: "لا يمكنك حذف سجلات الآخرين" }, { status: 403 });
    }

    await prisma.record.delete({ where: { id: recordId } });

    return NextResponse.json({ message: "تم حذف السجل بنجاح" });
  } catch (error) {
    console.error("Records DELETE Error:", error);
    return NextResponse.json({ error: "خطأ في حذف السجل" }, { status: 500 });
  }
}
