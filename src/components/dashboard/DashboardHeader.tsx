'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface DashboardHeaderProps {
  searchTerm: string;
  onSearch: (term: string) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onRefresh: () => void;
}

export default function DashboardHeader({
  searchTerm,
  onSearch,
  isDarkMode,
  onToggleDarkMode,
  onRefresh
}: DashboardHeaderProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(localSearchTerm);
  };

  return (
    <div className="dashboard-header">
      <div className="header-left">
        <div className="welcome-section">
          <h1>مرحباً بك، {session?.user?.name}!</h1>
          <p>لوحة تحكم نظام HACCP - آخر تحديث: {new Date().toLocaleString('ar-SA')}</p>
        </div>
      </div>
      
      <div className="header-right">
        <form onSubmit={handleSubmit} className="search-section" role="search">
          <div className="search-input-wrapper">
            <input
              type="text"
              placeholder="ابحث في المنشآت، السجلات، المنتجات..."
              value={localSearchTerm}
              onChange={(e) => setLocalSearchTerm(e.target.value)}
              className="global-search"
              aria-label="بحث في النظام"
            />
            <button type="submit" className="search-btn" aria-label="تنفيذ البحث">
              <i className="bi bi-search"></i>
            </button>
          </div>
        </form>

        <div className="header-actions">
          <button 
            onClick={onToggleDarkMode}
            className="theme-toggle"
            aria-label={isDarkMode ? 'تفعيل الوضع الفاتح' : 'تفعيل الوضع الداكن'}
            title={isDarkMode ? 'تفعيل الوضع الفاتح' : 'تفعيل الوضع الداكن'}
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
          
          <button 
            onClick={onRefresh}
            className="refresh-btn"
            aria-label="تحديث البيانات"
            title="تحديث البيانات"
          >
            <i className="bi bi-arrow-clockwise"></i>
          </button>
        </div>
      </div>
    </div>
  );
}