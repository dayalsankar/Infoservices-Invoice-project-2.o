// ─── ConsoleLayout ────────────────────────────────────────────────────────────
// Dense operator shell for Finance Admin, Super Admin, HR, Auditor, Executive.
// Permanent 240px sidebar (collapsible to 64px mini-variant) + sticky top bar.

import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
  type KeyboardEvent,
  type MouseEvent,
} from 'react';
import { Outlet, useLocation, useNavigate, NavLink } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  InputBase,
  Badge,
  Avatar,
  Tooltip,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Popover,
  Menu,
  MenuItem,
  Breadcrumbs,
  Link,
  Paper,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Menu as MenuIcon,
  MenuOpen as MenuOpenIcon,
  Search as SearchIcon,
  NotificationsOutlined as BellIcon,
  KeyboardCommandKey as CmdIcon,
  DashboardOutlined,
  BusinessOutlined,
  PeopleOutlined,
  PersonOutlined,
  AssignmentOutlined,
  TimerOutlined,
  ReceiptLongOutlined,
  PaymentsOutlined,
  BarChartOutlined,
  SecurityOutlined,
  SettingsOutlined,
  NavigateNext,
  AccountCircleOutlined,
  SwapHorizOutlined,
  LogoutOutlined,
  CheckCircleOutlined,
  WarningAmberOutlined,
  InfoOutlined,
  DarkModeOutlined,
  LightModeOutlined,
} from '@mui/icons-material';
import type { UserRole, CurrentUser } from '../types/auth';
import { ROLE_LABELS } from '../types/auth';
import { colors, shadows } from '../theme/tokens';
import { useThemeMode } from '../theme/ThemeProvider';

// ─── Constants ────────────────────────────────────────────────────────────────

const DRAWER_WIDTH = 240;
const MINI_WIDTH = 64;
const APPBAR_HEIGHT = 56;

// ─── Nav Types ────────────────────────────────────────────────────────────────

interface NavItem {
  label: string;
  path: string;
  icon: ReactNode;
  roles?: UserRole[];
}

interface NavSection {
  sectionLabel: string;
  items: NavItem[];
}

// ─── Navigation Config ────────────────────────────────────────────────────────

const NAV_SECTIONS: NavSection[] = [
  {
    sectionLabel: 'OVERVIEW',
    items: [
      { label: 'Dashboard', path: '/dashboard', icon: <DashboardOutlined fontSize="small" /> },
    ],
  },
  {
    sectionLabel: 'MASTER DATA',
    items: [
      { label: 'Companies', path: '/master/companies', icon: <BusinessOutlined fontSize="small" /> },
      { label: 'Clients', path: '/master/clients', icon: <PeopleOutlined fontSize="small" /> },
      { label: 'Consultants', path: '/master/consultants', icon: <PersonOutlined fontSize="small" /> },
      { label: 'Assignments', path: '/master/assignments', icon: <AssignmentOutlined fontSize="small" /> },
    ],
  },
  {
    sectionLabel: 'OPERATIONS',
    items: [
      { label: 'Timesheets', path: '/timesheets', icon: <TimerOutlined fontSize="small" /> },
      { label: 'Invoices', path: '/invoices', icon: <ReceiptLongOutlined fontSize="small" /> },
      { label: 'Payments', path: '/payments', icon: <PaymentsOutlined fontSize="small" /> },
    ],
  },
  {
    sectionLabel: 'INSIGHTS',
    items: [
      { label: 'Reports', path: '/reports', icon: <BarChartOutlined fontSize="small" /> },
      { label: 'Audit Logs', path: '/audit', icon: <SecurityOutlined fontSize="small" /> },
    ],
  },
  {
    sectionLabel: 'ADMIN',
    items: [
      { label: 'Users', path: '/users', icon: <PeopleOutlined fontSize="small" /> },
      { label: 'Settings', path: '/settings', icon: <SettingsOutlined fontSize="small" /> },
    ],
  },
];

// ─── Notification Types ───────────────────────────────────────────────────────

type NotifSeverity = 'info' | 'success' | 'warning' | 'error';

interface Notification {
  id: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
  severity: NotifSeverity;
}

const NOTIF_ICON: Record<NotifSeverity, ReactNode> = {
  info: <InfoOutlined fontSize="small" color="info" />,
  success: <CheckCircleOutlined fontSize="small" color="success" />,
  warning: <WarningAmberOutlined fontSize="small" color="warning" />,
  error: <WarningAmberOutlined fontSize="small" color="error" />,
};

// ─── Breadcrumb Helper ────────────────────────────────────────────────────────

const PATH_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  master: 'Master Data',
  companies: 'Companies',
  clients: 'Clients',
  consultants: 'Consultants',
  assignments: 'Assignments',
  timesheets: 'Timesheets',
  invoices: 'Invoices',
  payments: 'Payments',
  reports: 'Reports',
  audit: 'Audit Logs',
  users: 'Users',
  settings: 'Settings',
  new: 'New',
  edit: 'Edit',
};

function useBreadcrumbs() {
  const location = useLocation();
  const segments = location.pathname.split('/').filter(Boolean);
  return segments.map((seg, idx) => ({
    label: PATH_LABELS[seg] ?? seg.replace(/-/g, ' '),
    path: '/' + segments.slice(0, idx + 1).join('/'),
    isLast: idx === segments.length - 1,
  }));
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function NavItemRow({ item, mini }: { item: NavItem; mini: boolean }) {
  const theme = useTheme();
  const location = useLocation();
  
  const isActive = item.path === '/dashboard'
    ? location.pathname === '/dashboard'
    : location.pathname.startsWith(item.path);

  const content = (
    <ListItemButton
      component={NavLink}
      to={item.path}
      aria-current={isActive ? 'page' : undefined}
      sx={{
        borderRadius: 1.5,
        minHeight: 38,
        px: mini ? 1.5 : 2,
        justifyContent: mini ? 'center' : 'flex-start',
        color: isActive ? '#ffffff' : theme.palette.text.secondary,
        fontWeight: isActive ? 600 : 500,
        backgroundColor: isActive ? '#18181b' : 'transparent',
        mb: 0.5,
        '&:hover': {
          backgroundColor: isActive ? '#18181b' : alpha(theme.palette.action.hover, 0.06),
          color: isActive ? '#ffffff' : theme.palette.text.primary,
        },
      }}
    >
      <ListItemIcon
        sx={{
          minWidth: mini ? 0 : 32,
          color: 'inherit',
          justifyContent: 'center',
        }}
      >
        {item.icon}
      </ListItemIcon>
      {!mini && (
        <ListItemText
          primary={item.label}
          primaryTypographyProps={{ fontSize: '0.8125rem', fontWeight: 'inherit' }}
        />
      )}
    </ListItemButton>
  );

  if (mini) {
    return (
      <Tooltip title={item.label} placement="right">
        <ListItem disablePadding sx={{ display: 'block' }}>
          {content}
        </ListItem>
      </Tooltip>
    );
  }

  return (
    <ListItem disablePadding sx={{ display: 'block' }}>
      {content}
    </ListItem>
  );
}

// ─── Notification Popover ─────────────────────────────────────────────────────

interface NotifPopoverProps {
  anchorEl: HTMLElement | null;
  notifications: Notification[];
  onClose: () => void;
  onMarkAllRead: () => void;
}

function NotifPopover({ anchorEl, notifications, onClose, onMarkAllRead }: NotifPopoverProps) {
  const theme = useTheme();

  return (
    <Popover
      open={Boolean(anchorEl)}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      slotProps={{
        paper: {
          sx: {
            width: 360,
            maxHeight: 480,
            mt: 1,
            boxShadow: shadows.lg,
            border: `1px solid ${theme.palette.divider}`,
            display: 'flex',
            flexDirection: 'column',
          },
        },
      }}
    >
      <Box
        sx={{
          px: 2,
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Typography variant="subtitle2">Notifications</Typography>
        <Link
          component="button"
          variant="caption"
          onClick={onMarkAllRead}
          underline="hover"
          sx={{ color: theme.palette.primary.main }}
        >
          Mark all read
        </Link>
      </Box>

      <Box sx={{ overflowY: 'auto', flex: 1 }}>
        {notifications.length === 0 ? (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              You're all caught up
            </Typography>
          </Box>
        ) : (
          notifications.map((n, idx) => (
            <Box key={n.id}>
              <Box
                sx={{
                  px: 2,
                  py: 1.5,
                  display: 'flex',
                  gap: 1.5,
                  alignItems: 'flex-start',
                  backgroundColor: n.read
                    ? 'transparent'
                    : alpha(theme.palette.primary.main, 0.04),
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.action.hover, 0.5),
                  },
                }}
              >
                <Box sx={{ pt: 0.25 }}>{NOTIF_ICON[n.severity]}</Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    variant="body2"
                    fontWeight={n.read ? 400 : 600}
                    sx={{ lineHeight: 1.4 }}
                  >
                    {n.title}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block', mt: 0.25 }}
                  >
                    {n.body}
                  </Typography>
                  <Typography variant="caption" color="text.disabled" sx={{ mt: 0.5, display: 'block' }}>
                    {n.time}
                  </Typography>
                </Box>
                {!n.read && (
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: theme.palette.primary.main,
                      mt: 0.75,
                      flexShrink: 0,
                    }}
                  />
                )}
              </Box>
              {idx < notifications.length - 1 && <Divider />}
            </Box>
          ))
        )}
      </Box>
    </Popover>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

interface SidebarProps {
  mini: boolean;
  role: UserRole;
}

function Sidebar({ mini, role }: SidebarProps) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: theme.palette.background.paper,
        overflowX: 'hidden',
      }}
    >
      {/* Logo */}
      <Box
        sx={{
          height: APPBAR_HEIGHT,
          display: 'flex',
          alignItems: 'center',
          px: mini ? 1.5 : 2,
          gap: 1.5,
          borderBottom: `1px solid ${theme.palette.divider}`,
          flexShrink: 0,
        }}
      >
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: 1,
            backgroundColor: '#18181b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Typography
            variant="caption"
            fontWeight={800}
            sx={{ color: '#fff', fontSize: '0.75rem', letterSpacing: '0.05em' }}
          >
            IS
          </Typography>
        </Box>
        {!mini && (
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="subtitle2"
              fontWeight={700}
              noWrap
              sx={{ color: theme.palette.text.primary, lineHeight: 1.2 }}
            >
              Infoservices
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              noWrap
              sx={{ fontSize: '0.6875rem', display: 'block', mt: 0.25 }}
            >
              Invoice Platform
            </Typography>
          </Box>
        )}
      </Box>

      {/* Nav */}
      <Box
        component="nav"
        aria-label="Main navigation"
        sx={{ flex: 1, overflowY: 'auto', px: mini ? 0.5 : 1, py: 2 }}
      >
        {NAV_SECTIONS.map((section) => {
          const visibleItems = section.items.filter(
            (item) => !item.roles || item.roles.includes(role)
          );
          if (visibleItems.length === 0) return null;

          return (
            <Box key={section.sectionLabel} sx={{ mb: 2 }}>
              {!mini && (
                <Typography
                  variant="overline"
                  sx={{
                    px: 2,
                    py: 0.5,
                    display: 'block',
                    color: theme.palette.text.secondary,
                    fontWeight: 600,
                    fontSize: '0.6875rem',
                    letterSpacing: '0.08em',
                    opacity: 0.75,
                  }}
                >
                  {section.sectionLabel}
                </Typography>
              )}
              <List disablePadding>
                {visibleItems.map((item) => (
                  <NavItemRow key={item.path} item={item} mini={mini} />
                ))}
              </List>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

export interface ConsoleLayoutProps {
  user: CurrentUser;
  notifications?: Notification[];
  onLogout?: () => void;
  onSwitchRole?: (role: UserRole) => void;
}

// ─── ConsoleLayout ────────────────────────────────────────────────────────────

export function ConsoleLayout({
  user,
  notifications: notifProp = [],
  onLogout,
  onSwitchRole,
}: ConsoleLayoutProps) {
  const theme = useTheme();
  const navigate = useNavigate();
  const breadcrumbs = useBreadcrumbs();
  const { mode, toggleMode } = useThemeMode();

  // ── Sidebar state ─────────────────────────────────────────────────────────
  const [mini, setMini] = useState(false);

  // ── Notification state ────────────────────────────────────────────────────
  const [notifications, setNotifications] = useState<Notification[]>(notifProp);
  const [notifAnchor, setNotifAnchor] = useState<HTMLElement | null>(null);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  // ── User menu state ───────────────────────────────────────────────────────
  const [userMenuAnchor, setUserMenuAnchor] = useState<HTMLElement | null>(null);

  // ── Global search (Cmd+K) ─────────────────────────────────────────────────
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: globalThis.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const handleSearchKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      searchRef.current?.blur();
    }
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* ── Sidebar ────────────────────────────────────────────────────────── */}
      <Drawer
        variant="permanent"
        aria-label="Navigation sidebar"
        sx={{
          width: mini ? MINI_WIDTH : DRAWER_WIDTH,
          flexShrink: 0,
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: mini
              ? theme.transitions.duration.leavingScreen
              : theme.transitions.duration.enteringScreen,
          }),
          '& .MuiDrawer-paper': {
            width: mini ? MINI_WIDTH : DRAWER_WIDTH,
            overflowX: 'hidden',
            border: 'none',
            borderRight: `1px solid ${theme.palette.divider}`,
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: mini
                ? theme.transitions.duration.leavingScreen
                : theme.transitions.duration.enteringScreen,
            }),
          },
        }}
      >
        <Sidebar
          mini={mini}
          role={user.role}
        />
      </Drawer>

      {/* ── Main Column ────────────────────────────────────────────────────── */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          height: '100vh',
          overflow: 'hidden',
        }}
      >
        {/* ── Top App Bar ─────────────────────────────────────────────────── */}
        <AppBar
          position="static"
          elevation={0}
          sx={{
            backgroundColor: theme.palette.background.paper,
            borderBottom: `1px solid ${theme.palette.divider}`,
            color: theme.palette.text.primary,
            height: APPBAR_HEIGHT,
            zIndex: theme.zIndex.appBar,
          }}
        >
          <Toolbar
            variant="dense"
            sx={{ height: APPBAR_HEIGHT, minHeight: APPBAR_HEIGHT, px: 2, gap: 1 }}
          >
            {/* Collapse toggle */}
            <Tooltip title={mini ? 'Expand sidebar' : 'Collapse sidebar'}>
              <IconButton
                onClick={() => setMini((v) => !v)}
                size="small"
                aria-label={mini ? 'Expand sidebar' : 'Collapse sidebar'}
                sx={{ color: theme.palette.text.secondary }}
              >
                {mini ? <MenuIcon fontSize="small" /> : <MenuOpenIcon fontSize="small" />}
              </IconButton>
            </Tooltip>

            {/* Global search */}
            <Paper
              component="form"
              role="search"
              aria-label="Global search"
              elevation={0}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                px: 1.5,
                height: 36,
                width: 280,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 1.5,
                backgroundColor: alpha(theme.palette.text.primary, 0.03),
                '&:focus-within': {
                  borderColor: theme.palette.primary.main,
                  boxShadow: shadows.primaryGlow,
                },
              }}
            >
              <SearchIcon sx={{ fontSize: 16, color: theme.palette.text.disabled }} />
              <InputBase
                inputRef={searchRef}
                placeholder="Search…"
                inputProps={{ 'aria-label': 'Global search', style: { fontSize: '0.8125rem' } }}
                onKeyDown={handleSearchKey}
                sx={{ flex: 1, fontSize: '0.8125rem' }}
              />
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.25,
                  px: 0.75,
                  py: 0.25,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 0.75,
                  color: theme.palette.text.disabled,
                }}
              >
                <CmdIcon sx={{ fontSize: 11 }} />
                <Typography sx={{ fontSize: '0.6875rem', lineHeight: 1 }}>K</Typography>
              </Box>
            </Paper>

            <Box sx={{ flex: 1 }} />

            {/* Theme Toggle */}
            <Tooltip title={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
              <IconButton
                size="small"
                onClick={toggleMode}
                sx={{ color: theme.palette.text.secondary }}
              >
                {mode === 'dark' ? <LightModeOutlined fontSize="small" /> : <DarkModeOutlined fontSize="small" />}
              </IconButton>
            </Tooltip>

            {/* Notification bell */}
            <Tooltip title="Notifications">
              <IconButton
                size="small"
                aria-label={`Notifications — ${unreadCount} unread`}
                aria-haspopup="true"
                aria-expanded={Boolean(notifAnchor)}
                onClick={(e: MouseEvent<HTMLElement>) => setNotifAnchor(e.currentTarget)}
                sx={{ color: theme.palette.text.secondary }}
              >
                <Badge badgeContent={unreadCount} color="error" max={99}>
                  <BellIcon fontSize="small" />
                </Badge>
              </IconButton>
            </Tooltip>

            <Divider orientation="vertical" flexItem sx={{ mx: 0.5, my: 1 }} />

            {/* User avatar + menu */}
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

        {/* ── Breadcrumbs ─────────────────────────────────────────────────── */}
        <Box
          aria-label="Breadcrumb"
          sx={{
            px: 3,
            py: 1,
            borderBottom: `1px solid ${theme.palette.divider}`,
            backgroundColor: theme.palette.background.paper,
            flexShrink: 0,
          }}
        >
          <Breadcrumbs
            separator={<NavigateNext sx={{ fontSize: 14 }} />}
            aria-label="breadcrumb"
            sx={{ '& .MuiBreadcrumbs-ol': { flexWrap: 'nowrap' } }}
          >
            {breadcrumbs.map((crumb) =>
              crumb.isLast ? (
                <Typography
                  key={crumb.path}
                  variant="caption"
                  fontWeight={600}
                  color="text.primary"
                  noWrap
                >
                  {crumb.label}
                </Typography>
              ) : (
                <Link
                  key={crumb.path}
                  component="button"
                  variant="caption"
                  underline="hover"
                  color="text.secondary"
                  onClick={() => navigate(crumb.path)}
                  sx={{ fontWeight: 400 }}
                >
                  {crumb.label}
                </Link>
              ),
            )}
          </Breadcrumbs>
        </Box>

        {/* ── Page content ─────────────────────────────────────────────────── */}
        <Box
          component="main"
          id="main-content"
          tabIndex={-1}
          sx={{
            flex: 1,
            overflowY: 'auto',
            backgroundColor: theme.palette.background.default,
            p: 3,
          }}
        >
          <Outlet />
        </Box>
      </Box>

      {/* ── Notification Popover ───────────────────────────────────────────── */}
      <NotifPopover
        anchorEl={notifAnchor}
        notifications={notifications}
        onClose={() => setNotifAnchor(null)}
        onMarkAllRead={markAllRead}
      />

      {/* ── User Menu ─────────────────────────────────────────────────────── */}
      <Menu
        anchorEl={userMenuAnchor}
        open={Boolean(userMenuAnchor)}
        onClose={() => setUserMenuAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { width: 220, mt: 1 } } }}
      >
        {/* Identity block */}
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
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
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
          <MenuItem
            onClick={() => setUserMenuAnchor(null)}
            dense
          >
            <ListItemIcon><SwapHorizOutlined fontSize="small" /></ListItemIcon>
            <ListItemText primaryTypographyProps={{ fontSize: '0.875rem' }}>Switch Role</ListItemText>
          </MenuItem>
        )}
        <Divider />
        <MenuItem
          onClick={() => { onLogout?.(); setUserMenuAnchor(null); }}
          dense
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

export default ConsoleLayout;
