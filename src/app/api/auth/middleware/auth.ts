// src/app/api/auth/middleware/auth.ts
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import { PublicUser } from "@/types/user";

interface JwtPayload {
  id: string;
  role: string;
}

const verifyToken = async (req: NextRequest): Promise<PublicUser | null> => {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;

  const token = authHeader.split(" ")[1];
  if (!token) return null;

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET not defined");

    const decoded = jwt.verify(token, secret) as JwtPayload;
    if (!decoded?.id) return null;

    const user: PublicUser | null = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    return user ?? null;
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
};

// حماية المسارات العامة (يجب تسجيل الدخول)
export const protect = async (req: NextRequest, next: () => Promise<NextResponse>) => {
  const user = await verifyToken(req);

  if (!user) {
    return NextResponse.json({ message: "Not authorized, token failed" }, { status: 401 });
  }

  // أرفق الـ user في request object
  (req as any).user = user;

  return next();
};

// حماية المسؤول
export const admin = async (req: NextRequest, next: () => Promise<NextResponse>) => {
  const user = (req as any).user as PublicUser;
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ message: "Not authorized as an admin" }, { status: 403 });
  }
  return next();
};

// حماية مدير الجودة
export const qualityManager = async (req: NextRequest, next: () => Promise<NextResponse>) => {
  const user = (req as any).user as PublicUser;
  if (!user || !["ADMIN", "QUALITY_MANAGER"].includes(user.role)) {
    return NextResponse.json({ message: "Not authorized as a quality manager" }, { status: 403 });
  }
  return next();
};

