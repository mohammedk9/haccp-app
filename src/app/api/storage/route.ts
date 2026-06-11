import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFacilityIds } from "@/lib/permissions";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

type Json = any;

// GET: قائمة وحدات التخزين مع pagination أو وحدة واحدة عند ?id=
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

    const url = new URL(req.url);
    const id = url.searchParams.get("id") || undefined;

    if (id) {
      const storage = await prisma.storage.findUnique({
        where: { id },
        include: { logs: { orderBy: { measuredAt: "desc" }, take: 10 } },
      });
      if (!storage) return NextResponse.json({ error: "Not found" }, { status: 404 });

      // تحقق من الصلاحية
      const facilityIds = await getUserFacilityIds(session.user.id, session.user.role);
      if (facilityIds !== null && storage.facilityId && !facilityIds.includes(storage.facilityId)) {
        return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
      }
      return NextResponse.json(storage);
    }

    // Pagination
    const page = Number(url.searchParams.get("page") || "1");
    const limit = Number(url.searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const facilityIds = await getUserFacilityIds(session.user.id, session.user.role);
    const where: any = {};
    if (facilityIds !== null) {
      where.facilityId = { in: facilityIds };
    }

    const [storages, totalStorages] = await Promise.all([
      prisma.storage.findMany({
        where,
        include: { logs: { orderBy: { measuredAt: "desc" }, take: 10 } },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.storage.count({ where }),
    ]);

    const totalPages = Math.ceil(totalStorages / limit);

    return NextResponse.json({
      storages,
      pagination: {
        currentPage: page,
        totalPages,
        totalStorages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST: إنشاء وحدة تخزين أو إضافة سجل قياس
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

    const body: Json = await req.json();
    if (!body?.resource || !body?.action) {
      return NextResponse.json({ error: "resource and action required" }, { status: 400 });
    }

    if (body.resource === "storage" && body.action === "create") {
      const { name, type, location, capacity, facilityId } = body.data ?? {};
      if (!name || !type) return NextResponse.json({ error: "name and type required" }, { status: 400 });

      // التحقق من صلاحية المنشأة إن وُجدت
      const facilityIds = await getUserFacilityIds(session.user.id, session.user.role);
      if (facilityIds !== null && facilityId && !facilityIds.includes(facilityId)) {
        return NextResponse.json({ error: "منشأة غير مصرح بها" }, { status: 403 });
      }

      const storage = await prisma.storage.create({
        data: { name, type, location, capacity, facilityId: facilityId || null },
      });

      return NextResponse.json(storage, { status: 201 });
    }

    if (body.resource === "log" && body.action === "create") {
      const { storageId, temperature, humidity, cleanliness, measuredAt } = body.data ?? {};
      if (!storageId) return NextResponse.json({ error: "storageId required" }, { status: 400 });

      // التحقق من أن وحدة التخزين تنتمي لمنشأة مصرح بها
      const storage = await prisma.storage.findUnique({ where: { id: storageId }, select: { facilityId: true } });
      if (!storage) return NextResponse.json({ error: "Storage not found" }, { status: 404 });

      const facilityIds = await getUserFacilityIds(session.user.id, session.user.role);
      if (facilityIds !== null && storage.facilityId && !facilityIds.includes(storage.facilityId)) {
        return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
      }

      const date = measuredAt ? new Date(measuredAt) : new Date();

      const log = await prisma.storageLog.create({
        data: {
          storage: { connect: { id: storageId } },
          temperature: temperature !== undefined ? Number(temperature) : undefined,
          humidity: humidity !== undefined ? Number(humidity) : undefined,
          cleanliness,
          measuredAt: date,
        },
      });

      return NextResponse.json(log, { status: 201 });
    }

    return NextResponse.json({ error: "Unsupported resource/action" }, { status: 400 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// PUT: تحديث وحدة تخزين أو سجل قياس
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

    const body: Json = await req.json();
    if (!body?.resource || !body?.action || !body?.data) {
      return NextResponse.json({ error: "resource/action/data required" }, { status: 400 });
    }

    if (body.resource === "storage" && body.action === "update") {
      const { id, name, type, location, capacity, facilityId } = body.data;
      if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

      const existing = await prisma.storage.findUnique({ where: { id }, select: { facilityId: true } });
      if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

      const facilityIds = await getUserFacilityIds(session.user.id, session.user.role);
      if (facilityIds !== null && existing.facilityId && !facilityIds.includes(existing.facilityId)) {
        return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
      }

      const updated = await prisma.storage.update({
        where: { id },
        data: { name, type, location, capacity, facilityId },
      });

      return NextResponse.json(updated);
    }

    if (body.resource === "log" && body.action === "update") {
      const { id, temperature, humidity, cleanliness, measuredAt } = body.data;
      if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

      const log = await prisma.storageLog.findUnique({ where: { id }, include: { storage: { select: { facilityId: true } } } });
      if (!log) return NextResponse.json({ error: "Log not found" }, { status: 404 });

      const facilityIds = await getUserFacilityIds(session.user.id, session.user.role);
      if (facilityIds !== null && log.storage.facilityId && !facilityIds.includes(log.storage.facilityId)) {
        return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
      }

      const updated = await prisma.storageLog.update({
        where: { id },
        data: {
          temperature: temperature !== undefined ? Number(temperature) : undefined,
          humidity: humidity !== undefined ? Number(humidity) : undefined,
          cleanliness,
          measuredAt: measuredAt ? new Date(measuredAt) : undefined,
        },
      });

      return NextResponse.json(updated);
    }

    return NextResponse.json({ error: "Unsupported update operation" }, { status: 400 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// DELETE: حذف وحدة تخزين أو سجل
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

    const body: Json = await req.json();
    if (!body?.resource || !body?.action || !body?.data?.id) {
      return NextResponse.json({ error: "resource/action/data.id required" }, { status: 400 });
    }

    const id = body.data.id;

    if (body.resource === "storage" && body.action === "delete") {
      const existing = await prisma.storage.findUnique({ where: { id }, select: { facilityId: true } });
      if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

      const facilityIds = await getUserFacilityIds(session.user.id, session.user.role);
      if (facilityIds !== null && existing.facilityId && !facilityIds.includes(existing.facilityId)) {
        return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
      }

      await prisma.storage.delete({ where: { id } });
      return NextResponse.json({ message: "Deleted storage" });
    }

    if (body.resource === "log" && body.action === "delete") {
      const log = await prisma.storageLog.findUnique({ where: { id }, include: { storage: { select: { facilityId: true } } } });
      if (!log) return NextResponse.json({ error: "Log not found" }, { status: 404 });

      const facilityIds = await getUserFacilityIds(session.user.id, session.user.role);
      if (facilityIds !== null && log.storage.facilityId && !facilityIds.includes(log.storage.facilityId)) {
        return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
      }

      await prisma.storageLog.delete({ where: { id } });
      return NextResponse.json({ message: "Deleted log" });
    }

    return NextResponse.json({ error: "Unsupported delete operation" }, { status: 400 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
