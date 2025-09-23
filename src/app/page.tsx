'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';


export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status !== 'loading') {
      if (session) {
        router.replace('/dashboard'); // replace لتجنب push متكرر
      } else {
        router.replace('/auth/signin');
      }
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري التحقق من المصادقة...</p>
        </div>
      </div>
    );
  }

  return null; // لا تعرض محتوى لأن المستخدم سيتم توجيهه
}
