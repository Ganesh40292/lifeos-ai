import { createContext, useContext, useState, useEffect } from 'react';

const THEMES = {
  default: {
    name: 'Default Dark',
    colors: {
      '--color-bg': '#09090B',
      '--color-bg-card': '#18181B',
      '--color-bg-elevated': '#1f1f23',
      '--color-bg-hover': '#27272A',
      '--color-bg-input': '#18181B',
      '--color-primary': '#2563EB',
      '--color-primary-hover': '#1D4ED8',
      '--color-primary-light': '#3B82F6',
      '--color-primary-muted': 'rgba(37, 99, 235, 0.15)',
      '--color-accent': '#7C3AED',
      '--color-accent-hover': '#6D28D9',
      '--color-accent-light': '#8B5CF6',
      '--color-accent-muted': 'rgba(124, 58, 237, 0.15)',
      '--color-text': '#FAFAFA',
      '--color-text-secondary': '#D4D4D8',
      '--color-text-muted': '#A1A1AA',
      '--color-text-faint': '#71717A',
      '--color-border': '#27272A',
      '--color-border-light': '#3F3F46',
    },
  },
  nord: {
    name: 'Nord',
    colors: {
      '--color-bg': '#2E3440',
      '--color-bg-card': '#3B4252',
      '--color-bg-elevated': '#434C5E',
      '--color-bg-hover': '#4C566A',
      '--color-bg-input': '#3B4252',
      '--color-primary': '#88C0D0',
      '--color-primary-hover': '#81A1C1',
      '--color-primary-light': '#8FBCBB',
      '--color-primary-muted': 'rgba(136, 192, 208, 0.15)',
      '--color-accent': '#B48EAD',
      '--color-accent-hover': '#A3778C',
      '--color-accent-light': '#C4A0BA',
      '--color-accent-muted': 'rgba(180, 142, 173, 0.15)',
      '--color-text': '#ECEFF4',
      '--color-text-secondary': '#D8DEE9',
      '--color-text-muted': '#A5ADBA',
      '--color-text-faint': '#7B8394',
      '--color-border': '#434C5E',
      '--color-border-light': '#4C566A',
    },
  },
  dracula: {
    name: 'Dracula',
    colors: {
      '--color-bg': '#282A36',
      '--color-bg-card': '#1E1F29',
      '--color-bg-elevated': '#343746',
      '--color-bg-hover': '#3E4155',
      '--color-bg-input': '#1E1F29',
      '--color-primary': '#BD93F9',
      '--color-primary-hover': '#A87BEA',
      '--color-primary-light': '#CAA9FA',
      '--color-primary-muted': 'rgba(189, 147, 249, 0.15)',
      '--color-accent': '#FF79C6',
      '--color-accent-hover': '#E066AC',
      '--color-accent-light': '#FF92D0',
      '--color-accent-muted': 'rgba(255, 121, 198, 0.15)',
      '--color-text': '#F8F8F2',
      '--color-text-secondary': '#E0E0DA',
      '--color-text-muted': '#A0A0A0',
      '--color-text-faint': '#6272A4',
      '--color-border': '#44475A',
      '--color-border-light': '#555974',
    },
  },
  catppuccin: {
    name: 'Catppuccin Mocha',
    colors: {
      '--color-bg': '#1E1E2E',
      '--color-bg-card': '#181825',
      '--color-bg-elevated': '#313244',
      '--color-bg-hover': '#45475A',
      '--color-bg-input': '#181825',
      '--color-primary': '#89B4FA',
      '--color-primary-hover': '#74A4F0',
      '--color-primary-light': '#A6C8FF',
      '--color-primary-muted': 'rgba(137, 180, 250, 0.15)',
      '--color-accent': '#CBA6F7',
      '--color-accent-hover': '#B893E4',
      '--color-accent-light': '#DEC0FF',
      '--color-accent-muted': 'rgba(203, 166, 247, 0.15)',
      '--color-text': '#CDD6F4',
      '--color-text-secondary': '#BAC2DE',
      '--color-text-muted': '#A6ADC8',
      '--color-text-faint': '#6C7086',
      '--color-border': '#313244',
      '--color-border-light': '#45475A',
    },
  },
  tokyoNight: {
    name: 'Tokyo Night',
    colors: {
      '--color-bg': '#1A1B26',
      '--color-bg-card': '#16161E',
      '--color-bg-elevated': '#24283B',
      '--color-bg-hover': '#2F3349',
      '--color-bg-input': '#16161E',
      '--color-primary': '#7AA2F7',
      '--color-primary-hover': '#6691E6',
      '--color-primary-light': '#89B4FA',
      '--color-primary-muted': 'rgba(122, 162, 247, 0.15)',
      '--color-accent': '#BB9AF7',
      '--color-accent-hover': '#A98AE4',
      '--color-accent-light': '#C8ACFF',
      '--color-accent-muted': 'rgba(187, 154, 247, 0.15)',
      '--color-text': '#C0CAF5',
      '--color-text-secondary': '#A9B1D6',
      '--color-text-muted': '#787C99',
      '--color-text-faint': '#565F89',
      '--color-border': '#24283B',
      '--color-border-light': '#3B4261',
    },
  },
  solarized: {
    name: 'Solarized Dark',
    colors: {
      '--color-bg': '#002B36',
      '--color-bg-card': '#073642',
      '--color-bg-elevated': '#0A3F4E',
      '--color-bg-hover': '#0E4D5E',
      '--color-bg-input': '#073642',
      '--color-primary': '#268BD2',
      '--color-primary-hover': '#1F7BBF',
      '--color-primary-light': '#5CA8DE',
      '--color-primary-muted': 'rgba(38, 139, 210, 0.15)',
      '--color-accent': '#D33682',
      '--color-accent-hover': '#BF2E74',
      '--color-accent-light': '#E05C9E',
      '--color-accent-muted': 'rgba(211, 54, 130, 0.15)',
      '--color-text': '#FDF6E3',
      '--color-text-secondary': '#EEE8D5',
      '--color-text-muted': '#93A1A1',
      '--color-text-faint': '#657B83',
      '--color-border': '#0A3F4E',
      '--color-border-light': '#1A5468',
    },
  },
};

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [themeId, setThemeId] = useState(() => {
    return localStorage.getItem('lifeos_theme_id') || 'default';
  });
  const [isLightMode, setIsLightMode] = useState(() => {
    return localStorage.getItem('lifeos_light_mode') === 'true';
  });

  useEffect(() => {
    const theme = THEMES[themeId] || THEMES.default;
    const root = document.documentElement;

    if (isLightMode) {
      root.classList.add('light-theme');
      // Remove inline variables to allow stylesheet rules for .light-theme to take effect
      Object.keys(theme.colors).forEach((key) => {
        root.style.removeProperty(key);
      });
    } else {
      root.classList.remove('light-theme');
      // Apply inline colors of the selected dark-mode theme palette
      Object.entries(theme.colors).forEach(([key, value]) => {
        root.style.setProperty(key, value);
      });
    }

    localStorage.setItem('lifeos_theme_id', themeId);
    localStorage.setItem('lifeos_light_mode', String(isLightMode));
  }, [themeId, isLightMode]);

  const toggleTheme = () => {
    setIsLightMode((prev) => !prev);
  };

  const value = {
    themeId,
    setThemeId,
    themes: THEMES,
    currentTheme: THEMES[themeId] || THEMES.default,
    isLightMode,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
