// ─── Status Color System ──────────────────────────────────────────────────────
// Maps invoice and timesheet domain statuses to visual color configs.
// Use getStatusChipSx() for MUI Chip styling; severity for MUI Alert.

import { alpha } from '@mui/material/styles';
import { colors } from './tokens';

// ─── Domain Status Types ──────────────────────────────────────────────────────

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

// ─── Color Config Shape ───────────────────────────────────────────────────────

export interface StatusColorConfig {
  /** Text / icon color */
  color: string;
  /** Chip background (translucent tint) */
  backgroundColor: string;
  /** Border for outlined chip variants */
  borderColor: string;
  /**
   * MUI Chip `color` prop when the standard colors cover this status.
   * If absent, use `sx` from getStatusChipSx() instead.
   */
  muiColor?: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  /** MUI Alert severity, if applicable */
  severity?: 'success' | 'info' | 'warning' | 'error';
  /** Human-readable label override (matches the key by default) */
  label?: string;
}

// ─── Invoice Status Map ───────────────────────────────────────────────────────

export const INVOICE_STATUS_COLORS: Record<InvoiceStatus, StatusColorConfig> = {
  Draft: {
    color: colors.neutral[600],
    backgroundColor: alpha(colors.neutral[500], 0.10),
    borderColor: colors.neutral[300],
    muiColor: 'default',
  },
  'Pending Approval': {
    color: '#2563eb',
    backgroundColor: alpha('#3b82f6', 0.10),
    borderColor: alpha('#3b82f6', 0.30),
    muiColor: 'info',
    severity: 'info',
  },
  Approved: {
    // Teal: "ready to send" — distinct from fully Paid green
    color: '#0891b2',
    backgroundColor: alpha('#06b6d4', 0.10),
    borderColor: alpha('#06b6d4', 0.30),
    label: 'Approved',
  },
  Sent: {
    // Violet: "in transit, awaiting client action"
    color: '#7c3aed',
    backgroundColor: alpha('#8b5cf6', 0.10),
    borderColor: alpha('#8b5cf6', 0.30),
    label: 'Sent',
  },
  Paid: {
    color: '#059669',
    backgroundColor: alpha('#10b981', 0.10),
    borderColor: alpha('#10b981', 0.30),
    muiColor: 'success',
    severity: 'success',
  },
  'Partially Paid': {
    color: '#d97706',
    backgroundColor: alpha('#f59e0b', 0.10),
    borderColor: alpha('#f59e0b', 0.30),
    muiColor: 'warning',
    severity: 'warning',
  },
  Overdue: {
    color: '#dc2626',
    backgroundColor: alpha('#ef4444', 0.10),
    borderColor: alpha('#ef4444', 0.30),
    muiColor: 'error',
    severity: 'error',
  },
};

// ─── Timesheet Status Map ─────────────────────────────────────────────────────

export const TIMESHEET_STATUS_COLORS: Record<TimesheetStatus, StatusColorConfig> = {
  Draft: {
    color: colors.neutral[600],
    backgroundColor: alpha(colors.neutral[500], 0.10),
    borderColor: colors.neutral[300],
    muiColor: 'default',
  },
  Submitted: {
    color: '#2563eb',
    backgroundColor: alpha('#3b82f6', 0.10),
    borderColor: alpha('#3b82f6', 0.30),
    muiColor: 'info',
    severity: 'info',
  },
  'Under Review': {
    color: '#d97706',
    backgroundColor: alpha('#f59e0b', 0.10),
    borderColor: alpha('#f59e0b', 0.30),
    muiColor: 'warning',
    severity: 'warning',
  },
  Approved: {
    color: '#059669',
    backgroundColor: alpha('#10b981', 0.10),
    borderColor: alpha('#10b981', 0.30),
    muiColor: 'success',
    severity: 'success',
  },
  Rejected: {
    color: '#dc2626',
    backgroundColor: alpha('#ef4444', 0.10),
    borderColor: alpha('#ef4444', 0.30),
    muiColor: 'error',
    severity: 'error',
  },
};

// ─── Utility Helpers ──────────────────────────────────────────────────────────

/**
 * Returns MUI Chip `sx` prop for fully custom status chip styling.
 * Use when `muiColor` is absent or you want pixel-perfect control.
 *
 * @example
 * <Chip label="Approved" sx={getStatusChipSx(INVOICE_STATUS_COLORS['Approved'])} />
 */
export const getStatusChipSx = (config: StatusColorConfig) => ({
  color: config.color,
  backgroundColor: config.backgroundColor,
  border: `1px solid ${config.borderColor}`,
  fontWeight: 600,
  '& .MuiChip-label': { paddingLeft: 1, paddingRight: 1 },
}) as const;

export const getInvoiceStatusConfig = (status: InvoiceStatus): StatusColorConfig =>
  INVOICE_STATUS_COLORS[status];

export const getTimesheetStatusConfig = (status: TimesheetStatus): StatusColorConfig =>
  TIMESHEET_STATUS_COLORS[status];

/**
 * Type-safe status config lookup across both domains.
 * Narrows to the correct map automatically.
 */
export function getStatusConfig(
  status: InvoiceStatus,
  domain: 'invoice',
): StatusColorConfig;
export function getStatusConfig(
  status: TimesheetStatus,
  domain: 'timesheet',
): StatusColorConfig;
export function getStatusConfig(
  status: AppStatus,
  domain: 'invoice' | 'timesheet',
): StatusColorConfig {
  if (domain === 'invoice') {
    return INVOICE_STATUS_COLORS[status as InvoiceStatus];
  }
  return TIMESHEET_STATUS_COLORS[status as TimesheetStatus];
}
