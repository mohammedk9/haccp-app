import { NextResponse } from 'next/server';
import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getUserFacilityIds } from '@/lib/permissions';

const prisma = new PrismaClient();

type UserResponse = {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;
};

type Pagination = {
  currentPage: number;
  totalPages: number;
  totalUsers: number;
  hasNext: boolean;
  hasPrev: boolean;
};

// GET جميع المستخدمين (حسب الصلاحية)
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'غير مصرح بالوصول' }, { status: 401 });
    }

    const facilityIds = await getUserFacilityIds(session.user.id, session.user.role);

    if (facilityIds !== null && facilityIds.length === 0) {
      return NextResponse.json({
        users: [],
        pagination: { currentPage: 1, totalPages: 0, totalUsers: 0, hasNext: false, hasPrev: false }
      });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const search = searchParams.get('search') || '';
    const roleFilter = searchParams.get('role') || '';   // غيرت الاسم لتفادي التعارض

    const skip = (page - 1) * limit;

    const where: any = {};

    if (facilityIds !== null) {
      where.userFacilities = {
        some: { facilityId: { in: facilityIds } }
      };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' as const } },
        { email: { contains: search, mode: 'insensitive' as const } }
      ];
    }

    if (roleFilter) {
      where.role = roleFilter;
    }

    const users: UserResponse[] = await prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    const totalUsers = await prisma.user.count({ where });
    const totalPages = Math.ceil(totalUsers / limit);

    const pagination: Pagination = {
      currentPage: page,
      totalPages,
      totalUsers,
      hasNext: page < totalPages,
      hasPrev: page > 1
    };

    return NextResponse.json({ users, pagination });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ message: 'حدث خطأ في جلب البيانات' }, { status: 500 });
  }
}

// POST إنشاء مستخدم جديد
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'غير مصرح بالوصول' }, { status: 401 });
    }

    const body: { name: string; email: string; password: string; role?: Role; facilityId?: string; isActive?: boolean } = await request.json();
    const { name, email, password, role, facilityId, isActive } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ message: 'الاسم والبريد الإلكتروني وكلمة المرور مطلوبة' }, { status: 400 });
    }

    // ✅ منع إنشاء SUPER_ADMIN إلا من قبل SUPER_ADMIN نفسه
    if (role === 'SUPER_ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ message: 'لا يمكنك إنشاء مشرف عام' }, { status: 403 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ message: 'صيغة البريد الإلكتروني غير صحيحة' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ message: 'كلمة المرور يجب أن تكون على الأقل 6 أحرف' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ message: 'هذا البريد الإلكتروني مستخدم بالفعل' }, { status: 409 });
    }

    const facilityIds = await getUserFacilityIds(session.user.id, session.user.role);
    if (facilityIds !== null) {
      if (!facilityId || !facilityIds.includes(facilityId)) {
        return NextResponse.json({ message: 'المنشأة المحددة غير صالحة أو غير مصرح بها' }, { status: 403 });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user: UserResponse = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || 'OPERATOR',
        isActive: isActive !== undefined ? isActive : true,
        userFacilities: facilityId ? {
          create: [{ facilityId }]
        } : undefined
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    });

    return NextResponse.json({ message: 'تم إنشاء المستخدم بنجاح', user }, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ message: 'حدث خطأ في إنشاء المستخدم' }, { status: 500 });
  }
}