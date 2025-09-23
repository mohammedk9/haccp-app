import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { PrismaClient, Record as PrismaRecord } from '@prisma/client';

const prisma = new PrismaClient();

// GET جميع السجلات
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const facilityId = searchParams.get('facilityId') ?? undefined;
    const ccpId = searchParams.get('ccpId') ?? undefined;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    const skip = (page - 1) * limit;

    let where: Record<string, any> = {};

    // التصفية حسب الصلاحيات
    if (session.user.role === 'OPERATOR') {
      where.createdBy = session.user.id;
    }

    if (facilityId) where.facilityId = facilityId;
    if (ccpId) where.ccpId = ccpId;

    const records: (PrismaRecord & {
      facility: { name: string };
      ccp: { name: string };
      user: { name: string; email: string };
    })[] = await prisma.record.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        facility: { select: { name: true } },
        ccp: { select: { name: true } },
        user: { select: { name: true, email: true } },
      },
    });

    const total = await prisma.record.count({ where });

    return NextResponse.json({
      records,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Records GET Error:', error);
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}

// POST إنشاء سجل جديد
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const body: {
      value: string;
      status?: string;
      notes?: string;
      facilityId: string;
      ccpId: string;
    } = await request.json();

    const { value, status, notes, facilityId, ccpId } = body;

    if (!value || !facilityId || !ccpId) {
      return NextResponse.json(
        { error: 'القيمة والمنشأة ونقطة التحكم مطلوبة' },
        { status: 400 }
      );
    }

    const record: PrismaRecord & {
      facility: { name: string };
      ccp: { name: string };
      user: { name: string; email: string };
    } = await prisma.record.create({
      data: {
        value,
        status,
        notes,
        facilityId,
        ccpId,
        createdBy: session.user.id,
      },
      include: {
        facility: { select: { name: true } },
        ccp: { select: { name: true } },
        user: { select: { name: true, email: true } },
      },
    });

    // تسجيل العملية
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
    console.error('Records POST Error:', error);
    return NextResponse.json({ error: 'خطأ في إنشاء السجل' }, { status: 500 });
  }
}

