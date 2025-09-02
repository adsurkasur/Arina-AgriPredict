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
  const { theme, toggleTheme, isTransitioning } = useTheme();

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-card border-r",
        isTransitioning ? "transition-none" : "animate-slow",
        isCollapsed ? "w-16" : "w-80",
        className
      )}
      style={{
        // Performance: Hardware acceleration
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
        // Performance: Contain layout changes
        contain: isTransitioning ? 'none' : 'layout style paint'
      }}
    >
      {/* Header */}
      <div className={cn("flex items-center border-b", isTransitioning ? "transition-none" : "animate-normal", isCollapsed ? "justify-center p-3" : "justify-between p-4")}>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            "flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg p-1",
            isTransitioning ? "transition-none" : "animate-normal hover:scale-105",
            "hover:bg-green-100/30"
          )}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          style={{
            // Performance: Optimize button interactions
            willChange: isTransitioning ? 'auto' : 'transform',
            contain: 'layout style'
          }}
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground">
            <Leaf className="h-4 w-4" />
          </div>
          {!isCollapsed && (
            <div className={isTransitioning ? "transition-none" : "animate-slow"}>
              <h2 className="text-lg font-semibold whitespace-nowrap hover:text-foreground">AgriPredict</h2>
            </div>
          )}
        </button>
      </div>

      {/* Navigation */}
      <ScrollArea className={cn("flex-1", isTransitioning ? "transition-none" : "animate-normal", isCollapsed ? "px-2 py-4" : "px-3 py-4")}>
        <nav className="space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.name} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start h-auto hover:bg-green-100/30 hover:text-foreground",
                    isTransitioning ? "transition-none" : "animate-normal",
                    isCollapsed ? "px-2 py-3" : "px-3 py-3",
                    isActive && "bg-secondary shadow-sm hover:text-secondary-foreground"
                  )}
                  style={{
                    // Performance: Optimize navigation buttons
                    willChange: isTransitioning ? 'auto' : 'background-color, color',
                    contain: 'layout style'
                  }}
                >
                  <item.icon className={cn("h-5 w-5 shrink-0", isTransitioning ? "transition-none" : "animate-fast")} />
                  {!isCollapsed && (
                    <div className={cn("ml-3 text-left", isTransitioning ? "transition-none" : "animate-normal")}>
                      <div className="font-medium whitespace-nowrap">{item.name}</div>
                      <div className="text-xs text-muted-foreground mt-1 whitespace-nowrap">
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
        <div className={isTransitioning ? "transition-none" : "animate-slow"}>
          <Separator className={cn("mb-4", isTransitioning ? "transition-none" : "animate-normal")} />
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
                style={{
                  // Performance: Optimize switch interactions
                  willChange: isTransitioning ? 'auto' : 'background-color',
                  contain: 'layout style'
                }}
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
