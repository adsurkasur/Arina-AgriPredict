"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Database,
  TrendingUp,
  MessageSquare,
  Menu,
  X,
  Leaf
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

  return (
    <div className={cn("flex flex-col h-full bg-card border-r", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground">
            <Leaf className="h-4 w-4" />
          </div>
          {!isCollapsed && (
            <div>
              <h2 className="text-lg font-semibold">AgriPredict</h2>
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-8 w-8 p-0"
        >
          {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.name} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start h-auto p-3",
                    isCollapsed ? "px-2" : "px-3",
                    isActive && "bg-secondary"
                  )}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {!isCollapsed && (
                    <div className="ml-3 text-left">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-xs text-muted-foreground mt-1">
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
        <>
          <Separator />
          <div className="p-4">
            <div className="text-xs text-muted-foreground">
              Agricultural demand forecasting platform with AI-powered insights
            </div>
          </div>
        </>
      )}
    </div>
  );
}
