/* ═══════════════════════════════════════════════════════════════════════
 *  PAYMENT MANAGEMENT — main state + logic
 *  Financial reconciliation hub
 *  Cross-screen sync via localStorage 'info-platform-state'
 * ════════════════════════════════════════════════════════════════════ */

// ── Lookups ───────────────────────────────────────────────────────────
const CLIENTS = {
  'CL-001': { id: 'CL-001', name: 'Accenture India', avatar: 'AC', state: 'Maharashtra' },
  'CL-002': { id: 'CL-002', name: 'TCS Limited', avatar: 'TC', state: 'Maharashtra' },
  'CL-003': { id: 'CL-003', name: 'Infosys BPM', avatar: 'IB', state: 'Karnataka' },
  'CL-004': { id: 'CL-004', name: 'Cognizant Tech', avatar: 'CG', state: 'Tamil Nadu' },
  'CL-005': { id: 'CL-005', name: 'Wipro Tech', avatar: 'WP', state: 'Karnataka' },
  'CL-006': { id: 'CL-006', name: 'HCL Methods', avatar: 'HC', state: 'Tamil Nadu' },
};

const USD_RATE = 83.25;
const TODAY = '2026-06-01';

// ── 10 payment records ───────────────────────────────────────────────
const PAYMENTS = [
  // ─── Overdue (2) ───
  {
    id: 'PAY-001', invoiceRef: 'INV-2405', clientId: 'CL-006',
    consultant: 'Sneha Pillai', amount: 320000, paid: 0, balance: 320000,
    payDate: null, dueDate: '2026-06-01', mode: null,
    status: 'overdue', daysOverdue: 29,
    taxType: 'IGST 18%', taxAmount: 48000, total: 368000,
    period: 'May 2026', invDate: '2026-06-01',
    assignment: 'HCL — DevOps Setup',
    timeline: [
      { when: '01 Jun · 09:00', msg: 'Invoice INV-2405 generated', by: 'Priya Sharma', type: 'done', icon: '📄' },
      { when: '02 Jun · 10:30', msg: 'Invoice approved by Rajesh Kumar', by: 'Rajesh Kumar', type: 'done', icon: '✅' },
      { when: '03 Jun · 11:00', msg: 'Invoice sent to HCL Methods', by: 'billing@hcl.com', type: 'done', icon: '📧' },
      { when: '04 Jun · 15:00', msg: 'Auto reminder sent (due date approaching)', by: 'System', type: 'warning', icon: '🔔' },
      { when: '10 Jun · 09:00', msg: 'Manual reminder sent', by: 'Priya Sharma', type: 'warning', icon: '🔔' },
      { when: '30 Jun · 09:00', msg: 'Payment overdue (29 days) — escalation notification sent', by: 'System', type: 'danger', icon: '⚠' },
    ],
    reminders: [
      { when: '04 Jun 2026', type: 'Auto Reminder', to: 'billing@hcl.com', msg: 'Invoice INV-2405 due in 3 days' },
      { when: '10 Jun 2026', type: 'Manual Reminder', to: 'billing@hcl.com', msg: 'Gentle reminder for overdue payment', by: 'Priya Sharma' },
      { when: '20 Jun 2026', type: 'Follow-up Reminder', to: 'billing@hcl.com', msg: 'Second reminder — payment overdue', by: 'Priya Sharma' },
    ],
    payments: [],
  },
  {
    id: 'PAY-002', invoiceRef: 'INV-2389', clientId: 'CL-003',
    consultant: 'Deepak Mehta', amount: 89400, paid: 0, balance: 89400,
    payDate: null, dueDate: '2026-05-15', mode: null,
    status: 'overdue', daysOverdue: 46,
    taxType: 'SEZ-LUT', taxAmount: 0, total: 89400,
    period: 'Apr 2026', invDate: '2026-04-30',
    assignment: 'Infosys — AI Solutions',
    timeline: [
      { when: '30 Apr · 10:00', msg: 'Invoice generated', by: 'Priya Sharma', type: 'done', icon: '📄' },
      { when: '01 May · 09:00', msg: 'Invoice sent', by: 'billing@infosys.com', type: 'done', icon: '📧' },
      { when: '15 May · 09:00', msg: 'Payment overdue (46 days)', by: 'System', type: 'danger', icon: '⚠' },
    ],
    reminders: [
      { when: '12 May 2026', type: 'Auto Reminder', to: 'billing@infosys.com', msg: 'Due in 3 days' },
      { when: '22 May 2026', type: 'Follow-up Reminder', to: 'billing@infosys.com', msg: 'Payment overdue', by: 'Priya Sharma' },
      { when: '05 Jun 2026', type: 'Final Notice', to: 'billing@infosys.com', msg: 'Final notice — escalation imminent', by: 'Priya Sharma' },
    ],
    payments: [],
    eligibleForWriteoff: true,
  },

  // ─── Outstanding (3) ───
  {
    id: 'PAY-003', invoiceRef: 'INV-2403', clientId: 'CL-003',
    consultant: 'Deepak Mehta', amount: 269170, paid: 0, balance: 269170,
    payDate: null, dueDate: '2026-07-17', mode: null,
    status: 'outstanding', daysRemaining: 46,
    taxType: 'SEZ-LUT', taxAmount: 0, total: 269170,
    period: 'Jun W2 2026', invDate: '2026-06-17',
    assignment: 'Infosys — AI Solutions',
    timeline: [
      { when: '17 Jun · 09:30', msg: 'Invoice generated', by: 'Priya Sharma', type: 'done', icon: '📄' },
      { when: '17 Jun · 14:00', msg: 'Approved by Rajesh Kumar', by: 'Rajesh Kumar', type: 'done', icon: '✅' },
      { when: '18 Jun · 09:00', msg: 'Sent to client', by: 'billing@infosys.com', type: 'done', icon: '📧' },
    ],
    reminders: [],
    payments: [],
  },
  {
    id: 'PAY-004', invoiceRef: 'INV-2404', clientId: 'CL-005',
    consultant: 'Kiran Nair', amount: 194940, paid: 0, balance: 194940,
    payDate: null, dueDate: '2026-07-10', mode: null,
    status: 'outstanding', daysRemaining: 39,
    taxType: 'CGST+SGST', taxAmount: 29742, total: 224682,
    period: 'Jun W2 2026', invDate: '2026-06-15',
    assignment: 'Wipro — QA Automation',
    timeline: [
      { when: '15 Jun · 09:00', msg: 'Invoice generated', by: 'Priya Sharma', type: 'done', icon: '📄' },
      { when: '15 Jun · 16:00', msg: 'Approved by Rajesh Kumar', by: 'Rajesh Kumar', type: 'done', icon: '✅' },
      { when: '16 Jun · 10:00', msg: 'Sent to client', by: 'billing@wipro.com', type: 'done', icon: '📧' },
    ],
    reminders: [],
    payments: [],
  },
  {
    id: 'PAY-005', invoiceRef: 'INV-2401', clientId: 'CL-001',
    consultant: 'Rahul Verma', amount: 118000, paid: 0, balance: 118000,
    payDate: null, dueDate: '2026-07-10', mode: null,
    status: 'outstanding', daysRemaining: 39,
    taxType: 'IGST 18%', taxAmount: 18000, total: 118000,
    period: 'Jun W1 2026', invDate: '2026-06-10',
    assignment: 'Accenture — Cloud Migration',
    timeline: [
      { when: '10 Jun · 09:45', msg: 'Invoice generated', by: 'Priya Sharma', type: 'done', icon: '📄' },
      { when: '10 Jun · 14:00', msg: 'Submitted for approval', by: 'Priya Sharma', type: 'done', icon: '📤' },
    ],
    reminders: [],
    payments: [],
  },

  // ─── Partial (2) ───
  {
    id: 'PAY-006', invoiceRef: 'INV-2397', clientId: 'CL-003',
    consultant: 'Deepak Mehta', amount: 238700, paid: 150000, balance: 88700,
    payDate: '2026-05-15', dueDate: '2026-06-14', mode: 'NEFT',
    status: 'partial', daysRemaining: 13,
    taxType: 'SEZ-LUT', taxAmount: 0, total: 238700,
    period: 'May W2 2026', invDate: '2026-05-15',
    assignment: 'Infosys — AI Solutions',
    timeline: [
      { when: '15 May · 10:00', msg: 'Invoice generated', by: 'Priya Sharma', type: 'done', icon: '📄' },
      { when: '16 May · 11:00', msg: 'Sent to client', by: 'billing@infosys.com', type: 'done', icon: '📧' },
      { when: '15 May · 14:00', msg: '₹1,50,000 partial payment received via NEFT', by: 'REF-NEFT-234567', type: 'done', icon: '💰' },
    ],
    reminders: [],
    payments: [
      { date: '2026-05-15', amount: 150000, mode: 'NEFT', ref: 'REF-NEFT-234567', by: 'Priya Sharma' },
    ],
  },
  {
    id: 'PAY-007', invoiceRef: 'INV-2390', clientId: 'CL-002',
    consultant: 'Anita Krishnan', amount: 180000, paid: 90000, balance: 90000,
    payDate: '2026-05-20', dueDate: '2026-06-30', mode: 'RTGS',
    status: 'partial', daysRemaining: 29,
    taxType: 'CGST+SGST', taxAmount: 32400, total: 212400,
    period: 'May 2026 Monthly', invDate: '2026-05-10',
    assignment: 'TCS — Data Engineering',
    timeline: [
      { when: '10 May · 09:30', msg: 'Invoice generated', by: 'Priya Sharma', type: 'done', icon: '📄' },
      { when: '11 May · 10:00', msg: 'Sent to client', by: 'billing@tcs.com', type: 'done', icon: '📧' },
      { when: '20 May · 11:30', msg: '₹90,000 partial payment via RTGS', by: 'REF-RTGS-987654', type: 'done', icon: '💰' },
    ],
    reminders: [],
    payments: [
      { date: '2026-05-20', amount: 90000, mode: 'RTGS', ref: 'REF-RTGS-987654', by: 'Priya Sharma' },
    ],
  },

  // ─── Received / Paid in Full (3) ───
  {
    id: 'PAY-008', invoiceRef: 'INV-2400', clientId: 'CL-004',
    consultant: 'Rahul Verma', amount: 94400, paid: 94400, balance: 0,
    payDate: '2026-06-25', dueDate: '2026-07-08', mode: 'NEFT',
    status: 'paid', daysRemaining: 0,
    taxType: 'IGST 18%', taxAmount: 14400, total: 94400,
    period: 'Jun 2026', invDate: '2026-06-08',
    assignment: 'Cognizant — BI Dashboard',
    timeline: [
      { when: '08 Jun · 10:00', msg: 'Invoice generated', by: 'Priya Sharma', type: 'done', icon: '📄' },
      { when: '09 Jun · 09:00', msg: 'Sent to client', by: 'billing@cognizant.com', type: 'done', icon: '📧' },
      { when: '25 Jun · 11:30', msg: '₹94,400 full payment received via NEFT', by: 'REF-NEFT-456789', type: 'done', icon: '💰' },
    ],
    reminders: [],
    payments: [
      { date: '2026-06-25', amount: 94400, mode: 'NEFT', ref: 'REF-NEFT-456789', by: 'Priya Sharma' },
    ],
  },
  {
    id: 'PAY-009', invoiceRef: 'INV-2399', clientId: 'CL-005',
    consultant: 'Kiran Nair', amount: 162500, paid: 162500, balance: 0,
    payDate: '2026-06-20', dueDate: '2026-06-07', mode: 'RTGS',
    status: 'paid', daysRemaining: 0,
    taxType: 'CGST+SGST', taxAmount: 24750, total: 187250,
    period: 'May 2026', invDate: '2026-05-25',
    assignment: 'Wipro — QA Automation',
    timeline: [
      { when: '25 May · 09:00', msg: 'Invoice generated', by: 'Priya Sharma', type: 'done', icon: '📄' },
      { when: '20 Jun · 10:00', msg: '₹1,62,500 paid via RTGS', by: 'REF-RTGS-321654', type: 'done', icon: '💰' },
    ],
    reminders: [],
    payments: [
      { date: '2026-06-20', amount: 162500, mode: 'RTGS', ref: 'REF-RTGS-321654', by: 'Priya Sharma' },
    ],
  },
  {
    id: 'PAY-010', invoiceRef: 'INV-2396', clientId: 'CL-001',
    consultant: 'Rahul Verma', amount: 100000, paid: 100000, balance: 0,
    payDate: '2026-06-15', dueDate: '2026-06-22', mode: 'NEFT',
    status: 'paid', daysRemaining: 0,
    taxType: 'IGST 18%', taxAmount: 15254, total: 100000,
    period: 'May W4 2026', invDate: '2026-05-22',
    assignment: 'Accenture — Cloud Migration',
    timeline: [
      { when: '22 May · 09:30', msg: 'Invoice generated', by: 'Priya Sharma', type: 'done', icon: '📄' },
      { when: '15 Jun · 14:00', msg: '₹1,00,000 paid in full via NEFT', by: 'REF-NEFT-111222', type: 'done', icon: '💰' },
    ],
    reminders: [],
    payments: [
      { date: '2026-06-15', amount: 100000, mode: 'NEFT', ref: 'REF-NEFT-111222', by: 'Priya Sharma' },
    ],
  },
];

// ── Cashflow chart data ──────────────────────────────────────────────
const CASHFLOW = {
  '6m': {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    invoiced:    [28, 34, 30, 42, 38, 48],
    collected:   [22, 30, 26, 36, 33, 36.8],
    outstanding: [6, 4, 4, 6, 5, 11.4],
  },
  '3m': {
    labels: ['Apr', 'May', 'Jun'],
    invoiced: [42, 38, 48],
    collected: [36, 33, 36.8],
    outstanding: [6, 5, 11.4],
  },
  '1y': {
    labels: ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    invoiced: [22, 25, 28, 30, 32, 34, 28, 34, 30, 42, 38, 48],
    collected: [18, 22, 24, 26, 28, 30, 22, 30, 26, 36, 33, 36.8],
    outstanding: [4, 3, 4, 4, 4, 4, 6, 4, 4, 6, 5, 11.4],
  },
};

// ── Aging buckets ────────────────────────────────────────────────────
const AGING = [
  { label: '0–30 days', amount: 720000, count: 8, color: 'success' },
  { label: '31–60 days', amount: 280000, count: 3, color: 'warning' },
  { label: '61–90 days', amount: 105000, count: 1, color: 'orange' },
  { label: '>90 days', amount: 40000, count: 1, color: 'danger' },
];

// ── Periods (for topbar arrow navigation) ────────────────────────────
const PERIODS = [
  { label: 'Jan 2026', month: 0, year: 2026 },
  { label: 'Feb 2026', month: 1, year: 2026 },
  { label: 'Mar 2026', month: 2, year: 2026 },
  { label: 'Apr 2026', month: 3, year: 2026 },
  { label: 'May 2026', month: 4, year: 2026 },
  { label: 'June 2026', month: 5, year: 2026 },
];

// ── State ────────────────────────────────────────────────────────────
const state = {
  activeTab: 'all',
  view: 'table',
  selectedIds: new Set(),
  searchQuery: '',
  sortBy: 'status',
  currency: 'INR',
  cashflowRange: '6m',
  periodIdx: 5,        // start on June 2026
  periodFilter: false, // true = filter by invDate month
};

// ── Formatters ───────────────────────────────────────────────────────
const fmtINR = (n) => '₹' + Math.round(n).toLocaleString('en-IN');
const fmtINRShort = (n) => {
  if (n >= 10000000) return '₹' + (n / 10000000).toFixed(2).replace(/\.?0+$/, '') + 'Cr';
  if (n >= 100000) return '₹' + (n / 100000).toFixed(2).replace(/\.?0+$/, '') + 'L';
  return '₹' + Math.round(n).toLocaleString('en-IN');
};
const fmtUSD = (n) => '$' + n.toLocaleString('en-US', { maximumFractionDigits: 2 });
const fmtUSDShort = (n) => {
  if (n >= 1000000) return '$' + (n / 1000000).toFixed(2).replace(/\.?0+$/, '') + 'M';
  if (n >= 1000) return '$' + (n / 1000).toFixed(1).replace(/\.?0+$/, '') + 'K';
  return '$' + Math.round(n).toLocaleString('en-US');
};

// Currency-aware short formatter — reads state.currency
function fmtShort(inrAmount, cur) {
  cur = cur || state.currency || 'INR';
  if (cur === 'USD') return fmtUSDShort(inrAmount / USD_RATE);
  return fmtINRShort(inrAmount);
}

// Full amount formatter (no short form)
function fmtFull(inrAmount, cur) {
  cur = cur || state.currency || 'INR';
  if (cur === 'USD') return fmtUSD(Math.round(inrAmount / USD_RATE));
  return fmtINR(inrAmount);
}
const fmtDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

// ═══════════════════════════════════════════════════════════════════════
//  TAB RENDERING
// ═══════════════════════════════════════════════════════════════════════
function renderPanel() {
  const panel = document.getElementById('pay-panel');
  panel.innerHTML = '';

  let items = filterByTab(PAYMENTS);
  items = applyPeriodFilter(applySort(applySearch(items)));

  if (state.view === 'client') return renderClientView(panel);
  if (!items.length) return panel.appendChild(makeEmpty());

  renderTable(panel, items);
}

function updatePeriodLabel() {
  const p = PERIODS[state.periodIdx];
  if (!p) return;
  const label = document.getElementById('period-label');
  if (label) label.textContent = p.label;
  const prev = document.getElementById('period-prev');
  const next = document.getElementById('period-next');
  if (prev) prev.disabled = state.periodIdx === 0;
  if (next) next.disabled = state.periodIdx === PERIODS.length - 1;
}

function applyPeriodFilter(items) {
  if (!state.periodFilter) return items;
  const p = PERIODS[state.periodIdx];
  return items.filter(it => {
    const d = it.invDate || it.payDate || it.dueDate;
    if (!d) return false;
    const dt = new Date(d);
    return dt.getMonth() === p.month && dt.getFullYear() === p.year;
  });
}

function filterByTab(items) {
  switch (state.activeTab) {
    case 'received': return items.filter(p => p.status === 'paid');
    case 'outstanding': return items.filter(p => p.status === 'outstanding');
    case 'overdue': return items.filter(p => p.status === 'overdue');
    case 'partial': return items.filter(p => p.status === 'partial');
    case 'writtenoff': return items.filter(p => p.status === 'writtenoff');
    default: return items;
  }
}

function applySearch(items) {
  if (!state.searchQuery) return items;
  const q = state.searchQuery.toLowerCase();
  return items.filter(p => {
    const c = CLIENTS[p.clientId]?.name || '';
    return [p.invoiceRef, c, p.consultant, p.mode || '', ...(p.payments.map(x => x.ref))]
      .join(' ').toLowerCase().includes(q);
  });
}

function applySort(items) {
  const sorted = [...items];
  switch (state.sortBy) {
    case 'amount':
      sorted.sort((a, b) => b.amount - a.amount); break;
    case 'due':
      sorted.sort((a, b) => (a.dueDate || '') < (b.dueDate || '') ? -1 : 1); break;
    case 'client':
      sorted.sort((a, b) => (CLIENTS[a.clientId]?.name || '').localeCompare(CLIENTS[b.clientId]?.name || ''));
      break;
    case 'status':
    default:
      const order = { overdue: 0, outstanding: 1, partial: 2, paid: 3, writtenoff: 4 };
      sorted.sort((a, b) => order[a.status] - order[b.status]);
  }
  return sorted;
}

// ── TABLE VIEW ───────────────────────────────────────────────────────
function renderTable(panel, items) {
  const wrap = document.createElement('div');
  wrap.className = 'pay-table';
  wrap.innerHTML = `
    <div class="pay-table__head">
      <span><input type="checkbox" class="pay-row__check" id="pay-select-all" aria-label="Select all" /></span><span>Invoice #</span><span>Client / Consultant</span>
      <span style="text-align:right">Inv Amount</span>
      <span style="text-align:right">Paid</span>
      <span style="text-align:right">Balance</span>
      <span>Due</span><span>Pay Date</span>
      <span style="text-align:center">Mode</span>
      <span style="text-align:right">Status / Actions</span>
    </div>
  `;
  items.forEach(p => wrap.appendChild(makeRow(p)));
  panel.appendChild(wrap);
}

function makeRow(p) {
  const row = document.createElement('div');
  row.className = 'pay-row';
  row.dataset.id = p.id;
  row.dataset.status = p.status;

  const c = CLIENTS[p.clientId];
  const checked = state.selectedIds.has(p.id) ? 'checked' : '';
  if (checked) row.classList.add('is-selected');

  const dueBadge = makeDueBadge(p);
  const actions = makeRowActions(p);
  const balanceClass = p.balance === 0 ? 'pay-row__balance--zero' :
                       p.status === 'overdue' ? 'pay-row__balance--overdue' :
                       'pay-row__balance--due';

  row.innerHTML = `
    <input type="checkbox" class="pay-row__check" data-id="${p.id}" ${checked} aria-label="Select ${p.invoiceRef}" />
    <span class="pay-row__inv">${p.invoiceRef}</span>
    <div class="pay-row__client">
      <p class="pay-row__client-name">${c?.name || '—'}</p>
      <p class="pay-row__client-sub">${p.consultant}</p>
    </div>
    <span class="pay-row__amount" data-inr="${p.amount}">${fmtShort(p.amount)}</span>
    <span class="pay-row__paid ${p.paid === 0 ? 'pay-row__amount-muted' : ''}" data-inr="${p.paid}">${p.paid > 0 ? fmtShort(p.paid) : '—'}</span>
    <span class="pay-row__balance ${balanceClass}" data-inr="${p.balance}">${fmtShort(p.balance)}</span>
    <span class="pay-row__date">${fmtDate(p.dueDate).split(' ').slice(0, 2).join(' ')}</span>
    <span class="pay-row__date">${p.payDate ? fmtDate(p.payDate).split(' ').slice(0, 2).join(' ') : '—'}</span>
    <span class="pay-row__mode">${p.mode || '—'}</span>
    <div class="pay-row__status">
      <span class="pay-status-pill pay-status-pill--${p.status}">${statusLabel(p)}</span>
      ${dueBadge}
      <div class="pay-row__actions">${actions}</div>
    </div>
    ${p.status === 'partial' ? `<div class="pay-row__progress"><div class="pay-row__progress-fill" style="width:${Math.round((p.paid / p.amount) * 100)}%"></div></div>` : ''}
  `;
  return row;
}

function statusLabel(p) {
  if (p.status === 'paid') return '✓ Paid';
  if (p.status === 'overdue') return `Overdue · ${p.daysOverdue}d`;
  if (p.status === 'partial') return 'Partial';
  if (p.status === 'outstanding') return 'Outstanding';
  if (p.status === 'writtenoff') return 'Written Off';
  return p.status;
}

function makeDueBadge(p) {
  if (p.status === 'paid' || p.status === 'writtenoff') return '';
  if (p.status === 'overdue') return `<span class="pay-due-badge pay-due-badge--urgent">${p.daysOverdue} days overdue</span>`;
  const d = p.daysRemaining;
  if (d <= 7) return `<span class="pay-due-badge pay-due-badge--urgent">${d} days · urgent</span>`;
  if (d <= 14) return `<span class="pay-due-badge pay-due-badge--warning">${d} days left</span>`;
  return `<span class="pay-due-badge pay-due-badge--ok">${d} days left</span>`;
}

function makeRowActions(p) {
  if (p.status === 'paid') return `
    <button class="btn btn--sm btn--ghost" data-action="receipt" data-id="${p.id}">Receipt</button>
    <button class="btn btn--sm btn--ghost" data-action="view" data-id="${p.id}">View</button>
  `;
  if (p.status === 'partial') return `
    <button class="btn btn--sm btn--primary" data-action="record" data-id="${p.id}">Record Balance</button>
    <button class="btn btn--sm btn--ghost" data-action="view" data-id="${p.id}">View</button>
  `;
  if (p.status === 'overdue') return `
    <button class="btn btn--sm btn--warning" data-action="remind" data-id="${p.id}">Remind</button>
    <button class="btn btn--sm btn--primary" data-action="record" data-id="${p.id}">Record</button>
    <button class="btn btn--sm btn--ghost" data-action="view" data-id="${p.id}">View</button>
  `;
  return `
    <button class="btn btn--sm btn--primary" data-action="record" data-id="${p.id}">Record Payment</button>
    <button class="btn btn--sm btn--ghost" data-action="view" data-id="${p.id}">View</button>
  `;
}

// ── CLIENT VIEW ──────────────────────────────────────────────────────
function renderClientView(panel) {
  const clientData = {};
  Object.keys(CLIENTS).forEach(cid => {
    const items = PAYMENTS.filter(p => p.clientId === cid);
    if (!items.length) return;
    const totalInv = items.reduce((s, p) => s + p.amount, 0);
    const totalPaid = items.reduce((s, p) => s + p.paid, 0);
    const outstanding = items.filter(p => p.status === 'outstanding' || p.status === 'partial').reduce((s, p) => s + p.balance, 0);
    const overdue = items.filter(p => p.status === 'overdue').reduce((s, p) => s + p.balance, 0);
    const lastPaid = items.filter(p => p.payDate).sort((a, b) => (b.payDate || '').localeCompare(a.payDate || ''))[0];
    const nextDue = items.filter(p => p.status === 'outstanding').sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''))[0];
    const openCount = items.filter(p => p.status !== 'paid' && p.status !== 'writtenoff').length;
    const rate = totalInv > 0 ? (totalPaid / totalInv) * 100 : 0;
    clientData[cid] = { items, totalInv, totalPaid, outstanding, overdue, lastPaid, nextDue, openCount, rate };
  });

  const grid = document.createElement('div');
  grid.className = 'pay-clients';
  Object.entries(clientData).forEach(([cid, d]) => {
    const c = CLIENTS[cid];
    const card = document.createElement('article');
    card.className = 'pay-client-card';
    const overdueClass = d.overdue > 0 ? 'pay-client-card__cell-val--danger' : 'pay-client-card__cell-val--success';
    card.innerHTML = `
      <header class="pay-client-card__head">
        <div class="pay-client-card__avatar">${c.avatar}</div>
        <div>
          <h4 class="pay-client-card__name">${c.name}</h4>
          <p class="pay-client-card__company">INFO Services Pvt Ltd</p>
        </div>
        <span class="pay-client-card__pill">Active</span>
      </header>
      <div class="pay-client-card__grid">
        <div class="pay-client-card__cell">
          <span class="pay-client-card__cell-label">Total Invoiced</span>
          <span class="pay-client-card__cell-val">${fmtINRShort(d.totalInv)}</span>
        </div>
        <div class="pay-client-card__cell">
          <span class="pay-client-card__cell-label">Total Received</span>
          <span class="pay-client-card__cell-val pay-client-card__cell-val--success">${fmtINRShort(d.totalPaid)}</span>
        </div>
        <div class="pay-client-card__cell">
          <span class="pay-client-card__cell-label">Outstanding</span>
          <span class="pay-client-card__cell-val pay-client-card__cell-val--warning">${fmtINRShort(d.outstanding)}</span>
        </div>
        <div class="pay-client-card__cell">
          <span class="pay-client-card__cell-label">Overdue</span>
          <span class="pay-client-card__cell-val ${overdueClass}">${fmtINRShort(d.overdue)}</span>
        </div>
      </div>
      <div class="pay-client-card__rate-row">
        <span class="pay-client-card__rate-label">Collection Rate</span>
        <div class="pay-client-card__rate-bar">
          <div class="pay-client-card__rate-fill" style="width:${d.rate.toFixed(0)}%"></div>
        </div>
        <span class="pay-client-card__rate-val">${d.rate.toFixed(1)}%</span>
      </div>
      <div style="font-size:11px;color:var(--text-secondary);line-height:1.6">
        <p style="margin:0">Last Payment: <strong style="color:var(--brand-navy)">${d.lastPaid ? fmtDate(d.lastPaid.payDate) + ' · ' + fmtINRShort(d.lastPaid.paid) : '—'}</strong></p>
        <p style="margin:0">Next Due: <strong style="color:var(--brand-navy)">${d.nextDue ? fmtDate(d.nextDue.dueDate) + ' · ' + fmtINRShort(d.nextDue.balance) : '—'}</strong></p>
        <p style="margin:0">Open Invoices: <strong style="color:var(--brand-navy)">${d.openCount}</strong></p>
      </div>
      <div class="pay-client-card__footer">
        <button class="btn btn--ghost btn--sm" data-client-action="view" data-client="${cid}">View Payments</button>
        <button class="btn btn--primary btn--sm" data-client-action="record" data-client="${cid}">Record Payment</button>
      </div>
    `;
    grid.appendChild(card);
  });
  panel.appendChild(grid);
}

// ── EMPTY STATES ─────────────────────────────────────────────────────
function makeEmpty() {
  const variants = {
    all: { icon: 'navy', heading: 'No payments recorded yet', sub: 'Payments will appear here once invoices are sent and received', svg: '<rect x="2" y="5" width="20" height="14" rx="2.5"/><line x1="2" y1="10" x2="22" y2="10"/>' },
    received: { icon: 'success', heading: 'No received payments', sub: 'Paid invoices will appear here', svg: '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>' },
    outstanding: { icon: 'success', heading: 'No outstanding payments', sub: 'All invoices have been paid', svg: '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>' },
    overdue: { icon: 'success', heading: 'No overdue invoices', sub: 'All payments are within terms', svg: '<path d="M22 11.1V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4 12 14.01l-3-3"/>' },
    partial: { icon: 'success', heading: 'No partial payments', sub: 'All payments received in full', svg: '<circle cx="12" cy="12" r="10"/>' },
    writtenoff: { icon: 'grey', heading: 'No write-offs on record', sub: 'Write-off requests will appear here after approval', svg: '<polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/>' },
  };
  const v = variants[state.activeTab] || variants.all;
  const el = document.createElement('div');
  el.className = 'pay-empty';
  el.innerHTML = `
    <div class="pay-empty__icon pay-empty__icon--${v.icon}">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">${v.svg}</svg>
    </div>
    <h3 class="pay-empty__heading">${v.heading}</h3>
    <p class="pay-empty__sub">${v.sub}</p>
  `;
  return el;
}

// ═══════════════════════════════════════════════════════════════════════
//  DRAWER — 6 sections
// ═══════════════════════════════════════════════════════════════════════
function openDrawer(id) {
  const p = PAYMENTS.find(x => x.id === id);
  if (!p) return;
  const c = CLIENTS[p.clientId];
  const inner = document.getElementById('drawer-inner');

  inner.innerHTML = `
    <header class="apv-d-head">
      <div>
        <h2 class="apv-d-head__ref">${p.invoiceRef}</h2>
        <div class="apv-d-head__pills">
          <span style="font-size:13px;color:var(--text-secondary)">${c?.name || ''}</span>
          <span class="pay-status-pill pay-status-pill--${p.status}">${statusLabel(p)}</span>
        </div>
      </div>
      <div class="apv-d-head__actions">
        <button class="apv-d-head__more" aria-label="More"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg></button>
        <button class="apv-d-head__close" id="drawer-close" aria-label="Close">×</button>
      </div>
    </header>

    <div class="apv-d-body">
      <!-- Section 1 — Invoice Summary -->
      <section class="apv-d-section">
        <h3 class="apv-d-section__title">Invoice Summary</h3>
        <div class="apv-d-grid">
          <div class="apv-d-grid-cell"><span class="apv-d-grid-label">Invoice #</span><span class="apv-d-grid-val">${p.invoiceRef}</span></div>
          <div class="apv-d-grid-cell"><span class="apv-d-grid-label">Invoice Date</span><span class="apv-d-grid-val">${fmtDate(p.invDate)}</span></div>
          <div class="apv-d-grid-cell"><span class="apv-d-grid-label">Due Date</span><span class="apv-d-grid-val">${fmtDate(p.dueDate)}</span></div>
          <div class="apv-d-grid-cell"><span class="apv-d-grid-label">Period</span><span class="apv-d-grid-val">${p.period}</span></div>
          <div class="apv-d-grid-cell"><span class="apv-d-grid-label">Client</span><span class="apv-d-grid-val"><a href="../master-data/?tab=clients&id=${p.clientId}" style="color:var(--brand-royal);text-decoration:none">${c?.name || '—'}</a></span></div>
          <div class="apv-d-grid-cell"><span class="apv-d-grid-label">Consultant</span><span class="apv-d-grid-val">${p.consultant}</span></div>
          <div class="apv-d-grid-cell"><span class="apv-d-grid-label">Assignment</span><span class="apv-d-grid-val">${p.assignment}</span></div>
          <div class="apv-d-grid-cell"><span class="apv-d-grid-label">Tax Type</span><span class="apv-d-grid-val">${p.taxType}</span></div>
        </div>
        <div class="pay-d-fin">
          <div class="pay-d-fin__row"><span class="pay-d-fin__label">Invoice Amount</span><span class="pay-d-fin__val">${fmtFull(p.amount - p.taxAmount)}</span></div>
          <div class="pay-d-fin__row"><span class="pay-d-fin__label">Tax (${p.taxType})</span><span class="pay-d-fin__val">${fmtFull(p.taxAmount)}</span></div>
          <div class="pay-d-fin__divider"></div>
          <div class="pay-d-fin__row"><span class="pay-d-fin__label pay-d-fin__total">Total Due</span><span class="pay-d-fin__val pay-d-fin__total">${fmtFull(p.total)}</span></div>
          <div class="pay-d-fin__row"><span class="pay-d-fin__label">Amount Paid</span><span class="pay-d-fin__val">${fmtFull(p.paid)}</span></div>
          <div class="pay-d-fin__divider"></div>
          <div class="pay-d-fin__row"><span class="pay-d-fin__label pay-d-fin__total">Balance Due</span><span class="pay-d-fin__val pay-d-fin__total">${fmtFull(p.balance)}</span></div>
          <div class="pay-d-fin__row"><span class="pay-d-fin__label">${state.currency === 'USD' ? 'INR Equivalent' : 'USD Equivalent'}</span><span class="pay-d-fin__val">${state.currency === 'USD' ? fmtINR(p.balance) : fmtUSD(p.balance / USD_RATE)}</span></div>
          ${p.status === 'overdue' ? `<div class="pay-d-fin__divider"></div><div class="pay-d-fin__row"><span class="pay-d-fin__label pay-d-fin__overdue">Days Overdue</span><span class="pay-d-fin__val pay-d-fin__overdue">${p.daysOverdue} days 🔴</span></div>` : ''}
        </div>
      </section>

      <!-- Section 2 — Payment Timeline -->
      <section class="apv-d-section">
        <h3 class="apv-d-section__title">Payment Timeline</h3>
        <div class="pay-timeline">
          ${p.timeline.map(t => `
            <div class="pay-timeline__item pay-timeline__item--${t.type}">
              <p class="pay-timeline__when">${t.when}</p>
              <p class="pay-timeline__msg">${t.icon} ${t.msg}</p>
              <p class="pay-timeline__by">${t.by}</p>
            </div>
          `).join('')}
          ${p.status !== 'paid' && p.status !== 'writtenoff' ? '<div class="pay-timeline__item pay-timeline__item--warning"><p class="pay-timeline__when">Now</p><p class="pay-timeline__msg">⏳ Awaiting payment…</p></div>' : ''}
        </div>
        ${p.status !== 'paid' && p.status !== 'writtenoff' ? `<button class="btn btn--primary" data-d-action="record" data-id="${p.id}" style="margin-top:14px;width:100%">Record Payment Now</button>` : ''}
      </section>

      <!-- Section 3 — Payment History -->
      <section class="apv-d-section">
        <h3 class="apv-d-section__title">Payment History</h3>
        ${renderPaymentHistory(p)}
      </section>

      <!-- Section 4 — Reminder History -->
      <section class="apv-d-section">
        <h3 class="apv-d-section__title">Reminder History</h3>
        ${p.reminders.length === 0
          ? '<p style="font-size:12px;color:var(--text-secondary);margin:0">No reminders sent yet.</p>'
          : `<div class="pay-reminder-list">
              ${p.reminders.map(r => `
                <div class="pay-reminder">
                  <span class="pay-reminder__icon">🔔</span>
                  <div>
                    <p class="pay-reminder__when">${r.when} · ${r.type}</p>
                    <p class="pay-reminder__msg">${r.msg}</p>
                    <p class="pay-reminder__by">Sent to: ${r.to}${r.by ? ' · by ' + r.by : ''}</p>
                  </div>
                </div>
              `).join('')}
            </div>`
        }
        ${p.status !== 'paid' && p.status !== 'writtenoff' ? `<button class="btn btn--ghost" data-d-action="remind" data-id="${p.id}" style="margin-top:10px">Send Another Reminder</button>` : ''}
      </section>

      <!-- Section 5 — Write-off Option (if eligible) -->
      ${p.eligibleForWriteoff || (p.status === 'overdue' && p.daysOverdue > 30) ? `
        <section class="apv-d-section">
          <h3 class="apv-d-section__title">Write-off Option</h3>
          <div class="pay-writeoff-warn">
            <p class="pay-writeoff-warn__msg">⚠ This invoice is ${p.daysOverdue} days overdue. If payment is not expected, you may request to write off this amount.</p>
            <button class="btn btn--danger" data-d-action="writeoff" data-id="${p.id}">Request Write-off →</button>
          </div>
        </section>
      ` : ''}

      <!-- Section 6 — Internal Notes -->
      <section class="apv-d-section">
        <h3 class="apv-d-section__title">Internal Notes</h3>
        <div class="apv-notes">
          <div class="apv-note">
            <div class="apv-note__head">
              <span class="apv-note__by">Priya Sharma</span>
              <span class="apv-note__when">10 Jun · 14:00</span>
            </div>
            <p class="apv-note__body">Client confirmed payment will be made by 15 Jul. Follow up if not received.</p>
          </div>
        </div>
        <div class="apv-notes__input" style="margin-top:8px"><textarea placeholder="Add a note…"></textarea></div>
        <button class="btn btn--ghost btn--sm" style="margin-top:8px">Post Note</button>
      </section>
    </div>

    <footer class="apv-d-foot">
      ${renderDrawerFooter(p)}
    </footer>
  `;

  document.getElementById('drawer-overlay').hidden = false;
  const d = document.getElementById('pay-drawer');
  d.dataset.openId = id;
  d.setAttribute('aria-hidden', 'false');
  requestAnimationFrame(() => d.classList.add('is-open'));

  inner.querySelector('#drawer-close')?.addEventListener('click', closeDrawer);
  inner.querySelectorAll('[data-d-action]').forEach(b => {
    b.addEventListener('click', () => {
      const action = b.dataset.dAction;
      closeDrawer();
      setTimeout(() => {
        if (action === 'record') openRecordModal(p.id);
        else if (action === 'remind') openReminderModal(p.id);
        else if (action === 'writeoff') openWriteoffModal(p.id);
      }, 200);
    });
  });
}

function renderPaymentHistory(p) {
  if (p.status === 'paid') {
    return `
      <div class="pay-paid-banner">PAID IN FULL ✓</div>
      <div class="pay-hist-mini">
        <div class="pay-hist-mini__row pay-hist-mini__row-head">
          <span>Date</span><span>Ref</span><span>Mode</span><span style="text-align:right">Amount</span>
        </div>
        ${p.payments.map(pay => `
          <div class="pay-hist-mini__row">
            <span>${fmtDate(pay.date).split(' ').slice(0, 2).join(' ')}</span>
            <span style="font-size:11px;font-weight:500">${pay.ref}</span>
            <span>${pay.mode}</span>
            <span style="text-align:right;font-weight:700;color:var(--brand-navy)">${fmtINR(pay.amount)}</span>
          </div>
        `).join('')}
      </div>
    `;
  }
  if (p.status === 'partial') {
    const pct = Math.round((p.paid / p.amount) * 100);
    return `
      <div class="pay-hist-mini">
        <div class="pay-hist-mini__row pay-hist-mini__row-head">
          <span>Date</span><span>Ref</span><span>Mode</span><span style="text-align:right">Amount</span>
        </div>
        ${p.payments.map(pay => `
          <div class="pay-hist-mini__row">
            <span>${fmtDate(pay.date).split(' ').slice(0, 2).join(' ')}</span>
            <span style="font-size:11px;font-weight:500">${pay.ref}</span>
            <span>${pay.mode}</span>
            <span style="text-align:right;font-weight:700;color:var(--brand-navy)">${fmtINR(pay.amount)}</span>
          </div>
        `).join('')}
      </div>
      <div class="pay-partial-progress">
        <div class="pay-partial-progress__bar">
          <div class="pay-partial-progress__fill" style="width:${pct}%"></div>
        </div>
        <span class="pay-partial-progress__val">${pct}%</span>
      </div>
      <p style="font-size:12px;color:var(--text-secondary);margin:8px 0 0">
        Paid: <strong style="color:var(--brand-navy)">${fmtINR(p.paid)}</strong> · Remaining: <strong style="color:var(--warning)">${fmtINR(p.balance)}</strong>
      </p>
      <button class="btn btn--primary" data-d-action="record" data-id="${p.id}" style="margin-top:10px;width:100%">Record Remaining Balance</button>
    `;
  }
  return `
    <div style="text-align:center;padding:20px;background:var(--canvas);border-radius:10px">
      <p style="font-size:13px;color:var(--text-secondary);margin:0 0 10px">No payments recorded yet</p>
      <button class="btn btn--primary" data-d-action="record" data-id="${p.id}">+ Record First Payment</button>
    </div>
  `;
}

function renderDrawerFooter(p) {
  if (p.status === 'paid') return `
    <button class="btn btn--ghost">Download Receipt</button>
    <button class="btn btn--primary"><a href="../invoices/?id=${p.invoiceRef}" style="color:inherit;text-decoration:none">View Invoice →</a></button>
  `;
  if (p.status === 'partial') return `
    <button class="btn btn--ghost" data-d-action="remind" data-id="${p.id}">View History</button>
    <button class="btn btn--primary" data-d-action="record" data-id="${p.id}">Record Balance →</button>
  `;
  if (p.status === 'overdue') return `
    <button class="btn btn--warning" data-d-action="remind" data-id="${p.id}">Send Reminder</button>
    <button class="btn btn--primary" data-d-action="record" data-id="${p.id}">Record Payment →</button>
  `;
  return `
    <button class="btn btn--ghost" data-d-action="remind" data-id="${p.id}">Send Reminder</button>
    <button class="btn btn--primary" data-d-action="record" data-id="${p.id}">Record Payment →</button>
  `;
}

function closeDrawer() {
  const d = document.getElementById('pay-drawer');
  d.classList.remove('is-open');
  d.setAttribute('aria-hidden', 'true');
  setTimeout(() => { document.getElementById('drawer-overlay').hidden = true; }, 350);
}

// ═══════════════════════════════════════════════════════════════════════
//  MODALS
// ═══════════════════════════════════════════════════════════════════════
function openModal(html, opts = {}) {
  const inner = document.getElementById('modal-inner');
  inner.innerHTML = html;
  document.getElementById('modal-overlay').hidden = false;
  const m = document.getElementById('pay-modal');
  m.classList.toggle('pay-modal--lg', !!opts.large);
  m.setAttribute('aria-hidden', 'false');
  requestAnimationFrame(() => m.classList.add('is-open'));
  inner.querySelectorAll('[data-modal-close]').forEach(b => b.addEventListener('click', closeModal));
}

function closeModal() {
  const m = document.getElementById('pay-modal');
  m.classList.remove('is-open');
  m.setAttribute('aria-hidden', 'true');
  setTimeout(() => { document.getElementById('modal-overlay').hidden = true; }, 200);
}

// ── RECORD PAYMENT MODAL ─────────────────────────────────────────────
function openRecordModal(id) {
  const p = id ? PAYMENTS.find(x => x.id === id) : null;
  const c = p ? CLIENTS[p.clientId] : null;

  openModal(`
    <header class="apv-m-head">
      <div>
        <h2 class="apv-m-title">Record Payment</h2>
        ${p ? `<p style="font-size:12px;color:var(--text-secondary);margin:2px 0 0">${p.invoiceRef} · ${c?.name}</p>` : ''}
      </div>
      <button class="apv-m-close" data-modal-close>×</button>
    </header>
    <div class="apv-m-body">
      ${p ? `
        <div class="pay-pref-card">
          <div class="pay-pref-card__head">
            <p class="pay-pref-card__inv">${p.invoiceRef} · ${c?.name}</p>
            <p class="pay-pref-card__amt">${fmtINR(p.balance)}</p>
          </div>
          <p class="pay-pref-card__meta">${fmtINR(p.total)} total · ${fmtINR(p.balance)} due · Due ${fmtDate(p.dueDate)} · ${p.taxType}</p>
        </div>
      ` : `
        <div class="pay-field">
          <label class="pay-field__label">Invoice Number <span class="req">*</span></label>
          <input type="text" placeholder="Search invoice (e.g. INV-2401)…" id="record-inv-search" />
        </div>
      `}

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
        <div class="pay-field">
          <label class="pay-field__label">Payment Date <span class="req">*</span></label>
          <input type="date" id="record-date" value="${TODAY}" max="${TODAY}" />
        </div>
        <div class="pay-field">
          <label class="pay-field__label">Payment Amount <span class="req">*</span></label>
          <div class="pay-amount-input"><input type="number" id="record-amount" value="${p ? p.balance : ''}" /></div>
          ${p ? `<p class="pay-field__hint">Outstanding: ${fmtINR(p.balance)}</p>` : ''}
        </div>
      </div>

      <div class="pay-field">
        <label class="pay-field__label">Payment Mode <span class="req">*</span></label>
        <div class="pay-mode-grid">
          <button class="pay-mode-btn is-active" data-mode="NEFT"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><rect x="2" y="5" width="20" height="14" rx="2"/></svg>NEFT</button>
          <button class="pay-mode-btn" data-mode="RTGS"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>RTGS</button>
          <button class="pay-mode-btn" data-mode="Cheque"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><rect x="3" y="6" width="18" height="12" rx="1"/></svg>Cheque</button>
          <button class="pay-mode-btn" data-mode="UPI"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><rect x="5" y="2" width="14" height="20" rx="2"/></svg>UPI</button>
          <button class="pay-mode-btn" data-mode="Wire"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/></svg>Wire</button>
        </div>
      </div>

      <div class="pay-field">
        <label class="pay-field__label">Bank Reference / UTR <span class="req">*</span></label>
        <input type="text" id="record-ref" placeholder="Enter bank reference number" />
      </div>

      <div class="pay-field">
        <label class="pay-field__label">Payment Type</label>
        <div class="pay-type-radio">
          <label>
            <input type="radio" name="paytype" value="full" checked />
            <div>
              <span class="pay-type-radio__title">Full Payment ${p ? '· ' + fmtINR(p.balance) : ''}</span>
              <p class="pay-type-radio__sub">Clears entire outstanding balance</p>
            </div>
          </label>
          <label>
            <input type="radio" name="paytype" value="partial" />
            <div>
              <span class="pay-type-radio__title">Partial Payment</span>
              <p class="pay-type-radio__sub">Enter custom amount — balance remains outstanding</p>
            </div>
          </label>
        </div>
      </div>

      <div class="pay-field">
        <label class="pay-field__label">Payment Proof (optional)</label>
        <div class="pay-upload-zone">
          <div class="pay-upload-zone__icon"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg></div>
          <p class="pay-upload-zone__title">Drop bank statement or screenshot</p>
          <p class="pay-upload-zone__sub">PDF, JPG, PNG · max 5MB</p>
        </div>
      </div>

      <div class="apv-m-options">
        <label class="apv-m-option"><input type="checkbox" checked /> Generate payment receipt automatically</label>
        <label class="apv-m-option"><input type="checkbox" /> Notify client of payment confirmation</label>
        <label class="apv-m-option"><input type="checkbox" /> Add to bank reconciliation queue</label>
      </div>
    </div>
    <footer class="apv-m-foot">
      <button class="btn btn--ghost" data-modal-close>Cancel</button>
      <button class="btn btn--primary" id="record-submit">Record Payment</button>
    </footer>
  `);

  // Mode buttons
  document.querySelectorAll('.pay-mode-btn').forEach(b => {
    b.addEventListener('click', e => {
      e.preventDefault();
      document.querySelectorAll('.pay-mode-btn').forEach(x => x.classList.remove('is-active'));
      b.classList.add('is-active');
    });
  });

  document.getElementById('record-submit').addEventListener('click', () => {
    const amount = +document.getElementById('record-amount').value;
    const date = document.getElementById('record-date').value;
    const ref = document.getElementById('record-ref').value.trim();
    const mode = document.querySelector('.pay-mode-btn.is-active')?.dataset.mode || 'NEFT';

    if (!p) { toast({ type: 'warning', title: 'Select an invoice' }); return; }
    if (!amount || amount <= 0) { toast({ type: 'warning', title: 'Enter payment amount' }); return; }
    if (amount > p.balance) { toast({ type: 'warning', title: 'Amount exceeds balance', subtitle: `Balance is ${fmtINR(p.balance)}` }); return; }
    if (!ref) { toast({ type: 'warning', title: 'Enter bank reference' }); return; }

    runRecordProgress(p, { amount, date, ref, mode });
  });
}

function runRecordProgress(p, payment) {
  const inner = document.getElementById('modal-inner');
  inner.innerHTML = `
    <header class="apv-m-head"><h2 class="apv-m-title">Processing payment…</h2></header>
    <div class="apv-m-progress">
      <div class="apv-m-progress__item" data-step="1"><span class="apv-m-progress__check">○</span>Validating payment details…</div>
      <div class="apv-m-progress__item" data-step="2"><span class="apv-m-progress__check">○</span>Updating invoice status…</div>
      <div class="apv-m-progress__item" data-step="3"><span class="apv-m-progress__check">○</span>Recording transaction…</div>
      <div class="apv-m-progress__item" data-step="4"><span class="apv-m-progress__check">○</span>Generating receipt…</div>
      <div class="apv-m-progress__item" data-step="5"><span class="apv-m-progress__check">○</span>Notifying stakeholders…</div>
    </div>
  `;
  const steps = [...inner.querySelectorAll('.apv-m-progress__item')];
  let i = 0;
  const tick = () => {
    if (i > 0) {
      steps[i - 1].classList.remove('is-active');
      steps[i - 1].classList.add('is-done');
      steps[i - 1].querySelector('.apv-m-progress__check').textContent = '✓';
    }
    if (i < steps.length) {
      steps[i].classList.add('is-active');
      i++;
      setTimeout(tick, 200);
    } else {
      commitPayment(p, payment);
    }
  };
  tick();
}

function commitPayment(p, payment) {
  p.paid += payment.amount;
  p.balance = Math.max(0, p.amount - p.paid);
  p.payDate = payment.date;
  p.mode = payment.mode;
  p.payments.push({ date: payment.date, amount: payment.amount, mode: payment.mode, ref: payment.ref, by: 'Priya Sharma' });
  p.timeline.push({ when: 'Just now', msg: `${fmtINR(payment.amount)} ${p.balance === 0 ? 'full' : 'partial'} payment via ${payment.mode}`, by: payment.ref, type: 'done', icon: '💰' });

  if (p.balance === 0) p.status = 'paid';
  else if (p.paid > 0) p.status = 'partial';

  closeModal();
  renderPanel();
  updateCounts();
  renderOverdueBanner();
  syncCrossScreens();

  const c = CLIENTS[p.clientId];
  toast({
    type: 'success',
    title: p.balance === 0 ? `✓ Payment recorded — ${p.invoiceRef} marked as Paid` : `✓ Partial payment recorded — ${p.invoiceRef}`,
    subtitle: `${c?.name} · ${fmtINR(payment.amount)} · ${payment.mode}${p.balance > 0 ? ' · ' + fmtINR(p.balance) + ' remaining' : ''}`,
    link: { text: 'View Invoice →', href: '../invoices/?id=' + p.invoiceRef },
  });
}

// ── REMINDER MODAL ───────────────────────────────────────────────────
function openReminderModal(id) {
  const p = PAYMENTS.find(x => x.id === id);
  if (!p) return;
  const c = CLIENTS[p.clientId];

  openModal(`
    <header class="apv-m-head">
      <div>
        <h2 class="apv-m-title">Send Payment Reminder</h2>
        <p style="font-size:12px;color:var(--text-secondary);margin:2px 0 0">${p.invoiceRef} · ${c?.name} · ${fmtINR(p.balance)} ${p.status === 'overdue' ? `· ${p.daysOverdue} days overdue` : ''}</p>
      </div>
      <button class="apv-m-close" data-modal-close>×</button>
    </header>
    <div class="apv-m-body">
      <p class="apv-m-section-title">Reminder Type</p>
      <div class="pay-type-radio" id="remind-type">
        <label><input type="radio" name="rtype" value="gentle" checked /><div><span class="pay-type-radio__title">Gentle Reminder</span><p class="pay-type-radio__sub">Friendly tone, no urgency</p></div></label>
        <label><input type="radio" name="rtype" value="followup" /><div><span class="pay-type-radio__title">Follow-up Reminder</span><p class="pay-type-radio__sub">Moderate tone, mentions overdue</p></div></label>
        <label><input type="radio" name="rtype" value="final" /><div><span class="pay-type-radio__title">Final Notice</span><p class="pay-type-radio__sub">Firm tone, mentions escalation</p></div></label>
      </div>

      <p class="apv-m-section-title" style="margin-top:16px">Email Preview</p>
      <div class="pay-reminder-preview" id="remind-preview"></div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:14px">
        <div class="pay-field">
          <label class="pay-field__label">To</label>
          <input type="text" value="billing@${(c?.name || 'client').toLowerCase().split(' ')[0]}.com" readonly />
        </div>
        <div class="pay-field">
          <label class="pay-field__label">CC (optional)</label>
          <input type="text" placeholder="cc@email.com" />
        </div>
      </div>

      <div class="apv-m-options">
        <label class="apv-m-option"><input type="checkbox" checked /> Attach Invoice PDF</label>
        <label class="apv-m-option"><input type="checkbox" checked /> Attach Payment Details</label>
        <label class="apv-m-option"><input type="checkbox" checked /> Log in payment timeline</label>
      </div>
    </div>
    <footer class="apv-m-foot">
      <button class="btn btn--ghost" data-modal-close>Cancel</button>
      <button class="btn btn--warning" id="remind-send">Send Reminder</button>
    </footer>
  `);

  const update = () => {
    const t = document.querySelector('[name="rtype"]:checked').value;
    document.getElementById('remind-preview').textContent = makeReminderText(t, p, c);
  };
  document.getElementById('remind-type').addEventListener('change', update);
  update();

  document.getElementById('remind-send').addEventListener('click', () => {
    const t = document.querySelector('[name="rtype"]:checked').value;
    p.reminders.push({
      when: fmtDate(TODAY),
      type: { gentle: 'Gentle Reminder', followup: 'Follow-up Reminder', final: 'Final Notice' }[t],
      to: `billing@${(c?.name || 'client').toLowerCase().split(' ')[0]}.com`,
      msg: `${t} reminder sent`,
      by: 'Priya Sharma',
    });
    p.timeline.push({ when: 'Just now', msg: `${t.charAt(0).toUpperCase() + t.slice(1)} reminder sent`, by: 'Priya Sharma', type: 'warning', icon: '🔔' });
    closeModal();
    syncCrossScreens();
    toast({ type: 'success', title: `✓ Reminder sent to ${c?.name}`, subtitle: `${p.invoiceRef} · ${fmtINR(p.balance)}` });
  });
}

function makeReminderText(type, p, c) {
  if (type === 'gentle') return `Dear ${c?.name} Team,
I hope this message finds you well.
This is a friendly reminder that Invoice ${p.invoiceRef} for ${fmtINR(p.balance)} was due on ${fmtDate(p.dueDate)} and remains outstanding.
We would appreciate payment at your earliest convenience.
Please find the invoice details below…`;
  if (type === 'followup') return `Dear ${c?.name} Team,
This is a follow-up regarding Invoice ${p.invoiceRef} for ${fmtINR(p.balance)} which remains outstanding.
${p.daysOverdue ? `The payment is now ${p.daysOverdue} days past the due date.` : ''}
Please process the payment as soon as possible to avoid further follow-ups…`;
  return `Dear ${c?.name} Team,
This is our final notice regarding the outstanding payment of ${fmtINR(p.balance)} for Invoice ${p.invoiceRef}, now ${p.daysOverdue || 0} days overdue.
Immediate payment is required to avoid further escalation. Please remit the full amount within 5 business days…`;
}

// ── WRITE-OFF MODAL ──────────────────────────────────────────────────
function openWriteoffModal(id) {
  const p = PAYMENTS.find(x => x.id === id);
  if (!p) return;
  const c = CLIENTS[p.clientId];

  openModal(`
    <header class="apv-m-head">
      <h2 class="apv-m-title">Request Invoice Write-off</h2>
      <button class="apv-m-close" data-modal-close>×</button>
    </header>
    <div class="apv-m-body">
      <div class="pay-writeoff-warn" style="margin-bottom:14px">
        <p class="pay-writeoff-warn__msg">⚠ This action requires approval from Super Admin / Finance Director. A write-off permanently removes this amount from receivables.</p>
      </div>
      <div class="apv-m-summary">
        <div>
          <p class="apv-m-summary__title">${p.invoiceRef} · ${c?.name}</p>
          <p class="apv-m-summary__sub">${p.daysOverdue || 0} days overdue · ${p.reminders.length} reminders sent</p>
        </div>
        <p class="apv-m-summary__amt">${fmtINR(p.balance)}</p>
      </div>
      <div class="pay-field">
        <label class="pay-field__label">Write-off Reason <span class="req">*</span></label>
        <select id="writeoff-reason">
          <option value="">Select reason…</option>
          <option>Client unable to pay (financial difficulty)</option>
          <option>Disputed invoice — settled</option>
          <option>Amount not material (below threshold)</option>
          <option>Client relationship decision</option>
          <option>Legal settlement</option>
          <option>Other (specify in notes)</option>
        </select>
      </div>
      <div class="pay-field">
        <label class="pay-field__label">Supporting Documentation</label>
        <div class="pay-upload-zone">
          <div class="pay-upload-zone__icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/></svg></div>
          <p class="pay-upload-zone__sub">Upload supporting document (PDF, max 5MB)</p>
        </div>
      </div>
      <div class="pay-d-fin" style="margin:14px 0 0">
        <div class="pay-d-fin__row"><span class="pay-d-fin__label">Write-off Amount</span><span class="pay-d-fin__val">${fmtINR(p.balance)}</span></div>
        <div class="pay-d-fin__row"><span class="pay-d-fin__label">Tax Recoverable</span><span class="pay-d-fin__val">${fmtINR(p.taxAmount * (p.balance / p.amount))}</span></div>
        <div class="pay-d-fin__divider"></div>
        <div class="pay-d-fin__row"><span class="pay-d-fin__label pay-d-fin__total">Net Write-off</span><span class="pay-d-fin__val pay-d-fin__total">${fmtINR(p.balance - p.taxAmount * (p.balance / p.amount))}</span></div>
      </div>
      <label class="apv-m-option" style="margin-top:14px">
        <input type="checkbox" id="writeoff-confirm" /> I confirm this amount is uncollectible and should be written off
      </label>
    </div>
    <footer class="apv-m-foot">
      <button class="btn btn--ghost" data-modal-close>Cancel</button>
      <button class="btn btn--danger" id="writeoff-submit" disabled>Submit Write-off Request</button>
    </footer>
  `);

  const confirmBox = document.getElementById('writeoff-confirm');
  const submitBtn = document.getElementById('writeoff-submit');
  confirmBox.addEventListener('change', () => { submitBtn.disabled = !confirmBox.checked; });

  submitBtn.addEventListener('click', () => {
    const reason = document.getElementById('writeoff-reason').value;
    if (!reason) { toast({ type: 'warning', title: 'Select a reason' }); return; }
    p.status = 'writeoff-pending';
    closeModal();
    syncCrossScreens();
    toast({
      type: 'warning',
      title: 'Write-off request submitted for approval',
      subtitle: `${p.invoiceRef} · ${fmtINR(p.balance)} · Awaiting Super Admin sign-off`,
      link: { text: 'View in Approvals →', href: '../approvals/?tab=change' },
    });
  });
}

// ── EXPORT MODAL ─────────────────────────────────────────────────────
function openExportModal() {
  openModal(`
    <header class="apv-m-head">
      <h2 class="apv-m-title">Export Payment Data</h2>
      <button class="apv-m-close" data-modal-close>×</button>
    </header>
    <div class="apv-m-body">
      <p class="apv-m-section-title">Format</p>
      <div class="pay-type-radio">
        <label><input type="radio" name="exp-fmt" value="csv" checked /><div><span class="pay-type-radio__title">CSV</span><p class="pay-type-radio__sub">Raw data — all columns</p></div></label>
        <label><input type="radio" name="exp-fmt" value="xlsx" /><div><span class="pay-type-radio__title">Excel (XLSX)</span><p class="pay-type-radio__sub">Formatted with formulas + charts</p></div></label>
        <label><input type="radio" name="exp-fmt" value="pdf" /><div><span class="pay-type-radio__title">PDF Report</span><p class="pay-type-radio__sub">Formatted payment report</p></div></label>
        <label><input type="radio" name="exp-fmt" value="aging" /><div><span class="pay-type-radio__title">Aging Report</span><p class="pay-type-radio__sub">Outstanding by age bucket</p></div></label>
      </div>
      <p class="apv-m-section-title" style="margin-top:16px">Include</p>
      <div class="apv-m-options">
        <label class="apv-m-option"><input type="checkbox" checked /> Payment transactions</label>
        <label class="apv-m-option"><input type="checkbox" checked /> Outstanding invoices</label>
        <label class="apv-m-option"><input type="checkbox" checked /> Overdue invoices</label>
        <label class="apv-m-option"><input type="checkbox" /> Write-offs</label>
        <label class="apv-m-option"><input type="checkbox" /> Reminder history</label>
      </div>
    </div>
    <footer class="apv-m-foot">
      <button class="btn btn--ghost" data-modal-close>Cancel</button>
      <button class="btn btn--primary" id="export-go">Export</button>
    </footer>
  `);
  document.getElementById('export-go').addEventListener('click', () => {
    const fmt = document.querySelector('[name="exp-fmt"]:checked').value;
    if (fmt === 'csv') {
      const csv = ['Invoice,Client,Consultant,Amount,Paid,Balance,Due,PayDate,Mode,Status']
        .concat(PAYMENTS.map(p => [p.invoiceRef, CLIENTS[p.clientId]?.name, p.consultant, p.amount, p.paid, p.balance, p.dueDate || '', p.payDate || '', p.mode || '', p.status].map(v => `"${v}"`).join(',')))
        .join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `payments-${Date.now()}.csv`;
      a.click();
    }
    closeModal();
    toast({ type: 'success', title: `✓ ${fmt.toUpperCase()} export ready`, subtitle: 'File downloaded' });
  });
}

// ── BULK ACTIONS ─────────────────────────────────────────────────────
function updateBulkBar() {
  const bar = document.getElementById('pay-bulk-bar');
  const count = state.selectedIds.size;
  if (count < 1) {
    bar.classList.remove('is-open');
    setTimeout(() => { bar.hidden = true; }, 300);
    return;
  }
  bar.hidden = false;
  requestAnimationFrame(() => bar.classList.add('is-open'));
  const selected = PAYMENTS.filter(p => state.selectedIds.has(p.id));
  const total = selected.reduce((s, p) => s + p.balance, 0);
  document.getElementById('bulk-count').textContent = count;
  document.getElementById('bulk-total').textContent = `${fmtINRShort(total)} total`;
}

// ═══════════════════════════════════════════════════════════════════════
//  CHARTS (Chart.js)
// ═══════════════════════════════════════════════════════════════════════
let cashflowChart, agingChart;

function renderCashflow() {
  const data = CASHFLOW[state.cashflowRange];
  const ctx = document.getElementById('cashflow-chart');
  if (!ctx) return;
  if (cashflowChart) cashflowChart.destroy();
  cashflowChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.labels,
      datasets: [
        { label: 'Invoiced (₹L)', data: data.invoiced, borderColor: '#1a1f5e', backgroundColor: 'transparent', borderDash: [6, 4], tension: .3, pointRadius: 3, pointBackgroundColor: '#1a1f5e' },
        { label: 'Collected (₹L)', data: data.collected, borderColor: '#10b981', backgroundColor: 'rgba(16, 185, 129, .15)', fill: true, tension: .3, pointRadius: 3, pointBackgroundColor: '#10b981' },
        { label: 'Outstanding (₹L)', data: data.outstanding, borderColor: '#f59e0b', backgroundColor: 'rgba(245, 158, 11, .12)', fill: true, tension: .3, pointRadius: 3, pointBackgroundColor: '#f59e0b' },
      ],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { color: '#475569', font: { family: 'Poppins', size: 11 }, boxWidth: 10, padding: 12 } },
        tooltip: { backgroundColor: '#1a1f5e', padding: 10, titleFont: { family: 'Poppins', size: 12 }, bodyFont: { family: 'Poppins', size: 12 } },
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: '#64748b', font: { family: 'Poppins', size: 11 } } },
        y: { beginAtZero: true, grid: { color: '#e8ecf4' }, ticks: { color: '#64748b', font: { family: 'Poppins', size: 11 }, callback: v => '₹' + v + 'L' } },
      },
    },
  });
}

function renderAging() {
  const ctx = document.getElementById('aging-chart');
  if (!ctx) return;
  if (agingChart) agingChart.destroy();
  agingChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: AGING.map(a => a.label),
      datasets: [{
        data: AGING.map(a => a.amount / 100000),
        backgroundColor: ['#10b981', '#f59e0b', '#ea580c', '#ef4444'],
        borderRadius: 6,
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { backgroundColor: '#1a1f5e', callbacks: { label: c => '₹' + c.parsed.y.toFixed(2) + 'L' } } },
      scales: {
        x: { grid: { display: false }, ticks: { color: '#64748b', font: { family: 'Poppins', size: 11 } } },
        y: { beginAtZero: true, grid: { color: '#e8ecf4' }, ticks: { color: '#64748b', font: { family: 'Poppins', size: 11 }, callback: v => '₹' + v + 'L' } },
      },
    },
  });

  // Render aging list
  const list = document.getElementById('aging-list');
  const max = Math.max(...AGING.map(a => a.amount));
  list.innerHTML = AGING.map(a => `
    <li class="pay-aging-row">
      <span class="pay-aging-row__label">${a.label}</span>
      <div class="pay-aging-row__bar"><div class="pay-aging-row__fill pay-aging-row__fill--${a.color}" style="width:${(a.amount / max) * 100}%"></div></div>
      <span class="pay-aging-row__amount">${fmtINRShort(a.amount)}</span>
      <span class="pay-aging-row__count">${a.count} inv</span>
    </li>
  `).join('');
}

function renderSparkline() {
  const wrap = document.getElementById('spark-collected');
  if (!wrap) return;
  const data = CASHFLOW['6m'].collected;
  const max = Math.max(...data);
  wrap.innerHTML = data.map(v => `<div class="pay-spark__bar" style="height:${(v / max) * 100}%"></div>`).join('');
}

// ═══════════════════════════════════════════════════════════════════════
//  RECONCILIATION PANEL
// ═══════════════════════════════════════════════════════════════════════
function openReconciliation() {
  const inner = document.getElementById('recon-inner');
  inner.innerHTML = `
    <header class="pay-recon__head">
      <div>
        <h2 class="pay-recon__title">Bank Reconciliation</h2>
        <p class="pay-recon__sub">Match bank transactions with recorded payments · June 2026</p>
      </div>
      <button class="apv-d-head__close" id="recon-close" aria-label="Close">×</button>
    </header>
    <div class="pay-recon__body">
      <section class="pay-recon-section">
        <h3 class="pay-recon-section__title">1. Upload Bank Statement</h3>
        <div class="pay-recon-drop" id="recon-drop">
          <div class="pay-recon-drop__icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg></div>
          <p class="pay-recon-drop__title">Drop bank statement CSV here</p>
          <p class="pay-recon-drop__sub">Or click to browse · CSV, XLS, XLSX · max 10MB</p>
        </div>
      </section>

      <section class="pay-recon-section" id="recon-summary-section">
        <h3 class="pay-recon-section__title">2. Reconciliation Summary</h3>
        <div class="pay-recon-summary">
          <div class="pay-recon-summary__cell pay-recon-summary__cell--success">
            <p class="pay-recon-summary__label">Auto-matched</p>
            <p class="pay-recon-summary__value">22</p>
          </div>
          <div class="pay-recon-summary__cell pay-recon-summary__cell--warning">
            <p class="pay-recon-summary__label">Partial</p>
            <p class="pay-recon-summary__value">3</p>
          </div>
          <div class="pay-recon-summary__cell pay-recon-summary__cell--danger">
            <p class="pay-recon-summary__label">Unmatched</p>
            <p class="pay-recon-summary__value">3</p>
          </div>
          <div class="pay-recon-summary__cell">
            <p class="pay-recon-summary__label">Total</p>
            <p class="pay-recon-summary__value">28</p>
          </div>
        </div>
        <div class="pay-recon-bar">
          <div class="pay-recon-bar__matched" style="width:78%"></div>
          <div class="pay-recon-bar__partial" style="width:11%"></div>
          <div class="pay-recon-bar__unmatched" style="width:11%"></div>
        </div>
        <p style="font-size:11px;color:var(--text-secondary);margin:6px 0 0;text-align:center">78% auto-matched</p>
      </section>

      <section class="pay-recon-section">
        <h3 class="pay-recon-section__title">3. Transactions</h3>
        <div class="pay-recon-table">
          ${[
            { date: '25 Jun', amount: 94400, ref: 'REF-UTR123', matched: 'INV-2400', status: 'matched' },
            { date: '20 Jun', amount: 162500, ref: 'REF-UTR987', matched: 'INV-2399', status: 'matched' },
            { date: '15 Jun', amount: 100000, ref: 'REF-UTR676', matched: 'INV-2396', status: 'matched' },
            { date: '10 Jun', amount: 150000, ref: 'REF-UTR555', matched: 'INV-2397 · partial', status: 'partial' },
            { date: '05 Jun', amount: 45000, ref: 'REF-UTR422', matched: 'Unmatched', status: 'unmatched' },
          ].map(t => `
            <div class="pay-recon-row">
              <div>
                <p style="margin:0;font-weight:600;color:var(--brand-navy)">${t.date} · ${fmtINR(t.amount)}</p>
                <p class="pay-recon-row__bank-meta">${t.ref}</p>
              </div>
              <p style="margin:0;font-weight:500;color:${t.status === 'matched' ? 'var(--success)' : t.status === 'partial' ? 'var(--warning)' : 'var(--danger)'}">${t.matched}</p>
              <span class="pay-recon-row__status pay-status-pill pay-status-pill--${t.status === 'matched' ? 'paid' : t.status === 'partial' ? 'partial' : 'overdue'}">${t.status === 'matched' ? '✓ Auto' : t.status === 'partial' ? '⚠ Partial' : '✗ Match?'}</span>
            </div>
          `).join('')}
        </div>
      </section>

      <div style="display:flex;gap:10px">
        <button class="btn btn--ghost" style="flex:1">Export Report</button>
        <button class="btn btn--primary" style="flex:1" id="recon-confirm-all">Confirm All Matched</button>
      </div>
    </div>
  `;

  document.getElementById('recon-overlay').hidden = false;
  const r = document.getElementById('pay-recon');
  r.setAttribute('aria-hidden', 'false');
  requestAnimationFrame(() => r.classList.add('is-open'));

  document.getElementById('recon-close').addEventListener('click', closeReconciliation);
  document.getElementById('recon-confirm-all').addEventListener('click', () => {
    closeReconciliation();
    toast({ type: 'success', title: '✓ Reconciliation complete', subtitle: '22 payments matched · ₹24,50,000 total' });
  });
}

function closeReconciliation() {
  const r = document.getElementById('pay-recon');
  r.classList.remove('is-open');
  r.setAttribute('aria-hidden', 'true');
  setTimeout(() => { document.getElementById('recon-overlay').hidden = true; }, 350);
}

// ═══════════════════════════════════════════════════════════════════════
//  OVERDUE BANNER + COUNTS + SYNC
// ═══════════════════════════════════════════════════════════════════════
function updateCounts() {
  const counts = {
    all: PAYMENTS.length,
    received: PAYMENTS.filter(p => p.status === 'paid').length,
    outstanding: PAYMENTS.filter(p => p.status === 'outstanding').length,
    overdue: PAYMENTS.filter(p => p.status === 'overdue').length,
    partial: PAYMENTS.filter(p => p.status === 'partial').length,
    writtenoff: PAYMENTS.filter(p => p.status === 'writtenoff').length,
  };
  Object.entries(counts).forEach(([k, v]) => {
    const el = document.getElementById(`tab-count-${k}`);
    if (el) el.textContent = v;
  });
  document.getElementById('nav-badge-pay').textContent = counts.overdue;
}

function renderOverdueBanner() {
  const overdue = PAYMENTS.filter(p => p.status === 'overdue');
  const banner = document.getElementById('pay-overdue-banner');
  if (!overdue.length) { banner.hidden = true; return; }
  banner.hidden = false;
  document.getElementById('overdue-count').textContent = overdue.length;
  document.getElementById('overdue-amount').textContent = fmtINR(overdue.reduce((s, p) => s + p.balance, 0));
}

// Currency-aware refresh of stats strip + table + open drawer
const STAT_INR = {
  'stat-val-collected': 3680000,
  'stat-val-outstanding': 1145000,
  'stat-val-overdue': 320000,
};

function refreshAllAmounts() {
  const cur = state.currency || 'INR';
  // Stats strip
  Object.entries(STAT_INR).forEach(([id, inr]) => {
    const el = document.getElementById(id);
    if (el) el.textContent = fmtShort(inr, cur);
  });
  // Sub-text on collected card
  const sub = document.getElementById('stat-sub-collected');
  if (sub) sub.textContent = cur === 'USD' ? '₹36.8L · June 2026' : '$44,120 · June 2026';
  // Table rows (re-render with new currency)
  renderPanel();
  // Open drawer
  const drawer = document.getElementById('pay-drawer');
  if (drawer && drawer.classList.contains('is-open')) {
    const openId = drawer.dataset.openId;
    if (openId) openDrawer(openId);
  }
}

function syncCrossScreens() {
  try {
    const s = JSON.parse(localStorage.getItem('info-platform-state') || '{}');
    const collected = PAYMENTS.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.paid, 0)
      + PAYMENTS.filter(p => p.status === 'partial').reduce((sum, p) => sum + p.paid, 0);
    const outstanding = PAYMENTS.filter(p => p.status === 'outstanding' || p.status === 'partial').reduce((sum, p) => sum + p.balance, 0);
    const overdueAmt = PAYMENTS.filter(p => p.status === 'overdue').reduce((sum, p) => sum + p.balance, 0);
    s.payments = {
      collected, outstanding, overdue: overdueAmt,
      overdueCount: PAYMENTS.filter(p => p.status === 'overdue').length,
      collectionRate: ((collected / (collected + outstanding + overdueAmt)) * 100).toFixed(1),
      ts: Date.now(),
    };
    localStorage.setItem('info-platform-state', JSON.stringify(s));
  } catch (e) { console.warn('Cross-screen sync failed', e); }
}

// ═══════════════════════════════════════════════════════════════════════
//  TOAST
// ═══════════════════════════════════════════════════════════════════════
function toast({ type = 'info', title, subtitle, link, duration = 5000 }) {
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
//  INIT
// ═══════════════════════════════════════════════════════════════════════
function init() {
  // URL state
  const params = new URLSearchParams(location.search);
  const tab = params.get('tab');
  if (tab && ['all', 'received', 'outstanding', 'overdue', 'partial', 'writtenoff'].includes(tab)) {
    state.activeTab = tab;
  }
  const invoiceParam = params.get('invoice');

  // Tab clicks
  document.querySelectorAll('.pay-tabs .md-tab').forEach(t => {
    t.addEventListener('click', () => {
      const tid = t.dataset.tab;
      document.querySelectorAll('.pay-tabs .md-tab').forEach(x => {
        x.classList.toggle('is-active', x === t);
        x.setAttribute('aria-selected', x === t ? 'true' : 'false');
      });
      state.activeTab = tid;
      const url = new URL(location.href);
      url.searchParams.set('tab', tid);
      history.pushState({}, '', url);
      renderPanel();
    });
    if (t.dataset.tab === state.activeTab) {
      t.classList.add('is-active');
      t.setAttribute('aria-selected', 'true');
    } else {
      t.classList.remove('is-active');
      t.setAttribute('aria-selected', 'false');
    }
  });

  // Stat clicks
  document.querySelectorAll('.md-stat[data-stat]').forEach(s => {
    s.addEventListener('click', () => {
      const t = s.dataset.stat;
      state.activeTab = t;
      document.querySelectorAll('.pay-tabs .md-tab').forEach(x => x.classList.toggle('is-active', x.dataset.tab === t));
      renderPanel();
    });
  });

  // Main click delegation (rows, cards, buttons)
  document.querySelector('.main').addEventListener('click', e => {
    const check = e.target.closest('.pay-row__check');
    if (check) {
      e.stopPropagation();
      // Select-all header checkbox
      if (check.id === 'pay-select-all') {
        document.querySelectorAll('.pay-row .pay-row__check').forEach(cb => {
          cb.checked = check.checked;
          const rowId = cb.dataset.id;
          if (!rowId) return;
          if (check.checked) state.selectedIds.add(rowId);
          else state.selectedIds.delete(rowId);
          cb.closest('.pay-row')?.classList.toggle('is-selected', check.checked);
        });
        updateBulkBar();
        return;
      }
      const id = check.dataset.id;
      if (check.checked) state.selectedIds.add(id);
      else state.selectedIds.delete(id);
      check.closest('.pay-row').classList.toggle('is-selected', check.checked);
      updateBulkBar();
      return;
    }
    const btn = e.target.closest('[data-action]');
    if (btn) {
      e.stopPropagation();
      const id = btn.dataset.id;
      const a = btn.dataset.action;
      if (a === 'view') openDrawer(id);
      else if (a === 'record') openRecordModal(id);
      else if (a === 'remind') openReminderModal(id);
      else if (a === 'receipt') toast({ type: 'success', title: '✓ Receipt downloaded', subtitle: PAYMENTS.find(p => p.id === id)?.invoiceRef });
      return;
    }
    const cbtn = e.target.closest('[data-client-action]');
    if (cbtn) {
      e.stopPropagation();
      const cid = cbtn.dataset.client;
      if (cbtn.dataset.clientAction === 'view') {
        state.view = 'table';
        state.searchQuery = CLIENTS[cid]?.name || '';
        document.getElementById('pay-search').value = state.searchQuery;
        document.querySelectorAll('.pay-view-toggle__btn').forEach(b => b.classList.toggle('is-active', b.dataset.view === 'table'));
        renderPanel();
      } else if (cbtn.dataset.clientAction === 'record') {
        const open = PAYMENTS.find(p => p.clientId === cid && p.status !== 'paid');
        if (open) openRecordModal(open.id);
        else openRecordModal(null);
      }
      return;
    }
    const row = e.target.closest('.pay-row');
    if (row) openDrawer(row.dataset.id);
  });

  // Search
  document.getElementById('pay-search').addEventListener('input', e => {
    state.searchQuery = e.target.value;
    renderPanel();
  });

  // Sort
  document.getElementById('pay-sort').addEventListener('change', e => {
    state.sortBy = e.target.value;
    renderPanel();
  });

  // View toggle
  document.querySelectorAll('.pay-view-toggle__btn').forEach(b => {
    b.addEventListener('click', () => {
      document.querySelectorAll('.pay-view-toggle__btn').forEach(x => x.classList.toggle('is-active', x === b));
      state.view = b.dataset.view;
      renderPanel();
    });
  });

  // Topbar buttons
  document.getElementById('btn-record-pay').addEventListener('click', () => openRecordModal(null));
  document.getElementById('btn-export').addEventListener('click', openExportModal);
  document.getElementById('btn-reconcile').addEventListener('click', openReconciliation);

  // Currency toggle — converts amounts across stats, table, drawer
  document.querySelectorAll('.currency-toggle__btn').forEach(b => {
    b.addEventListener('click', () => {
      document.querySelectorAll('.currency-toggle__btn').forEach(x => x.classList.toggle('is-active', x === b));
      state.currency = b.dataset.currency;
      refreshAllAmounts();
    });
  });

  // Period picker arrows
  document.getElementById('period-prev').addEventListener('click', () => {
    if (state.periodIdx > 0) {
      state.periodIdx--;
      state.periodFilter = true;
      updatePeriodLabel();
      renderPanel();
      const p = PERIODS[state.periodIdx];
      toast({ type: 'info', title: `Period: ${p.label}`, subtitle: 'Filtering by invoice month', duration: 2500 });
    }
  });
  document.getElementById('period-next').addEventListener('click', () => {
    if (state.periodIdx < PERIODS.length - 1) {
      state.periodIdx++;
      state.periodFilter = true;
      updatePeriodLabel();
      renderPanel();
      const p = PERIODS[state.periodIdx];
      toast({ type: 'info', title: `Period: ${p.label}`, subtitle: 'Filtering by invoice month', duration: 2500 });
    }
  });
  document.getElementById('period-label').addEventListener('click', () => {
    // Click the label to toggle period filter on/off
    state.periodFilter = !state.periodFilter;
    renderPanel();
    toast({ type: 'info', title: state.periodFilter ? 'Period filter ON' : 'Period filter OFF', duration: 2000 });
  });

  // Cashflow range tabs
  document.querySelectorAll('.pay-chart-tab').forEach(t => {
    t.addEventListener('click', () => {
      document.querySelectorAll('.pay-chart-tab').forEach(x => x.classList.toggle('is-active', x === t));
      state.cashflowRange = t.dataset.range;
      renderCashflow();
    });
  });

  // Overdue banner
  document.getElementById('banner-review').addEventListener('click', () => {
    state.activeTab = 'overdue';
    document.querySelectorAll('.pay-tabs .md-tab').forEach(x => x.classList.toggle('is-active', x.dataset.tab === 'overdue'));
    renderPanel();
  });
  document.getElementById('banner-close').addEventListener('click', () => {
    document.getElementById('pay-overdue-banner').hidden = true;
  });

  // Bulk
  document.getElementById('bulk-deselect').addEventListener('click', () => {
    state.selectedIds.clear();
    document.querySelectorAll('.pay-row__check').forEach(c => c.checked = false);
    document.querySelectorAll('.pay-row').forEach(r => r.classList.remove('is-selected'));
    updateBulkBar();
  });
  document.getElementById('bulk-close').addEventListener('click', () => document.getElementById('bulk-deselect').click());
  document.getElementById('bulk-remind').addEventListener('click', () => {
    const n = state.selectedIds.size;
    toast({ type: 'success', title: `✓ Reminders sent to ${n} clients` });
    state.selectedIds.clear();
    updateBulkBar(); renderPanel();
  });
  document.getElementById('bulk-record').addEventListener('click', () => {
    const ids = [...state.selectedIds];
    if (ids.length) openRecordModal(ids[0]);
  });
  document.getElementById('bulk-export').addEventListener('click', () => toast({ type: 'success', title: `✓ ${state.selectedIds.size} payments exported` }));

  // Overlay close
  document.getElementById('drawer-overlay').addEventListener('click', closeDrawer);
  document.getElementById('modal-overlay').addEventListener('click', closeModal);
  document.getElementById('recon-overlay').addEventListener('click', closeReconciliation);

  // ESC
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (document.getElementById('pay-modal').classList.contains('is-open')) return closeModal();
      if (document.getElementById('pay-drawer').classList.contains('is-open')) return closeDrawer();
      if (document.getElementById('pay-recon').classList.contains('is-open')) return closeReconciliation();
    }
  });

  // popstate
  window.addEventListener('popstate', () => {
    const p = new URLSearchParams(location.search);
    state.activeTab = p.get('tab') || 'all';
    document.querySelectorAll('.pay-tabs .md-tab').forEach(x => x.classList.toggle('is-active', x.dataset.tab === state.activeTab));
    renderPanel();
  });

  // Boot
  renderPanel();
  updateCounts();
  renderOverdueBanner();
  renderCashflow();
  renderAging();
  renderSparkline();
  updatePeriodLabel();
  refreshAllAmounts();
  syncCrossScreens();

  if (invoiceParam) {
    const p = PAYMENTS.find(x => x.invoiceRef === invoiceParam);
    if (p) openDrawer(p.id);
  }

  document.body.classList.remove('is-loading');
}

document.addEventListener('DOMContentLoaded', init);
