'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

// أيقونات SVG احترافية
const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <path d="m21 21-4.3-4.3"></path>
  </svg>
);

const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4"></circle>
    <path d="M12 2v2"></path>
    <path d="M12 20v2"></path>
    <path d="m4.93 4.93 1.41 1.41"></path>
    <path d="m17.66 17.66 1.41 1.41"></path>
    <path d="M2 12h2"></path>
    <path d="M20 12h2"></path>
    <path d="m6.34 17.66-1.41 1.41"></path>
    <path d="m19.07 4.93-1.41 1.41"></path>
  </svg>
);

const MoonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
  </svg>
);

const RefreshIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
    <path d="M21 3v5h-5"></path>
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
    <path d="M3 21v-5h5"></path>
  </svg>
);

const LogoutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
    <polyline points="16 17 21 12 16 7"></polyline>
    <line x1="21" x2="9" y1="12" y2="12"></line>
  </svg>
);

interface DashboardHeaderProps {
  searchTerm: string;
  onSearch: (term: string) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onRefresh: () => void;
  onLogout: () => void;
}

export default function DashboardHeader({
  searchTerm,
  onSearch,
  isDarkMode,
  onToggleDarkMode,
  onRefresh,
  onLogout
}: DashboardHeaderProps) {
  const { data: session } = useSession();
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
          <p>لوحة تحكم نظام HACCP — آخر تحديث: {new Date().toLocaleString('ar-SA')}</p>
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
            <button type="submit" className="search-button" aria-label="تنفيذ البحث">
              <SearchIcon />
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
            {isDarkMode ? <SunIcon /> : <MoonIcon />}
          </button>
          
          <button 
            onClick={onRefresh}
            className="refresh-button"
            aria-label="تحديث البيانات"
            title="تحديث البيانات"
          >
            <RefreshIcon />
          </button>
          
          <button 
            onClick={onLogout}
            className="logout-btn"
            aria-label="تسجيل الخروج"
            title="تسجيل الخروج"
          >
            <LogoutIcon />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </div>
    </div>
  );
}