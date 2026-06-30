'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import '../../haccp-plans.css';

interface HaccpStep {
  id: string;
  description: string;
  isCritical: boolean;
  criticalLimit?: string;
  monitoringProcedure?: string;
  correctiveActions?: string;
}

export default function HaccpStepsPage() {
  const params = useParams();
  const router = useRouter();
  const planId = params.id as string;

  const [steps, setSteps] = useState<HaccpStep[]>([]);
  const [newStep, setNewStep] = useState<Omit<HaccpStep, 'id'>>({
    description: '',
    isCritical: false,
    criticalLimit: '',
    monitoringProcedure: '',
    correctiveActions: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  // تحميل الخطوات من localStorage (أو API)
  useEffect(() => {
    const savedSteps = localStorage.getItem(`haccp-steps-${planId}`);
    if (savedSteps) setSteps(JSON.parse(savedSteps));
  }, [planId]);

  const saveSteps = (updatedSteps: HaccpStep[]) => {
    localStorage.setItem(`haccp-steps-${planId}`, JSON.stringify(updatedSteps));
    setSteps(updatedSteps);
  };

  const handleAddStep = () => {
    if (!newStep.description.trim()) {
      alert('يرجى إدخال وصف الخطوة');
      return;
    }
    setIsLoading(true);
    const step: HaccpStep = { id: Date.now().toString(), ...newStep };
    const updatedSteps = [...steps, step];
    saveSteps(updatedSteps);
    setNewStep({
      description: '',
      isCritical: false,
      criticalLimit: '',
      monitoringProcedure: '',
      correctiveActions: ''
    });
    setIsLoading(false);
  };

  const handleDeleteStep = (stepId: string) => {
    if (confirm('هل أنت متأكد من حذف هذه الخطوة؟')) {
      const updatedSteps = steps.filter(step => step.id !== stepId);
      saveSteps(updatedSteps);
    }
  };

  const handleInputChange = (field: keyof Omit<HaccpStep, 'id'>, value: string | boolean) => {
    setNewStep(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="steps-container">
      <div className="steps-header">
        <div>
          <Link href={`/haccp-plans/${planId}`} className="back-link">
            ← العودة إلى خطة HACCP
          </Link>
          <h1 className="steps-title">إدارة خطوات العملية</h1>
          <p>خطة HACCP: {planId}</p>
        </div>
      </div>

      {/* نموذج إضافة خطوة جديدة */}
      <div className="add-step-form">
        <h2 className="add-step-title">إضافة خطوة جديدة</h2>
        <div className="steps-grid">
          <div className="full-width form-group">
            <label>وصف الخطوة *</label>
            <textarea
              value={newStep.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              placeholder="أدخل وصفاً واضحاً للخطوة..."
            />
          </div>

          <div className="form-group">
            <div className="checkbox-group">
              <input
                type="checkbox"
                checked={newStep.isCritical}
                onChange={(e) => handleInputChange('isCritical', e.target.checked)}
                id="criticalCheck"
              />
              <label htmlFor="criticalCheck" className="checkbox-label">خطوة حرجة (CCP)</label>
            </div>
            <p className="checkbox-helper">حدد إذا كانت هذه خطوة تحكم حرجة</p>
          </div>

          {newStep.isCritical && (
            <div className="form-group">
              <label>الحد الحرج</label>
              <input
                type="text"
                value={newStep.criticalLimit}
                onChange={(e) => handleInputChange('criticalLimit', e.target.value)}
                placeholder="مثال: درجة حرارة ≥ 75°C"
              />
            </div>
          )}

          <div className="form-group">
            <label>إجراءات المراقبة</label>
            <textarea
              value={newStep.monitoringProcedure}
              onChange={(e) => handleInputChange('monitoringProcedure', e.target.value)}
              rows={2}
              placeholder="كيف سيتم مراقبة هذه الخطوة..."
            />
          </div>

          <div className="form-group">
            <label>الإجراءات التصحيحية</label>
            <textarea
              value={newStep.correctiveActions}
              onChange={(e) => handleInputChange('correctiveActions', e.target.value)}
              rows={2}
              placeholder="ما الإجراءات في حالة الخروج عن السيطرة..."
            />
          </div>
        </div>

        <div style={{ marginTop: '24px' }}>
          <button
            onClick={handleAddStep}
            disabled={isLoading || !newStep.description.trim()}
            className="add-plan-btn"
          >
            {isLoading ? 'جاري الإضافة...' : 'إضافة الخطوة'}
          </button>
        </div>
      </div>

      {/* قائمة الخطوات */}
      <div className="steps-list">
        <h2 className="steps-list-title">
          الخطوات المضافة
          <span className="steps-count">{steps.length}</span>
        </h2>

        {steps.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '40px' }}>
            لم تتم إضافة أي خطوات بعد
          </p>
        ) : (
          steps.map((step, index) => (
            <div
              key={step.id}
              className={`step-item ${step.isCritical ? 'step-item-critical' : 'step-item-normal'}`}
            >
              <div className="step-header">
                <div className="step-info">
                  <div className="step-number">
                    <span className="step-title">الخطوة {index + 1}</span>
                    {step.isCritical && <span className="critical-badge">حرجة</span>}
                  </div>
                  <p className="step-description">{step.description}</p>
                </div>
                <div className="step-actions">
                  <button
                    onClick={() => handleDeleteStep(step.id)}
                    className="delete-step-btn"
                  >
                    🗑️ حذف
                  </button>
                </div>
              </div>

              {(step.criticalLimit || step.monitoringProcedure || step.correctiveActions) && (
                <div className="step-details">
                  {step.isCritical && step.criticalLimit && (
                    <div className="step-detail">
                      <span className="detail-label">الحد الحرج:</span>
                      <span className="detail-value">{step.criticalLimit}</span>
                    </div>
                  )}
                  {step.monitoringProcedure && (
                    <div className="step-detail">
                      <span className="detail-label">المراقبة:</span>
                      <span className="detail-value">{step.monitoringProcedure}</span>
                    </div>
                  )}
                  {step.correctiveActions && (
                    <div className="step-detail">
                      <span className="detail-label">الإجراءات التصحيحية:</span>
                      <span className="detail-value">{step.correctiveActions}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}