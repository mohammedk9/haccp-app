// src/app/users/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import './users.css';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalUsers: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface UserStats {
  total: number;
  active: number;
  inactive: number;
  byRole: Record<string, number>;
  recent: {
    last30Days: number;
    activationRate: string | number;
  };
  overview: {
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    activePercentage: number;
  };
}

interface Role {
  value: string;
  label: string;
}

export default function UsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false); // ✅ إضافة حالة Dark Mode هنا

  // حالة البحث والتصفية
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<Pagination | null>(null);

  // الأدوار المتاحة
  const [roles, setRoles] = useState<Role[]>([]);

  // ✅ إضافة useEffect لـ Dark Mode هنا
  useEffect(() => {
    // التحقق من تفضيل النظام
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedMode = localStorage.getItem('darkMode');
    
    setIsDarkMode(savedMode ? savedMode === 'true' : prefersDark);
  }, []);

  // ✅ إضافة useEffect لتطبيق Dark Mode على body
  useEffect(() => {
    // تطبيق الوضع على body
    if (isDarkMode) {
      document.body.setAttribute('data-theme', 'dark');
    } else {
      document.body.removeAttribute('data-theme');
    }
    localStorage.setItem('darkMode', isDarkMode.toString());
  }, [isDarkMode]);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth-pages/signin');
      return;
    }

    if (session.user.role !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }

    fetchUsers();
    fetchStats();
    fetchRoles();
  }, [session, status, router, currentPage, searchTerm, roleFilter, statusFilter]);

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(searchTerm && { search: searchTerm }),
        ...(roleFilter && { role: roleFilter }),
        ...(statusFilter && { status: statusFilter })
      });

      const response = await fetch(`/api/users?${params}`);
      if (!response.ok) {
        throw new Error('فشل في تحميل بيانات المستخدمين');
      }

      const data = await response.json();
      setUsers(data.users);
      setPagination(data.pagination);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      setError(error.message || 'حدث خطأ أثناء تحميل البيانات');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/users/stats');
      if (response.ok) {
        const statsData = await response.json();
        setStats(statsData);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await fetch('/api/users/roles');
      if (response.ok) {
        const rolesData = await response.json();
        setRoles(rolesData);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('هل أنت متأكد من رغبتك في حذف هذا المستخدم؟')) {
      return;
    }

    setIsDeleting(userId);
    setMessage('');
    setError('');

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('فشل في حذف المستخدم');
      }

      setMessage('تم حذف المستخدم بنجاح');
      fetchUsers(); // إعادة تحميل القائمة
      fetchStats(); // تحديث الإحصائيات
    } catch (error: any) {
      console.error('Error deleting user:', error);
      setError(error.message || 'حدث خطأ أثناء حذف المستخدم');
    } finally {
      setIsDeleting(null);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // العودة للصفحة الأولى عند البحث
    fetchUsers();
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setRoleFilter('');
    setStatusFilter('');
    setCurrentPage(1);
  };

  // ✅ إضافة دالة تبديل Dark Mode هنا
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const getRoleLabel = (roleValue: string) => {
    const role = roles.find(r => r.value === roleValue);
    return role ? role.label : roleValue;
  };

  if (isLoading) {
    return (
      <div className="users-container">
        <div className="loading">جاري تحميل البيانات...</div>
      </div>
    );
  }

  return (
    <div className="users-container">
      {/* ✅ إضافة زر تبديل Dark Mode هنا */}
      <button 
        className="theme-toggle"
        onClick={toggleDarkMode}
        title={isDarkMode ? 'تفعيل الوضع الفاتح' : 'تفعيل الوضع الداكن'}
      >
        {isDarkMode ? '☀️' : '🌙'}
      </button>

      {/* رأس الصفحة */}
      <div className="users-header">
        <div className="header-content">
          <h1>إدارة المستخدمين</h1>
          <Link href="/users/add" className="add-user-btn">
            إضافة مستخدم جديد
          </Link>
        </div>
      </div>

      {/* بطاقات الإحصائيات */}
      {stats && (
        <div className="stats-cards">
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-info">
              <h3>إجمالي المستخدمين</h3>
              <span className="stat-number">{stats.total}</span>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <h3>المستخدمين النشطين</h3>
              <span className="stat-number">{stats.active}</span>
              <span className="stat-percentage">{stats.overview.activePercentage}%</span>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">⏸️</div>
            <div className="stat-info">
              <h3>المستخدمين غير النشطين</h3>
              <span className="stat-number">{stats.inactive}</span>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">🆕</div>
            <div className="stat-info">
              <h3>مستخدمين جدد (30 يوم)</h3>
              <span className="stat-number">{stats.recent.last30Days}</span>
            </div>
          </div>
        </div>
      )}

      {/* رسائل النجاح والخطأ */}
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

      {/* أدوات البحث والتصفية */}
      <div className="users-tools">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-group">
            <input
              type="text"
              placeholder="ابحث بالاسم أو البريد الإلكتروني..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-btn">
              🔍
            </button>
          </div>
        </form>

        <div className="filter-group">
          <select 
            value={roleFilter} 
            onChange={(e) => setRoleFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">جميع الأدوار</option>
            {roles.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>

          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">جميع الحالات</option>
            <option value="active">نشط فقط</option>
            <option value="inactive">غير نشط فقط</option>
          </select>

          <button onClick={handleResetFilters} className="reset-btn">
            إعادة التعيين
          </button>
        </div>
      </div>

      {/* جدول المستخدمين */}
      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>المستخدم</th>
              <th>الدور</th>
              <th>الحالة</th>
              <th>تاريخ الإنشاء</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="no-data">
                  لا توجد بيانات متاحة
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="user-info">
                      <div className="user-name">{user.name}</div>
                      <div className="user-email">{user.email}</div>
                    </div>
                  </td>
                  <td>
                    <span className={`role-badge role-${user.role.toLowerCase()}`}>
                      {getRoleLabel(user.role)}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                      {user.isActive ? 'نشط' : 'غير نشط'}
                    </span>
                  </td>
                  <td>{formatDate(user.createdAt)}</td>
                  <td>
                    <div className="actions">
                      <Link 
                        href={`/users/edit/${user.id}`}
                        className="edit-btn"
                      >
                        تعديل
                      </Link>
                      <button
                        onClick={() => handleDelete(user.id)}
                        disabled={isDeleting === user.id}
                        className="delete-btn"
                      >
                        {isDeleting === user.id ? 'جاري الحذف...' : 'حذف'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* الترقيم */}
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

      {/* معلومات الترقيم */}
      {pagination && (
        <div className="pagination-summary">
          عرض {users.length} من أصل {pagination.totalUsers} مستخدم
        </div>
      )}
    </div>
  );
}