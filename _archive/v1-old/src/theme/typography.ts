// src/theme/typography.ts
// ─────────────────────────────────────────────────────────────────────────────
// Single-typeface scale. Inter everywhere; JetBrains Mono for numbers.

import type { TypographyOptions } from '@mui/material/styles/createTypography';
import { fontFamilies, fontFeatureSettings } from './tokens';

export const typography: TypographyOptions = {
  fontFamily:        fontFamilies.body,
  fontSize:          14,
  htmlFontSize:      16,
  fontWeightLight:   300,
  fontWeightRegular: 400,
  fontWeightMedium:  500,
  fontWeightBold:    600,

  h1: { fontFamily: fontFamilies.body, fontSize: '2rem',     lineHeight: '40px', fontWeight: 600, letterSpacing: '-0.02em', fontFeatureSettings },
  h2: { fontFamily: fontFamilies.body, fontSize: '1.5rem',   lineHeight: '32px', fontWeight: 600, letterSpacing: '-0.02em', fontFeatureSettings },
  h3: { fontFamily: fontFamilies.body, fontSize: '1.25rem',  lineHeight: '28px', fontWeight: 600, letterSpacing: '-0.01em', fontFeatureSettings },
  h4: { fontFamily: fontFamilies.body, fontSize: '1.125rem', lineHeight: '26px', fontWeight: 600, letterSpacing: '-0.01em', fontFeatureSettings },
  h5: { fontFamily: fontFamilies.body, fontSize: '1rem',     lineHeight: '24px', fontWeight: 600, letterSpacing: 0,         fontFeatureSettings },
  h6: { fontFamily: fontFamilies.body, fontSize: '0.875rem', lineHeight: '20px', fontWeight: 600, letterSpacing: 0,         fontFeatureSettings },

  body1:  { fontSize: '0.875rem',  lineHeight: '20px', fontWeight: 400, letterSpacing: 0, fontFeatureSettings },
  body2:  { fontSize: '0.8125rem', lineHeight: '18px', fontWeight: 400, letterSpacing: 0, fontFeatureSettings },

  subtitle1: { fontSize: '0.875rem',  lineHeight: '20px', fontWeight: 500, letterSpacing: 0 },
  subtitle2: { fontSize: '0.8125rem', lineHeight: '18px', fontWeight: 500, letterSpacing: 0 },
  caption:   { fontSize: '0.75rem',   lineHeight: '16px', fontWeight: 400, letterSpacing: 0 },
  overline:  { fontSize: '0.6875rem', lineHeight: '14px', fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' },

  button: { fontSize: '0.8125rem', lineHeight: 1.4, fontWeight: 500, letterSpacing: 0, textTransform: 'none' },
};
