// ─── App Theme Provider ───────────────────────────────────────────────────────
// Wraps the app with MUI ThemeProvider + CssBaseline.
// Light/dark mode is persisted in localStorage via Zustand `persist` middleware.
//
// Usage:
//   <AppThemeProvider>
//     <App />
//   </AppThemeProvider>
//
// Toggle from any component:
//   const toggleMode = useThemeStore((s) => s.toggleMode);

import { useMemo, type ReactNode } from 'react';
import { ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material';
import type { PaletteMode } from '@mui/material';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getTheme } from './theme';

// ─── Theme Store ──────────────────────────────────────────────────────────────

interface ThemeStore {
  mode: PaletteMode;
  toggleMode: () => void;
  setMode: (mode: PaletteMode) => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      mode: 'light',
      toggleMode: () =>
        set((s) => ({ mode: s.mode === 'light' ? 'dark' : 'light' })),
      setMode: (mode) => set({ mode }),
    }),
    {
      name: 'infoservices-theme-mode',
      // Only persist the mode key, not the actions
      partialize: (s) => ({ mode: s.mode }),
    },
  ),
);

// ─── Provider ─────────────────────────────────────────────────────────────────

interface AppThemeProviderProps {
  children: ReactNode;
}

export function AppThemeProvider({ children }: AppThemeProviderProps) {
  const mode = useThemeStore((s) => s.mode);
  // Memoize so the theme object is only rebuilt when mode actually changes
  const theme = useMemo(() => getTheme(mode), [mode]);

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
}

// ─── Convenience hook ─────────────────────────────────────────────────────────
// Returns the current mode and a toggle. Stable reference — safe in deps arrays.

export function useThemeMode() {
  const mode = useThemeStore((s) => s.mode);
  const toggleMode = useThemeStore((s) => s.toggleMode);
  const setMode = useThemeStore((s) => s.setMode);
  return { mode, toggleMode, setMode, isDark: mode === 'dark' } as const;
}
