'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

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

  // تحميل الخطوات من localStorage (أو API في حالة حقيقية)
  useEffect(() => {
    const savedSteps = localStorage.getItem(`haccp-steps-${planId}`);
    if (savedSteps) {
      setSteps(JSON.parse(savedSteps));
    }
  }, [planId]);

  // حفظ الخطوات في localStorage
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
    
    const step: HaccpStep = {
      id: Date.now().toString(),
      ...newStep
    };

    const updatedSteps = [...steps, step];
    saveSteps(updatedSteps);

    // Reset form
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
    setNewStep(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="container mx-auto p-6">
      {/* رأس الصفحة */}
      <div className="mb-6">
        <Link 
          href={`/haccp-plans/${planId}`}
          className="text-blue-600 hover:text-blue-800 mb-4 inline-block"
        >
          ← العودة إلى خطة HACCP
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">إدارة خطوات العملية</h1>
        <p className="text-gray-600 mt-2">خطة HACCP: {planId}</p>
      </div>

      {/* نموذج إضافة خطوة جديدة */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">إضافة خطوة جديدة</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* وصف الخطوة */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              وصف الخطوة *
            </label>
            <textarea
              value={newStep.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="أدخل وصفاً واضحاً للخطوة..."
            />
          </div>

          {/* نوع الخطوة */}
          <div>
            <label className="flex items-center space-x-2 space-x-reverse">
              <input
                type="checkbox"
                checked={newStep.isCritical}
                onChange={(e) => handleInputChange('isCritical', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                خطوة حرجة (CCP)
              </span>
            </label>
            <p className="text-xs text-gray-500 mt-1">
              حدد إذا كانت هذه خطوة تحكم حرجة (Critical Control Point)
            </p>
          </div>

          {/* الحد الحرج (يظهر فقط إذا كانت خطوة حرجة) */}
          {newStep.isCritical && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الحد الحرج
              </label>
              <input
                type="text"
                value={newStep.criticalLimit}
                onChange={(e) => handleInputChange('criticalLimit', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="مثال: درجة حرارة ≥ 75°C"
              />
            </div>
          )}

          {/* إجراءات المراقبة */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              إجراءات المراقبة
            </label>
            <textarea
              value={newStep.monitoringProcedure}
              onChange={(e) => handleInputChange('monitoringProcedure', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={2}
              placeholder="كيف سيتم مراقبة هذه الخطوة..."
            />
          </div>

          {/* الإجراءات التصحيحية */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الإجراءات التصحيحية
            </label>
            <textarea
              value={newStep.correctiveActions}
              onChange={(e) => handleInputChange('correctiveActions', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={2}
              placeholder="ما الإجراءات التي ستتخذ في حالة الخروج عن السيطرة..."
            />
          </div>
        </div>

        {/* زر الإضافة */}
        <div className="mt-6">
          <button
            onClick={handleAddStep}
            disabled={isLoading || !newStep.description.trim()}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-200"
          >
            {isLoading ? 'جاري الإضافة...' : 'إضافة الخطوة'}
          </button>
        </div>
      </div>

      {/* قائمة الخطوات الموجودة */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">الخطوات المضافة ({steps.length})</h2>
        
        {steps.length === 0 ? (
          <p className="text-gray-500 text-center py-8">لم تتم إضافة أي خطوات بعد</p>
        ) : (
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`border-l-4 p-4 rounded-r-lg ${
                  step.isCritical 
                    ? 'border-red-500 bg-red-50' 
                    : 'border-gray-300 bg-gray-50'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 space-x-reverse mb-2">
                      <span className="font-semibold text-lg">الخطوة {index + 1}</span>
                      {step.isCritical && (
                        <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                          خطوة حرجة (CCP)
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-700 mb-3">{step.description}</p>
                    
                    {step.isCritical && step.criticalLimit && (
                      <div className="mb-2">
                        <span className="font-medium text-gray-600">الحد الحرج: </span>
                        <span className="text-gray-800">{step.criticalLimit}</span>
                      </div>
                    )}
                    
                    {step.monitoringProcedure && (
                      <div className="mb-2">
                        <span className="font-medium text-gray-600">المراقبة: </span>
                        <span className="text-gray-800">{step.monitoringProcedure}</span>
                      </div>
                    )}
                    
                    {step.correctiveActions && (
                      <div>
                        <span className="font-medium text-gray-600">الإجراءات التصحيحية: </span>
                        <span className="text-gray-800">{step.correctiveActions}</span>
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={() => handleDeleteStep(step.id)}
                    className="text-red-600 hover:text-red-800 p-2 transition duration-200"
                    title="حذف الخطوة"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}