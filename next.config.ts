import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  serverExternalPackages: ['@prisma/client', 'bcryptjs'],

  images: {
    domains: ['localhost'],
  },

  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  async rewrites() {
    return [
      {
        source: '/auth/signin',          // الرابط الذي تريد المستخدم الوصول إليه
        destination: '/auth-pages/signin' // مسار الصفحة الفعلي في المشروع
      }
    ]
  }
}

export default nextConfig;
