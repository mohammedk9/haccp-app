import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json({ message: "Token وكلمة المرور مطلوبان" }, { status: 400 });
    }

    if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET غير معرف");

    // التحقق من صلاحية token
    let payload: any;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return NextResponse.json({ message: "الرابط غير صالح أو منتهي الصلاحية" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    if (!user) {
      return NextResponse.json({ message: "المستخدم غير موجود" }, { status: 404 });
    }

    // تحديث كلمة المرور
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return NextResponse.json({ message: "تم تغيير كلمة المرور بنجاح" });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ message: error.message || "حدث خطأ" }, { status: 500 });
  }
}
