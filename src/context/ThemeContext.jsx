import { createContext, useContext, useState, useEffect, useCallback } from 'react';

/* ═══════════════════════════════════════════════════════
   CoreNexa — 5-Industry Dual Theme Engine
   ═══════════════════════════════════════════════════════
   Two independent axes:
     1. Mode     → dark | light
     2. Industry → hr | finance | marketing | crm | supply
   ═══════════════════════════════════════════════════════ */

const INDUSTRIES = {
  hr: {
    label: 'HR Growth',
    icon: '👥',
    lightAccent: '#10B981',
    darkAccent: '#10B981',
  },
  finance: {
    label: 'Finance',
    icon: '💹',
    lightAccent: '#16A34A',
    darkAccent: '#16A34A',
  },
  marketing: {
    label: 'Marketing',
    icon: '🚀',
    lightAccent: '#EA580C',
    darkAccent: '#EA580C',
  },
  crm: {
    label: 'CRM',
    icon: '🤝',
    lightAccent: '#EAB308',
    darkAccent: '#EAB308',
  },
  supply: {
    label: 'Supply Chain',
    icon: '📦',
    lightAccent: '#4682B4',
    darkAccent: '#4682B4',
  },
};

const INDUSTRY_KEYS = Object.keys(INDUSTRIES);

const STORAGE_MODE = 'cnx-mode';
const STORAGE_INDUSTRY = 'cnx-industry';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_MODE);
      return saved ? saved === 'dark' : true;
    } catch {
      return true;
    }
  });

  const [industry, setIndustry] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_INDUSTRY);
      return saved && INDUSTRIES[saved] ? saved : 'hr';
    } catch {
      return 'hr';
    }
  });

  // ── Apply mode class to <html> ──
  useEffect(() => {
    const html = document.documentElement;
    if (isDark) {
      html.classList.add('dark');
      html.classList.remove('light');
    } else {
      html.classList.remove('dark');
      html.classList.add('light');
    }
    try { localStorage.setItem(STORAGE_MODE, isDark ? 'dark' : 'light'); } catch { /* noop */ }
  }, [isDark]);

  // ── Apply industry data-theme to <html> ──
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', industry);
    try { localStorage.setItem(STORAGE_INDUSTRY, industry); } catch { /* noop */ }
  }, [industry]);

  const toggleMode = useCallback(() => setIsDark((p) => !p), []);

  const value = {
    isDark,
    setIsDark,
    toggleMode,
    industry,
    setIndustry,
    industries: INDUSTRIES,
    industryKeys: INDUSTRY_KEYS,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within <ThemeProvider>');
  return ctx;
}

export { INDUSTRIES, INDUSTRY_KEYS };
export default ThemeContext;
