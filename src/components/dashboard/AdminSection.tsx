'use client';

import { useRouter } from 'next/navigation';

interface AdminSectionProps {
  userStats: any;
  alerts: any[];
}

export default function AdminSection({ userStats, alerts }: AdminSectionProps) {
  const router = useRouter();

  if (!userStats) return null;

  return (
    <div className="admin-section">
      <h2>الإحصائيات المتقدمة</h2>
      <div className="admin-grid">
        <div className="admin-card">
          <h3>توزيع المستخدمين</h3>
          <div className="role-distribution">
            {Object.entries(userStats.byRole || {}).map(([role, count]) => {
              const percentage = userStats.total > 0 
                ? (Number(count) / userStats.total) * 100 
                : 0;
              
              return (
                <div key={role} className="role-item">
                  <span className="role-name">{getRoleName(role)}</span>
                  <div className="role-bar">
                    <div 
                      className="role-fill" 
                      style={{ width: `${percentage}%` }}
                      role="progressbar"
                      aria-valuenow={percentage}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    ></div>
                  </div>
                  <span className="role-count">
                    {count} ({percentage.toFixed(1)}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="admin-card">
          <h3>نظرة سريعة على النظام</h3>
          <div className="system-overview">
            <div className="system-item">
              <span>إجمالي العناصر:</span>
              <span>{(userStats.facilitiesCount || 0) + (userStats.ccpsCount || 0) + (userStats.recordsCount || 0)}</span>
            </div>
            <div className="system-item">
              <span>التنبيهات النشطة:</span>
              <span>{alerts.filter(a => a.type !== 'info').length}</span>
            </div>
            <div className="system-item">
              <span>آخر تحديث:</span>
              <span>{new Date().toLocaleTimeString('ar-SA')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getRoleName(role: string): string {
  const roleNames: { [key: string]: string } = {
    'ADMIN': 'مسؤول',
    'OPERATOR': 'مشغل',
    'QUALITY_MANAGER': 'مدير الجودة',
    'AUDITOR': 'مراجع',
    'NUTRITION_SPECIALIST': 'أخصائي تغذية',
    'GENERAL_SUPERVISOR': 'مشرف عام',
    'QUALITY_INSPECTOR': 'مفتش جودة',
    'FOOD_INSPECTOR': 'مفتش أغذية',
    'FOOD_TECHNICIAN': 'فني أغذية'
  };
  return roleNames[role] || role;
}