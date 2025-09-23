interface StatCardProps {
  title: string;
  value: number;
  icon: string;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  onClick?: () => void;
  ariaLabel?: string; // تم الإضافة
}

export default function StatCard({ 
  title, 
  value, 
  icon, 
  subtitle, 
  trend, 
  onClick,
  ariaLabel 
}: StatCardProps) {
  return (
    <div 
      className="stat-card" 
      onClick={onClick}
      role={onClick ? "button" : "region"}
      tabIndex={onClick ? 0 : -1}
      aria-label={ariaLabel || title}
      onKeyPress={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <div className="stat-icon" aria-hidden="true">{icon}</div>
      <div className="stat-content">
        <h3>{value.toLocaleString('ar-SA')}</h3>
        <p>{title}</p>
        {subtitle && <span className="stat-subtitle">{subtitle}</span>}
        {trend && (
          <div 
            className={`stat-trend ${trend.isPositive ? 'positive' : 'negative'}`}
            aria-label={`الاتجاه ${trend.isPositive ? 'إيجابي' : 'سلبي'} بنسبة ${Math.abs(trend.value)}%`}
          >
            <i className={`bi bi-arrow-${trend.isPositive ? 'up' : 'down'}`}></i>
            {Math.abs(trend.value)}%
          </div>
        )}
      </div>
    </div>
  );
}