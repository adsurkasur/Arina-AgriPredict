// Main components
export { SidebarProvider } from "./SidebarProvider"
export { Sidebar } from "./SidebarContainer"
export { SidebarTrigger } from "./SidebarTrigger"

// Section components
export { SidebarHeader, SidebarContent, SidebarFooter } from "./SidebarSections"

// Types
export type * from "./types"

// Re-export context for advanced usage
export { SidebarContext, useSidebar } from "../sidebar-context"
