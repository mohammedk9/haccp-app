import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // 1. الخصائص القديمة التي تم إزالتها (eslint)
  // 2. تم تحديث إعدادات الصور

  // تجاهل حزم خارجية أثناء البناء
  serverExternalPackages: ['@prisma/client', 'bcryptjs'],

  // تجاهل تحذيرات TypeScript أثناء البناء
  typescript: {
    ignoreBuildErrors: true,
  },

  // إعدادات الصور (تم استبدال domains بـ remotePatterns)
  images: {
    remotePatterns: [
      {
        protocol: 'http', // يمكن أن يكون http أو https
        hostname: 'localhost',
        port: '', // اتركها فارغة إذا لم يكن هناك منفذ محدد (مثل http://localhost)
        pathname: '**', // السماح بأي مسار بعد localhost
      },
    ],
  },

  // إزالة console.logs فقط في الإنتاج
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // إعادة كتابة الروابط (لا يوجد تغيير هنا)
  async rewrites() {
    return [
      {
        source: '/auth/signin',
        destination: '/auth-pages/signin',
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