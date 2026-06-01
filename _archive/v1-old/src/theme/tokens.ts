// src/theme/tokens.ts
// ─────────────────────────────────────────────────────────────────────────────
// Raw design tokens for the Vite project. Mirror of the Next.js token set.
// Design philosophy (Linear / Stripe / Vercel / Notion): quiet by default,
// monochromatic base, one calm blue accent, single typeface (Inter + JetBrains
// Mono for numbers), borders over shadows.

// ─── Neutral — Zinc scale ─────────────────────────────────────────────────────

export const colorNeutral = {
  '50':  '#FAFAFA',
  '100': '#F4F4F5',
  '200': '#E4E4E7',
  '300': '#D4D4D8',
  '400': '#A1A1AA',
  '500': '#71717A',
  '600': '#52525B',
  '700': '#3F3F46',
  '800': '#27272A',
  '900': '#18181B',
  '950': '#09090B',
} as const;

// ─── Primary — Near-black ─────────────────────────────────────────────────────

export const colorPrimary = {
  '50':  '#FAFAFA',
  '100': '#F4F4F5',
  '200': '#E4E4E7',
  '300': '#3F3F46',
  '400': '#27272A',
  '500': '#18181B',
  '600': '#18181B',
  '700': '#09090B',
  '800': '#09090B',
  '900': '#09090B',
} as const;

// ─── Brand Accent — Calm blue ────────────────────────────────────────────────

export const colorBrand = {
  '50':  '#EFF6FF',
  '100': '#DBEAFE',
  '200': '#BFDBFE',
  '400': '#60A5FA',
  '500': '#3B82F6',
  '600': '#2563EB',
  '700': '#1D4ED8',
} as const;

// ─── Status hues — desaturated ───────────────────────────────────────────────

export const colorGreen = { '50':'#F0FDF4','100':'#DCFCE7','200':'#BBF7D0','500':'#22C55E','600':'#16A34A','700':'#15803D', light:'#4ADE80' } as const;
export const colorAmber = { '50':'#FEFCE8','100':'#FEF9C3','200':'#FEF08A','500':'#EAB308','600':'#CA8A04','700':'#A16207', light:'#FACC15' } as const;
export const colorRed   = { '50':'#FEF2F2','100':'#FEE2E2','200':'#FECACA','500':'#EF4444','600':'#DC2626','700':'#B91C1C', light:'#F87171' } as const;
export const colorBlue  = { '50':'#EFF6FF','100':'#DBEAFE','200':'#BFDBFE','500':'#3B82F6','600':'#2563EB','700':'#1D4ED8', light:'#60A5FA' } as const;

// ─── Semantic tokens — per-mode ──────────────────────────────────────────────

export const semanticLight = {
  background: { base: '#FFFFFF', subtle: '#FAFAFA', muted: '#F4F4F5' },
  border:     { subtle: '#E4E4E7', default: '#D4D4D8', strong: '#A1A1AA' },
  text:       { primary: '#18181B', secondary: '#52525B', tertiary: '#71717A', disabled: '#A1A1AA' },
  accent:     { primary: '#18181B', primaryHover: '#27272A', onPrimary: '#FFFFFF' },
  brand:      { accent: '#2563EB', accentHover: '#1D4ED8' },
} as const;

export const semanticDark = {
  background: { base: '#09090B', subtle: '#0F0F11', muted: '#18181B' },
  border:     { subtle: '#27272A', default: '#3F3F46', strong: '#52525B' },
  text:       { primary: '#FAFAFA', secondary: '#A1A1AA', tertiary: '#71717A', disabled: '#52525B' },
  accent:     { primary: '#FAFAFA', primaryHover: '#E4E4E7', onPrimary: '#18181B' },
  brand:      { accent: '#3B82F6', accentHover: '#60A5FA' },
} as const;

// ─── Status tokens (fg / bg tint / border tint) ──────────────────────────────

export interface StatusTriple { fg: string; bg: string; border: string }

export const statusLight = {
  success: { fg: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0' },
  warning: { fg: '#CA8A04', bg: '#FEFCE8', border: '#FEF08A' },
  error:   { fg: '#DC2626', bg: '#FEF2F2', border: '#FECACA' },
  info:    { fg: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE' },
  neutral: { fg: '#52525B', bg: '#FAFAFA', border: '#E4E4E7' },
} as const satisfies Record<string, StatusTriple>;

export const statusDark = {
  success: { fg: '#4ADE80', bg: 'rgba(74,222,128,0.10)',  border: 'rgba(74,222,128,0.30)' },
  warning: { fg: '#FACC15', bg: 'rgba(250,204,21,0.10)',  border: 'rgba(250,204,21,0.30)' },
  error:   { fg: '#F87171', bg: 'rgba(248,113,113,0.10)', border: 'rgba(248,113,113,0.30)' },
  info:    { fg: '#60A5FA', bg: 'rgba(96,165,250,0.10)',  border: 'rgba(96,165,250,0.30)' },
  neutral: { fg: '#A1A1AA', bg: 'rgba(161,161,170,0.10)', border: 'rgba(161,161,170,0.30)' },
} as const satisfies Record<string, StatusTriple>;

export type StatusKey = keyof typeof statusLight;

// ─── Border radii ─────────────────────────────────────────────────────────────

export const radii = {
  xs: 4, sm: 6, md: 8, lg: 10, pill: 9999,
  // Legacy aliases — kept for backward compat with existing pages
  chip: 4, default: 6, card: 8, modal: 10,
} as const;

export type RadiusKey = keyof typeof radii;

// ─── Spacing ──────────────────────────────────────────────────────────────────
// 4px base scale (4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80). The MUI theme
// keeps spacing: 8 for backward compat; fractional values (p: 0.5, p: 1.5)
// reach the 4px / 12px increments.

export const spacingScale = [4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80] as const;

// ─── Shadows ─────────────────────────────────────────────────────────────────

export const shadowTokens = {
  none: 'none',
  sm:   '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md:   '0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
  lg:   '0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.05)',
  // Legacy aliases
  xs:   '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  xl:   '0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.05)',
  primaryGlow: '0 0 0 2px rgba(37, 99, 235, 0.28)',
  errorGlow:   '0 0 0 2px rgba(220, 38, 38, 0.28)',
} as const;

export const shadowTokensDark = {
  none: 'none',
  sm:   '0 1px 2px 0 rgb(0 0 0 / 0.5)',
  md:   '0 4px 6px -1px rgb(0 0 0 / 0.5), 0 2px 4px -2px rgb(0 0 0 / 0.5)',
  lg:   '0 10px 15px -3px rgb(0 0 0 / 0.5), 0 4px 6px -4px rgb(0 0 0 / 0.5)',
} as const;

// Legacy `shadows` alias used by existing pages — preserve.
export const shadows = shadowTokens;

import type { Shadows } from '@mui/material/styles';

export function buildMuiShadows(mode: 'light' | 'dark' = 'light'): Shadows {
  const t = mode === 'dark' ? shadowTokensDark : shadowTokens;
  return [
    'none',
    t.sm, t.sm, t.sm,
    t.md, t.md, t.md, t.md,
    t.lg, t.lg, t.lg, t.lg, t.lg, t.lg, t.lg, t.lg,
    t.lg, t.lg, t.lg, t.lg, t.lg, t.lg, t.lg, t.lg, t.lg,
  ] as Shadows;
}

// ─── Z-index ──────────────────────────────────────────────────────────────────

export const zIndex = {
  base: 0, raised: 10, sticky: 100, dropdown: 200, overlay: 300, modal: 400, toast: 500,
} as const;

// ─── Fonts ────────────────────────────────────────────────────────────────────
// Single typeface: Inter for everything UI. JetBrains Mono for numbers.
// The CSS variables are defined in src/styles/globals.css.

export const fontFamilies = {
  body:    'var(--font-inter), "Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  heading: 'var(--font-inter), "Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  mono:    'var(--font-mono), "JetBrains Mono", "Fira Code", ui-monospace, "SF Mono", Menlo, monospace',
} as const;

export const fontFeatureSettings = "'cv11', 'ss01', 'ss03'";

// Sx fragment to apply on any displayed number (currency, count, ID).
export const monoNumberSx = {
  fontFamily:          fontFamilies.mono,
  fontFeatureSettings: "'tnum'",
  letterSpacing:       0,
} as const;

// Legacy aliases consumed by older files
export const GOOGLE_FONTS_URL = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap';

// Spacing aliases for files that still import `spacing`
export const spacing = {
  0:    '0px',
  0.5:  '4px',
  1:    '8px',
  1.5:  '12px',
  2:    '16px',
  2.5:  '20px',
  3:    '24px',
  4:    '32px',
  5:    '40px',
  6:    '48px',
  8:    '64px',
  10:   '80px',
  12:   '96px',
  16:   '128px',
} as const;

// Border radius alias kept for callsites that imported `borderRadius`
export const borderRadius = radii;

// Color-scale alias kept so prior `colors.primary[500]` etc. callsites still work
export const colors = {
  primary: colorPrimary,
  secondary: colorAmber,
  neutral: colorNeutral,
  status: {
    success: colorGreen['600'],
    warning: colorAmber['600'],
    error:   colorRed['600'],
    info:    colorBlue['600'],
    teal:    '#0D9488',
    violet:  '#7C3AED',
  },
} as const;
