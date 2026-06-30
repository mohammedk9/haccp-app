// src/app/layout.tsx
'use client';

import { Geist, Geist_Mono } from "next/font/google";
import { Cairo } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "./SessionProvider";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["300","400","500","600","700","800","900"],
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <title>نظام HACCP</title>
        <meta name="description" content="نظام تحليل المخاطر ونقاط التحكم الحرجة" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} ${cairo.variable} antialiased rtl`}>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}