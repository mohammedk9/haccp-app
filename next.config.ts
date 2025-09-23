// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // تجاهل حزم خارجية أثناء البناء
  serverExternalPackages: ['@prisma/client', 'bcryptjs'],

  // تجاهل تحذيرات ESLint أثناء البناء
  eslint: {
    ignoreDuringBuilds: true,
  },

  // تجاهل تحذيرات TypeScript أثناء البناء
  typescript: {
    ignoreBuildErrors: true,
  },

  // إعدادات الصور
  images: {
    domains: ['localhost'],
  },

  // إزالة console.logs فقط في الإنتاج
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // إعادة كتابة الروابط إذا أحببت
  async rewrites() {
    return [
      {
        source: '/auth/signin',          // الرابط الذي يصل له المستخدم
        destination: '/auth-pages/signin', // الصفحة الفعلية في المشروع
      },
      {
        source: '/auth/forgot-password',
        destination: '/auth-pages/forgot-password',
      },
      {
        source: '/auth/reset-password',
        destination: '/auth-pages/reset-password',
      },
    ];
  },
};

export default nextConfig;
