import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: "البريد الإلكتروني مطلوب" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ message: "لا يوجد مستخدم بهذا البريد" }, { status: 404 });
    }

    if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET غير معرف");

    // إنشاء token صالح لمدة ساعة واحدة
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    // رابط إعادة التعيين
    const resetUrl = `${process.env.NEXTAUTH_URL}/auth-pages/reset-password?token=${token}`;

    // TODO: إرسال البريد عبر مزود البريد الإلكتروني (SendGrid، NodeMailer، إلخ)
    console.log("Reset password link:", resetUrl);

    return NextResponse.json({ message: "تم إرسال رابط إعادة تعيين كلمة المرور. تحقق من بريدك الإلكتروني." });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ message: error.message || "حدث خطأ" }, { status: 500 });
  }
}
