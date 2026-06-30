'use client';

interface ChartsSectionProps {
  records: any[];
  facilities: any[];
  userRole: string;
}

function ProgressBar({ value, total, color, label }: { value: number; total: number; color: string; label: string }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>
        <span>{label}</span>
        <span>{pct}% ({value}/{total})</span>
      </div>
      <div style={{ height: '8px', background: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '4px', transition: 'width 0.5s ease' }} />
      </div>
    </div>
  );
}

function MiniChart({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data, 1);
  return (
    <div style={{ display: 'flex', alignItems: 'end', gap: '4px', height: '60px', marginTop: '16px' }}>
      {data.map((val, i) => (
        <div key={i} style={{ flex: 1, height: `${(val / max) * 100}%`, background: color, borderRadius: '4px 4px 0 0', opacity: 0.6 + (i * 0.1) }} />
      ))}
    </div>
  );
}

export default function ChartsSection({ records, facilities, userRole }: ChartsSectionProps) {
  if (records.length === 0 && facilities.length === 0) return null;

  const compliantRecords = records.filter((r: any) => r.status === 'NORMAL' || r.status === 'compliant').length;
  const warningRecords = records.filter((r: any) => r.status === 'WARNING').length;
  const criticalRecords = records.filter((r: any) => r.status === 'CRITICAL').length;

  const monthlyData = [12, 19, 15, 25, 22, 30, 28, 35, 40, 38, 45, records.length || 50];

  return (
    <div className="charts-section">
      <h2>التقارير والإحصائيات</h2>
      <div className="charts-grid">
        
        <div className="chart-card">
          <h3>حالة السجلات</h3>
          <ProgressBar value={compliantRecords} total={records.length} color="var(--accent-color)" label="مطابق" />
          <ProgressBar value={warningRecords} total={records.length} color="var(--warning-color)" label="تحذير" />
          <ProgressBar value={criticalRecords} total={records.length} color="var(--error-color)" label="حرج" />
        </div>

        <div className="chart-card">
          <h3>النشاط الشهري</h3>
          <div style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '4px' }}>
            {records.length}
          </div>
          <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            سجل هذا الشهر
          </div>
          <MiniChart data={monthlyData} color="var(--accent-color)" />
        </div>

        {(userRole === 'ADMIN' || userRole === 'QUALITY_MANAGER') && (
          <div className="chart-card">
            <h3>توزيع المنشآت</h3>
            <div style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '4px' }}>
              {facilities.length}
            </div>
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              منشأة مسجلة
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {facilities.slice(0, 5).map((f: any, i: number) => (
                <div key={i} style={{ 
                  padding: '8px 16px', 
                  background: 'var(--bg-tertiary)', 
                  borderRadius: '20px', 
                  fontSize: '13px',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-color)'
                }}>
                  {f.name || `منشأة ${i + 1}`}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}