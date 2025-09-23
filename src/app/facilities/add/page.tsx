// src/app/facilities/add/page.tsx
'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import '../facilities.css';

interface FacilityFormData {
  name: string;
  location: string;
  type: string;
  description: string;
}

export default function AddFacilityPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const [formData, setFormData] = useState<FacilityFormData>({
    name: '',
    location: '',
    type: '',
    description: ''
  });

  if (status === 'loading') {
    return (
      <div className="facilities-container">
        <div className="loading">جاري التحقق من الصلاحية...</div>
      </div>
    );
  }

  if (!session) {
    router.push('/auth-pages/signin');
    return null;
  }

  // التحقق من صلاحية المستخدم
  if (!['ADMIN', 'QUALITY_MANAGER'].includes(session.user.role)) {
    router.push('/dashboard');
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.location || !formData.type) {
      setError('الاسم والموقع والنوع مطلوبون');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      setMessage('');

      const response = await fetch('/api/facilities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'فشل في إنشاء المنشأة');
      }

      const facility = await response.json();
      
      setMessage('تم إنشاء المنشأة بنجاح');
      
      // الانتقال إلى صفحة المنشأة بعد ثانيتين
      setTimeout(() => {
        router.push(`/facilities/${facility.id}`);
      }, 2000);

    } catch (err: any) {
      console.error('Create facility error:', err);
      setError(err.message || 'حدث خطأ أثناء إنشاء المنشأة');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="facilities-container">
      <div className="facilities-header">
        <div className="breadcrumb">
          <Link href="/facilities" className="breadcrumb-link">
            المنشآت
          </Link>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">إضافة منشأة جديدة</span>
        </div>
        <h1>إضافة منشأة جديدة</h1>
        <p>أدخل معلومات المنشأة الجديدة في النموذج أدناه</p>
      </div>

      {message && (
        <div className="success-message">
          <span className="success-icon">✅</span>
          {message}
          <span className="redirect-text">سيتم تحويلك إلى صفحة المنشأة خلال ثانيتين...</span>
        </div>
      )}

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      <div className="facility-form-container">
        <form onSubmit={handleSubmit} className="facility-form">
          <div className="form-section">
            <h3>المعلومات الأساسية</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="name" className="form-label">
                  اسم المنشأة *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="أدخل اسم المنشأة"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="location" className="form-label">
                  الموقع *
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="أدخل موقع المنشأة"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="type" className="form-label">
                  نوع المنشأة *
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="form-select"
                  required
                >
                  <option value="">اختر نوع المنشأة</option>
                  <option value="RESTAURANT">مطعم</option>
                  <option value="HOTEL">فندق</option>
                  <option value="HOSPITAL">مستشفى</option>
                  <option value="SCHOOL">مدرسة</option>
                  <option value="FACTORY">مصنع</option>
                  <option value="WAREHOUSE">مستودع</option>
                  <option value="SUPERMARKET">سوبرماركت</option>
                  <option value="CAFETERIA">كافيتيريا</option>
                  <option value="BAKERY">مخبز</option>
                  <option value="OTHER">أخرى</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>وصف المنشأة</h3>
            <div className="form-group">
              <label htmlFor="description" className="form-label">
                الوصف
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="form-textarea"
                placeholder="أدخل وصفاً للمنشأة (اختياري)"
                rows={4}
              />
              <div className="form-help">
                يمكنك إضافة وصف تفصيلي للمنشأة يتضمن الأنشطة والخدمات المقدمة
              </div>
            </div>
          </div>

          <div className="form-actions">
            <Link href="/facilities" className="cancel-btn">
              إلغاء
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="submit-btn"
            >
              {isSubmitting ? (
                <>
                  <span className="spinner"></span>
                  جاري الإنشاء...
                </>
              ) : (
                <>
                  <i className="bi bi-check-lg"></i>
                  إنشاء المنشأة
                </>
              )}
            </button>
          </div>
        </form>

        <div className="form-sidebar">
          <div className="sidebar-card">
            <div className="sidebar-icon">
              <i className="bi bi-info-circle"></i>
            </div>
            <h4>معلومات مهمة</h4>
            <ul>
              <li>الحقول marked with * are required</li>
              <li>تأكد من صحة المعلومات قبل الحفظ</li>
              <li>يمكنك تعديل المعلومات لاحقاً</li>
              <li>سيتم تسجيل العملية في سجل التدقيق</li>
            </ul>
          </div>

          <div className="sidebar-card">
            <div className="sidebar-icon">
              <i className="bi bi-shield-check"></i>
            </div>
            <h4>متطلبات HACCP</h4>
            <p>
              بعد إنشاء المنشأة، يمكنك إضافة المخاطر ونقاط التحكم الحرجة (CCPs)
              الخاصة بها وفقاً لمتطلبات نظام HACCP.
            </p>
          </div>

          <div className="sidebar-card">
            <div className="sidebar-icon">
              <i className="bi bi-people"></i>
            </div>
            <h4>إدارة المستخدمين</h4>
            <p>
              يمكنك لاحقاً إضافة مستخدمين وإسنادهم إلى هذه المنشأة لإدارة
              العمليات اليومية.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}