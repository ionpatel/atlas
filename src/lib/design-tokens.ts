/**
 * Atlas ERP Design Tokens
 * Single source of truth for all design values
 * 
 * Usage:
 *   import { colors, spacing, typography } from '@/lib/design-tokens';
 *   
 *   <div style={{ backgroundColor: colors.surface }}>
 *   // or with template literals in className:
 *   className={`bg-[${colors.surface}]`}
 */

// ═══════════════════════════════════════════════════════════════════════════
// COLORS
// ═══════════════════════════════════════════════════════════════════════════

export const colors = {
  // Background layers (dark to light)
  charcoal: '#111111',      // Main background
  surface: '#1a1a1a',       // Cards, containers
  elevated: '#222222',      // Hover states, active elements
  border: '#2a2a2a',        // All borders
  
  // Primary accent (Gold)
  gold: '#CDB49E',          // Primary CTAs, highlights
  goldHover: '#d4c0ad',     // Hover state for gold
  goldMuted: '#3a3028',     // Gold-tinted backgrounds
  
  // Text hierarchy
  textPrimary: '#f5f0eb',   // Headings, important text
  textMuted: '#888888',     // Body text, labels
  textSubtle: '#555555',    // Disabled, hints, tertiary
  
  // Status colors
  success: '#34d399',       // emerald-400
  successBg: 'rgba(52, 211, 153, 0.1)',
  successBorder: 'rgba(52, 211, 153, 0.2)',
  
  error: '#f87171',         // red-400
  errorBg: 'rgba(248, 113, 113, 0.1)',
  errorBorder: 'rgba(248, 113, 113, 0.2)',
  
  warning: '#fbbf24',       // amber-400
  warningBg: 'rgba(251, 191, 36, 0.1)',
  warningBorder: 'rgba(251, 191, 36, 0.2)',
  
  info: '#60a5fa',          // blue-400
  infoBg: 'rgba(96, 165, 250, 0.1)',
  infoBorder: 'rgba(96, 165, 250, 0.2)',
  
  // Accent colors (for variety in categories, charts, etc.)
  violet: '#a78bfa',
  violetBg: 'rgba(167, 139, 250, 0.1)',
  
  pink: '#f472b6',
  pinkBg: 'rgba(244, 114, 182, 0.1)',
  
  cyan: '#22d3ee',
  cyanBg: 'rgba(34, 211, 238, 0.1)',
  
  teal: '#2dd4bf',
  tealBg: 'rgba(45, 212, 191, 0.1)',
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// TYPOGRAPHY
// ═══════════════════════════════════════════════════════════════════════════

export const typography = {
  fontFamily: "'Inter', system-ui, sans-serif",
  
  // Font sizes (matching Tailwind)
  size: {
    xs: '0.75rem',      // 12px
    sm: '0.875rem',     // 14px
    base: '1rem',       // 16px
    lg: '1.125rem',     // 18px
    xl: '1.25rem',      // 20px
    '2xl': '1.5rem',    // 24px
    '3xl': '1.875rem',  // 30px
  },
  
  // Font weights
  weight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  
  // Line heights
  leading: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
  
  // Letter spacing
  tracking: {
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// SPACING
// ═══════════════════════════════════════════════════════════════════════════

export const spacing = {
  px: '1px',
  0: '0',
  0.5: '0.125rem',  // 2px
  1: '0.25rem',     // 4px
  1.5: '0.375rem',  // 6px
  2: '0.5rem',      // 8px
  2.5: '0.625rem',  // 10px
  3: '0.75rem',     // 12px
  3.5: '0.875rem',  // 14px
  4: '1rem',        // 16px
  5: '1.25rem',     // 20px
  6: '1.5rem',      // 24px
  7: '1.75rem',     // 28px
  8: '2rem',        // 32px
  10: '2.5rem',     // 40px
  12: '3rem',       // 48px
  16: '4rem',       // 64px
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// BORDER RADIUS
// ═══════════════════════════════════════════════════════════════════════════

export const radius = {
  none: '0',
  sm: '0.25rem',    // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px  - Buttons, inputs
  xl: '0.75rem',    // 12px - Cards, containers
  '2xl': '1rem',    // 16px - Modals, large panels
  full: '9999px',   // Pills, avatars
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// SHADOWS
// ═══════════════════════════════════════════════════════════════════════════

export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.3)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.4)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.5)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.6)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.3)',
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// TRANSITIONS
// ═══════════════════════════════════════════════════════════════════════════

export const transitions = {
  // Durations
  duration: {
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
    slower: '500ms',
  },
  
  // Timing functions
  ease: {
    default: 'cubic-bezier(0.4, 0, 0.2, 1)',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// Z-INDEX
// ═══════════════════════════════════════════════════════════════════════════

export const zIndex = {
  dropdown: 10,
  sticky: 20,
  fixed: 30,
  modalBackdrop: 40,
  modal: 50,
  popover: 60,
  tooltip: 70,
  toast: 100,
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// TAILWIND CLASS UTILITIES
// Pre-built class strings for common patterns
// ═══════════════════════════════════════════════════════════════════════════

export const tw = {
  // Cards
  card: 'bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl',
  cardHover: 'bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl hover:border-[#CDB49E]/20 transition-all duration-300',
  
  // Buttons
  btnPrimary: 'flex items-center gap-2 px-5 py-2.5 bg-[#CDB49E] text-[#111111] rounded-lg text-sm font-semibold hover:bg-[#d4c0ad] transition-all duration-200',
  btnSecondary: 'flex items-center gap-2 px-4 py-2.5 border border-[#2a2a2a] rounded-lg text-sm text-[#888888] hover:text-[#f5f0eb] hover:bg-[#1a1a1a] transition-all duration-200',
  btnIcon: 'p-2 rounded-lg text-[#888888] hover:text-[#CDB49E] hover:bg-[#3a3028] transition-all duration-200',
  btnIconDanger: 'p-2 rounded-lg text-[#888888] hover:text-red-400 hover:bg-red-500/10 transition-all duration-200',
  
  // Form inputs
  input: 'w-full px-4 py-2.5 bg-[#111111] border border-[#2a2a2a] rounded-lg text-sm text-[#f5f0eb] placeholder:text-[#888888]/50 focus:outline-none focus:ring-2 focus:ring-[#CDB49E]/30 focus:border-[#CDB49E]/50 transition-all duration-200',
  select: 'px-4 py-2.5 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-sm text-[#f5f0eb] focus:outline-none focus:ring-2 focus:ring-[#CDB49E]/30 focus:border-[#CDB49E]/50 transition-all duration-200',
  
  // Typography
  heading: 'text-2xl font-semibold tracking-tight text-[#f5f0eb]',
  subheading: 'text-[#888888] text-sm mt-1',
  sectionLabel: 'text-xs font-semibold uppercase tracking-widest text-[#888888]',
  tableHeader: 'text-[10px] font-semibold text-[#888888] uppercase tracking-widest',
  
  // Badges
  badgeSuccess: 'px-2.5 py-1 rounded-full text-[11px] font-medium border bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  badgeError: 'px-2.5 py-1 rounded-full text-[11px] font-medium border bg-red-500/10 text-red-400 border-red-500/20',
  badgeWarning: 'px-2.5 py-1 rounded-full text-[11px] font-medium border bg-amber-500/10 text-amber-400 border-amber-500/20',
  badgeInfo: 'px-2.5 py-1 rounded-full text-[11px] font-medium border bg-blue-500/10 text-blue-400 border-blue-500/20',
  badgeGold: 'px-2.5 py-1 rounded-full text-[11px] font-medium border bg-[#3a3028] text-[#CDB49E] border-[#CDB49E]/20',
  badgeNeutral: 'px-2.5 py-1 rounded-full text-[11px] font-medium border bg-[#222222] text-[#888888] border-[#2a2a2a]',
  
  // Tables
  tableRow: 'hover:bg-[#222222] transition-colors duration-150 border-b border-[#2a2a2a]/50 last:border-0',
  tableRowAlt: 'bg-[#111111]/40',
  tableCell: 'px-6 py-4 text-sm',
  
  // Transitions
  transition: 'transition-all duration-200',
  transitionFast: 'transition-all duration-150',
  transitionSlow: 'transition-all duration-300',
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// ICON SIZES
// ═══════════════════════════════════════════════════════════════════════════

export const iconSize = {
  xs: 'w-3 h-3',
  sm: 'w-3.5 h-3.5',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
  xl: 'w-6 h-6',
} as const;

// Default export for convenience
export default {
  colors,
  typography,
  spacing,
  radius,
  shadows,
  transitions,
  zIndex,
  tw,
  iconSize,
};
