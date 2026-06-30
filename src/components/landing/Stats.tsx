const stats = [
  { value: '+500', label: 'منشأة غذائية نشطة', icon: 'bi-building' },
  { value: '98%', label: 'نسبة الامتثال للمعايير', icon: 'bi-patch-check-fill' },
  { value: '+10K', label: 'سجل موثق يوميًا', icon: 'bi-clipboard2-data-fill' },
  { value: '24/7', label: 'مراقبة ودعم فني', icon: 'bi-headset' },
]

const reasons = [
  { icon: 'bi-check2-circle', text: 'واجهة سهلة الاستخدام لا تحتاج خبرة تقنية' },
  { icon: 'bi-check2-circle', text: 'دعم عربي كامل مع توثيق شامل' },
  { icon: 'bi-check2-circle', text: 'تحديثات مستمرة تواكب التغييرات التنظيمية' },
  { icon: 'bi-check2-circle', text: 'تكامل مع أنظمة ERP وإدارة الجودة' },
  { icon: 'bi-check2-circle', text: 'نسخ احتياطي تلقائي وحماية من فقدان البيانات' },
  { icon: 'bi-check2-circle', text: 'تدريب وتأهيل للفريق مدرج في الاشتراك' },
]

export default function Stats() {
  return (
    <section id="about" className="py-24 bg-[#0f172a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-[#94a3b8] font-semibold text-sm uppercase tracking-widest mb-3">
            لماذا HACCP System؟
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 text-balance">
            ثقة المنشآت الرائدة في قطاع الغذاء
          </h2>
          <p className="text-[#94a3b8] text-lg max-w-2xl mx-auto leading-relaxed">
            أرقام تعكس الأثر الحقيقي لنظامنا على منشآت غذائية في مختلف القطاعات.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center hover:bg-white/10 transition-colors duration-200"
            >
              <i className={`bi ${stat.icon} text-3xl text-[#cbd5e1] mb-3 block`}></i>
              <div className="text-4xl font-extrabold text-white mb-2">{stat.value}</div>
              <div className="text-[#94a3b8] text-sm font-medium leading-snug">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Why section */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 sm:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-4 text-balance">
                نظام مصمم خصيصًا للسوق العربي
              </h3>
              <p className="text-[#94a3b8] text-base leading-relaxed mb-6">
                بنيناه من الصفر بفهم عميق لمتطلبات الجهات الرقابية في المنطقة، مع دعم كامل للغة العربية وتخصيص لكل قطاع.
              </p>
              <a
                href="#contact"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-[#0f172a] font-bold text-sm hover:bg-[#f1f5f9] transition-colors"
              >
                <i className="bi bi-envelope-fill"></i>
                تواصل مع فريقنا
              </a>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {reasons.map((reason) => (
                <li key={reason.text} className="flex items-start gap-3 text-white text-sm leading-relaxed">
                  <i className={`bi ${reason.icon} text-[#94a3b8] text-lg mt-0.5 shrink-0`}></i>
                  <span>{reason.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
