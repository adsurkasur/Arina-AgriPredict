"use client";
import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isTransitioning: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

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

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>('light');
  const [isInitialized, setIsInitialized] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Performance: Check for reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    // Only run on client-side
    if (typeof window === 'undefined') return;

    // Performance: Add hardware acceleration hints
    const root = window.document.documentElement;
    root.style.transform = 'translateZ(0)';
    root.style.backfaceVisibility = 'hidden';
    root.style.perspective = '1000px';

    // Get stored theme or system preference
    const storedTheme = localStorage.getItem('theme') as Theme;
    let initialTheme: Theme = 'light';

    if (storedTheme && (storedTheme === 'light' || storedTheme === 'dark')) {
      initialTheme = storedTheme;
    } else {
      // Check system preference only if no stored preference
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      initialTheme = systemPrefersDark ? 'dark' : 'light';
    }

    setTheme(initialTheme);
    setIsInitialized(true);
  }, []);

  const applyTheme = useCallback((newTheme: Theme) => {
    if (typeof window === 'undefined') return;

    const root = window.document.documentElement;

    // Performance: Skip transitions if user prefers reduced motion
    if (prefersReducedMotion) {
      root.classList.remove('light', 'dark');
      root.classList.add(newTheme);
      localStorage.setItem('theme', newTheme);
      return;
    }

    // Start transition
    setIsTransitioning(true);
    root.classList.add('theme-transitioning');

    // Performance: Force layout calculation before transition
    root.offsetHeight; // Trigger layout

    // Apply theme change
    root.classList.remove('light', 'dark');
    root.classList.add(newTheme);

    // Performance: Use requestAnimationFrame for smoother cleanup
    const cleanup = () => {
      root.classList.remove('theme-transitioning');
      setIsTransitioning(false);

      // Performance: Clean up will-change properties selectively
      // Only reset will-change on elements that don't have transition classes
      const allElements = root.querySelectorAll('*');
      allElements.forEach((el) => {
        const element = el as HTMLElement;
        const hasTransitionClass = element.classList.contains('transition-smooth') ||
                                   element.classList.contains('animate-colors-fast') ||
                                   element.classList.contains('animate-colors-normal') ||
                                   element.classList.contains('animate-transform-fast') ||
                                   element.classList.contains('animate-transform-normal') ||
                                   element.classList.contains('animate-opacity-fast') ||
                                   element.classList.contains('animate-opacity-normal');

        // Only reset will-change if element doesn't have transition classes
        if (!hasTransitionClass) {
          element.style.willChange = 'auto';
        }
      });
    };

    // Use setTimeout for cleanup timing - UNIFIED with CSS duration
    setTimeout(cleanup, 300); // Matches unified 0.25s transition + small buffer

    // Save to localStorage
    localStorage.setItem('theme', newTheme);
  }, [prefersReducedMotion]);

  useEffect(() => {
    if (!isInitialized) return;
    applyTheme(theme);
  }, [theme, isInitialized, applyTheme]);

  const toggleTheme = useCallback(() => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isTransitioning }}>
      {children}
    </ThemeContext.Provider>
  );
}
