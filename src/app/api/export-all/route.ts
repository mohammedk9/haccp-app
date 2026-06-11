import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import PDFDocument from "pdfkit";
import ExcelJS from "exceljs";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import fs from "fs";
import path from "path";
import { getUserFacilityIds } from "@/lib/permissions";

async function getAllData(filters: any = {}, userId: string, role: string) {
  const { startDate, endDate, facilityId, ccpId, status } = filters;
  const facilityIds = await getUserFacilityIds(userId, role);

  const recordWhere: any = {};
  if (startDate) recordWhere.measuredAt = { gte: new Date(startDate) };
  if (endDate) recordWhere.measuredAt = { ...recordWhere.measuredAt, lte: new Date(endDate) };
  if (ccpId) recordWhere.ccpId = ccpId;
  if (status) recordWhere.status = status;

  // فلترة حسب المنشآت المسموحة
  if (facilityIds !== null) {
    if (facilityId && facilityIds.includes(facilityId)) {
      recordWhere.facilityId = facilityId;
    } else {
      recordWhere.facilityId = { in: facilityIds };
    }
  } else if (facilityId) {
    recordWhere.facilityId = facilityId;
  }

  // فلترة المنشآت نفسها
  const facilityWhere: any = {};
  if (facilityIds !== null) facilityWhere.id = { in: facilityIds };

  return {
    users: facilityIds === null ? await prisma.user.findMany() : [], // لا تصدير للمستخدمين إلا للمشرف العام
    facilities: await prisma.facility.findMany({ where: facilityWhere }),
    hazards: await prisma.hazard.findMany({
      where: facilityIds !== null ? { facilityId: { in: facilityIds } } : {},
    }),
    ccps: await prisma.cCP.findMany({
      where: facilityIds !== null ? { facilityId: { in: facilityIds } } : {},
    }),
    records: await prisma.record.findMany({ where: recordWhere }),
    products: await prisma.product.findMany({
      where: facilityIds !== null ? { facilityId: { in: facilityIds } } : {},
    }),
    haccpPlans: await prisma.haccpPlan.findMany({
      where: facilityIds !== null ? { facilityId: { in: facilityIds } } : {},
    }),
    haccpSteps: await prisma.haccpStep.findMany(), // الخطوات تتبع الخطط، لكن يمكن تركها
    haccpRecords: await prisma.haccpRecord.findMany(),
    storages: await prisma.storage.findMany({
      where: facilityIds !== null ? { facilityId: { in: facilityIds } } : {},
      include: { logs: true },
    }),
    auditLogs: facilityIds === null ? await prisma.auditLog.findMany() : [], // سجلات التدقيق فقط للمشرف
  };
}

async function generatePDF(data: any): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 30 });
      const buffers: Buffer[] = [];

      doc.on("data", (chunk) => buffers.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", (err) => reject(err));

      // محاولة تحميل خط عربي
      try {
        const fontPath = path.join(process.cwd(), "public", "fonts", "NotoNaskhArabic-Regular.ttf");
        if (fs.existsSync(fontPath)) {
          doc.registerFont("Arabic", fs.readFileSync(fontPath));
          doc.font("Arabic");
        }
      } catch { /* لا يفعل شيء */ }

      doc.fontSize(20).text("Full HACCP System Export", { align: "center" });
      doc.moveDown();

      Object.keys(data).forEach((key) => {
        doc.fontSize(16).text(key.toUpperCase());
        doc.moveDown(0.5);

        if (!data[key] || data[key].length === 0) {
          doc.text("No records");
        } else {
          data[key].forEach((row: any, i: number) => {
            doc.text(`${i + 1}. ${JSON.stringify(row)}`);
          });
        }
        doc.moveDown();
      });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

async function generateExcel(data: any) {
  const workbook = new ExcelJS.Workbook();

  for (const [key, rows] of Object.entries(data)) {
    const sheet = workbook.addWorksheet(key);

    if ((rows as any[]).length > 0) {
      sheet.addRow(Object.keys((rows as any[])[0]));
      (rows as any[]).forEach((row) => sheet.addRow(Object.values(row)));
    } else {
      sheet.addRow(["No records"]);
    }
  }

  return workbook.xlsx.writeBuffer();
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

    const url = new URL(req.url);
    const format = url.searchParams.get("format") || "pdf";

    const filters = {
      startDate: url.searchParams.get("startDate"),
      endDate: url.searchParams.get("endDate"),
      facilityId: url.searchParams.get("facilityId"),
      ccpId: url.searchParams.get("ccpId"),
      status: url.searchParams.get("status"),
    };

    const data = await getAllData(filters, session.user.id, session.user.role);

    if (format === "excel") {
      const buffer = await generateExcel(data);
      return new NextResponse(new Uint8Array(buffer), {
        status: 200,
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": "attachment; filename=full_export.xlsx",
        },
      });
    }

    // PDF
    const buffer = await generatePDF(data);
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=full_export.pdf",
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}