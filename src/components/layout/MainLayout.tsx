"use client";
import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { useGlobalLoading } from "@/hooks/useGlobalLoading";
import { LoadingScreen } from "@/components/common/LoadingScreen";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  const { isLoading, loadingMessage } = useGlobalLoading();

  if (isHomePage) {
    return <>{children}</>;
  }

  return (
    <>
      <LoadingScreen
        isLoading={isLoading}
        message={loadingMessage}
      />

      <div className="flex h-screen bg-background">
        {/* Sidebar */}
        <div className="flex-shrink-0">
          <Sidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-auto">
          {children}
        </div>
      </div>
    </>
  );
}
