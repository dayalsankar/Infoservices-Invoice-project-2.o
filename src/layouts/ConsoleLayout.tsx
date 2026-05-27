// ─── ConsoleLayout ────────────────────────────────────────────────────────────
// Dense operator shell for Finance Admin, Super Admin, HR, Auditor, Executive.
// Permanent 240px sidebar (collapsible to 64px mini-variant) + sticky top bar.

import {
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
  ExpandLess,
  ExpandMore,
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
  FiberManualRecord,
  AccountCircleOutlined,
  SwapHorizOutlined,
  LogoutOutlined,
  CheckCircleOutline,
  ErrorOutline,
  InfoOutlined,
} from '@mui/icons-material';
import type { UserRole, CurrentUser } from '../types/auth';
import { ROLE_LABELS } from '../types/auth';
import { colors, shadows } from '../theme/tokens';

// ─── Constants ────────────────────────────────────────────────────────────────

const DRAWER_WIDTH = 240;
const MINI_WIDTH = 64;
const APPBAR_HEIGHT = 56;

// ─── Nav Types ────────────────────────────────────────────────────────────────

interface NavItem {
  label: string;
  path: string;
  icon: ReactNode;
}

interface NavGroup {
  groupLabel: string;
  icon: ReactNode;
  roles?: UserRole[]; // undefined = visible to all console roles
  items: NavItem[];
}

// ─── Navigation Config ────────────────────────────────────────────────────────

const NAV_GROUPS: NavGroup[] = [
  {
    groupLabel: 'Dashboard',
    icon: <DashboardOutlined fontSize="small" />,
    items: [{ label: 'Overview', path: '/dashboard', icon: <DashboardOutlined fontSize="small" /> }],
  },
  {
    groupLabel: 'Master Data',
    icon: <BusinessOutlined fontSize="small" />,
    roles: ['super_admin', 'finance_admin', 'hr_admin'],
    items: [
      { label: 'Companies', path: '/master/companies', icon: <BusinessOutlined fontSize="small" /> },
      { label: 'Clients', path: '/master/clients', icon: <PeopleOutlined fontSize="small" /> },
      { label: 'Consultants', path: '/master/consultants', icon: <PersonOutlined fontSize="small" /> },
      { label: 'Assignments', path: '/master/assignments', icon: <AssignmentOutlined fontSize="small" /> },
    ],
  },
  {
    groupLabel: 'Timesheets',
    icon: <TimerOutlined fontSize="small" />,
    items: [
      { label: 'All Timesheets', path: '/timesheets', icon: <TimerOutlined fontSize="small" /> },
    ],
  },
  {
    groupLabel: 'Invoices',
    icon: <ReceiptLongOutlined fontSize="small" />,
    items: [
      { label: 'All Invoices', path: '/invoices', icon: <ReceiptLongOutlined fontSize="small" /> },
    ],
  },
  {
    groupLabel: 'Payments',
    icon: <PaymentsOutlined fontSize="small" />,
    roles: ['super_admin', 'finance_admin'],
    items: [
      { label: 'Payment Records', path: '/payments', icon: <PaymentsOutlined fontSize="small" /> },
    ],
  },
  {
    groupLabel: 'Reports',
    icon: <BarChartOutlined fontSize="small" />,
    items: [
      { label: 'Analytics', path: '/reports', icon: <BarChartOutlined fontSize="small" /> },
    ],
  },
  {
    groupLabel: 'Audit',
    icon: <SecurityOutlined fontSize="small" />,
    roles: ['super_admin', 'auditor'],
    items: [
      { label: 'Audit Logs', path: '/audit', icon: <SecurityOutlined fontSize="small" /> },
    ],
  },
  {
    groupLabel: 'Settings',
    icon: <SettingsOutlined fontSize="small" />,
    roles: ['super_admin'],
    items: [
      { label: 'System Settings', path: '/settings', icon: <SettingsOutlined fontSize="small" /> },
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
  success: <CheckCircleOutline fontSize="small" color="success" />,
  warning: <ErrorOutline fontSize="small" color="warning" />,
  error: <ErrorOutline fontSize="small" color="error" />,
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

interface NavGroupRowProps {
  group: NavGroup;
  mini: boolean;
  role: UserRole;
  open: boolean;
  onToggle: () => void;
}

function NavGroupRow({ group, mini, role, open, onToggle }: NavGroupRowProps) {
  const theme = useTheme();
  const location = useLocation();

  const isGroupVisible =
    !group.roles || group.roles.includes(role);
  if (!isGroupVisible) return null;

  const isGroupActive = group.items.some((item) =>
    location.pathname.startsWith(item.path),
  );

  return (
    <>
      <Tooltip title={mini ? group.groupLabel : ''} placement="right">
        <ListItemButton
          onClick={onToggle}
          aria-expanded={open}
          aria-label={`${group.groupLabel} menu group`}
          sx={{
            mx: 1,
            borderRadius: 1.5,
            minHeight: 40,
            px: mini ? 1.5 : 1.5,
            justifyContent: mini ? 'center' : 'flex-start',
            color: isGroupActive
              ? theme.palette.primary.main
              : theme.palette.text.secondary,
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.06),
              color: theme.palette.primary.main,
            },
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: mini ? 0 : 36,
              color: 'inherit',
              justifyContent: 'center',
            }}
          >
            {group.icon}
          </ListItemIcon>
          {!mini && (
            <>
              <ListItemText
                primary={group.groupLabel}
                primaryTypographyProps={{ fontSize: '0.8125rem', fontWeight: 500 }}
              />
              {open ? (
                <ExpandLess sx={{ fontSize: 16 }} />
              ) : (
                <ExpandMore sx={{ fontSize: 16 }} />
              )}
            </>
          )}
        </ListItemButton>
      </Tooltip>

      {!mini && (
        <Collapse in={open} timeout="auto" unmountOnExit>
          <List disablePadding>
            {group.items.map((item) => (
              <NavItemRow key={item.path} item={item} />
            ))}
          </List>
        </Collapse>
      )}
    </>
  );
}

function NavItemRow({ item }: { item: NavItem }) {
  const theme = useTheme();
  const location = useLocation();
  const isActive = location.pathname.startsWith(item.path);

  return (
    <ListItem disablePadding sx={{ pl: 2 }}>
      <ListItemButton
        component={NavLink}
        to={item.path}
        aria-current={isActive ? 'page' : undefined}
        sx={{
          mx: 1,
          borderRadius: 1.5,
          minHeight: 36,
          px: 1.5,
          position: 'relative',
          color: isActive ? theme.palette.primary.main : theme.palette.text.secondary,
          fontWeight: isActive ? 600 : 400,
          backgroundColor: isActive
            ? alpha(theme.palette.primary.main, 0.08)
            : 'transparent',
          borderLeft: isActive
            ? `3px solid ${theme.palette.primary.main}`
            : '3px solid transparent',
          '&:hover': {
            backgroundColor: alpha(theme.palette.primary.main, 0.06),
            color: theme.palette.primary.main,
          },
        }}
      >
        <ListItemIcon sx={{ minWidth: 28, color: 'inherit' }}>
          {item.icon}
        </ListItemIcon>
        <ListItemText
          primary={item.label}
          primaryTypographyProps={{ fontSize: '0.8125rem', fontWeight: 'inherit' }}
        />
      </ListItemButton>
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
                  <FiberManualRecord
                    sx={{ fontSize: 8, color: theme.palette.primary.main, mt: 0.5 }}
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
  openGroups: Record<string, boolean>;
  onToggleGroup: (label: string) => void;
}

function Sidebar({ mini, role, openGroups, onToggleGroup }: SidebarProps) {
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
          gap: 1,
          borderBottom: `1px solid ${theme.palette.divider}`,
          flexShrink: 0,
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
            variant="caption"
            fontWeight={700}
            sx={{ color: '#fff', fontSize: '0.625rem', letterSpacing: '0.05em' }}
          >
            IS
          </Typography>
        </Box>
        {!mini && (
          <Typography
            variant="subtitle2"
            fontWeight={700}
            noWrap
            sx={{ color: theme.palette.text.primary }}
          >
            Infoservices
          </Typography>
        )}
      </Box>

      {/* Nav */}
      <Box
        component="nav"
        aria-label="Main navigation"
        sx={{ flex: 1, overflowY: 'auto', py: 1 }}
      >
        <List disablePadding>
          {NAV_GROUPS.map((group) => (
            <NavGroupRow
              key={group.groupLabel}
              group={group}
              mini={mini}
              role={role}
              open={openGroups[group.groupLabel] ?? false}
              onToggle={() => onToggleGroup(group.groupLabel)}
            />
          ))}
        </List>
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

  // ── Sidebar state ─────────────────────────────────────────────────────────
  const [mini, setMini] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(NAV_GROUPS.map((g) => [g.groupLabel, true])),
  );

  const toggleGroup = useCallback((label: string) => {
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  }, []);

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
          openGroups={openGroups}
          onToggleGroup={toggleGroup}
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
