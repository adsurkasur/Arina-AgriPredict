import type { Config } from 'tailwindcss'

export default {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: 'hsl(var(--card))',
        'card-foreground': 'hsl(var(--card-foreground))',
        popover: 'hsl(var(--popover))',
        'popover-foreground': 'hsl(var(--popover-foreground))',
        primary: 'hsl(var(--primary))',
        'primary-foreground': 'hsl(var(--primary-foreground))',
        'primary-hover': 'hsl(var(--primary-hover))',
        'primary-light': 'hsl(var(--primary-light))',
        secondary: 'hsl(var(--secondary))',
        'secondary-foreground': 'hsl(var(--secondary-foreground))',
        'secondary-hover': 'hsl(var(--secondary-hover))',
        muted: 'hsl(var(--muted))',
        'muted-foreground': 'hsl(var(--muted-foreground))',
        accent: 'hsl(var(--accent))',
        'accent-foreground': 'hsl(var(--accent-foreground))',
        'accent-hover': 'hsl(var(--accent-hover))',
        'accent-light': 'hsl(var(--accent-light))',
        success: 'hsl(var(--success))',
        'success-foreground': 'hsl(var(--success-foreground))',
        warning: 'hsl(var(--warning))',
        'warning-foreground': 'hsl(var(--warning-foreground))',
        destructive: 'hsl(var(--destructive))',
        'destructive-foreground': 'hsl(var(--destructive-foreground))',
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        // Chart and AI colors
        'chart-demand': 'hsl(var(--chart-demand))',
        'chart-forecast': 'hsl(var(--chart-forecast))',
        'chart-confidence': 'hsl(var(--chart-confidence))',
        'chart-grid': 'hsl(var(--chart-grid))',
        'chart-background': 'hsl(var(--chart-background))',
        'ai-bubble-user': 'hsl(var(--ai-bubble-user))',
        'ai-bubble-assistant': 'hsl(var(--ai-bubble-assistant))',
        'ai-suggestion': 'hsl(var(--ai-suggestion))',
        // Data states
        'data-pending': 'hsl(var(--data-pending))',
        'data-error': 'hsl(var(--data-error))',
        'data-success': 'hsl(var(--data-success))',
        // Sidebar
        'sidebar-background': 'hsl(var(--sidebar-background))',
        'sidebar-foreground': 'hsl(var(--sidebar-foreground))',
        'sidebar-primary': 'hsl(var(--sidebar-primary))',
        'sidebar-primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
        'sidebar-accent': 'hsl(var(--sidebar-accent))',
        'sidebar-accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
        'sidebar-border': 'hsl(var(--sidebar-border))',
        'sidebar-ring': 'hsl(var(--sidebar-ring))',
      },
    },
  },
  plugins: [],
} satisfies Config

