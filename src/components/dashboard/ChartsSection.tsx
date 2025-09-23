'use client';

interface ChartsSectionProps {
  records: any[];
  facilities: any[];
  userRole: string;
}

export default function ChartsSection({ records, facilities, userRole }: ChartsSectionProps) {
  // إذا لم تكن هناك بيانات كافية، لا تعرض المخططات
  if (records.length === 0 && facilities.length === 0) {
    return null;
  }

  return (
    <div className="charts-section">
      <h2>التقارير والإحصائيات</h2>
      <div className="charts-grid">
        <div className="chart-card">
          <h3>حالة السجلات</h3>
          <div className="chart-placeholder">
            <p>📊 مخطط حالة السجلات سيظهر هنا</p>
            <small>السجلات النشطة: {records.length}</small>
          </div>
        </div>
        
        <div className="chart-card">
          <h3>توزيع المنشآت</h3>
          <div className="chart-placeholder">
            <p>🏭 مخطط توزيع المنشآت سيظهر هنا</p>
            <small>إجمالي المنشآت: {facilities.length}</small>
          </div>
        </div>

        {(userRole === 'ADMIN' || userRole === 'QUALITY_MANAGER') && (
          <div className="chart-card">
            <h3>النشاط الشهري</h3>
            <div className="chart-placeholder">
              <p>📈 مخطط النشاط الشهري سيظهر هنا</p>
              <small>للمسؤولين ومديري الجودة</small>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}