// src/app/facilities/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import './facilities.css';

interface Facility {
  id: string;
  name: string;
  location: string;
  type: string;
  description?: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface FacilitiesResponse {
  facilities: Facility[];
  pagination: Pagination;
}

export default function FacilitiesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // حالة البحث والتصفية
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;

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
  }, [session, status, router, currentPage, searchTerm]);

  const fetchFacilities = async () => {
    try {
      setIsLoading(true);
      setError('');

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
        ...(searchTerm && { search: searchTerm })
      });

      const response = await fetch(`/api/facilities?${params}`);
      
      if (!response.ok) {
        throw new Error('فشل في تحميل بيانات المنشآت');
      }

      const data: FacilitiesResponse = await response.json();
      setFacilities(data.facilities);
      setPagination(data.pagination);
    } catch (error: any) {
      console.error('Error fetching facilities:', error);
      setError(error.message || 'حدث خطأ أثناء تحميل البيانات');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchFacilities();
  };

  const handleDelete = async (facilityId: string, facilityName: string) => {
    if (!confirm(`هل أنت متأكد من حذف المنشأة "${facilityName}"؟`)) {
      return;
    }

    try {
      const response = await fetch(`/api/facilities/${facilityId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('فشل في حذف المنشأة');
      }

      setMessage('تم حذف المنشأة بنجاح');
      fetchFacilities(); // إعادة تحميل البيانات
    } catch (error: any) {
      console.error('Error deleting facility:', error);
      setError(error.message || 'حدث خطأ أثناء حذف المنشأة');
    }
  };

  const [message, setMessage] = useState('');

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
        <h1>إدارة المنشآت</h1>
        <Link href="/facilities/add" className="add-facility-btn">
          إضافة منشأة جديدة
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

      {/* شريط البحث */}
      <div className="filters-section">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="ابحث باسم المنشأة أو الموقع..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-btn">
            بحث
          </button>
          <button 
            type="button" 
            onClick={() => {
              setSearchTerm('');
              setCurrentPage(1);
            }}
            className="reset-btn"
          >
            إعادة تعيين
          </button>
        </form>
      </div>

      {/* جدول المنشآت */}
      <div className="facilities-table-container">
        <table className="facilities-table">
          <thead>
            <tr>
              <th>اسم المنشأة</th>
              <th>الموقع</th>
              <th>النوع</th>
              <th>الوصف</th>
              <th>المالك</th>
              <th>تاريخ الإنشاء</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {facilities.length > 0 ? (
              facilities.map((facility) => (
                <tr key={facility.id}>
                  <td>{facility.name}</td>
                  <td>{facility.location}</td>
                  <td>
                    <span className="type-badge">
                      {getFacilityTypeName(facility.type)}
                    </span>
                  </td>
                  <td className="description-cell">
                    {facility.description || 'لا يوجد وصف'}
                  </td>
                  <td>{facility.user.name}</td>
                  <td>{new Date(facility.createdAt).toLocaleDateString('ar-SA')}</td>
                  <td>
                    <div className="action-buttons">
                      <Link href={`/facilities/edit/${facility.id}`} className="edit-btn">
                        تعديل
                      </Link>
                      <button
                        onClick={() => handleDelete(facility.id, facility.name)}
                        className="delete-btn"
                      >
                        حذف
                      </button>
                      <Link href={`/facilities/view/${facility.id}`} className="view-btn">
                        عرض
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="no-data">
                  لا توجد منشآت
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* الترقيم (Pagination) */}
      {pagination && pagination.pages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(pagination.page - 1)}
            disabled={pagination.page <= 1}
            className="pagination-btn"
          >
            السابق
          </button>
          
          <span className="pagination-info">
            الصفحة {pagination.page} من {pagination.pages}
          </span>
          
          <button
            onClick={() => setCurrentPage(pagination.page + 1)}
            disabled={pagination.page >= pagination.pages}
            className="pagination-btn"
          >
            التالي
          </button>
        </div>
      )}

      {pagination && (
        <div className="total-count">
          إجمالي المنشآت: {pagination.total}
        </div>
      )}
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