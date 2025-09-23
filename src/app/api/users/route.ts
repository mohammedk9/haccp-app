// src/app/api/users/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

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

// GET جميع المستخدمين
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: 'غير مصرح بالوصول' }, { status: 401 });
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'ليس لديك صلاحية للوصول إلى هذه البيانات' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || '';

    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (role) {
      where.role = role;
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

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'ليس لديك صلاحية لإنشاء مستخدمين' }, { status: 403 });
    }

    const body: { name: string; email: string; password: string; role?: Role; isActive?: boolean } = await request.json();
    const { name, email, password, role, isActive } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ message: 'الاسم والبريد الإلكتروني وكلمة المرور مطلوبة' }, { status: 400 });
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

    const hashedPassword = await bcrypt.hash(password, 12);

    const user: UserResponse = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || 'OPERATOR',
        isActive: isActive !== undefined ? isActive : true
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
