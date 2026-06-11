import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { getUserFacilityIds } from '@/lib/permissions';

// دالة مساعدة للتحقق من أن المستخدم الذي نحاول تعديله ينتمي إلى إحدى منشآت الطالب
async function canManageUser(targetUserId: string, managerId: string, managerRole: string) {
  if (managerRole === 'SUPER_ADMIN') return true;
  const managerFacilities = await getUserFacilityIds(managerId, managerRole);
  if (!managerFacilities || managerFacilities.length === 0) return false;

  const targetUser = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { userFacilities: { select: { facilityId: true } } }
  });
  if (!targetUser) return false;

  const targetFacilityIds = targetUser.userFacilities.map(uf => uf.facilityId);
  return targetFacilityIds.some(id => managerFacilities.includes(id));
}

// GET: جلب بيانات مستخدم
export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

    const requestedId = context.params.id;
    const currentUserId = session.user.id;

    // المستخدم يرى نفسه أو المسؤول يرى من في منشأته
    if (requestedId !== currentUserId && !(await canManageUser(requestedId, session.user.id, session.user.role))) {
      return NextResponse.json({ error: 'ليس لديك صلاحية عرض بيانات هذا المستخدم' }, { status: 403 });
    }

    const user = await prisma.user.findUnique({
      where: { id: requestedId },
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

    if (!user) return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 });

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}

// PUT: تعديل بيانات مستخدم
export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

    if (!(await canManageUser(context.params.id, session.user.id, session.user.role))) {
      return NextResponse.json({ error: 'ليس لديك صلاحية' }, { status: 403 });
    }

    const body = await request.json();
    const { name, email, role, isActive, password } = body;

    let updateData: any = { name, email, role, isActive };

    if (password && password.length >= 6) {
      updateData.password = await bcrypt.hash(password, 12);
    }

    const user = await prisma.user.update({
      where: { id: context.params.id },
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
    return NextResponse.json({ error: 'خطأ في تحديث المستخدم' }, { status: 500 });
  }
}

// DELETE: حذف مستخدم
export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

    if (!(await canManageUser(context.params.id, session.user.id, session.user.role))) {
      return NextResponse.json({ error: 'ليس لديك صلاحية' }, { status: 403 });
    }

    await prisma.user.delete({ where: { id: context.params.id } });
    return NextResponse.json({ message: 'تم حذف المستخدم' });
  } catch (error) {
    return NextResponse.json({ error: 'خطأ في حذف المستخدم' }, { status: 500 });
  }
}