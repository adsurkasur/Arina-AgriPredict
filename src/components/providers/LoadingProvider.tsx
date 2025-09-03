"use client";
import { createContext, useState, useEffect, ReactNode } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

interface LoadingContextType {
  isLoading: boolean;
  loadingMessage: string;
  setIsLoading: (_loading: boolean) => void;
  startLoading: () => void;
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
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Handle initial page load
  useEffect(() => {
    if (isInitialLoad) {
      setLoadingMessage("Loading AgriPredict...");
      // Simulate initial loading time
      const timer = setTimeout(() => {
        setIsInitialLoad(false);
      }, 1500); // Shorter than homepage loading for better UX

      return () => clearTimeout(timer);
    }
  }, [isInitialLoad]);

  // Handle route changes - ensure seamless loading transition
  useEffect(() => {
    if (!isInitialLoad && isNavigating) {
      const currentTime = Date.now();
      const timeSinceNavigation = currentTime - lastNavigationTime;

      // If navigation just happened, keep loading for a bit longer to ensure destination loads
      if (timeSinceNavigation < 1200) { // Within 1.2 seconds of navigation
        setLoadingMessage("Loading page...");

        // Keep loading active for at least 1.5 seconds after navigation to ensure destination page loads
        // This prevents flickering if the page loads very quickly
        const minLoadingTime = Math.max(1500 - timeSinceNavigation, 300); // Minimum 300ms

        const timer = setTimeout(() => {
          setIsLoading(false);
          setIsNavigating(false);
          setLoadingMessage("Loading AgriPredict...");
        }, minLoadingTime);

        return () => clearTimeout(timer);
      } else {
        // If it's been longer, stop loading immediately
        setIsLoading(false);
        setIsNavigating(false);
        setLoadingMessage("Loading AgriPredict...");
      }
    }
  }, [pathname, searchParams, isInitialLoad, isNavigating, lastNavigationTime]);

  const startLoading = (message = "Loading page...") => {
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
