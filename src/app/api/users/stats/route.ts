import { NextResponse } from 'next/server';
import { Role } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';          // ✅ استخدام الموحّد
import { getUserFacilityIds } from '@/lib/permissions';

type UserStats = {
  total: number;
  active: number;
  inactive: number;
  byRole: Record<Role, number>;
  recent: {
    last30Days: number;
    activationRate: string | number;
  };
  overview: {
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    activePercentage: number;
  };
};

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: 'غير مصرح بالوصول' }, { status: 401 });

    const facilityIds = await getUserFacilityIds(session.user.id, session.user.role);

    // SUPER_ADMIN يرى إحصائيات النظام ككل،
    // أما غيره فيرى إحصائيات مستخدمي منشأته فقط
    const where: any = {};
    if (facilityIds !== null) {
      where.userFacilities = { some: { facilityId: { in: facilityIds } } };
    }

    const totalUsers = await prisma.user.count({ where });
    const activeUsers = await prisma.user.count({ where: { ...where, isActive: true } });
    const inactiveUsers = await prisma.user.count({ where: { ...where, isActive: false } });

    const usersByRole = await prisma.user.groupBy({
      by: ['role'],
      _count: { id: true },
      where,
      orderBy: { role: 'asc' },
    });

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newUsersLast30Days = await prisma.user.count({
      where: { ...where, createdAt: { gte: thirtyDaysAgo } },
    });

    const stats: UserStats = {
      total: totalUsers,
      active: activeUsers,
      inactive: inactiveUsers,
      byRole: usersByRole.reduce((acc, item) => {
        acc[item.role] = item._count.id;
        return acc;
      }, {} as Record<Role, number>),
      recent: {
        last30Days: newUsersLast30Days,
        activationRate: totalUsers > 0 ? parseFloat(((activeUsers / totalUsers) * 100).toFixed(1)) : 0,
      },
      overview: {
        totalUsers,
        activeUsers,
        inactiveUsers,
        activePercentage: totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0,
      },
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'حدث خطأ في جلب الإحصائيات' }, { status: 500 });
  }
}