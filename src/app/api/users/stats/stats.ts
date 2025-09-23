// src/app/api/users/stats/stats.ts
import { NextResponse } from 'next/server';
import { PrismaClient, Role } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

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

// GET إحصائيات المستخدمين
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: 'غير مصرح بالوصول' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'ليس لديك صلاحية للوصول إلى هذه الإحصائيات' },
        { status: 403 }
      );
    }

    const totalUsers = await prisma.user.count();
    const activeUsers = await prisma.user.count({ where: { isActive: true } });
    const inactiveUsers = await prisma.user.count({ where: { isActive: false } });

    const usersByRole = await prisma.user.groupBy({
      by: ['role'],
      _count: { id: true },
      orderBy: { role: 'asc' },
    });

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newUsersLast30Days = await prisma.user.count({
      where: { createdAt: { gte: thirtyDaysAgo } },
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
    console.error('Error fetching user stats:', error);
    return NextResponse.json(
      { message: 'حدث خطأ في جلب الإحصائيات' },
      { status: 500 }
    );
  }
}
