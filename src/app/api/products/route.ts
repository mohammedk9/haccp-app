import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getUserFacilityIds } from "@/lib/permissions";

// تعريف نوع صريح للبيانات القادمة من الطلب
interface CreateProductBody {
  name: string;
  description?: string;
  category: string;
  facilityId?: string | null;
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

    const facilityIds = await getUserFacilityIds(session.user.id, session.user.role);
    if (facilityIds !== null && facilityIds.length === 0) {
      return NextResponse.json({ products: [], pagination: { page: 1, limit: 10, total: 0, pages: 0 } });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const skip = (page - 1) * limit;

    const where: any = {};
    if (facilityIds !== null) where.facilityId = { in: facilityIds };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" as const } },
        { description: { contains: search, mode: "insensitive" as const } },
      ];
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { id: true, name: true, email: true, role: true } } },
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({ products, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

    const body = await req.json();
    const { name, description, category, facilityId } = body as CreateProductBody;

    if (!name || !category) return NextResponse.json({ error: "الاسم والفئة مطلوبان" }, { status: 400 });

    if (!facilityId && session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "المنشأة مطلوبة" }, { status: 400 });
    }

    const facilityIds = await getUserFacilityIds(session.user.id, session.user.role);
    if (facilityIds !== null && facilityId && !facilityIds.includes(facilityId)) {
      return NextResponse.json({ error: "منشأة غير مصرح بها" }, { status: 403 });
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        category,
        user: { connect: { id: session.user.id } },
        // استخدام العلاقة بدل الحقل المباشر
        facility: facilityId ? { connect: { id: facilityId } } : undefined,
      },
      include: { user: { select: { id: true, name: true, email: true, role: true } } },
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "خطأ في الإنشاء" }, { status: 500 });
  }
}