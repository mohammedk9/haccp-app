// src/app/page.tsx  ← هذا الملف الوحيد، احذف أي page.tsx ثاني
'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import LandingPage from '@/components/landing/LandingPage';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/dashboard');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0f172a] mx-auto"></div>
      </div>
    );
  }

  if (status === 'authenticated') return null;

  return <LandingPage />;
}