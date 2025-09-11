import { ReactNode } from 'react';

export interface SidebarContextValue {
  state: 'expanded' | 'collapsed';
  open: boolean;
  setOpen: (_open: boolean | ((_prev: boolean) => boolean)) => void;
  isMobile: boolean;
  openMobile: boolean;
  setOpenMobile: (_open: boolean) => void;
  toggleSidebar: () => void;
}

export interface SidebarProviderProps {
  children: ReactNode;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (_open: boolean) => void;
}

export interface SidebarProps {
  children: ReactNode;
  side?: 'left' | 'right';
  variant?: 'sidebar' | 'floating' | 'inset';
  collapsible?: 'offcanvas' | 'icon' | 'none';
  className?: string;
}

export interface SidebarHeaderProps {
  children: ReactNode;
  className?: string;
}

export interface SidebarContentProps {
  children: ReactNode;
  className?: string;
}

export interface SidebarFooterProps {
  children: ReactNode;
  className?: string;
}

export interface SidebarTriggerProps {
  className?: string;
  onClick?: () => void;
}

export interface SidebarMenuProps {
  children: ReactNode;
  className?: string;
}

export interface SidebarMenuItemProps {
  children: ReactNode;
  className?: string;
  isActive?: boolean;
}

export interface SidebarInsetProps {
  children: ReactNode;
  className?: string;
}

export interface SidebarInputProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}

export interface SidebarSeparatorProps {
  className?: string;
}
