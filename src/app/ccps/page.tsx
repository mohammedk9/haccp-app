'use client';

import { useState, useEffect, useCallback } from 'react';
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
  const [message, setMessage] = useState('');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [facilityFilter, setFacilityFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;

  const fetchCCPs = useCallback(async () => {
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
  }, [currentPage, searchTerm, facilityFilter]);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth-pages/signin');
      return;
    }

    if (!['ADMIN', 'QUALITY_MANAGER', 'SUPER_ADMIN'].includes(session.user.role)) {
      router.push('/dashboard');
      return;
    }

    fetchCCPs();
  }, [session, status, router, fetchCCPs]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchCCPs();
  };

  const handleReset = () => {
    setSearchTerm('');
    setFacilityFilter('');
    setCurrentPage(1);
    fetchCCPs();
  };

  const handleDelete = async (ccpId: string, ccpName: string) => {
    if (!confirm(`هل أنت متأكد من حذف نقطة التحكم "${ccpName}"؟\n\nلا يمكن التراجع عن هذا الإجراء.`)) {
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
      fetchCCPs();
      
      setTimeout(() => setMessage(''), 3000);
    } catch (error: any) {
      console.error('Error deleting CCP:', error);
      setError(error.message || 'حدث خطأ أثناء حذف نقطة التحكم');
      setTimeout(() => setError(''), 5000);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (isLoading && ccps.length === 0) {
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
          <h1>نقاط التحكم الحرجة</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px', fontSize: '15px', fontWeight: 500 }}>
            إدارة ومراقبة نقاط التحكم الحرجة (CCPs) في المنشآت
          </p>
        </div>
        <Link href="/ccps/create" className="add-ccp-btn">
          <i className="bi bi-plus-lg"></i>
          إضافة نقطة تحكم
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

      <div className="filters-section">
        <form onSubmit={handleSearch} className="search-form">
          <div style={{ position: 'relative', flex: 1, minWidth: '280px' }}>
            <i 
              className="bi bi-search" 
              style={{ 
                position: 'absolute', 
                right: '16px', 
                top: '50%', 
                transform: 'translateY(-50%)',
                color: 'var(--text-tertiary)',
                fontSize: '18px'
              }}
            ></i>
            <input
              type="text"
              placeholder="ابحث باسم نقطة التحكم أو الوصف..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
              style={{ paddingRight: '48px' }}
            />
          </div>
          
          <button type="submit" className="search-btn">
            <i className="bi bi-search"></i>
            بحث
          </button>
          <button 
            type="button" 
            onClick={handleReset}
            className="reset-btn"
          >
            <i className="bi bi-arrow-counterclockwise"></i>
            إعادة تعيين
          </button>
        </form>
      </div>

      <div className="ccps-table-container">
        <table className="ccps-table">
          <thead>
            <tr>
              <th><i className="bi bi-gear-wide-connected" style={{ marginLeft: '6px' }}></i>الاسم</th>
              <th>الوصف</th>
              <th>الحد الحرج</th>
              <th>المراقبة</th>
              <th><i className="bi bi-building" style={{ marginLeft: '6px' }}></i>المنشأة</th>
              <th><i className="bi bi-exclamation-diamond" style={{ marginLeft: '6px' }}></i>الخطر</th>
              <th><i className="bi bi-person" style={{ marginLeft: '6px' }}></i>المستخدم</th>
              <th><i className="bi bi-calendar" style={{ marginLeft: '6px' }}></i>التاريخ</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {ccps.length > 0 ? (
              ccps.map((ccp) => (
                <tr key={ccp.id}>
                  <td>
                    <Link 
                      href={`/ccps/${ccp.id}/edit`} 
                      className="ccp-name-link"
                      title="تعديل نقطة التحكم"
                    >
                      <i className="bi bi-pencil-square" style={{ marginLeft: '6px', fontSize: '14px', opacity: 0.7 }}></i>
                      {ccp.name}
                    </Link>
                  </td>
                  <td className="description-cell" title={ccp.description || ''}>
                    {ccp.description || '—'}
                  </td>
                  <td className="description-cell" title={ccp.criticalLimit || ''}>
                    {ccp.criticalLimit || '—'}
                  </td>
                  <td className="description-cell" title={ccp.monitoringProcedure || ''}>
                    {ccp.monitoringProcedure || '—'}
                  </td>
                  <td>
                    <span className="facility-badge">
                      <i className="bi bi-building" style={{ marginLeft: '4px' }}></i>
                      {ccp.facility.name}
                    </span>
                  </td>
                  <td>
                    <span className="hazard-badge">
                      <i className="bi bi-exclamation-triangle" style={{ marginLeft: '4px' }}></i>
                      {ccp.hazard.name}
                    </span>
                  </td>
                  <td>{ccp.user.name}</td>
                  <td>{new Date(ccp.createdAt).toLocaleDateString('ar-SA')}</td>
                  <td>
                    <div className="action-buttons">
                      <Link 
                        href={`/ccps/${ccp.id}/edit`} 
                        className="edit-btn"
                        title="تعديل"
                      >
                        <i className="bi bi-pencil"></i>
                        تعديل
                      </Link>
                      <button
                        onClick={() => handleDelete(ccp.id, ccp.name)}
                        className="delete-btn"
                        title="حذف"
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
                <td colSpan={9} style={{ border: 'none' }}>
                  <div className="no-data">
                    <i className="bi bi-inbox" style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5, display: 'block' }}></i>
                    <p>لا توجد نقاط تحكم حرجة</p>
                    <p style={{ fontSize: '14px', marginTop: '8px', opacity: 0.7 }}>
                      يمكنك إضافة نقطة تحكم جديدة بالنقر على الزر أعلاه
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {pagination && pagination.pages > 1 && (
        <div className="pagination">
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page <= 1}
            className="pagination-btn"
            aria-label="الصفحة السابقة"
          >
            <i className="bi bi-chevron-right"></i>
            السابق
          </button>
          
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className="pagination-btn"
                style={{
                  minWidth: '44px',
                  justifyContent: 'center',
                  background: page === pagination.page ? 'var(--accent-color)' : 'var(--bg-tertiary)',
                  color: page === pagination.page ? 'white' : 'var(--text-secondary)',
                  padding: '10px 16px'
                }}
                aria-label={`الصفحة ${page}`}
                aria-current={page === pagination.page ? 'page' : undefined}
              >
                {page}
              </button>
            ))}
          </div>
          
          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.pages}
            className="pagination-btn"
            aria-label="الصفحة التالية"
          >
            التالي
            <i className="bi bi-chevron-left"></i>
          </button>
        </div>
      )}

      {pagination && pagination.total > 0 && (
        <div className="total-count">
          <i className="bi bi-list-ul" style={{ marginLeft: '8px' }}></i>
          إجمالي نقاط التحكم الحرجة: <strong>{pagination.total}</strong> | 
          الصفحة <strong>{pagination.page}</strong> من <strong>{pagination.pages}</strong>
        </div>
      )}
    </div>
  );
}