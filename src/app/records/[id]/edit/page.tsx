// src/app/records/[id]/edit/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
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

interface Record {
  id: string;
  value: string;
  status: string;
  notes: string;
  facilityId: string;
  ccpId: string;
  measuredAt: string;
  facility: {
    name: string;
  };
  ccp: {
    name: string;
  };
}

export default function EditRecordPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const recordId = params.id as string;

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
    fetchCCPs();
    fetchRecordData();
  }, [session, status, router, recordId]);

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

  const fetchCCPs = async () => {
    try {
      const response = await fetch('/api/ccps?limit=100');
      if (response.ok) {
        const data = await response.json();
        setCCPs(data.ccps);
      }
    } catch (error) {
      console.error('Error fetching CCPs:', error);
    }
  };

  const fetchRecordData = async () => {
    try {
      const response = await fetch(`/api/records/${recordId}`);
      if (!response.ok) {
        throw new Error('فشل في تحميل بيانات السجل');
      }

      const recordData: Record = await response.json();
      setFormData({
        value: recordData.value,
        status: recordData.status || 'NORMAL',
        notes: recordData.notes || '',
        facilityId: recordData.facilityId,
        ccpId: recordData.ccpId,
        measuredAt: new Date(recordData.measuredAt).toISOString().slice(0, 16)
      });
    } catch (error: any) {
      console.error('Error fetching record data:', error);
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
    if (!formData.value || !formData.facilityId || !formData.ccpId) {
      setError('القيمة والمنشأة ونقطة التحكم مطلوبة');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(`/api/records/${recordId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'فشل في تحديث السجل');
      }

      setMessage('تم تحديث السجل بنجاح');
      
      // الانتقال إلى صفحة السجلات بعد نجاح العملية
      setTimeout(() => {
        router.push('/records');
      }, 2000);
    } catch (error: any) {
      console.error('Error updating record:', error);
      setError(error.message || 'حدث خطأ أثناء تحديث السجل');
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
        <h1>تعديل السجل</h1>
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
            >
              <option value="">اختر نقطة التحكم</option>
              {ccps.map((ccp) => (
                <option key={ccp.id} value={ccp.id}>
                  {ccp.name} - {ccp.facility.name}
                </option>
              ))}
            </select>
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
            {isSubmitting ? 'جاري الحفظ...' : 'تحديث'}
          </button>
          <Link href="/records" className="cancel-btn">
            إلغاء
          </Link>
        </div>
      </form>
    </div>
  );
}