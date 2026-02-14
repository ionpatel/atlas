/**
 * Atlas ERP Design System - Ocean Breeze Theme
 * Fresh, modern, professional
 */

export const colors = {
  // Backgrounds
  background: {
    DEFAULT: '#0F172A',    // Deep navy (main bg)
    surface: '#1E293B',    // Elevated cards
    elevated: '#334155',   // Hover states
    muted: '#475569',      // Disabled states
  },

  // Primary - Sky Blue (energetic, fresh)
  primary: {
    DEFAULT: '#38BDF8',    // Main brand color
    hover: '#0EA5E9',      // Hover state
    muted: '#0284C7',      // Active/pressed
    foreground: '#0F172A', // Text on primary
  },

  // Accent
  accent: {
    DEFAULT: '#0EA5E9',
    light: '#7DD3FC',
    dark: '#0369A1',
  },

  // Semantic colors
  success: {
    DEFAULT: '#22C55E',
    muted: '#16A34A',
    background: 'rgba(34, 197, 94, 0.1)',
  },
  warning: {
    DEFAULT: '#F59E0B',
    muted: '#D97706',
    background: 'rgba(245, 158, 11, 0.1)',
  },
  error: {
    DEFAULT: '#EF4444',
    muted: '#DC2626',
    background: 'rgba(239, 68, 68, 0.1)',
  },
  info: {
    DEFAULT: '#3B82F6',
    muted: '#2563EB',
    background: 'rgba(59, 130, 246, 0.1)',
  },

  // Text
  text: {
    primary: '#F8FAFC',     // Main text
    secondary: '#94A3B8',   // Muted text
    tertiary: '#64748B',    // Even more muted
    disabled: '#475569',    // Disabled
  },

  // Borders
  border: {
    DEFAULT: '#334155',
    muted: '#1E293B',
    focus: '#38BDF8',
  },

  // Gradients
  gradients: {
    primary: 'linear-gradient(135deg, #0EA5E9 0%, #38BDF8 100%)',
    success: 'linear-gradient(135deg, #16A34A 0%, #22C55E 100%)',
    surface: 'linear-gradient(180deg, #1E293B 0%, #0F172A 100%)',
    glow: 'radial-gradient(circle at 50% 0%, rgba(56, 189, 248, 0.15) 0%, transparent 50%)',
  },
} as const;

// Spacing scale
export const spacing = {
  0: '0',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
} as const;

// Border radius
export const radius = {
  none: '0',
  sm: '0.25rem',   // 4px
  DEFAULT: '0.5rem', // 8px
  md: '0.625rem',  // 10px
  lg: '0.75rem',   // 12px
  xl: '1rem',      // 16px
  '2xl': '1.5rem', // 24px
  full: '9999px',
} as const;

// Shadows
export const shadows = {
  sm: '0 1px 2px rgba(0, 0, 0, 0.3)',
  DEFAULT: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -2px rgba(0, 0, 0, 0.2)',
  md: '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -4px rgba(0, 0, 0, 0.2)',
  lg: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
  glow: '0 0 20px rgba(56, 189, 248, 0.3)',
  'glow-sm': '0 0 10px rgba(56, 189, 248, 0.2)',
} as const;

// Typography
export const typography = {
  fontFamily: {
    sans: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    mono: '"JetBrains Mono", "Fira Code", Consolas, monospace',
  },
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],
    sm: ['0.875rem', { lineHeight: '1.25rem' }],
    base: ['1rem', { lineHeight: '1.5rem' }],
    lg: ['1.125rem', { lineHeight: '1.75rem' }],
    xl: ['1.25rem', { lineHeight: '1.75rem' }],
    '2xl': ['1.5rem', { lineHeight: '2rem' }],
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
} as const;

// Animation
export const animation = {
  duration: {
    fast: '150ms',
    DEFAULT: '200ms',
    slow: '300ms',
    slower: '500ms',
  },
  easing: {
    DEFAULT: 'cubic-bezier(0.4, 0, 0.2, 1)',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
} as const;

// CSS Variables for runtime theming
export const cssVariables = `
  :root {
    --background: 222.2 47.4% 11.2%;
    --foreground: 210 40% 98%;
    --card: 217.2 32.6% 17.5%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 47.4% 11.2%;
    --popover-foreground: 210 40% 98%;
    --primary: 199 89% 60%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 199 89% 48%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 25%;
    --input: 217.2 32.6% 25%;
    --ring: 199 89% 60%;
    --radius: 0.5rem;
  }
`;
