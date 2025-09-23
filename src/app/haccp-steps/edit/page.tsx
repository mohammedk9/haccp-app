'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import '../../haccp-plans/haccp-plans.css';

interface StepFormData {
  title: string;
  description: string;
  type: string;
  stepNumber: number;
}

interface HaccpPlan {
  id: string;
  title: string;
}

interface HaccpStep {
  id: string;
  title: string;
  description: string;
  type: string;
  stepNumber: number;
  planId: string;
}

export default function EditHaccpStepPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const planId = params.id as string;
  const stepId = params.stepId as string;

  const [plan, setPlan] = useState<HaccpPlan | null>(null);
  const [steps, setSteps] = useState<HaccpStep[]>([]);

  const [formData, setFormData] = useState<StepFormData>({
    title: '',
    description: '',
    type: '',
    stepNumber: 1
  });

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

    fetchPlanData();
    fetchSteps();
    fetchStepData();
  }, [session, status, router, planId, stepId]);

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
      if (response.ok) {
        const stepsData = await response.json();
        setSteps(stepsData);
      }
    } catch (error) {
      console.error('Error fetching steps:', error);
    }
  };

  const fetchStepData = async () => {
    try {
      const response = await fetch(`/api/haccp-steps/${stepId}`);
      
      if (!response.ok) {
        throw new Error('فشل في تحميل بيانات الخطوة');
      }

      const stepData: HaccpStep = await response.json();
      setFormData({
        title: stepData.title,
        description: stepData.description || '',
        type: stepData.type || '',
        stepNumber: stepData.stepNumber
      });
    } catch (error: any) {
      console.error('Error fetching step data:', error);
      setError(error.message || 'حدث خطأ أثناء تحميل البيانات');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'stepNumber' ? parseInt(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');
    setError('');

    // التحقق من صحة البيانات
    if (!formData.title) {
      setError('عنوان الخطوة مطلوب');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(`/api/haccp-steps/${stepId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'فشل في تحديث الخطوة');
      }

      setMessage('تم تحديث الخطوة بنجاح');
      
      // الانتقال إلى صفحة الخطوات بعد نجاح العملية
      setTimeout(() => {
        router.push(`/haccp-plans/${planId}/steps`);
      }, 2000);
    } catch (error: any) {
      console.error('Error updating step:', error);
      setError(error.message || 'حدث خطأ أثناء تحديث الخطوة');
    } finally {
      setIsSubmitting(false);
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
          <h1>تعديل خطوة</h1>
          {plan && <p className="plan-title">للخطة: {plan.title}</p>}
        </div>
        <Link 
          href={`/haccp-plans/${planId}/steps`} 
          className="back-btn"
        >
          رجوع إلى الخطوات
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

      <form onSubmit={handleSubmit} className="step-form">
        <div className="form-section">
          <h3>معلومات الخطوة</h3>
          
          <div className="form-group">
            <label htmlFor="title">عنوان الخطوة *</label>
            <input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              placeholder="أدخل عنوان الخطوة"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="stepNumber">رقم الخطوة</label>
            <input
              id="stepNumber"
              name="stepNumber"
              type="number"
              min="1"
              max={steps.length}
              value={formData.stepNumber}
              onChange={handleChange}
            />
            <small>الترتيب الحالي: {formData.stepNumber} من {steps.length}</small>
          </div>

          <div className="form-group">
            <label htmlFor="type">نوع الخطوة (اختياري)</label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
            >
              <option value="">اختر النوع</option>
              <option value="تحليل">تحليل</option>
              <option value="مراقبة">مراقبة</option>
              <option value="تحكم">تحكم</option>
              <option value="تحقق">تحقق</option>
              <option value="توثيق">توثيق</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="description">وصف الخطوة</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="أدخل وصفاً للخطوة (اختياري)"
              rows={4}
            />
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="submit" 
            className="save-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'جاري التحديث...' : 'تحديث الخطوة'}
          </button>
          <Link 
            href={`/haccp-plans/${planId}/steps`} 
            className="cancel-btn"
          >
            إلغاء
          </Link>
        </div>
      </form>
    </div>
  );
}