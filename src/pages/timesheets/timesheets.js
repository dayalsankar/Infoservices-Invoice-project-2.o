/* ============================================================================
 * timesheets.js — Timesheet Management
 * Vanilla JS. 5-tab sub-nav, full table with status row treatments, side
 * drawer with 5 sections, approve/reject/submit flows, bulk action bar,
 * live billing calculator, toast notifications, URL state.
 * ========================================================================== */

(() => {
  'use strict';

  /* ── 0. CONSTANTS ──────────────────────────────────────────────────────── */

  const INR_PER_USD = 83.5;
  const TAX_LOOKUP  = { 'IGST 18%': 0.18, 'CGST+SGST': 0.18, 'SEZ/LUT': 0 };

  /* ── 1. RESOLVABLE LOOKUPS (mirror master-data) ────────────────────────── */

  const COMPANIES = [
    { id: 1, name: 'INFO Services Pvt Ltd' },
    { id: 2, name: 'INFO Tech Solutions' },
    { id: 3, name: 'INFO Global Services' },
    { id: 4, name: 'INFO Consulting LLP' },
  ];
  const CLIENTS = [
    { id: 1, name: 'Accenture India',  companyId: 1 },
    { id: 2, name: 'TCS Limited',      companyId: 1 },
    { id: 3, name: 'Infosys BPM',      companyId: 2 },
    { id: 4, name: 'Wipro Tech',       companyId: 2 },
    { id: 5, name: 'HCL Methods',      companyId: 3 },
    { id: 6, name: 'Cognizant Tech',   companyId: 3 },
    { id: 7, name: 'Tech Mahindra',    companyId: 4 },
  ];
  const CONSULTANTS = [
    { id: 1, name: 'Rahul Verma',    initials: 'RV', avatar: 'royal' },
    { id: 2, name: 'Anita Krishnan', initials: 'AK', avatar: 'success' },
    { id: 3, name: 'Deepak Mehta',   initials: 'DM', avatar: 'azure' },
    { id: 4, name: 'Sneha Pillai',   initials: 'SP', avatar: 'warning' },
    { id: 5, name: 'Kiran Nair',     initials: 'KN', avatar: 'danger' },
    { id: 6, name: 'Meera Joshi',    initials: 'MJ', avatar: 'info' },
  ];
  const ASSIGNMENTS = [
    { id: 1, name: 'Accenture — Cloud Dev',     clientId: 1, rate: 2500, currency: 'INR', billing: 'Hourly', tax: 'IGST 18%' },
    { id: 2, name: 'TCS — Data Engineering',    clientId: 2, rate: 12000, currency: 'INR', billing: 'Daily', tax: 'CGST+SGST' },
    { id: 3, name: 'Infosys — AI Solutions',    clientId: 3, rate: 85, currency: 'USD', billing: 'Hourly', tax: 'SEZ/LUT' },
    { id: 4, name: 'Wipro — QA Automation',     clientId: 4, rate: 65, currency: 'USD', billing: 'Hourly', tax: 'CGST+SGST', expiring: true, endDate: '2026-06-30' },
    { id: 5, name: 'HCL — DevOps Setup',        clientId: 5, rate: 15000, currency: 'INR', billing: 'Daily', tax: 'IGST 18%' },
    { id: 6, name: 'Cognizant — BI Dashboard',  clientId: 6, rate: 2500, currency: 'INR', billing: 'Hourly', tax: 'IGST 18%' },
    { id: 7, name: 'Tech Mahindra — BI',        clientId: 7, rate: 10000, currency: 'INR', billing: 'Daily', tax: 'SEZ/LUT' },
  ];

  const lookup = {
    company:    id => COMPANIES.find(c => c.id === id) || {},
    client:     id => CLIENTS.find(c => c.id === id) || {},
    consultant: id => CONSULTANTS.find(c => c.id === id) || {},
    assignment: id => ASSIGNMENTS.find(a => a.id === id) || {},
  };

  /* ── 2. TIMESHEET DATASET (12 rows) ───────────────────────────────────── */

  const WEEKLY_DAILY = (start, hoursList, activities) => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map((d, i) => {
      const dt = new Date(start);
      dt.setDate(dt.getDate() + i);
      return {
        date: dt.toISOString().slice(0, 10),
        day: d,
        hours: hoursList[i] || 0,
        activity: activities[i] || (i >= 5 ? '—' : ''),
        billable: i < 5 && hoursList[i] > 0,
      };
    });
  };

  let TIMESHEETS = [
    {
      id: 'TS-2406-001', consultantId: 1, assignmentId: 1, period: 'Jun W1 2026', periodLabel: '2–8 Jun',
      billing: 'Hourly', units: 40, unitLabel: 'hrs', amount: 100000, currency: 'INR',
      submittedOn: '2026-06-09T10:32', status: 'Submitted',
      daily: WEEKLY_DAILY('2026-06-02', [8, 8, 8, 7.5, 8.5, 0, 0],
        ['Cloud Infrastructure Setup', 'Kubernetes Configuration', 'CI/CD Pipeline Development', 'Code Review & Documentation', 'Performance Testing']),
    },
    {
      id: 'TS-2406-002', consultantId: 2, assignmentId: 2, period: 'Jun 2026', periodLabel: 'June (Monthly)',
      billing: 'Daily', units: 22, unitLabel: 'days', amount: 264000, currency: 'INR',
      submittedOn: '2026-07-01T09:00', status: 'Submitted',
      daily: null,
    },
    {
      id: 'TS-2406-003', consultantId: 3, assignmentId: 3, period: 'Jun W2 2026', periodLabel: '9–15 Jun',
      billing: 'Hourly', units: 38, unitLabel: 'hrs', amount: 3230, currency: 'USD',
      submittedOn: '2026-06-16T11:14', status: 'Approved', reviewedBy: 'Priya Sharma', reviewedOn: '2026-06-17T14:20',
      daily: WEEKLY_DAILY('2026-06-09', [8, 7.5, 8, 7, 7.5, 0, 0],
        ['LLM Fine-tuning Research', 'Model Training Pipeline', 'Evaluation Metrics', 'Performance Optimization', 'Documentation']),
    },
    {
      id: 'TS-2406-004', consultantId: 4, assignmentId: 5, period: 'Jun W1 2026', periodLabel: '2–8 Jun',
      billing: 'Daily', units: 5, unitLabel: 'days', amount: 75000, currency: 'INR',
      submittedOn: '2026-06-09T15:30', status: 'Rejected', reviewedBy: 'Deepak S', reviewedOn: '2026-06-10T09:00',
      rejectionReason: 'Hours inconsistent with assignment scope. Maximum 40 hrs/week for this engagement.',
      daily: null,
    },
    {
      id: 'TS-2406-005', consultantId: 5, assignmentId: 4, period: 'Jun W1 2026', periodLabel: '2–8 Jun',
      billing: 'Hourly', units: 36, unitLabel: 'hrs', amount: 2340, currency: 'USD',
      submittedOn: '2026-06-09T12:00', status: 'Approved', reviewedBy: 'Priya Sharma', reviewedOn: '2026-06-10T10:00',
      daily: WEEKLY_DAILY('2026-06-02', [7, 7.5, 7, 7.5, 7, 0, 0],
        ['Selenium Test Suite', 'Cypress Migration', 'CI Integration', 'Regression Tests', 'Bug Triage']),
    },
    {
      id: 'TS-2406-006', consultantId: 1, assignmentId: 6, period: 'Jun W1 2026', periodLabel: '2–8 Jun',
      billing: 'Hourly', units: 32, unitLabel: 'hrs', amount: 80000, currency: 'INR',
      submittedOn: '2026-06-10T16:45', status: 'Submitted',
      daily: WEEKLY_DAILY('2026-06-02', [6, 7, 6.5, 6, 6.5, 0, 0],
        ['Dashboard Layout', 'Data Modeling', 'KPI Implementation', 'Filter Logic', 'User Testing']),
    },
    {
      id: 'TS-2406-007', consultantId: 2, assignmentId: 2, period: 'Jun W1 2026', periodLabel: '2–8 Jun',
      billing: 'Daily', units: 5, unitLabel: 'days', amount: 60000, currency: 'INR',
      submittedOn: '2026-06-09T08:30', status: 'Approved', reviewedBy: 'Priya Sharma', reviewedOn: '2026-06-09T17:00',
      daily: null,
    },
    {
      id: 'TS-2406-008', consultantId: 3, assignmentId: 3, period: 'Jun W1 2026', periodLabel: '2–8 Jun',
      billing: 'Hourly', units: 40, unitLabel: 'hrs', amount: 3400, currency: 'USD',
      submittedOn: '2026-06-09T13:20', status: 'Approved', reviewedBy: 'Priya Sharma', reviewedOn: '2026-06-09T18:00',
      daily: WEEKLY_DAILY('2026-06-02', [8, 8, 8, 8, 8, 0, 0],
        ['Prompt Engineering', 'Embedding Pipeline', 'Vector DB Setup', 'API Integration', 'Testing']),
    },
    {
      id: 'TS-2406-009', consultantId: 6, assignmentId: 7, period: 'Jun W1 2026', periodLabel: '2–8 Jun',
      billing: 'Daily', units: 5, unitLabel: 'days', amount: 50000, currency: 'INR',
      submittedOn: null, status: 'Draft',
      daily: null,
    },
    {
      id: 'TS-2406-010', consultantId: 5, assignmentId: 4, period: 'Jun W2 2026', periodLabel: '9–15 Jun',
      billing: 'Hourly', units: 34, unitLabel: 'hrs', amount: 2210, currency: 'USD',
      submittedOn: '2026-06-16T10:15', status: 'Submitted',
      daily: WEEKLY_DAILY('2026-06-09', [6.5, 7, 7.5, 6.5, 6.5, 0, 0],
        ['Test Plan Update', 'Cypress Coverage', 'CI Pipeline', 'Bug Verification', 'Documentation']),
    },
    {
      id: 'TS-2406-011', consultantId: 4, assignmentId: 5, period: 'Jun W2 2026', periodLabel: '9–15 Jun',
      billing: 'Daily', units: 5, unitLabel: 'days', amount: 75000, currency: 'INR',
      submittedOn: '2026-06-16T11:30', status: 'Submitted',
      daily: null,
    },
    {
      id: 'TS-2406-012', consultantId: 1, assignmentId: 1, period: 'Jun W2 2026', periodLabel: '9–15 Jun',
      billing: 'Hourly', units: 38, unitLabel: 'hrs', amount: 95000, currency: 'INR',
      submittedOn: '2026-06-16T09:45', status: 'Approved', reviewedBy: 'Priya Sharma', reviewedOn: '2026-06-17T11:00',
      daily: WEEKLY_DAILY('2026-06-09', [7.5, 8, 7.5, 7, 8, 0, 0],
        ['Cluster Migration', 'Helm Charts Update', 'Monitoring Setup', 'Security Audit', 'Documentation']),
    },
  ];

  /* ── 3. STATE ─────────────────────────────────────────────────────────── */

  let state = {
    tab:           'all',     // all | pending | approved | rejected | draft
    q:             '',
    consultantId:  'all',
    billing:       'all',
    sort:          'submitted-desc',
    selected:      new Set(),
    view:          'table',
    period:        'June 2026',
  };

  /* ── 4. STATS STRIP ───────────────────────────────────────────────────── */

  function renderStats() {
    const pending  = TIMESHEETS.filter(t => t.status === 'Submitted').length;
    const approved = TIMESHEETS.filter(t => t.status === 'Approved');
    const hoursApproved = approved.filter(t => t.billing === 'Hourly').reduce((a, t) => a + t.units, 0);
    const billableINR = approved.reduce((a, t) => a + (t.currency === 'INR' ? t.amount : t.amount * INR_PER_USD), 0);

    const stats = [
      { label: 'Timesheets This Period', value: TIMESHEETS.length, sub: 'June 2026', tint: 'azure', icon: iconCalendar(), trend: { dir: 'up', text: '↑ 6 vs last month' } },
      { label: 'Pending Review',         value: pending,           sub: 'Awaiting approval', tint: 'warning', icon: iconClock(), trend: { text: 'Action required', color: 'var(--warning-fg)' }, click: () => setTab('pending') },
      { label: 'Total Hours Billed',     value: hoursApproved.toLocaleString() + ' hrs', sub: 'June 2026 approved', tint: 'success', icon: iconActivity(), trend: { dir: 'up', text: '↑ 8.4% vs May' } },
      { label: 'Billable Amount',        value: '₹' + formatLakhs(billableINR), sub: 'Ready for invoicing', tint: 'royal', icon: iconRupee(), trend: { text: 'Ready for invoicing', color: 'var(--brand-royal)' } },
    ];

    document.getElementById('stats-strip').innerHTML = stats.map((s, i) => `
      <article class="md-stat" data-stat-idx="${i}" ${s.click ? '' : 'data-clickable="false"'}>
        <span class="md-stat__icon md-stat__icon--${s.tint}">${s.icon}</span>
        <div>
          <p class="md-stat__label">${s.label}</p>
          <p class="md-stat__value">${s.value}</p>
          <p class="md-stat__sub" style="font-size:11px;color:${s.trend.color || 'var(--text-tertiary)'};margin-top:2px">${s.trend.text}</p>
        </div>
      </article>
    `).join('');

    /* Wire click on pending card */
    stats.forEach((s, i) => {
      if (s.click) {
        document.querySelector(`[data-stat-idx="${i}"]`).addEventListener('click', s.click);
      }
    });
  }

  /* ── 5. EXPIRING BANNER ───────────────────────────────────────────────── */

  function renderBanner() {
    const slot = document.getElementById('ts-banner-slot');
    const expiringIds = new Set(ASSIGNMENTS.filter(a => a.expiring).map(a => a.id));
    const affected = TIMESHEETS.filter(t => expiringIds.has(t.assignmentId));
    if (affected.length === 0 || state.tab !== 'all') { slot.innerHTML = ''; return; }
    const exp = ASSIGNMENTS.find(a => a.expiring);
    slot.innerHTML = `
      <div class="md-banner" role="alert">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><path d="M12 9v4M12 17h.01"/></svg>
        <span>Assignment "${exp.name}" expires on ${fmtDate(exp.endDate)}. Timesheets beyond this date will not be billable.</span>
        <a href="../master-data/?tab=assignments" class="md-banner__cta">View Assignment →</a>
      </div>
    `;
  }

  /* ── 6. FILTERS POPULATION ────────────────────────────────────────────── */

  function renderFilters() {
    const cSel = document.getElementById('filter-consultant');
    if (cSel.options.length <= 1) {
      cSel.innerHTML = `<option value="all">Consultant: All</option>` +
        CONSULTANTS.map(c => `<option value="${c.id}">Consultant: ${c.name}</option>`).join('');
    }
  }

  /* Apply filters + sort to dataset → returns filtered array */
  function applyFiltersToData() {
    let rows = TIMESHEETS.slice();

    /* Tab filter */
    const tabMap = { pending: 'Submitted', approved: 'Approved', rejected: 'Rejected', draft: 'Draft' };
    if (state.tab !== 'all') rows = rows.filter(t => t.status === tabMap[state.tab]);

    /* Search */
    if (state.q) {
      const q = state.q.toLowerCase();
      rows = rows.filter(t => {
        const cName = lookup.consultant(t.consultantId).name || '';
        const aName = lookup.assignment(t.assignmentId).name || '';
        return (cName + aName + t.id).toLowerCase().includes(q);
      });
    }

    /* Consultant filter */
    if (state.consultantId !== 'all') rows = rows.filter(t => t.consultantId === Number(state.consultantId));

    /* Billing filter */
    if (state.billing !== 'all') rows = rows.filter(t => t.billing === state.billing);

    /* Sort */
    const sortFns = {
      'submitted-desc': (a, b) => (b.submittedOn || '').localeCompare(a.submittedOn || ''),
      'submitted-asc':  (a, b) => (a.submittedOn || '').localeCompare(b.submittedOn || ''),
      'consultant':     (a, b) => lookup.consultant(a.consultantId).name.localeCompare(lookup.consultant(b.consultantId).name),
      'hours-desc':     (a, b) => b.units - a.units,
      'amount-desc':    (a, b) => (b.currency === 'INR' ? b.amount : b.amount * INR_PER_USD) - (a.currency === 'INR' ? a.amount : a.amount * INR_PER_USD),
    };
    rows.sort(sortFns[state.sort] || sortFns['submitted-desc']);
    return rows;
  }

  /* ── 7. TABLE RENDER ──────────────────────────────────────────────────── */

  function renderTable() {
    const rows = applyFiltersToData();
    const body = document.getElementById('ts-table-body');
    const empty = document.getElementById('ts-empty');

    /* Result count + tab badges */
    document.getElementById('result-count').textContent = `${rows.length} timesheet${rows.length === 1 ? '' : 's'}`;
    updateTabBadges();

    if (rows.length === 0) {
      body.innerHTML = '';
      empty.hidden = false;
      const emptyTitles = {
        all: 'No timesheets yet',
        pending: 'All caught up!',
        approved: 'No approved timesheets yet',
        rejected: 'No rejections',
        draft: 'No drafts',
      };
      const emptySubs = {
        all: 'Timesheets submitted by consultants will appear here.',
        pending: 'No timesheets are waiting for your review.',
        approved: 'Approved timesheets will appear here once you start approving.',
        rejected: 'All reviewed timesheets have been approved.',
        draft: 'Drafts in progress will appear here.',
      };
      document.getElementById('empty-title').textContent = emptyTitles[state.tab];
      document.getElementById('empty-sub').textContent = emptySubs[state.tab];
      return;
    }
    empty.hidden = true;

    body.innerHTML = rows.map((t, i) => {
      const c = lookup.consultant(t.consultantId);
      const a = lookup.assignment(t.assignmentId);
      const cli = lookup.client(a.clientId);
      const usd = t.currency === 'INR' ? t.amount / INR_PER_USD : t.amount * INR_PER_USD;
      const amtPrimary  = t.currency === 'INR' ? '₹' + new Intl.NumberFormat('en-IN').format(t.amount) : '$' + new Intl.NumberFormat('en-US').format(t.amount);
      const amtSecondary = t.currency === 'INR' ? '$' + Math.round(usd).toLocaleString('en-US') : '₹' + Math.round(usd).toLocaleString('en-IN');
      const sel = state.selected.has(t.id);
      const rowClass = `row--${t.status.toLowerCase()}` + (sel ? ' is-selected' : '');
      const actions  = rowActions(t);

      let mainRow = `
        <tr class="${rowClass}" data-id="${t.id}">
          <td class="col-check"><input type="checkbox" data-select="${t.id}" ${sel ? 'checked' : ''} onclick="event.stopPropagation()" /></td>
          <td class="col-num">${i + 1}</td>
          <td>
            <div class="md-cell--with-avatar">
              <span class="avatar avatar--${c.avatar || 'royal'}">${c.initials}</span>
              <div class="md-cell">
                <span class="md-cell__primary">${c.name}</span>
                <span class="md-cell__secondary">${t.id}</span>
              </div>
            </div>
          </td>
          <td>
            <div class="ts-meta">
              <span>${a.name}</span>
              <span class="ts-meta__secondary">${cli.name || ''}</span>
            </div>
          </td>
          <td><span class="ts-meta">${t.period}<span class="ts-meta__secondary">${t.periodLabel}</span></span></td>
          <td><span class="md-tax-pill">${t.billing}</span></td>
          <td class="num-col"><strong>${t.units}</strong> ${t.unitLabel}</td>
          <td class="num-col">
            <div class="ts-amount">
              <span class="ts-amount__primary">${amtPrimary}</span>
              <span class="ts-amount__secondary">${amtSecondary}</span>
            </div>
          </td>
          <td>
            ${t.submittedOn
              ? `<div class="ts-meta">${fmtDate(t.submittedOn.slice(0,10))}<span class="ts-meta__secondary">${timeAgo(t.submittedOn)}</span></div>`
              : '<span class="ts-meta__secondary">—</span>'}
          </td>
          <td><span class="status ${statusClass(t.status)}">${t.status}</span></td>
          <td class="col-actions"><div class="ts-actions">${actions}</div></td>
        </tr>`;

      /* Rejection note inline row */
      if (t.status === 'Rejected' && t.rejectionReason) {
        mainRow += `
          <tr class="row-note" data-id="${t.id}-note">
            <td></td><td></td>
            <td colspan="9">
              <span class="ts-row-note">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg>
                Rejected: ${t.rejectionReason}
              </span>
            </td>
          </tr>`;
      }
      return mainRow;
    }).join('');

    /* Wire row events */
    body.querySelectorAll('tr[data-id]:not(.row-note)').forEach(tr => {
      tr.addEventListener('click', e => {
        if (e.target.closest('button') || e.target.closest('input[type="checkbox"]')) return;
        openDrawer(tr.dataset.id);
      });
    });
    body.querySelectorAll('[data-select]').forEach(cb => {
      cb.addEventListener('change', e => {
        const id = cb.dataset.select;
        if (cb.checked) state.selected.add(id); else state.selected.delete(id);
        cb.closest('tr').classList.toggle('is-selected', cb.checked);
        renderBulkBar();
      });
    });
    body.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const id = btn.dataset.id;
        const action = btn.dataset.action;
        if (action === 'approve') startApproveFlow([id]);
        else if (action === 'reject') startRejectFlow([id]);
        else if (action === 'invoice') triggerInvoice(id);
        else if (action === 'view') openDrawer(id);
      });
    });
  }

  /* Row inline actions based on status */
  function rowActions(t) {
    if (t.status === 'Submitted') {
      return `
        <button class="ts-action-btn ts-action-btn--success" data-action="approve" data-id="${t.id}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Approve
        </button>
        <button class="ts-action-btn ts-action-btn--danger" data-action="reject" data-id="${t.id}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg> Reject
        </button>
        <button class="ts-action-btn ts-action-btn--ghost" data-action="view" data-id="${t.id}">View</button>`;
    }
    if (t.status === 'Approved') {
      return `
        <button class="ts-action-btn ts-action-btn--royal" data-action="invoice" data-id="${t.id}">Generate Invoice</button>
        <button class="ts-action-btn ts-action-btn--ghost" data-action="view" data-id="${t.id}">View</button>`;
    }
    if (t.status === 'Rejected') {
      return `<button class="ts-action-btn ts-action-btn--ghost" data-action="view" data-id="${t.id}">View</button>`;
    }
    return `<button class="ts-action-btn ts-action-btn--ghost" data-action="view" data-id="${t.id}">View</button>`;
  }

  function updateTabBadges() {
    const counts = {
      all: TIMESHEETS.length,
      pending: TIMESHEETS.filter(t => t.status === 'Submitted').length,
      approved: TIMESHEETS.filter(t => t.status === 'Approved').length,
      rejected: TIMESHEETS.filter(t => t.status === 'Rejected').length,
      draft: TIMESHEETS.filter(t => t.status === 'Draft').length,
    };
    Object.entries(counts).forEach(([k, v]) => {
      const el = document.getElementById(`tab-count-${k}`);
      if (el) el.textContent = v;
    });
    /* Side panel timesheet badge mirrors pending count */
    const nav = document.getElementById('nav-badge-ts');
    if (nav) {
      nav.textContent = counts.pending;
      nav.classList.toggle('nav-item__badge--warning', counts.pending > 0);
    }
  }

  /* ── 8. ALTERNATE VIEWS (cards / calendar — simpler placeholders) ──────── */

  function renderCardsView() {
    const rows = applyFiltersToData();
    const wrap = document.getElementById('view-cards');
    wrap.innerHTML = rows.map(t => {
      const c = lookup.consultant(t.consultantId);
      const a = lookup.assignment(t.assignmentId);
      const cli = lookup.client(a.clientId);
      const amtPrimary = t.currency === 'INR' ? '₹' + formatLakhs(t.amount) : '$' + (t.amount / 1000).toFixed(1) + 'K';
      return `
        <article class="ts-card ts-card--${t.status.toLowerCase()}" data-id="${t.id}">
          <div class="ts-card__head">
            <span class="status ${statusClass(t.status)}">${t.status}</span>
            <span class="ts-card__period">${t.period}</span>
          </div>
          <div>
            <div class="ts-card__name"><span class="avatar avatar--${c.avatar}">${c.initials}</span> ${c.name}</div>
            <p class="ts-card__sub">${a.name} · ${cli.name || ''}</p>
          </div>
          <div class="ts-card__metrics">
            <div class="ts-card__metric"><span class="ts-card__metric-label">Hours</span><span class="ts-card__metric-value">${t.units}</span></div>
            <div class="ts-card__metric"><span class="ts-card__metric-label">Rate</span><span class="ts-card__metric-value">${a.currency === 'INR' ? '₹' : '$'}${a.rate.toLocaleString()}</span></div>
            <div class="ts-card__metric"><span class="ts-card__metric-label">Amount</span><span class="ts-card__metric-value">${amtPrimary}</span></div>
          </div>
          <div class="ts-card__foot">${rowActions(t)}</div>
        </article>`;
    }).join('');
    wrap.querySelectorAll('.ts-card').forEach(card => {
      card.addEventListener('click', e => {
        if (e.target.closest('button')) return;
        openDrawer(card.dataset.id);
      });
    });
    wrap.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const id = btn.dataset.id;
        const action = btn.dataset.action;
        if (action === 'approve') startApproveFlow([id]);
        else if (action === 'reject') startRejectFlow([id]);
        else if (action === 'invoice') triggerInvoice(id);
        else openDrawer(id);
      });
    });
  }

  function renderCalendarView() {
    const wrap = document.getElementById('view-calendar');
    /* June 2026 starts on Monday. 30 days. Mon Jun 1 → Tue Jun 30. */
    const days = [];
    /* Sun May 31 leading */
    for (let i = 0; i < 0; i++) days.push({ muted: true });
    for (let d = 1; d <= 30; d++) {
      const iso = `2026-06-${String(d).padStart(2, '0')}`;
      const dayTimesheets = TIMESHEETS.filter(t => t.daily && t.daily.some(x => x.date === iso));
      const dots = new Set();
      dayTimesheets.forEach(t => {
        if (t.status === 'Approved')  dots.add('success');
        if (t.status === 'Submitted') dots.add('warning');
        if (t.status === 'Rejected')  dots.add('danger');
        if (t.status === 'Draft')     dots.add('draft');
      });
      days.push({ num: d, count: dayTimesheets.length, dots: Array.from(dots) });
    }
    const dayHeader = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    wrap.innerHTML = `
      <div class="ts-calendar__head">${dayHeader.map(d => `<span>${d}</span>`).join('')}</div>
      <div class="ts-calendar__grid">
        ${days.map(d => d.muted
          ? `<div class="ts-cal-cell ts-cal-cell--muted"></div>`
          : `<div class="ts-cal-cell">
              <span class="ts-cal-cell__num">${d.num}</span>
              ${d.count > 0 ? `<span class="ts-cal-cell__count">${d.count}</span>` : ''}
              ${d.dots.length ? `<span class="ts-cal-cell__dots">${d.dots.map(x => `<span class="ts-cal-dot ts-cal-dot--${x}"></span>`).join('')}</span>` : ''}
            </div>`
        ).join('')}
      </div>
      <div class="ts-cal-legend">
        <span><span class="ts-cal-dot ts-cal-dot--success"></span> Approved</span>
        <span><span class="ts-cal-dot ts-cal-dot--warning"></span> Pending</span>
        <span><span class="ts-cal-dot ts-cal-dot--danger"></span> Rejected</span>
        <span><span class="ts-cal-dot ts-cal-dot--draft"></span> Draft</span>
      </div>
    `;
  }

  function setView(view) {
    state.view = view;
    document.querySelectorAll('[data-view]').forEach(b => b.classList.toggle('is-active', b.dataset.view === view));
    document.getElementById('view-table').hidden = view !== 'table';
    document.getElementById('view-cards').hidden = view !== 'cards';
    document.getElementById('view-calendar').hidden = view !== 'calendar';
    if (view === 'cards')    renderCardsView();
    if (view === 'calendar') renderCalendarView();
  }

  /* ── 9. DRAWER ────────────────────────────────────────────────────────── */

  function openDrawer(id) {
    const t = TIMESHEETS.find(x => x.id === id);
    if (!t) return;
    const c   = lookup.consultant(t.consultantId);
    const a   = lookup.assignment(t.assignmentId);
    const cli = lookup.client(a.clientId);
    const co  = lookup.company(cli.companyId);

    document.getElementById('drawer-title').textContent = `Timesheet ${t.id}`;
    document.getElementById('drawer-subtitle').textContent = `${t.period} · ${t.periodLabel}`;
    document.getElementById('drawer-icon').innerHTML = `<span>${c.initials}</span>`;
    document.getElementById('drawer-status').className = 'status ' + statusClass(t.status);
    document.getElementById('drawer-status').textContent = t.status;

    /* Sections */
    const taxRate = TAX_LOOKUP[a.tax] || 0;
    const gross   = t.amount;
    const tax     = Math.round(gross * taxRate);
    const total   = gross + tax;
    const sym     = t.currency === 'INR' ? '₹' : '$';
    const usdTot  = t.currency === 'INR' ? total / INR_PER_USD : total;
    const inrTot  = t.currency === 'INR' ? total : total * INR_PER_USD;

    let dailyHTML = '';
    if (t.daily) {
      const totalH = t.daily.reduce((a, d) => a + d.hours, 0);
      dailyHTML = `
        <table class="ts-daily">
          <thead><tr><th>Date</th><th>Day</th><th class="num-col">Hours</th><th>Activity</th><th>Billable</th></tr></thead>
          <tbody>
            ${t.daily.map(d => `
              <tr class="${d.day === 'Sat' || d.day === 'Sun' ? 'is-weekend' : ''}">
                <td>${fmtDate(d.date).split(',')[0]}</td>
                <td>${d.day}</td>
                <td class="num-col">${d.hours.toFixed(1)}</td>
                <td>${d.activity}</td>
                <td>${d.billable ? '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color:var(--success)"><polyline points="20 6 9 17 4 12"/></svg> Billable' : '— Weekend'}</td>
              </tr>`).join('')}
            <tr class="is-total"><td colspan="2">Total</td><td class="num-col">${totalH.toFixed(1)} hrs</td><td colspan="2">${totalH.toFixed(1)} billable hrs</td></tr>
          </tbody>
        </table>`;
    } else {
      dailyHTML = `<p style="font-size:13px;color:var(--text-tertiary);font-style:italic;padding:14px;background:var(--bg-subtle);border-radius:var(--radius-sm)">Monthly billing — total ${t.units} ${t.unitLabel} billed for ${t.period}.</p>`;
    }

    /* Timeline */
    const reviewed = !!t.reviewedOn;
    const tlSteps = [
      { title: 'Timesheet Created',      meta: t.submittedOn ? fmtDateTime(addMinutes(t.submittedOn, -32)) : '—', state: 'done' },
      { title: 'Submitted for Approval', meta: t.submittedOn ? fmtDateTime(t.submittedOn) : 'Not submitted',     state: t.submittedOn ? 'done' : 'pending' },
      { title: 'Manager Review',         meta: reviewed ? `${fmtDateTime(t.reviewedOn)} · ${t.reviewedBy}` : 'Pending', state: reviewed ? 'done' : t.submittedOn ? 'current' : 'pending' },
      { title: t.status === 'Rejected' ? 'Rejected' : 'Approved', meta: reviewed && t.status !== 'Submitted' ? fmtDateTime(t.reviewedOn) : 'Waiting', state: ['Approved', 'Rejected'].includes(t.status) ? 'done' : 'pending' },
      { title: 'Invoice Generated', meta: 'Waiting', state: 'pending' },
    ];

    document.getElementById('drawer-body').innerHTML = `
      <section class="drawer-section">
        <p class="drawer-section__title">Timesheet Overview</p>
        <div class="drawer-grid">
          <div class="drawer-field"><span class="drawer-field__label">Consultant</span><span class="drawer-field__value">${c.name}</span></div>
          <div class="drawer-field"><span class="drawer-field__label">Billing Type</span><span class="drawer-field__value"><span class="md-tax-pill">${t.billing}</span></span></div>
          <div class="drawer-field"><span class="drawer-field__label">Assignment</span><span class="drawer-field__value"><a href="../master-data/?tab=assignments">${a.name}</a></span></div>
          <div class="drawer-field"><span class="drawer-field__label">Client</span><span class="drawer-field__value"><a href="../master-data/?tab=clients">${cli.name || '—'}</a></span></div>
          <div class="drawer-field"><span class="drawer-field__label">Company</span><span class="drawer-field__value">${co.name || '—'}</span></div>
          <div class="drawer-field"><span class="drawer-field__label">Tax Type</span><span class="drawer-field__value">${a.tax}</span></div>
          <div class="drawer-field"><span class="drawer-field__label">Submitted On</span><span class="drawer-field__value mono">${t.submittedOn ? fmtDateTime(t.submittedOn) : '—'}</span></div>
          <div class="drawer-field"><span class="drawer-field__label">Reviewed By</span><span class="drawer-field__value">${t.reviewedBy || '—'}</span></div>
        </div>
      </section>

      <section class="drawer-section">
        <p class="drawer-section__title">Daily Entry Breakdown</p>
        ${dailyHTML}
      </section>

      <section class="drawer-section">
        <p class="drawer-section__title">Billing Calculation</p>
        <div class="billing-calc">
          <div class="billing-calc__row"><span>${t.billing === 'Hourly' ? 'Hours Worked' : 'Days Worked'}</span><span>${t.units} ${t.unitLabel}</span></div>
          <div class="billing-calc__row"><span>Billing Rate</span><span>${sym}${new Intl.NumberFormat().format(a.rate)} / ${t.billing === 'Hourly' ? 'hr' : 'day'}</span></div>
          <div class="billing-calc__divider"></div>
          <div class="billing-calc__row"><span>Gross Amount</span><span>${sym}${new Intl.NumberFormat().format(gross)}</span></div>
          <div class="billing-calc__row"><span>Tax (${a.tax})</span><span>${sym}${new Intl.NumberFormat().format(tax)}</span></div>
          <div class="billing-calc__divider"></div>
          <div class="billing-calc__total"><span>Total Invoice Value</span><span>${sym}${new Intl.NumberFormat().format(total)}</span></div>
          <p class="billing-calc__usd">${t.currency === 'INR' ? '$' + Math.round(usdTot).toLocaleString() : '₹' + Math.round(inrTot).toLocaleString('en-IN')} equivalent</p>
        </div>
      </section>

      <section class="drawer-section">
        <p class="drawer-section__title">Approval Timeline</p>
        <div class="ts-timeline">
          ${tlSteps.map(s => `
            <div class="ts-timeline__step ts-timeline__step--${s.state}">
              <span class="ts-timeline__dot"></span>
              <p class="ts-timeline__title">${s.title}</p>
              <p class="ts-timeline__meta">${s.meta}</p>
            </div>
          `).join('')}
        </div>
      </section>

      ${t.status === 'Rejected' ? `
        <section class="drawer-section">
          <p class="drawer-section__title">Rejection Details</p>
          <div class="ts-rejection">
            <p class="ts-rejection__head">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/></svg>
              Rejected by ${t.reviewedBy || 'Manager'}
            </p>
            <p class="ts-rejection__meta">${t.reviewedOn ? fmtDateTime(t.reviewedOn) : ''}</p>
            <p class="ts-rejection__body">${t.rejectionReason || ''}</p>
          </div>
        </section>
      ` : ''}
    `;

    /* Footer actions per status */
    const foot = document.getElementById('drawer-footer');
    if (t.status === 'Submitted') {
      foot.innerHTML = `
        <button class="btn btn--ghost" data-drawer-action="reject" data-id="${t.id}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg> Reject
        </button>
        <button class="btn btn--success" data-drawer-action="approve" data-id="${t.id}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Approve
        </button>`;
    } else if (t.status === 'Approved') {
      foot.innerHTML = `
        <button class="btn btn--ghost">Download PDF</button>
        <button class="btn btn--primary" data-drawer-action="invoice" data-id="${t.id}">Generate Invoice</button>`;
    } else if (t.status === 'Rejected') {
      foot.innerHTML = `<button class="btn btn--primary" style="flex:1">Edit &amp; Resubmit</button>`;
    } else if (t.status === 'Draft') {
      foot.innerHTML = `
        <button class="btn btn--ghost">Delete Draft</button>
        <button class="btn btn--primary">Submit Timesheet</button>`;
    } else {
      foot.innerHTML = '';
    }
    foot.querySelectorAll('[data-drawer-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const action = btn.dataset.drawerAction;
        if (action === 'approve') { closeDrawer(); startApproveFlow([id]); }
        else if (action === 'reject') { closeDrawer(); startRejectFlow([id]); }
        else if (action === 'invoice') { closeDrawer(); triggerInvoice(id); }
      });
    });

    /* Open */
    document.getElementById('drawer-backdrop').hidden = false;
    document.getElementById('drawer').setAttribute('aria-hidden', 'false');
    requestAnimationFrame(() => {
      document.getElementById('drawer-backdrop').classList.add('is-visible');
      document.getElementById('drawer').classList.add('is-open');
    });
  }

  function closeDrawer() {
    document.getElementById('drawer-backdrop').classList.remove('is-visible');
    document.getElementById('drawer').classList.remove('is-open');
    document.getElementById('drawer').setAttribute('aria-hidden', 'true');
    setTimeout(() => { document.getElementById('drawer-backdrop').hidden = true; }, 350);
  }

  /* ── 10. APPROVE FLOW ─────────────────────────────────────────────────── */

  function startApproveFlow(ids) {
    const items = ids.map(id => TIMESHEETS.find(t => t.id === id)).filter(Boolean);
    if (items.length === 0) return;

    const totals = items.reduce((acc, t) => {
      const a = lookup.assignment(t.assignmentId);
      const taxRate = TAX_LOOKUP[a.tax] || 0;
      const inrAmt = t.currency === 'INR' ? t.amount : t.amount * INR_PER_USD;
      acc.gross += inrAmt;
      acc.tax += inrAmt * taxRate;
      return acc;
    }, { gross: 0, tax: 0 });

    openModal({
      size: 'sm',
      title: items.length === 1 ? 'Approve Timesheet?' : `Approve ${items.length} Timesheets?`,
      subtitle: '',
      body: `
        ${items.length === 1 ? singleConfirmCard(items[0]) : `
          <div class="confirm-card">
            <div class="confirm-card__row"><span>Timesheets</span><span>${items.length}</span></div>
            <div class="confirm-card__row"><span>Gross Amount</span><span>₹${formatLakhs(totals.gross)}</span></div>
            <div class="confirm-card__row"><span>Tax</span><span>₹${formatLakhs(totals.tax)}</span></div>
            <div class="confirm-card__row is-total"><span>Total</span><span>₹${formatLakhs(totals.gross + totals.tax)}</span></div>
          </div>`}
        <label class="checkbox-row" style="margin-top:14px"><input type="checkbox" id="notify-consultant" checked /> Also notify consultant via email</label>
      `,
      confirmText: 'Confirm Approval',
      confirmClass: 'btn--success',
      onConfirm: () => loadingButton('Approving…', () => {
        items.forEach(t => {
          t.status = 'Approved';
          t.reviewedBy = 'Priya Sharma';
          t.reviewedOn = new Date().toISOString().slice(0, 16);
        });
        state.selected.clear();
        renderAll();
        items.forEach(t => {
          toast({
            type: 'success',
            title: `Timesheet approved — ${lookup.consultant(t.consultantId).name}`,
            subtitle: `${t.period} · Ready for invoicing`,
          });
        });
      }),
    });
  }

  function singleConfirmCard(t) {
    const a = lookup.assignment(t.assignmentId);
    const taxRate = TAX_LOOKUP[a.tax] || 0;
    const gross = t.amount;
    const tax = Math.round(gross * taxRate);
    const sym = t.currency === 'INR' ? '₹' : '$';
    return `
      <div class="confirm-card">
        <div class="confirm-card__row"><span>Consultant</span><span>${lookup.consultant(t.consultantId).name}</span></div>
        <div class="confirm-card__row"><span>Period</span><span>${t.period}</span></div>
        <div class="confirm-card__row"><span>${t.billing === 'Hourly' ? 'Hours' : 'Days'}</span><span>${t.units} ${t.unitLabel}</span></div>
        <div class="confirm-card__row"><span>Gross Amount</span><span>${sym}${new Intl.NumberFormat().format(gross)}</span></div>
        <div class="confirm-card__row"><span>Tax (${a.tax})</span><span>${sym}${new Intl.NumberFormat().format(tax)}</span></div>
        <div class="confirm-card__row is-total"><span>Total</span><span>${sym}${new Intl.NumberFormat().format(gross + tax)}</span></div>
      </div>`;
  }

  /* ── 11. REJECT FLOW ──────────────────────────────────────────────────── */

  function startRejectFlow(ids) {
    const items = ids.map(id => TIMESHEETS.find(t => t.id === id)).filter(Boolean);
    if (items.length === 0) return;
    const sub = items.length === 1
      ? `${lookup.consultant(items[0].consultantId).name} · ${items[0].period} · ${items[0].units} ${items[0].unitLabel}`
      : `${items.length} timesheets selected`;

    openModal({
      size: 'sm',
      title: items.length === 1 ? 'Reject Timesheet' : `Reject ${items.length} Timesheets`,
      subtitle: sub,
      body: `
        <div style="display:flex;flex-direction:column;gap:8px">
          <label class="form-field">
            <label>Reason for Rejection <span class="req">*</span></label>
            <textarea id="reject-reason" rows="3" placeholder="Explain why this timesheet is being rejected (min 20 chars)…"></textarea>
            <span class="form-field__error"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg> <span class="msg">Reason required (minimum 20 characters)</span></span>
          </label>
          <p style="font-size:11px;color:var(--text-tertiary);margin-bottom:4px">Quick reasons (click to fill):</p>
          <div class="reason-chips">
            ${['Hours exceed assignment limit', 'Non-billable tasks included', 'Missing activity descriptions', 'Incorrect billing period', 'Duplicate submission'].map(r => `<button class="reason-chip" data-reason="${r}">${r}</button>`).join('')}
          </div>
          <label class="checkbox-row" style="margin-top:8px"><input type="checkbox" id="notify-rej" checked /> Notify consultant immediately</label>
          <label class="checkbox-row"><input type="checkbox" id="notify-mgr" /> CC manager on notification</label>
        </div>`,
      confirmText: 'Confirm Rejection',
      confirmClass: 'btn--danger',
      onConfirm: () => {
        const ta = document.getElementById('reject-reason');
        const wrap = ta.closest('.form-field');
        if (ta.value.trim().length < 20) {
          wrap.classList.add('is-error');
          return false;
        }
        wrap.classList.remove('is-error');
        return loadingButton('Rejecting…', () => {
          items.forEach(t => {
            t.status = 'Rejected';
            t.reviewedBy = 'Priya Sharma';
            t.reviewedOn = new Date().toISOString().slice(0, 16);
            t.rejectionReason = ta.value.trim();
          });
          state.selected.clear();
          renderAll();
          items.forEach(t => {
            toast({
              type: 'danger',
              title: `Timesheet rejected — ${lookup.consultant(t.consultantId).name}`,
              subtitle: t.rejectionReason.slice(0, 60) + (t.rejectionReason.length > 60 ? '…' : ''),
            });
          });
          /* bump notifications badge */
          const n = document.getElementById('nav-badge-notif');
          if (n) n.textContent = Number(n.textContent) + items.length;
        });
      },
      onMount: () => {
        document.querySelectorAll('.reason-chip').forEach(c => {
          c.addEventListener('click', () => {
            const cur = document.getElementById('reject-reason').value.trim();
            document.getElementById('reject-reason').value = cur ? cur + (cur.endsWith('.') ? ' ' : '. ') + c.dataset.reason : c.dataset.reason;
            document.getElementById('reject-reason').focus();
          });
        });
      },
    });
  }

  /* ── 12. GENERATE INVOICE TRIGGER ─────────────────────────────────────── */

  function triggerInvoice(id) {
    const t = TIMESHEETS.find(x => x.id === id);
    if (!t) return;
    toast({
      type: 'success',
      title: 'Loading timesheet into invoice…',
      subtitle: `${lookup.consultant(t.consultantId).name} · ${t.period}`,
    });
    setTimeout(() => {
      window.location.href = `../invoices/new.html?from=timesheet&id=${encodeURIComponent(id)}`;
    }, 600);
  }

  /* ── 13. SUBMIT TIMESHEET — 4-step modal with live calculator ─────────── */

  let submitState = null;

  function startSubmitFlow() {
    submitState = {
      step: 0,
      consultantId: null,
      assignmentId: null,
      periodType: 'weekly',
      weekStart: '2026-06-23',
      days: Array(7).fill(0).map((_, i) => ({
        date: addDaysISO('2026-06-23', i),
        day: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i],
        hours: 0,
        activity: '',
        billable: i < 5,
      })),
      notes: '',
    };
    renderSubmitStep();
  }

  function renderSubmitStep() {
    const total = 4;
    const steps = ['Select Assignment', 'Enter Hours', 'Review & Notes', 'Confirm & Submit'];

    openModal({
      size: 'lg',
      title: 'Submit Timesheet',
      subtitle: `Step ${submitState.step + 1} of ${total} · ${steps[submitState.step]}`,
      stepperCount: total,
      stepperActive: submitState.step,
      body: renderSubmitBody(),
      footButtons: 'stepper',
      onStepNext: () => submitNext(),
      onStepBack: () => { if (submitState.step > 0) { submitState.step--; renderSubmitStep(); } },
      onConfirm: () => submitFinish(),
      onMount: () => wireSubmitInputs(),
    });
  }

  function renderSubmitBody() {
    const s = submitState;
    if (s.step === 0) {
      const cur = s.consultantId ? lookup.consultant(s.consultantId) : null;
      const curAss = s.assignmentId ? lookup.assignment(s.assignmentId) : null;
      return `
        <div class="form-grid">
          <div class="form-field"><label>Consultant <span class="req">*</span></label>
            <select id="sub-consultant"><option value="" disabled ${!cur?'selected':''}>Select…</option>
              ${CONSULTANTS.map(c => `<option value="${c.id}" ${s.consultantId===c.id?'selected':''}>${c.name}</option>`).join('')}
            </select>
          </div>
          <div class="form-field"><label>Assignment <span class="req">*</span></label>
            <select id="sub-assignment" ${!cur?'disabled':''}>
              <option value="" disabled ${!curAss?'selected':''}>Select assignment…</option>
              ${ASSIGNMENTS.map(a => `<option value="${a.id}" ${s.assignmentId===a.id?'selected':''}>${a.name}</option>`).join('')}
            </select>
          </div>
          <div class="form-field form-field--wide"><label>Billing Period <span class="req">*</span></label>
            <div style="display:flex;gap:8px;align-items:center">
              <div class="md-view-toggle">
                <button data-period="weekly" class="${s.periodType==='weekly'?'is-active':''}">Weekly</button>
                <button data-period="monthly" class="${s.periodType==='monthly'?'is-active':''}">Monthly</button>
              </div>
              <input type="date" id="sub-week-start" value="${s.weekStart}" style="height:38px;padding:0 10px;border:1px solid var(--border);border-radius:var(--radius-sm)" />
            </div>
          </div>
          ${curAss ? `
            <div class="form-field form-field--wide">
              <div class="form-tip">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
                <div>
                  <strong>${curAss.name}</strong> · ${lookup.client(curAss.clientId).name} · ${curAss.currency==='INR'?'₹':'$'}${curAss.rate}/${curAss.billing==='Hourly'?'hr':'day'} · ${curAss.tax}
                </div>
              </div>
            </div>` : ''}
        </div>`;
    }
    if (s.step === 1) {
      const ass = lookup.assignment(s.assignmentId);
      const rate = ass.rate || 0;
      const totalH = s.days.reduce((a, d) => a + d.hours, 0);
      const gross = totalH * rate;
      const taxRate = TAX_LOOKUP[ass.tax] || 0;
      const tax = gross * taxRate;
      const sym = ass.currency === 'INR' ? '₹' : '$';
      const weekendHours = s.days.slice(5).reduce((a, d) => a + d.hours, 0);
      return `
        <div class="daily-grid">
          <div class="daily-entry">
            <p style="font-size:13px;font-weight:600;color:var(--text-secondary);margin-bottom:4px">${s.weekStart} → ${addDaysISO(s.weekStart, 6)}</p>
            ${s.days.map((d, i) => `
              <div class="daily-entry-row ${i >= 5 ? 'is-weekend' : ''}" data-day="${i}">
                <span class="daily-entry-row__date">${d.day} ${fmtDayShort(d.date)}</span>
                <input type="number" min="0" max="24" step="0.5" value="${d.hours}" data-field="hours" />
                <input type="text" placeholder="Activity description" value="${d.activity}" data-field="activity" />
                <span class="billable-tick">${d.billable && d.hours > 0 ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>' : ''}</span>
              </div>
            `).join('')}
            <div class="weekend-warning ${weekendHours > 0 ? 'is-visible' : ''}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg>
              Weekend hours logged — please confirm billability.
            </div>
          </div>
          <div class="daily-totalbox">
            <p class="daily-totalbox__title">Live Calculation</p>
            <div class="daily-totalbox__row"><span>Total Hours</span><span id="calc-hours">${totalH.toFixed(1)} hrs</span></div>
            <div class="daily-totalbox__row"><span>Rate</span><span>${sym}${rate.toLocaleString()} / hr</span></div>
            <div class="daily-totalbox__divider"></div>
            <div class="daily-totalbox__row"><span>Gross Amount</span><span id="calc-gross">${sym}${Math.round(gross).toLocaleString()}</span></div>
            <div class="daily-totalbox__row"><span>Tax (${ass.tax})</span><span id="calc-tax">${sym}${Math.round(tax).toLocaleString()}</span></div>
            <div class="daily-totalbox__divider"></div>
            <div class="daily-totalbox__total"><span>Estimated Total</span><span id="calc-total">${sym}${Math.round(gross + tax).toLocaleString()}</span></div>
          </div>
        </div>`;
    }
    if (s.step === 2) {
      const totalH = s.days.reduce((a, d) => a + d.hours, 0);
      return `
        <div style="display:flex;flex-direction:column;gap:14px">
          <p style="font-size:13px;color:var(--text-secondary)">Summary of entered hours:</p>
          <table class="ts-daily">
            <thead><tr><th>Day</th><th class="num-col">Hours</th><th>Activity</th></tr></thead>
            <tbody>
              ${s.days.filter(d => d.hours > 0).map(d => `<tr><td>${d.day} ${fmtDayShort(d.date)}</td><td class="num-col">${d.hours.toFixed(1)}</td><td>${d.activity || '—'}</td></tr>`).join('')}
              <tr class="is-total"><td>Total</td><td class="num-col">${totalH.toFixed(1)} hrs</td><td></td></tr>
            </tbody>
          </table>
          <div class="form-field form-field--wide">
            <label>Overall Notes (optional)</label>
            <textarea id="sub-notes" rows="3" placeholder="Any additional context or remarks…">${s.notes}</textarea>
          </div>
          <label class="checkbox-row"><input type="checkbox" id="sub-nonbillable" /> Mark as non-billable submission</label>
          <div class="form-field form-field--wide">
            <label>Supporting Document (optional)</label>
            <div class="upload-zone" tabindex="0">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
              <div><p class="upload-zone__title">Drop file here or click to upload</p><p class="upload-zone__sub">PDF · max 5 MB</p></div>
            </div>
          </div>
        </div>`;
    }
    /* Step 3 — Confirm */
    const ass = lookup.assignment(s.assignmentId);
    const cli = lookup.client(ass.clientId);
    const con = lookup.consultant(s.consultantId);
    const totalH = s.days.reduce((a, d) => a + d.hours, 0);
    const rate = ass.rate || 0;
    const gross = totalH * rate;
    const taxRate = TAX_LOOKUP[ass.tax] || 0;
    const tax = gross * taxRate;
    const sym = ass.currency === 'INR' ? '₹' : '$';
    return `
      <div style="display:flex;flex-direction:column;gap:14px">
        <div class="confirm-card">
          <div class="confirm-card__row"><span>Consultant</span><span>${con.name}</span></div>
          <div class="confirm-card__row"><span>Assignment</span><span>${ass.name}</span></div>
          <div class="confirm-card__row"><span>Client</span><span>${cli.name || '—'}</span></div>
          <div class="confirm-card__row"><span>Period</span><span>${s.weekStart} → ${addDaysISO(s.weekStart, 6)}</span></div>
          <div class="confirm-card__row"><span>Total Hours</span><span>${totalH.toFixed(1)} hrs</span></div>
          <div class="confirm-card__row"><span>Gross Amount</span><span>${sym}${Math.round(gross).toLocaleString()}</span></div>
          <div class="confirm-card__row"><span>Tax</span><span>${sym}${Math.round(tax).toLocaleString()}</span></div>
          <div class="confirm-card__row is-total"><span>Total</span><span>${sym}${Math.round(gross + tax).toLocaleString()}</span></div>
        </div>
        <label class="checkbox-row"><input type="checkbox" id="sub-confirm" /> I confirm this timesheet is accurate and complete</label>
      </div>`;
  }

  function wireSubmitInputs() {
    const s = submitState;
    if (s.step === 0) {
      document.getElementById('sub-consultant').addEventListener('change', e => {
        s.consultantId = Number(e.target.value);
        renderSubmitStep();
      });
      const aSel = document.getElementById('sub-assignment');
      if (aSel) {
        aSel.addEventListener('change', e => {
          s.assignmentId = Number(e.target.value);
          renderSubmitStep();
        });
      }
      const ws = document.getElementById('sub-week-start');
      if (ws) ws.addEventListener('change', e => {
        s.weekStart = e.target.value;
        s.days = s.days.map((d, i) => ({ ...d, date: addDaysISO(s.weekStart, i) }));
      });
      document.querySelectorAll('[data-period]').forEach(b => {
        b.addEventListener('click', () => { s.periodType = b.dataset.period; renderSubmitStep(); });
      });
    }
    if (s.step === 1) {
      document.querySelectorAll('.daily-entry-row').forEach(row => {
        const idx = Number(row.dataset.day);
        row.querySelector('[data-field="hours"]').addEventListener('input', e => {
          s.days[idx].hours = Number(e.target.value) || 0;
          if (s.days[idx].hours > 0 && idx < 5) s.days[idx].billable = true;
          recalcLive();
        });
        row.querySelector('[data-field="activity"]').addEventListener('input', e => {
          s.days[idx].activity = e.target.value;
        });
      });
    }
    if (s.step === 2) {
      document.getElementById('sub-notes').addEventListener('input', e => { s.notes = e.target.value; });
    }
    if (s.step === 3) {
      document.getElementById('sub-confirm').addEventListener('change', e => {
        document.getElementById('modal-confirm').disabled = !e.target.checked;
      });
      document.getElementById('modal-confirm').disabled = true;
    }
  }

  function recalcLive() {
    const s = submitState;
    const ass = lookup.assignment(s.assignmentId);
    const rate = ass.rate || 0;
    const taxRate = TAX_LOOKUP[ass.tax] || 0;
    const sym = ass.currency === 'INR' ? '₹' : '$';
    const totalH = s.days.reduce((a, d) => a + d.hours, 0);
    const gross = totalH * rate;
    const tax = gross * taxRate;
    document.getElementById('calc-hours').textContent = totalH.toFixed(1) + ' hrs';
    document.getElementById('calc-gross').textContent = sym + Math.round(gross).toLocaleString();
    document.getElementById('calc-tax').textContent   = sym + Math.round(tax).toLocaleString();
    document.getElementById('calc-total').textContent = sym + Math.round(gross + tax).toLocaleString();
    /* update tick marks */
    s.days.forEach((d, i) => {
      const row = document.querySelector(`.daily-entry-row[data-day="${i}"]`);
      if (!row) return;
      const tick = row.querySelector('.billable-tick');
      tick.innerHTML = (d.billable && d.hours > 0) ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>' : '';
    });
    const weekendH = s.days.slice(5).reduce((a, d) => a + d.hours, 0);
    document.querySelector('.weekend-warning').classList.toggle('is-visible', weekendH > 0);
  }

  function submitNext() {
    const s = submitState;
    if (s.step === 0) {
      if (!s.consultantId || !s.assignmentId) { toast({ type: 'danger', title: 'Pick consultant and assignment to continue' }); return; }
    }
    if (s.step === 1) {
      const totalH = s.days.reduce((a, d) => a + d.hours, 0);
      if (totalH === 0) { toast({ type: 'danger', title: 'Enter at least some hours' }); return; }
    }
    if (s.step < 3) { s.step++; renderSubmitStep(); }
  }

  function submitFinish() {
    const s = submitState;
    if (!document.getElementById('sub-confirm').checked) return;
    return loadingButton('Submitting…', () => {
      const ass = lookup.assignment(s.assignmentId);
      const totalH = s.days.reduce((a, d) => a + d.hours, 0);
      const newTs = {
        id: 'TS-2406-' + String(TIMESHEETS.length + 1).padStart(3, '0'),
        consultantId: s.consultantId,
        assignmentId: s.assignmentId,
        period: `Jun W${weekNumberInJune(s.weekStart)} 2026`,
        periodLabel: fmtDayShort(s.weekStart) + ' – ' + fmtDayShort(addDaysISO(s.weekStart, 6)),
        billing: ass.billing,
        units: totalH,
        unitLabel: 'hrs',
        amount: totalH * ass.rate,
        currency: ass.currency,
        submittedOn: new Date().toISOString().slice(0, 16),
        status: 'Submitted',
        daily: s.days,
      };
      TIMESHEETS.unshift(newTs);
      renderAll();
      toast({
        type: 'success',
        title: `Timesheet submitted — ${lookup.consultant(s.consultantId).name}`,
        subtitle: `${newTs.period} · awaiting manager review`,
      });
    });
  }

  /* ── 14. MODAL CORE ──────────────────────────────────────────────────── */

  let modalCallbacks = {};

  function openModal(opts) {
    const modal = document.getElementById('modal');
    modal.className = 'modal' + (opts.size === 'sm' ? ' modal--sm' : opts.size === 'lg' ? ' modal--lg' : '');
    document.getElementById('modal-title').textContent = opts.title;
    document.getElementById('modal-subtitle').textContent = opts.subtitle || '';
    document.getElementById('modal-body').innerHTML = opts.body;

    /* Stepper */
    const stepper = document.getElementById('modal-stepper');
    if (opts.stepperCount) {
      stepper.style.display = 'flex';
      stepper.innerHTML = Array(opts.stepperCount).fill(0).map((_, i) =>
        `<span class="modal__step-dot ${i < opts.stepperActive ? 'is-done' : ''} ${i === opts.stepperActive ? 'is-active' : ''}"></span>`
      ).join('');
    } else {
      stepper.style.display = 'none';
    }

    /* Footer */
    const next = document.getElementById('modal-next');
    const back = document.getElementById('modal-back');
    const confirm = document.getElementById('modal-confirm');
    const cancel = document.getElementById('modal-cancel');

    if (opts.footButtons === 'stepper') {
      back.hidden = opts.stepperActive === 0;
      next.hidden = opts.stepperActive >= (opts.stepperCount - 1);
      confirm.hidden = opts.stepperActive < (opts.stepperCount - 1);
      confirm.textContent = 'Submit for Approval';
      confirm.className = 'btn btn--primary';
    } else {
      back.hidden = true;
      next.hidden = true;
      confirm.hidden = false;
      confirm.textContent = opts.confirmText || 'Confirm';
      confirm.className = 'btn ' + (opts.confirmClass || 'btn--primary');
    }

    modalCallbacks = {
      onConfirm: opts.onConfirm,
      onStepNext: opts.onStepNext,
      onStepBack: opts.onStepBack,
    };

    document.getElementById('modal-backdrop').hidden = false;
    modal.setAttribute('aria-hidden', 'false');
    requestAnimationFrame(() => {
      document.getElementById('modal-backdrop').classList.add('is-visible');
      modal.classList.add('is-open');
    });

    if (opts.onMount) setTimeout(opts.onMount, 0);
  }

  function closeModal() {
    document.getElementById('modal-backdrop').classList.remove('is-visible');
    document.getElementById('modal').classList.remove('is-open');
    document.getElementById('modal').setAttribute('aria-hidden', 'true');
    setTimeout(() => { document.getElementById('modal-backdrop').hidden = true; }, 200);
  }

  function loadingButton(text, fn) {
    const btn = document.getElementById('modal-confirm');
    const orig = btn.innerHTML;
    btn.innerHTML = `<span class="spinner"></span> ${text}`;
    btn.classList.add('is-loading-btn');
    setTimeout(() => {
      btn.innerHTML = orig;
      btn.classList.remove('is-loading-btn');
      closeModal();
      fn();
    }, 350);
    return true;
  }

  /* ── 15. BULK ACTION BAR ──────────────────────────────────────────────── */

  function renderBulkBar() {
    const bar = document.getElementById('bulk-bar');
    const n = state.selected.size;
    document.getElementById('bulk-count').textContent = n;
    if (n >= 2) {
      bar.hidden = false;
      requestAnimationFrame(() => bar.classList.add('is-visible'));
    } else {
      bar.classList.remove('is-visible');
      setTimeout(() => { bar.hidden = true; }, 250);
    }
  }

  /* ── 16. TOAST SYSTEM ─────────────────────────────────────────────────── */

  function toast({ type = 'info', title, subtitle }) {
    const region = document.getElementById('toast-region');
    const el = document.createElement('div');
    el.className = 'toast';
    const icons = {
      success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
      danger:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>',
      info:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>',
    };
    el.innerHTML = `
      <span class="toast__icon toast__icon--${type}">${icons[type]}</span>
      <div class="toast__body">
        <p class="toast__title">${title}</p>
        ${subtitle ? `<p class="toast__subtitle">${subtitle}</p>` : ''}
      </div>
      <button class="toast__close" aria-label="Dismiss"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg></button>
    `;
    region.appendChild(el);
    const close = () => {
      el.classList.add('toast--leave');
      setTimeout(() => el.remove(), 220);
    };
    el.querySelector('.toast__close').addEventListener('click', close);
    setTimeout(close, 3500);
  }

  /* ── 17. HELPERS ─────────────────────────────────────────────────────── */

  function formatLakhs(v) {
    if (v >= 1e7) return (v / 1e7).toFixed(2) + ' Cr';
    if (v >= 1e5) return (v / 1e5).toFixed(2) + 'L';
    return new Intl.NumberFormat('en-IN').format(Math.round(v));
  }
  function fmtDate(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }
  function fmtDateTime(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) + ' · ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }
  function fmtDayShort(iso) {
    return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
  }
  function timeAgo(iso) {
    const ms = Date.now() - new Date(iso).getTime();
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    if (days < 1) return 'today';
    if (days === 1) return '1 day ago';
    if (days < 30) return days + ' days ago';
    return Math.floor(days / 30) + ' months ago';
  }
  function addDaysISO(iso, n) {
    const d = new Date(iso);
    d.setDate(d.getDate() + n);
    return d.toISOString().slice(0, 10);
  }
  function addMinutes(iso, mins) {
    const d = new Date(iso);
    d.setMinutes(d.getMinutes() + mins);
    return d.toISOString().slice(0, 16);
  }
  function weekNumberInJune(iso) {
    const day = new Date(iso).getDate();
    return Math.ceil(day / 7);
  }
  function statusClass(s) {
    if (s === 'Approved') return 'status--success';
    if (s === 'Rejected') return 'status--danger';
    if (s === 'Submitted') return 'status--warning';
    if (s === 'Draft') return 'status--inactive';
    return 'status--info';
  }

  function iconCalendar() { return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="17" rx="2.5"/><path d="M3 9h18M8 2v4M16 2v4"/></svg>`; }
  function iconClock()    { return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>`; }
  function iconActivity() { return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`; }
  function iconRupee()    { return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h12M6 8h12M6 13l9 8M6 13h3a4 4 0 0 0 0-8"/></svg>`; }

  /* ── 18. TAB + RENDER ENTRY POINT ─────────────────────────────────────── */

  function setTab(tab, push = true) {
    state.tab = tab;
    state.selected.clear();
    document.querySelectorAll('.md-tab').forEach(t => {
      const on = t.dataset.tab === tab;
      t.classList.toggle('is-active', on);
      t.setAttribute('aria-selected', String(on));
    });
    if (push) {
      const url = new URL(location.href);
      url.searchParams.set('tab', tab);
      history.pushState({ tab }, '', url);
    }
    renderAll();
  }

  function renderAll() {
    renderStats();
    renderBanner();
    renderTable();
    if (state.view !== 'table') setView(state.view);
    renderBulkBar();
  }

  /* ── 19. BOOTSTRAP ────────────────────────────────────────────────────── */

  function init() {
    /* URL state */
    const params = new URLSearchParams(location.search);
    const initialTab = params.get('tab') || 'all';
    state.tab = initialTab;

    renderFilters();
    setTab(state.tab, false);

    /* Tab clicks */
    document.querySelectorAll('.md-tab').forEach(t => {
      t.addEventListener('click', () => setTab(t.dataset.tab));
    });

    /* Search */
    document.getElementById('global-search').addEventListener('input', e => {
      state.q = e.target.value.trim();
      renderTable();
    });

    /* Period prev/next (just text rotation for demo) */
    const periods = ['April 2026', 'May 2026', 'June 2026', 'July 2026', 'August 2026'];
    let pIdx = 2;
    const updatePeriod = () => { document.getElementById('period-label').textContent = periods[pIdx]; state.period = periods[pIdx]; };
    document.getElementById('period-prev').addEventListener('click', () => { if (pIdx > 0) { pIdx--; updatePeriod(); }});
    document.getElementById('period-next').addEventListener('click', () => { if (pIdx < periods.length - 1) { pIdx++; updatePeriod(); }});

    /* Filters */
    document.getElementById('filter-consultant').addEventListener('change', e => { state.consultantId = e.target.value; renderTable(); });
    document.getElementById('filter-billing').addEventListener('change', e => { state.billing = e.target.value; renderTable(); });
    document.getElementById('sort-by').addEventListener('change', e => { state.sort = e.target.value; renderTable(); });

    /* View toggle */
    document.querySelectorAll('[data-view]').forEach(b => {
      b.addEventListener('click', () => setView(b.dataset.view));
    });

    /* Select all */
    document.getElementById('select-all').addEventListener('change', e => {
      const rows = applyFiltersToData();
      if (e.target.checked) rows.forEach(r => state.selected.add(r.id));
      else state.selected.clear();
      renderTable();
      renderBulkBar();
    });

    /* Submit timesheet button */
    document.getElementById('btn-submit-ts').addEventListener('click', startSubmitFlow);

    /* Export (CSV) */
    document.getElementById('btn-export').addEventListener('click', () => {
      const rows = applyFiltersToData();
      const csv = [
        ['ID', 'Consultant', 'Assignment', 'Client', 'Period', 'Billing', 'Units', 'Amount', 'Currency', 'Status'].join(','),
        ...rows.map(t => [
          t.id, lookup.consultant(t.consultantId).name, lookup.assignment(t.assignmentId).name,
          lookup.client(lookup.assignment(t.assignmentId).clientId).name,
          t.period, t.billing, t.units, t.amount, t.currency, t.status,
        ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')),
      ].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `timesheets-${state.tab}-${new Date().toISOString().slice(0,10)}.csv`;
      a.click();
      toast({ type: 'success', title: `${rows.length} timesheets exported` });
    });

    /* Drawer close */
    document.getElementById('drawer-close').addEventListener('click', closeDrawer);
    document.getElementById('drawer-backdrop').addEventListener('click', closeDrawer);

    /* Modal */
    document.getElementById('modal-close').addEventListener('click', closeModal);
    document.getElementById('modal-cancel').addEventListener('click', closeModal);
    document.getElementById('modal-backdrop').addEventListener('click', closeModal);
    document.getElementById('modal-confirm').addEventListener('click', () => {
      if (modalCallbacks.onConfirm) modalCallbacks.onConfirm();
    });
    document.getElementById('modal-next').addEventListener('click', () => {
      if (modalCallbacks.onStepNext) modalCallbacks.onStepNext();
    });
    document.getElementById('modal-back').addEventListener('click', () => {
      if (modalCallbacks.onStepBack) modalCallbacks.onStepBack();
    });

    /* Bulk action bar */
    document.getElementById('bulk-deselect').addEventListener('click', () => {
      state.selected.clear(); renderTable(); renderBulkBar();
    });
    document.getElementById('bulk-close').addEventListener('click', () => {
      state.selected.clear(); renderTable(); renderBulkBar();
    });
    document.getElementById('bulk-approve').addEventListener('click', () => {
      startApproveFlow(Array.from(state.selected));
    });
    document.getElementById('bulk-reject').addEventListener('click', () => {
      startRejectFlow(Array.from(state.selected));
    });
    document.getElementById('bulk-export').addEventListener('click', () => {
      toast({ type: 'info', title: `Exporting ${state.selected.size} selected timesheets…` });
    });

    /* Clear filters */
    document.getElementById('btn-clear-filters').addEventListener('click', () => {
      state.q = ''; state.consultantId = 'all'; state.billing = 'all';
      document.getElementById('global-search').value = '';
      document.getElementById('filter-consultant').value = 'all';
      document.getElementById('filter-billing').value = 'all';
      renderTable();
    });

    /* Escape */
    document.addEventListener('keydown', e => {
      if (e.key !== 'Escape') return;
      if (document.getElementById('modal').classList.contains('is-open')) closeModal();
      else if (document.getElementById('drawer').classList.contains('is-open')) closeDrawer();
    });

    /* Back/forward */
    window.addEventListener('popstate', () => {
      const p = new URLSearchParams(location.search);
      setTab(p.get('tab') || 'all', false);
    });

    /* Page in */
    setTimeout(() => {
      document.body.classList.remove('is-loading');
      document.body.classList.add('is-loaded');
    }, 100);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
