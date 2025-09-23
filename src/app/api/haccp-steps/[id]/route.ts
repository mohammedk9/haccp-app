import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PUT: تعديل خطوة
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const { title, description, order, type } = body;

  const step = await prisma.haccpStep.update({
    where: { id: params.id },
    data: { 
      title, 
      description, 
      stepNumber: order, // استخدم stepNumber بدل order
      type 
    }
  });

  return NextResponse.json(step);
}

// DELETE: حذف خطوة
export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  await prisma.haccpStep.delete({ where: { id: params.id } });
  return NextResponse.json({ message: "Deleted successfully" });
}
