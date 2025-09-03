"use client";
import { useRouter, usePathname } from 'next/navigation';
import { useGlobalLoading } from '@/hooks/useGlobalLoading';

export function useNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const { startLoading } = useGlobalLoading();

  const getLoadingMessage = (href: string): string => {
    switch (href) {
      case '/data':
        return 'Loading Data Management...';
      case '/forecast':
        return 'Loading Forecasting...';
      case '/assistant':
        return 'Loading AI Assistant...';
      default:
        return 'Loading AgriPredict...';
    }
  };

  const navigateTo = (href: string) => {
    if (href === pathname) return; // Don't navigate to the same page

    const message = getLoadingMessage(href);
    startLoading(message);

    // Navigate immediately after starting loading
    router.push(href);
  };

  return { navigateTo };
}
