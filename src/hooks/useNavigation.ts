"use client";
import { useRouter, usePathname } from 'next/navigation';
import { useGlobalLoading } from '@/hooks/useGlobalLoading';

export function useNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const { startLoading } = useGlobalLoading();

  const navigateTo = (href: string) => {
    if (href === pathname) return; // Don't navigate to the same page

    // Start loading immediately - no delay
    startLoading();

    // Navigate immediately after starting loading
    router.push(href);
  };

  return { navigateTo };
}
