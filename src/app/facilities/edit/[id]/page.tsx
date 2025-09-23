// src/app/facilities/edit/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import '../facilities.css';

interface FacilityFormData {
  name: string;
  location: string;
  type: string;
  description: string;
}

interface FacilityType {
  value: string;
  label: string;
}

export default function EditFacilityPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const facilityId = params.id as string;
  const isEditMode = facilityId !== 'add';

  const [formData, setFormData] = useState<FacilityFormData>({
    name: '',
    location: '',
    type: 'RESTAURANT',
    description: ''
  });

  const [facilityTypes, setFacilityTypes] = useState<FacilityType[]>([
    { value: 'RESTAURANT', label: 'مطعم' },
    { value: 'HOTEL', label: 'فندق' },
    { value: 'CAFE', label: 'مقهى' },
    { value: 'BAKERY', label: 'مخبز' },
    { value: 'CATERING', label: 'خدمات التغذية' },
    { value: 'HOSPITAL', label: 'مستشفى' },
    { value: 'SCHOOL', label: 'مدرسة' },
    { value: 'UNIVERSITY', label: 'جامعة' },
    { value: 'FACTORY', label: 'مصنع' },
    { value: 'STORE', label: 'متجر' },
    { value: 'SUPERMARKET', label: 'سوبرماركت' },
    { value: 'OTHER', label: 'أخرى' }
  ]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth-pages/signin');
      return;
    }

    if (!['ADMIN', 'QUALITY_MANAGER'].includes(session.user.role)) {
      router.push('/dashboard');
      return;
    }

    if (isEditMode) {
      fetchFacilityData();
    } else {
      setIsLoading(false);
    }
  }, [session, status, router, isEditMode, facilityId]);

  const fetchFacilityData = async () => {
    try {
      const response = await fetch(`/api/facilities/${facilityId}`);
      if (!response.ok) {
        throw new Error('فشل في تحميل بيانات المنشأة');
      }

      const facilityData = await response.json();
      setFormData({
        name: facilityData.name,
        location: facilityData.location,
        type: facilityData.type,
        description: facilityData.description || ''
      });
    } catch (error: any) {
      console.error('Error fetching facility data:', error);
      setError(error.message || 'حدث خطأ أثناء تحميل البيانات');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');
    setError('');

    // التحقق من صحة البيانات
    if (!formData.name || !formData.location || !formData.type) {
      setError('الاسم والموقع والنوع مطلوبون');
      setIsSubmitting(false);
      return;
    }

    try {
      const url = isEditMode ? `/api/facilities/${facilityId}` : '/api/facilities';
      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `فشل في ${isEditMode ? 'تحديث' : 'إنشاء'} المنشأة`);
      }

      setMessage(`تم ${isEditMode ? 'تحديث' : 'إنشاء'} المنشأة بنجاح`);
      
      // الانتقال إلى صفحة المنشآت بعد نجاح العملية
      setTimeout(() => {
        router.push('/facilities');
      }, 2000);
    } catch (error: any) {
      console.error('Error saving facility:', error);
      setError(error.message || `حدث خطأ أثناء ${isEditMode ? 'تحديث' : 'إنشاء'} المنشأة`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="facilities-container">
        <div className="loading">جاري تحميل البيانات...</div>
      </div>
    );
  }

  return (
    <div className="facilities-container">
      <div className="facilities-header">
        <h1>{isEditMode ? 'تعديل المنشأة' : 'إضافة منشأة جديدة'}</h1>
        <Link href="/facilities" className="add-facility-btn">
          رجوع إلى القائمة
        </Link>
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

      <form onSubmit={handleSubmit} className="facility-form">
        <div className="form-section">
          <h3>المعلومات الأساسية</h3>
          
          <div className="form-group">
            <label htmlFor="name">اسم المنشأة *</label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="أدخل اسم المنشأة"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="location">الموقع *</label>
            <input
              id="location"
              name="location"
              type="text"
              value={formData.location}
              onChange={handleChange}
              placeholder="أدخل موقع المنشأة"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="type">نوع المنشأة *</label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
            >
              {facilityTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="description">الوصف</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="أدخل وصفاً للمنشأة (اختياري)"
              rows={4}
            />
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="submit" 
            className="save-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'جاري الحفظ...' : (isEditMode ? 'تحديث' : 'إنشاء')}
          </button>
          <Link href="/facilities" className="cancel-btn">
            إلغاء
          </Link>
        </div>
      </form>
    </div>
  );
}