// src/app/profile/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import './profile.css';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function Profile() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth-pages/signin');
      return;
    }

    fetchProfileData();
  }, [session, status, router]);

  const fetchProfileData = async () => {
    try {
      setIsLoading(true);
      setError('');

      const response = await fetch('/api/users/profile');
      
      if (!response.ok) {
        throw new Error('فشل في تحميل بيانات الملف الشخصي');
      }

      const userProfile: UserProfile = await response.json();
      setUserData(userProfile);
      setFormData({
        name: userProfile.name,
        email: userProfile.email,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error: any) {
      console.error('Error fetching profile data:', error);
      setError(error.message || 'حدث خطأ أثناء تحميل البيانات');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setMessage('');
    setError('');

    // التحقق من صحة البيانات
    if (!formData.name || !formData.email) {
      setError('الاسم والبريد الإلكتروني مطلوبان');
      setIsUpdating(false);
      return;
    }

    if (formData.newPassword && formData.newPassword.length < 6) {
      setError('كلمة المرور الجديدة يجب أن تكون على الأقل 6 أحرف');
      setIsUpdating(false);
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('كلمة المرور الجديدة غير متطابقة');
      setIsUpdating(false);
      return;
    }

    if (formData.newPassword && !formData.currentPassword) {
      setError('كلمة المرور الحالية مطلوبة لتغيير كلمة المرور');
      setIsUpdating(false);
      return;
    }

    try {
      const updateData: any = {
        name: formData.name,
        email: formData.email
      };

      if (formData.newPassword) {
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }

      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'فشل في تحديث الملف الشخصي');
      }

      setMessage('تم تحديث الملف الشخصي بنجاح');
      
      // تحديث الجلسة لتعكس التغييرات
      if (session) {
        await update({
          ...session,
          user: {
            ...session.user,
            name: formData.name,
            email: formData.email
          }
        });
      }

      // إعادة تعيين حقول كلمة المرور
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));

      // إعادة تحميل بيانات الملف الشخصي
      fetchProfileData();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setError(error.message || 'حدث خطأ أثناء تحديث الملف الشخصي');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="profile-container">
        <div className="loading">جاري تحميل البيانات...</div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>الملف الشخصي</h1>
        <p>إدارة معلومات حسابك وتغيير كلمة المرور</p>
      </div>

      <div className="profile-card">
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

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-section">
            <h3>المعلومات الشخصية</h3>
            
            <div className="form-group">
              <label htmlFor="name">الاسم الكامل</label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="أدخل اسمك الكامل"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">البريد الإلكتروني</label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="أدخل بريدك الإلكتروني"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="role">الدور</label>
              <input
                id="role"
                type="text"
                value={userData?.role ? getRoleName(userData.role) : ''}
                disabled
                className="disabled-input"
              />
            </div>
          </div>

          <div className="form-section">
            <h3>تغيير كلمة المرور</h3>
            <p className="section-description">اترك الحقول فارغة إذا لم ترد تغيير كلمة المرور</p>
            
            <div className="form-group">
              <label htmlFor="currentPassword">كلمة المرور الحالية</label>
              <input
                id="currentPassword"
                name="currentPassword"
                type="password"
                value={formData.currentPassword}
                onChange={handleChange}
                placeholder="أدخل كلمة المرور الحالية"
              />
            </div>

            <div className="form-group">
              <label htmlFor="newPassword">كلمة المرور الجديدة</label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="أدخل كلمة المرور الجديدة (6 أحرف على الأقل)"
                minLength={6}
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">تأكيد كلمة المرور الجديدة</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="أعد إدخال كلمة المرور الجديدة"
              />
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="submit" 
              className="update-button"
              disabled={isUpdating}
            >
              {isUpdating ? 'جاري التحديث...' : 'تحديث الملف الشخصي'}
            </button>
          </div>
        </form>

        {userData && (
          <div className="profile-meta">
            <div className="meta-item">
              <span className="meta-label">تاريخ الإنشاء:</span>
              <span className="meta-value">{new Date(userData.createdAt).toLocaleDateString('ar-SA')}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">آخر تحديث:</span>
              <span className="meta-value">{new Date(userData.updatedAt).toLocaleDateString('ar-SA')}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">الحالة:</span>
              <span className={`status-badge ${userData.isActive ? 'active' : 'inactive'}`}>
                {userData.isActive ? 'نشط' : 'غير نشط'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// دالة مساعدة لتحويل أسماء الصلاحيات
function getRoleName(role: string): string {
  const roleNames: { [key: string]: string } = {
    'ADMIN': 'مسؤول',
    'MANAGER': 'مدير',
    'OPERATOR': 'مشغل',
    'QUALITY_MANAGER': 'مدير الجودة'
  };
  return roleNames[role] || role;
}