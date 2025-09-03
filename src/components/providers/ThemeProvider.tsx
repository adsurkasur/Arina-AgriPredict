"use client";
import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { toast } from '@/lib/toast';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

interface ThemeProviderProps {
  children: ReactNode;
}

// Show dev mode toast when localStorage is used
function showDevToast() {
  if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
    if (!(window as any).__localStorageToastShown) {
      (window as any).__localStorageToastShown = true;
      toast.info("Development Mode - Using localStorage", {
        description: "Data is being stored locally. Switch to production for MongoDB.",
        duration: 8000,
      });
    }
  }
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>('light');

  // Check for reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    // Only run on client-side
    if (typeof window === 'undefined') return;

    // Get stored theme or system preference
    const storedTheme = localStorage.getItem('theme') as Theme;
    if (storedTheme) {
      showDevToast(); // Show toast when reading theme data
    }
    let initialTheme: Theme = 'light';

    if (storedTheme && (storedTheme === 'light' || storedTheme === 'dark')) {
      initialTheme = storedTheme;
    } else {
      // Check system preference only if no stored preference
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      initialTheme = systemPrefersDark ? 'dark' : 'light';
    }

    setTheme(initialTheme);
  }, []);

  const applyTheme = useCallback((newTheme: Theme) => {
    if (typeof window === 'undefined') return;

    const root = window.document.documentElement;

    // Skip transitions if user prefers reduced motion
    if (prefersReducedMotion) {
      root.classList.remove('light', 'dark');
      root.classList.add(newTheme);
      showDevToast(); // Show toast when writing theme data
      localStorage.setItem('theme', newTheme);
      return;
    }

    // Apply theme change
    root.classList.remove('light', 'dark');
    root.classList.add(newTheme);
    showDevToast(); // Show toast when writing theme data
    localStorage.setItem('theme', newTheme);
  }, [prefersReducedMotion]);

  useEffect(() => {
    applyTheme(theme);
  }, [theme, applyTheme]);

  const toggleTheme = useCallback(() => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
