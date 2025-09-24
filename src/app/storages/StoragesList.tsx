'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import './storages.css';

interface Storage {
  id: string;
  name: string;
  type: string;
  location: string | null;
  capacity: number | null;
  createdAt: string;
  logs: StorageLog[];
}

interface StorageLog {
  id: string;
  temperature: number | null;
  humidity: number | null;
  cleanliness: string | null;
  measuredAt: string;
  storageId: string;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalStorages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface StoragesResponse {
  storages: Storage[];
  pagination: Pagination;
}

export default function StoragesList() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [storages, setStorages] = useState<Storage[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // حالة البحث والتصفية
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth-pages/signin');
      return;
    }

    // ملاحظة: يمكن استخدام searchParams.get('page') هنا لضبط الصفحة الأولية
    // ولكن يفضل استخدام currentPage لتبسيط منطق المكون
    fetchStorages();
  }, [session, status, router, currentPage, searchTerm, typeFilter]);

  const fetchStorages = async () => {
    try {
      setIsLoading(true);
      setError('');

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(typeFilter && { type: typeFilter })
      });

      const response = await fetch(`/api/storage?${params}`);
      
      if (!response.ok) {
        throw new Error('فشل في تحميل بيانات وحدات التخزين');
      }

      const data: StoragesResponse = await response.json();
      setStorages(data.storages);
      setPagination(data.pagination);
    } catch (error: any) {
      console.error('Error fetching storages:', error);
      setError(error.message || 'حدث خطأ أثناء تحميل البيانات');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchStorages();
  };

  const handleDelete = async (storageId: string, storageName: string) => {
    if (!confirm(`هل أنت متأكد من حذف وحدة التخزين "${storageName}"؟`)) {
      return;
    }

    try {
      const response = await fetch(`/api/storage`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resource: 'storage',
          action: 'delete',
          data: { id: storageId }
        })
      });

      if (!response.ok) {
        throw new Error('فشل في حذف وحدة التخزين');
      }

      setMessage('تم حذف وحدة التخزين بنجاح');
      fetchStorages(); // إعادة تحميل البيانات
    } catch (error: any) {
      console.error('Error deleting storage:', error);
      setError(error.message || 'حدث خطأ أثناء حذف وحدة التخزين');
    }
  };

  const [message, setMessage] = useState('');

  if (isLoading) {
    return (
      <div className="storages-container">
        <div className="loading">جاري تحميل البيانات...</div>
      </div>
    );
  }

  return (
    <div className="storages-container">
      <div className="storages-header">
        <h1>إدارة وحدات التخزين</h1>
        <Link href="/storages/add" className="add-storage-btn">
          إضافة وحدة تخزين جديدة
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
            placeholder="ابحث باسم وحدة التخزين أو الموقع..."
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
            <option value="REFRIGERATOR">ثلاجة</option>
            <option value="FREEZER">فريزر</option>
            <option value="DRY_STORAGE">تخزين جاف</option>
            <option value="CHILLER">مبرد</option>
          </select>
          <button type="submit" className="search-btn">
            بحث
          </button>
          <button 
            type="button" 
            onClick={() => {
              setSearchTerm('');
              setTypeFilter('');
              setCurrentPage(1);
            }}
            className="reset-btn"
          >
            إعادة تعيين
          </button>
        </form>
      </div>

      {/* جدول وحدات التخزين */}
      <div className="storages-table-container">
        <table className="storages-table">
          <thead>
            <tr>
              <th>الاسم</th>
              <th>النوع</th>
              <th>الموقع</th>
              <th>السعة</th>
              <th>آخر قراءة</th>
              <th>تاريخ الإنشاء</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {storages.length > 0 ? (
              storages.map((storage) => (
                <tr key={storage.id}>
                  {/* جعل الاسم قابلاً للنقر للتفاصيل */}
                  <td>
                    <Link 
                      href={`/storages/${storage.id}/logs`} 
                      className="storage-name-link"
                      title="عرض سجلات وحدة التخزين"
                    >
                      <strong>{storage.name}</strong>
                    </Link>
                  </td>
                  <td>
                    <span className={`type-badge ${storage.type.toLowerCase()}`}>
                      {getTypeName(storage.type)}
                    </span>
                  </td>
                  <td>{storage.location || 'غير محدد'}</td>
                  <td>{storage.capacity ? `${storage.capacity} لتر` : 'غير محدد'}</td>
                  <td>
                    {storage.logs && storage.logs.length > 0 ? (
                      <div className="last-reading">
                        <span className="temperature">
                          {storage.logs[0].temperature !== null ? `${storage.logs[0].temperature}°C` : '--'}
                        </span>
                        <span className="humidity">
                          {storage.logs[0].humidity !== null ? `${storage.logs[0].humidity}%` : '--'}
                        </span>
                      </div>
                    ) : (
                      'لا توجد قراءات'
                    )}
                  </td>
                  <td>{new Date(storage.createdAt).toLocaleDateString('ar-SA')}</td>
                  <td>
                    <div className="action-buttons">
                      {/* زر السجلات فقط - أكثر وضوحاً */}
                      <Link 
                        href={`/storages/${storage.id}/logs`} 
                        className="logs-btn primary"
                        title="عرض سجلات درجة الحرارة والرطوبة"
                      >
                        <i className="bi bi-graph-up"></i>
                        السجلات
                      </Link>
                      
                      {/* زر الحذف */}
                      <button
                        onClick={() => handleDelete(storage.id, storage.name)}
                        className="delete-btn"
                        title="حذف وحدة التخزين"
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
                <td colSpan={7} className="no-data">
                  لا توجد وحدات تخزين
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* الترقيم (Pagination) */}
      {pagination && pagination.totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(pagination.currentPage - 1)}
            disabled={!pagination.hasPrev}
            className="pagination-btn"
          >
            السابق
          </button>
          
          <span className="pagination-info">
            الصفحة {pagination.currentPage} من {pagination.totalPages}
          </span>
          
          <button
            onClick={() => setCurrentPage(pagination.currentPage + 1)}
            disabled={!pagination.hasNext}
            className="pagination-btn"
          >
            التالي
          </button>
        </div>
      )}

      {pagination && (
        <div className="total-count">
          إجمالي وحدات التخزين: {pagination.totalStorages}
        </div>
      )}
    </div>
  );
}

// دالة مساعدة لتحويل أسماء أنواع التخزين
function getTypeName(type: string): string {
  const typeNames: { [key: string]: string } = {
    'REFRIGERATOR': 'ثلاجة',
    'FREEZER': 'فريزر',
    'DRY_STORAGE': 'تخزين جاف',
    'CHILLER': 'مبرد'
  };
  return typeNames[type] || type;
}