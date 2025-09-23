'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import './addStorage.css';

export default function AddStoragePage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [location, setLocation] = useState('');
  const [capacity, setCapacity] = useState<number | ''>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name || !type) {
      setError('الاسم والنوع مطلوبان');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/storage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resource: 'storage',
          action: 'create',
          data: {
            name,
            type,
            location: location || null,
            capacity: capacity === '' ? null : Number(capacity),
          },
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'حدث خطأ أثناء الإضافة');
      }

      setSuccess('تمت إضافة وحدة التخزين بنجاح!');
      // إعادة توجيه بعد ثانيتين
      setTimeout(() => router.push('/storages'), 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="add-storage-container">
      <h1>إضافة وحدة تخزين جديدة</h1>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <form onSubmit={handleSubmit} className="add-storage-form">
        <label>
          الاسم<span className="required">*</span>:
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="اسم وحدة التخزين"
            required
          />
        </label>

        <label>
          النوع<span className="required">*</span>:
          <select value={type} onChange={(e) => setType(e.target.value)} required>
            <option value="">اختر النوع</option>
            <option value="REFRIGERATOR">ثلاجة</option>
            <option value="FREEZER">فريزر</option>
            <option value="DRY_STORAGE">تخزين جاف</option>
            <option value="CHILLER">مبرد</option>
          </select>
        </label>

        <label>
          الموقع:
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="مكان وحدة التخزين"
          />
        </label>

        <label>
          السعة (لتر):
          <input
            type="number"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="السعة باللتر"
            min={0}
          />
        </label>

        <button type="submit" disabled={isLoading}>
          {isLoading ? 'جاري الإضافة...' : 'إضافة'}
        </button>
      </form>
    </div>
  );
}
