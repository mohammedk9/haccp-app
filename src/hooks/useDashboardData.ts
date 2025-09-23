import { useCallback, useState } from 'react';
import { useSession } from 'next-auth/react';

interface LocalDashboardData {
  userStats?: any;
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

export function useDashboardData() {
  const { data: session } = useSession();
  const [dashboardData, setDashboardData] = useState<LocalDashboardData>({
    facilities: [],
    ccps: [],
    records: [],
    storages: [],
    hazards: [],
    facilitiesCount: 0,
    ccpsCount: 0,
    recordsCount: 0,
    storagesCount: 0,
    hazardsCount: 0
  });
  const [alerts, setAlerts] = useState<LocalAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = useCallback(async () => {
    if (!session?.user?.id) return;

    try {
      setIsLoading(true);
      setError('');

      const requests = [
        session.user.role === 'ADMIN' ? 
          fetch('/api/users/stats').catch(handleFetchError) : 
          Promise.resolve(null),
        
        fetch('/api/facilities?limit=5').catch(() => ({ json: () => ({ facilities: [], pagination: { total: 0 } }) })),
        fetch('/api/ccps?limit=5').catch(() => ({ json: () => ({ ccps: [], pagination: { total: 0 } }) })),
        fetch('/api/records?limit=5').catch(() => ({ json: () => ({ records: [], pagination: { total: 0 } }) })),
        fetch('/api/storages?limit=3').catch(() => ({ json: () => ({ storages: [], pagination: { total: 0 } }) })),
        fetch('/api/hazards?limit=3').catch(() => ({ json: () => ({ hazards: [], pagination: { total: 0 } }) }))
      ];

      const responses = await Promise.all(requests);
      
      const userStats = responses[0]?.ok ? await responses[0].json() : null;
      const facilitiesData = responses[1].ok ? await responses[1].json() : { facilities: [], pagination: { total: 0 } };
      const ccpsData = responses[2].ok ? await responses[2].json() : { ccps: [], pagination: { total: 0 } };
      const recordsData = responses[3].ok ? await responses[3].json() : { records: [], pagination: { total: 0 } };
      const storagesData = responses[4].ok ? await responses[4].json() : { storages: [], pagination: { total: 0 } };
      const hazardsData = responses[5].ok ? await responses[5].json() : { hazards: [], pagination: { total: 0 } };

      setDashboardData({
        userStats,
        facilities: facilitiesData.facilities || [],
        ccps: ccpsData.ccps || [],
        records: recordsData.records || [],
        storages: storagesData.storages || [],
        hazards: hazardsData.hazards || [],
        facilitiesCount: facilitiesData.pagination?.total || 0,
        ccpsCount: ccpsData.pagination?.total || 0,
        recordsCount: recordsData.pagination?.total || 0,
        storagesCount: storagesData.pagination?.total || 0,
        hazardsCount: hazardsData.pagination?.total || 0
      });
    } catch (error) {
      handleDataError(error);
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id, session?.user?.role]);

  const fetchAlerts = useCallback(async () => {
    try {
      const response = await fetch('/api/alerts');
      if (response.ok) {
        const alertsData = await response.json();
        setAlerts(alertsData);
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  }, []);

  const handleMarkAsRead = useCallback(async (alertId: string) => {
    try {
      await fetch('/api/alerts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertId })
      });
      
      setAlerts(prev => prev.filter(alert => alert.id !== alertId));
    } catch (error) {
      console.error('Error marking alert as read:', error);
    }
  }, []);

  const handleFetchError = (error: any) => {
    console.error('Fetch error:', error);
    return null;
  };

  const handleDataError = (error: any) => {
    console.error('Dashboard data error:', error);
    
    if (error instanceof TypeError) {
      setError('مشكلة في الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت');
    } else if (error instanceof SyntaxError) {
      setError('خطأ في تنسيق البيانات المستلمة من الخادم');
    } else {
      setError('حدث خطأ غير متوقع أثناء تحميل البيانات');
    }
  };

  return {
    dashboardData,
    alerts,
    isLoading,
    error,
    fetchDashboardData,
    fetchAlerts,
    handleMarkAsRead
  };
}