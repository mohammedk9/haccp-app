// src/app/api/users/profile/profile.ts
import { NextResponse } from 'next/server';
import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

// نوع للرد بالملف الشخصي بدون كلمة المرور
type UserProfile = {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

// GET الحصول على بيانات الملف الشخصي
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: 'غير مصرح بالوصول' }, { status: 401 });
    }

    const user: UserProfile | null = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ message: 'المستخدم غير موجود' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json({ message: 'حدث خطأ في جلب بيانات الملف الشخصي' }, { status: 500 });
  }
}

// PUT تحديث الملف الشخصي
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: 'غير مصرح بالوصول' }, { status: 401 });
    }

    const body: {
      name?: string;
      email?: string;
      currentPassword?: string;
      newPassword?: string;
    } = await request.json();

    const { name, email, currentPassword, newPassword } = body;

    if (!name || !email) {
      return NextResponse.json({ message: 'الاسم والبريد الإلكتروني مطلوبان' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });

    if (!user) {
      return NextResponse.json({ message: 'المستخدم غير موجود' }, { status: 404 });
    }

    // التحقق من البريد الإلكتروني إذا تم تغييره
    if (email !== user.email) {
      const emailExists = await prisma.user.findUnique({ where: { email } });
      if (emailExists) {
        return NextResponse.json({ message: 'هذا البريد الإلكتروني مستخدم بالفعل' }, { status: 409 });
      }
    }

    // التحقق من كلمة المرور الحالية إذا تم تقديم كلمة مرور جديدة
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ message: 'كلمة المرور الحالية مطلوبة' }, { status: 400 });
      }

      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        return NextResponse.json({ message: 'كلمة المرور الحالية غير صحيحة' }, { status: 400 });
      }

      if (newPassword.length < 6) {
        return NextResponse.json({ message: 'كلمة المرور الجديدة يجب أن تكون على الأقل 6 أحرف' }, { status: 400 });
      }
    }

    const updateData: { name: string; email: string; password?: string } = { name, email };
    if (newPassword) {
      updateData.password = await bcrypt.hash(newPassword, 12);
    }

    const updatedUser: UserProfile = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ message: 'تم تحديث الملف الشخصي بنجاح', user: updatedUser });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ message: 'حدث خطأ في تحديث الملف الشخصي' }, { status: 500 });
  }
}
