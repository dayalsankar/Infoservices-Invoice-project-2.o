// src/theme/components.ts
// ─────────────────────────────────────────────────────────────────────────────
// MUI component overrides for the Vite project. Mirror of the Next.js
// component set, adjusted for MUI v9 + React 19.

import type { Components, Theme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';
import { radii, shadowTokens, fontFamilies } from './tokens';

const BRAND = '#2563EB';
const INPUT_FOCUS_HALO = '0 0 0 3px rgba(24,24,27,0.05)';
const BTN_FOCUS = `0 0 0 2px ${alpha(BRAND, 0.30)}`;

export const components: Components<Omit<Theme, 'components'>> = {

  MuiCssBaseline: {
    styleOverrides: {
      '*, *::before, *::after': { boxSizing: 'border-box' },
      html: {
        scrollbarGutter: 'stable',
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
      },
      '::-webkit-scrollbar':       { width: 6, height: 6 },
      '::-webkit-scrollbar-track': { background: 'transparent' },
      '::-webkit-scrollbar-thumb': {
        borderRadius: 9999,
        background:   'rgba(161,161,170,0.35)',
        '&:hover':    { background: 'rgba(161,161,170,0.55)' },
      },
      ':focus-visible': {
        outline:       `2px solid ${BRAND}`,
        outlineOffset: 2,
        borderRadius:  radii.sm,
      },
      a:        { color: BRAND, textDecoration: 'none' },
      'a:hover':{ textDecoration: 'underline' },
    },
  },

  MuiButton: {
    defaultProps: { disableElevation: true },
    styleOverrides: {
      root: ({ theme }: { theme: Theme }) => ({
        textTransform: 'none',
        fontWeight:    500,
        fontSize:      '0.8125rem',
        lineHeight:    1.4,
        borderRadius:  radii.sm,
        letterSpacing: 0,
        boxShadow:     'none',
        transition: 'background-color 0.15s cubic-bezier(0.4,0,0.2,1), border-color 0.15s cubic-bezier(0.4,0,0.2,1), color 0.15s cubic-bezier(0.4,0,0.2,1)',
        '&:hover': { boxShadow: 'none' },
        '&:focus-visible': { boxShadow: BTN_FOCUS, outline: 'none' },
        '&.Mui-disabled': { opacity: 0.5 },
      }),
      sizeSmall:  { padding: '6px 12px', fontSize: '0.75rem' },
      sizeMedium: { padding: '8px 16px' },
      sizeLarge:  { padding: '10px 20px', fontSize: '0.875rem' },

      containedPrimary: ({ theme }: { theme: Theme }) => ({
        backgroundColor: theme.palette.text.primary,
        color:           theme.palette.background.default,
        '&:hover': { backgroundColor: theme.palette.text.secondary },
      }),

      outlined: ({ theme }: { theme: Theme }) => ({
        borderColor: theme.palette.border?.default ?? theme.palette.divider,
        color:       theme.palette.text.primary,
        backgroundColor: 'transparent',
        '&:hover': {
          backgroundColor: theme.palette.surface?.muted ?? theme.palette.action.hover,
          borderColor:     theme.palette.border?.strong ?? theme.palette.text.secondary,
        },
      }),

      text: ({ theme }: { theme: Theme }) => ({
        color: theme.palette.text.secondary,
        padding: '6px 8px',
        '&:hover': {
          backgroundColor: theme.palette.surface?.muted ?? theme.palette.action.hover,
          color: theme.palette.text.primary,
        },
      }),
    },
  },

  MuiIconButton: {
    styleOverrides: {
      root: ({ theme }: { theme: Theme }) => ({
        borderRadius: radii.sm,
        color:        theme.palette.text.secondary,
        transition:   'background-color 0.15s cubic-bezier(0.4,0,0.2,1), color 0.15s cubic-bezier(0.4,0,0.2,1)',
        '&:hover': {
          backgroundColor: theme.palette.surface?.muted ?? theme.palette.action.hover,
          color:           theme.palette.text.primary,
        },
        '&:focus-visible': { boxShadow: BTN_FOCUS, outline: 'none' },
      }),
    },
  },

  MuiTextField: {
    defaultProps: { variant: 'outlined', size: 'small' },
  },

  MuiOutlinedInput: {
    styleOverrides: {
      root: ({ theme }: { theme: Theme }) => ({
        borderRadius: radii.sm,
        fontSize:     '0.875rem',
        backgroundColor: theme.palette.background.default,
        transition:   'box-shadow 0.15s cubic-bezier(0.4,0,0.2,1)',
        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: theme.palette.border?.default ?? theme.palette.divider,
          transition:  'border-color 0.15s cubic-bezier(0.4,0,0.2,1)',
        },
        '&:hover .MuiOutlinedInput-notchedOutline': {
          borderColor: theme.palette.border?.strong ?? theme.palette.text.secondary,
        },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
          borderColor: theme.palette.text.primary,
          borderWidth: 1.5,
        },
        '&.Mui-focused': { boxShadow: INPUT_FOCUS_HALO },
        '&.Mui-error .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.error.main },
        '&.Mui-error.Mui-focused': { boxShadow: shadowTokens.errorGlow },
        '& input::placeholder, & textarea::placeholder': {
          color: theme.palette.text.tertiary, opacity: 1,
        },
      }),
      input: { fontSize: '0.875rem', padding: '8px 12px' },
      inputSizeSmall: { padding: '7px 10px' },
    },
  },

  MuiInputBase: {
    styleOverrides: {
      input: { fontSize: '0.875rem' },
    },
  },

  MuiInputLabel: {
    styleOverrides: {
      root: ({ theme }: { theme: Theme }) => ({
        fontSize: '0.8125rem',
        color: theme.palette.text.secondary,
        '&.Mui-focused': { color: theme.palette.text.primary },
      }),
    },
  },

  MuiFormHelperText: {
    styleOverrides: {
      root: ({ theme }: { theme: Theme }) => ({
        fontSize:   '0.75rem',
        marginTop:  6,
        color:      theme.palette.text.tertiary,
        marginLeft: 0,
      }),
    },
  },

  MuiSelect: {
    defaultProps: { variant: 'outlined' },
  },

  MuiCard: {
    styleOverrides: {
      root: ({ theme }: { theme: Theme }) => ({
        borderRadius:    radii.md,
        border:          `1px solid ${theme.palette.border?.subtle ?? theme.palette.divider}`,
        boxShadow:       'none',
        backgroundImage: 'none',
        backgroundColor: theme.palette.background.default,
      }),
    },
  },

  MuiCardHeader: {
    styleOverrides: {
      root: { padding: 20, paddingBottom: 0 },
      title: ({ theme }: { theme: Theme }) => ({
        fontFamily: fontFamilies.body,
        fontWeight: 600,
        fontSize:   '1rem',
        color:      theme.palette.text.primary,
      }),
      subheader: ({ theme }: { theme: Theme }) => ({
        fontSize: '0.8125rem',
        color:    theme.palette.text.secondary,
        marginTop: 4,
      }),
    },
  },

  MuiCardContent: {
    styleOverrides: {
      root: {
        padding: 20,
        '&:last-child': { paddingBottom: 20 },
      },
    },
  },

  MuiCardActions: {
    styleOverrides: {
      root: ({ theme }: { theme: Theme }) => ({
        padding: '12px 20px',
        borderTop: `1px solid ${theme.palette.border?.subtle ?? theme.palette.divider}`,
      }),
    },
  },

  MuiPaper: {
    styleOverrides: {
      root:       { backgroundImage: 'none' },
      elevation0: { boxShadow: 'none' },
      elevation1: { boxShadow: 'none' },
      elevation2: { boxShadow: shadowTokens.sm },
      elevation3: { boxShadow: shadowTokens.md },
      elevation4: { boxShadow: shadowTokens.lg },
    },
  },

  MuiChip: {
    styleOverrides: {
      root: ({ theme }: { theme: Theme }) => ({
        borderRadius: radii.xs,
        fontWeight:   500,
        fontSize:     '0.75rem',
        height:       22,
        padding:      '0 8px',
        backgroundColor: theme.palette.surface?.muted ?? theme.palette.action.hover,
        color:           theme.palette.text.secondary,
        border:          'none',
        '& .MuiChip-icon': { fontSize: 12 },
      }),
      label:     { paddingLeft: 0, paddingRight: 0 },
      sizeSmall: { height: 20, fontSize: '0.6875rem' },
      sizeMedium:{ height: 26, fontSize: '0.75rem' },
      outlined: ({ theme }: { theme: Theme }) => ({
        backgroundColor: 'transparent',
        border:          `1px solid ${theme.palette.border?.default ?? theme.palette.divider}`,
      }),
    },
  },

  MuiTableHead: {
    styleOverrides: {
      root: ({ theme }: { theme: Theme }) => ({
        backgroundColor: theme.palette.surface?.subtle ?? theme.palette.background.default,
      }),
    },
  },

  MuiTableCell: {
    styleOverrides: {
      head: ({ theme }: { theme: Theme }) => ({
        fontWeight:    500,
        fontSize:      '0.6875rem',
        textTransform: 'uppercase',
        letterSpacing: '0.02em',
        color:         theme.palette.text.secondary,
        padding:       '12px 16px',
        borderBottom:  `1px solid ${theme.palette.border?.subtle ?? theme.palette.divider}`,
      }),
      body: ({ theme }: { theme: Theme }) => ({
        fontSize:     '0.8125rem',
        padding:      '12px 16px',
        borderBottom: `1px solid ${theme.palette.border?.subtle ?? theme.palette.divider}`,
        color:        theme.palette.text.primary,
      }),
    },
  },

  MuiTableRow: {
    styleOverrides: {
      root: ({ theme }: { theme: Theme }) => ({
        '&:hover': { backgroundColor: theme.palette.surface?.subtle ?? theme.palette.action.hover },
        '&.Mui-selected': { backgroundColor: alpha(BRAND, 0.04) },
      }),
    },
  },

  MuiDialog: {
    styleOverrides: {
      paper: ({ theme }: { theme: Theme }) => ({
        borderRadius:    radii.lg,
        boxShadow:       shadowTokens.lg,
        backgroundImage: 'none',
        border:          `1px solid ${theme.palette.border?.subtle ?? theme.palette.divider}`,
      }),
    },
  },

  MuiDialogTitle: {
    styleOverrides: {
      root: {
        fontFamily:    fontFamilies.body,
        fontWeight:    600,
        fontSize:      '1.125rem',
        lineHeight:    '26px',
        letterSpacing: '-0.01em',
        padding:       '20px 24px 8px',
      },
    },
  },

  MuiDialogContent: {
    styleOverrides: {
      root: ({ theme }: { theme: Theme }) => ({
        padding:   '8px 24px 24px',
        fontSize:  '0.875rem',
        color:     theme.palette.text.secondary,
      }),
    },
  },

  MuiDialogActions: {
    styleOverrides: {
      root: { padding: '12px 24px 20px', gap: 8 },
    },
  },

  MuiBackdrop: {
    styleOverrides: {
      root: ({ theme }: { theme: Theme }) => ({
        backgroundColor: theme.palette.mode === 'dark'
          ? 'rgba(0,0,0,0.6)'
          : 'rgba(0,0,0,0.4)',
      }),
    },
  },

  MuiAlert: {
    styleOverrides: {
      root: ({ theme, ownerState }: { theme: Theme; ownerState: { severity?: 'success' | 'warning' | 'error' | 'info' } }) => {
        const sev = ownerState.severity ?? 'info';
        const status = theme.palette.status?.[sev];
        return {
          borderRadius:    radii.md,
          fontSize:        '0.8125rem',
          padding:         '12px 16px',
          alignItems:      'flex-start',
          border:          status ? `1px solid ${status.border}` : `1px solid ${theme.palette.divider}`,
          backgroundColor: status?.bg ?? theme.palette.background.default,
          color:           status?.fg ?? theme.palette.text.primary,
          '& .MuiAlert-icon': {
            fontSize: 16,
            color: status?.fg,
            paddingTop: 0,
          },
        };
      },
    },
  },

  MuiTooltip: {
    defaultProps: { arrow: true, placement: 'top' },
    styleOverrides: {
      tooltip: ({ theme }: { theme: Theme }) => ({
        fontSize:        '0.75rem',
        fontWeight:      500,
        borderRadius:    radii.sm,
        padding:         '6px 10px',
        backgroundColor: theme.palette.text.primary,
        color:           theme.palette.background.default,
        boxShadow:       shadowTokens.md,
      }),
      arrow: ({ theme }: { theme: Theme }) => ({
        color: theme.palette.text.primary,
      }),
    },
  },

  MuiDrawer: {
    styleOverrides: {
      paper: ({ theme }: { theme: Theme }) => ({
        backgroundImage: 'none',
        boxShadow:       'none',
        backgroundColor: theme.palette.background.default,
        borderRight:     `1px solid ${theme.palette.border?.subtle ?? theme.palette.divider}`,
      }),
    },
  },

  MuiTabs: {
    styleOverrides: {
      root: ({ theme }: { theme: Theme }) => ({
        minHeight:    40,
        borderBottom: `1px solid ${theme.palette.border?.subtle ?? theme.palette.divider}`,
      }),
      indicator: ({ theme }: { theme: Theme }) => ({
        height:       2,
        background:   theme.palette.text.primary,
        borderRadius: 1,
      }),
    },
  },

  MuiTab: {
    styleOverrides: {
      root: ({ theme }: { theme: Theme }) => ({
        textTransform: 'none',
        fontSize:      '0.8125rem',
        fontWeight:    500,
        minHeight:     40,
        color:         theme.palette.text.tertiary,
        padding:       '8px 12px',
        '&:hover':         { color: theme.palette.text.secondary },
        '&.Mui-selected':  { color: theme.palette.text.primary },
        '&:focus-visible': { boxShadow: BTN_FOCUS, outline: 'none' },
      }),
    },
  },

  MuiBreadcrumbs: {
    styleOverrides: {
      root: ({ theme }: { theme: Theme }) => ({
        fontSize: '0.8125rem',
        color:    theme.palette.text.tertiary,
        '& a': {
          color: 'inherit',
          textDecoration: 'none',
          '&:hover': { color: theme.palette.text.primary, textDecoration: 'underline' },
        },
        '& .MuiBreadcrumbs-separator': {
          color:    theme.palette.text.tertiary,
          margin:   '0 6px',
          fontSize: 12,
        },
        '& [aria-current="page"]': { color: theme.palette.text.primary, fontWeight: 500 },
      }),
    },
  },

  MuiMenu: {
    styleOverrides: {
      paper: ({ theme }: { theme: Theme }) => ({
        borderRadius: radii.md,
        border:       `1px solid ${theme.palette.border?.subtle ?? theme.palette.divider}`,
        boxShadow:    shadowTokens.md,
        minWidth:     180,
      }),
      list: { padding: 4 },
    },
  },

  MuiMenuItem: {
    styleOverrides: {
      root: ({ theme }: { theme: Theme }) => ({
        fontSize:     '0.8125rem',
        borderRadius: radii.xs,
        margin:       '0 4px',
        padding:      '8px 12px',
        color:        theme.palette.text.primary,
        '&:hover': { backgroundColor: theme.palette.surface?.muted ?? theme.palette.action.hover },
        '&.Mui-selected': {
          backgroundColor: theme.palette.surface?.muted ?? theme.palette.action.hover,
          fontWeight:      500,
          '&:hover': { backgroundColor: theme.palette.surface?.muted ?? theme.palette.action.hover },
        },
      }),
    },
  },

  MuiPopover: {
    styleOverrides: {
      paper: ({ theme }: { theme: Theme }) => ({
        borderRadius: radii.md,
        border:       `1px solid ${theme.palette.border?.subtle ?? theme.palette.divider}`,
        boxShadow:    shadowTokens.md,
      }),
    },
  },

  MuiListItemButton: {
    styleOverrides: {
      root: ({ theme }: { theme: Theme }) => ({
        borderRadius: radii.sm,
        padding:      '6px 10px',
        fontSize:     '0.8125rem',
        fontWeight:   500,
        color:        theme.palette.text.secondary,
        margin:       '1px 8px',
        minHeight:    32,
        '&:hover': {
          backgroundColor: theme.palette.surface?.muted ?? theme.palette.action.hover,
          color:           theme.palette.text.primary,
        },
        '&.Mui-selected': {
          backgroundColor: theme.palette.surface?.muted ?? theme.palette.action.hover,
          color:           theme.palette.text.primary,
          '&:hover': { backgroundColor: theme.palette.surface?.muted ?? theme.palette.action.hover },
        },
        '&:focus-visible': { boxShadow: BTN_FOCUS, outline: 'none' },
      }),
    },
  },

  MuiListItemIcon: {
    styleOverrides: { root: { minWidth: 28, fontSize: 16, color: 'inherit' } },
  },

  MuiListItemText: {
    styleOverrides: { primary: { fontSize: '0.8125rem', fontWeight: 500 } },
  },

  MuiAvatar: {
    styleOverrides: {
      root: ({ theme }: { theme: Theme }) => ({
        borderRadius:    radii.sm,
        backgroundColor: theme.palette.surface?.muted ?? theme.palette.action.hover,
        color:           theme.palette.text.secondary,
        fontSize:        '0.75rem',
        fontWeight:      500,
        width:           32,
        height:          32,
      }),
      circular: { borderRadius: 9999 },
    },
  },

  MuiBadge: {
    styleOverrides: {
      badge: {
        fontSize:     '0.625rem',
        fontWeight:   600,
        minWidth:     16,
        height:       16,
        borderRadius: radii.xs,
        padding:      '0 4px',
      },
    },
  },

  MuiSwitch: {
    styleOverrides: {
      root: { padding: 7, width: 42, height: 30 },
      switchBase: ({ theme }: { theme: Theme }) => ({
        padding: 9,
        '&.Mui-checked': {
          transform: 'translateX(12px)',
          '& + .MuiSwitch-track': {
            backgroundColor: theme.palette.text.primary,
            opacity: 1,
          },
        },
      }),
      thumb: { width: 12, height: 12, backgroundColor: '#FFFFFF', boxShadow: 'none' },
      track: ({ theme }: { theme: Theme }) => ({
        borderRadius: 9999,
        backgroundColor: theme.palette.border?.default ?? theme.palette.divider,
        opacity: 1, height: 16, width: 28,
        transition: 'background-color 150ms cubic-bezier(0.4,0,0.2,1)',
      }),
    },
  },

  MuiCheckbox: {
    styleOverrides: {
      root: ({ theme }: { theme: Theme }) => ({
        padding: 6,
        color:   theme.palette.border?.default ?? theme.palette.divider,
        '&.Mui-checked': { color: theme.palette.text.primary },
        '&:focus-visible': { boxShadow: BTN_FOCUS, outline: 'none' },
        '& svg': { fontSize: 18 },
      }),
    },
  },

  MuiRadio: {
    styleOverrides: {
      root: ({ theme }: { theme: Theme }) => ({
        padding: 6,
        color:   theme.palette.border?.default ?? theme.palette.divider,
        '&.Mui-checked': { color: theme.palette.text.primary },
        '&:focus-visible': { boxShadow: BTN_FOCUS, outline: 'none' },
        '& svg': { fontSize: 18 },
      }),
    },
  },

  MuiDivider: {
    styleOverrides: {
      root: ({ theme }: { theme: Theme }) => ({
        borderColor: theme.palette.border?.subtle ?? theme.palette.divider,
      }),
    },
  },

  MuiLinearProgress: {
    styleOverrides: {
      root: ({ theme }: { theme: Theme }) => ({
        borderRadius:    radii.pill,
        height:          4,
        backgroundColor: theme.palette.border?.subtle ?? theme.palette.divider,
      }),
      bar: ({ theme }: { theme: Theme }) => ({
        borderRadius:    radii.pill,
        backgroundColor: theme.palette.text.primary,
      }),
    },
  },

  MuiSkeleton: {
    defaultProps: { animation: 'wave' },
    styleOverrides: {
      root: ({ theme }: { theme: Theme }) => ({
        borderRadius: radii.sm,
        backgroundColor: theme.palette.surface?.muted ?? theme.palette.action.hover,
      }),
    },
  },

  MuiAppBar: {
    styleOverrides: {
      root: ({ theme }: { theme: Theme }) => ({
        backgroundImage: 'none',
        boxShadow:       'none',
        backgroundColor: theme.palette.background.default,
        color:           theme.palette.text.primary,
        borderBottom:    `1px solid ${theme.palette.border?.subtle ?? theme.palette.divider}`,
      }),
    },
  },

  MuiToolbar: {
    styleOverrides: {
      root: { minHeight: 56, '@media (min-width:600px)': { minHeight: 56 } },
    },
  },

  MuiToggleButton: {
    styleOverrides: {
      root: ({ theme }: { theme: Theme }) => ({
        textTransform: 'none',
        fontWeight:    500,
        fontSize:      '0.8125rem',
        borderRadius:  radii.sm,
        borderColor:   theme.palette.border?.default ?? theme.palette.divider,
        color:         theme.palette.text.secondary,
        padding:       '5px 12px',
        '&.Mui-selected': {
          backgroundColor: theme.palette.surface?.muted ?? theme.palette.action.hover,
          color:           theme.palette.text.primary,
          fontWeight:      500,
          '&:hover': { backgroundColor: theme.palette.surface?.muted ?? theme.palette.action.hover },
        },
        '&:focus-visible': { boxShadow: BTN_FOCUS, outline: 'none' },
      }),
    },
  },

  MuiAutocomplete: {
    styleOverrides: {
      paper: ({ theme }: { theme: Theme }) => ({
        borderRadius: radii.md,
        border:       `1px solid ${theme.palette.border?.subtle ?? theme.palette.divider}`,
        boxShadow:    shadowTokens.md,
      }),
      option: ({ theme }: { theme: Theme }) => ({
        fontSize:     '0.8125rem',
        borderRadius: radii.xs,
        margin:       '2px 4px',
        padding:      '8px 12px',
        '&[aria-selected="true"]': {
          backgroundColor: theme.palette.surface?.muted ?? theme.palette.action.hover,
        },
        '&.Mui-focused': {
          backgroundColor: theme.palette.surface?.muted ?? theme.palette.action.hover,
        },
      }),
    },
  },

  MuiAccordion: {
    styleOverrides: {
      root: ({ theme }: { theme: Theme }) => ({
        border:          `1px solid ${theme.palette.border?.subtle ?? theme.palette.divider}`,
        borderRadius:    `${radii.md}px !important`,
        boxShadow:       'none',
        backgroundImage: 'none',
        '&:before':      { display: 'none' },
        '&.Mui-expanded': { margin: 0 },
      }),
    },
  },

  MuiLink: {
    defaultProps: { underline: 'hover' },
    styleOverrides: {
      root: ({ theme }: { theme: Theme }) => ({
        color: theme.palette.brand?.main ?? BRAND,
        fontWeight: 500,
      }),
    },
  },
};
