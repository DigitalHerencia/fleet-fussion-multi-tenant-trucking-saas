import type { Config } from "tailwindcss";
import tailwindAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: "class", // Enforce dark mode via class, though we will set dark by default in layout.tsx
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./features/**/*.{js,ts,jsx,tsx}", // Added features folder
    "./lib/**/*.{js,ts,jsx,tsx}", // Added lib folder
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--color-border) / <alpha-value>)",
        input: "hsl(var(--color-input-bg) / <alpha-value>)",
        ring: "hsl(var(--color-ring) / <alpha-value>)",
        background: "hsl(var(--color-bg) / <alpha-value>)",
        foreground: "hsl(var(--color-fg) / <alpha-value>)",
        primary: {
          DEFAULT: "hsl(var(--color-primary) / <alpha-value>)",
          foreground: "hsl(var(--color-primary-fg) / <alpha-value>)",
          hover: "hsl(var(--color-primary-hover) / <alpha-value>)", // Custom hover
          active: "hsl(var(--color-primary-active) / <alpha-value>)", // Custom active
        },
        secondary: {
          DEFAULT: "hsl(var(--color-secondary) / <alpha-value>)",
          foreground: "hsl(var(--color-secondary-fg) / <alpha-value>)",
          hover: "hsl(var(--color-secondary-hover) / <alpha-value>)", // Custom hover
          active: "hsl(var(--color-secondary-active) / <alpha-value>)", // Custom active
        },
        destructive: {
          DEFAULT: "hsl(var(--color-destructive) / <alpha-value>)",
          foreground: "hsl(var(--color-destructive-fg) / <alpha-value>)",
          hover: "hsl(var(--color-destructive-hover) / <alpha-value>)", // Custom hover
          active: "hsl(var(--color-destructive-active) / <alpha-value>)", // Custom active
        },
        success: {
          DEFAULT: "hsl(var(--color-success) / <alpha-value>)",
          foreground: "hsl(var(--color-success-fg) / <alpha-value>)",
        },
        warning: {
          DEFAULT: "hsl(var(--color-warning) / <alpha-value>)",
          foreground: "hsl(var(--color-warning-fg) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "hsl(var(--color-bg-muted) / <alpha-value>)", // Using bg-muted for general muted surfaces
          foreground: "hsl(var(--color-fg-muted) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "hsl(var(--color-accent) / <alpha-value>)",
          foreground: "hsl(var(--color-accent-fg) / <alpha-value>)",
          hover: "hsl(var(--color-accent-hover) / <alpha-value>)", // Custom hover
          active: "hsl(var(--color-accent-active) / <alpha-value>)", // Custom active
        },
        popover: {
          DEFAULT: "hsl(var(--color-popover-bg) / <alpha-value>)",
          foreground: "hsl(var(--color-popover-fg) / <alpha-value>)",
        },
        card: {
          DEFAULT: "hsl(var(--color-card-bg) / <alpha-value>)",
          foreground: "hsl(var(--color-card-fg) / <alpha-value>)",
        },
        // Custom named colors from CSS variables
        'background-soft': 'hsl(var(--color-bg-soft) / <alpha-value>)',
        'background-muted': 'hsl(var(--color-bg-muted) / <alpha-value>)',
        'foreground-muted': 'hsl(var(--color-fg-muted) / <alpha-value>)',
        'foreground-subtle': 'hsl(var(--color-fg-subtle) / <alpha-value>)',
        'border-muted': 'hsl(var(--color-border-muted) / <alpha-value>)',
        'input-border': 'hsl(var(--color-input-border) / <alpha-value>)',
        'input-foreground': 'hsl(var(--color-input-fg) / <alpha-value>)',
        'input-placeholder': 'hsl(var(--color-input-placeholder) / <alpha-value>)',
        'card-border': 'hsl(var(--color-card-border) / <alpha-value>)',
        'popover-border': 'hsl(var(--color-popover-border) / <alpha-value>)',
        // Chart colors
        'chart-1': 'hsl(var(--color-chart-1) / <alpha-value>)',
        'chart-2': 'hsl(var(--color-chart-2) / <alpha-value>)',
        'chart-3': 'hsl(var(--color-chart-3) / <alpha-value>)',
        'chart-4': 'hsl(var(--color-chart-4) / <alpha-value>)',
        'chart-5': 'hsl(var(--color-chart-5) / <alpha-value>)',
      },
      borderRadius: {
        lg: "var(--radius-lg)",
        md: "var(--radius-md)",
        sm: "var(--radius-sm)",
        full: "var(--radius-full)",
      },
      spacing: {
        xs: "var(--spacing-xs)",
        sm: "var(--spacing-sm)",
        md: "var(--spacing-md)",
        lg: "var(--spacing-lg)",
        xl: "var(--spacing-xl)",
        '2xl': "var(--spacing-2xl)",
        '3xl': "var(--spacing-3xl)",
      },
      fontSize: {
        xs: ['var(--font-size-xs)', { lineHeight: 'var(--line-height-tight)' }],
        sm: ['var(--font-size-sm)', { lineHeight: 'var(--line-height-snug)' }],
        base: ['var(--font-size-base)', { lineHeight: 'var(--line-height-normal)' }],
        lg: ['var(--font-size-lg)', { lineHeight: 'var(--line-height-normal)' }],
        xl: ['var(--font-size-xl)', { lineHeight: 'var(--line-height-snug)' }],
        '2xl': ['var(--font-size-2xl)', { lineHeight: 'var(--line-height-tight)' }],
        '3xl': ['var(--font-size-3xl)', { lineHeight: 'var(--line-height-tight)' }],
        '4xl': ['var(--font-size-4xl)', { lineHeight: 'var(--line-height-none)' }],
        '5xl': ['var(--font-size-5xl)', { lineHeight: 'var(--line-height-none)' }],
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'sans-serif'],
        serif: ['var(--font-serif)', 'serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      fontWeight: {
        light: "var(--font-weight-light)",
        normal: "var(--font-weight-normal)",
        medium: "var(--font-weight-medium)",
        semibold: "var(--font-weight-semibold)",
        bold: "var(--font-weight-bold)",
        extrabold: "var(--font-weight-extrabold)",
      },
      letterSpacing: {
        tighter: "var(--letter-spacing-tighter)",
        tight: "var(--letter-spacing-tight)",
        normal: "var(--letter-spacing-normal)",
        wide: "var(--letter-spacing-wide)",
        wider: "var(--letter-spacing-wider)",
        widest: "var(--letter-spacing-widest)",
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        xl: "var(--shadow-xl)",
        inner: "var(--shadow-inner)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [tailwindAnimate],
};
export default config satisfies Config;