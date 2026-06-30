export default function Hero() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center overflow-hidden bg-[#0f172a] pt-16"
    >
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          {/* Text Content */}
          <div className="flex-1 text-center lg:text-right">
            <div className="inline-flex items-center gap-2 bg-white/10 text-white text-sm font-medium px-4 py-2 rounded-full mb-6 border border-white/20">
              <i className="bi bi-patch-check-fill text-base"></i>
              معتمد وفق معايير HACCP الدولية
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6 text-balance">
              إدارة سلامة الغذاء
              <span className="block text-[#94a3b8] mt-1">بكفاءة واحترافية</span>
            </h1>

            <p className="text-[#cbd5e1] text-lg sm:text-xl leading-relaxed mb-10 max-w-xl mx-auto lg:mx-0">
              نظام متكامل لتوثيق ومراقبة إجراءات سلامة الغذاء وفق معايير HACCP، يمنحك تحكمًا كاملًا في نقاط التحكم الحرجة وضمان الامتثال التنظيمي.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-end gap-4">
              <a
                href="#features"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-white text-[#0f172a] font-bold text-base hover:bg-[#f1f5f9] transition-colors duration-200 shadow-lg"
              >
                <i className="bi bi-rocket-takeoff-fill text-lg"></i>
                ابدأ الآن
              </a>
              <a
                href="#about"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl border-2 border-white/40 text-white font-semibold text-base hover:bg-white/10 transition-colors duration-200"
              >
                <i className="bi bi-info-circle text-lg"></i>
                تعرّف أكثر
              </a>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center justify-center lg:justify-end gap-6 mt-12 pt-8 border-t border-white/15">
              {[
                { icon: 'bi-shield-fill-check', text: 'امتثال تام للمعايير' },
                { icon: 'bi-clock-history', text: 'تتبع على مدار الساعة' },
                { icon: 'bi-lock-fill', text: 'بيانات مشفرة وآمنة' },
              ].map((badge) => (
                <div key={badge.text} className="flex items-center gap-2 text-white/70 text-sm font-medium">
                  <i className={`bi ${badge.icon} text-[#94a3b8]`}></i>
                  {badge.text}
                </div>
              ))}
            </div>
          </div>

          {/* Visual Element */}
          <div className="flex-shrink-0 relative">
            <div className="relative w-72 h-72 sm:w-80 sm:h-80">
              {/* Outer ring */}
              <div className="absolute inset-0 rounded-full border-4 border-white/15 animate-pulse"></div>
              {/* Middle ring */}
              <div className="absolute inset-6 rounded-full border-2 border-white/20"></div>
              {/* Inner circle */}
              <div className="absolute inset-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border-2 border-white/30">
                <div className="flex flex-col items-center gap-2">
                  <i className="bi bi-shield-check text-white text-6xl"></i>
                  <span className="text-white font-bold text-sm tracking-widest">HACCP</span>
                </div>
              </div>
              {/* Floating icons */}
              {[
                { icon: 'bi-thermometer-half', top: '5%', right: '5%', delay: '0s' },
                { icon: 'bi-clipboard2-pulse', top: '5%', left: '5%', delay: '0.4s' },
                { icon: 'bi-bar-chart-line', bottom: '5%', right: '5%', delay: '0.8s' },
                { icon: 'bi-bell-fill', bottom: '5%', left: '5%', delay: '1.2s' },
              ].map((item) => (
                <div
                  key={item.icon}
                  className="absolute flex items-center justify-center w-12 h-12 rounded-xl bg-white/15 border border-white/25 shadow-lg backdrop-blur-sm"
                  style={{
                    top: item.top,
                    right: item.right,
                    bottom: item.bottom,
                    left: item.left,
                    animation: `bounce 3s ease-in-out ${item.delay} infinite`,
                  }}
                >
                  <i className={`bi ${item.icon} text-white text-xl`}></i>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Wave divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 80" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-16 sm:h-20">
          <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" fill="#ffffff" />
        </svg>
      </div>
    </section>
  )
}
