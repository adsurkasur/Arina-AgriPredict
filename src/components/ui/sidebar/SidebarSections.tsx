import * as React from "react"
import { cn } from "@/lib/utils"
import { SidebarHeaderProps, SidebarContentProps, SidebarFooterProps } from "./types"

export const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & SidebarHeaderProps
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="header"
      className={cn("flex flex-col gap-2 p-2 transition-smooth", className)}
      {...props}
    />
  )
})
SidebarHeader.displayName = "SidebarHeader"

export const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & SidebarContentProps
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="content"
      className={cn(
        "flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden",
        className
      )}
      {...props}
    />
  )
})
SidebarContent.displayName = "SidebarContent"

export const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & SidebarFooterProps
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="footer"
      className={cn("flex flex-col gap-2 p-2 transition-smooth", className)}
      {...props}
    />
  )
})
SidebarFooter.displayName = "SidebarFooter"
