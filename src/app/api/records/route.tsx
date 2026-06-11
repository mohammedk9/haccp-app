import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getUserFacilityIds } from '@/lib/permissions';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

    const facilityIds = await getUserFacilityIds(session.user.id, session.user.role);
    if (facilityIds !== null && facilityIds.length === 0) {
      return NextResponse.json({ records: [], pagination: { page: 1, limit: 10, total: 0, pages: 0 } });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const reqFacilityId = searchParams.get('facilityId');
    const ccpId = searchParams.get('ccpId');
    const skip = (page - 1) * limit;

    const where: any = {};
    if (session.user.role === 'OPERATOR') where.createdBy = session.user.id;
    if (facilityIds !== null) {
      where.facilityId = reqFacilityId && facilityIds.includes(reqFacilityId) ? reqFacilityId : { in: facilityIds };
    } else if (reqFacilityId) {
      where.facilityId = reqFacilityId;
    }
    if (ccpId) where.ccpId = ccpId;

    const [records, total] = await Promise.all([
      prisma.record.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          facility: { select: { name: true } },
          ccp: { select: { name: true } },
          user: { select: { name: true, email: true } },
        },
      }),
      prisma.record.count({ where }),
    ]);

    return NextResponse.json({
      records,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

    const body = await request.json();
    const { value, status, notes, facilityId, ccpId } = body;
    if (!value || !facilityId || !ccpId) {
      return NextResponse.json({ error: 'القيمة والمنشأة ونقطة التحكم مطلوبة' }, { status: 400 });
    }

    const facilityIds = await getUserFacilityIds(session.user.id, session.user.role);
    if (facilityIds !== null && !facilityIds.includes(facilityId)) {
      return NextResponse.json({ error: 'منشأة غير مصرح بها' }, { status: 403 });
    }

    const record = await prisma.record.create({
      data: { value, status, notes, facilityId, ccpId, createdBy: session.user.id },
      include: {
        facility: { select: { name: true } },
        ccp: { select: { name: true } },
        user: { select: { name: true, email: true } },
      },
    });

    await prisma.auditLog.create({
      data: {
        action: 'CREATE_RECORD',
        targetId: record.id,
        targetType: 'RECORD',
        userId: session.user.id,
        details: `تم إنشاء سجل لنقطة التحكم: ${record.ccp.name}`,
      },
    });

    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'خطأ في إنشاء السجل' }, { status: 500 });
  }
}