'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import './forgot-password.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    if (!email) {
      setError('البريد الإلكتروني مطلوب');
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'حدث خطأ');
      }

      setMessage(data.message);
      setEmail('');

      // إعادة التوجيه بعد 3 ثواني
      setTimeout(() => router.push('/auth-pages/signin'), 3000);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <h1>استعادة كلمة المرور</h1>
        <p>أدخل بريدك الإلكتروني لتلقي رابط إعادة التعيين</p>

        {error && <div className="error-message">{error}</div>}
        {message && <div className="success-message">{message}</div>}

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="البريد الإلكتروني"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'جاري الإرسال...' : 'إرسال رابط إعادة التعيين'}
          </button>
        </form>
      </div>
    </div>
  );
}
