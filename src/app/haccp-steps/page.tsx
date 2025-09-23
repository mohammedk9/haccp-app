
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import './haccp-plans.css';

interface HaccpStep {
  id: string;
  title: string;
  description?: string;
  stepNumber: number;
  type?: string;
  createdAt: string;
  user: {
    name: string;
  };
}

interface HaccpPlan {
  id: string;
  title: string;
}

export default function HaccpStepsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const planId = params.id as string;

  const [steps, setSteps] = useState<HaccpStep[]>([]);
  const [plan, setPlan] = useState<HaccpPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth-pages/signin');
      return;
    }

    fetchPlanData();
    fetchSteps();
  }, [session, status, router, planId]);

  const fetchPlanData = async () => {
    try {
      const response = await fetch(`/api/haccp-plans/${planId}`);
      if (response.ok) {
        const planData = await response.json();
        setPlan(planData);
      }
    } catch (error) {
      console.error('Error fetching plan data:', error);
    }
  };

  const fetchSteps = async () => {
    try {
      const response = await fetch(`/api/haccp-steps?planId=${planId}`);
      
      if (!response.ok) {
        throw new Error('فشل في تحميل بيانات الخطوات');
      }

      const data: HaccpStep[] = await response.json();
      setSteps(data.sort((a, b) => a.stepNumber - b.stepNumber));
    } catch (error: any) {
      console.error('Error fetching steps:', error);
      setError(error.message || 'حدث خطأ أثناء تحميل البيانات');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (stepId: string, stepTitle: string) => {
    if (!confirm(`هل أنت متأكد من حذف الخطوة "${stepTitle}"؟`)) {
      return;
    }

    try {
      const response = await fetch(`/api/haccp-steps/${stepId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('فشل في حذف الخطوة');
      }

      setMessage('تم حذف الخطوة بنجاح');
      fetchSteps(); // إعادة تحميل البيانات
    } catch (error: any) {
      console.error('Error deleting step:', error);
      setError(error.message || 'حدث خطأ أثناء حذف الخطوة');
    }
  };

  const moveStep = async (stepId: string, direction: 'up' | 'down') => {
    try {
      const step = steps.find(s => s.id === stepId);
      if (!step) return;

      const currentIndex = steps.findIndex(s => s.id === stepId);
      const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

      if (newIndex < 0 || newIndex >= steps.length) return;

      // تبديل أرقام الخطوات
      const newSteps = [...steps];
      const temp = newSteps[currentIndex].stepNumber;
      newSteps[currentIndex].stepNumber = newSteps[newIndex].stepNumber;
      newSteps[newIndex].stepNumber = temp;

      // تحديث في الخادم
      await Promise.all([
        fetch(`/api/haccp-steps/${stepId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            stepNumber: newSteps[currentIndex].stepNumber 
          })
        }),
        fetch(`/api/haccp-steps/${newSteps[newIndex].id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            stepNumber: newSteps[newIndex].stepNumber 
          })
        })
      ]);

      setSteps(newSteps.sort((a, b) => a.stepNumber - b.stepNumber));
      setMessage('تم تعديل ترتيب الخطوات بنجاح');
    } catch (error: any) {
      console.error('Error moving step:', error);
      setError(error.message || 'حدث خطأ أثناء تعديل الترتيب');
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
        <div>
          <h1>خطوات خطة HACCP</h1>
          {plan && <p className="plan-title">{plan.title}</p>}
        </div>
        <div className="header-actions">
          <Link href={`/haccp-plans/${planId}/steps/create`} className="add-step-btn">
            إضافة خطوة جديدة
          </Link>
          <Link href="/haccp-plans" className="back-btn">
            رجوع إلى الخطط
          </Link>
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

      {/* قائمة الخطوات */}
      <div className="steps-list">
        {steps.length > 0 ? (
          steps.map((step, index) => (
            <div key={step.id} className="step-card">
              <div className="step-header">
                <div className="step-number">
                  الخطوة {step.stepNumber}
                </div>
                <div className="step-actions">
                  <button
                    onClick={() => moveStep(step.id, 'up')}
                    disabled={index === 0}
                    className="move-btn"
                    title="نقل لأعلى"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => moveStep(step.id, 'down')}
                    disabled={index === steps.length - 1}
                    className="move-btn"
                    title="نقل لأسفل"
                  >
                    ↓
                  </button>
                  <Link 
                    href={`/haccp-plans/${planId}/steps/${step.id}/edit`}
                    className="edit-btn"
                  >
                    تعديل
                  </Link>
                  <button
                    onClick={() => handleDelete(step.id, step.title)}
                    className="delete-btn"
                  >
                    حذف
                  </button>
                </div>
              </div>

              <div className="step-body">
                <h3>{step.title}</h3>
                {step.description && (
                  <p className="step-description">{step.description}</p>
                )}
                {step.type && (
                  <div className="step-type">
                    <strong>النوع:</strong> {step.type}
                  </div>
                )}
              </div>

              <div className="step-footer">
                <span>تم الإنشاء بواسطة: {step.user.name}</span>
                <span>
                  {new Date(step.createdAt).toLocaleDateString('ar-SA')}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="no-steps">
            <div className="no-steps-content">
              <h3>لا توجد خطوات حتى الآن</h3>
              <p>ابدأ بإضافة الخطوات الأولى لخطة HACCP الخاصة بك</p>
              <Link 
                href={`/haccp-plans/${planId}/steps/create`} 
                className="add-step-btn"
              >
                إضافة أول خطوة
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}