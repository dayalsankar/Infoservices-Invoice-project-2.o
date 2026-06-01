// src/components/dashboard/KPICard.tsx
// ─────────────────────────────────────────────────────────────────────────────
// KPI / stat card per the design spec:
//   • Label: overline (11px uppercase, text.tertiary)
//   • Big number: 32px weight 600, monospace, tabular figures
//   • Trend: 12px text, status-colored, with a 12px arrow icon
//   • Card: 20px padding, 1px subtle border, NO shadow, min-height 120px
//   • No transform on hover — only background/border tweak when clickable

import type { ReactNode } from 'react';

import Box        from '@mui/material/Box';
import Card       from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Skeleton   from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';

import TrendingUpIcon         from '@mui/icons-material/TrendingUp';
import TrendingDownIcon       from '@mui/icons-material/TrendingDown';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';

import { monoNumberSx } from '../../theme/tokens';

// ─── Types ────────────────────────────────────────────────────────────────────

type Format = 'currency' | 'count' | 'percentage' | 'duration' | 'plain';

const INR = new Intl.NumberFormat('en-IN', {
  style: 'currency', currency: 'INR', maximumFractionDigits: 0,
});

function formatValue(value: number | string, format: Format = 'plain'): string {
  if (typeof value === 'string') return value;
  switch (format) {
    case 'currency':   return INR.format(value);
    case 'count':      return new Intl.NumberFormat('en-IN').format(value);
    case 'percentage': return `${value.toFixed(1)}%`;
    case 'duration':   return `${Number.isInteger(value) ? value : value.toFixed(1)} days`;
    default:           return String(value);
  }
}

// ─── Props ────────────────────────────────────────────────────────────────────

export interface KPICardProps {
  label:    string;
  value:    number | string;
  format?:  Format;
  trend?:   { value: number; direction: 'up' | 'down'; label?: string };
  icon?:    ReactNode;
  footer?:  ReactNode;
  onClick?: () => void;
  loading?: boolean;
  error?:   string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function KPICard({
  label, value, format = 'plain',
  trend, icon, footer, onClick, loading, error,
}: KPICardProps) {
  const theme = useTheme();
  const isClickable = Boolean(onClick);
  const status = theme.palette.status;
  const trendColor = trend?.direction === 'up'
    ? (status?.success.fg ?? theme.palette.success.main)
    : (status?.error.fg   ?? theme.palette.error.main);

  if (loading) {
    return (
      <Card sx={{ minHeight: 120 }}>
        <CardContent>
          <Skeleton variant="text" width="50%" height={14} sx={{ mb: 1.5 }} />
          <Skeleton variant="text" width="70%" height={40} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="40%" height={16} />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card sx={{ minHeight: 120, borderColor: 'error.main' }}>
        <CardContent>
          <Typography variant="overline" color="text.tertiary" display="block" sx={{ mb: 1.5 }}>
            {label}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <ErrorOutlineOutlinedIcon sx={{ fontSize: 16, color: 'error.main' }} />
            <Typography variant="body2" color="error.main">{error}</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      onClick={onClick}
      tabIndex={isClickable ? 0 : undefined}
      role={isClickable ? 'button' : undefined}
      onKeyDown={isClickable ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick?.(); } : undefined}
      sx={{
        minHeight:  120,
        cursor:     isClickable ? 'pointer' : 'default',
        transition: 'border-color 150ms cubic-bezier(0.4,0,0.2,1), background-color 150ms cubic-bezier(0.4,0,0.2,1)',
        ...(isClickable && {
          '&:hover': {
            borderColor:     theme.palette.border?.default ?? theme.palette.divider,
            backgroundColor: theme.palette.surface?.subtle ?? 'transparent',
          },
        }),
      }}
    >
      <CardContent>
        {/* Label + optional icon */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5 }}>
          <Typography variant="overline" color="text.tertiary">{label}</Typography>
          {icon && (
            <Box sx={{ color: 'text.tertiary', display: 'flex', alignItems: 'center', lineHeight: 0 }}>
              {icon}
            </Box>
          )}
        </Box>

        {/* Big value — 32px weight 600 mono with tabular figures */}
        <Typography
          component="div"
          sx={{
            ...monoNumberSx,
            fontSize:      '2rem',
            lineHeight:    '40px',
            fontWeight:    600,
            letterSpacing: '-0.02em',
            color:         'text.primary',
            mb:            trend ? 1 : 0,
          }}
        >
          {formatValue(value, format)}
        </Typography>

        {/* Trend — inline 12px text + 12px arrow */}
        {trend && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {trend.direction === 'up'
              ? <TrendingUpIcon   sx={{ fontSize: 12, color: trendColor }} />
              : <TrendingDownIcon sx={{ fontSize: 12, color: trendColor }} />}
            <Typography
              component="span"
              sx={{
                ...monoNumberSx,
                fontSize:   '0.75rem',
                fontWeight: 500,
                color:      trendColor,
              }}
            >
              {trend.direction === 'up' ? '+' : ''}{trend.value.toFixed(1)}%
            </Typography>
            {trend.label && (
              <Typography variant="caption" color="text.tertiary">
                {trend.label}
              </Typography>
            )}
          </Box>
        )}

        {footer && <Box sx={{ mt: 1 }}>{footer}</Box>}
      </CardContent>
    </Card>
  );
}
