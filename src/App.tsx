import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Box, Typography, Card, CardContent, Grid, Chip, Stack, Button, alpha, useTheme, IconButton, Collapse } from '@mui/material';
import React, { useState } from 'react';
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
  CalendarTodayOutlined,
  CloseOutlined,
  CheckCircleOutlined,
  ExpandMoreOutlined,
  ExpandLessOutlined,
  MoreVertOutlined,
  HelpOutlineOutlined,
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

interface ActiveChipData {
  label: string;
  color: string;
  border: string;
}

function KpiCard({
  label,
  value,
  trendPct,
  trendLabel,
  isUp,
  isGood = isUp,
  icon,
  sparklinePathLine,
  sparklinePathArea,
  overdueText,
  activeChips,
}: {
  label: string;
  value: string;
  trendPct: string;
  trendLabel: string;
  isUp: boolean;
  isGood?: boolean;
  icon: React.ReactNode;
  sparklinePathLine: string;
  sparklinePathArea: string;
  overdueText?: string;
  activeChips?: ActiveChipData[];
}) {
  const theme = useTheme();
  const up = isUp;
  const trendColor = isGood ? '#10b981' : '#ef4444';

  return (
    <Card sx={{ height: '100%', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: `1px solid ${theme.palette.divider}`, boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)', borderRadius: 2 }}>
      <CardContent sx={{ pb: '4px !important', flexGrow: 1, px: 2.5, pt: 2.5 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1.5 }}>
          <Box>
            <Typography
              variant="caption"
              fontWeight={600}
              sx={{
                color: 'text.secondary',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                fontSize: '0.6875rem',
              }}
            >
              {label}
            </Typography>
            <Typography variant="h4" fontWeight={800} sx={{ mt: 0.5, letterSpacing: '-0.02em', fontSize: '1.625rem' }}>
              {value}
            </Typography>
          </Box>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 1.5,
              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'text.secondary',
            }}
          >
            {icon}
          </Box>
        </Stack>

        <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: overdueText || activeChips ? 1.5 : 0 }}>
          <Chip
            size="small"
            label={`${up ? '+' : ''}${trendPct}`}
            icon={up ? <TrendingUp sx={{ fontSize: '13px !important', color: 'inherit !important' }} /> : <TrendingDown sx={{ fontSize: '13px !important', color: 'inherit !important' }} />}
            sx={{
              bgcolor: isGood ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              color: trendColor,
              fontWeight: 700,
              fontSize: '0.6875rem',
              height: 20,
              '& .MuiChip-icon': {
                marginLeft: '4px',
                marginRight: '-2px',
              }
            }}
          />
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
            {trendLabel}
          </Typography>
        </Stack>

        {overdueText && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '4px', mt: 1.2 }}>
            <Box
              sx={{
                px: 1,
                py: 0.25,
                borderRadius: 1,
                border: '1px solid rgba(239, 68, 68, 0.3)',
                bgcolor: 'transparent',
                color: '#ef4444',
                fontSize: '0.6875rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {overdueText}
            </Box>
          </Box>
        )}

        {activeChips && (
          <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', gap: '4px', mt: 1.2 }}>
            {activeChips.map((chip, idx) => (
              <Box
                key={idx}
                sx={{
                  px: 1,
                  py: 0.25,
                  borderRadius: 1,
                  border: `1px solid ${chip.border}`,
                  bgcolor: 'transparent',
                  color: chip.color,
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {chip.label}
              </Box>
            ))}
          </Stack>
        )}
      </CardContent>

      {/* SVG Sparkline at bottom */}
      <Box sx={{ width: '100%', height: 40, mt: 'auto', pointerEvents: 'none', position: 'relative', bottom: 0 }}>
        <svg
          width="100%"
          height="40"
          viewBox="0 0 200 40"
          preserveAspectRatio="none"
          style={{ display: 'block' }}
        >
          <defs>
            <linearGradient id={`sparkline-grad-${label.replace(/\s+/g, '')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4b5563" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#4b5563" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <path
            d={sparklinePathArea}
            fill={`url(#sparkline-grad-${label.replace(/\s+/g, '')})`}
          />
          <path
            d={sparklinePathLine}
            fill="none"
            stroke="#4b5563"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Box>
    </Card>
  );
}

// ─── Dashboard page ───────────────────────────────────────────────────────────

function DashboardPage() {
  const theme = useTheme();
  
  // AI Insights UI collapsible state
  const [aiInsightsOpen, setAiInsightsOpen] = useState(true);
  const [insightVisible1, setInsightVisible1] = useState(true);
  const [insightVisible2, setInsightVisible2] = useState(true);
  const [insightVisible3, setInsightVisible3] = useState(true);

  // Period toggles for charts
  const [revenueTrendPeriod, setRevenueTrendPeriod] = useState<'Daily' | 'Weekly' | 'Monthly'>('Monthly');
  const [agingChartMetric, setAgingChartMetric] = useState<'Amount' | 'Count'>('Amount');

  const visibleInsightsCount = [insightVisible1, insightVisible2, insightVisible3].filter(Boolean).length;

  return (
    <Box>
      {/* Header Panel */}
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        alignItems={{ xs: 'flex-start', md: 'center' }}
        justifyContent="space-between"
        spacing={2}
        sx={{ mb: 4 }}
      >
        <Box>
          <Typography variant="h5" fontWeight={800} sx={{ mb: 0.25, letterSpacing: '-0.02em' }}>
            Finance Dashboard
          </Typography>
        </Box>

        {/* Date Ranges & Export */}
        <Stack direction="row" alignItems="center" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 1.5,
              px: 1.5,
              py: 0.75,
              backgroundColor: theme.palette.background.paper,
            }}
          >
            <Typography variant="caption" sx={{ color: 'text.secondary', mr: 1, textTransform: 'uppercase', fontWeight: 700, fontSize: '0.625rem', letterSpacing: '0.05em' }}>
              From
            </Typography>
            <Typography variant="body2" fontWeight={600} sx={{ mr: 1.5, fontSize: '0.8125rem' }}>
              04/29/2026
            </Typography>
            <CalendarTodayOutlined sx={{ fontSize: 14, color: 'text.secondary' }} />
          </Box>
          
          <Typography variant="body2" sx={{ color: 'text.secondary', px: 0.25 }}>
            –
          </Typography>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 1.5,
              px: 1.5,
              py: 0.75,
              backgroundColor: theme.palette.background.paper,
            }}
          >
            <Typography variant="caption" sx={{ color: 'text.secondary', mr: 1, textTransform: 'uppercase', fontWeight: 700, fontSize: '0.625rem', letterSpacing: '0.05em' }}>
              To
            </Typography>
            <Typography variant="body2" fontWeight={600} sx={{ mr: 1.5, fontSize: '0.8125rem' }}>
              05/29/2026
            </Typography>
            <CalendarTodayOutlined sx={{ fontSize: 14, color: 'text.secondary' }} />
          </Box>

          <Button
            variant="outlined"
            color="inherit"
            startIcon={<FileDownloadOutlined sx={{ fontSize: '18px !important' }} />}
            sx={{
              height: 38,
              borderColor: theme.palette.divider,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.8125rem',
              px: 2,
              borderRadius: 1.5,
              backgroundColor: theme.palette.background.paper,
              '&:hover': {
                backgroundColor: alpha(theme.palette.action.hover, 0.04),
              }
            }}
          >
            Export Report
          </Button>
        </Stack>
      </Stack>

      {/* KPI Cards Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* TOTAL REVENUE */}
        <Grid item xs={12} sm={6} lg={3}>
          <KpiCard
            label="Total Revenue"
            value="₹2,34,50,000"
            trendPct="12.4%"
            trendLabel="vs. prev. period"
            isUp={true}
            icon={<ReceiptLongOutlined fontSize="small" />}
            sparklinePathLine="M 0 32 Q 25 24, 50 35 T 100 22 T 150 30 T 200 12"
            sparklinePathArea="M 0 32 Q 25 24, 50 35 T 100 22 T 150 30 T 200 12 L 200 40 L 0 40 Z"
          />
        </Grid>

        {/* OUTSTANDING AMOUNT */}
        <Grid item xs={12} sm={6} lg={3}>
          <KpiCard
            label="Outstanding Amount"
            value="₹45,20,000"
            trendPct="41.2%"
            trendLabel="of total overdue"
            isUp={false}
            icon={<WarningAmberOutlined fontSize="small" sx={{ color: '#ef4444' }} />}
            sparklinePathLine="M 0 15 Q 25 25, 50 18 T 100 35 T 150 22 T 200 36"
            sparklinePathArea="M 0 15 Q 25 25, 50 18 T 100 35 T 150 22 T 200 36 L 200 40 L 0 40 Z"
            overdueText="₹18,60,000 overdue"
          />
        </Grid>

        {/* AVG DAYS TO PAY */}
        <Grid item xs={12} sm={6} lg={3}>
          <KpiCard
            label="Avg Days to Pay"
            value="23 days"
            trendPct="3.1%"
            trendLabel="vs. prev. period"
            isUp={true}
            isGood={false}
            icon={<TimerOutlined fontSize="small" />}
            sparklinePathLine="M 0 28 Q 25 18, 50 30 T 100 20 T 150 32 T 200 25"
            sparklinePathArea="M 0 28 Q 25 18, 50 30 T 100 20 T 150 32 T 200 25 L 200 40 L 0 40 Z"
          />
        </Grid>

        {/* ACTIVE INVOICES */}
        <Grid item xs={12} sm={6} lg={3}>
          <KpiCard
            label="Active Invoices"
            value="47"
            trendPct="5.6%"
            trendLabel="vs. prev. period"
            isUp={true}
            icon={<AssignmentOutlined fontSize="small" />}
            sparklinePathLine="M 0 35 Q 25 22, 50 30 T 100 15 T 150 25 T 200 18"
            sparklinePathArea="M 0 35 Q 25 22, 50 30 T 100 15 T 150 25 T 200 18 L 200 40 L 0 40 Z"
            activeChips={[
              { label: '23 sent', color: '#3b82f6', border: 'rgba(59, 130, 246, 0.3)' },
              { label: '15 appr.', color: '#10b981', border: 'rgba(16, 185, 129, 0.3)' },
              { label: '9 pend.', color: '#f59e0b', border: 'rgba(245, 158, 11, 0.3)' },
            ]}
          />
        </Grid>
      </Grid>

      {/* AI Insights Card */}
      <Card sx={{ mb: 4, borderRadius: 2, border: `1px solid ${theme.palette.divider}`, boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)' }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ px: 2.5, py: 1.75, cursor: 'pointer', borderBottom: aiInsightsOpen ? `1px solid ${theme.palette.divider}` : 'none' }}
          onClick={() => setAiInsightsOpen(!aiInsightsOpen)}
        >
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '0.875rem' }}>
              ✨ AI Insights
            </Typography>
            <Chip
              label="Powered by Bedrock"
              size="small"
              sx={{
                bgcolor: '#18181b',
                color: '#f4f4f5',
                fontWeight: 600,
                fontSize: '0.6875rem',
                height: 20,
              }}
            />
            {visibleInsightsCount > 0 && (
              <Chip
                label={`${visibleInsightsCount} insight${visibleInsightsCount > 1 ? 's' : ''}`}
                size="small"
                variant="outlined"
                sx={{
                  fontWeight: 600,
                  fontSize: '0.6875rem',
                  height: 20,
                  borderColor: theme.palette.divider,
                }}
              />
            )}
          </Stack>
          <IconButton size="small" sx={{ color: 'text.secondary' }}>
            {aiInsightsOpen ? <ExpandLessOutlined /> : <ExpandMoreOutlined />}
          </IconButton>
        </Stack>

        <Collapse in={aiInsightsOpen}>
          <CardContent sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {visibleInsightsCount === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                All insights completed or dismissed.
              </Typography>
            ) : (
              <>
                {/* Insight 1 */}
                {insightVisible1 && (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      p: 2,
                      borderRadius: 1.5,
                      border: '1px solid #fed7aa',
                      bgcolor: theme.palette.mode === 'dark' ? 'rgba(254, 215, 170, 0.05)' : '#fff7ed',
                      gap: 2,
                    }}
                  >
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <WarningAmberOutlined sx={{ color: '#d97706', fontSize: 20, flexShrink: 0 }} />
                      <Typography variant="body2" sx={{ color: theme.palette.mode === 'dark' ? '#ffedd5' : '#7c2d12', fontSize: '0.8125rem', fontWeight: 500 }}>
                        3 invoices from Capgemini (₹15.2L total) are at high risk of late payment this week based on historical payment patterns.
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Button
                        size="small"
                        sx={{
                          textTransform: 'none',
                          fontWeight: 700,
                          color: '#d97706',
                          fontSize: '0.75rem',
                          '&:hover': { backgroundColor: 'rgba(217, 119, 6, 0.08)' }
                        }}
                      >
                        Send Reminder
                      </Button>
                      <IconButton size="small" onClick={() => setInsightVisible1(false)} sx={{ color: '#d97706' }}>
                        <CloseOutlined sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Stack>
                  </Box>
                )}

                {/* Insight 2 */}
                {insightVisible2 && (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      p: 2,
                      borderRadius: 1.5,
                      border: '1px solid #bbf7d0',
                      bgcolor: theme.palette.mode === 'dark' ? 'rgba(187, 247, 208, 0.05)' : '#f0fdf4',
                      gap: 2,
                    }}
                  >
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <CheckCircleOutlined sx={{ color: '#16a34a', fontSize: 20, flexShrink: 0 }} />
                      <Typography variant="body2" sx={{ color: theme.palette.mode === 'dark' ? '#dcfce7' : '#14532d', fontSize: '0.8125rem', fontWeight: 500 }}>
                        ₹2.4L recovered — 4 previously unallocated payments were automatically matched by AI reconciliation.
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Button
                        size="small"
                        sx={{
                          textTransform: 'none',
                          fontWeight: 700,
                          color: '#16a34a',
                          fontSize: '0.75rem',
                          '&:hover': { backgroundColor: 'rgba(22, 163, 74, 0.08)' }
                        }}
                      >
                        View Matches
                      </Button>
                      <IconButton size="small" onClick={() => setInsightVisible2(false)} sx={{ color: '#16a34a' }}>
                        <CloseOutlined sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Stack>
                  </Box>
                )}

                {/* Insight 3 */}
                {insightVisible3 && (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      p: 2,
                      borderRadius: 1.5,
                      border: '1px solid #fed7aa',
                      bgcolor: theme.palette.mode === 'dark' ? 'rgba(254, 215, 170, 0.05)' : '#fff7ed',
                      gap: 2,
                    }}
                  >
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <WarningAmberOutlined sx={{ color: '#d97706', fontSize: 20, flexShrink: 0 }} />
                      <Typography variant="body2" sx={{ color: theme.palette.mode === 'dark' ? '#ffedd5' : '#7c2d12', fontSize: '0.8125rem', fontWeight: 500 }}>
                        Unusual batch payment from IBM India covers 3 invoices — verify all are correctly allocated before month-end close.
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Button
                        size="small"
                        sx={{
                          textTransform: 'none',
                          fontWeight: 700,
                          color: '#d97706',
                          fontSize: '0.75rem',
                          '&:hover': { backgroundColor: 'rgba(217, 119, 6, 0.08)' }
                        }}
                      >
                        Review Now
                      </Button>
                      <IconButton size="small" onClick={() => setInsightVisible3(false)} sx={{ color: '#d97706' }}>
                        <CloseOutlined sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Stack>
                  </Box>
                )}
              </>
            )}
          </CardContent>
        </Collapse>
      </Card>

      {/* Charts Grid */}
      <Grid container spacing={3}>
        {/* Revenue Trend Chart */}
        <Grid item xs={12} lg={7}>
          <Card sx={{ borderRadius: 2, border: `1px solid ${theme.palette.divider}`, boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2.5 }}>
                <Box>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ fontSize: '0.875rem' }}>
                    Revenue Trend
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', mt: 0.25, display: 'block' }}>
                    29 Apr – 29 May 2026
                  </Typography>
                </Box>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Box
                    sx={{
                      display: 'flex',
                      bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                      borderRadius: 1.5,
                      p: 0.5,
                    }}
                  >
                    {(['Daily', 'Weekly', 'Monthly'] as const).map((period) => (
                      <Button
                        key={period}
                        size="small"
                        onClick={() => setRevenueTrendPeriod(period)}
                        sx={{
                          textTransform: 'none',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          py: 0.25,
                          px: 1.5,
                          borderRadius: 1,
                          bgcolor: revenueTrendPeriod === period ? '#18181b' : 'transparent',
                          color: revenueTrendPeriod === period ? '#ffffff' : theme.palette.text.secondary,
                          '&:hover': {
                            bgcolor: revenueTrendPeriod === period ? '#18181b' : 'rgba(0, 0, 0, 0.05)',
                          }
                        }}
                      >
                        {period}
                      </Button>
                    ))}
                  </Box>
                  <IconButton size="small" sx={{ color: 'text.secondary' }}>
                    <MoreVertOutlined fontSize="small" />
                  </IconButton>
                </Stack>
              </Stack>

              {/* Responsive SVG Chart */}
              <Box sx={{ width: '100%', height: 220, position: 'relative', mt: 2 }}>
                {/* Grid Lines */}
                <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', pointerEvents: 'none', pb: 4.5 }}>
                  {[1, 2, 3, 4].map((i) => (
                    <Box key={i} sx={{ borderBottom: `1px dashed ${theme.palette.divider}`, width: '100%', opacity: 0.6 }} />
                  ))}
                </Box>

                {/* Y Axis Labels */}
                <Box sx={{ position: 'absolute', left: 0, top: 0, bottom: 35, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', zIndex: 2, pointerEvents: 'none' }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.6875rem', fontWeight: 600 }}>₹24L</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.6875rem', fontWeight: 600 }}>₹18L</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.6875rem', fontWeight: 600 }}>₹12L</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.6875rem', fontWeight: 600 }}>₹6L</Typography>
                </Box>

                {/* SVG Curves */}
                <Box sx={{ pl: 4, height: 'calc(100% - 30px)', width: '100%', boxSizing: 'border-box' }}>
                  <svg width="100%" height="100%" viewBox="0 0 500 200" preserveAspectRatio="none" style={{ display: 'block', overflow: 'visible' }}>
                    <defs>
                      <linearGradient id="revenue-area-grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#4b5563" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#4b5563" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    {/* Wavy Area Fill */}
                    <path
                      d="M 0 140 C 50 160, 100 100, 150 130 C 200 160, 250 90, 300 110 C 350 130, 400 40, 450 50 C 480 60, 500 45, 500 45 L 500 200 L 0 200 Z"
                      fill="url(#revenue-area-grad)"
                    />
                    {/* Wavy Stroke Line */}
                    <path
                      d="M 0 140 C 50 160, 100 100, 150 130 C 200 160, 250 90, 300 110 C 350 130, 400 40, 450 50 C 480 60, 500 45, 500 45"
                      fill="none"
                      stroke={theme.palette.mode === 'dark' ? '#f4f4f5' : '#18181b'}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Box>

                {/* X Axis Labels */}
                <Box
                  sx={{
                    position: 'absolute',
                    left: 32,
                    right: 8,
                    bottom: 0,
                    display: 'flex',
                    justifyContent: 'space-between',
                    pointerEvents: 'none',
                  }}
                >
                  {(revenueTrendPeriod === 'Daily'
                    ? ['29 Apr', '06 May', '13 May', '20 May', '27 May', '29 May']
                    : revenueTrendPeriod === 'Weekly'
                    ? ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5']
                    : ['Dec 25', 'Jan 26', 'Feb 26', 'Mar 26', 'Apr 26', 'May 26']
                  ).map((label, idx) => (
                    <Typography
                      key={idx}
                      variant="caption"
                      sx={{
                        color: 'text.secondary',
                        fontSize: '0.6875rem',
                        fontWeight: 600,
                      }}
                    >
                      {label}
                    </Typography>
                  ))}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Invoice Aging Chart */}
        <Grid item xs={12} lg={5}>
          <Card sx={{ borderRadius: 2, border: `1px solid ${theme.palette.divider}`, boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2.5 }}>
                <Box>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ fontSize: '0.875rem' }}>
                    Invoice Aging
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', mt: 0.25, display: 'block' }}>
                    Outstanding invoices by age bucket
                  </Typography>
                </Box>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Box
                    sx={{
                      display: 'flex',
                      bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                      borderRadius: 1.5,
                      p: 0.5,
                    }}
                  >
                    {(['Amount', 'Count'] as const).map((metric) => (
                      <Button
                        key={metric}
                        size="small"
                        onClick={() => setAgingChartMetric(metric)}
                        sx={{
                          textTransform: 'none',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          py: 0.25,
                          px: 1.5,
                          borderRadius: 1,
                          bgcolor: agingChartMetric === metric ? '#18181b' : 'transparent',
                          color: agingChartMetric === metric ? '#ffffff' : theme.palette.text.secondary,
                          '&:hover': {
                            bgcolor: agingChartMetric === metric ? '#18181b' : 'rgba(0, 0, 0, 0.05)',
                          }
                        }}
                      >
                        {metric}
                      </Button>
                    ))}
                  </Box>
                  <IconButton size="small" sx={{ color: 'text.secondary' }}>
                    <MoreVertOutlined fontSize="small" />
                  </IconButton>
                </Stack>
              </Stack>

              {/* Aging Custom Bars */}
              <Box sx={{ width: '100%', height: 220, position: 'relative', mt: 2 }}>
                {/* Horizontal dashed lines */}
                <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', pointerEvents: 'none', pb: 35 / 8 }}>
                  {[1, 2, 3, 4].map((i) => (
                    <Box key={i} sx={{ borderBottom: `1px dashed ${theme.palette.divider}`, width: '100%', opacity: 0.6 }} />
                  ))}
                </Box>

                {/* Y Axis Labels */}
                <Box sx={{ position: 'absolute', left: 0, top: 0, bottom: 35, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', zIndex: 2, pointerEvents: 'none' }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.6875rem', fontWeight: 600 }}>₹10L</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.6875rem', fontWeight: 600 }}>₹8L</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.6875rem', fontWeight: 600 }}>₹5L</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.6875rem', fontWeight: 600 }}>₹3L</Typography>
                </Box>

                {/* Bar columns */}
                <Box sx={{ pl: 4, height: '100%', width: '100%', boxSizing: 'border-box', display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', pb: 4.5 }}>
                  {/* Bar 1 */}
                  <Stack alignItems="center" spacing={1} sx={{ width: '20%' }}>
                    <Box
                      sx={{
                        width: '100%',
                        maxWidth: 42,
                        height: 160,
                        bgcolor: '#10b981',
                        borderRadius: '6px 6px 0 0',
                        transition: 'opacity 0.2s',
                        cursor: 'pointer',
                        '&:hover': { opacity: 0.85 },
                      }}
                    />
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.6875rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
                      0–30 days
                    </Typography>
                  </Stack>

                  {/* Bar 2 */}
                  <Stack alignItems="center" spacing={1} sx={{ width: '20%' }}>
                    <Box
                      sx={{
                        width: '100%',
                        maxWidth: 42,
                        height: 100,
                        bgcolor: '#f59e0b',
                        borderRadius: '6px 6px 0 0',
                        transition: 'opacity 0.2s',
                        cursor: 'pointer',
                        '&:hover': { opacity: 0.85 },
                      }}
                    />
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.6875rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
                      31–60 days
                    </Typography>
                  </Stack>

                  {/* Bar 3 */}
                  <Stack alignItems="center" spacing={1} sx={{ width: '20%' }}>
                    <Box
                      sx={{
                        width: '100%',
                        maxWidth: 42,
                        height: 55,
                        bgcolor: '#ef4444',
                        borderRadius: '6px 6px 0 0',
                        transition: 'opacity 0.2s',
                        cursor: 'pointer',
                        '&:hover': { opacity: 0.85 },
                      }}
                    />
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.6875rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
                      61–90 days
                    </Typography>
                  </Stack>

                  {/* Bar 4 */}
                  <Stack alignItems="center" spacing={1} sx={{ width: '20%' }}>
                    <Box
                      sx={{
                        width: '100%',
                        maxWidth: 42,
                        height: 40,
                        bgcolor: '#b91c1c',
                        borderRadius: '6px 6px 0 0',
                        transition: 'opacity 0.2s',
                        cursor: 'pointer',
                        '&:hover': { opacity: 0.85 },
                      }}
                    />
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.6875rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
                      90+ days
                    </Typography>
                  </Stack>
                </Box>
              </Box>
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
