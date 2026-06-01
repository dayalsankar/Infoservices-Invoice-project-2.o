# Infoservices Invoice (Vite + React 19)

The lightweight client scaffold for the Infoservices invoicing platform.

## Stack

- Vite + React 19 + TypeScript strict
- MUI v9 (Material + Icons + X DataGrid + X DatePickers)
- React Router v7 · React Hook Form + Zod · Zustand (persisted)
- Inter + JetBrains Mono via Google Fonts `<link>` tags in `index.html`

## Quick start

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build
```

---

# Design System

Visual language inspired by **Linear, Stripe Dashboard, Vercel, and Notion**: quiet by default, type-led, monochromatic with restrained accent use. **Color is reserved for meaning** (status, action) — never decoration.

## Where things live

| File | Purpose |
| --- | --- |
| `src/theme/tokens.ts` | Raw design tokens: colors, radii, shadows, status triples, font families, monospace number sx. |
| `src/theme/palette.ts` | MUI `PaletteOptions` for light + dark (pure white light bg, near-black dark bg). |
| `src/theme/typography.ts` | Single-typeface scale (Inter; JetBrains Mono via `monoNumberSx`). |
| `src/theme/components.ts` | MUI component overrides — black primary buttons, no card shadows, etc. |
| `src/theme/statusColors.ts` | Severity map (success / warning / error / info / neutral) + invoice / timesheet status maps. |
| `src/theme/theme.ts` | Assembles palette + typography + components + shadows; exports `getTheme(mode)`. |
| `src/theme/ThemeProvider.tsx` | Wraps the app with `ThemeProvider` + `CssBaseline` and the persisted theme-mode store. |
| `src/lib/fonts.ts` | Font family strings + `monoNumberSx` for displayed numbers. |
| `src/styles/globals.css` | CSS variable bindings + utility classes (`.tabular-nums`, `.truncate`). |
| `index.html` | Loads Inter + JetBrains Mono via Google Fonts `<link>`. |

## Typography scale

| Variant | Size | Weight | Use |
| --- | --- | --- | --- |
| `h1` | 32 / 40 | 600 | Page hero |
| `h2` | 24 / 32 | 600 | Section header |
| `h3` | 20 / 28 | 600 | Subsection |
| `h4` | 18 / 26 | 600 | Card header, empty-state title |
| `h5` | 16 / 24 | 600 | Form section header |
| `h6` | 14 / 20 | 600 | Inline emphasis |
| `body1` | 14 / 20 | 400 | Default body |
| `body2` | 13 / 18 | 400 | Secondary body, table cells |
| `subtitle1` | 14 | 500 | UI label |
| `subtitle2` | 13 | 500 | Compact UI label |
| `caption` | 12 / 16 | 400 | Helper text, captions |
| `overline` | 11 / 14 | 500 | All-caps tracked labels (KPI labels) |
| `button` | 13 | 500 | Buttons (no uppercase) |

## Color tokens (palette extensions)

```ts
theme.palette.background.default   // #FFFFFF light / #09090B dark
theme.palette.surface.subtle       // #FAFAFA / #0F0F11
theme.palette.surface.muted        // #F4F4F5 / #18181B

theme.palette.text.primary         // #18181B / #FAFAFA
theme.palette.text.secondary       // #52525B / #A1A1AA
theme.palette.text.tertiary        // #71717A / #71717A
theme.palette.text.disabled        // #A1A1AA / #52525B

theme.palette.border.subtle        // hairlines, dividers
theme.palette.border.default       // input borders
theme.palette.border.strong        // hover borders

theme.palette.brand.main           // #2563EB — used SPARINGLY
theme.palette.brand.hover          // #1D4ED8

theme.palette.status.success       // { fg, bg, border } triples per severity
theme.palette.status.warning
theme.palette.status.error
theme.palette.status.info
theme.palette.status.neutral
```

## Numbers always render in monospace with tabular figures

```tsx
import { monoNumberSx } from './theme/tokens';

<Typography sx={{ ...monoNumberSx, fontSize: '2rem', fontWeight: 600 }}>
  ₹48,72,500
</Typography>
```

For non-MUI markup, use the `.tabular-nums` utility class.

## Status chips

```tsx
import { StatusChip } from './components/status/StatusChip';

<StatusChip domain="invoice"   status="Overdue" />
<StatusChip domain="timesheet" status="Approved" />
<StatusChip severity="success" label="Synced" />
```

The chip resolves the right foreground / background tint / border via `statusColors.ts`.

## KPI cards

```tsx
import { KPICard } from './components/dashboard/KPICard';

<KPICard
  label="Total Revenue"
  value={4872500}
  format="currency"
  trend={{ direction: 'up', value: 12.4, label: 'vs last month' }}
/>
```

11px overline label, 32px monospace value with tabular figures, 12px status-colored trend, 1px subtle border, no shadow, min-height 120px.

## Empty states

```tsx
import { EmptyState } from './components/feedback/EmptyState';

<EmptyState
  title="No invoices match your filters"
  description="Adjust the date range or status filter to see more results."
  cta={{ label: 'Reset filters', onClick: resetFilters }}
/>
```

The CTA renders as **outlined** (not contained) — empty states aren't the place for a loud primary call to action.

## Switching theme mode

```tsx
import { useThemeMode } from './theme/ThemeProvider';

const { mode, toggleMode, isDark } = useThemeMode();

<IconButton onClick={toggleMode}>
  {isDark ? <LightModeOutlined /> : <DarkModeOutlined />}
</IconButton>
```

Mode is persisted to `localStorage` under `infoservices-theme-mode` via Zustand's `persist` middleware.

## Rules to keep the language consistent

- **Primary buttons are black**, never colored. Outlined for secondary, text for tertiary.
- **Cards have no shadow** — only a 1px `border.subtle`. Shadows belong on dialogs, menus, popovers.
- **All status chips use tinted backgrounds** (`palette.status.{severity}.bg`) with matching foreground and 1px border.
- **Form labels live above inputs**, not as floating MUI labels.
- **Avatars are squared (6px)** by default. Set `variant="circular"` only for actual profile pictures.
- **Focus rings are always visible** — 2px brand-blue solid with 2px offset.
- **One typeface** across the app: Inter. Never reintroduce Plus Jakarta, Poppins, Roboto. Mono family is reserved for numbers.

## What to avoid

Gradients · glassmorphism · heavy shadows · filled colored card backgrounds · pill-shaped chips · pulsing or bouncy animations · multi-typeface mixing · rainbow icon coloring · decorative dividers · MUI's default heavy filled alerts.
