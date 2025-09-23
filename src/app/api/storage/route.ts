// src/app/api/storage/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Json = any;

// GET: قائمة وحدات التخزين مع pagination أو وحدة واحدة عند ?id=
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id") || undefined;

    // إذا تم تمرير id، عرض وحدة واحدة
    if (id) {
      const storage = await prisma.storage.findUnique({
        where: { id },
        include: { logs: { orderBy: { measuredAt: "desc" }, take: 10 } },
      });
      if (!storage) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json(storage);
    }

    // Pagination
    const page = Number(url.searchParams.get("page") || "1");
    const limit = Number(url.searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const [storages, totalStorages] = await Promise.all([
      prisma.storage.findMany({
        include: { logs: { orderBy: { measuredAt: "desc" }, take: 10 } },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.storage.count(),
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
    const body: Json = await req.json();
    if (!body?.resource || !body?.action) {
      return NextResponse.json({ error: "resource and action required" }, { status: 400 });
    }

    // إنشاء وحدة تخزين
    if (body.resource === "storage" && body.action === "create") {
      const { name, type, location, capacity } = body.data ?? {};
      if (!name || !type) return NextResponse.json({ error: "name and type required" }, { status: 400 });

      const storage = await prisma.storage.create({
        data: { name, type, location, capacity },
      });

      return NextResponse.json(storage, { status: 201 });
    }

    // إضافة سجل قياس
    if (body.resource === "log" && body.action === "create") {
      const { storageId, temperature, humidity, cleanliness, measuredAt } = body.data ?? {};
      if (!storageId) return NextResponse.json({ error: "storageId required" }, { status: 400 });

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
    const body: Json = await req.json();
    if (!body?.resource || !body?.action || !body?.data) {
      return NextResponse.json({ error: "resource/action/data required" }, { status: 400 });
    }

    if (body.resource === "storage" && body.action === "update") {
      const { id, name, type, location, capacity } = body.data;
      if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

      const updated = await prisma.storage.update({
        where: { id },
        data: { name, type, location, capacity },
      });

      return NextResponse.json(updated);
    }

    if (body.resource === "log" && body.action === "update") {
      const { id, temperature, humidity, cleanliness, measuredAt } = body.data;
      if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

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
    const body: Json = await req.json();
    if (!body?.resource || !body?.action || !body?.data?.id) {
      return NextResponse.json({ error: "resource/action/data.id required" }, { status: 400 });
    }

    const id = body.data.id;

    if (body.resource === "storage" && body.action === "delete") {
      await prisma.storage.delete({ where: { id } }); // سجلات مرتبطة تُحذف تلقائياً
      return NextResponse.json({ message: "Deleted storage" });
    }

    if (body.resource === "log" && body.action === "delete") {
      await prisma.storageLog.delete({ where: { id } });
      return NextResponse.json({ message: "Deleted log" });
    }

    return NextResponse.json({ error: "Unsupported delete operation" }, { status: 400 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
