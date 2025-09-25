'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import './reset-password.css';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token'); // يأتي من الرابط المرسل بالبريد

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!password || !confirmPassword) {
      setError('جميع الحقول مطلوبة');
      return;
    }

    if (password !== confirmPassword) {
      setError('كلمة المرور غير متطابقة');
      return;
    }

    if (!token) {
      setError('الرابط غير صالح');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, token }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'حدث خطأ');
      }

      setMessage('تم تغيير كلمة المرور بنجاح! سيتم إعادة التوجيه لتسجيل الدخول.');
      setTimeout(() => router.push('/auth-pages/signin'), 3000);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="reset-password-container">
      <div className="reset-password-card">
        <h1>إعادة تعيين كلمة المرور</h1>
        {error && <div className="error-message">{error}</div>}
        {message && <div className="success-message">{message}</div>}

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="كلمة المرور الجديدة"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="تأكيد كلمة المرور"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'جاري التغيير...' : 'تغيير كلمة المرور'}
          </button>
        </form>
      </div>
    </div>
  );
}
