// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  serverExternalPackages: ['@prisma/client', 'bcryptjs'],

  images: {
    domains: ['localhost'],
  },

  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // تجاهل ESLint أثناء البناء
  eslint: {
    ignoreDuringBuilds: true,
  },

  // تجاهل أخطاء TypeScript أثناء البناء
  typescript: {
    ignoreBuildErrors: true,
  },

  // إعادة كتابة الروابط حسب الحاجة
  async rewrites() {
    return [
      {
        source: '/auth/signin',
        destination: '/auth-pages/signin',
      },
    ];
  },
};

export default nextConfig;
