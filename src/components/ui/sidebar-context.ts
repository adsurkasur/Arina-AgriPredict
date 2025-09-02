import * as React from "react";

type SidebarContextType = {
  state: "expanded" | "collapsed";
  open: boolean;
  setOpen: (_open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (_open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
};

export const SidebarContext = React.createContext<SidebarContextType | null>(null);

export function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.");
  }
  return context;
}
