// src/components/feedback/EmptyState.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Minimal empty state per spec:
//   • Centered, monochromatic. Single icon (48px) — no rainbow illustrations.
//   • Title: h4 (18px weight 600). Description: body2, text.secondary, max 400px.
//   • CTA: OUTLINED (not contained — less visually aggressive).

import { isValidElement, type ReactNode } from 'react';

import Box        from '@mui/material/Box';
import Button     from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';

export type EmptySize = 'small' | 'medium' | 'large';

interface ButtonCta {
  label:   string;
  onClick: () => void;
}

export interface EmptyStateProps {
  title:        string;
  description?: string;
  icon?:        ReactNode;
  cta?:         ButtonCta | ReactNode;
  size?:        EmptySize;
}

const SIZE_CONFIG = {
  small:  { iconPx: 32, titleVariant: 'subtitle1' as const, descVariant: 'caption' as const, py: 3, gap: 1.5 },
  medium: { iconPx: 48, titleVariant: 'h4'        as const, descVariant: 'body2'   as const, py: 5, gap: 2   },
  large:  { iconPx: 64, titleVariant: 'h3'        as const, descVariant: 'body2'   as const, py: 8, gap: 2.5 },
} as const;

function isButtonCta(cta: ButtonCta | ReactNode): cta is ButtonCta {
  return (
    cta !== null &&
    !isValidElement(cta) &&
    typeof cta === 'object' &&
    'label' in (cta as object) &&
    'onClick' in (cta as object)
  );
}

export function EmptyState({
  title,
  description,
  icon,
  cta,
  size = 'medium',
}: EmptyStateProps) {
  const cfg = SIZE_CONFIG[size];

  const resolvedIcon = icon ?? <InboxOutlinedIcon sx={{ fontSize: cfg.iconPx, color: 'text.tertiary' }} />;

  return (
    <Box sx={{
      display:        'flex',
      flexDirection:  'column',
      alignItems:     'center',
      justifyContent: 'center',
      textAlign:      'center',
      py:             cfg.py,
      gap:            cfg.gap,
      maxWidth:       480,
      mx:             'auto',
    }}>
      <Box sx={{ flexShrink: 0, color: 'text.tertiary', display: 'flex', lineHeight: 0 }}>
        {resolvedIcon}
      </Box>

      <Box sx={{ maxWidth: 400 }}>
        <Typography variant={cfg.titleVariant} fontWeight={600} gutterBottom>
          {title}
        </Typography>
        {description && (
          <Typography variant={cfg.descVariant} color="text.secondary">
            {description}
          </Typography>
        )}
      </Box>

      {cta && (
        isButtonCta(cta) ? (
          <Button variant="outlined" size="small" onClick={cta.onClick}>
            {cta.label}
          </Button>
        ) : (
          <>{cta}</>
        )
      )}
    </Box>
  );
}
