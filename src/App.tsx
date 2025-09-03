"use client";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "@/hooks/use-toast";


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  useEffect(() => {
    // Show toast notification when using localStorage in development
    if (process.env.NODE_ENV === 'development') {
      toast({
        title: "Development Mode",
        description: "Using localStorage for data storage. Switch to production for MongoDB.",
        duration: 5000,
      });
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {/* Next.js handles routing. Only providers and UI components should be here. */}
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
