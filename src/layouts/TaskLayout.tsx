// ─── TaskLayout ───────────────────────────────────────────────────────────────
// Lightweight shell for Consultant, Delivery Manager, Signing Authority, Client.
// Single-column, mobile-optimized. Minimal chrome — content first.

import {
  useState,
  type MouseEvent,
} from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Box,
  Avatar,
  IconButton,
  Typography,
  Tooltip,
  Badge,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  useTheme,
  useMediaQuery,
  alpha,
  Container,
} from '@mui/material';
import {
  NotificationsOutlined as BellIcon,
  AccountCircleOutlined,
  SwapHorizOutlined,
  LogoutOutlined,
} from '@mui/icons-material';
import type { CurrentUser, UserRole } from '../types/auth';
import { ROLE_LABELS } from '../types/auth';

// ─── Props ────────────────────────────────────────────────────────────────────

export interface TaskLayoutProps {
  user: CurrentUser;
  /** Unread notification count shown on bell badge */
  unreadCount?: number;
  onNotificationsClick?: () => void;
  onLogout?: () => void;
  onSwitchRole?: (role: UserRole) => void;
  /** Max content width. Defaults to 'md' (900px) for focus. */
  maxWidth?: 'sm' | 'md' | 'lg' | false;
}

// ─── TaskLayout ───────────────────────────────────────────────────────────────

export function TaskLayout({
  user,
  unreadCount = 0,
  onNotificationsClick,
  onLogout,
  maxWidth = 'md',
}: TaskLayoutProps) {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [userMenuAnchor, setUserMenuAnchor] = useState<HTMLElement | null>(null);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: theme.palette.background.default,
      }}
    >
      {/* ── Top Bar ─────────────────────────────────────────────────────────── */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          backgroundColor: theme.palette.background.paper,
          borderBottom: `1px solid ${theme.palette.divider}`,
          color: theme.palette.text.primary,
        }}
      >
        <Toolbar sx={{ gap: 1, minHeight: { xs: 56, sm: 56 } }}>
          {/* Logo / Brand */}
          <Box
            component="button"
            onClick={() => navigate('/')}
            aria-label="Go to home"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              p: 0,
              borderRadius: 1,
              '&:focus-visible': {
                outline: `2px solid ${theme.palette.primary.main}`,
                outlineOffset: 2,
              },
            }}
          >
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: 1,
                backgroundColor: theme.palette.primary.main,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Typography
                sx={{
                  color: '#fff',
                  fontSize: '0.625rem',
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                  lineHeight: 1,
                }}
              >
                IS
              </Typography>
            </Box>
            {!isMobile && (
              <Typography variant="subtitle2" fontWeight={700} color="text.primary">
                Infoservices
              </Typography>
            )}
          </Box>

          <Box sx={{ flex: 1 }} />

          {/* Notification bell */}
          <Tooltip title="Notifications">
            <IconButton
              size="small"
              aria-label={`Notifications — ${unreadCount} unread`}
              onClick={onNotificationsClick}
              sx={{ color: theme.palette.text.secondary }}
            >
              <Badge badgeContent={unreadCount} color="error" max={99}>
                <BellIcon fontSize="small" />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* User avatar */}
          <Tooltip title={`${user.name} — ${ROLE_LABELS[user.role]}`}>
            <IconButton
              size="small"
              aria-label="User menu"
              aria-haspopup="true"
              aria-expanded={Boolean(userMenuAnchor)}
              onClick={(e: MouseEvent<HTMLElement>) => setUserMenuAnchor(e.currentTarget)}
              sx={{ p: 0.25 }}
            >
              <Avatar
                src={user.avatarUrl}
                alt={user.name}
                sx={{ width: 30, height: 30, fontSize: '0.75rem' }}
              >
                {user.name.charAt(0)}
              </Avatar>
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      {/* ── Page Content ────────────────────────────────────────────────────── */}
      <Container
        maxWidth={maxWidth}
        component="main"
        id="main-content"
        tabIndex={-1}
        sx={{
          flex: 1,
          py: { xs: 2, sm: 3 },
          px: { xs: 2, sm: 3 },
          width: '100%',
          // Remove Container's default horizontal padding so we control it
          '&.MuiContainer-root': {
            paddingLeft: { xs: 16, sm: 24 },
            paddingRight: { xs: 16, sm: 24 },
          },
        }}
      >
        <Outlet />
      </Container>

      {/* ── User Menu ───────────────────────────────────────────────────────── */}
      <Menu
        anchorEl={userMenuAnchor}
        open={Boolean(userMenuAnchor)}
        onClose={() => setUserMenuAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { width: 220, mt: 1 } } }}
      >
        {/* Identity */}
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="body2" fontWeight={600} noWrap>
            {user.name}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap display="block">
            {user.email}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              mt: 0.5,
              display: 'inline-block',
              px: 1,
              py: 0.25,
              borderRadius: 0.5,
              backgroundColor: alpha(theme.palette.primary.main, 0.10),
              color: theme.palette.primary.main,
              fontWeight: 600,
              fontSize: '0.6875rem',
            }}
          >
            {ROLE_LABELS[user.role]}
          </Typography>
        </Box>
        <Divider />
        <MenuItem
          onClick={() => { navigate('/profile'); setUserMenuAnchor(null); }}
          dense
        >
          <ListItemIcon><AccountCircleOutlined fontSize="small" /></ListItemIcon>
          <ListItemText primaryTypographyProps={{ fontSize: '0.875rem' }}>Profile</ListItemText>
        </MenuItem>
        {user.availableRoles && user.availableRoles.length > 1 && (
          <MenuItem dense onClick={() => setUserMenuAnchor(null)}>
            <ListItemIcon><SwapHorizOutlined fontSize="small" /></ListItemIcon>
            <ListItemText primaryTypographyProps={{ fontSize: '0.875rem' }}>Switch Role</ListItemText>
          </MenuItem>
        )}
        <Divider />
        <MenuItem
          dense
          onClick={() => { onLogout?.(); setUserMenuAnchor(null); }}
          sx={{ color: theme.palette.error.main }}
        >
          <ListItemIcon><LogoutOutlined fontSize="small" color="error" /></ListItemIcon>
          <ListItemText primaryTypographyProps={{ fontSize: '0.875rem', color: 'inherit' }}>
            Logout
          </ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
}

export default TaskLayout;
