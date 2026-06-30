'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import '../../ccps.css';

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

interface CCP {
  id: string;
  name: string;
  description: string;
  criticalLimit: string;
  monitoringProcedure: string;
  facilityId: string;
  hazardId: string;
  facility: { name: string };
  hazard: { name: string; type: string };
}

export default function EditCCPPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const ccpId = params.id as string;

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
    }
  }, []);

  const fetchCCPData = useCallback(async () => {
    try {
      const response = await fetch(`/api/ccps/${ccpId}`);
      if (!response.ok) throw new Error('فشل في تحميل بيانات نقطة التحكم');

      const ccpData: CCP = await response.json();
      setFormData({
        name: ccpData.name,
        description: ccpData.description || '',
        criticalLimit: ccpData.criticalLimit || '',
        monitoringProcedure: ccpData.monitoringProcedure || '',
        facilityId: ccpData.facilityId,
        hazardId: ccpData.hazardId
      });
    } catch (error: any) {
      console.error('Error fetching CCP data:', error);
      setError(error.message || 'حدث خطأ أثناء تحميل البيانات');
    }
  }, [ccpId]);

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

    Promise.all([fetchFacilities(), fetchHazards(), fetchCCPData()])
      .then(() => setIsLoading(false));
  }, [session, status, router, fetchFacilities, fetchHazards, fetchCCPData]);

  useEffect(() => {
    if (formData.facilityId && hazards.length > 0) {
      const filtered = hazards.filter(h => h.facilityId === formData.facilityId);
      setFilteredHazards(filtered);
    } else {
      setFilteredHazards([]);
    }
  }, [formData.facilityId, hazards]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
      const response = await fetch(`/api/ccps/${ccpId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'فشل في تحديث نقطة التحكم');

      setMessage('تم تحديث نقطة التحكم بنجاح');
      setTimeout(() => router.push('/ccps'), 1500);
    } catch (error: any) {
      console.error('Error updating CCP:', error);
      setError(error.message || 'حدث خطأ أثناء تحديث نقطة التحكم');
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
          <h1>تعديل نقطة التحكم الحرجة</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px', fontSize: '15px', fontWeight: 500 }}>
            تعديل بيانات نقطة التحكم ورصد التغييرات
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
              placeholder="أدخل اسم نقطة التحكم"
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
              placeholder="أدخل وصفاً لنقطة التحكم (اختياري)"
              rows={3}
            />
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
              placeholder="أدخل الحد الحرج للتحكم..."
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
              placeholder="أدخل إجراءات المراقبة..."
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
            {isSubmitting ? (
              <>
                <span className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px', display: 'inline-block' }}></span>
                جاري الحفظ...
              </>
            ) : (
              <>
                <i className="bi bi-check-lg"></i>
                تحديث
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