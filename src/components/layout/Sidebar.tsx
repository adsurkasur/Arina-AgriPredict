"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/components/providers/ThemeProvider";
import {
  Database,
  TrendingUp,
  MessageSquare,
  Leaf,
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

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-card border-r animate-slow",
        isCollapsed ? "w-16" : "w-80",
        className
      )}
    >
      {/* Header */}
      <div className={cn("flex items-center border-b animate-normal", isCollapsed ? "justify-center p-3" : "justify-between p-4")}>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center space-x-2 group animate-normal hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg p-1 hover:bg-green-50"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground group-hover:bg-primary/90 animate-colors-fast">
            <Leaf className="h-4 w-4" />
          </div>
          {!isCollapsed && (
            <div className="animate-slow hover:text-current">
              <h2 className="text-lg font-semibold whitespace-nowrap">AgriPredict</h2>
            </div>
          )}
        </button>
      </div>

      {/* Navigation */}
      <ScrollArea className={cn("flex-1 animate-normal", isCollapsed ? "px-2 py-4" : "px-3 py-4")}>
        <nav className="space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.name} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start h-auto animate-normal hover:bg-green-50 hover:text-current",
                    isCollapsed ? "px-2 py-3" : "px-3 py-3",
                    isActive && "bg-secondary shadow-sm"
                  )}
                >
                  <item.icon className="h-5 w-5 shrink-0 animate-fast" />
                  {!isCollapsed && (
                    <div className="ml-3 text-left animate-normal hover:text-current">
                      <div className="font-medium whitespace-nowrap">{item.name}</div>
                      <div className="text-xs text-muted-foreground mt-1 whitespace-nowrap hover:text-current">
                        {item.description}
                      </div>
                    </div>
                  )}
                </Button>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Footer */}
      {!isCollapsed && (
        <div className="animate-slow">
          <Separator className="mb-4 animate-normal" />
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {theme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                <span className="text-sm font-medium">Dark Mode</span>
              </div>
              <Switch
                checked={theme === 'dark'}
                onCheckedChange={toggleTheme}
                aria-label="Toggle dark mode"
              />
            </div>
            <div className="text-xs text-muted-foreground leading-relaxed">
              Agricultural demand forecasting platform with AI-powered insights
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
