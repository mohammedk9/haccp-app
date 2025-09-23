// src/app/api/haccp-steps/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET: استرجاع جميع الخطوات الخاصة بخطة معينة
 * query: planId
 */
export async function GET(req: NextRequest) {
  const planId = req.nextUrl.searchParams.get("planId");

  if (!planId) {
    return NextResponse.json({ message: "planId is required" }, { status: 400 });
  }

  try {
    const steps = await prisma.haccpStep.findMany({
      where: { planId },
      orderBy: { stepNumber: "asc" }, // ترتيب حسب stepNumber
      include: {
        user: { select: { id: true, name: true, email: true } }, // معلومات المستخدم
        plan: { select: { id: true, title: true } },             // معلومات الخطة
      },
    });

    return NextResponse.json(steps);
  } catch (error: any) {
    console.error("Error fetching HaccpSteps:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

/**
 * POST: إنشاء خطوة جديدة
 * body: { planId, userId, title, description?, type?, stepNumber? }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { planId, userId, title, description, type, stepNumber } = body;

    if (!planId || !userId || !title) {
      return NextResponse.json(
        { message: "planId, userId and title are required" },
        { status: 400 }
      );
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
  } catch (error: any) {
    console.error("Error creating HaccpStep:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

/**
 * PUT: تحديث خطوة
 * body: { id, title?, description?, type?, stepNumber? }
 */
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, title, description, type, stepNumber } = body;

    if (!id) {
      return NextResponse.json({ message: "id is required" }, { status: 400 });
    }

    const step = await prisma.haccpStep.update({
      where: { id },
      data: {
        title,
        description,
        type,
        stepNumber,
      },
    });

    return NextResponse.json(step);
  } catch (error: any) {
    console.error("Error updating HaccpStep:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

/**
 * DELETE: حذف خطوة
 * query: id
 */
export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");

  if (!id) {
    return NextResponse.json({ message: "id is required" }, { status: 400 });
  }

  try {
    await prisma.haccpStep.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Step deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting HaccpStep:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

