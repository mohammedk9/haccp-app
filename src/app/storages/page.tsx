import { Suspense } from 'react';
import StoragesList from './StoragesList';
import './storages.css';

export default function StoragesPage() {
  return (
    <Suspense fallback={<div>جاري تحميل البيانات...</div>}>
      <StoragesList />
    </Suspense>
  );
}