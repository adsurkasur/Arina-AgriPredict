"use client";
import React from "react";
import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group transition-smooth"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg transition-smooth",
          description: "group-[.toast]:text-muted-foreground transition-smooth",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground transition-smooth",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground transition-smooth",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
