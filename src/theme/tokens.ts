// ─── Design Tokens ────────────────────────────────────────────────────────────
// Single source of truth for spacing, color primitives, radii, and shadows.
// Import from here rather than hardcoding values in components or the theme.

export const GOOGLE_FONTS_URL =
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap';

// ─── Spacing (8px base grid) ──────────────────────────────────────────────────
export const spacing = {
  0: '0px',
  0.5: '4px',
  1: '8px',
  1.5: '12px',
  2: '16px',
  2.5: '20px',
  3: '24px',
  4: '32px',
  5: '40px',
  6: '48px',
  8: '64px',
  10: '80px',
  12: '96px',
  16: '128px',
} as const;

export type SpacingKey = keyof typeof spacing;

// ─── Color Primitives ─────────────────────────────────────────────────────────
export const colors = {
  primary: {
    50: '#e8eaf6',
    100: '#c5cae9',
    200: '#9fa8da',
    300: '#7986cb',
    400: '#5c6bc0',
    500: '#3949ab', // brand indigo — enterprise trust
    600: '#3340a0',
    700: '#283593',
    800: '#1e2b85',
    900: '#0d1a6e',
  },
  secondary: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b', // warm amber — CTAs & highlights
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  neutral: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },
  status: {
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
    // Extended semantic colors not in MUI defaults
    teal: '#06b6d4',   // Approved (ready, not final)
    violet: '#8b5cf6', // Sent (in transit)
  },
} as const;

export type ColorScale = typeof colors.primary;
export type NeutralScale = typeof colors.neutral;

// ─── Border Radii ─────────────────────────────────────────────────────────────
export const borderRadius = {
  chip: 4,
  default: 8,
  card: 12,
  modal: 16,
  pill: 100,
} as const;

export type BorderRadiusKey = keyof typeof borderRadius;

// ─── Shadows (soft, layered — no harsh Material elevation) ───────────────────
// Uses slate/neutral base for warmth rather than pure black
export const shadows = {
  xs: '0px 1px 2px rgba(15, 23, 42, 0.06)',
  sm: '0px 1px 2px rgba(15, 23, 42, 0.06), 0px 1px 3px rgba(15, 23, 42, 0.10)',
  md: '0px 2px 4px rgba(15, 23, 42, 0.06), 0px 4px 6px rgba(15, 23, 42, 0.08)',
  lg: '0px 4px 6px rgba(15, 23, 42, 0.05), 0px 10px 15px rgba(15, 23, 42, 0.10)',
  xl: '0px 10px 25px rgba(15, 23, 42, 0.10), 0px 20px 40px rgba(15, 23, 42, 0.08)',
  // Coloured glow variants for focus rings
  primaryGlow: `0 0 0 3px rgba(57, 73, 171, 0.20)`,
  errorGlow: `0 0 0 3px rgba(239, 68, 68, 0.20)`,
} as const;

export type ShadowKey = keyof typeof shadows;

// ─── Typography ───────────────────────────────────────────────────────────────
export const fontFamilies = {
  heading: '"Plus Jakarta Sans", sans-serif',
  body: '"Inter", sans-serif',
  mono: '"JetBrains Mono", "Fira Code", monospace',
} as const;

// ─── Z-Index Scale ────────────────────────────────────────────────────────────
export const zIndex = {
  base: 0,
  raised: 10,
  dropdown: 100,
  sticky: 200,
  overlay: 300,
  modal: 400,
  toast: 500,
} as const;
