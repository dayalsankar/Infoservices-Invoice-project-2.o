// src/theme/palette.ts
// ─────────────────────────────────────────────────────────────────────────────
// MUI PaletteOptions for light + dark — mirror of the Next.js palette.

import type { PaletteOptions } from '@mui/material/styles';
import {
  colorPrimary,
  colorNeutral,
  colorGreen,
  colorRed,
  colorBlue,
  colorAmber,
  semanticLight,
  semanticDark,
  statusLight,
  statusDark,
} from './tokens';

// ─── TypeScript augmentation ──────────────────────────────────────────────────

declare module '@mui/material/styles' {
  interface Palette {
    neutral: typeof colorNeutral;
    brand: { main: string; hover: string; light: string; '50': string };
    surface: { base: string; subtle: string; muted: string };
    border:  { subtle: string; default: string; strong: string };
    status: {
      success: { fg: string; bg: string; border: string };
      warning: { fg: string; bg: string; border: string };
      error:   { fg: string; bg: string; border: string };
      info:    { fg: string; bg: string; border: string };
      neutral: { fg: string; bg: string; border: string };
    };
  }
  interface PaletteOptions {
    neutral?: Partial<typeof colorNeutral>;
    brand?: Partial<{ main: string; hover: string; light: string; '50': string }>;
    surface?: Partial<{ base: string; subtle: string; muted: string }>;
    border?:  Partial<{ subtle: string; default: string; strong: string }>;
    status?: Partial<Palette['status']>;
  }
  interface TypeText {
    tertiary: string;
  }
  interface TypeTextOptions {
    tertiary?: string;
  }
}

const success = { main: colorGreen['600'],  light: colorGreen.light,  dark: colorGreen['700'],  contrastText: '#FFFFFF' } as const;
const warning = { main: colorAmber['600'],  light: colorAmber.light,  dark: colorAmber['700'],  contrastText: '#18181B' } as const;
const error   = { main: colorRed['600'],    light: colorRed.light,    dark: colorRed['700'],    contrastText: '#FFFFFF' } as const;
const info    = { main: colorBlue['600'],   light: colorBlue.light,   dark: colorBlue['700'],   contrastText: '#FFFFFF' } as const;

const brand = { main: '#2563EB', hover: '#1D4ED8', light: '#3B82F6', '50': '#EFF6FF' } as const;

// ─── Light palette ────────────────────────────────────────────────────────────

const lightPrimary = {
  '50':  '#FAFAFA',
  '100': '#F4F4F5',
  '200': '#E4E4E7',
  '300': '#3F3F46',
  '400': '#27272A',
  main:         colorPrimary['500'],
  light:        colorPrimary['400'],
  dark:         colorPrimary['700'],
  contrastText: '#FFFFFF',
} as const;

const lightSecondary = {
  main: colorNeutral['600'], light: colorNeutral['400'], dark: colorNeutral['800'], contrastText: '#FFFFFF',
} as const;

export const lightPalette: PaletteOptions = {
  mode: 'light',
  primary:   lightPrimary,
  secondary: lightSecondary,
  success, warning, error, info,
  neutral:   colorNeutral,
  brand,
  surface:   semanticLight.background,
  border:    semanticLight.border,
  status:    statusLight,
  background: {
    default: semanticLight.background.base,    // #FFFFFF
    paper:   semanticLight.background.base,
  },
  text: {
    primary:   semanticLight.text.primary,
    secondary: semanticLight.text.secondary,
    tertiary:  semanticLight.text.tertiary,
    disabled:  semanticLight.text.disabled,
  },
  divider: semanticLight.border.subtle,
  grey: {
    50: colorNeutral['50'], 100: colorNeutral['100'], 200: colorNeutral['200'],
    300: colorNeutral['300'], 400: colorNeutral['400'], 500: colorNeutral['500'],
    600: colorNeutral['600'], 700: colorNeutral['700'], 800: colorNeutral['800'],
    900: colorNeutral['900'],
  },
  action: {
    hover:           semanticLight.background.muted,
    selected:        'rgba(37, 99, 235, 0.08)',
    disabledOpacity: 0.5,
    focus:           'rgba(37, 99, 235, 0.12)',
  },
};

// ─── Dark palette ─────────────────────────────────────────────────────────────

const darkPrimary = {
  '50':  '#18181B', '100': '#27272A', '200': '#3F3F46',
  '300': '#E4E4E7', '400': '#F4F4F5',
  main:         '#FAFAFA',
  light:        '#FFFFFF',
  dark:         '#E4E4E7',
  contrastText: '#18181B',
} as const;

const darkSecondary = {
  main: colorNeutral['400'], light: colorNeutral['300'], dark: colorNeutral['600'], contrastText: '#09090B',
} as const;

const darkBrand   = { main: '#3B82F6', hover: '#60A5FA', light: '#60A5FA', '50': '#1E3A8A' } as const;
const darkInfo    = { main: '#3B82F6', light: '#60A5FA', dark: '#2563EB', contrastText: '#FFFFFF' } as const;
const darkSuccess = { ...success, main: colorGreen.light, light: colorGreen['500'] };
const darkWarning = { ...warning, main: colorAmber.light, light: colorAmber['500'] };
const darkError   = { ...error,   main: colorRed.light,   light: colorRed['500']   };

export const darkPalette: PaletteOptions = {
  mode: 'dark',
  primary:   darkPrimary,
  secondary: darkSecondary,
  success: darkSuccess,
  warning: darkWarning,
  error:   darkError,
  info:    darkInfo,
  neutral: colorNeutral,
  brand:   darkBrand,
  surface: semanticDark.background,
  border:  semanticDark.border,
  status:  statusDark,
  background: {
    default: semanticDark.background.base,
    paper:   semanticDark.background.subtle,
  },
  text: {
    primary:   semanticDark.text.primary,
    secondary: semanticDark.text.secondary,
    tertiary:  semanticDark.text.tertiary,
    disabled:  semanticDark.text.disabled,
  },
  divider: semanticDark.border.subtle,
  grey: {
    50: colorNeutral['50'], 100: colorNeutral['100'], 200: colorNeutral['200'],
    300: colorNeutral['300'], 400: colorNeutral['400'], 500: colorNeutral['500'],
    600: colorNeutral['600'], 700: colorNeutral['700'], 800: colorNeutral['800'],
    900: colorNeutral['900'],
  },
  action: {
    hover:           semanticDark.background.muted,
    selected:        'rgba(59, 130, 246, 0.12)',
    disabledOpacity: 0.5,
    focus:           'rgba(59, 130, 246, 0.18)',
  },
};
