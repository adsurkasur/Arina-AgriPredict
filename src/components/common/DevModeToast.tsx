"use client";
import { useEffect, useRef } from 'react';
import { toast } from '@/lib/toast';

export function DevModeToast() {
  const hasShownToast = useRef(false);

  useEffect(() => {
    // Only show in development mode
    if (process.env.NODE_ENV !== 'development') {
      return;
    }

    // Only show once per session
    if (hasShownToast.current) {
      return;
    }

    // Check if localStorage is available and has been used
    if (typeof window !== 'undefined' && window.localStorage) {
      // Check if there are any existing localStorage items (indicating it's being used)
      const hasLocalStorageData = Object.keys(localStorage).length > 0;

      if (hasLocalStorageData) {
        hasShownToast.current = true;
        toast.info("Development Mode - Using localStorage", {
          description: "Data is being stored locally. Switch to production for MongoDB.",
          duration: 8000, // Show longer in dev mode
        });
      } else {
        // If no data yet, listen for first localStorage usage
        const originalSetItem = localStorage.setItem;
        localStorage.setItem = function(key: string, value: string) {
          originalSetItem.call(this, key, value);

          if (!hasShownToast.current) {
            hasShownToast.current = true;
            toast.info("Development Mode - Using localStorage", {
              description: "Data is being stored locally. Switch to production for MongoDB.",
              duration: 8000,
            });
          }
        };
      }
    }
  }, []);

  return null; // This component doesn't render anything
}
