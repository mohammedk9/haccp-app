'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import './reset-password.css';

export default function ResetPasswordForm() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [token, setToken] = useState('');

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    } else {
      setError('رابط إعادة التعيين غير صحيح');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    if (!password || !confirmPassword) {
      setError('كلمة المرور وتأكيدها مطلوبان');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('كلمة المرور يجب أن تكون على الأقل 6 أحرف');
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('كلمة المرور غير متطابقة');
      setIsLoading(false);
      return;
    }

    if (!token) {
      setError('رابط إعادة التعيين غير صحيح');
      setIsLoading(false);
      return;
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setMessage('تم إعادة تعيين كلمة المرور بنجاح');
      
      setTimeout(() => {
        router.push('/auth-pages/signin');
      }, 2000);
      
    } catch (error) {
      setError('حدث خطأ أثناء إعادة تعيين كلمة المرور. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  };

  if (error && !token) {
    return (
      <div className="reset-password-container">
        <div className="reset-password-card">
          <div className="error-state">
            <div className="error-icon">❌</div>
            <h2>رابط غير صحيح</h2>
            <p>{error}</p>
            <Link href="/auth-pages/forgot-password" className="link-button">
              طلب رابط جديد
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="reset-password-container">
      <div className="reset-password-card">
        <div className="reset-password-header">
          <h1>تعيين كلمة مرور جديدة</h1>
          <p>أدخل كلمة المرور الجديدة لحسابك</p>
        </div>

        <form onSubmit={handleSubmit} className="reset-password-form">
          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          {message && (
            <div className="success-message">
              <span className="success-icon">✅</span>
              {message}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="password">كلمة المرور الجديدة</label>
            <input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="أدخل كلمة المرور الجديدة (6 أحرف على الأقل)"
              required
              minLength={6}
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">تأكيد كلمة المرور</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="أعد إدخال كلمة المرور الجديدة"
              required
              disabled={isLoading}
            />
          </div>

          <button 
            type="submit" 
            className="submit-button"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner"></span>
                جاري التعيين...
              </>
            ) : (
              'تعيين كلمة المرور'
            )}
          </button>
        </form>

        <div className="reset-password-footer">
          <p>
            <Link href="/auth-pages/signin" className="link">
              العودة لتسجيل الدخول
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}