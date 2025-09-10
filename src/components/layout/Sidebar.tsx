"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/components/providers/ThemeProvider";
import { useNavigation } from "@/hooks/useNavigation";
import { toast } from "@/lib/toast";
import { ChatHistorySelector } from "@/components/feature/ai-assistant";
import {
  Database,
  TrendingUp,
  MessageSquare,
  Moon,
  Sun
} from "lucide-react";

const navigation = [
  {
    name: "Data Management",
    href: "/data",
    icon: Database,
    description: "Manage sales data and view analytics"
  },
  {
    name: "Forecasting",
    href: "/forecast",
    icon: TrendingUp,
    description: "Generate demand forecasts"
  },
  {
    name: "AI Assistant",
    href: "/assistant",
    icon: MessageSquare,
    description: "Get AI-powered insights"
  }
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { navigateTo } = useNavigation();

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-card border-r transition-all duration-300",
        isCollapsed ? "w-16" : "w-80",
        className
      )}
    >
      {/* Header */}
      <div className={cn("flex items-center border-b transition-all duration-300", isCollapsed ? "justify-center p-3" : "justify-between p-4")}>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg p-1 hover:bg-green-100/30 transition-all duration-300"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground overflow-hidden">
            <Image
              src="/logo.svg"
              alt="AgriPredict Logo"
              width={20}
              height={20}
              className={cn(
                "object-contain transition-all duration-300",
                theme === 'dark' 
                  ? "filter brightness-0" // White in dark mode
                  : "filter brightness-0 invert" // Black in light mode
              )}
            />
          </div>
          {!isCollapsed && (
            <span className="font-semibold text-lg transition-all duration-300">AgriPredict</span>
          )}
        </button>

        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <Switch
              checked={theme === 'dark'}
              onCheckedChange={() => {
                toggleTheme();
                toast.info(`Switched to ${theme === 'dark' ? 'light' : 'dark'} mode`, {
                  description: "Theme preference saved automatically."
                });
              }}
              aria-label="Toggle theme"
            />
            {theme === 'dark' ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className={cn("flex-1 transition-all duration-300", isCollapsed ? "px-2 py-4" : "px-3 py-4")}>
        <nav className="space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <button
                key={item.name}
                onClick={() => navigateTo(item.href)}
                className={cn(
                  "flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-300 w-full text-left",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {!isCollapsed && (
                    <div className="text-left transition-all duration-300">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs opacity-70">{item.description}</div>
                  </div>
                )}
              </button>
            );
          })}

          {/* Chat Controls - Always show when sidebar is expanded */}
          {!isCollapsed && (
            <div className="mt-6 space-y-2">
              <div className="px-3 py-2">
                <h3 className="text-sm font-medium text-muted-foreground">Chat Controls</h3>
              </div>
              <ChatHistorySelector isCollapsed={isCollapsed} />
            </div>
          )}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="transition-all duration-300">
        <Separator className="mb-4 transition-all duration-300" />
        <div className="px-3 pb-4">
          <div className="text-xs text-muted-foreground">
            {!isCollapsed && "© 2025 AgriPredict"}
          </div>
        </div>
      </div>
    </div>
  );
}
