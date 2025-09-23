// src/app/records/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import './records.css';

interface Record {
  id: string;
  value: string;
  status?: string;
  notes?: string;
  measuredAt: string;
  createdAt: string;
  facility: {
    name: string;
  };
  ccp: {
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

interface RecordsResponse {
  records: Record[];
  pagination: Pagination;
}

export default function RecordsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [records, setRecords] = useState<Record[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // حالة البحث والتصفية
  const [facilityFilter, setFacilityFilter] = useState('');
  const [ccpFilter, setCcpFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth-pages/signin');
      return;
    }

    fetchRecords();
  }, [session, status, router, currentPage, facilityFilter, ccpFilter, statusFilter]);

  const fetchRecords = async () => {
    try {
      setIsLoading(true);
      setError('');

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
        ...(facilityFilter && { facilityId: facilityFilter }),
        ...(ccpFilter && { ccpId: ccpFilter })
      });

      const response = await fetch(`/api/records?${params}`);
      
      if (!response.ok) {
        throw new Error('فشل في تحميل بيانات السجلات');
      }

      const data: RecordsResponse = await response.json();
      setRecords(data.records);
      setPagination(data.pagination);
    } catch (error: any) {
      console.error('Error fetching records:', error);
      setError(error.message || 'حدث خطأ أثناء تحميل البيانات');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (recordId: string, recordValue: string) => {
    if (!confirm(`هل أنت متأكد من حذف السجل "${recordValue}"؟`)) {
      return;
    }

    try {
      const response = await fetch(`/api/records/${recordId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('فشل في حذف السجل');
      }

      setMessage('تم حذف السجل بنجاح');
      fetchRecords(); // إعادة تحميل البيانات
    } catch (error: any) {
      console.error('Error deleting record:', error);
      setError(error.message || 'حدث خطأ أثناء حذف السجل');
    }
  };

  const [message, setMessage] = useState('');

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
        <h1>إدارة السجلات</h1>
        <Link href="/records/create" className="add-record-btn">
          إضافة سجل جديد
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

      {/* شريط التصفية */}
      <div className="filters-section">
        <div className="search-form">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">جميع الحالات</option>
            <option value="NORMAL">طبيعي</option>
            <option value="WARNING">تحذير</option>
            <option value="CRITICAL">حرج</option>
          </select>
          
          <button 
            type="button" 
            onClick={() => {
              setFacilityFilter('');
              setCcpFilter('');
              setStatusFilter('');
              setCurrentPage(1);
            }}
            className="reset-btn"
          >
            إعادة تعيين
          </button>
        </div>
      </div>

      {/* جدول السجلات */}
      <div className="records-table-container">
        <table className="records-table">
          <thead>
            <tr>
              <th>القيمة</th>
              <th>الحالة</th>
              <th>الملاحظات</th>
              <th>وقت القياس</th>
              <th>المنشأة</th>
              <th>نقطة التحكم</th>
              <th>تم الإضافة بواسطة</th>
              <th>تاريخ الإضافة</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {records.length > 0 ? (
              records.map((record) => (
                <tr key={record.id}>
                  <td>
                    <strong>{record.value}</strong>
                  </td>
                  <td>
                    <span className={`status-badge ${record.status?.toLowerCase() || 'unknown'}`}>
                      {getStatusName(record.status)}
                    </span>
                  </td>
                  <td className="notes-cell">
                    {record.notes || 'لا توجد ملاحظات'}
                  </td>
                  <td>
                    {new Date(record.measuredAt).toLocaleString('ar-SA')}
                  </td>
                  <td>
                    <span className="facility-badge">
                      {record.facility.name}
                    </span>
                  </td>
                  <td>
                    <span className="ccp-badge">
                      {record.ccp.name}
                    </span>
                  </td>
                  <td>{record.user.name}</td>
                  <td>{new Date(record.createdAt).toLocaleDateString('ar-SA')}</td>
                  <td>
                    <div className="action-buttons">
                      <Link href={`/records/${record.id}/edit`} className="edit-btn">
                        تعديل
                      </Link>
                      <button
                        onClick={() => handleDelete(record.id, record.value)}
                        className="delete-btn"
                        disabled={session.user.role === 'OPERATOR' && record.user.email !== session.user.email}
                        title={session.user.role === 'OPERATOR' && record.user.email !== session.user.email ? 
                          'لا يمكنك حذف سجلات الآخرين' : ''}
                      >
                        حذف
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="no-data">
                  لا توجد سجلات
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
          إجمالي السجلات: {pagination.total}
        </div>
      )}
    </div>
  );
}

// دالة مساعدة لتحويل أسماء الحالات
function getStatusName(status?: string): string {
  const statusNames: { [key: string]: string } = {
    'NORMAL': 'طبيعي',
    'WARNING': 'تحذير',
    'CRITICAL': 'حرج'
  };
  return status ? statusNames[status] || status : 'غير محدد';
}