'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';

const quickLinks = [
  { 
    href: '/users', 
    label: 'المستخدمين', 
    desc: 'إدارة الصلاحيات',
    roles: ['ADMIN', 'SUPER_ADMIN'],
  },
  { 
    href: '/facilities', 
    label: 'المنشآت', 
    desc: 'مواقع العمل',
    roles: ['ADMIN', 'QUALITY_MANAGER', 'SUPER_ADMIN'],
  },
  { 
    href: '/hazards', 
    label: 'المخاطر', 
    desc: 'تحليل المخاطر',
    roles: ['ADMIN', 'QUALITY_MANAGER', 'SUPER_ADMIN'],
  },
  { 
    href: '/ccps', 
    label: 'نقاط التحكم', 
    desc: 'CCP حرجة',
    roles: ['ADMIN', 'QUALITY_MANAGER', 'SUPER_ADMIN'],
  },
  { 
    href: '/products', 
    label: 'المنتجات', 
    desc: 'قائمة المنتجات',
    roles: ['ADMIN', 'QUALITY_MANAGER', 'OPERATOR', 'SUPER_ADMIN'],
  },
  { 
    href: '/records', 
    label: 'السجلات', 
    desc: 'المتابعة اليومية',
    roles: ['ADMIN', 'QUALITY_MANAGER', 'OPERATOR', 'SUPER_ADMIN'],
  },
  { 
    href: '/haccp-plans', 
    label: 'خطط HACCP', 
    desc: 'الخطط الرئيسية',
    roles: ['ADMIN', 'QUALITY_MANAGER', 'SUPER_ADMIN'],
  },
  { 
    href: '/storages', 
    label: 'التخزين', 
    desc: 'درجات الحرارة',
    roles: ['ADMIN', 'QUALITY_MANAGER', 'SUPER_ADMIN'],
  },
  { 
    href: '/reports', 
    label: 'التقارير', 
    desc: 'تحليلات وإحصائيات',
    roles: ['ADMIN', 'QUALITY_MANAGER', 'SUPER_ADMIN'],
  },
];

// أيقونات SVG احترافية
const Icons = {
  users: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
      <circle cx="9" cy="7" r="4"></circle>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>
  ),
  facilities: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21h18"></path>
      <path d="M5 21V7l8-4 8 4v14"></path>
      <path d="M9 21v-6h6v6"></path>
      <path d="M10 9h4"></path>
      <path d="M10 13h4"></path>
    </svg>
  ),
  hazards: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
      <line x1="12" y1="9" x2="12" y2="13"></line>
      <line x1="12" y1="17" x2="12.01" y2="17"></line>
    </svg>
  ),
  ccps: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"></path>
      <path d="m9 12 2 2 4-4"></path>
    </svg>
  ),
  products: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m7.5 4.27 9 5.15"></path>
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path>
      <path d="m3.3 7 8.7 5 8.7-5"></path>
      <path d="M12 22V12"></path>
    </svg>
  ),
  records: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <line x1="16" y1="13" x2="8" y2="13"></line>
      <line x1="16" y1="17" x2="8" y2="17"></line>
      <line x1="10" y1="9" x2="8" y2="9"></line>
    </svg>
  ),
  haccp: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
    </svg>
  ),
  storages: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
    </svg>
  ),
  reports: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"></line>
      <line x1="12" y1="20" x2="12" y2="4"></line>
      <line x1="6" y1="20" x2="6" y2="14"></line>
      <path d="M3 20h18"></path>
    </svg>
  ),
};

const iconMap: Record<string, keyof typeof Icons> = {
  users: 'users',
  facilities: 'facilities',
  hazards: 'hazards',
  ccps: 'ccps',
  products: 'products',
  records: 'records',
  'haccp-plans': 'haccp',
  storages: 'storages',
  reports: 'reports',
};

export default function QuickNav() {
  const { data: session } = useSession();
  const userRole = session?.user?.role || '';

  const filteredLinks = quickLinks.filter(link => link.roles.includes(userRole));

  return (
    <div className="quick-nav-premium">
      <div className="quick-nav-header">
        <h3>التنقل السريع</h3>
        <p>وصول فوري لجميع أقسام النظام</p>
      </div>

      <div className="quick-links-premium">
        {filteredLinks.map((link) => {
          const Icon = Icons[iconMap[link.href.replace('/', '')] || 'facilities'];

          return (
            <Link 
              key={link.href} 
              href={link.href} 
              className="quick-link-premium"
            >
              <div className="quick-link-icon-premium">
                <Icon />
              </div>
              <div className="quick-link-content">
                <span className="quick-link-title">{link.label}</span>
                <span className="quick-link-desc">{link.desc}</span>
              </div>
              <div className="quick-link-arrow-premium">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14"></path>
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}