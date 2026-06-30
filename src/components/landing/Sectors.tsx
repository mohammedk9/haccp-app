const sectors = [
  { icon: 'bi-cup-hot-fill', label: 'المطاعم والمقاهي' },
  { icon: 'bi-building-fill-gear', label: 'مصانع الأغذية' },
  { icon: 'bi-hospital-fill', label: 'المستشفيات والعيادات' },
  { icon: 'bi-house-door-fill', label: 'الفنادق والمنتجعات' },
  { icon: 'bi-box-seam-fill', label: 'مراكز التوزيع والتخزين' },
  { icon: 'bi-cart-fill', label: 'محلات السوبر ماركت' },
]

export default function Sectors() {
  return (
    <section className="py-16 bg-white border-y border-[#e5e7eb]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-[#94a3b8] text-sm font-semibold uppercase tracking-widest mb-10">
          قطاعات موثوقة تستخدم نظامنا
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {sectors.map((sector) => (
            <div
              key={sector.label}
              className="flex flex-col items-center gap-3 py-5 px-3 rounded-2xl border border-[#e5e7eb] hover:border-[#334155] hover:bg-[#f1f5f9] transition-all duration-200 cursor-default"
            >
              <i className={`bi ${sector.icon} text-3xl text-[#0f172a]`}></i>
              <span className="text-[#334155] text-xs font-semibold text-center leading-snug">
                {sector.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
