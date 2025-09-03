"use client";
import { createContext, useState, useEffect, ReactNode } from 'react';
import { usePathname } from 'next/navigation';

interface LoadingContextType {
  isLoading: boolean;
  loadingMessage: string;
  setIsLoading: (_loading: boolean) => void;
  startLoading: (message?: string) => void;
  stopLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export { LoadingContext };

interface LoadingProviderProps {
  children: ReactNode;
}

export function LoadingProvider({ children }: LoadingProviderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState("Loading AgriPredict...");
  const [isNavigating, setIsNavigating] = useState(false);
  const [lastNavigationTime, setLastNavigationTime] = useState<number>(0);
  const [currentPath, setCurrentPath] = useState<string>('');
  const pathname = usePathname();

  // Handle initial page load
  useEffect(() => {
    if (isInitialLoad) {
      setLoadingMessage("Loading AgriPredict...");
      // Simulate initial loading time
      const timer = setTimeout(() => {
        setIsInitialLoad(false);
        setCurrentPath(pathname);
      }, 1500); // Shorter than homepage loading for better UX

      return () => clearTimeout(timer);
    }
  }, [isInitialLoad, pathname]);

  // Track current path changes to detect when navigation is complete
  useEffect(() => {
    if (pathname !== currentPath) {
      setCurrentPath(pathname);

      // If we were navigating and the path changed, navigation is complete
      if (isNavigating && !isInitialLoad) {
        const navigationDuration = Date.now() - lastNavigationTime;

        // Ensure minimum loading time to prevent flickering (100-200ms)
        const minTime = Math.max(150 - navigationDuration, 0);

        setTimeout(() => {
          setIsLoading(false);
          setIsNavigating(false);
          setLoadingMessage("Loading AgriPredict...");
        }, minTime);
      }
    }
  }, [pathname, currentPath, isNavigating, isInitialLoad, lastNavigationTime]);

  const startLoading = (message = "Loading AgriPredict...") => {
    const navigationTime = Date.now();
    setLastNavigationTime(navigationTime);
    setLoadingMessage(message);
    setIsLoading(true);
    setIsNavigating(true);
  };

  const stopLoading = () => {
    setIsLoading(false);
    setIsNavigating(false);
  };

  const showLoading = isLoading || isInitialLoad;

  return (
    <LoadingContext.Provider
      value={{
        isLoading: showLoading,
        loadingMessage,
        setIsLoading,
        startLoading,
        stopLoading,
      }}
    >
      {children}
    </LoadingContext.Provider>
  );
}
