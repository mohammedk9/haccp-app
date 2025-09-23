import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import PDFDocument from "pdfkit";
import ExcelJS from "exceljs";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// جلب كل البيانات مع فلترة اختيارية
async function getAllData(filters: any = {}) {
  const { startDate, endDate, facilityId, ccpId, status, userId } = filters;

  const recordWhere: any = {};
  if (startDate) recordWhere.measuredAt = { gte: new Date(startDate) };
  if (endDate) recordWhere.measuredAt = { ...recordWhere.measuredAt, lte: new Date(endDate) };
  if (facilityId) recordWhere.facilityId = facilityId;
  if (ccpId) recordWhere.ccpId = ccpId;
  if (status) recordWhere.status = status;
  if (userId) recordWhere.createdBy = userId;

  return {
    users: await prisma.user.findMany(),
    facilities: await prisma.facility.findMany(),
    hazards: await prisma.hazard.findMany(),
    ccps: await prisma.cCP.findMany(),
    records: await prisma.record.findMany({ where: recordWhere }),
    products: await prisma.product.findMany(),
    haccpPlans: await prisma.haccpPlan.findMany(),
    haccpSteps: await prisma.haccpStep.findMany(),
    haccpRecords: await prisma.haccpRecord.findMany(),
    storages: await prisma.storage.findMany({ include: { logs: true } }),
    auditLogs: await prisma.auditLog.findMany(),
  };
}

// توليد PDF
async function generatePDF(data: any): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 30 });
      const buffers: Buffer[] = [];

      doc.on("data", (chunk) => buffers.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", (err) => reject(err));

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

// توليد Excel (لمسها ممنوع)
async function generateExcel(data: any) {
  const workbook = new ExcelJS.Workbook();

  for (const [key, rows] of Object.entries(data)) {
    const sheet = workbook.addWorksheet(key);

    if ((rows as any[]).length > 0) {
      sheet.addRow(Object.keys((rows as any[])[0])); // header
      (rows as any[]).forEach((row) => sheet.addRow(Object.values(row)));
    } else {
      sheet.addRow(["No records"]);
    }
  }

  return workbook.xlsx.writeBuffer();
}

// GET لجميع التصديرات
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

    const url = new URL(req.url);
    const format = url.searchParams.get("format") || "pdf";

    const filters = {
      startDate: url.searchParams.get("startDate"),
      endDate: url.searchParams.get("endDate"),
      facilityId: url.searchParams.get("facilityId"),
      ccpId: url.searchParams.get("ccpId"),
      status: url.searchParams.get("status"),
      userId: session.user.role === "OPERATOR" ? session.user.id : undefined,
    };

    const data = await getAllData(filters);

    if (format === "excel") {
      const buffer = await generateExcel(data); // Uint8Array
      return new NextResponse(new Uint8Array(buffer), {
        status: 200,
        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": "attachment; filename=full_export.xlsx",
        },
      });
    }

    // PDF
    const buffer = await generatePDF(data); // Buffer
    return new NextResponse(Buffer.from(buffer), { // استخدم buffer.buffer مباشرة
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