'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import './ccps.css';

interface CCP {
  id: string;
  name: string;
  description?: string;
  criticalLimit?: string;
  monitoringProcedure?: string;
  createdAt: string;
  facility: {
    name: string;
  };
  hazard: {
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

interface CCPsResponse {
  ccps: CCP[];
  pagination: Pagination;
}

export default function CCPsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [ccps, setCCPs] = useState<CCP[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // حالة البحث والتصفية
  const [searchTerm, setSearchTerm] = useState('');
  const [facilityFilter, setFacilityFilter] = useState('');
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

    fetchCCPs();
  }, [session, status, router, currentPage, searchTerm, facilityFilter]);

  const fetchCCPs = async () => {
    try {
      setIsLoading(true);
      setError('');

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(facilityFilter && { facilityId: facilityFilter })
      });

      const response = await fetch(`/api/ccps?${params}`);
      
      if (!response.ok) {
        throw new Error('فشل في تحميل بيانات نقاط التحكم الحرجة');
      }

      const data: CCPsResponse = await response.json();
      setCCPs(data.ccps);
      setPagination(data.pagination);
    } catch (error: any) {
      console.error('Error fetching CCPs:', error);
      setError(error.message || 'حدث خطأ أثناء تحميل البيانات');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchCCPs();
  };

  const handleDelete = async (ccpId: string, ccpName: string) => {
    if (!confirm(`هل أنت متأكد من حذف نقطة التحكم "${ccpName}"؟`)) {
      return;
    }

    try {
      const response = await fetch(`/api/ccps/${ccpId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('فشل في حذف نقطة التحكم');
      }

      setMessage('تم حذف نقطة التحكم بنجاح');
      fetchCCPs(); // إعادة تحميل البيانات
    } catch (error: any) {
      console.error('Error deleting CCP:', error);
      setError(error.message || 'حدث خطأ أثناء حذف نقطة التحكم');
    }
  };

  const [message, setMessage] = useState('');

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
        <h1>إدارة نقاط التحكم الحرجة (CCPs)</h1>
        <Link href="/ccps/create" className="add-ccp-btn">
          إضافة نقطة تحكم جديدة
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
            placeholder="ابحث باسم نقطة التحكم أو الوصف..."
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
              setFacilityFilter('');
              setCurrentPage(1);
            }}
            className="reset-btn"
          >
            إعادة تعيين
          </button>
        </form>
      </div>

      {/* جدول نقاط التحكم الحرجة */}
      <div className="ccps-table-container">
        <table className="ccps-table">
          <thead>
            <tr>
              <th>اسم نقطة التحكم</th>
              <th>الوصف</th>
              <th>الحد الحرج</th>
              <th>إجراءات المراقبة</th>
              <th>المنشأة</th>
              <th>الخطر المرتبط</th>
              <th>تم الإضافة بواسطة</th>
              <th>تاريخ الإضافة</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {ccps.length > 0 ? (
              ccps.map((ccp) => (
                <tr key={ccp.id}>
                  <td>
                    {/* جعل اسم نقطة التحكم قابلاً للنقل للنقر للتفاصيل */}
                    <Link 
                      href={`/ccps/${ccp.id}/edit`} 
                      className="ccp-name-link"
                      title="النقر للتفاصيل والتعديل"
                    >
                      <strong>{ccp.name}</strong>
                    </Link>
                  </td>
                  <td className="description-cell">
                    {ccp.description || 'لا يوجد وصف'}
                  </td>
                  <td className="description-cell">
                    {ccp.criticalLimit || 'غير محدد'}
                  </td>
                  <td className="description-cell">
                    {ccp.monitoringProcedure || 'غير محدد'}
                  </td>
                  <td>
                    <span className="facility-badge">
                      {ccp.facility.name}
                    </span>
                  </td>
                  <td>
                    <span className="hazard-badge">
                      {ccp.hazard.name}
                    </span>
                  </td>
                  <td>{ccp.user.name}</td>
                  <td>{new Date(ccp.createdAt).toLocaleDateString('ar-SA')}</td>
                  <td>
                    <div className="action-buttons">
                      {/* زر واحد يجمع بين العرض والتعديل */}
                      <Link 
                        href={`/ccps/${ccp.id}/edit`} 
                        className="edit-btn"
                        title="عرض وتعديل نقطة التحكم"
                      >
                        <i className="bi bi-eye"></i>
                        تفاصيل
                      </Link>
                      <button
                        onClick={() => handleDelete(ccp.id, ccp.name)}
                        className="delete-btn"
                        title="حذف نقطة التحكم"
                      >
                        <i className="bi bi-trash"></i>
                        حذف
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="no-data">
                  لا توجد نقاط تحكم حرجة
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
          إجمالي نقاط التحكم الحرجة: {pagination.total}
        </div>
      )}
    </div>
  );
}