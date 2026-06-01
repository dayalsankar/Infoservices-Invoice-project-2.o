# INFO Services Enterprise Invoicing & Billing Management Platform

Enterprise-grade invoicing, timesheet management, approval workflows, and payment reconciliation for consulting firms.

---

## Design System

| Token | Value |
| --- | --- |
| **Primary font** | Poppins |
| **Mono font** | JetBrains Mono (currency, counts, IDs) |
| **Brand navy** | `#1a1f5e` — deep brand identity, headings |
| **Brand royal blue** | `#2a52a8` — primary CTA / action color |
| **Brand cyan blue** | `#3b82c4` — links, accents, hover highlights |

The full token set lives in [`src/styles/design-system.css`](src/styles/design-system.css) (CSS variables for color, spacing, radii, shadows, type scale, motion).

Brand-tinted shadows, monospace for all numeric data, semantic surfaces (`--bg-base` / `--bg-subtle` / `--bg-muted`), and three text levels (`--text-primary` / `--text-secondary` / `--text-tertiary`).

### Loading Poppins + JetBrains Mono

Add to `index.html` (or future `<head>` setup):

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
  rel="stylesheet"
/>
```

---

## Architecture — 10-Module IA

```
src/
├── assets/
│   ├── fonts/                  ← self-hosted font binaries (optional fallback)
│   └── icons/                  ← SVG icon set
├── styles/
│   ├── design-system.css       ← tokens (colors, type, spacing, radii)
│   └── globals.css             ← resets + base styles + utilities
├── components/
│   ├── layout/                 ← shell, console wrapper
│   ├── navigation/             ← sidebar, topbar, breadcrumbs
│   ├── cards/                  ← KPI, summary, content cards
│   ├── tables/                 ← data grid, list views
│   ├── forms/                  ← inputs, selects, validation surfaces
│   ├── buttons/                ← primary / secondary / ghost
│   └── badges/                 ← status pills, count badges
├── pages/                      ← the 10 functional modules
│   ├── dashboard/              ← finance overview, KPIs, activity
│   ├── invoices/               ← create, send, manage, PDF / DOCX
│   ├── timesheets/             ← submit, review, approve, lock
│   ├── approvals/              ← signing-authority workflow
│   ├── payments/               ← record, reconcile, credit notes
│   ├── reports/                ← revenue, aging, GST summaries
│   ├── notifications/          ← user notification center
│   ├── audit/                  ← full audit trail
│   ├── master-data/            ← companies, clients, consultants, assignments
│   └── settings/               ← workflows, integrations, preferences
└── utils/                      ← formatters, validators, currency math
```

Each `pages/<module>/` folder owns its routes, page-level components, hooks, and any module-private logic. Cross-module reusable pieces live in `components/`.

---

## Quick Start

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production bundle
```

---

## Archived

The previous design and source tree (Linear/Stripe Inter-based theme + MUI master-data CRUD) is preserved under [`_archive/v1-old/`](_archive/v1-old/). Nothing was deleted — old code remains accessible for reference or reuse.
