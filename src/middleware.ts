// src/middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse, type NextRequest } from "next/server";
import type { JWT } from "next-auth/jwt";

export default withAuth(
  function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // مع App Router، لا يمكن الوصول لـ token عبر req.nextauth
    // سيأتي التحقق عبر callbacks.authorized
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        if (!token) return false;

        const pathname = token?.sub || ""; // أو أي قيمة تستخدم للتحقق

        // حماية مسارات API حسب الصلاحيات
        // هنا يمكنك التحقق من token.role
        if (pathname.startsWith("/api/admin")) {
          return token.role === "ADMIN";
        }

        if (pathname.startsWith("/api/quality")) {
          return ["ADMIN", "QUALITY_MANAGER"].includes(token.role || "");
        }

        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    "/api/facilities/:path*",
    "/api/hazards/:path*",
    "/api/ccps/:path*",
    "/api/records/:path*",
    "/dashboard/:path*",
    "/admin/:path*",
    "/quality/:path*",
  ],
};
