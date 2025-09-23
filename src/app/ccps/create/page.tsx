// src/app/ccps/create/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import '../ccps.css';

interface CCPFormData {
  name: string;
  description: string;
  criticalLimit: string;
  monitoringProcedure: string;
  facilityId: string;
  hazardId: string;
}

interface Facility {
  id: string;
  name: string;
}

interface Hazard {
  id: string;
  name: string;
  type: string;
   description?: string;
  severity?: string;
  facilityId: string;
}

export default function CreateCCPPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [formData, setFormData] = useState<CCPFormData>({
    name: '',
    description: '',
    criticalLimit: '',
    monitoringProcedure: '',
    facilityId: '',
    hazardId: ''
  });

  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [hazards, setHazards] = useState<Hazard[]>([]);
  const [filteredHazards, setFilteredHazards] = useState<Hazard[]>([]);
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
    fetchHazards();
  }, [session, status, router]);

useEffect(() => {
  if (formData.facilityId && hazards.length > 0) {
    const filtered = hazards.filter(hazard => hazard.facilityId === formData.facilityId);
    setFilteredHazards(filtered);
  } else {
    setFilteredHazards([]);
  }
}, [formData.facilityId, hazards]);


 const fetchFacilities = async () => {
  try {
    const response = await fetch('/api/facilities?limit=100');
    if (response.ok) {
      const data = await response.json();
      setFacilities(data.facilities);

      // لا تعيّن facilityId مباشرة هنا
      // سيتم تعيينه بعد جلب المخاطر تلقائياً
    }
  } catch (error) {
    console.error('Error fetching facilities:', error);
    setError('حدث خطأ أثناء تحميل المنشآت');
  }
};

  const fetchHazards = async () => {
  try {
    const response = await fetch('/api/hazards?limit=100');
    if (response.ok) {
      const data = await response.json();
      setHazards(data.hazards);

      // بعد جلب المخاطر، إذا لم يكن هناك facilityId محدد، عيّنه بالمنشأة الأولى
      if (!formData.facilityId && facilities.length > 0) {
        setFormData(prev => ({ ...prev, facilityId: facilities[0].id }));
      }

      setIsLoading(false);
    }
  } catch (error) {
    console.error('Error fetching hazards:', error);
    setError('حدث خطأ أثناء تحميل المخاطر');
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
    if (!formData.name || !formData.facilityId || !formData.hazardId) {
      setError('الاسم والمنشأة والخطر مطلوبة');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/ccps', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'فشل في إنشاء نقطة التحكم');
      }

      setMessage('تم إنشاء نقطة التحكم بنجاح');
      
      // الانتقال إلى صفحة نقاط التحكم بعد نجاح العملية
      setTimeout(() => {
        router.push('/ccps');
      }, 2000);
    } catch (error: any) {
      console.error('Error creating CCP:', error);
      setError(error.message || 'حدث خطأ أثناء إنشاء نقطة التحكم');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="ccps-container">
        <div className="loading">جاري تحميل البيانات...</div>
      </div>
    );
  }

  return (
    <div className="ccps-container">
      <div className="ccps-header">
        <h1>إضافة نقطة تحكم حرجة جديدة</h1>
        <Link href="/ccps" className="add-ccp-btn">
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

      <form onSubmit={handleSubmit} className="ccp-form">
        <div className="form-section">
          <h3>المعلومات الأساسية</h3>
          
          <div className="form-group">
            <label htmlFor="name">اسم نقطة التحكم *</label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="أدخل اسم نقطة التحكم"
              required
            />
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
            <label htmlFor="hazardId">الخطر المرتبط *</label>
            <select
              id="hazardId"
              name="hazardId"
              value={formData.hazardId}
              onChange={handleChange}
              required
            >
              <option value="">اختر الخطر</option>
              {filteredHazards.map((hazard) => (
                <option key={hazard.id} value={hazard.id}>
                  {hazard.name} - {getHazardTypeName(hazard.type)}
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
              placeholder="أدخل وصفاً لنقطة التحكم (اختياري)"
              rows={3}
            />
          </div>
        </div>

        <div className="form-section">
          <h3>معلومات التحكم</h3>
          
          <div className="form-group">
            <label htmlFor="criticalLimit">الحد الحرج</label>
            <textarea
              id="criticalLimit"
              name="criticalLimit"
              value={formData.criticalLimit}
              onChange={handleChange}
              placeholder="أدخل الحد الحرج للتحكم (مثال: درجة الحرارة يجب أن تكون أقل من 5°C)"
              rows={2}
            />
          </div>

          <div className="form-group">
            <label htmlFor="monitoringProcedure">إجراءات المراقبة</label>
            <textarea
              id="monitoringProcedure"
              name="monitoringProcedure"
              value={formData.monitoringProcedure}
              onChange={handleChange}
              placeholder="أدخل إجراءات المراقبة (مثال: قياس درجة الحرارة كل ساعة)"
              rows={3}
            />
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="submit" 
            className="save-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'جاري الحفظ...' : 'إنشاء'}
          </button>
          <Link href="/ccps" className="cancel-btn">
            إلغاء
          </Link>
        </div>
      </form>
    </div>
  );
}

// دالة مساعدة لتحويل أنواع المخاطر
function getHazardTypeName(type: string): string {
  const typeNames: { [key: string]: string } = {
    'BIOLOGICAL': 'بيولوجي',
    'CHEMICAL': 'كيميائي',
    'PHYSICAL': 'فيزيائي',
    'ALLERGEN': 'مسبب للحساسية'
  };
  return typeNames[type] || type;
}