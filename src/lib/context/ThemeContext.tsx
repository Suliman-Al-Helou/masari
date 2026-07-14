'use client';

import {
  createContext, useContext,
  useState, useLayoutEffect
} from 'react';

// ── Types ──
type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
}

// ── Context ──
const ThemeContext = createContext<ThemeContextType | null>(null);

// ── Provider ──
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');

  // نقرأ من localStorage عند أول تحميل
  useLayoutEffect(() => {
    const saved = localStorage.getItem('theme') as Theme | null;
    const isDark =
      saved === 'dark' ||
      (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
    const initial: Theme = isDark ? 'dark' : 'light';
    setTheme(initial);
    document.documentElement.classList.toggle('dark', isDark);
  }, []);

  const toggleTheme = () => {
    setTheme(prev => {
      const next: Theme = prev === 'dark' ? 'light' : 'dark';
      document.documentElement.classList.toggle('dark', next === 'dark');
      localStorage.setItem('theme', next);
      return next;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, isDark: theme === 'dark', toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// ── Custom Hook ──
export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme لازم يكون داخل ThemeProvider');
  return ctx;
}