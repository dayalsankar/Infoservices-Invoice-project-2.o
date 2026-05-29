import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Box, Typography, Card, CardContent, Grid, Chip, Stack, Button, alpha, useTheme } from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  ReceiptLongOutlined,
  PaymentsOutlined,
  TimerOutlined,
  WarningAmberOutlined,
  BusinessOutlined,
  PeopleOutlined,
  PersonOutlined,
  AssignmentOutlined,
  BarChartOutlined,
  SecurityOutlined,
  SettingsOutlined,
  Add,
  FileDownloadOutlined,
} from '@mui/icons-material';
import { ConsoleLayout, AuthLayout } from './layouts';
import type { CurrentUser } from './types/auth';
import CompaniesPage    from './pages/CompaniesPage';
import ClientsPage      from './pages/ClientsPage';
import ConsultantsPage  from './pages/ConsultantsPage';
import AssignmentsPage  from './pages/AssignmentsPage';

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_USER: CurrentUser = {
  id: 'usr_001',
  name: 'Dayal Sankar',
  email: 'dayal@infoservices.com',
  role: 'finance_admin',
  availableRoles: ['finance_admin', 'super_admin'],
};

const MOCK_NOTIFICATIONS = [
  {
    id: 'n1',
    title: 'Invoice #INV-2024-089 approved',
    body: 'Approved by Rajesh Kumar · ₹4,25,000',
    time: '2 min ago',
    read: false,
    severity: 'success' as const,
  },
  {
    id: 'n2',
    title: 'Payment overdue — Acme Corp',
    body: 'Invoice #INV-2024-071 is 14 days overdue · ₹2,80,000',
    time: '1 hour ago',
    read: false,
    severity: 'warning' as const,
  },
  {
    id: 'n3',
    title: 'New timesheet submitted',
    body: 'Priya Sharma submitted week ending 24 May 2025',
    time: '3 hours ago',
    read: true,
    severity: 'info' as const,
  },
];

// ─── Shared placeholder ───────────────────────────────────────────────────────

function PlaceholderPage({
  title,
  icon,
  description,
}: {
  title: string;
  icon: React.ReactNode;
  description: string;
}) {
  const theme = useTheme();
  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', textAlign: 'center', pt: 8 }}>
      <Box
        sx={{
          width: 56,
          height: 56,
          borderRadius: 2,
          bgcolor: alpha(theme.palette.primary.main, 0.07),
          color: theme.palette.text.secondary,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mx: 'auto',
          mb: 2.5,
        }}
      >
        {icon}
      </Box>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {description}
      </Typography>
      <Stack direction="row" spacing={1.5} justifyContent="center">
        <Button variant="contained" size="small" startIcon={<Add />}>
          Add new
        </Button>
        <Button variant="outlined" size="small" startIcon={<FileDownloadOutlined />} color="inherit">
          Export
        </Button>
      </Stack>
    </Box>
  );
}

// ─── KPI card ─────────────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  subtext,
  trend,
  color = 'primary',
}: {
  label: string;
  value: string;
  subtext: string;
  trend: { dir: 'up' | 'down'; pct: string; label: string };
  color?: 'primary' | 'success' | 'error' | 'warning';
}) {
  const theme = useTheme();
  const up = trend.dir === 'up';
  const trendColor = up ? theme.palette.success.main : theme.palette.error.main;

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="overline" color="text.secondary" display="block" sx={{ mb: 1 }}>
          {label}
        </Typography>
        <Typography variant="h4" fontWeight={700} letterSpacing="-0.02em" fontFamily="monospace" sx={{ mb: 0.75 }}>
          {value}
        </Typography>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Chip
            size="small"
            icon={
              up
                ? <TrendingUp sx={{ fontSize: '13px !important', color: `${trendColor} !important` }} />
                : <TrendingDown sx={{ fontSize: '13px !important', color: `${trendColor} !important` }} />
            }
            label={`${up ? '+' : ''}${trend.pct}%`}
            sx={{
              bgcolor:    alpha(trendColor, 0.12),
              color:      trendColor,
              fontWeight: 700,
              fontSize:   '0.7rem',
              height:     20,
            }}
          />
          <Typography variant="caption" color="text.disabled">{trend.label}</Typography>
        </Stack>
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
          {subtext}
        </Typography>
      </CardContent>
    </Card>
  );
}

// ─── Dashboard page ───────────────────────────────────────────────────────────

function DashboardPage() {
  return (
    <Box>
      {/* Header */}
      <Stack direction="row" alignItems="flex-start" justifyContent="space-between" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700} sx={{ mb: 0.25 }}>
            Finance Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Overview · May 2025
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" size="small" startIcon={<FileDownloadOutlined />} color="inherit">
            Export
          </Button>
          <Button variant="contained" size="small" startIcon={<Add />}>
            New Invoice
          </Button>
        </Stack>
      </Stack>

      {/* KPI row */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          {
            label: 'Total Revenue',
            value: '₹48,72,500',
            subtext: '38 invoices paid this month',
            trend: { dir: 'up' as const, pct: '12.4', label: 'vs last month' },
          },
          {
            label: 'Outstanding',
            value: '₹14,30,000',
            subtext: '11 invoices pending payment',
            trend: { dir: 'down' as const, pct: '3.1', label: 'vs last month' },
            color: 'warning' as const,
          },
          {
            label: 'Avg Days to Pay',
            value: '22 days',
            subtext: 'Down from 26 days last month',
            trend: { dir: 'up' as const, pct: '15.4', label: 'improvement' },
            color: 'success' as const,
          },
          {
            label: 'Active Invoices',
            value: '54',
            subtext: '18 sent · 12 approved · 24 pending',
            trend: { dir: 'up' as const, pct: '8.2', label: 'vs last month' },
          },
        ].map((kpi) => (
          <Grid item xs={12} sm={6} lg={3} key={kpi.label}>
            <KpiCard {...kpi} />
          </Grid>
        ))}
      </Grid>

      {/* Bottom section */}
      <Grid container spacing={2}>
        {/* Overdue invoices */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                <Typography variant="subtitle2">Overdue Invoices</Typography>
                <Chip label="3 overdue" size="small" color="error" variant="outlined" sx={{ fontSize: '0.6875rem', height: 20 }} />
              </Stack>
              <Stack spacing={1.5}>
                {[
                  { client: 'Acme Technologies', inv: 'INV-2024-071', amount: '₹2,80,000', days: 14 },
                  { client: 'GlobalTech Solutions', inv: 'INV-2024-063', amount: '₹1,95,000', days: 22 },
                  { client: 'NovaSystems India', inv: 'INV-2024-058', amount: '₹4,55,000', days: 31 },
                ].map((row) => (
                  <Stack key={row.inv} direction="row" alignItems="center" justifyContent="space-between" sx={{ py: 0.75, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="body2" fontWeight={600} noWrap>{row.client}</Typography>
                      <Typography variant="caption" color="text.secondary">{row.inv}</Typography>
                    </Box>
                    <Stack alignItems="flex-end">
                      <Typography variant="body2" fontFamily="monospace" fontWeight={600}>{row.amount}</Typography>
                      <Chip label={`${row.days}d overdue`} size="small" color={row.days >= 30 ? 'error' : 'warning'} sx={{ height: 18, fontSize: '0.6rem' }} />
                    </Stack>
                  </Stack>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent activity */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" sx={{ mb: 2 }}>Recent Activity</Typography>
              <Stack spacing={1.5}>
                {[
                  { label: 'INV-2024-089 approved by Rajesh Kumar', time: '2 min ago', dot: 'success.main' },
                  { label: 'Payment ₹1,20,000 received from Zenith Corp', time: '1 hour ago', dot: 'success.main' },
                  { label: 'Timesheet submitted by Priya Sharma', time: '3 hours ago', dot: 'info.main' },
                  { label: 'INV-2024-085 sent to client', time: 'Yesterday', dot: 'primary.main' },
                  { label: 'Credit note issued for INV-2024-070', time: '2 days ago', dot: 'warning.main' },
                ].map((item, i) => (
                  <Stack key={i} direction="row" spacing={1.5} alignItems="flex-start">
                    <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: item.dot, mt: 0.75, flexShrink: 0 }} />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" noWrap>{item.label}</Typography>
                      <Typography variant="caption" color="text.disabled">{item.time}</Typography>
                    </Box>
                  </Stack>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

// ─── Simple placeholder pages ─────────────────────────────────────────────────

const pages = {
  Companies: { icon: <BusinessOutlined />, desc: 'Manage company master records, GST details, and billing configurations.' },
  Clients:   { icon: <PeopleOutlined />,   desc: 'View and manage client profiles, contacts, and billing agreements.' },
  Consultants: { icon: <PersonOutlined />, desc: 'Manage consultant profiles, rates, and assignment history.' },
  Assignments: { icon: <AssignmentOutlined />, desc: 'Track consultant-client assignments, SOWs, and billing rates.' },
  Timesheets: { icon: <TimerOutlined />,   desc: 'Review, approve, and export timesheets across all consultants.' },
  Invoices:   { icon: <ReceiptLongOutlined />, desc: 'Create, send, and manage GST-compliant invoices across all clients.' },
  Payments:   { icon: <PaymentsOutlined />, desc: 'Track incoming payments, reconcile bank statements, and manage credit notes.' },
  Reports:    { icon: <BarChartOutlined />, desc: 'Revenue analytics, aging reports, and GST filing summaries.' },
  Audit:      { icon: <SecurityOutlined />, desc: 'Full audit trail of all actions across the platform.' },
  Settings:   { icon: <SettingsOutlined />, desc: 'Configure system settings, approval workflows, and integrations.' },
  Overdue:    { icon: <WarningAmberOutlined />, desc: 'Invoices past their due date requiring immediate action.' },
};

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Console routes — dense operator layout */}
        <Route
          path="/"
          element={
            <ConsoleLayout
              user={MOCK_USER}
              notifications={MOCK_NOTIFICATIONS}
              onLogout={() => console.log('logout')}
            />
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard"           element={<DashboardPage />} />
          <Route path="master/companies"    element={<CompaniesPage />} />
          <Route path="master/clients"      element={<ClientsPage />} />
          <Route path="master/consultants"  element={<ConsultantsPage />} />
          <Route path="master/assignments"  element={<AssignmentsPage />} />
          <Route path="timesheets"          element={<PlaceholderPage title="Timesheets"  icon={pages.Timesheets.icon}  description={pages.Timesheets.desc}  />} />
          <Route path="invoices"            element={<PlaceholderPage title="Invoices"    icon={pages.Invoices.icon}    description={pages.Invoices.desc}    />} />
          <Route path="payments"            element={<PlaceholderPage title="Payments"    icon={pages.Payments.icon}    description={pages.Payments.desc}    />} />
          <Route path="reports"             element={<PlaceholderPage title="Reports"     icon={pages.Reports.icon}     description={pages.Reports.desc}     />} />
          <Route path="audit"               element={<PlaceholderPage title="Audit Logs"  icon={pages.Audit.icon}       description={pages.Audit.desc}       />} />
          <Route path="settings"            element={<PlaceholderPage title="Settings"    icon={pages.Settings.icon}    description={pages.Settings.desc}    />} />
        </Route>

        {/* Auth routes — centered card layout */}
        <Route path="/auth" element={<AuthLayout />}>
          <Route path="login" element={
            <Box sx={{ textAlign: 'center', pt: 2 }}>
              <Typography variant="h5" fontWeight={700} gutterBottom>Sign in</Typography>
              <Typography variant="body2" color="text.secondary">
                Auth pages will be wired up here.
              </Typography>
            </Box>
          } />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
