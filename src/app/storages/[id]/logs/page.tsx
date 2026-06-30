'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import './storageLogs.css'; 

interface StorageLog {
  id: string;
  temperature: number | null;
  humidity: number | null;
  cleanliness: string | null;
  measuredAt: string;
  storageId: string;
}

interface StorageInfo {
  id: string;
  name: string;
  type: string;
  location: string | null;
}

export default function StorageLogsPage() {
  const params = useParams();
  const storageId = params.id as string;

  const [logs, setLogs] = useState<StorageLog[]>([]);
  const [storageInfo, setStorageInfo] = useState<StorageInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newLog, setNewLog] = useState<Omit<StorageLog, 'id' | 'storageId'>>({
    temperature: null,
    humidity: null,
    cleanliness: '',
    measuredAt: new Date().toISOString().slice(0, 16)
  });

  const fetchStorageData = async () => {
    try {
      setIsLoading(true);
      setError('');

      const res = await fetch(`/api/storage?id=${storageId}`);
      if (!res.ok) {
        throw new Error('فشل في تحميل بيانات الوحدة');
      }

      const data = await res.json();
      setLogs(data.logs || []);
      
      // استخراج معلومات الوحدة من البيانات
      if (data.storages && data.storages.length > 0) {
        setStorageInfo(data.storages[0]);
      }
    } catch (err: any) {
      console.error('Error fetching storage data:', err);
      setError(err.message || 'حدث خطأ أثناء تحميل البيانات');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (storageId) {
      fetchStorageData();
    }
  }, [storageId]);

  const handleAddLog = async () => {
    if (!newLog.measuredAt) {
      setError('يرجى تحديد تاريخ ووقت القياس');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/storage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resource: 'log',
          action: 'create',
          data: {
            storageId,
            temperature: newLog.temperature || null,
            humidity: newLog.humidity || null,
            cleanliness: newLog.cleanliness || null,
            measuredAt: newLog.measuredAt
          }
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'حدث خطأ أثناء إضافة القياس');
      }

      setSuccess('تمت إضافة القياس بنجاح!');
      setNewLog({
        temperature: null,
        humidity: null,
        cleanliness: '',
        measuredAt: new Date().toISOString().slice(0, 16)
      });
      
      // إعادة تحميل البيانات بعد إضافة القياس
      fetchStorageData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof typeof newLog, value: any) => {
    setNewLog(prev => ({ 
      ...prev, 
      [field]: value === '' ? null : value 
    }));
  };

  const handleClearForm = () => {
    setNewLog({
      temperature: null,
      humidity: null,
      cleanliness: '',
      measuredAt: new Date().toISOString().slice(0, 16)
    });
    setError('');
  };

  if (isLoading) {
    return (
      <div className="storage-logs-container">
        <div className="loading">جاري تحميل البيانات...</div>
      </div>
    );
  }

  return (
    <div className="storage-logs-container">
      <div className="storage-logs-header">
        <Link href="/storages" className="back-link">
          ← العودة للوحدات
        </Link>
        <h1>رصد يومي للوحدة {storageInfo?.name || `#${storageId}`}</h1>
        {storageInfo && (
          <div className="storage-info">
            <span className="storage-type">{getTypeName(storageInfo.type)}</span>
            {storageInfo.location && <span className="storage-location">📍 {storageInfo.location}</span>}
          </div>
        )}
      </div>

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      {success && (
        <div className="success-message">
          <span className="success-icon">✅</span>
          {success}
        </div>
      )}

      {/* نموذج إضافة قياس */}
      <div className="add-log-section">
        <h2>إضافة قياس جديد</h2>
        <div className="log-form">
          <div className="form-grid">
            <div className="form-group">
              <label>درجة الحرارة (°C)</label>
              <input 
                type="number" 
                placeholder="أدخل درجة الحرارة"
                value={newLog.temperature ?? ''} 
                onChange={e => handleInputChange('temperature', e.target.valueAsNumber)}
                step="0.1"
              />
            </div>
            
            <div className="form-group">
              <label>الرطوبة (%)</label>
              <input 
                type="number" 
                placeholder="أدخل نسبة الرطوبة"
                value={newLog.humidity ?? ''} 
                onChange={e => handleInputChange('humidity', e.target.valueAsNumber)}
                min="0"
                max="100"
                step="0.1"
              />
            </div>
            
            <div className="form-group">
              <label>درجة النظافة</label>
              <input 
                type="text" 
                placeholder="أدخل درجة النظافة"
                value={newLog.cleanliness} 
                onChange={e => handleInputChange('cleanliness', e.target.value)}
              />
            </div>
            
            <div className="form-group">
              <label>تاريخ ووقت القياس</label>
              <input 
                type="datetime-local" 
                value={newLog.measuredAt} 
                onChange={e => handleInputChange('measuredAt', e.target.value)}
              />
            </div>
          </div>
          
          <div className="form-actions">
            <button 
              onClick={handleClearForm} 
              type="button" 
              className="clear-btn"
            >
              مسح النموذج
            </button>
            <button 
              onClick={handleAddLog} 
              disabled={isSubmitting}
              className="submit-btn"
            >
              {isSubmitting ? 'جاري الإضافة...' : 'إضافة القياس'}
            </button>
          </div>
        </div>
      </div>

      {/* جدول القياسات */}
      <div className="logs-table-section">
        <h2>سجل القياسات ({logs.length})</h2>
        
        {logs.length > 0 ? (
          <div className="table-container">
            <table className="logs-table">
              <thead>
                <tr>
                  <th>التاريخ والوقت</th>
                  <th>درجة الحرارة</th>
                  <th>الرطوبة</th>
                  <th>درجة النظافة</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id}>
                    <td>
                      <div className="datetime-cell">
                        <span className="date">{new Date(log.measuredAt).toLocaleDateString('ar-SA')}</span>
                        <span className="time">{new Date(log.measuredAt).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </td>
                    <td>
                      {log.temperature !== null ? (
                        <span className="temperature-value">{log.temperature}°C</span>
                      ) : (
                        <span className="no-data">--</span>
                      )}
                    </td>
                    <td>
                      {log.humidity !== null ? (
                        <span className="humidity-value">{log.humidity}%</span>
                      ) : (
                        <span className="no-data">--</span>
                      )}
                    </td>
                    <td>
                      {log.cleanliness ? (
                        <span className="cleanliness-value">{log.cleanliness}</span>
                      ) : (
                        <span className="no-data">--</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="no-logs">
            <p>لا توجد قياسات مسجلة لهذه الوحدة</p>
          </div>
        )}
      </div>
    </div>
  );
}

// دالة مساعدة لتحويل أسماء أنواع التخزين (نفس المستخدمة في الملفات الأخرى)
function getTypeName(type: string): string {
  const typeNames: { [key: string]: string } = {
    'REFRIGERATOR': 'ثلاجة',
    'FREEZER': 'فريزر',
    'DRY_STORAGE': 'تخزين جاف',
    'CHILLER': 'مبرد'
  };
  return typeNames[type] || type;
}