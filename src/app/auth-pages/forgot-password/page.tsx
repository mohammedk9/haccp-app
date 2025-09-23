// src/app/auth-pages/forgot-password/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import './forgot-password.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    if (!email) {
      setError('البريد الإلكتروني مطلوب');
      setIsLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('صيغة البريد الإلكتروني غير صحيحة');
      setIsLoading(false);
      return;
    }

    try {
      // محاكاة لإرسال رابط إعادة تعيين كلمة المرور
      // في التطبيق الحقيقي، سيتم استبدال هذا باستدعاء API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // في التطبيق الحقيقي، هنا سيتم:
      // 1. التحقق من وجود البريد الإلكتروني في قاعدة البيانات
      // 2. إنشاء token فريد
      // 3. إرسال بريد إلكتروني يحتوي على رابط إعادة التعيين
      
      setMessage('تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني');
      setEmail('');
      
      // إعادة التوجيه إلى صفحة تسجيل الدخول بعد 3 ثواني
      setTimeout(() => {
        router.push('/auth-pages/signin');
      }, 3000);
      
    } catch (error) {
      setError('حدث خطأ أثناء إرسال رابط إعادة التعيين. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <div className="forgot-password-header">
          <h1>استعادة كلمة المرور</h1>
          <p>أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور</p>
        </div>

        <form onSubmit={handleSubmit} className="forgot-password-form">
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
            <label htmlFor="email">البريد الإلكتروني</label>
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="أدخل بريدك الإلكتروني المسجل"
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
                جاري الإرسال...
              </>
            ) : (
              'إرسال رابط التعيين'
            )}
          </button>
        </form>

        <div className="forgot-password-footer">
          <p>
            تذكرت كلمة المرور؟{' '}
            <Link href="/auth-pages/signin" className="link">
              العودة لتسجيل الدخول
            </Link>
          </p>
          <p>
            ليس لديك حساب؟{' '}
            <Link href="/auth-pages/register" className="link">
              إنشاء حساب جديد
            </Link>
          </p>
        </div>

        <div className="security-notice">
          <div className="notice-icon">🔒</div>
          <div className="notice-content">
            <h4>نصائح أمنية</h4>
            <ul>
              <li>الرابط سيكون صالحاً لمدة 60 دقيقة فقط</li>
              <li>تأكد من استخدامك لبريد إلكتروني صحيح</li>
              <li>تحقق من مجلد البريد العشوائي إذا لم تستلم الرسالة</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}