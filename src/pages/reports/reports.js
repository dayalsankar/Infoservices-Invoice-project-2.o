/* ═══════════════════════════════════════════════════════════════════════
 *  REPORTS & ANALYTICS — main logic
 *  Aggregates data from all 6 screens · 7 tabs · ~10 charts · insights
 * ════════════════════════════════════════════════════════════════════ */

// ── Period / compare state ───────────────────────────────────────────
const PERIOD_LABELS = {
  'this-week':    'This Week',
  'this-month':   'Jun 2026',
  'last-month':   'May 2026',
  'this-quarter': 'Q2 2026',
  'last-quarter': 'Q1 2026',
  'ytd':          '2026 YTD',
  'last-year':    '2025',
  'custom':       'Custom Range',
};

const state = {
  activeTab: 'revenue',
  period:    'this-month',
  compare:   'off',
  filters:   { company: 'all', client: 'all', tax: 'all' },
  insightsDismissed: new Set(),
  charts: {},   // active Chart.js instances by id
};

const USD_RATE = 83.25;

// ── Formatters ───────────────────────────────────────────────────────
const fmtINR = (n) => '₹' + Math.round(n).toLocaleString('en-IN');
const fmtINRShort = (n) => {
  if (n >= 10000000) return '₹' + (n / 10000000).toFixed(2).replace(/\.?0+$/, '') + ' Cr';
  if (n >= 100000)   return '₹' + (n / 100000).toFixed(2).replace(/\.?0+$/, '') + 'L';
  return '₹' + Math.round(n).toLocaleString('en-IN');
};
const fmtPct = (n) => (n * 100).toFixed(1) + '%';

// ── Chart.js global defaults ─────────────────────────────────────────
function setChartDefaults() {
  if (typeof Chart === 'undefined') return;
  Chart.defaults.font.family = 'Poppins, sans-serif';
  Chart.defaults.font.size = 11;
  Chart.defaults.color = '#64748b';
  Chart.defaults.plugins.tooltip.backgroundColor = '#1a1f5e';
  Chart.defaults.plugins.tooltip.padding = 10;
  Chart.defaults.plugins.tooltip.cornerRadius = 8;
  Chart.defaults.plugins.tooltip.titleFont = { family: 'Poppins', size: 12, weight: 600 };
  Chart.defaults.plugins.tooltip.bodyFont = { family: 'Poppins', size: 12 };
  Chart.defaults.animation.duration = 600;
}

function destroyChart(id) {
  if (state.charts[id]) {
    state.charts[id].destroy();
    delete state.charts[id];
  }
}
function destroyAllCharts() {
  Object.keys(state.charts).forEach(destroyChart);
}

// ═══════════════════════════════════════════════════════════════════════
//  AGGREGATED DATASETS (would normally come from data-aggregator.js
//  cross-screen reads; using static mocks here)
// ═══════════════════════════════════════════════════════════════════════
const REVENUE_DATA = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  invoiced:    [28, 34, 30, 42, 38, 48],
  collected:   [22, 30, 26, 36, 33, 36.8],
  outstanding: [6,  4,  4,  6,  5, 11.2],
};

const REVENUE_COMPARE_2025 = {
  invoiced:    [25, 28, 26, 34, 33, 38],
  collected:   [20, 26, 24, 30, 29, 32],
  outstanding: [5,  2,  2,  4,  4,  6],
};

const COMPANIES_REVENUE = {
  labels: ['INFO Services Pvt Ltd', 'INFO Tech Solutions', 'INFO Global Services', 'INFO Consulting LLP'],
  values: [240, 120, 86, 40],   // in lakhs
  colors: ['#1a1f5e', '#2a52a8', '#3b82c4', '#7dd3fc'],
};

const CLIENT_REVENUE = [
  { name: 'Accenture India', invoiced: 1240000, collected: 1240000, rate: 100 },
  { name: 'TCS Limited',     invoiced:  980000, collected:  931000, rate: 95 },
  { name: 'Infosys BPM',     invoiced:  840000, collected:  529200, rate: 63 },
  { name: 'Wipro Tech',      invoiced:  620000, collected:  620000, rate: 100 },
  { name: 'HCL Methods',     invoiced:  480000, collected:       0, rate: 0  },
  { name: 'Cognizant',       invoiced:  360000, collected:  360000, rate: 100 },
  { name: 'Tech Mahindra',   invoiced:  240000, collected:  240000, rate: 100 },
  { name: 'Mphasis',         invoiced:  180000, collected:   90000, rate: 50 },
];

const FORECAST = {
  labels: ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  projected:    [52, 54, 56, 58, 55, 50],
  conservative: [41.6, 43.2, 44.8, 46.4, 44, 40],
};

const MONTHLY_SUMMARY = [
  { m: 'Jan', inv: 28,  col: 22,   out: 6,    od: 0,    rate: 78.6, vsTarget: -37.8, vsLY: 12.4 },
  { m: 'Feb', inv: 34,  col: 30,   out: 4,    od: 0,    rate: 88.2, vsTarget: -24.4, vsLY: 18.2 },
  { m: 'Mar', inv: 30,  col: 26,   out: 4,    od: 0,    rate: 86.7, vsTarget: -33.3, vsLY: 14.8 },
  { m: 'Apr', inv: 42,  col: 36,   out: 6,    od: 0,    rate: 85.7, vsTarget: -6.7,  vsLY: 22.6 },
  { m: 'May', inv: 38,  col: 33,   out: 5,    od: 0,    rate: 86.8, vsTarget: -15.6, vsLY: 16.4 },
  { m: 'Jun', inv: 48,  col: 36.8, out: 11.2, od: 3.2,  rate: 76.7, vsTarget: 6.7,   vsLY: 24.8 },
];

const INVOICE_STATUS = {
  labels: ['Paid', 'Approved/Sent', 'Pending Approval', 'Outstanding', 'Overdue', 'Draft', 'Written Off'],
  values: [842, 186, 3, 152, 68, 5, 2],
  colors: ['#10b981', '#2a52a8', '#f59e0b', '#3b82c4', '#ef4444', '#94a3b8', '#cbd5e1'],
};

const AGING = [
  { label: '0–30 days', amount: 720000, count: 8, color: '#10b981' },
  { label: '31–60 days', amount: 280000, count: 3, color: '#f59e0b' },
  { label: '61–90 days', amount: 105000, count: 1, color: '#ea580c' },
  { label: '>90 days', amount: 40000, count: 1, color: '#ef4444' },
];

const AGING_DETAIL = [
  { inv: 'INV-2403', client: 'Infosys BPM', amount: 269170, due: '17 Jul', days: '17 days left', cls: 'success' },
  { inv: 'INV-2404', client: 'Wipro Tech',  amount: 194940, due: '10 Jul', days: '10 days left', cls: 'warning' },
  { inv: 'INV-2401', client: 'Accenture',   amount: 118000, due: '10 Jul', days: '10 days left', cls: 'warning' },
  { inv: 'INV-2397', client: 'Infosys BPM', amount:  88700, due: '14 Jun', days: '16 days over', cls: 'danger' },
  { inv: 'INV-2389', client: 'Infosys BPM', amount:  89400, due: '15 May', days: '46 days over', cls: 'danger' },
];

const PAYMENT_HEATMAP = [
  { name: 'Accenture',     m: ['12d','8d','15d','10d','12d','10d'], stars: 5, score: 'Excellent' },
  { name: 'TCS',           m: ['22d','18d','20d','25d','22d','18d'], stars: 4, score: 'Good' },
  { name: 'Infosys',       m: ['28d','35d','30d','—','42d','OD'],    stars: 3, score: 'Average' },
  { name: 'Wipro',         m: ['5d','8d','6d','4d','7d','5d'],       stars: 5, score: 'Excellent' },
  { name: 'HCL',           m: ['25d','OD','30d','28d','OD','OD'],    stars: 2, score: 'Poor' },
  { name: 'Cognizant',     m: ['18d','15d','20d','18d','15d','12d'], stars: 4, score: 'Good' },
  { name: 'Tech Mahindra', m: ['10d','12d','8d','—','10d','8d'],     stars: 5, score: 'Excellent' },
  { name: 'Mphasis',       m: ['35d','28d','40d','35d','30d','35d'], stars: 3, score: 'Average' },
];

function heatmapClass(v) {
  if (v === '—') return 'rpt-hm-cell--none';
  if (v === 'OD') return 'rpt-hm-cell--bad';
  const days = parseInt(v);
  if (days < 15) return 'rpt-hm-cell--good';
  if (days < 30) return 'rpt-hm-cell--ok';
  if (days < 45) return 'rpt-hm-cell--slow';
  return 'rpt-hm-cell--bad';
}

const COLLECTION_RATE = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  values: [78.6, 88.2, 86.7, 85.7, 86.8, 76.7],
  target: 90,
};

const PAYMENT_MODES = {
  labels: ['NEFT', 'RTGS', 'Cheque', 'UPI', 'Wire Transfer'],
  values: [58, 22, 12, 5, 3],
  colors: ['#1a1f5e', '#2a52a8', '#3b82c4', '#10b981', '#f59e0b'],
};

const CONSULTANTS = [
  { name: 'Rahul Verma',    type: 'Hourly', assignments: 2, target: 160, actual: 150, util: 93.8, billable: 375000, nonbill: 10,  stars: 5 },
  { name: 'Anita Krishnan', type: 'Daily',  assignments: 1, target: 22,  actual: 22,  util: 100,  billable: 264000, nonbill: 0,   stars: 5 },
  { name: 'Deepak Mehta',   type: 'Hourly', assignments: 3, target: 160, actual: 156, util: 97.5, billable: 1103625, nonbill: 4, stars: 5 },
  { name: 'Sneha Pillai',   type: 'Daily',  assignments: 1, target: 22,  actual: 19,  util: 86.4, billable: 285000, nonbill: 3,  stars: 4 },
  { name: 'Kiran Nair',     type: 'Hourly', assignments: 2, target: 160, actual: 140, util: 87.5, billable: 757575, nonbill: 20, stars: 4 },
  { name: 'Meera Joshi',    type: 'Daily',  assignments: 0, target: 22,  actual: 0,   util: 0,    billable: 0,      nonbill: 0,  stars: 1 },
];

const ASSIGNMENTS = [
  { name: 'Accenture — Cloud Dev', client: 'Accenture', consultant: 'Rahul Verma',  start: 'Jan', end: 'Dec', budget: 1920, used: 750,  pct: 39.1, status: 'On Track', cls: 'success' },
  { name: 'TCS — Data Engineering', client: 'TCS',     consultant: 'Anita Krishnan', start: 'Mar', end: 'Aug', budget: 880,  used: 220,  pct: 25,   status: 'On Track', cls: 'success' },
  { name: 'Infosys — AI Solutions',  client: 'Infosys', consultant: 'Deepak Mehta', start: 'Feb', end: 'Jul', budget: 960,  used: 560,  pct: 58.3, status: 'On Track', cls: 'royal' },
  { name: 'Wipro — QA Automation',   client: 'Wipro',   consultant: 'Kiran Nair',   start: 'Apr', end: 'Jun', budget: 384,  used: 340,  pct: 88.5, status: 'Expiring', cls: 'warning' },
  { name: 'HCL — DevOps',           client: 'HCL',     consultant: 'Sneha Pillai', start: 'Jan', end: 'May', budget: 440,  used: 440,  pct: 100,  status: 'Expired',  cls: 'grey' },
];

const APPROVAL_TIME = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  values: [2.1, 1.8, 2.4, 1.9, 1.6, 1.8],
};

const APPROVAL_OUTCOMES = {
  labels: ['Approved on first review', 'Approved after revision', 'Rejected'],
  values: [82, 10, 8],
  colors: ['#10b981', '#f59e0b', '#ef4444'],
};

const TIMESHEET_COMPLIANCE = [
  { name: 'Rahul Verma',    periods: 12, onTime: 11, late: 1, rej: 0, rate: 91.7, trend: '↑' },
  { name: 'Anita Krishnan', periods: 6,  onTime: 6,  late: 0, rej: 0, rate: 100,  trend: '→' },
  { name: 'Deepak Mehta',   periods: 12, onTime: 12, late: 0, rej: 0, rate: 100,  trend: '→' },
  { name: 'Sneha Pillai',   periods: 12, onTime: 9,  late: 3, rej: 1, rate: 75,   trend: '↓' },
  { name: 'Kiran Nair',     periods: 12, onTime: 11, late: 1, rej: 0, rate: 91.7, trend: '↑' },
  { name: 'Meera Joshi',    periods: 0,  onTime: 0,  late: 0, rej: 0, rate: null, trend: '—' },
];

const LIFECYCLE = [
  { title: 'Timesheet Submitted',  sub: 'Avg time to approval', days: 2.1 },
  { title: 'Timesheet Approved',   sub: 'Avg time to invoice gen', days: 1.4 },
  { title: 'Invoice Generated',    sub: 'Avg time to approval', days: 1.8 },
  { title: 'Invoice Approved',     sub: 'Avg time to send', days: 0.3 },
  { title: 'Invoice Sent',         sub: 'Avg time to payment', days: 18.2 },
];

const CLIENT_RISK = [
  { name: 'HCL Methods',  level: 'High',   reason: 'Multiple overdue invoices', days: 29, out: 320000, action: 'Escalate + Legal' },
  { name: 'Infosys BPM',  level: 'High',   reason: '46 days overdue',           days: 46, out: 89400,  action: 'Final Notice' },
  { name: 'Mphasis',      level: 'Medium', reason: 'Slow payer (avg 35 days)',  days: 0,  out: 90000,  action: 'Monitor' },
  { name: 'TCS Limited',  level: 'Low',    reason: 'Occasional delays',         days: 0,  out: 0,      action: 'No action' },
  { name: 'Accenture',    level: 'Low',    reason: 'Excellent history',         days: 0,  out: 0,      action: 'No action' },
];

const INSIGHTS = [
  { id: 'ins-1', kind: 'success', icon: '💡', title: 'Fastest paying client', body: 'Wipro Technologies pays invoices in an average of 5 days — your fastest paying client. Consider prioritizing their engagements for cash flow optimization.', actions: [{ label: 'View Client Report', tab: 'client' }] },
  { id: 'ins-2', kind: 'warning', icon: '⚠',  title: 'HCL Methods overdue trend', body: 'HCL Methods has been overdue on 3 of their last 5 invoices. Consider revising payment terms to Net 15 for future engagements.', actions: [{ label: 'View Client →', tab: 'client' }, { label: 'Send Reminder', href: '../payments/?tab=overdue' }] },
  { id: 'ins-3', kind: 'royal',   icon: '📈', title: 'Revenue growth trajectory', body: 'Revenue has grown 18.4% YTD. At this pace, you will exceed ₹6 Cr annual revenue target by October 2026.', actions: [{ label: 'View Revenue Forecast', tab: 'revenue' }] },
  { id: 'ins-4', kind: 'danger',  icon: '🔴', title: 'Above-benchmark rejection rate', body: 'Invoice rejection rate (8.3%) is above industry benchmark (5%). Review tax type configuration for interstate clients.', actions: [{ label: 'View Rejections', tab: 'operational' }] },
  { id: 'ins-5', kind: 'azure',   icon: '💼', title: 'Bench cost alert', body: 'Meera Joshi has been on bench for 61 days. Bench cost: ₹6,10,000. Consider new assignment to maximize utilization.', actions: [{ label: 'View Utilization →', tab: 'utilization' }] },
];

const GST_SUMMARY = [
  { type: 'IGST (18%)',  taxable: 3000000, cgst: 0,      sgst: 0,      igst: 540000, total: 540000 },
  { type: 'CGST (9%)',   taxable: 1600000, cgst: 144000, sgst: 0,      igst: 0,      total: 144000 },
  { type: 'SGST (9%)',   taxable: 1600000, cgst: 0,      sgst: 144000, igst: 0,      total: 144000 },
  { type: 'SEZ/Zero',    taxable: 225000,  cgst: 0,      sgst: 0,      igst: 0,      total: 0      },
];

const HSN_REPORT = [
  { code: '998314', desc: 'IT Consulting',        count: 28, taxable: 2800000, rate: 18, tax: 504000 },
  { code: '998313', desc: 'Data Engineering',     count: 12, taxable: 1440000, rate: 18, tax: 259200 },
  { code: '998315', desc: 'AI/ML Services (SEZ)', count: 8,  taxable: 680000,  rate: 0,  tax: 0      },
  { code: '998312', desc: 'QA/Testing Services',  count: 6,  taxable: 520000,  rate: 18, tax: 93600  },
  { code: '998316', desc: 'DevOps Services',      count: 4,  taxable: 600000,  rate: 18, tax: 108000 },
];

// ═══════════════════════════════════════════════════════════════════════
//  TAB ROUTING
// ═══════════════════════════════════════════════════════════════════════
function renderPanel() {
  destroyAllCharts();
  const panel = document.getElementById('rpt-panel');
  panel.innerHTML = '';
  switch (state.activeTab) {
    case 'revenue':     return renderRevenue(panel);
    case 'invoice':     return renderInvoice(panel);
    case 'payment':     return renderPayment(panel);
    case 'utilization': return renderUtilization(panel);
    case 'client':      return renderClient(panel);
    case 'tax':         return renderTax(panel);
    case 'operational': return renderOperational(panel);
  }
}

// ── TAB 1 — REVENUE ──────────────────────────────────────────────────
function renderRevenue(panel) {
  panel.innerHTML = `
    <!-- Section 1: Revenue Overview (trend chart) -->
    <section class="rpt-section" id="sec-revenue-overview">
      <div class="rpt-section__head">
        <div>
          <h3 class="rpt-section__title">Revenue Overview</h3>
          <p class="rpt-section__sub">Monthly revenue, collections, and outstanding · ${PERIOD_LABELS[state.period]}</p>
        </div>
        <div class="rpt-chart-toggle">
          <button class="rpt-chart-toggle__btn is-active" data-chart-type="line">Line</button>
          <button class="rpt-chart-toggle__btn" data-chart-type="bar">Bar</button>
          <button class="rpt-chart-toggle__btn" data-chart-type="area">Area</button>
        </div>
      </div>
      <div class="rpt-chart-card">
        <div class="rpt-chart-card__body rpt-chart-card__body--tall">
          <canvas id="chart-revenue-trend"></canvas>
        </div>
      </div>
    </section>

    <!-- Section 2: Breakdown — Donut + Stacked Bar -->
    <section class="rpt-section">
      <div class="rpt-grid-2">
        <div class="rpt-chart-card">
          <header class="rpt-chart-card__head"><div><p class="rpt-chart-card__title">Revenue by Company</p><p class="rpt-chart-card__sub">YTD breakdown · 4 entities</p></div></header>
          <div class="rpt-chart-card__body"><canvas id="chart-by-company"></canvas></div>
        </div>
        <div class="rpt-chart-card">
          <header class="rpt-chart-card__head"><div><p class="rpt-chart-card__title">Revenue by Month</p><p class="rpt-chart-card__sub">Collected vs Outstanding · Target ₹45L/mo</p></div></header>
          <div class="rpt-chart-card__body"><canvas id="chart-by-month"></canvas></div>
        </div>
      </div>
    </section>

    <!-- Section 3: Revenue by Client (horizontal bar + table) -->
    <section class="rpt-section">
      <div class="rpt-chart-card">
        <header class="rpt-chart-card__head"><div><p class="rpt-chart-card__title">Revenue by Client</p><p class="rpt-chart-card__sub">Top 8 clients · Collected vs Outstanding</p></div></header>
        <div class="rpt-chart-card__body rpt-chart-card__body--tall"><canvas id="chart-by-client"></canvas></div>
      </div>
    </section>

    <!-- Section 4: Forecast -->
    <section class="rpt-section">
      <div class="rpt-chart-card rpt-chart-card--gradient">
        <header class="rpt-chart-card__head"><div><p class="rpt-chart-card__title">Revenue Forecast</p><p class="rpt-chart-card__sub">Jul–Dec 2026 · Based on active assignments and pipeline</p></div></header>
        <div class="rpt-chart-card__body"><canvas id="chart-forecast"></canvas></div>
        <div class="rpt-forecast-info">
          <span class="rpt-confidence-badge">★ 85% confidence</span>
          <p class="rpt-basis">Based on <strong>38 active assignments</strong> · <strong>₹2,500</strong> avg hourly rate · current headcount</p>
        </div>
        <div class="rpt-ai-chip">
          <span class="rpt-ai-chip__icon">💡</span>
          <span><strong>AI Insight:</strong> Q3 2026 is projected to be your highest revenue quarter. Consider onboarding 3–4 new consultants to maximize capacity.</span>
        </div>
      </div>
    </section>

    <!-- Section 5: Monthly Summary Table -->
    <section class="rpt-section">
      <div class="rpt-section__head">
        <div>
          <h3 class="rpt-section__title">Monthly Revenue Summary</h3>
          <p class="rpt-section__sub">Jan–Jun 2026 · Target ₹45L/mo · vs 2025 baseline</p>
        </div>
        <button class="btn btn--ghost btn--sm" data-export="summary">Export Table</button>
      </div>
      <div class="rpt-table-wrap">
        <table class="rpt-table">
          <thead><tr>
            <th>Month</th><th class="num">Invoiced</th><th class="num">Collected</th><th class="num">Outstanding</th>
            <th class="num">Overdue</th><th class="num">Coll Rate</th><th class="num">vs Target</th><th class="num">vs Last Year</th>
          </tr></thead>
          <tbody>
            ${MONTHLY_SUMMARY.map(r => `
              <tr>
                <td>${r.m} 2026</td>
                <td class="num">₹${r.inv}L</td>
                <td class="num">₹${r.col}L</td>
                <td class="num">₹${r.out}L</td>
                <td class="num">${r.od === 0 ? '—' : '₹' + r.od + 'L'}</td>
                <td class="num"><span class="rpt-pill ${r.rate >= 85 ? 'rpt-pill--success' : r.rate >= 75 ? 'rpt-pill--warning' : 'rpt-pill--danger'}">${r.rate}%</span></td>
                <td class="num ${r.vsTarget >= 0 ? 'rpt-cell--success' : 'rpt-cell--danger'}">${r.vsTarget >= 0 ? '+' : ''}${r.vsTarget}%</td>
                <td class="num ${r.vsLY >= 0 ? 'rpt-cell--success' : 'rpt-cell--danger'}">+${r.vsLY}%</td>
              </tr>
            `).join('')}
            <tr class="total-row">
              <td>YTD Total</td>
              <td class="num">₹2.20Cr</td>
              <td class="num">₹1.84Cr</td>
              <td class="num">₹36.2L</td>
              <td class="num">₹3.2L</td>
              <td class="num">83.6%</td>
              <td class="num rpt-cell--danger">-17.7%</td>
              <td class="num rpt-cell--success">+18.4%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  `;

  // Wire chart toggle
  panel.querySelectorAll('[data-chart-type]').forEach(b => {
    b.addEventListener('click', () => {
      panel.querySelectorAll('[data-chart-type]').forEach(x => x.classList.toggle('is-active', x === b));
      drawRevenueTrend(b.dataset.chartType);
    });
  });

  // Draw all 4 charts
  setTimeout(() => {
    drawRevenueTrend('line');
    drawCompanyDonut();
    drawMonthlyStacked();
    drawClientBarH();
    drawForecast();
  }, 0);
}

function drawRevenueTrend(type) {
  destroyChart('chart-revenue-trend');
  const ctx = document.getElementById('chart-revenue-trend'); if (!ctx) return;
  const datasets = [
    { label: 'Invoiced (₹L)',    data: REVENUE_DATA.invoiced,    borderColor: '#1a1f5e', backgroundColor: type === 'area' ? 'rgba(26, 31, 94, .12)' : 'transparent', fill: type === 'area', tension: .3, pointRadius: 3, borderWidth: 2.5 },
    { label: 'Collected (₹L)',   data: REVENUE_DATA.collected,   borderColor: '#10b981', backgroundColor: type === 'area' ? 'rgba(16, 185, 129, .14)' : 'transparent', fill: type === 'area', tension: .3, pointRadius: 3, borderWidth: 2.5 },
    { label: 'Outstanding (₹L)', data: REVENUE_DATA.outstanding, borderColor: '#f59e0b', backgroundColor: type === 'area' ? 'rgba(245, 158, 11, .14)' : 'transparent', borderDash: [6, 4], fill: type === 'area', tension: .3, pointRadius: 3, borderWidth: 1.8 },
  ];
  if (state.compare !== 'off') {
    datasets.push({ label: '2025 Invoiced', data: REVENUE_COMPARE_2025.invoiced, borderColor: 'rgba(26, 31, 94, .35)', backgroundColor: 'transparent', borderDash: [4, 4], tension: .3, pointRadius: 2, borderWidth: 1.5 });
    datasets.push({ label: '2025 Collected', data: REVENUE_COMPARE_2025.collected, borderColor: 'rgba(16, 185, 129, .4)', backgroundColor: 'transparent', borderDash: [4, 4], tension: .3, pointRadius: 2, borderWidth: 1.5 });
  }
  state.charts['chart-revenue-trend'] = new Chart(ctx, {
    type: type === 'bar' ? 'bar' : 'line',
    data: { labels: REVENUE_DATA.labels, datasets },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { boxWidth: 10, padding: 12, font: { size: 11 } } },
        tooltip: { callbacks: { label: c => `${c.dataset.label}: ₹${c.parsed.y}L` } },
      },
      scales: {
        x: { grid: { display: false } },
        y: { beginAtZero: true, grid: { color: '#e8ecf4' }, ticks: { callback: v => '₹' + v + 'L' } },
      },
    },
  });
}

function drawCompanyDonut() {
  const ctx = document.getElementById('chart-by-company'); if (!ctx) return;
  state.charts['chart-by-company'] = new Chart(ctx, {
    type: 'doughnut',
    data: { labels: COMPANIES_REVENUE.labels, datasets: [{ data: COMPANIES_REVENUE.values, backgroundColor: COMPANIES_REVENUE.colors, borderWidth: 2, borderColor: '#fff' }] },
    options: {
      responsive: true, maintainAspectRatio: false, cutout: '68%',
      plugins: {
        legend: { position: 'right', labels: { boxWidth: 10, padding: 10, font: { size: 10 } } },
        tooltip: { callbacks: { label: c => `${c.label}: ₹${c.parsed}L (${((c.parsed / 486) * 100).toFixed(1)}%)` } },
      },
    },
  });
}

function drawMonthlyStacked() {
  const ctx = document.getElementById('chart-by-month'); if (!ctx) return;
  state.charts['chart-by-month'] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: REVENUE_DATA.labels,
      datasets: [
        { label: 'Collected', data: REVENUE_DATA.collected, backgroundColor: '#10b981', borderRadius: 4, stack: 'rev' },
        { label: 'Outstanding', data: REVENUE_DATA.outstanding, backgroundColor: '#f59e0b', borderRadius: 4, stack: 'rev' },
        { label: 'Target ₹45L', data: [45, 45, 45, 45, 45, 45], type: 'line', borderColor: '#1a1f5e', borderDash: [6, 4], pointRadius: 0, borderWidth: 1.5, fill: false },
      ],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, padding: 12, font: { size: 11 } } } },
      scales: {
        x: { grid: { display: false }, stacked: true },
        y: { beginAtZero: true, grid: { color: '#e8ecf4' }, stacked: true, ticks: { callback: v => '₹' + v + 'L' } },
      },
    },
  });
}

function drawClientBarH() {
  const ctx = document.getElementById('chart-by-client'); if (!ctx) return;
  state.charts['chart-by-client'] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: CLIENT_REVENUE.map(c => c.name),
      datasets: [
        { label: 'Collected', data: CLIENT_REVENUE.map(c => c.collected / 100000), backgroundColor: '#10b981', borderRadius: 4, stack: 'c' },
        { label: 'Outstanding', data: CLIENT_REVENUE.map(c => (c.invoiced - c.collected) / 100000), backgroundColor: '#f59e0b', borderRadius: 4, stack: 'c' },
      ],
    },
    options: {
      indexAxis: 'y',
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, padding: 12, font: { size: 11 } } } },
      scales: {
        x: { stacked: true, beginAtZero: true, grid: { color: '#e8ecf4' }, ticks: { callback: v => '₹' + v + 'L' } },
        y: { stacked: true, grid: { display: false } },
      },
    },
  });
}

function drawForecast() {
  const ctx = document.getElementById('chart-forecast'); if (!ctx) return;
  state.charts['chart-forecast'] = new Chart(ctx, {
    type: 'line',
    data: {
      labels: FORECAST.labels,
      datasets: [
        { label: 'Projected (₹L)', data: FORECAST.projected, borderColor: '#1a1f5e', backgroundColor: 'rgba(26, 31, 94, .08)', fill: true, borderDash: [], tension: .3, pointRadius: 4, borderWidth: 2.5 },
        { label: 'Conservative 80% (₹L)', data: FORECAST.conservative, borderColor: '#3b82c4', backgroundColor: 'transparent', borderDash: [4, 4], tension: .3, pointRadius: 3, borderWidth: 2 },
      ],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, padding: 12, font: { size: 11 } } } },
      scales: {
        x: { grid: { display: false } },
        y: { beginAtZero: true, grid: { color: '#e8ecf4' }, ticks: { callback: v => '₹' + v + 'L' } },
      },
    },
  });
}

// ── TAB 2 — INVOICE ──────────────────────────────────────────────────
function renderInvoice(panel) {
  panel.innerHTML = `
    <section class="rpt-section">
      <div class="rpt-stat-row">
        <div class="rpt-stat"><p class="rpt-stat__label">Total Invoices (Jun)</p><p class="rpt-stat__value">48</p><p class="rpt-stat__sub">Generated this month</p></div>
        <div class="rpt-stat rpt-stat--success"><p class="rpt-stat__label">Total Value</p><p class="rpt-stat__value">₹48.25L</p><p class="rpt-stat__sub">Cumulative this month</p></div>
        <div class="rpt-stat rpt-stat--royal"><p class="rpt-stat__label">Avg Invoice Value</p><p class="rpt-stat__value">₹1,00,521</p><p class="rpt-stat__sub">Per invoice</p></div>
        <div class="rpt-stat rpt-stat--warning"><p class="rpt-stat__label">Largest Invoice</p><p class="rpt-stat__value">₹3,11,520</p><p class="rpt-stat__sub">INV-2402 · TCS Limited</p></div>
      </div>
    </section>

    <section class="rpt-section">
      <div class="rpt-grid-2">
        <div class="rpt-chart-card">
          <header class="rpt-chart-card__head"><div><p class="rpt-chart-card__title">Invoice Status Distribution</p><p class="rpt-chart-card__sub">All 1,248 invoices YTD</p></div></header>
          <div class="rpt-chart-card__body rpt-chart-card__body--tall"><canvas id="chart-status-donut"></canvas></div>
        </div>
        <div class="rpt-chart-card">
          <header class="rpt-chart-card__head"><div><p class="rpt-chart-card__title">Invoice Aging Buckets</p><p class="rpt-chart-card__sub">Outstanding by age</p></div></header>
          <div class="rpt-chart-card__body rpt-chart-card__body--tall"><canvas id="chart-aging"></canvas></div>
        </div>
      </div>
    </section>

    <section class="rpt-section">
      <div class="rpt-section__head">
        <div><h3 class="rpt-section__title">Aging Detail</h3><p class="rpt-section__sub">Outstanding invoices · click to open in Invoices screen</p></div>
      </div>
      <div class="rpt-table-wrap">
        <table class="rpt-table">
          <thead><tr><th>Invoice #</th><th>Client</th><th class="num">Amount</th><th>Due Date</th><th>Days</th><th class="num">Actions</th></tr></thead>
          <tbody>
            ${AGING_DETAIL.map(r => `
              <tr>
                <td><a class="rpt-link" href="../invoices/?id=${r.inv}">${r.inv}</a></td>
                <td>${r.client}</td>
                <td class="num">${fmtINR(r.amount)}</td>
                <td>${r.due} 2026</td>
                <td><span class="rpt-pill rpt-pill--${r.cls}">${r.days}</span></td>
                <td class="num"><a class="rpt-link" href="../payments/new?invoice=${r.inv}">Record Payment</a></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </section>
  `;
  setTimeout(() => {
    drawStatusDonut();
    drawAgingBar();
  }, 0);
}

function drawStatusDonut() {
  const ctx = document.getElementById('chart-status-donut'); if (!ctx) return;
  state.charts['chart-status-donut'] = new Chart(ctx, {
    type: 'doughnut',
    data: { labels: INVOICE_STATUS.labels, datasets: [{ data: INVOICE_STATUS.values, backgroundColor: INVOICE_STATUS.colors, borderWidth: 2, borderColor: '#fff' }] },
    options: {
      responsive: true, maintainAspectRatio: false, cutout: '64%',
      plugins: {
        legend: { position: 'right', labels: { boxWidth: 10, padding: 8, font: { size: 10 } } },
        tooltip: { callbacks: { label: c => `${c.label}: ${c.parsed} (${((c.parsed / 1258) * 100).toFixed(1)}%)` } },
      },
    },
  });
}

function drawAgingBar() {
  const ctx = document.getElementById('chart-aging'); if (!ctx) return;
  state.charts['chart-aging'] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: AGING.map(a => a.label),
      datasets: [{ data: AGING.map(a => a.amount / 100000), backgroundColor: AGING.map(a => a.color), borderRadius: 6 }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: c => '₹' + c.parsed.y.toFixed(2) + 'L · ' + AGING[c.dataIndex].count + ' invoices' } },
      },
      scales: {
        x: { grid: { display: false } },
        y: { beginAtZero: true, grid: { color: '#e8ecf4' }, ticks: { callback: v => '₹' + v + 'L' } },
      },
    },
  });
}

// ── TAB 3 — PAYMENT ──────────────────────────────────────────────────
function renderPayment(panel) {
  panel.innerHTML = `
    <section class="rpt-section">
      <div class="rpt-stat-row">
        <div class="rpt-stat rpt-stat--success"><p class="rpt-stat__label">Total Received (Jun)</p><p class="rpt-stat__value">₹36.8L</p><p class="rpt-stat__sub">32 transactions</p></div>
        <div class="rpt-stat rpt-stat--royal"><p class="rpt-stat__label">Total Transactions</p><p class="rpt-stat__value">32</p><p class="rpt-stat__sub">This month</p></div>
        <div class="rpt-stat"><p class="rpt-stat__label">Avg Payment Time</p><p class="rpt-stat__value">18 days</p><p class="rpt-stat__sub">From invoice send</p></div>
        <div class="rpt-stat rpt-stat--success"><p class="rpt-stat__label">Fastest Payment</p><p class="rpt-stat__value">2 days</p><p class="rpt-stat__sub">Wipro Tech</p></div>
      </div>
    </section>

    <section class="rpt-section">
      <div class="rpt-grid-2">
        <div class="rpt-chart-card">
          <header class="rpt-chart-card__head"><div><p class="rpt-chart-card__title">Collection Rate Trend</p><p class="rpt-chart-card__sub">Monthly · Target 90%</p></div></header>
          <div class="rpt-chart-card__body"><canvas id="chart-collection-rate"></canvas></div>
        </div>
        <div class="rpt-chart-card">
          <header class="rpt-chart-card__head"><div><p class="rpt-chart-card__title">Payment Mode Breakdown</p><p class="rpt-chart-card__sub">% of total volume</p></div></header>
          <div class="rpt-chart-card__body"><canvas id="chart-payment-modes"></canvas></div>
        </div>
      </div>
    </section>

    <section class="rpt-section">
      <div class="rpt-section__head"><div><h3 class="rpt-section__title">Client Payment Behavior</h3><p class="rpt-section__sub">Average days to pay · Jan–Jun 2026</p></div></div>
      <div class="rpt-heatmap">
        <table class="rpt-heatmap__table">
          <thead><tr><th>Client</th><th>Jan</th><th>Feb</th><th>Mar</th><th>Apr</th><th>May</th><th>Jun</th><th>Score</th></tr></thead>
          <tbody>
            ${PAYMENT_HEATMAP.map(r => `
              <tr>
                <td><a class="rpt-link" href="../master-data/?tab=clients&q=${encodeURIComponent(r.name)}">${r.name}</a></td>
                ${r.m.map(v => `<td class="${heatmapClass(v)}">${v}</td>`).join('')}
                <td><span class="rpt-stars">${'★'.repeat(r.stars)}<span class="rpt-stars__empty">${'★'.repeat(5 - r.stars)}</span></span><br><span style="font-size:10px;color:var(--text-secondary)">${r.score}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </section>

    <section class="rpt-section">
      <div class="rpt-section__head">
        <div><h3 class="rpt-section__title">Overdue Analysis</h3><p class="rpt-section__sub">By client · Action required</p></div>
      </div>
      <div class="rpt-table-wrap">
        <table class="rpt-table">
          <thead><tr><th>Client</th><th class="num">Outstanding</th><th>Days Overdue</th><th class="num">Actions</th></tr></thead>
          <tbody>
            <tr><td>HCL Methods</td><td class="num">₹3,20,000</td><td><span class="rpt-pill rpt-pill--danger">29 days</span></td><td class="num"><a class="rpt-link" href="../payments/?tab=overdue">Send Reminder →</a></td></tr>
            <tr><td>Infosys BPM</td><td class="num">₹89,400</td><td><span class="rpt-pill rpt-pill--danger">46 days</span></td><td class="num"><a class="rpt-link" href="../payments/?tab=overdue">Send Reminder →</a></td></tr>
          </tbody>
        </table>
      </div>
    </section>
  `;
  setTimeout(() => {
    drawCollectionRate();
    drawPaymentModes();
  }, 0);
}

function drawCollectionRate() {
  const ctx = document.getElementById('chart-collection-rate'); if (!ctx) return;
  state.charts['chart-collection-rate'] = new Chart(ctx, {
    type: 'line',
    data: {
      labels: COLLECTION_RATE.labels,
      datasets: [
        { label: 'Collection Rate (%)', data: COLLECTION_RATE.values, borderColor: '#2a52a8', backgroundColor: 'rgba(42, 82, 168, .12)', fill: true, tension: .3, pointRadius: 4, borderWidth: 2.5 },
        { label: 'Target 90%', data: [90, 90, 90, 90, 90, 90], borderColor: '#1a1f5e', borderDash: [6, 4], pointRadius: 0, borderWidth: 1.5, fill: false },
      ],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, padding: 12, font: { size: 11 } } } },
      scales: {
        x: { grid: { display: false } },
        y: { beginAtZero: false, min: 70, max: 100, grid: { color: '#e8ecf4' }, ticks: { callback: v => v + '%' } },
      },
    },
  });
}

function drawPaymentModes() {
  const ctx = document.getElementById('chart-payment-modes'); if (!ctx) return;
  state.charts['chart-payment-modes'] = new Chart(ctx, {
    type: 'doughnut',
    data: { labels: PAYMENT_MODES.labels, datasets: [{ data: PAYMENT_MODES.values, backgroundColor: PAYMENT_MODES.colors, borderWidth: 2, borderColor: '#fff' }] },
    options: {
      responsive: true, maintainAspectRatio: false, cutout: '64%',
      plugins: {
        legend: { position: 'right', labels: { boxWidth: 10, padding: 10, font: { size: 11 } } },
        tooltip: { callbacks: { label: c => `${c.label}: ${c.parsed}%` } },
      },
    },
  });
}

// ── TAB 4 — UTILIZATION ──────────────────────────────────────────────
function renderUtilization(panel) {
  panel.innerHTML = `
    <section class="rpt-section">
      <div class="rpt-stat-row">
        <div class="rpt-stat rpt-stat--royal"><p class="rpt-stat__label">Total Billable Hours</p><p class="rpt-stat__value">3,240 hrs</p><p class="rpt-stat__sub">June 2026</p></div>
        <div class="rpt-stat"><p class="rpt-stat__label">Total Billable Days</p><p class="rpt-stat__value">428 days</p><p class="rpt-stat__sub">June 2026</p></div>
        <div class="rpt-stat rpt-stat--success"><p class="rpt-stat__label">Avg Utilization</p><p class="rpt-stat__value">82%</p><p class="rpt-stat__sub">↑ 4.2% vs May</p></div>
        <div class="rpt-stat rpt-stat--success"><p class="rpt-stat__label">Total Billing Value</p><p class="rpt-stat__value">₹48.25L</p><p class="rpt-stat__sub">June 2026</p></div>
      </div>
    </section>

    <section class="rpt-section">
      <div class="rpt-section__head"><div><h3 class="rpt-section__title">Consultant Utilization</h3><p class="rpt-section__sub">Billable hours and efficiency · June 2026</p></div></div>
      <div class="rpt-table-wrap">
        <table class="rpt-table">
          <thead><tr><th>Consultant</th><th>Type</th><th class="num">Assignments</th><th class="num">Target</th><th class="num">Actual</th><th class="num">Utilization</th><th class="num">Billable</th><th>Stars</th></tr></thead>
          <tbody>
            ${CONSULTANTS.map(c => `
              <tr>
                <td><a class="rpt-link" href="../master-data/?tab=consultants&q=${encodeURIComponent(c.name)}">${c.name}</a></td>
                <td>${c.type}</td>
                <td class="num">${c.assignments}</td>
                <td class="num">${c.target}${c.type === 'Hourly' ? 'h' : 'd'}</td>
                <td class="num">${c.actual}${c.type === 'Hourly' ? 'h' : 'd'}</td>
                <td class="num"><span class="rpt-pill ${c.util >= 90 ? 'rpt-pill--success' : c.util >= 75 ? 'rpt-pill--royal' : c.util >= 50 ? 'rpt-pill--warning' : 'rpt-pill--danger'}">${c.util}%</span></td>
                <td class="num">${fmtINRShort(c.billable)}</td>
                <td><span class="rpt-stars">${'★'.repeat(c.stars)}<span class="rpt-stars__empty">${'★'.repeat(5 - c.stars)}</span></span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </section>

    <section class="rpt-section">
      <div class="rpt-chart-card">
        <header class="rpt-chart-card__head"><div><p class="rpt-chart-card__title">Target vs Actual Hours</p><p class="rpt-chart-card__sub">Per consultant · June 2026</p></div></header>
        <div class="rpt-chart-card__body rpt-chart-card__body--tall"><canvas id="chart-utilization"></canvas></div>
      </div>
    </section>

    <section class="rpt-section">
      <div class="rpt-section__head"><div><h3 class="rpt-section__title">Assignment Utilization</h3><p class="rpt-section__sub">Budget consumption per active assignment</p></div></div>
      <div class="rpt-table-wrap">
        <table class="rpt-table">
          <thead><tr><th>Assignment</th><th>Client</th><th>Consultant</th><th>Period</th><th class="num">Budget</th><th class="num">Used</th><th class="num">% Used</th><th>Status</th></tr></thead>
          <tbody>
            ${ASSIGNMENTS.map(a => `
              <tr>
                <td><a class="rpt-link" href="../master-data/?tab=assignments">${a.name}</a></td>
                <td>${a.client}</td>
                <td>${a.consultant}</td>
                <td>${a.start}–${a.end}</td>
                <td class="num">${a.budget}${a.budget > 100 ? 'h' : 'd'}</td>
                <td class="num">${a.used}${a.budget > 100 ? 'h' : 'd'}</td>
                <td class="num">${a.pct}%</td>
                <td><span class="rpt-pill rpt-pill--${a.cls}">${a.status}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </section>

    <section class="rpt-section">
      <div class="rpt-chart-card" style="border-left:3px solid var(--brand-azure)">
        <header class="rpt-chart-card__head"><div><p class="rpt-chart-card__title">Bench Report</p><p class="rpt-chart-card__sub">Consultants without active assignments</p></div></header>
        <div class="rpt-table-wrap" style="border:none">
          <table class="rpt-table">
            <thead><tr><th>Consultant</th><th>Last Assignment</th><th>End Date</th><th class="num">Days on Bench</th><th class="num">Cost Impact</th></tr></thead>
            <tbody><tr><td>Meera Joshi</td><td>Tech Mahindra — BI Dashboard</td><td>30 Apr 2026</td><td class="num"><span class="rpt-pill rpt-pill--warning">61 days</span></td><td class="num rpt-cell--danger">₹6,10,000</td></tr></tbody>
          </table>
        </div>
        <div class="rpt-ai-chip">
          <span class="rpt-ai-chip__icon">💡</span>
          <span><strong>AI Insight:</strong> 1 consultant has been on bench for 61 days. Bench cost: ₹6.1L. Consider new assignment to maximize billability.</span>
        </div>
      </div>
    </section>
  `;
  setTimeout(() => drawUtilization(), 0);
}

function drawUtilization() {
  const ctx = document.getElementById('chart-utilization'); if (!ctx) return;
  state.charts['chart-utilization'] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: CONSULTANTS.map(c => c.name),
      datasets: [
        { label: 'Target', data: CONSULTANTS.map(c => c.target), backgroundColor: '#e8ecf4', borderRadius: 4 },
        { label: 'Actual', data: CONSULTANTS.map(c => c.actual), backgroundColor: '#2a52a8', borderRadius: 4 },
      ],
    },
    options: {
      indexAxis: 'y',
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, padding: 12, font: { size: 11 } } } },
      scales: {
        x: { grid: { color: '#e8ecf4' }, beginAtZero: true },
        y: { grid: { display: false } },
      },
    },
  });
}

// ── TAB 5 — CLIENT ────────────────────────────────────────────────────
function renderClient(panel) {
  panel.innerHTML = `
    <section class="rpt-section">
      <div class="rpt-stat-row">
        <div class="rpt-stat rpt-stat--royal"><p class="rpt-stat__label">Total Clients</p><p class="rpt-stat__value">18</p><p class="rpt-stat__sub">Registered</p></div>
        <div class="rpt-stat rpt-stat--success"><p class="rpt-stat__label">Active Clients</p><p class="rpt-stat__value">15</p><p class="rpt-stat__sub">With open invoices</p></div>
        <div class="rpt-stat"><p class="rpt-stat__label">Top Client Revenue</p><p class="rpt-stat__value">₹12.40L</p><p class="rpt-stat__sub">Accenture India</p></div>
        <div class="rpt-stat"><p class="rpt-stat__label">Avg Revenue / Client</p><p class="rpt-stat__value">₹2.70L</p><p class="rpt-stat__sub">YTD</p></div>
      </div>
    </section>

    <section class="rpt-section">
      <div class="rpt-chart-card">
        <header class="rpt-chart-card__head"><div><p class="rpt-chart-card__title">Client Revenue Analysis</p><p class="rpt-chart-card__sub">Total invoiced vs collected · per client</p></div></header>
        <div class="rpt-chart-card__body rpt-chart-card__body--tall"><canvas id="chart-client-rev"></canvas></div>
      </div>
    </section>

    <section class="rpt-section">
      <div class="rpt-chart-card">
        <header class="rpt-chart-card__head"><div><p class="rpt-chart-card__title">Client Profitability Score</p><p class="rpt-chart-card__sub">Revenue × Collection Rate × Payment Speed</p></div></header>
        <div class="rpt-chart-card__body rpt-chart-card__body--tall rpt-scatter-wrap">
          <canvas id="chart-profitability"></canvas>
          <span class="rpt-scatter-label rpt-scatter-label--tr">★ Star Clients</span>
          <span class="rpt-scatter-label rpt-scatter-label--tl">⚠ High Value Risk</span>
          <span class="rpt-scatter-label rpt-scatter-label--br">Reliable Small</span>
          <span class="rpt-scatter-label rpt-scatter-label--bl">Review Needed</span>
        </div>
      </div>
    </section>

    <section class="rpt-section">
      <div class="rpt-section__head"><div><h3 class="rpt-section__title">Client Risk Assessment</h3><p class="rpt-section__sub">Action required for high/medium risk clients</p></div></div>
      <div class="rpt-table-wrap">
        <table class="rpt-table">
          <thead><tr><th>Client</th><th>Risk</th><th>Reason</th><th class="num">Outstanding</th><th class="num">Days Overdue</th><th class="num">Action</th></tr></thead>
          <tbody>
            ${CLIENT_RISK.map(r => `
              <tr>
                <td><a class="rpt-link" href="../master-data/?tab=clients&q=${encodeURIComponent(r.name)}">${r.name}</a></td>
                <td><span class="rpt-risk--${r.level.toLowerCase()}">${r.level === 'High' ? '🔴' : r.level === 'Medium' ? '🟡' : '🟢'} ${r.level}</span></td>
                <td>${r.reason}</td>
                <td class="num">${r.out > 0 ? fmtINR(r.out) : '—'}</td>
                <td class="num">${r.days > 0 ? r.days + ' days' : '—'}</td>
                <td class="num">${r.action}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </section>
  `;
  setTimeout(() => {
    drawClientRev();
    drawProfitability();
  }, 0);
}

function drawClientRev() {
  const ctx = document.getElementById('chart-client-rev'); if (!ctx) return;
  state.charts['chart-client-rev'] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: CLIENT_REVENUE.map(c => c.name),
      datasets: [
        { label: 'Invoiced', data: CLIENT_REVENUE.map(c => c.invoiced / 100000), backgroundColor: '#1a1f5e', borderRadius: 4 },
        { label: 'Collected', data: CLIENT_REVENUE.map(c => c.collected / 100000), backgroundColor: '#10b981', borderRadius: 4 },
      ],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, padding: 12, font: { size: 11 } } } },
      scales: {
        x: { grid: { display: false } },
        y: { beginAtZero: true, grid: { color: '#e8ecf4' }, ticks: { callback: v => '₹' + v + 'L' } },
      },
    },
  });
}

function drawProfitability() {
  const ctx = document.getElementById('chart-profitability'); if (!ctx) return;
  // Each client: x = collection rate, y = revenue (lakhs), r = sqrt(invoice count)
  const bubbles = CLIENT_REVENUE.map((c, i) => ({
    label: c.name,
    data: [{ x: c.rate, y: c.invoiced / 100000, r: 6 + i * 1.5 }],
    backgroundColor: c.rate >= 80 ? 'rgba(16, 185, 129, .65)' : c.rate >= 50 ? 'rgba(245, 158, 11, .65)' : 'rgba(239, 68, 68, .65)',
    borderColor: c.rate >= 80 ? '#047857' : c.rate >= 50 ? '#b45309' : '#b91c1c',
    borderWidth: 1.5,
  }));
  state.charts['chart-profitability'] = new Chart(ctx, {
    type: 'bubble',
    data: { datasets: bubbles },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { boxWidth: 10, padding: 8, font: { size: 10 } } },
        tooltip: { callbacks: { label: c => `${c.dataset.label}: ${c.parsed.x}% collection · ₹${c.parsed.y}L revenue` } },
      },
      scales: {
        x: { title: { display: true, text: 'Collection Rate (%)' }, min: 0, max: 100, grid: { color: '#e8ecf4' } },
        y: { title: { display: true, text: 'Revenue (₹L)' }, beginAtZero: true, grid: { color: '#e8ecf4' } },
      },
    },
  });
}

// ── TAB 6 — TAX ──────────────────────────────────────────────────────
function renderTax(panel) {
  panel.innerHTML = `
    <section class="rpt-section">
      <div class="rpt-stat-row">
        <div class="rpt-stat rpt-stat--royal"><p class="rpt-stat__label">Total Tax Collected</p><p class="rpt-stat__value">₹8,68,500</p><p class="rpt-stat__sub">June 2026</p></div>
        <div class="rpt-stat"><p class="rpt-stat__label">IGST Amount</p><p class="rpt-stat__value">₹5,40,000</p><p class="rpt-stat__sub">Inter-state</p></div>
        <div class="rpt-stat"><p class="rpt-stat__label">CGST + SGST</p><p class="rpt-stat__value">₹2,88,000</p><p class="rpt-stat__sub">Intra-state</p></div>
        <div class="rpt-stat rpt-stat--success"><p class="rpt-stat__label">SEZ / Zero Rated</p><p class="rpt-stat__value">₹40,500</p><p class="rpt-stat__sub">Exempt</p></div>
      </div>
    </section>

    <section class="rpt-section">
      <div class="rpt-section__head">
        <div><h3 class="rpt-section__title">GST Liability Summary</h3><p class="rpt-section__sub">Monthly tax breakdown for filing — June 2026</p></div>
        <div style="display:flex;gap:8px"><button class="btn btn--ghost btn--sm">Export GSTR-1</button><button class="btn btn--primary btn--sm">Tax Summary PDF</button></div>
      </div>
      <div class="rpt-table-wrap">
        <table class="rpt-table rpt-gst-table">
          <thead><tr><th>Tax Type</th><th class="num">Taxable Value</th><th class="num">CGST</th><th class="num">SGST</th><th class="num">IGST</th><th class="num">Total Tax</th></tr></thead>
          <tbody>
            ${GST_SUMMARY.map(r => `
              <tr>
                <td>${r.type}</td>
                <td class="num">${fmtINR(r.taxable)}</td>
                <td class="num">${r.cgst ? fmtINR(r.cgst) : '—'}</td>
                <td class="num">${r.sgst ? fmtINR(r.sgst) : '—'}</td>
                <td class="num">${r.igst ? fmtINR(r.igst) : '—'}</td>
                <td class="num">${fmtINR(r.total)}</td>
              </tr>
            `).join('')}
            <tr class="total-row">
              <td>TOTAL</td>
              <td class="num">₹64,25,000</td>
              <td class="num">₹1,44,000</td>
              <td class="num">₹1,44,000</td>
              <td class="num">₹5,40,000</td>
              <td class="num">₹8,28,000</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="rpt-section">
      <div class="rpt-grid-2">
        <div class="rpt-chart-card">
          <header class="rpt-chart-card__head"><div><p class="rpt-chart-card__title">Tax Type Split</p><p class="rpt-chart-card__sub">% of total taxable revenue</p></div></header>
          <div class="rpt-chart-card__body"><canvas id="chart-tax-split"></canvas></div>
        </div>
        <div class="rpt-chart-card">
          <header class="rpt-chart-card__head"><div><p class="rpt-chart-card__title">Tax Trend</p><p class="rpt-chart-card__sub">IGST · CGST · SGST · 6 months</p></div></header>
          <div class="rpt-chart-card__body"><canvas id="chart-tax-trend"></canvas></div>
        </div>
      </div>
    </section>

    <section class="rpt-section">
      <div class="rpt-section__head">
        <div><h3 class="rpt-section__title">HSN/SAC Code Report</h3><p class="rpt-section__sub">Service categorization for filing</p></div>
        <button class="btn btn--ghost btn--sm">Export HSN CSV</button>
      </div>
      <div class="rpt-table-wrap">
        <table class="rpt-table">
          <thead><tr><th>HSN Code</th><th>Description</th><th class="num">Invoices</th><th class="num">Taxable Value</th><th class="num">Rate</th><th class="num">Tax Amount</th></tr></thead>
          <tbody>
            ${HSN_REPORT.map(r => `
              <tr>
                <td><strong>${r.code}</strong></td>
                <td>${r.desc}</td>
                <td class="num">${r.count}</td>
                <td class="num">${fmtINR(r.taxable)}</td>
                <td class="num">${r.rate}%</td>
                <td class="num">${r.tax > 0 ? fmtINR(r.tax) : '— (SEZ)'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </section>

    <section class="rpt-section">
      <div class="rpt-section__head"><div><h3 class="rpt-section__title">Tax Override Log</h3><p class="rpt-section__sub">Manual overrides requiring audit</p></div></div>
      <div class="rpt-table-wrap">
        <table class="rpt-table">
          <thead><tr><th>Date</th><th>Invoice</th><th>Original</th><th>Override To</th><th>Reason</th><th>By</th><th>Approved By</th></tr></thead>
          <tbody>
            <tr><td>15 Jun 2026</td><td><a class="rpt-link" href="../invoices/?id=INV-2406">INV-2406</a></td><td>IGST 18%</td><td>CGST+SGST</td><td>Client moved to Karnataka</td><td>Priya Sharma</td><td>Rajesh Kumar</td></tr>
          </tbody>
        </table>
      </div>
    </section>
  `;
  setTimeout(() => {
    drawTaxSplit();
    drawTaxTrend();
  }, 0);
}

function drawTaxSplit() {
  const ctx = document.getElementById('chart-tax-split'); if (!ctx) return;
  state.charts['chart-tax-split'] = new Chart(ctx, {
    type: 'pie',
    data: { labels: ['IGST 18%', 'CGST+SGST', 'SEZ/LUT', 'Zero/Exempt'], datasets: [{ data: [58, 28, 11, 3], backgroundColor: ['#1a1f5e', '#2a52a8', '#3b82c4', '#94a3b8'], borderWidth: 2, borderColor: '#fff' }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { boxWidth: 10, font: { size: 11 } } } } },
  });
}

function drawTaxTrend() {
  const ctx = document.getElementById('chart-tax-trend'); if (!ctx) return;
  state.charts['chart-tax-trend'] = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        { label: 'IGST', data: [3.2, 4.0, 3.5, 4.8, 4.3, 5.4], borderColor: '#1a1f5e', tension: .3, borderWidth: 2 },
        { label: 'CGST', data: [1.0, 1.2, 1.1, 1.4, 1.3, 1.44], borderColor: '#2a52a8', tension: .3, borderWidth: 2 },
        { label: 'SGST', data: [1.0, 1.2, 1.1, 1.4, 1.3, 1.44], borderColor: '#3b82c4', tension: .3, borderWidth: 2, borderDash: [4, 2] },
      ],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, padding: 12, font: { size: 11 } } } },
      scales: { x: { grid: { display: false } }, y: { beginAtZero: true, grid: { color: '#e8ecf4' }, ticks: { callback: v => '₹' + v + 'L' } } },
    },
  });
}

// ── TAB 7 — OPERATIONAL ──────────────────────────────────────────────
function renderOperational(panel) {
  panel.innerHTML = `
    <section class="rpt-section">
      <div class="rpt-stat-row">
        <div class="rpt-stat"><p class="rpt-stat__label">Avg Invoice Gen Time</p><p class="rpt-stat__value">2.3 days</p><p class="rpt-stat__sub">From approval to send</p></div>
        <div class="rpt-stat rpt-stat--success"><p class="rpt-stat__label">Avg Approval Time</p><p class="rpt-stat__value">1.8 days</p><p class="rpt-stat__sub">↓ 0.4 days vs last month</p></div>
        <div class="rpt-stat rpt-stat--royal"><p class="rpt-stat__label">Timesheet Approval Rate</p><p class="rpt-stat__value">94.2%</p><p class="rpt-stat__sub">On first review</p></div>
        <div class="rpt-stat rpt-stat--danger"><p class="rpt-stat__label">Invoice Rejection Rate</p><p class="rpt-stat__value">8.3%</p><p class="rpt-stat__sub">Above benchmark</p></div>
      </div>
    </section>

    <section class="rpt-section">
      <div class="rpt-grid-2">
        <div class="rpt-chart-card">
          <header class="rpt-chart-card__head"><div><p class="rpt-chart-card__title">Approval Time Trend</p><p class="rpt-chart-card__sub">Monthly average · Target 2 days</p></div></header>
          <div class="rpt-chart-card__body"><canvas id="chart-approval-time"></canvas></div>
        </div>
        <div class="rpt-chart-card">
          <header class="rpt-chart-card__head"><div><p class="rpt-chart-card__title">Approval Outcome Split</p><p class="rpt-chart-card__sub">Last 6 months</p></div></header>
          <div class="rpt-chart-card__body"><canvas id="chart-approval-outcomes"></canvas></div>
        </div>
      </div>
    </section>

    <section class="rpt-section">
      <div class="rpt-section__head"><div><h3 class="rpt-section__title">Timesheet Submission Compliance</h3><p class="rpt-section__sub">On-time submission rate per consultant</p></div></div>
      <div class="rpt-table-wrap">
        <table class="rpt-table">
          <thead><tr><th>Consultant</th><th class="num">Periods</th><th class="num">On Time</th><th class="num">Late</th><th class="num">Rejected</th><th class="num">Compliance</th><th>Trend</th></tr></thead>
          <tbody>
            ${TIMESHEET_COMPLIANCE.map(t => `
              <tr>
                <td>${t.name}</td>
                <td class="num">${t.periods}</td>
                <td class="num">${t.onTime}</td>
                <td class="num">${t.late}</td>
                <td class="num">${t.rej}</td>
                <td class="num">${t.rate === null ? '<span style="color:var(--text-secondary)">N/A</span>' : `<span class="rpt-pill ${t.rate >= 90 ? 'rpt-pill--success' : t.rate >= 75 ? 'rpt-pill--warning' : 'rpt-pill--danger'}">${t.rate}%</span>`}</td>
                <td>${t.trend === '↑' ? '<span style="color:var(--success)">↑</span>' : t.trend === '↓' ? '<span style="color:var(--danger)">↓</span>' : t.trend}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </section>

    <section class="rpt-section">
      <div class="rpt-chart-card">
        <header class="rpt-chart-card__head"><div><p class="rpt-chart-card__title">Invoice Lifecycle Metrics</p><p class="rpt-chart-card__sub">Time taken at each stage (avg days)</p></div></header>
        <div class="rpt-funnel">
          ${LIFECYCLE.map(s => {
            const pct = (s.days / 20) * 100;   // max 20 days for scaling
            return `
              <div class="rpt-funnel__step">
                <div>
                  <p class="rpt-funnel__title">${s.title}</p>
                  <p class="rpt-funnel__sub">${s.sub}</p>
                </div>
                <div class="rpt-funnel__bar"><div class="rpt-funnel__bar-fill" style="width:${Math.min(pct, 100)}%"></div></div>
                <div class="rpt-funnel__days">${s.days}<small>days</small></div>
              </div>
            `;
          }).join('')}
        </div>
        <div class="rpt-funnel-summary">
          <div class="rpt-funnel-summary__cell"><p class="rpt-funnel-summary__label">Total Cycle</p><p class="rpt-funnel-summary__value">23.8 days</p></div>
          <div class="rpt-funnel-summary__cell"><p class="rpt-funnel-summary__label">Target</p><p class="rpt-funnel-summary__value">20 days</p></div>
          <div class="rpt-funnel-summary__cell"><p class="rpt-funnel-summary__label">Delta</p><p class="rpt-funnel-summary__value rpt-funnel-summary__value--warning">+3.8 days</p></div>
        </div>
        <div class="rpt-bottleneck">
          <span>⚠</span>
          <span><strong>Bottleneck identified:</strong> Stage 5 (Payment collection) is the primary bottleneck at 18.2 days average. Consider shorter payment terms or early payment incentives.</span>
        </div>
      </div>
    </section>

    <section class="rpt-section">
      <div class="rpt-section__head"><div><h3 class="rpt-section__title">Key Insights</h3><p class="rpt-section__sub">AI-generated observations</p></div><button class="btn btn--ghost btn--sm" id="refresh-insights">Refresh</button></div>
      <div class="rpt-insights" id="insights-grid"></div>
    </section>
  `;
  setTimeout(() => {
    drawApprovalTime();
    drawApprovalOutcomes();
    renderInsights();
  }, 0);
}

function drawApprovalTime() {
  const ctx = document.getElementById('chart-approval-time'); if (!ctx) return;
  state.charts['chart-approval-time'] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: APPROVAL_TIME.labels,
      datasets: [
        { label: 'Avg days', data: APPROVAL_TIME.values, backgroundColor: APPROVAL_TIME.values.map(v => v <= 2 ? '#10b981' : v <= 4 ? '#f59e0b' : '#ef4444'), borderRadius: 4 },
        { label: 'Target 2d', data: [2, 2, 2, 2, 2, 2], type: 'line', borderColor: '#1a1f5e', borderDash: [6, 4], pointRadius: 0, borderWidth: 1.5, fill: false },
      ],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, padding: 12, font: { size: 11 } } } },
      scales: { x: { grid: { display: false } }, y: { beginAtZero: true, grid: { color: '#e8ecf4' }, ticks: { callback: v => v + 'd' } } },
    },
  });
}

function drawApprovalOutcomes() {
  const ctx = document.getElementById('chart-approval-outcomes'); if (!ctx) return;
  state.charts['chart-approval-outcomes'] = new Chart(ctx, {
    type: 'doughnut',
    data: { labels: APPROVAL_OUTCOMES.labels, datasets: [{ data: APPROVAL_OUTCOMES.values, backgroundColor: APPROVAL_OUTCOMES.colors, borderWidth: 2, borderColor: '#fff' }] },
    options: {
      responsive: true, maintainAspectRatio: false, cutout: '64%',
      plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 11 } } }, tooltip: { callbacks: { label: c => `${c.label}: ${c.parsed}%` } } },
    },
  });
}

function renderInsights() {
  const grid = document.getElementById('insights-grid');
  if (!grid) return;
  grid.innerHTML = INSIGHTS.filter(i => !state.insightsDismissed.has(i.id)).map(i => `
    <article class="rpt-insight rpt-insight--${i.kind}" data-id="${i.id}">
      <button class="rpt-insight__dismiss" data-dismiss="${i.id}" aria-label="Dismiss">×</button>
      <span class="rpt-insight__icon">${i.icon}</span>
      <p class="rpt-insight__title">${i.title}</p>
      <p class="rpt-insight__body">${i.body}</p>
      <div class="rpt-insight__actions">
        ${i.actions.map(a => a.tab
          ? `<button class="rpt-insight__action" data-jump-tab="${a.tab}">${a.label}</button>`
          : `<a class="rpt-insight__action" href="${a.href}">${a.label}</a>`
        ).join('')}
      </div>
    </article>
  `).join('') || `<p style="color:var(--text-secondary);font-size:13px">All insights dismissed. <button class="rpt-link" id="reset-insights">Reset</button></p>`;

  grid.querySelectorAll('[data-dismiss]').forEach(b => {
    b.addEventListener('click', e => {
      e.stopPropagation();
      state.insightsDismissed.add(b.dataset.dismiss);
      renderInsights();
    });
  });
  grid.querySelectorAll('[data-jump-tab]').forEach(b => {
    b.addEventListener('click', () => switchTab(b.dataset.jumpTab));
  });
  const reset = grid.querySelector('#reset-insights');
  if (reset) reset.addEventListener('click', () => { state.insightsDismissed.clear(); renderInsights(); });
}

// ═══════════════════════════════════════════════════════════════════════
//  MODALS — Export + Schedule
// ═══════════════════════════════════════════════════════════════════════
function openExportModal() {
  const inner = document.getElementById('modal-inner');
  inner.innerHTML = `
    <header class="apv-m-head">
      <h2 class="apv-m-title">Export Report</h2>
      <button class="apv-m-close" data-modal-close>×</button>
    </header>
    <div class="apv-m-body">
      <p class="apv-m-section-title">Report Type</p>
      <div class="pay-type-radio">
        <label><input type="radio" name="rpt-type" value="revenue" checked /><div><span class="pay-type-radio__title">Revenue Summary</span><p class="pay-type-radio__sub">Monthly revenue + collection + forecast</p></div></label>
        <label><input type="radio" name="rpt-type" value="invoice" /><div><span class="pay-type-radio__title">Invoice Detail</span><p class="pay-type-radio__sub">Full invoice history + status</p></div></label>
        <label><input type="radio" name="rpt-type" value="tax" /><div><span class="pay-type-radio__title">Tax Summary (GSTR-1)</span><p class="pay-type-radio__sub">GST filing format</p></div></label>
        <label><input type="radio" name="rpt-type" value="complete" /><div><span class="pay-type-radio__title">Complete Platform Report</span><p class="pay-type-radio__sub">All 7 tabs · executive summary</p></div></label>
      </div>
      <p class="apv-m-section-title" style="margin-top:14px">Format</p>
      <div class="pay-mode-grid" id="rpt-fmt-grid">
        <button class="pay-mode-btn is-active" data-fmt="pdf">📄 PDF</button>
        <button class="pay-mode-btn" data-fmt="xlsx">📊 Excel</button>
        <button class="pay-mode-btn" data-fmt="csv">📋 CSV</button>
        <button class="pay-mode-btn" data-fmt="pptx">🎯 PowerPoint</button>
      </div>
      <p class="apv-m-section-title" style="margin-top:14px">Period</p>
      <p class="apv-m-sig">Will export for: <strong>${PERIOD_LABELS[state.period]}</strong></p>
      <p class="apv-m-section-title" style="margin-top:14px">Sections to Include</p>
      <div class="apv-m-options">
        <label class="apv-m-option"><input type="checkbox" checked /> Executive Summary (KPI strip)</label>
        <label class="apv-m-option"><input type="checkbox" checked /> Charts and Visualizations</label>
        <label class="apv-m-option"><input type="checkbox" checked /> Data Tables</label>
        <label class="apv-m-option"><input type="checkbox" checked /> AI Insights</label>
        <label class="apv-m-option"><input type="checkbox" /> Raw transaction data</label>
        <label class="apv-m-option"><input type="checkbox" /> Audit trail references</label>
      </div>
      <div class="rpt-export-progress" id="export-progress" hidden><div class="rpt-export-progress__fill" id="export-fill"></div></div>
    </div>
    <footer class="apv-m-foot">
      <button class="btn btn--ghost" data-modal-close>Cancel</button>
      <button class="btn btn--primary" id="export-go">Generate Export</button>
    </footer>
  `;
  showModal();
  document.querySelectorAll('#rpt-fmt-grid .pay-mode-btn').forEach(b => {
    b.addEventListener('click', e => { e.preventDefault(); document.querySelectorAll('#rpt-fmt-grid .pay-mode-btn').forEach(x => x.classList.remove('is-active')); b.classList.add('is-active'); });
  });
  document.getElementById('export-go').addEventListener('click', () => {
    const type = document.querySelector('[name="rpt-type"]:checked').value;
    const fmt = document.querySelector('#rpt-fmt-grid .pay-mode-btn.is-active').dataset.fmt;
    runExport(type, fmt);
  });
}

function runExport(type, fmt) {
  const bar = document.getElementById('export-progress');
  const fill = document.getElementById('export-fill');
  bar.hidden = false;
  let pct = 0;
  const tick = () => {
    pct += 12;
    fill.style.width = Math.min(pct, 100) + '%';
    if (pct >= 100) {
      closeModal();
      if (fmt === 'csv') doCSVExport(type);
      else if (fmt === 'pdf') { window.print(); toast({ type: 'success', title: `✓ ${type} report ready`, subtitle: `PDF · ${PERIOD_LABELS[state.period]}` }); }
      else toast({ type: 'success', title: `✓ ${type.toUpperCase()} export complete`, subtitle: `${fmt.toUpperCase()} · ${PERIOD_LABELS[state.period]}` });
    } else setTimeout(tick, 80);
  };
  tick();
}

function doCSVExport(type) {
  let rows;
  if (type === 'revenue') {
    rows = ['Month,Invoiced(L),Collected(L),Outstanding(L),Overdue(L),Rate(%),vsTarget(%),vsLY(%)']
      .concat(MONTHLY_SUMMARY.map(r => [r.m, r.inv, r.col, r.out, r.od, r.rate, r.vsTarget, r.vsLY].join(',')));
  } else if (type === 'tax') {
    rows = ['TaxType,Taxable,CGST,SGST,IGST,Total']
      .concat(GST_SUMMARY.map(r => [r.type, r.taxable, r.cgst, r.sgst, r.igst, r.total].join(',')));
  } else {
    rows = ['Client,Invoiced,Collected,Rate']
      .concat(CLIENT_REVENUE.map(c => [c.name, c.invoiced, c.collected, c.rate].join(',')));
  }
  const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${type}-report-${Date.now()}.csv`;
  a.click();
  toast({ type: 'success', title: `✓ ${type} CSV downloaded`, subtitle: `${PERIOD_LABELS[state.period]}` });
}

function openScheduleModal() {
  const inner = document.getElementById('schedule-inner');
  const saved = JSON.parse(localStorage.getItem('rpt-schedules') || '[]');
  inner.innerHTML = `
    <header class="rpt-schedule__head">
      <div>
        <h2 class="rpt-schedule__title">Schedule Automated Reports</h2>
        <p class="rpt-schedule__sub">Weekly / monthly auto-email delivery</p>
      </div>
      <button class="apv-d-head__close" id="schedule-close" aria-label="Close">×</button>
    </header>
    <div class="rpt-schedule__body">
      ${saved.length === 0
        ? '<p style="color:var(--text-secondary);font-size:12px">No scheduled reports yet. Add one below.</p>'
        : saved.map((s, i) => `
          <div class="rpt-schedule-item">
            <div>
              <p class="rpt-schedule-item__name">${s.type} Report</p>
              <p class="rpt-schedule-item__sub">${s.freq} · ${s.day || s.date || ''} ${s.time} · ${s.format.toUpperCase()} · ${s.email}</p>
            </div>
            <div class="rpt-schedule-item__actions">
              <button class="btn btn--ghost btn--sm" data-pause="${i}">Pause</button>
              <button class="btn btn--ghost btn--sm" data-delete="${i}">×</button>
            </div>
          </div>
        `).join('')
      }
      <div class="rpt-schedule-add">
        <h3 class="rpt-schedule-add__title">Add New Schedule</h3>
        <div class="rpt-schedule__field"><label>Report Type</label><select id="sch-type"><option>Revenue Summary</option><option>Invoice Detail</option><option>Tax (GSTR-1)</option><option>Complete Platform</option></select></div>
        <div class="rpt-schedule__field"><label>Frequency</label><select id="sch-freq"><option>Weekly</option><option selected>Monthly</option><option>Quarterly</option></select></div>
        <div class="rpt-schedule__field"><label>Time</label><select id="sch-time"><option>09:00 AM</option><option>12:00 PM</option><option>06:00 PM</option></select></div>
        <div class="rpt-schedule__field"><label>Recipients (comma-separated)</label><input type="text" id="sch-email" value="priya@info.com" /></div>
        <div class="rpt-schedule__field"><label>Format</label><select id="sch-fmt"><option value="pdf">PDF</option><option value="xlsx">Excel</option></select></div>
      </div>
    </div>
    <footer class="rpt-schedule__foot">
      <button class="btn btn--ghost" id="schedule-cancel">Close</button>
      <button class="btn btn--primary" id="schedule-save">+ Add Schedule</button>
    </footer>
  `;
  document.getElementById('schedule-overlay').hidden = false;
  const p = document.getElementById('rpt-schedule');
  p.setAttribute('aria-hidden', 'false');
  requestAnimationFrame(() => p.classList.add('is-open'));
  document.getElementById('schedule-close').addEventListener('click', closeScheduleModal);
  document.getElementById('schedule-cancel').addEventListener('click', closeScheduleModal);
  document.getElementById('schedule-save').addEventListener('click', () => {
    const newSched = {
      type: document.getElementById('sch-type').value,
      freq: document.getElementById('sch-freq').value,
      time: document.getElementById('sch-time').value,
      email: document.getElementById('sch-email').value,
      format: document.getElementById('sch-fmt').value,
    };
    saved.push(newSched);
    localStorage.setItem('rpt-schedules', JSON.stringify(saved));
    toast({ type: 'success', title: '✓ Schedule added', subtitle: `${newSched.type} · ${newSched.freq} · ${newSched.email}` });
    openScheduleModal();   // refresh
  });
  inner.querySelectorAll('[data-delete]').forEach(b => {
    b.addEventListener('click', () => {
      saved.splice(+b.dataset.delete, 1);
      localStorage.setItem('rpt-schedules', JSON.stringify(saved));
      openScheduleModal();
    });
  });
}

function closeScheduleModal() {
  const p = document.getElementById('rpt-schedule');
  p.classList.remove('is-open');
  p.setAttribute('aria-hidden', 'true');
  setTimeout(() => { document.getElementById('schedule-overlay').hidden = true; }, 350);
}

function showModal() {
  document.getElementById('modal-overlay').hidden = false;
  const m = document.getElementById('rpt-modal');
  m.setAttribute('aria-hidden', 'false');
  requestAnimationFrame(() => m.classList.add('is-open'));
  m.querySelectorAll('[data-modal-close]').forEach(b => b.addEventListener('click', closeModal));
}
function closeModal() {
  const m = document.getElementById('rpt-modal');
  m.classList.remove('is-open');
  m.setAttribute('aria-hidden', 'true');
  setTimeout(() => { document.getElementById('modal-overlay').hidden = true; }, 200);
}

// ═══════════════════════════════════════════════════════════════════════
//  FILTER POPOVER + ACTIVE CHIPS
// ═══════════════════════════════════════════════════════════════════════
function renderActiveChips() {
  const c = document.getElementById('rpt-active-chips');
  if (!c) return;
  const f = state.filters;
  const entries = [];
  entries.push({ k: 'period', label: `Period: ${PERIOD_LABELS[state.period]}` });
  if (f.company !== 'all') entries.push({ k: 'company', label: `Company: ${f.company}` });
  if (f.client !== 'all') entries.push({ k: 'client', label: `Client: ${f.client}` });
  if (f.tax !== 'all') entries.push({ k: 'tax', label: `Tax: ${f.tax.toUpperCase()}` });
  if (state.compare !== 'off') entries.push({ k: 'compare', label: `Compare: ${state.compare}` });

  c.hidden = entries.length === 0;
  c.innerHTML = entries.map(e => `
    <span class="apv-filter-active-chip">${e.label}${e.k !== 'period' ? `<button data-clear="${e.k}">×</button>` : ''}</span>
  `).join('');
  c.querySelectorAll('[data-clear]').forEach(b => {
    b.addEventListener('click', () => {
      const k = b.dataset.clear;
      if (k === 'compare') state.compare = 'off';
      else state.filters[k] = 'all';
      const sel = document.getElementById('compare-select');
      if (sel && k === 'compare') sel.value = 'off';
      renderActiveChips();
      renderPanel();
    });
  });
}

// ═══════════════════════════════════════════════════════════════════════
//  TOAST
// ═══════════════════════════════════════════════════════════════════════
function toast({ type = 'info', title, subtitle, link, duration = 4500 }) {
  const region = document.getElementById('toast-region');
  const el = document.createElement('div');
  el.className = `toast toast--${type}`;
  el.innerHTML = `
    <span class="toast__icon"></span>
    <div class="toast__body">
      <p class="toast__title">${title}</p>
      ${subtitle ? `<p class="toast__sub">${subtitle}</p>` : ''}
      ${link ? `<a class="toast__link" href="${link.href}">${link.text}</a>` : ''}
    </div>
    <button class="toast__close" aria-label="Close">×</button>
  `;
  region.appendChild(el);
  requestAnimationFrame(() => el.classList.add('is-open'));
  const dismiss = () => { el.classList.remove('is-open'); setTimeout(() => el.remove(), 300); };
  el.querySelector('.toast__close').addEventListener('click', dismiss);
  setTimeout(dismiss, duration);
}

// ═══════════════════════════════════════════════════════════════════════
//  TAB SWITCH + INIT
// ═══════════════════════════════════════════════════════════════════════
function switchTab(t) {
  state.activeTab = t;
  document.querySelectorAll('.rpt-tabs .md-tab').forEach(x => {
    x.classList.toggle('is-active', x.dataset.tab === t);
    x.setAttribute('aria-selected', x.dataset.tab === t ? 'true' : 'false');
  });
  const url = new URL(location.href);
  url.searchParams.set('tab', t);
  history.pushState({}, '', url);
  renderPanel();
}

function init() {
  setChartDefaults();

  // URL state
  const params = new URLSearchParams(location.search);
  const tab = params.get('tab');
  if (tab && ['revenue', 'invoice', 'payment', 'utilization', 'client', 'tax', 'operational'].includes(tab)) {
    state.activeTab = tab;
  }
  const filter = params.get('filter');
  if (filter === 'overdue' || filter === 'outstanding') state.filters.client = 'all';

  // Tab clicks
  document.querySelectorAll('.rpt-tabs .md-tab').forEach(b => {
    b.addEventListener('click', () => switchTab(b.dataset.tab));
    if (b.dataset.tab === state.activeTab) {
      b.classList.add('is-active'); b.setAttribute('aria-selected', 'true');
    } else {
      b.classList.remove('is-active'); b.setAttribute('aria-selected', 'false');
    }
  });

  // Global KPI strip clicks (jump to relevant tab)
  document.querySelectorAll('.rpt-mini-kpi').forEach(b => {
    b.addEventListener('click', () => switchTab(b.dataset.jump));
  });

  // Period selector
  document.getElementById('period-select').addEventListener('change', e => {
    state.period = e.target.value;
    renderActiveChips();
    renderPanel();
    toast({ type: 'info', title: `Period: ${PERIOD_LABELS[state.period]}`, duration: 2500 });
  });

  // Compare toggle
  document.getElementById('compare-select').addEventListener('change', e => {
    state.compare = e.target.value;
    renderActiveChips();
    renderPanel();
    if (state.compare !== 'off') toast({ type: 'info', title: `Compare ${state.compare}`, subtitle: 'Charts show comparison lines', duration: 2500 });
  });

  // Filter popover
  const filterBtn = document.getElementById('btn-filter');
  const filterPop = document.getElementById('rpt-filter-popover');
  filterBtn.addEventListener('click', e => {
    e.stopPropagation();
    if (filterPop.hasAttribute('hidden')) {
      filterPop.removeAttribute('hidden');
    } else {
      filterPop.setAttribute('hidden', '');
    }
  });
  document.getElementById('rpt-filter-close').addEventListener('click', () => filterPop.setAttribute('hidden', ''));
  document.addEventListener('click', e => {
    if (filterPop.hasAttribute('hidden')) return;
    if (filterPop.contains(e.target) || e.target === filterBtn || filterBtn.contains(e.target)) return;
    filterPop.setAttribute('hidden', '');
  });
  document.getElementById('rpt-filter-tax').addEventListener('click', e => {
    const chip = e.target.closest('[data-tax]');
    if (!chip) return;
    document.querySelectorAll('#rpt-filter-tax .chip').forEach(c => c.classList.toggle('is-active', c === chip));
    state.filters.tax = chip.dataset.tax;
  });
  document.getElementById('rpt-filter-reset').addEventListener('click', () => {
    state.filters = { company: 'all', client: 'all', tax: 'all' };
    document.getElementById('rpt-filter-company').value = 'all';
    document.getElementById('rpt-filter-client').value = 'all';
    document.querySelectorAll('#rpt-filter-tax .chip').forEach(c => c.classList.toggle('is-active', c.dataset.tax === 'all'));
    renderActiveChips();
    renderPanel();
  });
  document.getElementById('rpt-filter-apply').addEventListener('click', () => {
    state.filters.company = document.getElementById('rpt-filter-company').value;
    state.filters.client = document.getElementById('rpt-filter-client').value;
    renderActiveChips();
    renderPanel();
    filterPop.setAttribute('hidden', '');
    toast({ type: 'success', title: 'Filters applied', duration: 2500 });
  });

  // Topbar buttons
  document.getElementById('btn-refresh').addEventListener('click', () => {
    renderPanel();
    toast({ type: 'success', title: '✓ Data refreshed', subtitle: `${PERIOD_LABELS[state.period]} · Just now`, duration: 2500 });
  });
  document.getElementById('btn-export').addEventListener('click', openExportModal);
  document.getElementById('btn-schedule').addEventListener('click', openScheduleModal);

  // Overlay closes
  document.getElementById('modal-overlay').addEventListener('click', closeModal);
  document.getElementById('schedule-overlay').addEventListener('click', closeScheduleModal);

  // ESC closes
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    if (document.getElementById('rpt-modal').classList.contains('is-open')) return closeModal();
    if (document.getElementById('rpt-schedule').classList.contains('is-open')) return closeScheduleModal();
    if (!filterPop.hasAttribute('hidden')) filterPop.setAttribute('hidden', '');
  });

  // popstate
  window.addEventListener('popstate', () => {
    const t = new URLSearchParams(location.search).get('tab') || 'revenue';
    switchTab(t);
  });

  // Boot
  renderActiveChips();
  renderPanel();
  document.body.classList.remove('is-loading');
}

document.addEventListener('DOMContentLoaded', init);
