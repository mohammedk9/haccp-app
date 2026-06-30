const features = [
  {
    icon: 'bi-geo-alt-fill',
    title: 'تتبع نقاط التحكم الحرجة',
    description:
      'رصد ومتابعة جميع نقاط CCP في خط الإنتاج بشكل فوري مع تسجيل القراءات والقيم الحرجة تلقائيًا.',
  },
  {
    icon: 'bi-exclamation-triangle-fill',
    title: 'تسجيل الانحرافات',
    description:
      'توثيق أي انحراف عن الحدود المسموح بها مع إشعار فوري للمسؤولين وخطة إجراءات تصحيحية جاهزة.',
  },
  {
    icon: 'bi-file-earmark-bar-graph-fill',
    title: 'تقارير PDF/Excel تلقائية',
    description:
      'توليد تقارير احترافية وتصديرها بصيغة PDF أو Excel بضغطة واحدة لمتطلبات التدقيق والرقابة.',
  },
  {
    icon: 'bi-people-fill',
    title: 'إدارة المستخدمين والصلاحيات',
    description:
      'تحكم كامل في مستويات الوصول والأدوار الوظيفية لكل عضو في الفريق بحسب مسؤولياته.',
  },
  {
    icon: 'bi-bell-fill',
    title: 'تنبيهات فورية',
    description:
      'نظام إشعارات متكامل عبر البريد الإلكتروني والرسائل الفورية عند تجاوز الحدود الحرجة.',
  },
  {
    icon: 'bi-archive-fill',
    title: 'أرشفة آمنة للسجلات',
    description:
      'حفظ جميع السجلات والتقارير في مستودع رقمي مشفر وسهل الاسترجاع في أي وقت.',
  },
]

export default function Features() {
  return (
    <section id="features" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-[#334155] font-semibold text-sm uppercase tracking-widest mb-3">
            مميزات النظام
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0a0a0a] mb-4 text-balance">
            كل ما تحتاجه لضمان سلامة الغذاء
          </h2>
          <p className="text-[#64748b] text-lg max-w-2xl mx-auto leading-relaxed">
            أدوات متكاملة ومتوافقة مع أحدث معايير HACCP الدولية لمساعدتك في الوفاء بمتطلبات الجهات الرقابية.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group bg-white rounded-2xl border border-[#e5e7eb] p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[#f1f5f9] flex items-center justify-center group-hover:bg-[#0f172a] transition-colors duration-300">
                  <i className={`bi ${feature.icon} text-xl text-[#0f172a] group-hover:text-white transition-colors duration-300`}></i>
                </div>
                <div>
                  <h3 className="text-[#0a0a0a] font-bold text-base mb-2">{feature.title}</h3>
                  <p className="text-[#64748b] text-sm leading-relaxed">{feature.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
