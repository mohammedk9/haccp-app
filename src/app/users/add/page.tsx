// src/app/users/add/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import './users.css';

interface UserFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
  isActive: boolean;
}

interface Role {
  value: string;
  label: string;
  description: string;
  permissions: string[];
}

export default function AddUserPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'OPERATOR',
    isActive: true
  });

  const [roles, setRoles] = useState<Role[]>([]);
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

    if (session.user.role !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }

    fetchRoles();
  }, [session, status, router]);

  const fetchRoles = async () => {
    try {
      const response = await fetch('/api/users/roles');
      if (response.ok) {
        const rolesData = await response.json();
        setRoles(rolesData);
      } else {
        // إذا فشل جلب الأدوار، استخدم القائمة الافتراضية
        setRoles(getDefaultRoles());
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
      setRoles(getDefaultRoles());
    } finally {
      setIsLoading(false);
    }
  };

  const getDefaultRoles = (): Role[] => [
    { value: "ADMIN", label: "مدير النظام", description: "", permissions: [] },
    { value: "QUALITY_MANAGER", label: "مدير الجودة", description: "", permissions: [] },
    { value: "OPERATOR", label: "مشغل", description: "", permissions: [] },
    { value: "AUDITOR", label: "مراجع", description: "", permissions: [] },
    { value: "NUTRITION_SPECIALIST", label: "أخصائي تغذية", description: "", permissions: [] },
    { value: "GENERAL_SUPERVISOR", label: "مشرف عام", description: "", permissions: [] },
    { value: "QUALITY_INSPECTOR", label: "مراقب جودة", description: "", permissions: [] },
    { value: "FOOD_INSPECTOR", label: "مفتش أغذية", description: "", permissions: [] },
    { value: "FOOD_TECHNICIAN", label: "فني أغذية", description: "", permissions: [] }
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');
    setError('');

    // التحقق من صحة البيانات
    if (!formData.name || !formData.email || !formData.password) {
      setError('جميع الحقول مطلوبة');
      setIsSubmitting(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('كلمة المرور يجب أن تكون على الأقل 6 أحرف');
      setIsSubmitting(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('كلمة المرور غير متطابقة');
      setIsSubmitting(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('صيغة البريد الإلكتروني غير صحيحة');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          isActive: formData.isActive
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'فشل في إنشاء المستخدم');
      }

      setMessage('تم إنشاء المستخدم بنجاح');
      
      // الانتقال إلى صفحة المستخدمين بعد نجاح العملية
      setTimeout(() => {
        router.push('/users');
      }, 2000);
    } catch (error: any) {
      console.error('Error creating user:', error);
      setError(error.message || 'حدث خطأ أثناء إنشاء المستخدم');
    } finally {
      setIsSubmitting(false);
    }
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
      <div className="users-header">
        <h1>إضافة مستخدم جديد</h1>
        <Link href="/users" className="add-user-btn">
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

      <form onSubmit={handleSubmit} className="user-form">
        <div className="form-section">
          <h3>المعلومات الأساسية</h3>
          
          <div className="form-group">
            <label htmlFor="name">الاسم الكامل *</label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="أدخل الاسم الكامل"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">البريد الإلكتروني *</label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="أدخل البريد الإلكتروني"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="role">الدور *</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
            >
              {roles.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group checkbox-group">
            <label htmlFor="isActive">الحالة</label>
            <div className="checkbox-container">
              <input
                id="isActive"
                name="isActive"
                type="checkbox"
                checked={formData.isActive}
                onChange={handleChange}
              />
              <span className="checkmark"></span>
              <span className="checkbox-label">مفعل</span>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>كلمة المرور</h3>
          
          <div className="form-group">
            <label htmlFor="password">كلمة المرور *</label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="أدخل كلمة المرور (6 أحرف على الأقل)"
              minLength={6}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">تأكيد كلمة المرور *</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="أعد إدخال كلمة المرور"
              required
            />
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="submit" 
            className="save-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'جاري الإنشاء...' : 'إنشاء مستخدم'}
          </button>
          <Link href="/users" className="cancel-btn">
            إلغاء
          </Link>
        </div>
      </form>
    </div>
  );
}