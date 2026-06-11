import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import generateToken from "../utils/generateToken";

const prisma = new PrismaClient();

export const registerUser = async (req: NextRequest) => {
  try {
    const { name, email, password, role } = await req.json();

    // ✅ منع الأدوار الحساسة من التسجيل العام
    const forbiddenRoles: Role[] = ['ADMIN', 'SUPER_ADMIN', 'QUALITY_MANAGER'];
    if (role && forbiddenRoles.includes(role as Role)) {
      return NextResponse.json(
        { message: "لا يمكن التسجيل بهذا الدور. للحصول على دور مدير أو مشرف، يُرجى التواصل عبر البريد: mohammdk9559@gmail.com" },
        { status: 403 }
      );
    }

    const userExists = await prisma.user.findUnique({
      where: { email },
    });

    if (userExists) {
      return NextResponse.json({ message: "هذا البريد مستخدم بالفعل" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: (role as Role) || Role.OPERATOR,
      },
    });

    return NextResponse.json(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user.id),
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
};