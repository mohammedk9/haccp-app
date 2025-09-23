// src/app/api/alerts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const alerts = await fetchRealAlertsFromDatabase(session.user);
    return NextResponse.json(alerts);
  } catch (error) {
    console.error('Error in alerts API:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const { alertId } = await request.json();
    
    await prisma.auditLog.create({
      data: {
        action: 'ALERT_VIEWED',
        targetId: alertId,
        targetType: 'ALERT',
        details: `User viewed alert: ${alertId}`,
        userId: session.user.id
      }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error marking alert as read:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في تحديث التنبيه' },
      { status: 500 }
    );
  }
}

async function fetchRealAlertsFromDatabase(user: any) {
  const alerts = [];

  try {
    // 1. تنبيهات نقاط التحكم الحرجة
    const criticalRecords = await prisma.record.count({
      where: {
        status: 'CRITICAL',
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
        },
        facility: {
          user: {  // تم التصحيح هنا من users إلى user
            id: user.id
          }
        }
      }
    });

    if (criticalRecords > 0) {
      alerts.push({
        id: 'records-critical',
        type: 'critical' as const,
        title: 'سجلات حرجة',
        message: `${criticalRecords} سجل حرج خلال الـ24 ساعة الماضية`,
        count: criticalRecords,
        link: '/records?status=CRITICAL',
        priority: 1,
        icon: '⚠️',
        timestamp: new Date().toISOString()
      });
    }

    // 2. تنبيهات درجات الحرارة الخطرة
    const storageAlerts = await prisma.storageLog.count({
      where: {
        OR: [
          { temperature: { gt: 8 } },
          { temperature: { lt: -18 } },
          { humidity: { gt: 80 } }
        ],
        measuredAt: { 
          gte: new Date(Date.now() - 12 * 60 * 60 * 1000)
        }
      }
    });

    if (storageAlerts > 0) {
      alerts.push({
        id: 'storage-alerts',
        type: 'warning' as const,
        title: 'مشاكل في التخزين',
        message: `${storageAlerts} قراءة غير طبيعية في وحدات التخزين`,
        count: storageAlerts,
        link: '/storages',
        priority: 2,
        icon: '❄️',
        timestamp: new Date().toISOString()
      });
    }

    // 3. تنبيهات المخاطر عالية الخطورة
    const highRiskHazards = await prisma.hazard.count({
      where: {
        severity: { in: ['HIGH', 'CRITICAL'] },
        facility: {
          user: {  // تم التصحيح هنا من users إلى user
            id: user.id
          }
        }
      }
    });

    if (highRiskHazards > 0) {
      alerts.push({
        id: 'hazards-high',
        type: 'warning' as const,
        title: 'مخاطر عالية',
        message: `${highRiskHazards} خطر عالي الخطورة يحتاج مراجعة`,
        count: highRiskHazards,
        link: '/hazards?severity=HIGH,CRITICAL',
        priority: 2,
        icon: '🔥',
        timestamp: new Date().toISOString()
      });
    }

    // 4. تنبيهات خاصة بالمسؤولين
    if (user.role === 'ADMIN') {
      const inactiveUsers = await prisma.user.count({
        where: { 
          isActive: false
        }
      });

      if (inactiveUsers > 0) {
        alerts.push({
          id: 'users-inactive',
          type: 'info' as const,
          title: 'مستخدمين غير نشطين',
          message: `${inactiveUsers} مستخدم غير نشط يحتاج تفعيل`,
          count: inactiveUsers,
          link: '/users?status=inactive',
          priority: 3,
          icon: '👥',
          timestamp: new Date().toISOString()
        });
      }

      const emptyPlans = await prisma.haccpPlan.count({
        where: {
          steps: {
            none: {}
          }
        }
      });

      if (emptyPlans > 0) {
        alerts.push({
          id: 'plans-empty',
          type: 'warning' as const,
          title: 'خطط غير مكتملة',
          message: `${emptyPlans} خطة HACCP بدون خطوات`,
          count: emptyPlans,
          link: '/haccp-plans',
          priority: 2,
          icon: '📋',
          timestamp: new Date().toISOString()
        });
      }
    }

    // 5. تنبيهات للمديرين ومديري الجودة
    if (['ADMIN', 'QUALITY_MANAGER', 'QUALITY_INSPECTOR'].includes(user.role)) {
      const ccpsWithoutActions = await prisma.cCP.count({
        where: {
          correctiveActions: null,
          facility: {
            user: {  // تم التصحيح هنا من users إلى user
              id: user.id
            }
          }
        }
      });

      if (ccpsWithoutActions > 0) {
        alerts.push({
          id: 'ccps-no-actions',
          type: 'warning' as const,
          title: 'نقاط تحكم ناقصة',
          message: `${ccpsWithoutActions} نقطة تحكم بدون إجراءات تصحيحية`,
          count: ccpsWithoutActions,
          link: '/ccps',
          priority: 2,
          icon: '🛡️',
          timestamp: new Date().toISOString()
        });
      }
    }

    // 6. تنبيهات للمشغلين والفنيين
    if (['OPERATOR', 'FOOD_TECHNICIAN'].includes(user.role)) {
      const recentRecordsNeeded = await prisma.record.count({
        where: {
          measuredAt: {
            gte: new Date(Date.now() - 6 * 60 * 60 * 1000)
          },
          value: '',
          facility: {
            user: {  // تم التصحيح هنا من users إلى user
              id: user.id
            }
          }
        }
      });

      if (recentRecordsNeeded > 0) {
        alerts.push({
          id: 'records-pending',
          type: 'info' as const,
          title: 'سجلات معلقة',
          message: `${recentRecordsNeeded} سجل يحتاج إدخال بيانات`,
          count: recentRecordsNeeded,
          link: '/records',
          priority: 3,
          icon: '📝',
          timestamp: new Date().toISOString()
        });
      }
    }

  } catch (error) {
    console.error('Error fetching alerts from database:', error);
    alerts.push({
      id: 'system-error',
      type: 'info' as const,
      title: 'حالة النظام',
      message: 'جاري تحميل بيانات التنبيهات...',
      count: 0,
      link: '#',
      priority: 4,
      icon: '🔄',
      timestamp: new Date().toISOString()
    });
  }

  if (alerts.length === 0) {
    alerts.push({
      id: 'all-clear',
      type: 'info' as const,
      title: 'كل شيء تحت السيطرة',
      message: 'لا توجد تنبيهات حرجة - النظام يعمل بشكل طبيعي',
      count: 0,
      link: '#',
      priority: 4,
      icon: '✅',
      timestamp: new Date().toISOString()
    });
  }

  return alerts.sort((a, b) => a.priority - b.priority);
}

// أنواع TypeScript
interface Alert {
  id: string;
  type: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  count: number;
  link: string;
  priority: number;
  icon: string;
  timestamp: string;
}