'use client';

import { useState, useEffect, useCallback } from 'react';
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
  facilityId: string;
}

export default function CreateCCPPage() {
  const { data: session, status } = useSession();  // ✅ صحيح
  const router = useRouter();  // ✅ منفصل

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
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof CCPFormData, string>>>({});

  const fetchFacilities = useCallback(async () => {
    try {
      const response = await fetch('/api/facilities?limit=100');
      if (response.ok) {
        const data = await response.json();
        setFacilities(data.facilities || []);
      }
    } catch (error) {
      console.error('Error fetching facilities:', error);
      setError('حدث خطأ أثناء تحميل المنشآت');
    }
  }, []);

  const fetchHazards = useCallback(async () => {
    try {
      const response = await fetch('/api/hazards?limit=100');
      if (response.ok) {
        const data = await response.json();
        setHazards(data.hazards || []);
      }
    } catch (error) {
      console.error('Error fetching hazards:', error);
      setError('حدث خطأ أثناء تحميل المخاطر');
    }
  }, []);

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

    Promise.all([fetchFacilities(), fetchHazards()]).then(() => {
      setIsLoading(false);
    });
  }, [session, status, router, fetchFacilities, fetchHazards]);

  useEffect(() => {
    if (formData.facilityId && hazards.length > 0) {
      const filtered = hazards.filter(hazard => hazard.facilityId === formData.facilityId);
      setFilteredHazards(filtered);
      if (filtered.length === 0) {
        setFormData(prev => ({ ...prev, hazardId: '' }));
      }
    } else {
      setFilteredHazards([]);
      setFormData(prev => ({ ...prev, hazardId: '' }));
    }
  }, [formData.facilityId, hazards]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (fieldErrors[name as keyof CCPFormData]) {
      setFieldErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = (): boolean => {
    const errors: Partial<Record<keyof CCPFormData, string>> = {};
    
    if (!formData.name.trim()) errors.name = 'اسم نقطة التحكم مطلوب';
    if (!formData.facilityId) errors.facilityId = 'يجب اختيار المنشأة';
    if (!formData.hazardId) errors.hazardId = 'يجب اختيار الخطر المرتبط';
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsSubmitting(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch('/api/ccps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'فشل في إنشاء نقطة التحكم');
      }

      setMessage('تم إنشاء نقطة التحكم بنجاح');
      setTimeout(() => router.push('/ccps'), 1500);
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
        <div className="loading">
          <span>جاري تحميل البيانات...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="ccps-container">
      <div className="ccps-header">
        <div>
          <h1>إضافة نقطة تحكم حرجة</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px', fontSize: '15px', fontWeight: 500 }}>
            إنشاء نقطة تحكم حرجة جديدة مرتبطة بمنشأة وخطر محدد
          </p>
        </div>
        <Link href="/ccps" className="add-ccp-btn">
          <i className="bi bi-arrow-right"></i>
          رجوع إلى القائمة
        </Link>
      </div>

      {message && (
        <div className="success-message">
          <span className="success-icon"><i className="bi bi-check-circle-fill"></i></span>
          {message}
        </div>
      )}

      {error && (
        <div className="error-message">
          <span className="error-icon"><i className="bi bi-exclamation-triangle-fill"></i></span>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="ccp-form" noValidate>
        <div className="form-section">
          <h3><i className="bi bi-info-circle" style={{ marginLeft: '8px' }}></i>المعلومات الأساسية</h3>
          
          <div className="form-group">
            <label htmlFor="name">
              اسم نقطة التحكم <span style={{ color: 'var(--error-color)' }}>*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="مثال: فحص درجة حرارة التبريد"
              className={fieldErrors.name ? 'input-error' : ''}
            />
            {fieldErrors.name && (
              <span style={{ color: 'var(--error-color)', fontSize: '13px', fontWeight: 600 }}>
                <i className="bi bi-exclamation-circle" style={{ marginLeft: '4px' }}></i>
                {fieldErrors.name}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="facilityId">
              المنشأة <span style={{ color: 'var(--error-color)' }}>*</span>
            </label>
            <select
              id="facilityId"
              name="facilityId"
              value={formData.facilityId}
              onChange={handleChange}
              className={fieldErrors.facilityId ? 'input-error' : ''}
            >
              <option value="">اختر المنشأة</option>
              {facilities.map((facility) => (
                <option key={facility.id} value={facility.id}>
                  {facility.name}
                </option>
              ))}
            </select>
            {fieldErrors.facilityId && (
              <span style={{ color: 'var(--error-color)', fontSize: '13px', fontWeight: 600 }}>
                <i className="bi bi-exclamation-circle" style={{ marginLeft: '4px' }}></i>
                {fieldErrors.facilityId}
              </span>
            )}
            <span style={{ color: 'var(--text-tertiary)', fontSize: '13px', marginTop: '4px' }}>
              <i className="bi bi-info-circle" style={{ marginLeft: '4px' }}></i>
              اختر المنشأة لعرض المخاطر المرتبطة بها
            </span>
          </div>

          <div className="form-group">
            <label htmlFor="hazardId">
              الخطر المرتبط <span style={{ color: 'var(--error-color)' }}>*</span>
            </label>
            <select
              id="hazardId"
              name="hazardId"
              value={formData.hazardId}
              onChange={handleChange}
              disabled={!formData.facilityId || filteredHazards.length === 0}
              className={fieldErrors.hazardId ? 'input-error' : ''}
            >
              <option value="">
                {!formData.facilityId 
                  ? 'اختر المنشأة أولاً' 
                  : filteredHazards.length === 0 
                    ? 'لا توجد مخاطر لهذه المنشأة' 
                    : 'اختر الخطر'}
              </option>
              {filteredHazards.map((hazard) => (
                <option key={hazard.id} value={hazard.id}>
                  {hazard.name} — {getHazardTypeName(hazard.type)}
                </option>
              ))}
            </select>
            {fieldErrors.hazardId && (
              <span style={{ color: 'var(--error-color)', fontSize: '13px', fontWeight: 600 }}>
                <i className="bi bi-exclamation-circle" style={{ marginLeft: '4px' }}></i>
                {fieldErrors.hazardId}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="description">الوصف</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="وصف مختصر لنقطة التحكم وأهميتها..."
              rows={3}
            />
            <span style={{ color: 'var(--text-tertiary)', fontSize: '13px', marginTop: '4px' }}>
              <i className="bi bi-info-circle" style={{ marginLeft: '4px' }}></i>
              اختياري — وصف يوضح الغرض من نقطة التحكم
            </span>
          </div>
        </div>

        <div className="form-section">
          <h3><i className="bi bi-sliders" style={{ marginLeft: '8px' }}></i>معلومات التحكم</h3>
          
          <div className="form-group">
            <label htmlFor="criticalLimit">الحد الحرج</label>
            <textarea
              id="criticalLimit"
              name="criticalLimit"
              value={formData.criticalLimit}
              onChange={handleChange}
              placeholder="مثال: درجة الحرارة يجب أن تكون أقل من 5°C"
              rows={2}
            />
            <span style={{ color: 'var(--text-tertiary)', fontSize: '13px', marginTop: '4px' }}>
              <i className="bi bi-info-circle" style={{ marginLeft: '4px' }}></i>
              الحد الذي لا يجب تجاوزه للحفاظ على السلامة
            </span>
          </div>

          <div className="form-group">
            <label htmlFor="monitoringProcedure">إجراءات المراقبة</label>
            <textarea
              id="monitoringProcedure"
              name="monitoringProcedure"
              value={formData.monitoringProcedure}
              onChange={handleChange}
              placeholder="مثال: قياس درجة الحرارة كل ساعة وتسجيل النتائج"
              rows={3}
            />
            <span style={{ color: 'var(--text-tertiary)', fontSize: '13px', marginTop: '4px' }}>
              <i className="bi bi-info-circle" style={{ marginLeft: '4px' }}></i>
              خطوات المراقبة المتبعة للتأكد من عدم تجاوز الحد الحرج
            </span>
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="submit" 
            className="save-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px', display: 'inline-block' }}></span>
                جاري الحفظ...
              </>
            ) : (
              <>
                <i className="bi bi-check-lg"></i>
                إنشاء نقطة التحكم
              </>
            )}
          </button>
          <Link href="/ccps" className="cancel-btn">
            <i className="bi bi-x-lg"></i>
            إلغاء
          </Link>
        </div>
      </form>
    </div>
  );
}

function getHazardTypeName(type: string): string {
  const typeNames: Record<string, string> = {
    'BIOLOGICAL': 'بيولوجي',
    'CHEMICAL': 'كيميائي',
    'PHYSICAL': 'فيزيائي',
    'ALLERGEN': 'مسبب للحساسية'
  };
  return typeNames[type] || type;
}