import { createContext, useContext, useState, useEffect } from 'react';

const THEMES = {
  midnight: {
    id: 'midnight',
    name: 'Midnight (Linear Zinc)',
    colors: {
      '--color-bg': '#09090B',
      '--color-bg-card': '#141417',
      '--color-bg-elevated': '#1C1C20',
      '--color-bg-hover': '#26262B',
      '--color-bg-input': '#141417',
      '--color-primary': '#2563EB',
      '--color-primary-hover': '#1D4ED8',
      '--color-primary-light': '#3B82F6',
      '--color-primary-muted': 'rgba(37, 99, 235, 0.15)',
      '--color-accent': '#7C3AED',
      '--color-accent-hover': '#6D28D9',
      '--color-accent-light': '#8B5CF6',
      '--color-accent-muted': 'rgba(124, 58, 237, 0.15)',
      '--color-text': '#FAFAFA',
      '--color-text-secondary': '#E4E4E7',
      '--color-text-muted': '#A1A1AA',
      '--color-text-faint': '#71717A',
      '--color-border': '#27272A',
      '--color-border-light': '#3F3F46',
    },
  },
  aurora: {
    id: 'aurora',
    name: 'Aurora Indigo',
    colors: {
      '--color-bg': '#0F172A',
      '--color-bg-card': '#1E293B',
      '--color-bg-elevated': '#334155',
      '--color-bg-hover': '#475569',
      '--color-bg-input': '#1E293B',
      '--color-primary': '#6366F1',
      '--color-primary-hover': '#4F46E5',
      '--color-primary-light': '#818CF8',
      '--color-primary-muted': 'rgba(99, 102, 241, 0.15)',
      '--color-accent': '#10B981',
      '--color-accent-hover': '#059669',
      '--color-accent-light': '#34D399',
      '--color-accent-muted': 'rgba(16, 185, 129, 0.15)',
      '--color-text': '#F8FAFC',
      '--color-text-secondary': '#E2E8F0',
      '--color-text-muted': '#94A3B8',
      '--color-text-faint': '#64748B',
      '--color-border': '#334155',
      '--color-border-light': '#475569',
    },
  },
  graphite: {
    id: 'graphite',
    name: 'Graphite OLED',
    colors: {
      '--color-bg': '#000000',
      '--color-bg-card': '#111111',
      '--color-bg-elevated': '#1D1D1D',
      '--color-bg-hover': '#2B2B2B',
      '--color-bg-input': '#111111',
      '--color-primary': '#E11D48',
      '--color-primary-hover': '#BE123C',
      '--color-primary-light': '#FB7185',
      '--color-primary-muted': 'rgba(225, 29, 72, 0.15)',
      '--color-accent': '#F59E0B',
      '--color-accent-hover': '#D97706',
      '--color-accent-light': '#FBBF24',
      '--color-accent-muted': 'rgba(245, 158, 11, 0.15)',
      '--color-text': '#FFFFFF',
      '--color-text-secondary': '#E5E5E5',
      '--color-text-muted': '#A3A3A3',
      '--color-text-faint': '#737373',
      '--color-border': '#262626',
      '--color-border-light': '#404040',
    },
  },
  ocean: {
    id: 'ocean',
    name: 'Ocean Deep',
    colors: {
      '--color-bg': '#071626',
      '--color-bg-card': '#0E2238',
      '--color-bg-elevated': '#173250',
      '--color-bg-hover': '#21446B',
      '--color-bg-input': '#0E2238',
      '--color-primary': '#06B6D4',
      '--color-primary-hover': '#0891B2',
      '--color-primary-light': '#22D3EE',
      '--color-primary-muted': 'rgba(6, 182, 212, 0.15)',
      '--color-accent': '#3B82F6',
      '--color-accent-hover': '#2563EB',
      '--color-accent-light': '#60A5FA',
      '--color-accent-muted': 'rgba(59, 130, 246, 0.15)',
      '--color-text': '#F0F9FF',
      '--color-text-secondary': '#E0F2FE',
      '--color-text-muted': '#7DD3FC',
      '--color-text-faint': '#38BDF8',
      '--color-border': '#173250',
      '--color-border-light': '#21446B',
    },
  },
  forest: {
    id: 'forest',
    name: 'Forest Emerald',
    colors: {
      '--color-bg': '#061A14',
      '--color-bg-card': '#0C2B22',
      '--color-bg-elevated': '#143F33',
      '--color-bg-hover': '#1E5445',
      '--color-bg-input': '#0C2B22',
      '--color-primary': '#10B981',
      '--color-primary-hover': '#059669',
      '--color-primary-light': '#34D399',
      '--color-primary-muted': 'rgba(16, 185, 129, 0.15)',
      '--color-accent': '#84CC16',
      '--color-accent-hover': '#65A30D',
      '--color-accent-light': '#A3E635',
      '--color-accent-muted': 'rgba(132, 204, 22, 0.15)',
      '--color-text': '#ECFDF5',
      '--color-text-secondary': '#D1FAE5',
      '--color-text-muted': '#6EE7B7',
      '--color-text-faint': '#34D399',
      '--color-border': '#143F33',
      '--color-border-light': '#1E5445',
    },
  },
  light: {
    id: 'light',
    name: 'Light Minimal',
    colors: {
      '--color-bg': '#F4F4F5',
      '--color-bg-card': '#FFFFFF',
      '--color-bg-elevated': '#FAFAFA',
      '--color-bg-hover': '#E4E4E7',
      '--color-bg-input': '#FAFAFA',
      '--color-primary': '#2563EB',
      '--color-primary-hover': '#1D4ED8',
      '--color-primary-light': '#3B82F6',
      '--color-primary-muted': 'rgba(37, 99, 235, 0.1)',
      '--color-accent': '#7C3AED',
      '--color-accent-hover': '#6D28D9',
      '--color-accent-light': '#8B5CF6',
      '--color-accent-muted': 'rgba(124, 58, 237, 0.1)',
      '--color-text': '#09090B',
      '--color-text-secondary': '#27272A',
      '--color-text-muted': '#71717A',
      '--color-text-faint': '#A1A1AA',
      '--color-border': '#E4E4E7',
      '--color-border-light': '#D4D4D8',
    },
  },
};

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [themeId, setThemeId] = useState(() => {
    return localStorage.getItem('aetheria_theme_id') || 'midnight';
  });

  useEffect(() => {
    const theme = THEMES[themeId] || THEMES.midnight;
    const root = document.documentElement;

    if (themeId === 'light') {
      root.classList.add('light-theme');
    } else {
      root.classList.remove('light-theme');
    }

    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    localStorage.setItem('aetheria_theme_id', themeId);
  }, [themeId]);

  const value = {
    themeId,
    setThemeId,
    themes: THEMES,
    currentTheme: THEMES[themeId] || THEMES.midnight,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
