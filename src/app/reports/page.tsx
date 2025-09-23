// src/app/reports/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import './reports.css';

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

interface Facility {
  id: string;
  name: string;
}

interface CCP {
  id: string;
  name: string;
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

interface ReportFilters {
  startDate: string;
  endDate: string;
  facilityId: string;
  ccpId: string;
  status: string;
}

export default function ReportsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [records, setRecords] = useState<Record[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [ccps, setCCPs] = useState<CCP[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // حالة الفلاتر
  const [filters, setFilters] = useState<ReportFilters>({
    startDate: '',
    endDate: '',
    facilityId: '',
    ccpId: '',
    status: ''
  });

  const [currentPage, setCurrentPage] = useState(1);
  const limit = 20;

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth-pages/signin');
      return;
    }

    fetchFacilities();
    fetchCCPs();
  }, [session, status, router]);

  useEffect(() => {
    if (facilities.length > 0 && ccps.length > 0) {
      fetchRecords();
    }
  }, [currentPage, filters, facilities, ccps]);

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

  const fetchRecords = async () => {
    try {
      setIsLoading(true);
      setError('');

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
        ...(filters.facilityId && { facilityId: filters.facilityId }),
        ...(filters.ccpId && { ccpId: filters.ccpId })
      });

      const response = await fetch(`/api/records?${params}`);
      
      if (!response.ok) {
        throw new Error('فشل في تحميل بيانات التقارير');
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

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setCurrentPage(1); // العودة للصفحة الأولى عند تغيير الفلتر
  };

  const handleExport = async (format: 'pdf' | 'excel') => {
    try {
      setIsExporting(true);
      setError('');

      // إنشاء معلمات التصدير
      const exportParams = new URLSearchParams();
      if (filters.startDate) exportParams.append('startDate', filters.startDate);
      if (filters.endDate) exportParams.append('endDate', filters.endDate);
      if (filters.facilityId) exportParams.append('facilityId', filters.facilityId);
      if (filters.ccpId) exportParams.append('ccpId', filters.ccpId);
      if (filters.status) exportParams.append('status', filters.status);

      const response = await fetch(`/api/export-all?${exportParams.toString()}&format=${format}`);
      if (!response.ok) {
        throw new Error('فشل في تصدير التقرير');
      }

      // تحويل Response إلى Blob مع تحديد النوع الصحيح
      let blob: Blob;
      if (format === 'pdf') {
        const arrayBuffer = await response.arrayBuffer();
        blob = new Blob([arrayBuffer], { type: 'application/pdf' });
      } else {
        const arrayBuffer = await response.arrayBuffer();
        blob = new Blob([arrayBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      }

      // تنزيل الملف
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = format === 'excel' ? 'report.xlsx' : 'report.pdf';
      link.click();
      window.URL.revokeObjectURL(url);

      setMessage(`تم تصدير التقرير كـ ${format.toUpperCase()} بنجاح`);
    } catch (error: any) {
      console.error('Error exporting report:', error);
      setError(error.message || 'حدث خطأ أثناء التصدير');
    } finally {
      setIsExporting(false);
    }
  };

  const getStatusText = (status?: string) => {
    switch (status) {
      case 'NORMAL': return 'طبيعي';
      case 'WARNING': return 'تحذير';
      case 'CRITICAL': return 'حرج';
      default: return 'غير محدد';
    }
  };

  const getStatusBadgeClass = (status?: string) => {
    switch (status) {
      case 'NORMAL': return 'status-normal';
      case 'WARNING': return 'status-warning';
      case 'CRITICAL': return 'status-critical';
      default: return 'status-unknown';
    }
  };

  if (isLoading) {
    return (
      <div className="reports-container">
        <div className="loading">جاري تحميل البيانات...</div>
      </div>
    );
  }
  
  return (
    <div className="reports-container">
      <div className="reports-header">
        <h1>التقارير والإحصائيات</h1>
        <div className="header-actions">
          <button 
            onClick={() => handleExport('pdf')} 
            disabled={isExporting}
            className="export-btn pdf"
          >
            {isExporting ? 'جاري التصدير...' : 'تصدير PDF'}
          </button>
          <button 
            onClick={() => handleExport('excel')} 
            disabled={isExporting}
            className="export-btn excel"
          >
            {isExporting ? 'جاري التصدير...' : 'تصدير Excel'}
          </button>
        </div>
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

      {/* فلترة التقارير */}
      <div className="filters-section">
        <h3>تصفية التقارير</h3>
        <div className="filters-grid">
          <div className="filter-group">
            <label htmlFor="startDate">من تاريخ</label>
            <input
              id="startDate"
              name="startDate"
              type="date"
              value={filters.startDate}
              onChange={handleFilterChange}
            />
          </div>

          <div className="filter-group">
            <label htmlFor="endDate">إلى تاريخ</label>
            <input
              id="endDate"
              name="endDate"
              type="date"
              value={filters.endDate}
              onChange={handleFilterChange}
            />
          </div>

          <div className="filter-group">
            <label htmlFor="facilityId">المنشأة</label>
            <select
              id="facilityId"
              name="facilityId"
              value={filters.facilityId}
              onChange={handleFilterChange}
            >
              <option value="">جميع المنشآت</option>
              {facilities.map((facility) => (
                <option key={facility.id} value={facility.id}>
                  {facility.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="ccpId">نقطة التحكم</label>
            <select
              id="ccpId"
              name="ccpId"
              value={filters.ccpId}
              onChange={handleFilterChange}
            >
              <option value="">جميع نقاط التحكم</option>
              {ccps.map((ccp) => (
                <option key={ccp.id} value={ccp.id}>
                  {ccp.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="status">الحالة</label>
            <select
              id="status"
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
            >
              <option value="">جميع الحالات</option>
              <option value="NORMAL">طبيعي</option>
              <option value="WARNING">تحذير</option>
              <option value="CRITICAL">حرج</option>
            </select>
          </div>

          <div className="filter-group">
            <label>&nbsp;</label>
            <button 
              onClick={() => setFilters({
                startDate: '',
                endDate: '',
                facilityId: '',
                ccpId: '',
                status: ''
              })}
              className="reset-btn"
            >
              إعادة تعيين
            </button>
          </div>
        </div>
      </div>

      {/* الإحصائيات */}
      <div className="stats-section">
        <h3>الإحصائيات</h3>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <h4>{pagination?.total || 0}</h4>
              <p>إجمالي السجلات</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <h4>{records.filter(r => r.status === 'NORMAL').length}</h4>
              <p>سجلات طبيعية</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">⚠️</div>
            <div className="stat-content">
              <h4>{records.filter(r => r.status === 'WARNING').length}</h4>
              <p>سجلات تحذير</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">❌</div>
            <div className="stat-content">
              <h4>{records.filter(r => r.status === 'CRITICAL').length}</h4>
              <p>سجلات حرجة</p>
            </div>
          </div>
        </div>
      </div>

      {/* جدول التقارير */}
      <div className="reports-table-container">
        <div className="table-header">
          <h3>السجلات</h3>
          <span className="total-count">({pagination?.total || 0} سجل)</span>
        </div>

        <table className="reports-table">
          <thead>
            <tr>
              <th>القيمة</th>
              <th>الحالة</th>
              <th>الملاحظات</th>
              <th>المنشأة</th>
              <th>نقطة التحكم</th>
              <th>المستخدم</th>
              <th>وقت القياس</th>
              <th>تاريخ الإنشاء</th>
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
                    <span className={`status-badge ${getStatusBadgeClass(record.status)}`}>
                      {getStatusText(record.status)}
                    </span>
                  </td>
                  <td className="notes-cell">
                    {record.notes || 'لا توجد ملاحظات'}
                  </td>
                  <td>{record.facility.name}</td>
                  <td>{record.ccp.name}</td>
                  <td>{record.user.name}</td>
                  <td>
                    {new Date(record.measuredAt).toLocaleString('ar-SA')}
                  </td>
                  <td>
                    {new Date(record.createdAt).toLocaleDateString('ar-SA')}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="no-data">
                  لا توجد سجلات تطابق معايير البحث
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* الترقيم */}
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
    </div>
  );
}