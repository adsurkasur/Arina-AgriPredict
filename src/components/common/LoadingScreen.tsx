"use client";
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface LoadingScreenProps {
  isLoading: boolean;
  message?: string;
  className?: string;
}

export function LoadingScreen({ isLoading, message = "Loading...", className }: LoadingScreenProps) {
  const [show, setShow] = useState(isLoading);

  useEffect(() => {
    if (isLoading) {
      setShow(true);
    } else {
      // Delay hiding to allow fade out animation
      const timer = setTimeout(() => setShow(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  if (!show) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm flex items-center justify-center transition-all duration-300",
        isLoading ? "opacity-100" : "opacity-0",
        className
      )}
    >
      <div className="text-center space-y-6">
        <div className="relative">
          <Image
            src="/logo.svg"
            alt="AgriPredict Logo"
            width={80}
            height={80}
            className="mx-auto animate-pulse"
          />
          <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping"></div>
        </div>

        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {message}
          </h2>

          {/* Loading dots */}
          <div className="flex justify-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
