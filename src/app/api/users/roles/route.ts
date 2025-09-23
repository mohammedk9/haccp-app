// src/app/api/users/roles/roles.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

type RoleItem = {
  value: string;
  label: string;
  description: string;
  permissions: string[];
};

// GET الحصول على قائمة الأدوار المتاحة
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: 'غير مصرح بالوصول' }, { status: 401 });
    }

    const roles: RoleItem[] = [
      {
        value: 'ADMIN',
        label: 'مدير النظام',
        description: 'صلاحية كاملة على النظام وإدارة جميع المستخدمين',
        permissions: ['all'],
      },
      {
        value: 'QUALITY_MANAGER',
        label: 'مدير الجودة',
        description: 'إدارة نظام HACCP والمراقبة والإجراءات التصحيحية',
        permissions: ['haccp_manage', 'reports_view', 'monitoring'],
      },
      {
        value: 'OPERATOR',
        label: 'مشغل',
        description: 'تنفيذ عمليات المراقبة والتسجيل اليومي',
        permissions: ['monitoring', 'records_create'],
      },
      {
        value: 'AUDITOR',
        label: 'مراجع',
        description: 'مراجعة السجلات والتحقق من الامتثال',
        permissions: ['reports_view', 'audit'],
      },
      {
        value: 'NUTRITION_SPECIALIST',
        label: 'أخصائي تغذية',
        description: 'تقديم استشارات غذائية وضمان جودة المكونات',
        permissions: ['nutrition_advice', 'quality_check'],
      },
      {
        value: 'GENERAL_SUPERVISOR',
        label: 'مشرف عام',
        description: 'الإشراف على جميع الفرق والعمليات اليومية',
        permissions: ['supervision', 'reports_view'],
      },
      {
        value: 'QUALITY_INSPECTOR',
        label: 'مراقب جودة',
        description: 'التحقق من جودة المنتجات وعمليات الإنتاج',
        permissions: ['quality_check', 'reports_create'],
      },
      {
        value: 'FOOD_INSPECTOR',
        label: 'مفتش أغذية',
        description: 'فحص سلامة الغذاء والتأكد من الامتثال للوائح',
        permissions: ['food_inspection', 'compliance_check'],
      },
      {
        value: 'FOOD_TECHNICIAN',
        label: 'فني أغذية',
        description: 'تنفيذ الاختبارات والفحوصات التقنية على المواد الغذائية',
        permissions: ['testing', 'lab_work'],
      },
    ];

    return NextResponse.json(roles);
  } catch (error) {
    console.error('Error fetching roles:', error);
    return NextResponse.json(
      { message: 'حدث خطأ في جلب قائمة الأدوار' },
      { status: 500 }
    );
  }
}
