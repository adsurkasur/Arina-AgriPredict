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
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Centered Logo */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
          <div className="relative flex items-center justify-center w-24 h-24">
            <span className="absolute inline-block w-24 h-24 rounded-full bg-green-500/20 animate-ping"></span>
            <Image
              src="/logo.svg"
              alt="AgriPredict Logo"
              width={80}
              height={80}
              className="mx-auto relative z-10"
            />
          </div>
          <div className="space-y-3 mt-16 w-full flex flex-col items-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {message}
            </h2>
          </div>
        </div>
      </div>
    </div>
  );
}
