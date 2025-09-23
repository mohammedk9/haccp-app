// src/app/api/users/[id]/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth'; // ✅ استخدم الاستيراد باسم مُسمّى
import { prisma } from '@/lib/prisma'; // تأكد أن prisma تم تصديره من lib/prisma.ts
import type { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';


export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: params.id },
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
      return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('User GET Error:', error);
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    if (!['ADMIN', 'QUALITY_MANAGER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'ليس لديك صلاحية' }, { status: 403 });
    }

    const body = await request.json();
 const { name, email, role, isActive, password } = body;

let updateData: any = { name, email, role, isActive };

if (password && password.length >= 6) {
  updateData.password = await bcrypt.hash(password, 12);
}

const user = await prisma.user.update({
  where: { id: params.id },
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

    return NextResponse.json(user);
  } catch (error) {
    console.error('User PUT Error:', error);
    return NextResponse.json({ error: 'خطأ في تحديث المستخدم' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'ليس لديك صلاحية' }, { status: 403 });
    }

    await prisma.user.delete({ where: { id: params.id } });

    return NextResponse.json({ message: 'تم حذف المستخدم' });
  } catch (error) {
    console.error('User DELETE Error:', error);
    return NextResponse.json({ error: 'خطأ في حذف المستخدم' }, { status: 500 });
  }
}
