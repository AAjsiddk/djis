import { useEffect } from 'react';
import type { Settings } from '@/types';

export function applyDarkMode(darkMode: Settings['dark_mode']) {
  const root = document.documentElement;
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  const isDark = darkMode === 'dark' || (darkMode === 'auto' && media.matches);
  root.classList.toggle('dark', isDark);
}

export function useDarkMode(settings: Settings) {
  useEffect(() => {
    applyDarkMode(settings.dark_mode);
    if (settings.dark_mode === 'auto') {
      const media = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = () => applyDarkMode('auto');
      media.addEventListener('change', handler);
      return () => media.removeEventListener('change', handler);
    }
  }, [settings.dark_mode]);
}
