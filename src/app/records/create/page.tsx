// src/app/records/create/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import '../records.css';

interface RecordFormData {
  value: string;
  status: string;
  notes: string;
  facilityId: string;
  ccpId: string;
  measuredAt: string;
}

interface Facility {
  id: string;
  name: string;
}

interface CCP {
  id: string;
  name: string;
  facility: {
    name: string;
  };
}

export default function CreateRecordPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [formData, setFormData] = useState<RecordFormData>({
    value: '',
    status: 'NORMAL',
    notes: '',
    facilityId: '',
    ccpId: '',
    measuredAt: new Date().toISOString().slice(0, 16)
  });

  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [ccps, setCCPs] = useState<CCP[]>([]);
  const [filteredCCPs, setFilteredCCPs] = useState<CCP[]>([]);
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

  useEffect(() => {
    // تصفية نقاط التحكم عند تغيير المنشأة
    if (formData.facilityId) {
      const filtered = ccps.filter(ccp => ccp.facility.name === facilities.find(f => f.id === formData.facilityId)?.name);
      setFilteredCCPs(filtered);
      if (filtered.length > 0) {
        setFormData(prev => ({ ...prev, ccpId: filtered[0].id }));
      } else {
        setFormData(prev => ({ ...prev, ccpId: '' }));
      }
    } else {
      setFilteredCCPs([]);
      setFormData(prev => ({ ...prev, ccpId: '' }));
    }
  }, [formData.facilityId, ccps, facilities]);

  const fetchFacilities = async () => {
    try {
      const response = await fetch('/api/facilities?limit=100');
      if (response.ok) {
        const data = await response.json();
        setFacilities(data.facilities);
        if (data.facilities.length > 0) {
          setFormData(prev => ({ ...prev, facilityId: data.facilities[0].id }));
          fetchCCPs();
        } else {
          setIsLoading(false);
        }
      }
    } catch (error) {
      console.error('Error fetching facilities:', error);
      setError('حدث خطأ أثناء تحميل المنشآت');
      setIsLoading(false);
    }
  };

  const fetchCCPs = async () => {
    try {
      const response = await fetch('/api/ccps?limit=100');
      if (response.ok) {
        const data = await response.json();
        setCCPs(data.ccps);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error fetching CCPs:', error);
      setError('حدث خطأ أثناء تحميل نقاط التحكم');
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
    if (!formData.value || !formData.facilityId || !formData.ccpId) {
      setError('القيمة والمنشأة ونقطة التحكم مطلوبة');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/records', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'فشل في إنشاء السجل');
      }

      setMessage('تم إنشاء السجل بنجاح');
      
      // الانتقال إلى صفحة السجلات بعد نجاح العملية
      setTimeout(() => {
        router.push('/records');
      }, 2000);
    } catch (error: any) {
      console.error('Error creating record:', error);
      setError(error.message || 'حدث خطأ أثناء إنشاء السجل');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="records-container">
        <div className="loading">جاري تحميل البيانات...</div>
      </div>
    );
  }

  return (
    <div className="records-container">
      <div className="records-header">
        <h1>إضافة سجل جديد</h1>
        <Link href="/records" className="add-record-btn">
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

      <form onSubmit={handleSubmit} className="record-form">
        <div className="form-section">
          <h3>المعلومات الأساسية</h3>
          
          <div className="form-group">
            <label htmlFor="value">القيمة *</label>
            <input
              id="value"
              name="value"
              type="text"
              value={formData.value}
              onChange={handleChange}
              placeholder="أدخل قيمة القياس"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="status">الحالة *</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
            >
              <option value="NORMAL">طبيعي</option>
              <option value="WARNING">تحذير</option>
              <option value="CRITICAL">حرج</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="measuredAt">وقت القياس *</label>
            <input
              id="measuredAt"
              name="measuredAt"
              type="datetime-local"
              value={formData.measuredAt}
              onChange={handleChange}
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
            <label htmlFor="ccpId">نقطة التحكم *</label>
            <select
              id="ccpId"
              name="ccpId"
              value={formData.ccpId}
              onChange={handleChange}
              required
              disabled={!formData.facilityId}
            >
              <option value="">اختر نقطة التحكم</option>
              {filteredCCPs.map((ccp) => (
                <option key={ccp.id} value={ccp.id}>
                  {ccp.name}
                </option>
              ))}
            </select>
            {!formData.facilityId && (
              <p className="field-hint">يجب اختيار المنشأة أولاً</p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="notes">الملاحظات</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="أدخل ملاحظات إضافية (اختياري)"
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
          <Link href="/records" className="cancel-btn">
            إلغاء
          </Link>
        </div>
      </form>
    </div>
  );
}