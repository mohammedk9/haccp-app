// src/app/facilities/view/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import '../facilities.css';

interface Facility {
  id: string;
  name: string;
  location: string;
  type: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  hazards: any[];
  ccps: any[];
}

export default function ViewFacilityPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const facilityId = params.id as string;

  const [facility, setFacility] = useState<Facility | null>(null);
  const [isLoading, setIsLoading] = useState(true);
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

    fetchFacilityData();
  }, [session, status, router, facilityId]);

  const fetchFacilityData = async () => {
    try {
      const response = await fetch(`/api/facilities/${facilityId}`);
      if (!response.ok) {
        throw new Error('فشل في تحميل بيانات المنشأة');
      }

      const facilityData = await response.json();
      setFacility(facilityData);
    } catch (error: any) {
      console.error('Error fetching facility data:', error);
      setError(error.message || 'حدث خطأ أثناء تحميل البيانات');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="facilities-container">
        <div className="loading">جاري تحميل البيانات...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="facilities-container">
        <div className="error-message">{error}</div>
        <Link href="/facilities" className="add-facility-btn">
          رجوع إلى القائمة
        </Link>
      </div>
    );
  }

  if (!facility) {
    return (
      <div className="facilities-container">
        <div className="error-message">المنشأة غير موجودة</div>
        <Link href="/facilities" className="add-facility-btn">
          رجوع إلى القائمة
        </Link>
      </div>
    );
  }

  return (
    <div className="facilities-container">
      <div className="facilities-header">
        <h1>تفاصيل المنشأة</h1>
        <div className="action-buttons">
          <Link href="/facilities" className="add-facility-btn">
            رجوع إلى القائمة
          </Link>
          <Link href={`/facilities/edit/${facility.id}`} className="edit-btn">
            تعديل
          </Link>
        </div>
      </div>

      <div className="facility-details">
        <div className="details-section">
          <h3>المعلومات الأساسية</h3>
          <div className="details-grid">
            <div className="detail-item">
              <span className="detail-label">اسم المنشأة:</span>
              <span className="detail-value">{facility.name}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">الموقع:</span>
              <span className="detail-value">{facility.location}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">النوع:</span>
              <span className="detail-value">{getFacilityTypeName(facility.type)}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">الوصف:</span>
              <span className="detail-value">{facility.description || 'لا يوجد وصف'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">المالك:</span>
              <span className="detail-value">{facility.user.name}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">تاريخ الإنشاء:</span>
              <span className="detail-value">
                {new Date(facility.createdAt).toLocaleDateString('ar-SA')}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">آخر تحديث:</span>
              <span className="detail-value">
                {new Date(facility.updatedAt).toLocaleDateString('ar-SA')}
              </span>
            </div>
          </div>
        </div>

        <div className="details-section">
          <h3>المخاطر ({facility.hazards.length})</h3>
          {facility.hazards.length > 0 ? (
            <ul className="items-list">
              {facility.hazards.map((hazard) => (
                <li key={hazard.id} className="list-item">
                  {hazard.name} - {hazard.type}
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-items">لا توجد مخاطر مسجلة</p>
          )}
        </div>

        <div className="details-section">
          <h3>نقاط التحكم الحرجة ({facility.ccps.length})</h3>
          {facility.ccps.length > 0 ? (
            <ul className="items-list">
              {facility.ccps.map((ccp) => (
                <li key={ccp.id} className="list-item">
                  {ccp.name} - الحد الحرج: {ccp.criticalLimit}
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-items">لا توجد نقاط تحكم حرجة</p>
          )}
        </div>
      </div>
    </div>
  );
}

// دالة مساعدة لتحويل أنواع المنشآت
function getFacilityTypeName(type: string): string {
  const typeNames: { [key: string]: string } = {
    'RESTAURANT': 'مطعم',
    'HOTEL': 'فندق',
    'CAFE': 'مقهى',
    'BAKERY': 'مخبز',
    'CATERING': 'خدمات التغذية',
    'HOSPITAL': 'مستشفى',
    'SCHOOL': 'مدرسة',
    'UNIVERSITY': 'جامعة',
    'FACTORY': 'مصنع',
    'STORE': 'متجر',
    'SUPERMARKET': 'سوبرماركت',
    'OTHER': 'أخرى'
  };
  return typeNames[type] || type;
}