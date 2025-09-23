// src/app/haccp-plans/create/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import '../haccp-plans.css';

interface PlanFormData {
  title: string;
  description: string;
  facilityId: string; // ← أضف هذا السطر
  type: string;
  stepNumber: number;
  isCCP: boolean;
  hazardType: string;
  hazardLevel: string;
}

interface Facility {
  id: string;
  name: string;
}

export default function CreateHaccpPlanPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [facilities, setFacilities] = useState<Facility[]>([]);

  const [formData, setFormData] = useState<PlanFormData>({
  title: '',
  description: '',
  facilityId: '',
  type: '',
  stepNumber: 1,
  isCCP: false,
  hazardType: '',
  hazardLevel: ''
});

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

    fetchFacilities();
  }, [session, status, router]);

  const fetchFacilities = async () => {
    try {
      const response = await fetch('/api/facilities?limit=100');
      if (response.ok) {
        const data = await response.json();
        setFacilities(data.facilities);
      }
    } catch (error) {
      console.error('Error fetching facilities:', error);
      setError('حدث خطأ أثناء تحميل المنشآت');
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
    if (!formData.title) {
      setError('عنوان الخطة مطلوب');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/haccp-plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          userId: session?.user?.id
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'فشل في إنشاء الخطة');
      }

      setMessage('تم إنشاء الخطة بنجاح');
      
      // الانتقال إلى صفحة الخطوات بعد نجاح العملية
      setTimeout(() => {
        router.push(`/haccp-plans/${data.id}/steps`);
      }, 2000);
    } catch (error: any) {
      console.error('Error creating plan:', error);
      setError(error.message || 'حدث خطأ أثناء إنشاء الخطة');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="haccp-plans-container">
        <div className="loading">جاري تحميل البيانات...</div>
      </div>
    );
  }

  return (
    <div className="haccp-plans-container">
      <div className="haccp-plans-header">
        <h1>إنشاء خطة HACCP جديدة</h1>
        <Link href="/haccp-plans" className="add-plan-btn">
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

      <form onSubmit={handleSubmit} className="plan-form">
        <div className="form-section">
          <h3>المعلومات الأساسية</h3>
          
          <div className="form-group">
            <label htmlFor="title">عنوان الخطة *</label>
            <input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              placeholder="أدخل عنوان الخطة"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="facilityId">المنشأة (اختياري)</label>
            <select
              id="facilityId"
              name="facilityId"
              value={formData.facilityId}
              onChange={handleChange}
            >
              <option value="">اختر المنشأة</option>
              {facilities.map((facility) => (
                <option key={facility.id} value={facility.id}>
                  {facility.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="description">وصف الخطة</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="أدخل وصفاً للخطة (اختياري)"
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
            {isSubmitting ? 'جاري الإنشاء...' : 'إنشاء الخطة'}
          </button>
          <Link href="/haccp-plans" className="cancel-btn">
            إلغاء
          </Link>
        </div>
      </form>
    </div>
  );
}