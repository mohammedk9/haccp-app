import { Suspense } from 'react';
import ResetPasswordForm from './ResetPasswordForm';

// يفضل استخدام مكون تحميل خاص بك، وإذا لم يكن موجودًا يمكنك استخدام نص عادي.
function FallbackLoader() {
  return (
    <div className="reset-password-container">
      <div className="reset-password-card" style={{ textAlign: 'center', padding: '40px' }}>
        <p style={{ fontSize: '1.2rem', color: '#64748b' }}>جاري التحقق من رابط إعادة التعيين...</p>
      </div>
    </div>
  );
}

// هذا هو المكون الرئيسي للصفحة (Server Component افتراضيًا)
export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<FallbackLoader />}>
            <ResetPasswordForm />
        </Suspense>
    );
}