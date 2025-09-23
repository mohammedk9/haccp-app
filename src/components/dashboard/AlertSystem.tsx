'use client';

interface Alert {
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

interface AlertSystemProps {
  alerts: Alert[];
  onMarkAsRead: (alertId: string) => void;
}

export default function AlertSystem({ alerts, onMarkAsRead }: AlertSystemProps) {
  if (!alerts.length) return null;

  const getAlertClass = (type: string) => {
    switch (type) {
      case 'critical': return 'critical';
      case 'warning': return 'warning';
      default: return 'info';
    }
  };

  return (
    <div className="alert-system">
      <div className="alert-grid">
        {alerts.map((alert) => (
          <div key={alert.id} className={`alert-item ${getAlertClass(alert.type)}`}>
            <div className="alert-icon">{alert.icon}</div>
            <div className="alert-content">
              <div className="alert-title">{alert.title}</div>
              <div className="alert-message">{alert.message}</div>
              <div className="alert-meta">
                <span>الأولوية: {alert.priority}</span>
                <span>{new Date(alert.timestamp).toLocaleString('ar-SA')}</span>
              </div>
            </div>
            <div className="alert-actions">
              <button 
                className="alert-action-button primary"
                onClick={() => window.location.href = alert.link}
              >
                عرض
              </button>
              <button 
                className="alert-action-button secondary"
                onClick={() => onMarkAsRead(alert.id)}
              >
                تم القراءة
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}