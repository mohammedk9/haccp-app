// src/app/hazards/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import './hazards.css';

interface Hazard {
  id: string;
  name: string;
  type: string;
  description?: string;
  severity: string;
  createdAt: string;
  facility: {
    name: string;
  };
  user: {
    name: string;
    email: string;
  };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface HazardsResponse {
  hazards: Hazard[];
  pagination: Pagination;
}

export default function HazardsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [hazards, setHazards] = useState<Hazard[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // حالة البحث والتصفية
  const [searchTerm, setSearchTerm] = useState('');
  const [facilityFilter, setFacilityFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
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

    fetchHazards();
  }, [session, status, router, currentPage, searchTerm, facilityFilter, typeFilter, severityFilter]);

  const fetchHazards = async () => {
    try {
      setIsLoading(true);
      setError('');

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(facilityFilter && { facilityId: facilityFilter })
      });

      const response = await fetch(`/api/hazards?${params}`);
      
      if (!response.ok) {
        throw new Error('فشل في تحميل بيانات المخاطر');
      }

      const data: HazardsResponse = await response.json();
      setHazards(data.hazards);
      setPagination(data.pagination);
    } catch (error: any) {
      console.error('Error fetching hazards:', error);
      setError(error.message || 'حدث خطأ أثناء تحميل البيانات');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchHazards();
  };

  const handleDelete = async (hazardId: string, hazardName: string) => {
    if (!confirm(`هل أنت متأكد من حذف الخطر "${hazardName}"؟`)) {
      return;
    }

    try {
      const response = await fetch(`/api/hazards/${hazardId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('فشل في حذف الخطر');
      }

      setMessage('تم حذف الخطر بنجاح');
      fetchHazards(); // إعادة تحميل البيانات
    } catch (error: any) {
      console.error('Error deleting hazard:', error);
      setError(error.message || 'حدث خطأ أثناء حذف الخطر');
    }
  };

  const [message, setMessage] = useState('');

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
        <h1>إدارة المخاطر</h1>
        <Link href="/hazards/create" className="add-hazard-btn">
          إضافة خطر جديد
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

      {/* شريط البحث والتصفية */}
      <div className="filters-section">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="ابحث باسم الخطر أو الوصف..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">جميع الأنواع</option>
            <option value="BIOLOGICAL">بيولوجي</option>
            <option value="CHEMICAL">كيميائي</option>
            <option value="PHYSICAL">فيزيائي</option>
            <option value="ALLERGEN">مسبب للحساسية</option>
          </select>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">جميع درجات الخطورة</option>
            <option value="LOW">منخفض</option>
            <option value="MEDIUM">متوسط</option>
            <option value="HIGH">عالي</option>
            <option value="CRITICAL">حرج</option>
          </select>

          <button type="submit" className="search-btn">
            بحث
          </button>
          <button 
            type="button" 
            onClick={() => {
              setSearchTerm('');
              setTypeFilter('');
              setSeverityFilter('');
              setFacilityFilter('');
              setCurrentPage(1);
            }}
            className="reset-btn"
          >
            إعادة تعيين
          </button>
        </form>
      </div>

      {/* جدول المخاطر */}
      <div className="hazards-table-container">
        <table className="hazards-table">
          <thead>
            <tr>
              <th>اسم الخطر</th>
              <th>النوع</th>
              <th>درجة الخطورة</th>
              <th>الوصف</th>
              <th>المنشأة</th>
              <th>تم الإضافة بواسطة</th>
              <th>تاريخ الإضافة</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {hazards.length > 0 ? (
              hazards.map((hazard) => (
                <tr key={hazard.id}>
                  <td>{hazard.name}</td>
                  <td>
                    <span className={`type-badge ${hazard.type.toLowerCase()}`}>
                      {getHazardTypeName(hazard.type)}
                    </span>
                  </td>
                  <td>
                    <span className={`severity-badge ${hazard.severity.toLowerCase()}`}>
                      {getSeverityName(hazard.severity)}
                    </span>
                  </td>
                  <td className="description-cell">
                    {hazard.description || 'لا يوجد وصف'}
                  </td>
                  <td>{hazard.facility.name}</td>
                  <td>{hazard.user.name}</td>
                  <td>{new Date(hazard.createdAt).toLocaleDateString('ar-SA')}</td>
                  <td>
                    <div className="action-buttons">
                      <Link href={`/hazards/${hazard.id}/edit`} className="edit-btn">
                        تعديل
                      </Link>
                      <button
                        onClick={() => handleDelete(hazard.id, hazard.name)}
                        className="delete-btn"
                      >
                        حذف
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="no-data">
                  لا توجد مخاطر
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
          إجمالي المخاطر: {pagination.total}
        </div>
      )}
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

// دالة مساعدة لتحويل درجات الخطورة
function getSeverityName(severity: string): string {
  const severityNames: { [key: string]: string } = {
    'LOW': 'منخفض',
    'MEDIUM': 'متوسط',
    'HIGH': 'عالي',
    'CRITICAL': 'حرج'
  };
  return severityNames[severity] || severity;
}