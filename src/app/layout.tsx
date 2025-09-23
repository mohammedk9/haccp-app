// src/app/layout.tsx
'use client'; // ⚠️ أضف هذا لجعل الـ layout client component

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "./SessionProvider";
import { useEffect, useState } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// انقل metadata إلى client component باستخدام useServerInsertedHTML إذا أردت
// أو استخدم Viewport بدلاً من Metadata إذا كان هناك مشاكل

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // تحميل التفضيل من localStorage
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) {
      setIsDark(JSON.parse(saved));
    } else {
      // استخدام تفضيل النظام
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDark(systemDark);
    }
  }, []);

  useEffect(() => {
    // تطبيق الوضع على body
    if (isDark) {
      document.body.setAttribute('data-theme', 'dark');
    } else {
      document.body.removeAttribute('data-theme');
    }
    localStorage.setItem('darkMode', JSON.stringify(isDark));
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  return (
    <html lang="ar" dir="rtl" className={isDark ? 'dark' : 'light'}>
      <head>
        <title>نظام HACCP</title>
        <meta name="description" content="نظام تحليل المخاطر ونقاط التحكم الحرجة" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased rtl`}>
        {/* زر التبديل العالمي */}
        <button 
          onClick={toggleTheme}
          className="theme-toggle"
          title={isDark ? 'تفعيل الوضع الفاتح' : 'تفعيل الوضع الداكن'}
        >
          {isDark ? '☀️' : '🌙'}
        </button>
        
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
