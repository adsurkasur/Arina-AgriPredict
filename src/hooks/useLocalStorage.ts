import { useState } from 'react';
import { toast } from '@/lib/toast';

export function useLocalStorage<T>(key: string, initialValue: T | (() => T)) {
  // Show dev mode toast when localStorage is first used
  const showDevToast = () => {
    if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
      // Use a global flag to prevent multiple toasts
      if (!(window as any).__localStorageToastShown) {
        (window as any).__localStorageToastShown = true;
        toast.info("Development Mode - Using localStorage", {
          description: "Data is being stored locally. Switch to production for MongoDB.",
          duration: 8000,
        });
      }
    }
  };

  // Get from local storage then parse stored json or return initialValue
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return typeof initialValue === 'function' ? (initialValue as () => T)() : initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      if (item !== null) {
        showDevToast(); // Show toast when reading existing data
      }
      return item ? JSON.parse(item) : (typeof initialValue === 'function' ? (initialValue as () => T)() : initialValue);
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return typeof initialValue === 'function' ? (initialValue as () => T)() : initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);

      // Save to local storage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
        showDevToast(); // Show toast when writing data
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue] as const;
}
