const quickLinks = [
  { label: 'الرئيسية', href: '#hero' },
  { label: 'المميزات', href: '#features' },
  { label: 'عن النظام', href: '#about' },
  { label: 'تواصل معنا', href: '#contact' },
]

const legalLinks = [
  { label: 'سياسة الخصوصية', href: '#' },
  { label: 'شروط الاستخدام', href: '#' },
  { label: 'اتفاقية الخدمة', href: '#' },
]

export default function Footer() {
  return (
    <footer id="contact" className="bg-[#0a0a0a] text-[#cbd5e1]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#1e293b]">
                <i className="bi bi-shield-check text-white text-lg"></i>
              </span>
              <span className="text-white font-bold text-lg">HACCP System</span>
            </div>
            <p className="text-[#64748b] text-sm leading-relaxed max-w-sm mb-6">
              نظام متكامل لإدارة وتوثيق إجراءات سلامة الغذاء وفق معايير HACCP الدولية، يخدم المنشآت الغذائية في منطقة الشرق الأوسط.
            </p>
            <div className="flex items-center gap-3">
              {[
                { icon: 'bi-twitter-x', href: '#' },
                { icon: 'bi-linkedin', href: '#' },
                { icon: 'bi-facebook', href: '#' },
                { icon: 'bi-youtube', href: '#' },
              ].map((social) => (
                <a
                  key={social.icon}
                  href={social.href}
                  className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#1e293b] hover:bg-[#334155] text-[#64748b] hover:text-white transition-colors duration-200"
                  aria-label={social.icon}
                >
                  <i className={`bi ${social.icon} text-sm`}></i>
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-widest">
              روابط سريعة
            </h4>
            <ul className="flex flex-col gap-2.5">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-[#64748b] hover:text-white text-sm flex items-center gap-2 transition-colors group"
                  >
                    <i className="bi bi-chevron-left text-xs text-[#475569] group-hover:translate-x-[-2px] transition-transform"></i>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-widest">
              تواصل معنا
            </h4>
            <ul className="flex flex-col gap-3">
              <li className="flex items-center gap-3 text-sm text-[#64748b]">
                <i className="bi bi-envelope-fill text-[#94a3b8] text-base shrink-0"></i>
                <span>info@haccpsystem.com</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-[#64748b]">
                <i className="bi bi-telephone-fill text-[#94a3b8] text-base shrink-0"></i>
                <span dir="ltr">+966 11 000 0000</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-[#64748b]">
                <i className="bi bi-geo-alt-fill text-[#94a3b8] text-base shrink-0"></i>
                <span>الرياض، المملكة العربية السعودية</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-[#64748b]">
                <i className="bi bi-whatsapp text-[#94a3b8] text-base shrink-0"></i>
                <span>واتساب للدعم الفوري</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[#1e293b] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[#334155] text-xs text-center sm:text-right">
            © {new Date().getFullYear()} HACCP System. جميع الحقوق محفوظة.
          </p>
          <div className="flex items-center gap-4">
            {legalLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-[#334155] hover:text-[#64748b] text-xs transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
