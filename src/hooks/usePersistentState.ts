import { useState, useEffect } from 'react';
import { toast } from '@/lib/toast';

export function usePersistentState<T>(
  key: string,
  defaultValue: T
): [T, (value: T | ((prevValue: T) => T)) => void] {
  // Show dev mode toast when localStorage is used
  const showDevToast = () => {
    if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
      if (!(window as any).__localStorageToastShown) {
        (window as any).__localStorageToastShown = true;
        toast.info("Development Mode - Using localStorage", {
          description: "Data is being stored locally. Switch to production for MongoDB.",
          duration: 8000,
        });
      }
    }
  };

  const [state, setState] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return defaultValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      if (item !== null) {
        showDevToast(); // Show toast when reading existing data
      }
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return defaultValue;
    }
  });

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      window.localStorage.setItem(key, JSON.stringify(state));
      showDevToast(); // Show toast when writing data
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, state]);

  return [state, setState];
}