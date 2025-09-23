import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: جميع الخطط
export async function GET() {
  try {
    const plans = await prisma.haccpPlan.findMany({
      include: { 
        steps: true,
        user: { select: { name: true } }, // <-- إضافة المستخدم
        facility: { select: { name: true } } // إذا كنت تريد اسم المنشأة أيضًا
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(plans);
  } catch (error) {
    console.error("Error fetching HACCP plans:", error);
    return NextResponse.json({ message: "حدث خطأ عند جلب الخطط" }, { status: 500 });
  }
}

// POST: إنشاء خطة جديدة
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, facilityId, userId } = body;

    if (!title || !userId) {
      return NextResponse.json(
        { message: "Title و userId مطلوبان" },
        { status: 400 }
      );
    }

   const plan = await prisma.haccpPlan.create({
  data: {
    title,
    description,
    facilityId,
    userId,
  },
  include: { 
    steps: true,
    user: { select: { name: true } },      
    facility: { select: { name: true } },  
  },
});

    return NextResponse.json(plan, { status: 201 });
  } catch (error) {
    console.error("Error creating HACCP plan:", error);
    return NextResponse.json(
      { message: "حدث خطأ عند إنشاء الخطة" },
      { status: 500 }
    );
  }
}
