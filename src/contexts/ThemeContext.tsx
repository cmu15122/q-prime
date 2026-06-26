import { createContext, useContext, useState, useMemo } from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';
import { lightTheme, darkTheme } from '../themes/theme';
import { Theme } from '@mui/material/styles';

export type ThemeMode = 'light' | 'dark' | 'auto';

interface ThemeContextType {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  theme: Theme;
  effectiveMode: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = 'q-prime-theme-mode';

export function ThemeContextProvider({ children }: { children: React.ReactNode }) {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  // Initialize mode from localStorage or default to 'auto'
  const [mode, setModeState] = useState<ThemeMode>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'auto') {
      return stored;
    }
    return 'auto';
  });

  // Persist mode to localStorage
  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
    localStorage.setItem(STORAGE_KEY, newMode);
  };

  // Calculate effective mode based on setting and system preference
  const effectiveMode = useMemo(() => {
    if (mode === 'auto') {
      return prefersDarkMode ? 'dark' : 'light';
    }
    return mode;
  }, [mode, prefersDarkMode]);

  // Get the actual theme object
  const theme = useMemo(() => {
    return effectiveMode === 'dark' ? darkTheme : lightTheme;
  }, [effectiveMode]);

  return (
    <ThemeContext.Provider value={{ mode, setMode, theme, effectiveMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeContextProvider');
  }
  return context;
}
