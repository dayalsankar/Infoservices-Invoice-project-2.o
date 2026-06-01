// src/lib/fonts.ts
// ─────────────────────────────────────────────────────────────────────────────
// Font system for the Vite project. Vite has no next/font equivalent, so we
// load fonts via the <link> tag in index.html and expose CSS variables here.
//
//   --font-inter → Inter (body + headings)
//   --font-mono  → JetBrains Mono (currency, counts, IDs)
//
// CSS variables are defined in src/styles/globals.css under :root. This file
// just re-exports the family strings for non-MUI consumers.

export const FONT_FAMILIES = {
  body:    'var(--font-inter), "Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  heading: 'var(--font-inter), "Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  mono:    'var(--font-mono), "JetBrains Mono", "Fira Code", ui-monospace, "SF Mono", Menlo, monospace',
} as const;

export const FONT_FEATURE_SETTINGS = "'cv11', 'ss01', 'ss03'";

/**
 * Sx fragment to apply on any displayed number (currency, count, ID).
 * Ensures tabular figures so columns line up vertically.
 */
export const monoNumberSx = {
  fontFamily:          FONT_FAMILIES.mono,
  fontFeatureSettings: "'tnum'",
  letterSpacing:       0,
} as const;
