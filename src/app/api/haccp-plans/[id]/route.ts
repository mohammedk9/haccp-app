import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: جلب خطة واحدة
export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const plan = await prisma.haccpPlan.findUnique({
    where: { id: params.id },
    include: { steps: true }
  });
  if (!plan) return NextResponse.json({ message: "Plan not found" }, { status: 404 });
  return NextResponse.json(plan);
}

// PUT: تعديل الخطة
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const { name, description } = body;

  const plan = await prisma.haccpPlan.update({
  where: { id: params.id },
  data: { 
    title: name, // استخدم title بدل name
    description 
  }
});

  return NextResponse.json(plan);
}

// DELETE: حذف خطة
export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  await prisma.haccpPlan.delete({ where: { id: params.id } });
  return NextResponse.json({ message: "Deleted successfully" });
}
