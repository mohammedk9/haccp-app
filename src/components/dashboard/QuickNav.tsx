// src/components/dashboard/QuickNav.tsx
'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';

const quickLinks = [
  { href: '/users', label: 'المستخدمين', icon: '👥', roles: ['ADMIN'] },
  { href: '/facilities', label: 'المنشآت', icon: '🏭', roles: ['ADMIN', 'QUALITY_MANAGER'] },
  { href: '/hazards', label: 'المخاطر', icon: '⚠️', roles: ['ADMIN', 'QUALITY_MANAGER'] },
  { href: '/ccps', label: 'نقاط التحكم', icon: '🛡️', roles: ['ADMIN', 'QUALITY_MANAGER'] },
  { href: '/products', label: 'المنتجات', icon: '📦', roles: ['ADMIN', 'QUALITY_MANAGER', 'OPERATOR'] },
  { href: '/records', label: 'الملاحظات', icon: '📊', roles: ['ADMIN', 'QUALITY_MANAGER', 'OPERATOR'] },
  { href: '/haccp-plans', label: 'خطط HACCP', icon: '📋', roles: ['ADMIN', 'QUALITY_MANAGER'] },
  { href: '/storages', label: 'وحدات التخزين', icon: '❄️', roles: ['ADMIN', 'QUALITY_MANAGER'] },
  { href: '/reports', label: 'السجلات', icon: '📈', roles: ['ADMIN', 'QUALITY_MANAGER'] },
];

export default function QuickNav() {
  const { data: session } = useSession();
  const userRole = session?.user?.role || '';

  const filteredLinks = quickLinks.filter(link => 
    link.roles.includes(userRole)
  );

  return (
    <div className="quick-nav">
      <h3>تنقل سريع</h3>
      <div className="quick-links-grid">
        {filteredLinks.map((link) => (
          <Link key={link.href} href={link.href} className="quick-link">
            <span className="quick-link-icon">{link.icon}</span>
            <span className="quick-link-label">{link.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}