// src/app/hazards/[id]/edit/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import '../../hazards.css';

interface HazardFormData {
  name: string;
  type: string;
  description: string;
  severity: string;
  facilityId: string;
}

interface Facility {
  id: string;
  name: string;
}

interface Hazard {
  id: string;
  name: string;
  type: string;
  description: string;
  severity: string;
  facilityId: string;
  facility: {
    name: string;
  };
}

export default function EditHazardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const hazardId = params.id as string;

  const [formData, setFormData] = useState<HazardFormData>({
    name: '',
    type: 'BIOLOGICAL',
    description: '',
    severity: 'MEDIUM',
    facilityId: ''
  });

  const [facilities, setFacilities] = useState<Facility[]>([]);
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

    fetchFacilities();
    fetchHazardData();
  }, [session, status, router, hazardId]);

  const fetchFacilities = async () => {
    try {
      const response = await fetch('/api/facilities?limit=100');
      if (response.ok) {
        const data = await response.json();
        setFacilities(data.facilities);
      }
    } catch (error) {
      console.error('Error fetching facilities:', error);
    }
  };

  const fetchHazardData = async () => {
    try {
      const response = await fetch(`/api/hazards/${hazardId}`);
      if (!response.ok) {
        throw new Error('فشل في تحميل بيانات الخطر');
      }

      const hazardData: Hazard = await response.json();
      setFormData({
        name: hazardData.name,
        type: hazardData.type,
        description: hazardData.description || '',
        severity: hazardData.severity,
        facilityId: hazardData.facilityId
      });
    } catch (error: any) {
      console.error('Error fetching hazard data:', error);
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
    if (!formData.name || !formData.type || !formData.facilityId) {
      setError('الاسم والنوع والمنشأة مطلوبة');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(`/api/hazards/${hazardId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'فشل في تحديث الخطر');
      }

      setMessage('تم تحديث الخطر بنجاح');
      
      // الانتقال إلى صفحة المخاطر بعد نجاح العملية
      setTimeout(() => {
        router.push('/hazards');
      }, 2000);
    } catch (error: any) {
      console.error('Error updating hazard:', error);
      setError(error.message || 'حدث خطأ أثناء تحديث الخطر');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="hazards-container">
        <div className="loading">جاري تحميل البيانات...</div>
      </div>
    );
  }

  return (
    <div className="hazards-container">
      <div className="hazards-header">
        <h1>تعديل الخطر</h1>
        <Link href="/hazards" className="add-hazard-btn">
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

      <form onSubmit={handleSubmit} className="hazard-form">
        <div className="form-section">
          <h3>المعلومات الأساسية</h3>
          
          <div className="form-group">
            <label htmlFor="name">اسم الخطر *</label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="أدخل اسم الخطر"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="type">نوع الخطر *</label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
            >
              <option value="BIOLOGICAL">بيولوجي</option>
              <option value="CHEMICAL">كيميائي</option>
              <option value="PHYSICAL">فيزيائي</option>
              <option value="ALLERGEN">مسبب للحساسية</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="severity">درجة الخطورة *</label>
            <select
              id="severity"
              name="severity"
              value={formData.severity}
              onChange={handleChange}
              required
            >
              <option value="LOW">منخفض</option>
              <option value="MEDIUM">متوسط</option>
              <option value="HIGH">عالي</option>
              <option value="CRITICAL">حرج</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="facilityId">المنشأة *</label>
            <select
              id="facilityId"
              name="facilityId"
              value={formData.facilityId}
              onChange={handleChange}
              required
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
            <label htmlFor="description">الوصف</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="أدخل وصفاً للخطر (اختياري)"
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
            {isSubmitting ? 'جاري الحفظ...' : 'تحديث'}
          </button>
          <Link href="/hazards" className="cancel-btn">
            إلغاء
          </Link>
        </div>
      </form>
    </div>
  );
}