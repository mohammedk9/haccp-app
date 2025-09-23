'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import StatCard from '@/components/dashboard/StatCard';
import QuickNav from '@/components/dashboard/QuickNav';
import RecentItemsList from '@/components/dashboard/RecentItemsList';
import AlertSystem from '@/components/dashboard/AlertSystem';
import ChartsSection from '@/components/dashboard/ChartsSection';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import AdminSection from '@/components/dashboard/AdminSection';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useTheme } from '@/hooks/useTheme';
import './dashboard.css';

// تعريف الأنواع المحلية إذا كانت غير موجودة في dashboard.ts
interface LocalAlert {
  id: string;
  type: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  count: number;
  link: string;
  priority: number;
  icon: string;
  timestamp: string;
}

interface LocalDashboardData {
  userStats?: {
    total: number;
    active: number;
    byRole: { [key: string]: number };
    facilitiesCount?: number;
    ccpsCount?: number;
    recordsCount?: number;
  };
  facilities: any[];
  ccps: any[];
  records: any[];
  storages: any[];
  hazards: any[];
  facilitiesCount: number;
  ccpsCount: number;
  recordsCount: number;
  storagesCount: number;
  hazardsCount: number;
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  
  const { isDarkMode, toggleDarkMode } = useTheme();
  const {
    dashboardData,
    alerts,
    isLoading,
    error,
    fetchDashboardData,
    fetchAlerts,
    handleMarkAsRead
  } = useDashboardData();

  // التحقق من المصادقة
  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/auth-pages/signin');
      return;
    }
  }, [session, status, router]);

  // جلب البيانات عند التحميل
  useEffect(() => {
    if (status === 'authenticated') {
      const loadData = async () => {
        await Promise.all([fetchDashboardData(), fetchAlerts()]);
      };
      loadData();
    }
  }, [status, fetchDashboardData, fetchAlerts]);

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
    if (term.trim()) {
      router.push(`/search?q=${encodeURIComponent(term)}`);
    }
  }, [router]);

  const handleRefresh = useCallback(() => {
    fetchDashboardData();
    fetchAlerts();
  }, [fetchDashboardData, fetchAlerts]);

  if (status === 'loading' || isLoading) {
    return (
      <div className="dashboard-container">
        <LoadingSpinner message="جاري تحميل البيانات..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <ErrorMessage 
          message={error}
          onRetry={fetchDashboardData}
        />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className={`dashboard-container ${isDarkMode ? 'dark' : 'light'}`}>
      <DashboardHeader
        searchTerm={searchTerm}
        onSearch={handleSearch}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
        onRefresh={handleRefresh}
      />

      <AlertSystem 
        alerts={alerts as LocalAlert[]} 
        onMarkAsRead={handleMarkAsRead} 
      />

      <StatsGrid 
        dashboardData={dashboardData as LocalDashboardData}
        userRole={session.user.role}
        router={router}
      />

      <QuickNav />

      <ChartsSection 
        records={dashboardData.records || []}
        facilities={dashboardData.facilities || []}
        userRole={session.user.role}
      />

      <RecentSections 
        dashboardData={dashboardData as LocalDashboardData}
        router={router}
      />

      {session.user.role === 'ADMIN' && dashboardData.userStats && (
        <AdminSection 
          userStats={dashboardData.userStats}
          alerts={alerts}
        />
      )}
    </div>
  );
}

// المكونات الداخلية المساعدة
function StatsGrid({ dashboardData, userRole, router }: any) {
  const stats = [
    {
      title: "المنشآت",
      value: dashboardData.facilitiesCount || 0,
      icon: "🏭",
      trend: { value: 12, isPositive: true },
      onClick: () => router.push('/facilities'),
      ariaLabel: `عرض المنشآت، العدد: ${dashboardData.facilitiesCount}`
    },
    {
      title: "نقاط التحكم",
      value: dashboardData.ccpsCount || 0,
      icon: "🛡️",
      subtitle: `${dashboardData.recordsCount} سجل`,
      onClick: () => router.push('/ccps'),
      ariaLabel: `عرض نقاط التحكم، العدد: ${dashboardData.ccpsCount}`
    },
    {
      title: "السجلات",
      value: dashboardData.recordsCount || 0,
      icon: "📊",
      trend: { value: 8, isPositive: true },
      onClick: () => router.push('/records'),
      ariaLabel: `عرض السجلات، العدد: ${dashboardData.recordsCount}`
    },
    {
      title: "وحدات التخزين",
      value: dashboardData.storagesCount || 0,
      icon: "❄️",
      onClick: () => router.push('/storages'),
      ariaLabel: `عرض وحدات التخزين، العدد: ${dashboardData.storagesCount}`
    },
    ...(userRole === 'ADMIN' && dashboardData.userStats ? [{
      title: "المستخدمين",
      value: dashboardData.userStats.total || 0,
      icon: "👥",
      subtitle: `${dashboardData.userStats.active} نشط`,
      onClick: () => router.push('/users'),
      ariaLabel: `عرض المستخدمين، العدد: ${dashboardData.userStats.total}`
    }] : []),
    {
      title: "المخاطر",
      value: dashboardData.hazardsCount || 0,
      icon: "⚠️",
      onClick: () => router.push('/hazards'),
      ariaLabel: `عرض المخاطر، العدد: ${dashboardData.hazardsCount}`
    }
  ];

  return (
    <div className="stats-grid">
      {stats.map((stat, index) => (
        <StatCard
          key={index}
          title={stat.title}
          value={stat.value}
          icon={stat.icon}
          subtitle={stat.subtitle}
          trend={stat.trend}
          onClick={stat.onClick}
          ariaLabel={stat.ariaLabel}
        />
      ))}
    </div>
  );
}

function RecentSections({ dashboardData, router }: any) {
  return (
    <div className="recent-sections">
      <div className="recent-column">
        <RecentItemsList
          title="أحدث المنشآت"
          items={dashboardData.facilities || []}
          onViewAll={() => router.push('/facilities')}
          renderItem={(facility: any) => ({
            title: facility.name,
            description: `${facility.location || 'بدون موقع'} - ${facility.type || 'بدون نوع'}`,
            date: facility.createdAt,
            meta: facility.user?.name,
            onClick: () => router.push(`/facilities/${facility.id}`)
          })}
        />
      </div>

      <div className="recent-column">
        <RecentItemsList
          title="أحدث السجلات"
          items={dashboardData.records || []}
          onViewAll={() => router.push('/records')}
          renderItem={(record: any) => ({
            title: `${record.value} - ${getStatusText(record.status)}`,
            description: `${record.facility?.name || 'غير معروف'} - ${record.ccp?.name || 'غير معروف'}`,
            date: record.createdAt,
            meta: `بواسطة: ${record.user?.name || 'مستخدم'}`,
            status: record.status,
            onClick: () => router.push(`/records/${record.id}`)
          })}
        />
      </div>

      <div className="recent-column">
        <RecentItemsList
          title="أحدث وحدات التخزين"
          items={dashboardData.storages || []}
          onViewAll={() => router.push('/storages')}
          renderItem={(storage: any) => ({
            title: storage.name,
            description: `${storage.type} - ${storage.location || 'بدون موقع'}`,
            date: storage.createdAt,
            meta: `سعة: ${storage.capacity || 'غير محددة'}`,
            onClick: () => router.push(`/storages/${storage.id}`)
          })}
        />
      </div>
    </div>
  );
}

function getStatusText(status?: string): string {
  const statusNames: { [key: string]: string } = {
    'NORMAL': 'طبيعي',
    'WARNING': 'تحذير',
    'CRITICAL': 'حرج'
  };
  return status ? statusNames[status] || status : 'غير محدد';
}