// src/components/status/StatusChip.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Reusable status chip using the tinted-background style from the design spec.

import Chip from '@mui/material/Chip';
import {
  getStatusConfig,
  getStatusChipSx,
  getSeverityChipSx,
  type Severity,
  type InvoiceStatus,
  type TimesheetStatus,
} from '../../theme/statusColors';

type Domain = 'invoice' | 'timesheet';

interface DomainProps {
  domain: Domain;
  status: InvoiceStatus | TimesheetStatus;
  severity?: never;
  label?:    string;
  size?:     'small' | 'medium';
}

interface SeverityProps {
  severity: Severity;
  label:    string;
  domain?:  never;
  status?:  never;
  size?:    'small' | 'medium';
}

type StatusChipProps = DomainProps | SeverityProps;

/**
 * StatusChip — two modes:
 *
 *   // Domain map (preferred): looks up via INVOICE/TIMESHEET_STATUS_COLORS
 *   <StatusChip domain="invoice" status="Overdue" />
 *
 *   // Direct severity: for arbitrary labels not in a domain map
 *   <StatusChip severity="success" label="Synced" />
 */
export function StatusChip(props: StatusChipProps) {
  const size = props.size ?? 'small';

  if ('severity' in props && props.severity) {
    return (
      <Chip
        label={props.label}
        size={size}
        sx={getSeverityChipSx(props.severity)}
      />
    );
  }

  const { domain, status, label } = props as DomainProps;
  const config = domain === 'invoice'
    ? getStatusConfig(status as InvoiceStatus, 'invoice')
    : getStatusConfig(status as TimesheetStatus, 'timesheet');

  if (!config) {
    return <Chip label={label ?? status} size={size} variant="outlined" />;
  }

  return (
    <Chip
      label={label ?? status}
      size={size}
      sx={getStatusChipSx(config)}
    />
  );
}
