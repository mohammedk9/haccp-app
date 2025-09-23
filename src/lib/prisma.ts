// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

declare global {
  // لتجنب إنشاء عدة نسخ من Prisma Client أثناء التطوير
  // @ts-ignore
  var prisma: PrismaClient | undefined;
}

export const prisma: PrismaClient =
  global.prisma ||
  new PrismaClient({
    log: ['query'],
  });

if (process.env.NODE_ENV !== 'production') global.prisma = prisma;
