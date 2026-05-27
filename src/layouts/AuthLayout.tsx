// ─── AuthLayout ───────────────────────────────────────────────────────────────
// Centered card shell for login, password reset, and onboarding screens.
// No nav chrome — the card is the entire UI surface.

import { Outlet } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  useTheme,
  useMediaQuery,
} from '@mui/material';

// ─── Props ────────────────────────────────────────────────────────────────────

export interface AuthLayoutProps {
  /** Card width in px. Defaults to 440. */
  cardWidth?: number;
  /** Show decorative left-panel on large screens. Defaults to true. */
  withDecorativePanel?: boolean;
}

// ─── DecorativePanel ──────────────────────────────────────────────────────────
// Visual left-side branding panel shown on md+ screens.

function DecorativePanel() {
  const theme = useTheme();

  return (
    <Box
      aria-hidden="true"
      sx={{
        flex: '0 0 45%',
        display: { xs: 'none', md: 'flex' },
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: `linear-gradient(145deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 60%, #5c6bc0 100%)`,
        p: 6,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle geometric accent */}
      <Box
        sx={{
          position: 'absolute',
          top: -80,
          right: -80,
          width: 320,
          height: 320,
          borderRadius: '50%',
          border: '60px solid rgba(255,255,255,0.06)',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: -60,
          left: -60,
          width: 240,
          height: 240,
          borderRadius: '50%',
          border: '50px solid rgba(255,255,255,0.04)',
        }}
      />

      {/* Logo */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, zIndex: 1 }}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: 1.5,
            backgroundColor: 'rgba(255,255,255,0.2)',
            border: '1px solid rgba(255,255,255,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: '0.75rem', letterSpacing: '0.08em' }}>
            IS
          </Typography>
        </Box>
        <Typography
          variant="h6"
          sx={{ color: '#fff', fontWeight: 700, letterSpacing: '-0.01em' }}
        >
          Infoservices
        </Typography>
      </Box>

      {/* Tagline */}
      <Box sx={{ zIndex: 1 }}>
        <Typography
          variant="h4"
          sx={{
            color: '#fff',
            fontWeight: 700,
            lineHeight: 1.25,
            mb: 2,
            letterSpacing: '-0.02em',
          }}
        >
          Enterprise billing,
          <br />
          simplified.
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: 'rgba(255,255,255,0.75)', lineHeight: 1.7, maxWidth: 280 }}
        >
          GST-compliant invoicing, timesheet management, and payment
          reconciliation — built for consulting firms.
        </Typography>
      </Box>

      {/* Footer */}
      <Typography
        variant="caption"
        sx={{ color: 'rgba(255,255,255,0.45)', zIndex: 1 }}
      >
        © {new Date().getFullYear()} Infoservices. All rights reserved.
      </Typography>
    </Box>
  );
}

// ─── AuthLayout ───────────────────────────────────────────────────────────────

export function AuthLayout({ cardWidth = 440, withDecorativePanel = true }: AuthLayoutProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const showPanel = withDecorativePanel && !isMobile;

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: theme.palette.background.default,
      }}
    >
      {showPanel && <DecorativePanel />}

      {/* ── Auth card column ───────────────────────────────────────────────── */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 2, sm: 4 },
        }}
      >
        {/* Mobile logo — shown only when decorative panel is hidden */}
        {!showPanel && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              mb: 4,
            }}
          >
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: 1,
                backgroundColor: theme.palette.primary.main,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: '0.6875rem' }}>
                IS
              </Typography>
            </Box>
            <Typography variant="subtitle1" fontWeight={700}>
              Infoservices
            </Typography>
          </Box>
        )}

        <Card
          component="main"
          id="main-content"
          tabIndex={-1}
          sx={{
            width: '100%',
            maxWidth: cardWidth,
            boxShadow: isMobile ? 'none' : undefined,
            border: isMobile
              ? 'none'
              : `1px solid ${theme.palette.divider}`,
            backgroundColor: isMobile
              ? 'transparent'
              : theme.palette.background.paper,
          }}
        >
          <CardContent sx={{ p: { xs: 2, sm: 4 }, '&:last-child': { pb: { xs: 2, sm: 4 } } }}>
            <Outlet />
          </CardContent>
        </Card>

        {/* Footer links */}
        <Box
          sx={{
            mt: 3,
            display: 'flex',
            gap: 2,
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          {['Privacy Policy', 'Terms of Service', 'Support'].map((label) => (
            <Typography
              key={label}
              component="a"
              href="#"
              variant="caption"
              color="text.disabled"
              sx={{ textDecoration: 'none', '&:hover': { color: 'text.secondary' } }}
            >
              {label}
            </Typography>
          ))}
        </Box>
      </Box>
    </Box>
  );
}

export default AuthLayout;
