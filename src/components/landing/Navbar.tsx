'use client'

import { useState } from 'react'

const navLinks = [
  { label: 'الرئيسية', href: '#hero' },
  { label: 'المميزات', href: '#features' },
  { label: 'عن النظام', href: '#about' },
  { label: 'تواصل معنا', href: '#contact' },
]

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-white shadow-sm border-b border-[#e5e7eb]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="#hero" className="flex items-center gap-2 shrink-0">
            <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#0f172a]">
              <i className="bi bi-shield-check text-white text-lg"></i>
            </span>
            <span className="text-[#0a0a0a] font-bold text-lg leading-tight">
              HACCP System
            </span>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8" aria-label="التنقل الرئيسي">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-[#334155] hover:text-[#0f172a] font-medium text-sm transition-colors duration-200"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* CTA + Hamburger */}
          <div className="flex items-center gap-3">
            <a
              href="/auth-pages/signin"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0f172a] hover:bg-[#1e293b] text-white text-sm font-semibold transition-colors duration-200"
            >
              <i className="bi bi-box-arrow-in-left text-base"></i>
              تسجيل الدخول
            </a>
            <button
              className="md:hidden p-2 rounded-lg text-[#334155] hover:bg-[#f1f5f9] transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="فتح القائمة"
            >
              <i className={`bi ${mobileOpen ? 'bi-x-lg' : 'bi-list'} text-xl`}></i>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-[#e5e7eb] px-4 pb-4">
          <nav className="flex flex-col gap-1 pt-3">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="text-[#334155] hover:text-[#0f172a] hover:bg-[#f1f5f9] font-medium text-sm py-2.5 px-3 rounded-lg transition-colors"
              >
                {link.label}
              </a>
            ))}
            <a
              href="/auth-pages/signin"
              className="mt-2 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#0f172a] hover:bg-[#1e293b] text-white text-sm font-semibold transition-colors"
            >
              <i className="bi bi-box-arrow-in-left text-base"></i>
              تسجيل الدخول
            </a>
          </nav>
        </div>
      )}
    </header>
  )
}
