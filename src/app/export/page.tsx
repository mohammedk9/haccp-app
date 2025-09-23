// src/app/export/page.tsx
'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import './export.css';

export default function ExportPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'excel'>('pdf');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  if (status === 'loading') {
    return (
      <div className="export-container">
        <div className="loading">جاري التحقق من الصلاحية...</div>
      </div>
    );
  }

  if (!session) {
    router.push('/auth-pages/signin');
    return null;
  }

  // التحقق من صلاحية المستخدم (يفترض أن يكون لديه صلاحية ADMIN)
  if (session.user.role !== 'ADMIN') {
    router.push('/dashboard');
    return null;
  }

const handleExport = async () => {
  try {
    setIsExporting(true);
    setError('');
    setMessage('');

    const response = await fetch(`/api/export-all?format=${exportFormat}`);
    if (!response.ok) throw new Error('فشل في تصدير البيانات');

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `haccp_export_${new Date().toISOString().split('T')[0]}.${exportFormat === 'pdf' ? 'pdf' : 'xlsx'}`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    setMessage('تم تصدير البيانات بنجاح');
  } catch (err: any) {
    console.error('Export error:', err);
    setError(err.message || 'حدث خطأ أثناء تصدير البيانات');
  } finally {
    setIsExporting(false);
  }
};
  return (
    <div className="export-container">
      <div className="export-header">
        <h1>تصدير بيانات النظام</h1>
        <p>تصدير جميع بيانات نظام HACCP بصيغة PDF أو Excel</p>
      </div>

      {message && (
        <div className="success-message">
          <span className="success-icon">✅</span>
          {message}
        </div>
      )}

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      <div className="export-content">
        <div className="export-card">
          <div className="export-icon">
            {exportFormat === 'pdf' ? (
              <i className="bi bi-file-earmark-pdf"></i>
            ) : (
              <i className="bi bi-file-earmark-excel"></i>
            )}
          </div>
          
          <h2>تصدير كامل للبيانات</h2>
          <p>سيتم تصدير جميع البيانات المتاحة في النظام بما في ذلك:</p>
          
          <ul className="data-list">
            <li>المستخدمين والصلاحيات</li>
            <li>المنشآت والمرافق</li>
            <li>المخاطر ونقاط التحكم الحرجة (CCPs)</li>
            <li>السجلات والمنتجات</li>
            <li>خطط HACCP وسجلات التنفيذ</li>
            <li>وحدات التخزين وقراءاتها</li>
            <li>سجلات التدقيق</li>
          </ul>

          <div className="format-selector">
            <label>اختر صيغة التصدير:</label>
            <div className="format-options">
              <button
                type="button"
                className={`format-option ${exportFormat === 'pdf' ? 'active' : ''}`}
                onClick={() => setExportFormat('pdf')}
              >
                <i className="bi bi-file-earmark-pdf"></i>
                PDF
              </button>
              <button
                type="button"
                className={`format-option ${exportFormat === 'excel' ? 'active' : ''}`}
                onClick={() => setExportFormat('excel')}
              >
                <i className="bi bi-file-earmark-excel"></i>
                Excel
              </button>
            </div>
          </div>

          <div className="export-actions">
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="export-btn"
            >
              {isExporting ? (
                <>
                  <span className="spinner"></span>
                  جاري التصدير...
                </>
              ) : (
                <>
                  <i className="bi bi-download"></i>
                  تصدير البيانات
                </>
              )}
            </button>
          </div>

          <div className="export-note">
            <i className="bi bi-info-circle"></i>
            <p>
              عملية التصدير قد تستغرق بعض الوقت حسب كمية البيانات الموجودة في النظام.
              يوصى بعدم إغلاق الصفحة حتى اكتمال عملية التصدير.
            </p>
          </div>
        </div>

        <div className="export-info">
          <h3>معلومات حول التصدير</h3>
          <div className="info-cards">
            <div className="info-card">
              <div className="info-icon">
                <i className="bi bi-database"></i>
              </div>
              <h4>بيانات كاملة</h4>
              <p>يشمل التصدير جميع البيانات المخزنة في النظام بدون استثناء</p>
            </div>
            
            <div className="info-card">
              <div className="info-icon">
                <i className="bi bi-shield-lock"></i>
              </div>
              <h4>آمن ومحمي</h4>
              <p>البيانات المصدرة مشفرة ومحمية بكلمة مرور حسب الحاجة</p>
            </div>
            
            <div className="info-card">
              <div className="info-icon">
                <i className="bi bi-clock-history"></i>
              </div>
              <h4>نسخ احتياطية</h4>
              <p>يمكن استخدام الملف المصدر كنسخة احتياطية للبيانات</p>
            </div>
            
            <div className="info-card">
              <div className="info-icon">
                <i className="bi bi-graph-up"></i>
              </div>
              <h4>تحليل البيانات</h4>
              <p>الملف بصيغة Excel يسمح بتحليل البيانات وإعداد التقارير</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}