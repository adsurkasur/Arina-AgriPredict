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

    // Show toast immediately when in development mode
    hasShownToast.current = true;
    toast.info("Development Mode", {
      description: "Running in development environment with localStorage for data persistence.",
      duration: 8000, // Show longer in dev mode
    });
  }, []);

  return null; // This component doesn't render anything
}
