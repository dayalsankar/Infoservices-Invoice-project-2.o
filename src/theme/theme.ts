// ─── MUI Theme Factory ────────────────────────────────────────────────────────
// Call getTheme('light' | 'dark') to get a fully configured MUI theme.
// Component overrides are co-located here so the design system stays in sync.
//
// Google Fonts must be loaded in index.html — see GOOGLE_FONTS_URL in tokens.ts.

import { createTheme, alpha } from '@mui/material/styles';
import type { Theme, PaletteMode, Components } from '@mui/material/styles';
import { colors, borderRadius, shadows as tokenShadows, fontFamilies } from './tokens';

// ─── TypeScript: augment MUI palette with neutral scale ───────────────────────
declare module '@mui/material/styles' {
  interface Palette {
    neutral: typeof colors.neutral;
  }
  interface PaletteOptions {
    neutral?: typeof colors.neutral;
  }
}

// ─── Shadow Array ─────────────────────────────────────────────────────────────
// MUI requires exactly 25 entries. Map our semantic shadows across elevation levels.
function buildShadowArray(): Theme['shadows'] {
  const { xs, sm, md, lg, xl } = tokenShadows;
  return [
    'none', // 0
    xs,     // 1
    sm, sm, // 2–3
    md, md, md, // 4–6
    lg, lg, lg, lg, // 7–10
    xl, xl, xl, xl, xl, xl, xl, xl, xl, xl, xl, xl, xl, xl, // 11–24
  ] as Theme['shadows'];
}

// ─── Component Overrides ──────────────────────────────────────────────────────
function buildComponents(mode: PaletteMode): Components<Omit<Theme, 'components'>> {
  const isDark = mode === 'dark';
  const dividerColor = isDark ? colors.neutral[700] : colors.neutral[200];
  const surfaceColor = isDark ? colors.neutral[800] : colors.neutral[50];

  return {
    // ── Global baseline ───────────────────────────────────────────────────────
    MuiCssBaseline: {
      styleOverrides: `
        *, *::before, *::after { box-sizing: border-box; }
        html { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
        body { font-feature-settings: 'cv02', 'cv03', 'cv04', 'cv11'; }
        :focus-visible { outline: 2px solid ${colors.primary[500]}; outline-offset: 2px; }
      `,
    },

    // ── Button ────────────────────────────────────────────────────────────────
    // No uppercase; 600 weight; soft shadow on hover
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: borderRadius.default,
          fontSize: '0.875rem',
          letterSpacing: '0.01em',
          transition: 'box-shadow 0.15s ease, background-color 0.15s ease',
          '&:focus-visible': { boxShadow: tokenShadows.primaryGlow },
        },
        sizeLarge: { padding: '10px 24px', fontSize: '1rem' },
        sizeMedium: { padding: '8px 20px' },
        sizeSmall: { padding: '4px 12px', fontSize: '0.8125rem' },
        contained: {
          '&:hover': { boxShadow: tokenShadows.md },
        },
      },
    },

    // ── IconButton ────────────────────────────────────────────────────────────
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: borderRadius.default,
          transition: 'background-color 0.15s ease',
        },
      },
    },

    // ── TextField (filled default) ────────────────────────────────────────────
    MuiTextField: {
      defaultProps: { variant: 'filled', size: 'small' },
    },

    MuiFilledInput: {
      styleOverrides: {
        root: {
          borderRadius: `${borderRadius.default}px ${borderRadius.default}px 0 0`,
          backgroundColor: isDark
            ? alpha(colors.neutral[600], 0.20)
            : alpha(colors.neutral[500], 0.06),
          '&:hover': {
            backgroundColor: isDark
              ? alpha(colors.neutral[600], 0.28)
              : alpha(colors.neutral[500], 0.10),
          },
          '&.Mui-focused': {
            backgroundColor: isDark
              ? alpha(colors.neutral[600], 0.24)
              : alpha(colors.neutral[500], 0.08),
          },
          '&:before': { borderBottomColor: dividerColor },
        },
        input: { fontSize: '0.875rem' },
      },
    },

    MuiInputLabel: {
      styleOverrides: {
        root: { fontSize: '0.875rem' },
      },
    },

    MuiFormHelperText: {
      styleOverrides: {
        root: { fontSize: '0.75rem', marginTop: 4 },
      },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: borderRadius.default,
          fontSize: '0.875rem',
          '& .MuiOutlinedInput-notchedOutline': { borderColor: dividerColor },
        },
      },
    },

    // ── Card ──────────────────────────────────────────────────────────────────
    // Subtle border + layered shadow; no MUI dark-mode gradient
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: borderRadius.card,
          border: `1px solid ${dividerColor}`,
          boxShadow: tokenShadows.sm,
          backgroundImage: 'none',
        },
      },
    },

    MuiCardHeader: {
      styleOverrides: {
        root: { paddingBottom: 8 },
        title: {
          fontFamily: fontFamilies.heading,
          fontWeight: 600,
          fontSize: '1rem',
        },
        subheader: { fontSize: '0.8125rem' },
      },
    },

    MuiCardContent: {
      styleOverrides: {
        root: { '&:last-child': { paddingBottom: 16 } },
      },
    },

    // ── Chip (rounded, bold) ──────────────────────────────────────────────────
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: borderRadius.chip,
          fontWeight: 600,
          fontSize: '0.75rem',
          height: 24,
        },
        label: { paddingLeft: 8, paddingRight: 8 },
        sizeSmall: { height: 20, fontSize: '0.6875rem' },
      },
    },

    // ── DataGrid (zebra stripes, sticky header) ───────────────────────────────
    MuiDataGrid: {
      defaultProps: { density: 'standard', disableRowSelectionOnClick: true },
      styleOverrides: {
        root: {
          border: `1px solid ${dividerColor}`,
          borderRadius: borderRadius.card,
          backgroundImage: 'none',
          fontSize: '0.875rem',

          // ── Sticky header ────────────────────────────────────────────────
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: surfaceColor,
            borderBottom: `2px solid ${dividerColor}`,
            position: 'sticky',
            top: 0,
            zIndex: 1,
          },
          '& .MuiDataGrid-columnHeaderTitle': {
            fontWeight: 600,
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: isDark ? colors.neutral[400] : colors.neutral[500],
          },
          '& .MuiDataGrid-columnSeparator': {
            color: dividerColor,
          },

          // ── Zebra stripes ────────────────────────────────────────────────
          '& .MuiDataGrid-row': {
            '&:nth-of-type(even)': {
              backgroundColor: isDark
                ? alpha(colors.neutral[500], 0.04)
                : alpha(colors.neutral[500], 0.03),
            },
            '&:hover': {
              backgroundColor: isDark
                ? alpha(colors.primary[500], 0.08)
                : alpha(colors.primary[500], 0.04),
            },
            '&.Mui-selected': {
              backgroundColor: isDark
                ? alpha(colors.primary[500], 0.16)
                : alpha(colors.primary[500], 0.08),
              '&:hover': {
                backgroundColor: isDark
                  ? alpha(colors.primary[500], 0.20)
                  : alpha(colors.primary[500], 0.12),
              },
            },
          },

          // ── Cells ────────────────────────────────────────────────────────
          '& .MuiDataGrid-cell': {
            borderBottom: `1px solid ${isDark ? colors.neutral[800] : colors.neutral[100]}`,
            '&:focus, &:focus-within': {
              outline: `2px solid ${colors.primary[500]}`,
              outlineOffset: -2,
            },
          },

          // ── Footer ───────────────────────────────────────────────────────
          '& .MuiDataGrid-footerContainer': {
            borderTop: `2px solid ${dividerColor}`,
            backgroundColor: surfaceColor,
          },
          '& .MuiDataGrid-selectedRowCount': {
            fontSize: '0.8125rem',
          },
        },
      },
    },

    // ── Paper ─────────────────────────────────────────────────────────────────
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
        elevation1: { boxShadow: tokenShadows.sm },
        elevation2: { boxShadow: tokenShadows.md },
        elevation3: { boxShadow: tokenShadows.lg },
        elevation4: { boxShadow: tokenShadows.xl },
      },
    },

    // ── Table ─────────────────────────────────────────────────────────────────
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 600,
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          backgroundColor: surfaceColor,
          borderBottom: `2px solid ${dividerColor}`,
        },
        body: {
          fontSize: '0.875rem',
          borderBottom: `1px solid ${isDark ? colors.neutral[800] : colors.neutral[100]}`,
        },
      },
    },

    // ── Dialog / Modal ────────────────────────────────────────────────────────
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: borderRadius.modal,
          boxShadow: tokenShadows.xl,
          backgroundImage: 'none',
        },
      },
    },

    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontFamily: fontFamilies.heading,
          fontWeight: 600,
          fontSize: '1.125rem',
          paddingBottom: 8,
        },
      },
    },

    // ── Alert ─────────────────────────────────────────────────────────────────
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: borderRadius.default,
          fontSize: '0.875rem',
          alignItems: 'flex-start',
        },
        icon: { paddingTop: 2 },
      },
    },

    // ── Tooltip ───────────────────────────────────────────────────────────────
    MuiTooltip: {
      defaultProps: { arrow: true },
      styleOverrides: {
        tooltip: {
          fontSize: '0.75rem',
          borderRadius: borderRadius.chip,
          padding: '4px 8px',
        },
      },
    },

    // ── Divider ───────────────────────────────────────────────────────────────
    MuiDivider: {
      styleOverrides: {
        root: { borderColor: dividerColor },
      },
    },

    // ── LinearProgress ────────────────────────────────────────────────────────
    MuiLinearProgress: {
      styleOverrides: {
        root: { borderRadius: borderRadius.pill },
        bar: { borderRadius: borderRadius.pill },
      },
    },

    // ── Skeleton ──────────────────────────────────────────────────────────────
    MuiSkeleton: {
      defaultProps: { animation: 'wave' },
      styleOverrides: {
        root: { borderRadius: borderRadius.default },
      },
    },

    // ── Breadcrumbs ───────────────────────────────────────────────────────────
    MuiBreadcrumbs: {
      styleOverrides: {
        root: { fontSize: '0.875rem' },
      },
    },

    // ── Tab ───────────────────────────────────────────────────────────────────
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          fontSize: '0.875rem',
          '&.Mui-selected': { fontWeight: 600 },
        },
      },
    },

    // ── Badge ─────────────────────────────────────────────────────────────────
    MuiBadge: {
      styleOverrides: {
        badge: { fontSize: '0.6875rem', fontWeight: 600, minWidth: 18, height: 18 },
      },
    },

    // ── Accordion ─────────────────────────────────────────────────────────────
    MuiAccordion: {
      styleOverrides: {
        root: {
          border: `1px solid ${dividerColor}`,
          borderRadius: `${borderRadius.default}px !important`,
          boxShadow: 'none',
          backgroundImage: 'none',
          '&:before': { display: 'none' },
          '&.Mui-expanded': { margin: 0 },
        },
      },
    },

    // ── Menu / Popover ────────────────────────────────────────────────────────
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: borderRadius.default,
          border: `1px solid ${dividerColor}`,
          boxShadow: tokenShadows.lg,
          backgroundImage: 'none',
        },
      },
    },

    MuiMenuItem: {
      styleOverrides: {
        root: {
          fontSize: '0.875rem',
          borderRadius: 6,
          margin: '2px 4px',
          '&.Mui-selected': {
            backgroundColor: isDark
              ? alpha(colors.primary[500], 0.16)
              : alpha(colors.primary[500], 0.08),
          },
        },
      },
    },
  };
}

// ─── Theme Factory ────────────────────────────────────────────────────────────

export function getTheme(mode: PaletteMode): Theme {
  const isDark = mode === 'dark';

  return createTheme({
    palette: {
      mode,
      primary: {
        main: colors.primary[500],
        light: colors.primary[300],
        dark: colors.primary[700],
        contrastText: '#ffffff',
      },
      secondary: {
        main: colors.secondary[500],
        light: colors.secondary[300],
        dark: colors.secondary[700],
        contrastText: '#ffffff',
      },
      success: {
        main: '#10b981',
        light: '#34d399',
        dark: '#059669',
        contrastText: '#ffffff',
      },
      warning: {
        main: '#f59e0b',
        light: '#fcd34d',
        dark: '#d97706',
        contrastText: '#ffffff',
      },
      error: {
        main: '#ef4444',
        light: '#f87171',
        dark: '#dc2626',
        contrastText: '#ffffff',
      },
      info: {
        main: '#3b82f6',
        light: '#60a5fa',
        dark: '#2563eb',
        contrastText: '#ffffff',
      },
      neutral: colors.neutral,
      background: {
        default: isDark ? colors.neutral[900] : colors.neutral[50],
        paper: isDark ? colors.neutral[800] : '#ffffff',
      },
      text: {
        primary: isDark ? colors.neutral[50] : colors.neutral[900],
        secondary: isDark ? colors.neutral[400] : colors.neutral[500],
        disabled: isDark ? colors.neutral[600] : colors.neutral[300],
      },
      divider: isDark ? colors.neutral[700] : colors.neutral[200],
      // Map neutral scale into MUI grey for compatibility
      grey: {
        50: colors.neutral[50],
        100: colors.neutral[100],
        200: colors.neutral[200],
        300: colors.neutral[300],
        400: colors.neutral[400],
        500: colors.neutral[500],
        600: colors.neutral[600],
        700: colors.neutral[700],
        800: colors.neutral[800],
        900: colors.neutral[900],
      },
    },

    typography: {
      fontFamily: fontFamilies.body,
      h1: { fontFamily: fontFamilies.heading, fontWeight: 700, lineHeight: 1.2 },
      h2: { fontFamily: fontFamilies.heading, fontWeight: 700, lineHeight: 1.25 },
      h3: { fontFamily: fontFamilies.heading, fontWeight: 600, lineHeight: 1.3 },
      h4: { fontFamily: fontFamilies.heading, fontWeight: 600, lineHeight: 1.35 },
      h5: { fontFamily: fontFamilies.heading, fontWeight: 600, lineHeight: 1.4 },
      h6: { fontFamily: fontFamilies.heading, fontWeight: 600, lineHeight: 1.45 },
      subtitle1: { fontWeight: 500, lineHeight: 1.5 },
      subtitle2: { fontWeight: 600, fontSize: '0.875rem', lineHeight: 1.5 },
      body1: { fontSize: '1rem', lineHeight: 1.6 },
      body2: { fontSize: '0.875rem', lineHeight: 1.6 },
      caption: { fontSize: '0.75rem', lineHeight: 1.5, letterSpacing: '0.01em' },
      overline: { fontWeight: 600, fontSize: '0.6875rem', letterSpacing: '0.08em' },
      button: { fontWeight: 600, textTransform: 'none', letterSpacing: '0.01em' },
    },

    shape: { borderRadius: borderRadius.default },
    spacing: 8,
    shadows: buildShadowArray(),
    components: buildComponents(mode),
  });
}

export const lightTheme = getTheme('light');
export const darkTheme = getTheme('dark');
