// src/theme/theme.ts
// ─────────────────────────────────────────────────────────────────────────────
// Assembles the final MUI theme: palette + typography + components + tokens.
// Mirrors the Next.js theme so the design language is identical.

import { createTheme, type Theme } from '@mui/material/styles';
import type { PaletteMode } from '@mui/material';
import { lightPalette, darkPalette } from './palette';
import { typography } from './typography';
import { components } from './components';
import { radii, buildMuiShadows } from './tokens';

// `spacing: 8` (MUI default) kept for backward compat with existing pages.
// The 4px design unit is reachable via fractional values: p: 0.5 = 4px, etc.
const SPACING = 8;

export function getTheme(mode: PaletteMode): Theme {
  return createTheme({
    palette:    mode === 'light' ? lightPalette : darkPalette,
    typography,
    shape:      { borderRadius: radii.sm },
    spacing:    SPACING,
    shadows:    buildMuiShadows(mode),
    components,
  });
}

export const lightTheme = getTheme('light');
export const darkTheme  = getTheme('dark');
