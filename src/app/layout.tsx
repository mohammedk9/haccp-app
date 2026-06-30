'use client';

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "./SessionProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <title>نظام HACCP</title>
        <meta name="description" content="نظام تحليل المخاطر ونقاط التحكم الحرجة" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased rtl`}>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}