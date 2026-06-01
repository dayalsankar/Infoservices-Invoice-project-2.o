// src/theme/statusColors.ts
// ─────────────────────────────────────────────────────────────────────────────
// Domain status → palette config. Two layers:
//   1. SEVERITY map — success/warning/error/info/neutral. Single source of truth.
//   2. DOMAIN maps — invoice / timesheet statuses → severity + icon.

import { alpha } from '@mui/material/styles';
import type { SxProps, Theme } from '@mui/material/styles';
import { statusLight, statusDark } from './tokens';

// ─── Domain status types ──────────────────────────────────────────────────────

export type InvoiceStatus =
  | 'Draft'
  | 'Pending Approval'
  | 'Approved'
  | 'Sent'
  | 'Paid'
  | 'Partially Paid'
  | 'Overdue';

export type TimesheetStatus =
  | 'Draft'
  | 'Submitted'
  | 'Under Review'
  | 'Approved'
  | 'Rejected';

export type AppStatus = InvoiceStatus | TimesheetStatus;

// ─── Severity ────────────────────────────────────────────────────────────────

export type Severity = 'success' | 'warning' | 'error' | 'info' | 'neutral';

export function getSeverityTriple(severity: Severity, mode: 'light' | 'dark' = 'light') {
  return (mode === 'dark' ? statusDark : statusLight)[severity];
}

/**
 * Theme-aware sx for a status chip — uses `theme.palette.status[severity]`
 * (already mode-aware).
 */
export function getSeverityChipSx(severity: Severity): SxProps<Theme> {
  return (theme: Theme) => {
    const triple = theme.palette.status?.[severity] ?? statusLight[severity];
    return {
      color:            triple.fg,
      backgroundColor:  triple.bg,
      border:           `1px solid ${triple.border}`,
      fontWeight:       500,
      '& .MuiChip-icon':  { color: triple.fg },
      '& .MuiChip-label': { px: 1 },
    };
  };
}

// ─── Status config shape ─────────────────────────────────────────────────────

export interface StatusColorConfig {
  color:           string;
  backgroundColor: string;
  borderColor:     string;
  severity:        Severity;
  muiColor?:       'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  alertSeverity?:  'success' | 'info' | 'warning' | 'error';
  label?:          string;
}

function fromSeverity(severity: Severity): StatusColorConfig {
  const t = statusLight[severity];
  return {
    color:           t.fg,
    backgroundColor: t.bg,
    borderColor:     t.border,
    severity,
    muiColor:        severity === 'neutral' ? 'default' : severity,
    alertSeverity:   severity === 'neutral' ? undefined : (severity as 'success' | 'warning' | 'error' | 'info'),
  };
}

function customColor(severity: Severity, fg: string, bgRgb: string, borderRgb: string): StatusColorConfig {
  return {
    color: fg, backgroundColor: bgRgb, borderColor: borderRgb,
    severity,
    muiColor:      severity === 'neutral' ? 'default' : severity,
    alertSeverity: severity === 'neutral' ? undefined : (severity as 'success' | 'warning' | 'error' | 'info'),
  };
}

// ─── Invoice status map ───────────────────────────────────────────────────────

export const INVOICE_STATUS_COLORS: Record<InvoiceStatus, StatusColorConfig> = {
  Draft:               fromSeverity('neutral'),
  'Pending Approval':  fromSeverity('warning'),
  Approved:            customColor('info', '#0D9488', alpha('#14B8A6', 0.10), alpha('#14B8A6', 0.30)),  // teal — "ready to send"
  Sent:                customColor('info', '#7C3AED', alpha('#8B5CF6', 0.10), alpha('#8B5CF6', 0.30)),  // violet — "in transit"
  Paid:                fromSeverity('success'),
  'Partially Paid':    fromSeverity('warning'),
  Overdue:             fromSeverity('error'),
};

// ─── Timesheet status map ─────────────────────────────────────────────────────

export const TIMESHEET_STATUS_COLORS: Record<TimesheetStatus, StatusColorConfig> = {
  Draft:          fromSeverity('neutral'),
  Submitted:      fromSeverity('info'),
  'Under Review': fromSeverity('warning'),
  Approved:       fromSeverity('success'),
  Rejected:       fromSeverity('error'),
};

// ─── Lookups ─────────────────────────────────────────────────────────────────

export const getInvoiceStatusConfig   = (s: InvoiceStatus):   StatusColorConfig => INVOICE_STATUS_COLORS[s];
export const getTimesheetStatusConfig = (s: TimesheetStatus): StatusColorConfig => TIMESHEET_STATUS_COLORS[s];

export function getStatusConfig(status: InvoiceStatus,   domain: 'invoice'):   StatusColorConfig;
export function getStatusConfig(status: TimesheetStatus, domain: 'timesheet'): StatusColorConfig;
export function getStatusConfig(status: AppStatus,       domain: 'invoice' | 'timesheet'): StatusColorConfig {
  return domain === 'invoice'
    ? INVOICE_STATUS_COLORS[status as InvoiceStatus]
    : TIMESHEET_STATUS_COLORS[status as TimesheetStatus];
}

// ─── Sx helpers ──────────────────────────────────────────────────────────────

export const getStatusChipSx = (config: StatusColorConfig) => ({
  color:            config.color,
  backgroundColor:  config.backgroundColor,
  border:           `1px solid ${config.borderColor}`,
  fontWeight:       500,
  '& .MuiChip-label': { paddingLeft: 1, paddingRight: 1 },
}) as const;
