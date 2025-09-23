// src/app/haccp-plans/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import './haccp-plans.css';

interface HaccpPlan {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  facilityId?: string;
  userId: string;
  steps: HaccpStep[];
  facility?: {
    name: string;
  };
  user: {
    name: string;
  };
}

interface HaccpStep {
  id: string;
  title: string;
  stepNumber: number;
  type?: string;
}

export default function HaccpPlansPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [plans, setPlans] = useState<HaccpPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth-pages/signin');
      return;
    }

    fetchPlans();
  }, [session, status, router]);

  const fetchPlans = async () => {
    try {
      setIsLoading(true);
      setError('');

      const response = await fetch('/api/haccp-plans');
      
      if (!response.ok) {
        throw new Error('فشل في تحميل بيانات الخطط');
      }

      const data: HaccpPlan[] = await response.json();
      setPlans(data);
    } catch (error: any) {
      console.error('Error fetching plans:', error);
      setError(error.message || 'حدث خطأ أثناء تحميل البيانات');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (planId: string, planTitle: string) => {
    if (!confirm(`هل أنت متأكد من حذف الخطة "${planTitle}"؟`)) {
      return;
    }

    try {
      const response = await fetch(`/api/haccp-plans/${planId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('فشل في حذف الخطة');
      }

      setMessage('تم حذف الخطة بنجاح');
      fetchPlans(); // إعادة تحميل البيانات
    } catch (error: any) {
      console.error('Error deleting plan:', error);
      setError(error.message || 'حدث خطأ أثناء حذف الخطة');
    }
  };

  if (isLoading) {
    return (
      <div className="haccp-plans-container">
        <div className="loading">جاري تحميل البيانات...</div>
      </div>
    );
  }

  return (
    <div className="haccp-plans-container">
      <div className="haccp-plans-header">
        <h1>إدارة خطط HACCP</h1>
        <Link href="/haccp-plans/create" className="add-plan-btn">
          إنشاء خطة جديدة
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

      {/* قائمة الخطط */}
      <div className="plans-grid">
        {plans.length > 0 ? (
          plans.map((plan) => (
            <div key={plan.id} className="plan-card">
              <div className="plan-card-header">
                <h3>{plan.title}</h3>
                <div className="plan-actions">
                  <Link href={`/haccp-plans/${plan.id}/steps`} className="steps-btn">
                    الخطوات ({plan.steps.length})
                  </Link>
                  <Link href={`/haccp-plans/${plan.id}/edit`} className="edit-btn">
                    تعديل
                  </Link>
                  <button
                    onClick={() => handleDelete(plan.id, plan.title)}
                    className="delete-btn"
                  >
                    حذف
                  </button>
                </div>
              </div>

              <div className="plan-card-body">
                <p className="plan-description">
                  {plan.description || 'لا يوجد وصف'}
                </p>

                <div className="plan-meta">
                  <div className="meta-item">
                    <span className="meta-label">تم الإنشاء بواسطة:</span>
                    <span className="meta-value">{plan.user.name}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">تاريخ الإنشاء:</span>
                    <span className="meta-value">
                      {new Date(plan.createdAt).toLocaleDateString('ar-SA')}
                    </span>
                  </div>
                  {plan.facility && (
                    <div className="meta-item">
                      <span className="meta-label">المنشأة:</span>
                      <span className="meta-value">{plan.facility.name}</span>
                    </div>
                  )}
                </div>

                {plan.steps.length > 0 && (
                  <div className="plan-steps-preview">
                    <h4>خطوات الخطة:</h4>
                    <ul>
                      {plan.steps.slice(0, 3).map((step) => (
                        <li key={step.id}>
                          {step.stepNumber}. {step.title}
                        </li>
                      ))}
                      {plan.steps.length > 3 && (
                        <li>... +{plan.steps.length - 3} خطوات أخرى</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="no-plans">
            <div className="no-plans-content">
              <h3>لا توجد خطط حتى الآن</h3>
              <p>ابدأ بإنشاء خطة HACCP جديدة لإدارة عملياتك</p>
              <Link href="/haccp-plans/create" className="add-plan-btn">
                إنشاء أول خطة
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}