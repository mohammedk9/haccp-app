'use client';

import { useState, useEffect, useCallback } from 'react';

export function useTheme() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) {
      const isDark = JSON.parse(saved);
      setIsDarkMode(isDark);
      if (isDark) {
        document.body.setAttribute('data-theme', 'dark');
      } else {
        document.body.removeAttribute('data-theme');
      }
    } else {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(systemDark);
      if (systemDark) {
        document.body.setAttribute('data-theme', 'dark');
      }
    }

    // الاستماع لتغييرات من نوافذ أخرى
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'darkMode') {
        const isDark = JSON.parse(e.newValue || 'false');
        setIsDarkMode(isDark);
        if (isDark) {
          document.body.setAttribute('data-theme', 'dark');
        } else {
          document.body.removeAttribute('data-theme');
        }
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode((prev) => {
      const next = !prev;
      if (next) {
        document.body.setAttribute('data-theme', 'dark');
      } else {
        document.body.removeAttribute('data-theme');
      }
      localStorage.setItem('darkMode', JSON.stringify(next));
      // إشارة تخزين لتزامن التبويبات الأخرى
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'darkMode',
        newValue: JSON.stringify(next),
        oldValue: JSON.stringify(prev)
      }));
      return next;
    });
  }, []);

  return { isDarkMode, toggleDarkMode, mounted };
}