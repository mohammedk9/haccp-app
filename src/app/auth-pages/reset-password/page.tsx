import { Suspense } from 'react';
import ResetPasswordForm from './ResetPasswordForm';
import './reset-password.css';

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>جاري التحميل...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}