/* ============================================================================
 * invoices.js — Invoice Management
 * Vanilla JS. 6-tab list, status-colored row borders, overdue pulse,
 * partial-paid progress bars, 7-section drawer, 6 modal flows
 * (approve / reject / send / payment / reminder / export), bulk actions,
 * card + timeline alternate views, toast notifications, URL state,
 * cross-screen state sync via localStorage.
 * ========================================================================== */

(() => {
  'use strict';

  /* ── CONSTANTS ─────────────────────────────────────────────────────────── */

  const INR_PER_USD = 83.25;
  const TODAY       = '2026-06-30';   /* demo locked-in "today" */

  /* ── LOOKUPS ───────────────────────────────────────────────────────────── */

  const COMPANIES = [
    { id: 1, name: 'INFO Services Pvt Ltd', gstin: '29AABCI1234A1Z5', pan: 'AABCI1234A', cin: 'U72900KA2015PTC082', address: 'Bengaluru, Karnataka 560001', state: 'Karnataka', bank: { name: 'HDFC Bank', ifsc: 'HDFC0001234', account: '50100123456789' }, signatory: 'Rajesh Iyer' },
    { id: 2, name: 'INFO Tech Solutions',   gstin: '27AABCI5678B1Z3', pan: 'AABCI5678B', cin: 'U72900MH2018PTC091', address: 'Mumbai, Maharashtra 400001', state: 'Maharashtra', bank: { name: 'ICICI Bank', ifsc: 'ICIC0001122', account: '00112233445566' }, signatory: 'Priya Kapoor' },
    { id: 3, name: 'INFO Global Services',  gstin: '07AABCI9012C1Z1', pan: 'AABCI9012C', cin: 'U72900DL2020PTC103', address: 'New Delhi 110001',             state: 'Delhi',       bank: { name: 'Axis Bank',  ifsc: 'UTIB0000456', account: '91110011223344' }, signatory: 'Amit Sharma' },
    { id: 4, name: 'INFO Consulting LLP',   gstin: '33AABCI3456D1Z9', pan: 'AABCI3456D', cin: 'U72900TN2022PTC115', address: 'Chennai, Tamil Nadu 600001',  state: 'Tamil Nadu',  bank: { name: 'SBI',        ifsc: 'SBIN0008765', account: '20140123456789' }, signatory: 'Lakshmi Iyer' },
  ];
  const CLIENTS = [
    { id: 1, name: 'Accenture India',  companyId: 1, gstin: '27AAACC1234A1Z5', state: 'Maharashtra', contact: 'Rajiv Sharma · billing@accenture.com', terms: 30, sez: false },
    { id: 2, name: 'TCS Limited',      companyId: 1, gstin: '29AAACC5678B1Z3', state: 'Karnataka',   contact: 'Anand Iyer · ap@tcs.com',             terms: 45, sez: false },
    { id: 3, name: 'Infosys BPM',      companyId: 2, gstin: '27AABCI9012C1Z2', state: 'Maharashtra', contact: 'Sneha Rao · sneha.rao@infosys.com',   terms: 30, sez: true  },
    { id: 4, name: 'Wipro Tech',       companyId: 2, gstin: '36AAACW3456D1Z4', state: 'Telangana',   contact: 'Karthik Menon · ap@wipro.com',        terms: 60, sez: false },
    { id: 5, name: 'HCL Methods',      companyId: 3, gstin: '09AAACH5678E1Z2', state: 'Uttar Pradesh', contact: 'Vikram Singh · billing@hcl.com',    terms: 30, sez: false },
    { id: 6, name: 'Cognizant Tech',   companyId: 3, gstin: '33AAACC9012F1Z6', state: 'Tamil Nadu',  contact: 'Meera Pillai · ap@cognizant.com',     terms: 45, sez: false },
  ];
  const CONSULTANTS = [
    { id: 1, name: 'Rahul Verma',    initials: 'RV', avatar: 'royal' },
    { id: 2, name: 'Anita Krishnan', initials: 'AK', avatar: 'success' },
    { id: 3, name: 'Deepak Mehta',   initials: 'DM', avatar: 'azure' },
    { id: 4, name: 'Sneha Pillai',   initials: 'SP', avatar: 'warning' },
    { id: 5, name: 'Kiran Nair',     initials: 'KN', avatar: 'danger' },
  ];
  const ASSIGNMENTS = [
    { id: 1, name: 'Accenture — Cloud Dev',     clientId: 1, hsn: '998314', billing: 'Hourly', rate: 2500 },
    { id: 2, name: 'TCS — Data Engineering',    clientId: 2, hsn: '998313', billing: 'Daily',  rate: 12000 },
    { id: 3, name: 'Infosys — AI Solutions',    clientId: 3, hsn: '998315', billing: 'Hourly', rate: 85,    currency: 'USD' },
    { id: 4, name: 'Wipro — QA Automation',     clientId: 4, hsn: '998312', billing: 'Hourly', rate: 65,    currency: 'USD' },
    { id: 5, name: 'HCL — DevOps Setup',        clientId: 5, hsn: '998316', billing: 'Daily',  rate: 15000 },
    { id: 6, name: 'Cognizant — BI Dashboard',  clientId: 6, hsn: '998314', billing: 'Hourly', rate: 2500 },
  ];

  const lookup = {
    company:    id => COMPANIES.find(c => c.id === id) || {},
    client:     id => CLIENTS.find(c => c.id === id) || {},
    consultant: id => CONSULTANTS.find(c => c.id === id) || {},
    assignment: id => ASSIGNMENTS.find(a => a.id === id) || {},
  };

  /* ── 10 INVOICES ───────────────────────────────────────────────────────── */

  let INVOICES = [
    { id: 'INV-2401', clientId: 1, consultantId: 1, assignmentId: 1, companyId: 1, period: 'Jun W1 2026', periodLabel: '2–8 Jun', units: 40, unit: 'hrs', subtotal: 100000, tax: 18000, total: 118000, taxType: 'IGST 18%', invDate: '2026-06-10', dueDate: '2026-07-10', status: 'Pending Approval', tsIds: ['TS-2406-001'] },
    { id: 'INV-2402', clientId: 2, consultantId: 2, assignmentId: 2, companyId: 1, period: 'Jun 2026',    periodLabel: 'June (Monthly)', units: 22, unit: 'days', subtotal: 264000, tax: 47520, total: 311520, taxType: 'CGST+SGST', invDate: '2026-07-01', dueDate: '2026-08-15', status: 'Pending Approval', tsIds: ['TS-2406-002'] },
    { id: 'INV-2403', clientId: 3, consultantId: 3, assignmentId: 3, companyId: 2, period: 'Jun W2 2026', periodLabel: '9–15 Jun', units: 38, unit: 'hrs', subtotal: 269170, tax: 0, total: 269170, taxType: 'SEZ/LUT', invDate: '2026-06-17', dueDate: '2026-07-17', status: 'Approved', tsIds: ['TS-2406-003'] },
    { id: 'INV-2404', clientId: 4, consultantId: 5, assignmentId: 4, companyId: 2, period: 'Jun W1 2026', periodLabel: '2–8 Jun', units: 36, unit: 'hrs', subtotal: 194940, tax: 0, total: 194940, taxType: 'CGST+SGST', invDate: '2026-06-10', dueDate: '2026-07-10', status: 'Sent', tsIds: ['TS-2406-005'] },
    { id: 'INV-2405', clientId: 5, consultantId: 4, assignmentId: 5, companyId: 3, period: 'May 2026',    periodLabel: 'May (Monthly)', units: 22, unit: 'days', subtotal: 320000, tax: 57600, total: 320000, taxType: 'IGST 18%', invDate: '2026-05-01', dueDate: '2026-06-01', status: 'Overdue' },
    { id: 'INV-2400', clientId: 6, consultantId: 1, assignmentId: 6, companyId: 3, period: 'Jun W1 2026', periodLabel: '2–8 Jun', units: 32, unit: 'hrs', subtotal: 80000,  tax: 14400, total: 94400,  taxType: 'IGST 18%',  invDate: '2026-06-10', dueDate: '2026-07-10', status: 'Draft' },
    { id: 'INV-2395', clientId: 2, consultantId: 2, assignmentId: 2, companyId: 1, period: 'May W4 2026',periodLabel: '25–31 May', units: 5,  unit: 'days', subtotal: 60000,  tax: 10800, total: 60000,  taxType: 'CGST+SGST', invDate: '2026-05-28', dueDate: '2026-06-27', status: 'Paid', paidDate: '2026-06-15', paidRef: 'NEFT-12345678', paidMode: 'NEFT' },
    { id: 'INV-2396', clientId: 1, consultantId: 1, assignmentId: 1, companyId: 1, period: 'May W3 2026',periodLabel: '18–24 May', units: 40, unit: 'hrs', subtotal: 100000, tax: 18000, total: 100000, taxType: 'IGST 18%',  invDate: '2026-05-22', dueDate: '2026-06-22', status: 'Paid', paidDate: '2026-06-10', paidRef: 'RTGS-87654321', paidMode: 'RTGS' },
    { id: 'INV-2397', clientId: 3, consultantId: 3, assignmentId: 3, companyId: 2, period: 'May W2 2026',periodLabel: '11–17 May', units: 38, unit: 'hrs', subtotal: 238700, tax: 0, total: 238700, taxType: 'SEZ/LUT',   invDate: '2026-05-15', dueDate: '2026-06-14', status: 'Partially Paid', paidAmount: 150000, paidDate: '2026-05-20', paidRef: 'REF-234567', paidMode: 'NEFT' },
    { id: 'INV-2398', clientId: 4, consultantId: 5, assignmentId: 4, companyId: 2, period: 'May W1 2026',periodLabel: '4–10 May', units: 30, unit: 'hrs', subtotal: 162500, tax: 0, total: 162500, taxType: 'CGST+SGST', invDate: '2026-05-08', dueDate: '2026-06-07', status: 'Paid', paidDate: '2026-06-05', paidRef: 'UPI-INV2398', paidMode: 'UPI' },
  ];

  /* ── STATE ─────────────────────────────────────────────────────────────── */

  let state = {
    tab:           'all',
    q:             '',
    clientId:      'all',
    taxType:       'all',
    sort:          'date-desc',
    selected:      new Set(),
    view:          'table',
    currency:      'INR',
    period:        'June 2026',
  };

  /* ── STATS STRIP ───────────────────────────────────────────────────────── */

  function renderStats() {
    const totalInvoiced = INVOICES.reduce((a, i) => a + i.total, 0);
    const collected = INVOICES.filter(i => i.status === 'Paid').reduce((a, i) => a + i.total, 0);
    const partial   = INVOICES.filter(i => i.status === 'Partially Paid').reduce((a, i) => a + (i.paidAmount || 0), 0);
    const outstanding = INVOICES.filter(i => ['Sent', 'Pending Approval', 'Approved', 'Partially Paid'].includes(i.status))
      .reduce((a, i) => a + (i.total - (i.paidAmount || 0)), 0);
    const overdue = INVOICES.filter(i => i.status === 'Overdue').reduce((a, i) => a + i.total, 0);

    const stats = [
      { label: 'Total Invoiced (YTD)', value: '₹' + formatLakhs(totalInvoiced), sub: INVOICES.length + ' invoices', tint: 'azure',   icon: iconReceipt(), trend: { text: '↑ 18.4% vs last year', color: 'var(--success-fg)' } },
      { label: 'Collected This Month', value: '₹' + formatLakhs(collected + partial), sub: '$' + Math.round((collected + partial) / INR_PER_USD).toLocaleString(), tint: 'success', icon: iconCheck(),  trend: { text: '↑ 12.1% vs May', color: 'var(--success-fg)' }, click: () => toast({ type: 'info', title: 'Payments screen pending build' }) },
      { label: 'Outstanding',          value: '₹' + formatLakhs(outstanding), sub: INVOICES.filter(i => ['Sent', 'Pending Approval', 'Partially Paid'].includes(i.status)).length + ' invoices pending', tint: 'warning', icon: iconClock(),  trend: { text: 'Awaiting payment', color: 'var(--warning-fg)' } },
      { label: 'Overdue',              value: '₹' + formatLakhs(overdue),     sub: INVOICES.filter(i => i.status === 'Overdue').length + ' invoices overdue', tint: 'danger', icon: iconAlert(),  trend: { text: 'Action required', color: 'var(--danger-fg)' }, click: () => setTab('overdue') },
    ];

    document.getElementById('stats-strip').innerHTML = stats.map((s, i) => `
      <article class="md-stat" data-stat-idx="${i}" ${s.click ? '' : 'data-clickable="false"'}>
        <span class="md-stat__icon md-stat__icon--${s.tint}">${s.icon}</span>
        <div>
          <p class="md-stat__label">${s.label}</p>
          <p class="md-stat__value">${s.value}</p>
          <p class="md-stat__sub" style="font-size:11px;color:${s.trend.color};margin-top:2px">${s.trend.text} · ${s.sub}</p>
        </div>
      </article>
    `).join('');
    stats.forEach((s, i) => { if (s.click) document.querySelector(`[data-stat-idx="${i}"]`).addEventListener('click', s.click); });
  }

  /* ── FILTERS POPULATION ───────────────────────────────────────────────── */

  function renderFiltersOptions() {
    const cSel = document.getElementById('filter-client');
    if (cSel.options.length <= 1) {
      cSel.innerHTML = `<option value="all">Client: All</option>` +
        CLIENTS.map(c => `<option value="${c.id}">Client: ${c.name}</option>`).join('');
    }
  }

  function applyFilters() {
    let rows = INVOICES.slice();
    const map = { draft: 'Draft', pending: 'Pending Approval', approved: ['Approved', 'Sent'], paid: 'Paid', overdue: 'Overdue' };
    if (state.tab !== 'all') {
      const target = map[state.tab];
      rows = rows.filter(i => Array.isArray(target) ? target.includes(i.status) : i.status === target);
    }
    if (state.q) {
      const q = state.q.toLowerCase();
      rows = rows.filter(i => {
        const cl = lookup.client(i.clientId).name || '';
        const co = lookup.consultant(i.consultantId).name || '';
        return (i.id + cl + co + i.total).toLowerCase().includes(q);
      });
    }
    if (state.clientId !== 'all') rows = rows.filter(i => i.clientId === Number(state.clientId));
    if (state.taxType !== 'all')   rows = rows.filter(i => i.taxType === state.taxType);

    const sortFns = {
      'date-desc':   (a, b) => b.invDate.localeCompare(a.invDate),
      'amount-desc': (a, b) => b.total - a.total,
      'due-asc':     (a, b) => a.dueDate.localeCompare(b.dueDate),
      'client':      (a, b) => lookup.client(a.clientId).name.localeCompare(lookup.client(b.clientId).name),
    };
    rows.sort(sortFns[state.sort] || sortFns['date-desc']);
    return rows;
  }

  /* ── TABLE RENDER ─────────────────────────────────────────────────────── */

  function renderTable() {
    const rows = applyFilters();
    const body = document.getElementById('inv-table-body');
    document.getElementById('result-count').textContent = `${rows.length} invoice${rows.length === 1 ? '' : 's'}`;
    updateTabBadges();
    syncNavBadge();

    if (rows.length === 0) {
      body.innerHTML = '';
      return;
    }

    body.innerHTML = rows.map(inv => {
      const cli = lookup.client(inv.clientId);
      const con = lookup.consultant(inv.consultantId);
      const usd = inv.total / INR_PER_USD;
      const sel = state.selected.has(inv.id);
      const rowCls = `row--${inv.status.toLowerCase().replace(/[ /]/g, inv.status === 'Partially Paid' ? 'partial' : '').replace(/partially paid/i, 'partial').replace('partially', 'partial')}` + (sel ? ' is-selected' : '');
      const rowClass = inv.status === 'Partially Paid' ? 'row--partial' + (sel ? ' is-selected' : '') :
                       inv.status === 'Pending Approval' ? 'row--pending' + (sel ? ' is-selected' : '') :
                       'row--' + inv.status.toLowerCase() + (sel ? ' is-selected' : '');
      const overdueDays = inv.status === 'Overdue' ? daysBetween(inv.dueDate, TODAY) : 0;
      const remaining = inv.total - (inv.paidAmount || 0);
      const paidPct = inv.paidAmount ? (inv.paidAmount / inv.total) * 100 : 0;

      return `
        <tr class="${rowClass}" data-id="${inv.id}">
          <td class="col-check"><input type="checkbox" data-select="${inv.id}" ${sel ? 'checked' : ''} onclick="event.stopPropagation()" /></td>
          <td><strong style="color:var(--brand-navy);font-weight:600">${inv.id}</strong></td>
          <td><a class="md-cell__primary" href="#" data-client-link="${inv.clientId}" style="color:var(--text-primary)">${cli.name}</a></td>
          <td><a class="md-cell__secondary" href="#" data-consultant-link="${inv.consultantId}">${con.name}</a></td>
          <td>${inv.period}<br><span class="md-cell__secondary">${inv.periodLabel}</span></td>
          <td class="num-col"><strong>${fmtINR(inv.total)}</strong>${inv.status === 'Partially Paid' ? `<div class="inv-progress"><div class="inv-progress__track"><div class="inv-progress__fill" style="width:${paidPct}%"></div></div><div class="inv-progress__label">${fmtINR(inv.paidAmount)} / ${fmtINR(inv.total)} (${Math.round(paidPct)}%)</div></div>` : ''}</td>
          <td class="num-col">${fmtUSD(usd)}</td>
          <td><span class="md-tax-pill">${inv.taxType}</span></td>
          <td><span class="md-cell__primary">${fmtDate(inv.invDate)}</span></td>
          <td><span class="md-cell__primary">${fmtDate(inv.dueDate)}</span>${overdueDays > 0 ? `<div class="inv-overdue-pill">${overdueDays} days overdue</div>` : ''}</td>
          <td><span class="status ${statusClass(inv.status)}">${inv.status}</span></td>
          <td class="col-actions"><div class="ts-actions">${rowActions(inv)}</div></td>
        </tr>`;
    }).join('');

    /* Wire row events */
    body.querySelectorAll('tr[data-id]').forEach(tr => {
      tr.addEventListener('click', e => {
        if (e.target.closest('button') || e.target.closest('input[type="checkbox"]') || e.target.closest('a[data-client-link]') || e.target.closest('a[data-consultant-link]')) return;
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
        handleAction(action, id);
      });
    });
    body.querySelectorAll('[data-client-link]').forEach(a => {
      a.addEventListener('click', e => { e.preventDefault(); window.location.href = `../master-data/?tab=clients&id=${a.dataset.clientLink}`; });
    });
    body.querySelectorAll('[data-consultant-link]').forEach(a => {
      a.addEventListener('click', e => { e.preventDefault(); window.location.href = `../master-data/?tab=consultants&id=${a.dataset.consultantLink}`; });
    });
  }

  /* Inline row action buttons */
  function rowActions(inv) {
    const view = `<button class="ts-action-btn ts-action-btn--ghost" data-action="view" data-id="${inv.id}">View</button>`;
    if (inv.status === 'Pending Approval') {
      return `
        <button class="ts-action-btn ts-action-btn--success" data-action="approve" data-id="${inv.id}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Approve</button>
        <button class="ts-action-btn ts-action-btn--danger" data-action="reject" data-id="${inv.id}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg> Reject</button>
        ${view}`;
    }
    if (inv.status === 'Approved') {
      return `<button class="ts-action-btn ts-action-btn--royal" data-action="send" data-id="${inv.id}">Send</button><button class="ts-action-btn ts-action-btn--ghost" data-action="pdf" data-id="${inv.id}">PDF</button>${view}`;
    }
    if (inv.status === 'Sent') {
      return `<button class="ts-action-btn ts-action-btn--royal" data-action="payment" data-id="${inv.id}">Record Payment</button>${view}`;
    }
    if (inv.status === 'Overdue') {
      return `<button class="ts-action-btn ts-action-btn--danger" data-action="reminder" data-id="${inv.id}">Send Reminder</button><button class="ts-action-btn ts-action-btn--royal" data-action="payment" data-id="${inv.id}">Record</button>${view}`;
    }
    if (inv.status === 'Partially Paid') {
      return `<button class="ts-action-btn ts-action-btn--royal" data-action="payment" data-id="${inv.id}">Record Balance</button>${view}`;
    }
    if (inv.status === 'Draft') {
      return `<button class="ts-action-btn ts-action-btn--ghost" data-action="edit" data-id="${inv.id}">Edit</button><button class="ts-action-btn ts-action-btn--royal" data-action="submit" data-id="${inv.id}">Submit</button>${view}`;
    }
    /* Paid */
    return `<button class="ts-action-btn ts-action-btn--ghost" data-action="pdf" data-id="${inv.id}">PDF</button>${view}`;
  }

  function handleAction(action, id) {
    if (action === 'view')     openDrawer(id);
    else if (action === 'approve')  startApproveFlow([id]);
    else if (action === 'reject')   startRejectFlow([id]);
    else if (action === 'send')     startSendFlow([id]);
    else if (action === 'payment')  startPaymentFlow(id);
    else if (action === 'reminder') startReminderFlow(id);
    else if (action === 'pdf')      triggerPdf(id);
    else if (action === 'submit') {
      const inv = INVOICES.find(i => i.id === id);
      if (inv) { inv.status = 'Pending Approval'; renderAll(); toast({ type: 'success', title: `${id} submitted for approval` }); }
    }
    else if (action === 'edit') {
      window.location.href = `./new.html?edit=${id}`;
    }
  }

  function updateTabBadges() {
    const counts = {
      all: INVOICES.length,
      draft: INVOICES.filter(i => i.status === 'Draft').length,
      pending: INVOICES.filter(i => i.status === 'Pending Approval').length,
      approved: INVOICES.filter(i => ['Approved', 'Sent'].includes(i.status)).length,
      paid: INVOICES.filter(i => i.status === 'Paid').length,
      overdue: INVOICES.filter(i => i.status === 'Overdue').length,
    };
    Object.entries(counts).forEach(([k, v]) => {
      const el = document.getElementById(`tab-count-${k}`);
      if (el) el.textContent = v;
    });
  }

  /* ── DRAWER (7 sections) ──────────────────────────────────────────────── */

  function openDrawer(id) {
    const inv = INVOICES.find(i => i.id === id);
    if (!inv) return;
    const cli = lookup.client(inv.clientId);
    const con = lookup.consultant(inv.consultantId);
    const co  = lookup.company(inv.companyId);
    const ass = lookup.assignment(inv.assignmentId);

    document.getElementById('drawer-title').textContent = inv.id;
    document.getElementById('drawer-subtitle').textContent = `${inv.period} · ${inv.periodLabel}`;
    document.getElementById('drawer-icon').innerHTML = `<span>${inv.id.split('-')[1].slice(-2)}</span>`;
    document.getElementById('drawer-status').className = 'status ' + statusClass(inv.status);
    document.getElementById('drawer-status').textContent = inv.status;

    /* Calculation values */
    const isInter = co.state !== cli.state;
    const cgst = inv.taxType === 'CGST+SGST' ? inv.tax / 2 : 0;
    const sgst = cgst;
    const igst = inv.taxType === 'IGST 18%' ? inv.tax : 0;
    const usd = inv.total / INR_PER_USD;

    /* Timeline */
    const tl = [
      { title: 'Draft Created',      meta: `${fmtDateTime(inv.invDate + 'T09:15')} · Priya Sharma`, state: 'done' },
      { title: 'Submitted',          meta: `${fmtDateTime(inv.invDate + 'T09:45')} · Priya Sharma`, state: 'done' },
      { title: 'Finance Review',     meta: inv.status === 'Pending Approval' ? 'Pending' : 'Approved',  state: inv.status === 'Pending Approval' ? 'current' : 'done' },
      { title: 'Signatory Approval', meta: ['Approved', 'Sent', 'Paid', 'Partially Paid', 'Overdue'].includes(inv.status) ? 'Approved' : 'Waiting', state: ['Approved', 'Sent', 'Paid', 'Partially Paid', 'Overdue'].includes(inv.status) ? 'done' : 'pending' },
      { title: 'Sent to Client',     meta: ['Sent', 'Paid', 'Partially Paid', 'Overdue'].includes(inv.status) ? 'Sent' : 'Waiting', state: ['Sent', 'Paid', 'Partially Paid', 'Overdue'].includes(inv.status) ? 'done' : 'pending' },
      { title: 'Payment Received',   meta: inv.status === 'Paid' ? 'Paid in full' : inv.status === 'Partially Paid' ? 'Partial payment received' : 'Waiting', state: inv.status === 'Paid' ? 'done' : inv.status === 'Partially Paid' ? 'current' : 'pending' },
    ];

    /* Body */
    document.getElementById('drawer-body').innerHTML = `
      <!-- Section 1: Parties -->
      <section class="drawer-section">
        <p class="drawer-section__title">Invoice Parties</p>
        <div class="inv-parties">
          <div class="inv-party">
            <div class="inv-party__head">
              <span class="inv-party__logo">IS</span>
              <div><p class="inv-party__type">Bill From</p><p class="inv-party__name">${co.name}</p></div>
            </div>
            <p class="inv-party__detail"><strong>GSTIN</strong> ${co.gstin}</p>
            <p class="inv-party__detail"><strong>PAN</strong> ${co.pan}</p>
            <p class="inv-party__detail"><strong>CIN</strong> ${co.cin}</p>
            <p class="inv-party__detail">${co.address}</p>
          </div>
          <div class="inv-party">
            <div class="inv-party__head">
              <span class="inv-party__logo" style="background:linear-gradient(135deg,var(--azure-500),var(--azure-700))">${initials(cli.name)}</span>
              <div><p class="inv-party__type">Bill To</p><p class="inv-party__name"><a href="../master-data/?tab=clients&id=${cli.id}" style="color:var(--text-primary)">${cli.name}</a></p></div>
            </div>
            <p class="inv-party__detail"><strong>GSTIN</strong> ${cli.gstin}</p>
            <p class="inv-party__detail"><strong>State</strong> ${cli.state}</p>
            <p class="inv-party__detail">${cli.contact}</p>
            <p class="inv-party__detail"><strong>Terms</strong> Net ${cli.terms}</p>
          </div>
        </div>
      </section>

      <!-- Section 2: Details -->
      <section class="drawer-section">
        <p class="drawer-section__title">Invoice Details</p>
        <div class="drawer-grid">
          <div class="drawer-field"><span class="drawer-field__label">Invoice Date</span><span class="drawer-field__value mono">${fmtDate(inv.invDate)}</span></div>
          <div class="drawer-field"><span class="drawer-field__label">Due Date</span><span class="drawer-field__value mono">${fmtDate(inv.dueDate)}</span></div>
          <div class="drawer-field"><span class="drawer-field__label">Period</span><span class="drawer-field__value">${inv.period}</span></div>
          <div class="drawer-field"><span class="drawer-field__label">Consultant</span><span class="drawer-field__value"><a href="../master-data/?tab=consultants&id=${con.id}">${con.name}</a></span></div>
          <div class="drawer-field"><span class="drawer-field__label">Assignment</span><span class="drawer-field__value"><a href="../master-data/?tab=assignments&id=${ass.id}">${ass.name}</a></span></div>
          <div class="drawer-field"><span class="drawer-field__label">HSN/SAC</span><span class="drawer-field__value mono">${ass.hsn}</span></div>
          <div class="drawer-field"><span class="drawer-field__label">Tax Type</span><span class="drawer-field__value">${inv.taxType}</span></div>
          <div class="drawer-field"><span class="drawer-field__label">Template</span><span class="drawer-field__value">Standard A</span></div>
        </div>
      </section>

      <!-- Section 3: Line items -->
      <section class="drawer-section">
        <p class="drawer-section__title">Line Items</p>
        <table class="inv-lines">
          <thead><tr><th>#</th><th>Description</th><th>HSN</th><th class="num-col">Qty</th><th class="num-col">Rate</th><th class="num-col">Amount</th></tr></thead>
          <tbody>
            <tr>
              <td>1</td>
              <td class="desc">IT Consulting Services<small>${ass.name} · ${inv.period}</small></td>
              <td class="mono-cell">${ass.hsn}</td>
              <td class="num-col">${inv.units} ${inv.unit}</td>
              <td class="num-col">₹${ass.rate.toLocaleString('en-IN')}</td>
              <td class="num-col">${fmtINR(inv.subtotal)}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr><td colspan="5">Subtotal</td><td>${fmtINR(inv.subtotal)}</td></tr>
            ${inv.taxType === 'CGST+SGST' ? `
              <tr><td colspan="5">CGST @ 9% on ${fmtINR(inv.subtotal)}</td><td>${fmtINR(cgst)}</td></tr>
              <tr><td colspan="5">SGST @ 9% on ${fmtINR(inv.subtotal)}</td><td>${fmtINR(sgst)}</td></tr>` : ''}
            ${inv.taxType === 'IGST 18%' ? `<tr><td colspan="5">IGST @ 18% on ${fmtINR(inv.subtotal)}</td><td>${fmtINR(igst)}</td></tr>` : ''}
            ${inv.taxType === 'SEZ/LUT' ? `<tr><td colspan="5">SEZ/LUT — Zero rated</td><td>₹0</td></tr>` : ''}
            <tr class="is-total"><td colspan="5">Total Invoice Value</td><td>${fmtINR(inv.total)}</td></tr>
            <tr class="is-usd"><td colspan="5">USD equivalent</td><td>${fmtUSD(usd)}</td></tr>
          </tfoot>
        </table>
      </section>

      <!-- Section 4: Source timesheets -->
      ${inv.tsIds && inv.tsIds.length ? `
      <section class="drawer-section">
        <p class="drawer-section__title">Source Timesheets</p>
        <table class="inv-source">
          <thead><tr><th>TS ID</th><th>Consultant</th><th>Period</th><th>Hours</th><th>Status</th></tr></thead>
          <tbody>
            ${inv.tsIds.map(t => `
              <tr data-ts="${t}">
                <td class="mono-cell"><a href="../timesheets/?id=${t}" style="color:var(--brand-royal);font-weight:500">${t}</a></td>
                <td>${con.name}</td>
                <td>${inv.period}</td>
                <td class="num-col">${inv.units} ${inv.unit}</td>
                <td><span class="status status--success">Approved ✓</span></td>
              </tr>`).join('')}
          </tbody>
        </table>
        <div class="inv-source__locked">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          Timesheets locked — linked to this invoice
        </div>
      </section>` : ''}

      <!-- Section 5: Timeline -->
      <section class="drawer-section">
        <p class="drawer-section__title">Invoice Status Timeline</p>
        <div class="ts-timeline">
          ${tl.map(s => `
            <div class="ts-timeline__step ts-timeline__step--${s.state}">
              <span class="ts-timeline__dot"></span>
              <p class="ts-timeline__title">${s.title}</p>
              <p class="ts-timeline__meta">${s.meta}</p>
            </div>`).join('')}
        </div>
      </section>

      <!-- Section 6: Payment status (conditional) -->
      ${['Sent', 'Paid', 'Partially Paid', 'Overdue'].includes(inv.status) ? `
      <section class="drawer-section">
        <p class="drawer-section__title">Payment Status</p>
        ${inv.status === 'Paid' ? `
          <div class="inv-payment inv-payment--paid">
            <div class="inv-payment__banner">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              Paid in full
            </div>
            <div class="inv-payment__row"><span>Paid On</span><span>${fmtDate(inv.paidDate)}</span></div>
            <div class="inv-payment__row"><span>Reference</span><span>${inv.paidRef}</span></div>
            <div class="inv-payment__row"><span>Mode</span><span>${inv.paidMode}</span></div>
          </div>` : inv.status === 'Partially Paid' ? `
          <div class="inv-payment">
            <div class="inv-payment__row"><span>Total Invoice</span><span>${fmtINR(inv.total)}</span></div>
            <div class="inv-payment__row" style="color:var(--success-fg)"><span>Amount Paid</span><span>${fmtINR(inv.paidAmount)}</span></div>
            <div class="inv-payment__row" style="color:var(--warning-fg)"><span>Balance Due</span><span>${fmtINR(inv.total - inv.paidAmount)}</span></div>
            <div class="inv-payment__progress"><div class="inv-payment__fill" style="width:${(inv.paidAmount / inv.total) * 100}%"></div></div>
            <p style="font-size:11px;color:var(--text-tertiary);margin-top:8px">Payment History:</p>
            <table class="drawer-mini-table">
              <thead><tr><th>Date</th><th>Amount</th><th>Ref</th><th>Mode</th></tr></thead>
              <tbody><tr><td>${fmtDate(inv.paidDate)}</td><td class="mono-cell">${fmtINR(inv.paidAmount)}</td><td class="mono-cell">${inv.paidRef}</td><td>${inv.paidMode}</td></tr></tbody>
            </table>
          </div>` : `
          <div class="inv-payment">
            <div class="inv-payment__row"><span>Total Invoice</span><span>${fmtINR(inv.total)}</span></div>
            <div class="inv-payment__row"><span>Balance Due</span><span>${fmtINR(inv.total)}</span></div>
            ${inv.status === 'Overdue' ? `<p style="font-size:13px;color:var(--danger-fg);font-weight:500;margin-top:6px">⚠ ${daysBetween(inv.dueDate, TODAY)} days overdue — send reminder or record payment.</p>` : ''}
          </div>`}
      </section>` : ''}

      <!-- Section 7: Notes -->
      <section class="drawer-section">
        <p class="drawer-section__title">Internal Notes</p>
        <textarea class="inv-notes" placeholder="Add internal note (not visible on PDF)…"></textarea>
      </section>
    `;

    /* Footer */
    document.getElementById('drawer-footer').innerHTML = drawerFooter(inv);
    document.getElementById('drawer-footer').querySelectorAll('[data-drawer-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const action = btn.dataset.drawerAction;
        closeDrawer();
        handleAction(action, id);
      });
    });

    /* Source timesheet row click */
    document.querySelectorAll('[data-ts]').forEach(tr => {
      tr.addEventListener('click', e => {
        if (e.target.closest('a')) return;
        window.location.href = `../timesheets/?id=${tr.dataset.ts}`;
      });
    });

    document.getElementById('drawer-backdrop').hidden = false;
    document.getElementById('drawer').setAttribute('aria-hidden', 'false');
    requestAnimationFrame(() => {
      document.getElementById('drawer-backdrop').classList.add('is-visible');
      document.getElementById('drawer').classList.add('is-open');
    });
  }

  function drawerFooter(inv) {
    const s = inv.status;
    if (s === 'Draft') {
      return `<button class="btn btn--ghost" data-drawer-action="delete" data-id="${inv.id}">Delete</button><button class="btn btn--ghost" data-drawer-action="edit" data-id="${inv.id}">Edit Invoice</button><button class="btn btn--primary" data-drawer-action="submit" data-id="${inv.id}">Submit for Approval</button>`;
    }
    if (s === 'Pending Approval') {
      return `<button class="btn btn--ghost" data-drawer-action="reject" data-id="${inv.id}">✗ Reject</button><button class="btn btn--success" data-drawer-action="approve" data-id="${inv.id}">✓ Approve</button>`;
    }
    if (s === 'Approved') {
      return `<button class="btn btn--ghost" data-drawer-action="pdf" data-id="${inv.id}">Download PDF</button><button class="btn btn--primary" data-drawer-action="send" data-id="${inv.id}">Send to Client →</button>`;
    }
    if (s === 'Sent') {
      return `<button class="btn btn--ghost" data-drawer-action="pdf" data-id="${inv.id}">Download PDF</button><button class="btn btn--primary" data-drawer-action="payment" data-id="${inv.id}">Record Payment →</button>`;
    }
    if (s === 'Partially Paid') {
      return `<button class="btn btn--ghost" data-drawer-action="pdf" data-id="${inv.id}">Download PDF</button><button class="btn btn--primary" data-drawer-action="payment" data-id="${inv.id}">Record Balance →</button>`;
    }
    if (s === 'Paid') {
      return `<button class="btn btn--primary" data-drawer-action="pdf" data-id="${inv.id}">Download PDF</button>`;
    }
    if (s === 'Overdue') {
      return `<button class="btn btn--ghost" data-drawer-action="reminder" data-id="${inv.id}" style="border-color:var(--warning);color:var(--warning-fg)">Send Reminder</button><button class="btn btn--primary" data-drawer-action="payment" data-id="${inv.id}">Record Payment →</button>`;
    }
    return '';
  }

  function closeDrawer() {
    document.getElementById('drawer-backdrop').classList.remove('is-visible');
    document.getElementById('drawer').classList.remove('is-open');
    document.getElementById('drawer').setAttribute('aria-hidden', 'true');
    setTimeout(() => { document.getElementById('drawer-backdrop').hidden = true; }, 350);
  }

  /* ── MODAL FLOWS (approve / reject / send / payment / reminder / export) */

  let modalCb = {};

  function openModal(opts) {
    const modal = document.getElementById('modal');
    modal.className = 'modal' + (opts.size === 'sm' ? ' modal--sm' : opts.size === 'lg' ? ' modal--lg' : '');
    document.getElementById('modal-title').textContent = opts.title;
    document.getElementById('modal-subtitle').textContent = opts.subtitle || '';
    document.getElementById('modal-body').innerHTML = opts.body;
    const confirm = document.getElementById('modal-confirm');
    confirm.textContent = opts.confirmText || 'Confirm';
    confirm.className = 'btn ' + (opts.confirmClass || 'btn--primary');
    modalCb = { onConfirm: opts.onConfirm };
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

  function loading(text, fn) {
    const btn = document.getElementById('modal-confirm');
    const orig = btn.innerHTML;
    btn.innerHTML = `<span class="spinner"></span> ${text}`;
    btn.classList.add('is-loading-btn');
    setTimeout(() => {
      btn.innerHTML = orig;
      btn.classList.remove('is-loading-btn');
      closeModal();
      fn();
    }, 400);
    return true;
  }

  /* APPROVE */
  function startApproveFlow(ids) {
    const items = ids.map(id => INVOICES.find(i => i.id === id)).filter(Boolean);
    if (items.length === 0) return;
    const totalAmt = items.reduce((a, i) => a + i.total, 0);
    const body = items.length === 1 ? approveSummary(items[0]) : `
      <div class="confirm-card">
        <div class="confirm-card__row"><span>Invoices</span><span>${items.length}</span></div>
        <div class="confirm-card__row is-total"><span>Combined Total</span><span>${fmtINR(totalAmt)}</span></div>
      </div>`;
    openModal({
      size: 'sm',
      title: items.length === 1 ? 'Approve Invoice?' : `Approve ${items.length} Invoices?`,
      body: body + `
        <div class="inv-compliance" style="margin-top:14px">
          <p class="inv-compliance__title">Compliance Check</p>
          <p class="inv-compliance__item inv-compliance__item--ok"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> GSTIN valid (client + company)</p>
          <p class="inv-compliance__item inv-compliance__item--ok"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Tax type correct for state pair</p>
          <p class="inv-compliance__item inv-compliance__item--ok"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Amount verified against timesheet</p>
          <p class="inv-compliance__item inv-compliance__item--ok"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Period within filing window</p>
        </div>
        <label class="checkbox-row" style="margin-top:14px"><input type="checkbox" id="notify-sig" checked /> Notify signing authority</label>
        <label class="checkbox-row"><input type="checkbox" id="send-copy" /> Send approved copy to client immediately</label>
        <p style="font-size:11px;color:var(--text-tertiary);margin-top:10px;font-style:italic">Your approval will be digitally logged with timestamp and IP in the audit trail.</p>`,
      confirmText: '✓ Confirm Approval',
      confirmClass: 'btn--success',
      onConfirm: () => loading('Approving and locking…', () => {
        const sendCopy = document.getElementById('send-copy')?.checked;
        items.forEach(i => { i.status = sendCopy ? 'Sent' : 'Approved'; });
        state.selected.clear();
        renderAll();
        items.forEach(i => toast({ type: 'success', title: `${i.id} Approved — locked for delivery`, subtitle: i.status === 'Sent' ? 'Auto-sent to client' : 'Ready to send' }));
      }),
    });
  }
  function approveSummary(inv) {
    const cli = lookup.client(inv.clientId);
    return `<div class="confirm-card">
      <div class="confirm-card__row"><span>Invoice</span><span>${inv.id}</span></div>
      <div class="confirm-card__row"><span>Client</span><span>${cli.name}</span></div>
      <div class="confirm-card__row"><span>Amount</span><span>${fmtINR(inv.total)}</span></div>
      <div class="confirm-card__row"><span>Tax</span><span>${inv.taxType} · ${fmtINR(inv.tax)}</span></div>
      <div class="confirm-card__row is-total"><span>Total</span><span>${fmtINR(inv.total)}</span></div>
    </div>`;
  }

  /* REJECT */
  function startRejectFlow(ids) {
    const items = ids.map(id => INVOICES.find(i => i.id === id)).filter(Boolean);
    if (items.length === 0) return;
    const sub = items.length === 1 ? `${items[0].id} · ${lookup.client(items[0].clientId).name} · ${fmtINR(items[0].total)}` : `${items.length} invoices selected`;
    openModal({
      size: 'sm',
      title: items.length === 1 ? 'Reject Invoice' : `Reject ${items.length} Invoices`,
      subtitle: sub,
      body: `
        <div style="display:flex;flex-direction:column;gap:8px">
          <div class="form-field">
            <label>Reason for Rejection <span class="req">*</span></label>
            <textarea id="rej-reason" rows="3" placeholder="Explain reason for rejection (min 15 chars)…"></textarea>
            <span class="form-field__error"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg> <span class="msg">Reason required</span></span>
          </div>
          <p style="font-size:11px;color:var(--text-tertiary)">Quick reasons:</p>
          <div class="reason-chips">
            ${['Tax type incorrect', 'Amount mismatch', 'Wrong billing period', 'Missing HSN code', 'Client details incorrect', 'Timesheet discrepancy'].map(r => `<button class="reason-chip" data-reason="${r}">${r}</button>`).join('')}
          </div>
          <label class="checkbox-row" style="margin-top:8px"><input type="checkbox" id="notify-fa" checked /> Notify Finance Admin</label>
          <label class="checkbox-row"><input type="checkbox" id="urgent" /> Flag for urgent review</label>
        </div>`,
      confirmText: '✗ Confirm Rejection',
      confirmClass: 'btn--danger',
      onConfirm: () => {
        const ta = document.getElementById('rej-reason');
        if (ta.value.trim().length < 15) {
          ta.closest('.form-field').classList.add('is-error');
          return false;
        }
        return loading('Rejecting…', () => {
          items.forEach(i => { i.status = 'Draft'; i.rejectionReason = ta.value.trim(); });
          state.selected.clear();
          renderAll();
          items.forEach(i => toast({ type: 'danger', title: `${i.id} Rejected — returned to Finance Admin`, subtitle: i.rejectionReason.slice(0, 50) + (i.rejectionReason.length > 50 ? '…' : '') }));
          bumpNotifBadge(items.length);
        });
      },
      onMount: () => {
        document.querySelectorAll('.reason-chip').forEach(c => {
          c.addEventListener('click', () => {
            const ta = document.getElementById('rej-reason');
            ta.value = ta.value.trim() ? ta.value.trim() + '. ' + c.dataset.reason : c.dataset.reason;
            ta.focus();
          });
        });
      },
    });
  }

  /* SEND TO CLIENT */
  function startSendFlow(ids) {
    const items = ids.map(id => INVOICES.find(i => i.id === id)).filter(Boolean);
    if (items.length === 0) return;
    const inv = items[0];
    const cli = lookup.client(inv.clientId);
    openModal({
      size: 'sm',
      title: 'Send Invoice to Client',
      subtitle: `${inv.id} · ${cli.name}`,
      body: `
        <div style="display:flex;flex-direction:column;gap:10px">
          <div class="form-field"><label>To</label><input type="email" value="${cli.contact.split('·')[1]?.trim() || 'billing@example.com'}" readonly /></div>
          <div class="form-field"><label>CC (optional)</label><input type="email" placeholder="cc@…" /></div>
          <div class="form-field"><label>Subject</label><input type="text" value="Invoice ${inv.id} — INFO Services · ${inv.period}" /></div>
          <div class="form-field"><label>Body (editable)</label>
            <textarea rows="6" style="font-family:var(--font-body);font-size:13px;width:100%;padding:10px 12px;border:1px solid var(--border);border-radius:var(--radius-sm);resize:vertical">Dear Team,

Please find attached Invoice ${inv.id} for IT Consulting Services rendered during ${inv.period}.

Amount Due: ${fmtINR(inv.total)} (${fmtUSD(inv.total / INR_PER_USD)})
Due Date: ${fmtDate(inv.dueDate)}

Regards,
Priya Sharma
Finance, INFO Services</textarea>
          </div>
          <div style="display:inline-flex;align-items:center;gap:6px;padding:8px 12px;background:var(--bg-muted);border-radius:var(--radius-xs);font-size:13px;width:fit-content">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
            ${inv.id}.pdf
          </div>
          <label class="checkbox-row"><input type="checkbox" /> Request read receipt</label>
          <label class="checkbox-row"><input type="checkbox" checked /> Set payment reminder (7 days before due)</label>
        </div>`,
      confirmText: 'Send Invoice →',
      confirmClass: 'btn--primary',
      onConfirm: () => loading('Sending…', () => {
        items.forEach(i => { i.status = 'Sent'; });
        renderAll();
        items.forEach(i => toast({ type: 'success', title: `Invoice sent to ${lookup.client(i.clientId).name}`, subtitle: i.id + ' · Delivery tracking started' }));
      }),
    });
  }

  /* RECORD PAYMENT */
  function startPaymentFlow(id) {
    const inv = INVOICES.find(i => i.id === id);
    if (!inv) return;
    const outstanding = inv.total - (inv.paidAmount || 0);
    openModal({
      size: 'sm',
      title: 'Record Payment',
      subtitle: `${inv.id} · ${lookup.client(inv.clientId).name} · ${fmtINR(outstanding)} outstanding`,
      body: `
        <div style="display:flex;flex-direction:column;gap:10px">
          <div class="form-grid">
            <div class="form-field"><label>Payment Date <span class="req">*</span></label><input type="date" id="pay-date" value="${TODAY}" /></div>
            <div class="form-field"><label>Amount Received <span class="req">*</span></label><input type="number" id="pay-amount" value="${outstanding}" min="0" max="${outstanding}" /></div>
            <div class="form-field"><label>Mode <span class="req">*</span></label>
              <select id="pay-mode"><option>NEFT</option><option>RTGS</option><option>UPI</option><option>Cheque</option><option>Wire Transfer</option></select>
            </div>
            <div class="form-field"><label>Reference # <span class="req">*</span></label><input type="text" id="pay-ref" placeholder="REF-12345" /></div>
            <div class="form-field form-field--wide"><label>Bank Reference (optional)</label><input type="text" placeholder="Bank txn ID" /></div>
            <div class="form-field form-field--wide"><label>Notes (optional)</label><input type="text" placeholder="Payment received via…" /></div>
          </div>
          <div style="display:flex;gap:14px;padding:10px;background:var(--bg-muted);border-radius:var(--radius-xs);font-size:13px">
            <label style="display:flex;align-items:center;gap:6px;cursor:pointer"><input type="radio" name="pay-type" value="full" checked /> Full Payment (${fmtINR(outstanding)})</label>
            <label style="display:flex;align-items:center;gap:6px;cursor:pointer"><input type="radio" name="pay-type" value="partial" /> Partial</label>
          </div>
          <p id="remaining-info" style="font-size:11px;color:var(--text-tertiary)"></p>
        </div>`,
      confirmText: 'Record Payment',
      confirmClass: 'btn--primary',
      onConfirm: () => {
        const amt = Number(document.getElementById('pay-amount').value);
        const ref = document.getElementById('pay-ref').value.trim();
        const mode = document.getElementById('pay-mode').value;
        const date = document.getElementById('pay-date').value;
        if (!ref || !amt) { toast({ type: 'danger', title: 'Reference and amount are required' }); return false; }
        return loading('Recording…', () => {
          if (amt >= outstanding) {
            inv.status = 'Paid';
            inv.paidAmount = inv.total;
            inv.paidDate = date;
            inv.paidRef = ref;
            inv.paidMode = mode;
            toast({ type: 'success', title: `Full payment recorded — ${inv.id} Paid`, subtitle: fmtINR(amt) + ' via ' + mode });
          } else {
            inv.status = 'Partially Paid';
            inv.paidAmount = (inv.paidAmount || 0) + amt;
            inv.paidDate = date;
            inv.paidRef = ref;
            inv.paidMode = mode;
            toast({ type: 'success', title: `Partial payment recorded — ${inv.id}`, subtitle: fmtINR(amt) + ' · ' + fmtINR(inv.total - inv.paidAmount) + ' remaining' });
          }
          renderAll();
          syncDashboardKpis(amt);
        });
      },
      onMount: () => {
        const update = () => {
          const isPartial = document.querySelector('[name="pay-type"]:checked').value === 'partial';
          const input = document.getElementById('pay-amount');
          input.max = outstanding;
          if (!isPartial) input.value = outstanding;
          const info = document.getElementById('remaining-info');
          const amt = Number(input.value);
          info.textContent = amt < outstanding ? `Remaining after this payment: ${fmtINR(outstanding - amt)}` : '';
        };
        document.querySelectorAll('[name="pay-type"]').forEach(r => r.addEventListener('change', update));
        document.getElementById('pay-amount').addEventListener('input', update);
      },
    });
  }

  /* SEND REMINDER */
  function startReminderFlow(id) {
    const inv = INVOICES.find(i => i.id === id);
    if (!inv) return;
    const cli = lookup.client(inv.clientId);
    const overdueDays = daysBetween(inv.dueDate, TODAY);
    openModal({
      size: 'sm',
      title: 'Send Payment Reminder',
      subtitle: `${inv.id} · ${fmtINR(inv.total)} · ${overdueDays} days overdue`,
      body: `
        <div style="display:flex;flex-direction:column;gap:10px">
          <div class="form-field"><label>Reminder Type</label>
            <div style="display:flex;flex-direction:column;gap:6px">
              <label class="inv-tax-option is-checked"><input type="radio" name="rem-type" value="gentle" checked /><span class="inv-tax-option__label">Gentle Reminder</span><span class="inv-tax-option__sub">First reminder · polite tone</span></label>
              <label class="inv-tax-option"><input type="radio" name="rem-type" value="followup" /><span class="inv-tax-option__label">Follow-up Reminder</span><span class="inv-tax-option__sub">Second reminder · firmer</span></label>
              <label class="inv-tax-option"><input type="radio" name="rem-type" value="final" /><span class="inv-tax-option__label">Final Notice</span><span class="inv-tax-option__sub">Urgent · escalation pending</span></label>
            </div>
          </div>
          <div class="form-field">
            <label>Email Preview</label>
            <textarea id="rem-body" rows="5" style="font-family:var(--font-body);font-size:13px;width:100%;padding:10px 12px;border:1px solid var(--border);border-radius:var(--radius-sm);resize:vertical">Dear Team,

This is a gentle reminder that Invoice ${inv.id} for ${fmtINR(inv.total)} was due on ${fmtDate(inv.dueDate)}.

We request payment at your earliest convenience.

Regards,
Priya Sharma
Finance, INFO Services</textarea>
          </div>
          <label class="checkbox-row"><input type="checkbox" checked /> Log this reminder in audit trail</label>
        </div>`,
      confirmText: 'Send Reminder',
      confirmClass: 'btn--primary',
      onConfirm: () => loading('Sending…', () => {
        inv.remindersSent = (inv.remindersSent || 0) + 1;
        toast({ type: 'success', title: `Payment reminder sent to ${cli.name}`, subtitle: `${inv.id} · Reminder ${inv.remindersSent} logged in audit trail` });
      }),
    });
  }

  /* EXPORT */
  function startExportFlow() {
    openModal({
      size: 'sm',
      title: 'Export Invoices',
      body: `
        <div style="display:flex;flex-direction:column;gap:14px">
          <div class="form-field"><label>Format</label>
            <div style="display:flex;flex-direction:column;gap:6px">
              <label class="inv-tax-option is-checked"><input type="radio" name="exp-fmt" value="csv" checked /><span class="inv-tax-option__label">CSV</span><span class="inv-tax-option__sub">All data, spreadsheet friendly</span></label>
              <label class="inv-tax-option"><input type="radio" name="exp-fmt" value="pdf" /><span class="inv-tax-option__label">PDF</span><span class="inv-tax-option__sub">Individual invoices in ZIP</span></label>
              <label class="inv-tax-option"><input type="radio" name="exp-fmt" value="excel" /><span class="inv-tax-option__label">Excel</span><span class="inv-tax-option__sub">With formulas</span></label>
              <label class="inv-tax-option"><input type="radio" name="exp-fmt" value="gst" /><span class="inv-tax-option__label">GST Report (GSTR-1)</span><span class="inv-tax-option__sub">For filing</span></label>
            </div>
          </div>
          <div class="form-grid">
            <div class="form-field"><label>From</label><input type="date" value="2026-05-01" /></div>
            <div class="form-field"><label>To</label><input type="date" value="${TODAY}" /></div>
          </div>
          <div class="form-field"><label>Include</label>
            <label class="checkbox-row"><input type="checkbox" checked /> Invoice details</label>
            <label class="checkbox-row"><input type="checkbox" checked /> Tax breakdown</label>
            <label class="checkbox-row"><input type="checkbox" checked /> Payment status</label>
            <label class="checkbox-row"><input type="checkbox" /> Timesheet reference</label>
            <label class="checkbox-row"><input type="checkbox" /> Audit trail</label>
          </div>
          <div class="form-field"><label>Filter</label>
            <label class="checkbox-row"><input type="radio" name="exp-filter" checked /> Current filter (${applyFilters().length})</label>
            <label class="checkbox-row"><input type="radio" name="exp-filter" /> All invoices (${INVOICES.length})</label>
            ${state.selected.size > 0 ? `<label class="checkbox-row"><input type="radio" name="exp-filter" /> Selected (${state.selected.size})</label>` : ''}
          </div>
        </div>`,
      confirmText: 'Export',
      onConfirm: () => loading('Preparing…', () => {
        const rows = applyFilters();
        const csv = [
          ['Invoice #', 'Client', 'Consultant', 'Period', 'Amount INR', 'Amount USD', 'Tax Type', 'Invoice Date', 'Due Date', 'Status'].join(','),
          ...rows.map(i => [i.id, lookup.client(i.clientId).name, lookup.consultant(i.consultantId).name, i.period, i.total, Math.round(i.total / INR_PER_USD), i.taxType, i.invDate, i.dueDate, i.status].map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')),
        ].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `invoices-${state.tab}-${TODAY}.csv`;
        a.click();
        toast({ type: 'success', title: `${rows.length} invoices exported` });
      }),
    });
  }

  /* PDF (browser print) */
  function triggerPdf(id) {
    toast({ type: 'info', title: `PDF for ${id}`, subtitle: 'Print dialog → Save as PDF' });
    setTimeout(() => window.print(), 600);
  }

  /* ── BULK BAR ─────────────────────────────────────────────────────────── */

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

  /* ── CARD VIEW ────────────────────────────────────────────────────────── */

  function renderCardsView() {
    const rows = applyFilters();
    const wrap = document.getElementById('view-cards');
    wrap.innerHTML = rows.map(inv => {
      const cli = lookup.client(inv.clientId);
      const con = lookup.consultant(inv.consultantId);
      const rowCls = inv.status === 'Partially Paid' ? 'partial' : inv.status === 'Pending Approval' ? 'pending' : inv.status.toLowerCase();
      return `
        <article class="ts-card ts-card--${rowCls}" data-id="${inv.id}">
          <div class="ts-card__head">
            <span class="status ${statusClass(inv.status)}">${inv.status}</span>
            <span class="ts-card__period">${inv.period}</span>
          </div>
          <div>
            <div class="ts-card__name"><strong>${inv.id}</strong></div>
            <p class="ts-card__sub">${cli.name} · ${con.name}</p>
          </div>
          <div class="ts-card__metrics">
            <div class="ts-card__metric"><span class="ts-card__metric-label">Units</span><span class="ts-card__metric-value">${inv.units}</span></div>
            <div class="ts-card__metric"><span class="ts-card__metric-label">Tax</span><span class="ts-card__metric-value" style="font-size:11px">${inv.taxType}</span></div>
            <div class="ts-card__metric"><span class="ts-card__metric-label">Total</span><span class="ts-card__metric-value">₹${formatLakhs(inv.total)}</span></div>
          </div>
          <div class="ts-card__foot">${rowActions(inv)}</div>
        </article>`;
    }).join('');
    wrap.querySelectorAll('.ts-card').forEach(c => {
      c.addEventListener('click', e => { if (e.target.closest('button')) return; openDrawer(c.dataset.id); });
    });
    wrap.querySelectorAll('[data-action]').forEach(b => b.addEventListener('click', e => {
      e.stopPropagation();
      handleAction(b.dataset.action, b.dataset.id);
    }));
  }

  /* ── TIMELINE VIEW ────────────────────────────────────────────────────── */

  function renderTimelineView() {
    const rows = applyFilters();
    /* Group rows by client */
    const byClient = {};
    rows.forEach(r => {
      const cl = lookup.client(r.clientId).name || '—';
      if (!byClient[cl]) byClient[cl] = [];
      byClient[cl].push(r);
    });
    /* Date axis: Jun 1–30 */
    const dates = Array.from({ length: 30 }, (_, i) => i + 1);
    const wrap = document.getElementById('view-timeline');
    wrap.innerHTML = `
      <div class="inv-timeline__axis">
        <span>Client</span>
        <div class="inv-timeline__dates">${dates.map(d => `<span class="inv-timeline__date ${d === 30 ? 'is-today' : ''}">${d}</span>`).join('')}</div>
      </div>
      ${Object.entries(byClient).map(([cl, items]) => `
        <div class="inv-timeline__row">
          <span class="inv-timeline__client">${cl}</span>
          <div class="inv-timeline__track">
            ${items.map(inv => {
              const d1 = Math.max(0, dayOfMonth(inv.invDate));
              const d2 = Math.min(30, dayOfMonth(inv.dueDate, true));
              const left = ((d1 - 1) / 30) * 100;
              const width = Math.max(((d2 - d1 + 1) / 30) * 100, 8);
              const cls = inv.status === 'Paid' ? 'paid' : inv.status === 'Overdue' ? 'overdue' : inv.status === 'Pending Approval' ? 'pending' : inv.status === 'Draft' ? 'draft' : '';
              return `<span class="inv-timeline__pill inv-timeline__pill--${cls}" style="left:${left}%;width:${width}%" data-id="${inv.id}" title="${inv.id} · ${fmtINR(inv.total)}">${inv.id}</span>`;
            }).join('')}
            <span class="inv-timeline__today" style="left:96.5%"></span>
          </div>
        </div>`).join('')}
      <div style="display:flex;gap:14px;margin-top:14px;padding-top:14px;border-top:1px solid var(--border-subtle);font-size:13px;color:var(--text-secondary)">
        <span><span class="inv-timeline__pill inv-timeline__pill--paid" style="position:static;display:inline-block;width:20px;padding:0;height:6px;vertical-align:middle"></span> Paid</span>
        <span><span class="inv-timeline__pill" style="position:static;display:inline-block;width:20px;padding:0;height:6px;vertical-align:middle"></span> Approved/Sent</span>
        <span><span class="inv-timeline__pill inv-timeline__pill--pending" style="position:static;display:inline-block;width:20px;padding:0;height:6px;vertical-align:middle"></span> Pending</span>
        <span><span class="inv-timeline__pill inv-timeline__pill--overdue" style="position:static;display:inline-block;width:20px;padding:0;height:6px;vertical-align:middle"></span> Overdue</span>
      </div>`;
    wrap.querySelectorAll('.inv-timeline__pill[data-id]').forEach(p => {
      p.addEventListener('click', () => openDrawer(p.dataset.id));
    });
  }

  function setView(view) {
    state.view = view;
    document.querySelectorAll('[data-view]').forEach(b => b.classList.toggle('is-active', b.dataset.view === view));
    document.getElementById('view-table').hidden = view !== 'table';
    document.getElementById('view-cards').hidden = view !== 'cards';
    if (view === 'cards')    renderCardsView();
  }

  /* ── TOAST ────────────────────────────────────────────────────────────── */

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
      <button class="toast__close" aria-label="Dismiss"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg></button>`;
    region.appendChild(el);
    const close = () => { el.classList.add('toast--leave'); setTimeout(() => el.remove(), 220); };
    el.querySelector('.toast__close').addEventListener('click', close);
    setTimeout(close, 4000);
  }

  /* ── CROSS-SCREEN STATE SYNC ──────────────────────────────────────────── */

  function syncNavBadge() {
    const pending = INVOICES.filter(i => i.status === 'Pending Approval').length;
    const overdue = INVOICES.filter(i => i.status === 'Overdue').length;
    const total = pending + overdue;
    const nav = document.getElementById('nav-badge-inv');
    if (nav) nav.textContent = total;
    /* Persist to localStorage for dashboard to read */
    try {
      localStorage.setItem('info-platform-state', JSON.stringify({
        invoicePendingCount: pending,
        invoiceOverdueCount: overdue,
        lastUpdated: new Date().toISOString(),
      }));
    } catch (e) { /* localStorage may be disabled */ }
  }

  function bumpNotifBadge(n) {
    const el = document.getElementById('nav-badge-notif');
    if (el) el.textContent = Number(el.textContent) + n;
  }

  function syncDashboardKpis() {
    /* Signal dashboard to refresh on next visit by tagging state in localStorage. */
    try {
      const cur = JSON.parse(localStorage.getItem('info-platform-state') || '{}');
      cur.dashboardRefreshNeeded = true;
      cur.lastPaymentTimestamp = new Date().toISOString();
      localStorage.setItem('info-platform-state', JSON.stringify(cur));
    } catch (e) {}
  }

  /* ── HELPERS ──────────────────────────────────────────────────────────── */

  function fmtINR(v) { return '₹' + new Intl.NumberFormat('en-IN').format(Math.round(v)); }
  function fmtUSD(v) { return '$' + new Intl.NumberFormat('en-US').format(Math.round(v)); }
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
    const d = new Date(iso);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) + ' · ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }
  function daysBetween(from, to) {
    return Math.max(0, Math.floor((new Date(to) - new Date(from)) / (86400000)));
  }
  function dayOfMonth(iso, isDue = false) {
    const d = new Date(iso);
    if (d.getMonth() !== 5) return isDue ? 30 : 1; /* Clamp to June for demo */
    return d.getDate();
  }
  function initials(name) {
    return name.split(/\s+/).slice(0, 2).map(p => p[0]).join('').toUpperCase();
  }
  function statusClass(s) {
    if (s === 'Paid') return 'status--success';
    if (s === 'Approved' || s === 'Sent') return 'status--info';
    if (s === 'Pending Approval') return 'status--warning';
    if (s === 'Partially Paid') return 'status--warning';
    if (s === 'Overdue') return 'status--danger';
    if (s === 'Draft') return 'status--inactive';
    return 'status--info';
  }

  function iconReceipt() { return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M9 13h6M9 17h4"/></svg>`; }
  function iconCheck()   { return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`; }
  function iconClock()   { return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>`; }
  function iconAlert()   { return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><path d="M12 9v4M12 17h.01"/></svg>`; }

  /* ── TAB + RENDER ─────────────────────────────────────────────────────── */

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
    renderTable();
    if (state.view !== 'table') setView(state.view);
    renderBulkBar();
    syncNavBadge();
  }

  /* ── BOOTSTRAP ────────────────────────────────────────────────────────── */

  function init() {
    /* URL state */
    const params = new URLSearchParams(location.search);
    state.tab = params.get('tab') || 'all';
    const openId = params.get('id');

    renderFiltersOptions();
    setTab(state.tab, false);

    /* Tab clicks */
    document.querySelectorAll('.md-tab').forEach(t => t.addEventListener('click', () => setTab(t.dataset.tab)));

    /* Search */
    document.getElementById('global-search').addEventListener('input', e => { state.q = e.target.value.trim(); renderTable(); });

    /* Period (visual only) */
    const periods = ['April 2026', 'May 2026', 'June 2026', 'July 2026'];
    let pIdx = 2;
    const upd = () => { document.getElementById('period-label').textContent = periods[pIdx]; };
    document.getElementById('period-prev').addEventListener('click', () => { if (pIdx > 0) { pIdx--; upd(); } });
    document.getElementById('period-next').addEventListener('click', () => { if (pIdx < periods.length - 1) { pIdx++; upd(); } });

    /* Currency toggle (visual demo) */
    document.querySelectorAll('.currency-toggle__btn').forEach(b => {
      b.addEventListener('click', () => {
        document.querySelectorAll('.currency-toggle__btn').forEach(x => x.classList.remove('is-active'));
        b.classList.add('is-active');
        state.currency = b.dataset.currency;
        renderTable();
      });
    });

    /* Filters */
    document.getElementById('filter-client').addEventListener('change', e => { state.clientId = e.target.value; renderTable(); });
    document.getElementById('filter-tax').addEventListener('change', e => { state.taxType = e.target.value; renderTable(); });
    document.getElementById('sort-by').addEventListener('change', e => { state.sort = e.target.value; renderTable(); });

    /* View toggle */
    document.querySelectorAll('[data-view]').forEach(b => b.addEventListener('click', () => setView(b.dataset.view)));

    /* Select all */
    document.getElementById('select-all').addEventListener('change', e => {
      const rows = applyFilters();
      if (e.target.checked) rows.forEach(r => state.selected.add(r.id)); else state.selected.clear();
      renderTable();
      renderBulkBar();
    });

    /* Topbar buttons */
    document.getElementById('btn-export').addEventListener('click', startExportFlow);

    /* Drawer */
    document.getElementById('drawer-close').addEventListener('click', closeDrawer);
    document.getElementById('drawer-backdrop').addEventListener('click', closeDrawer);
    document.getElementById('drawer-pdf').addEventListener('click', () => {
      const id = document.getElementById('drawer-title').textContent;
      triggerPdf(id);
    });

    /* Modal */
    document.getElementById('modal-close').addEventListener('click', closeModal);
    document.getElementById('modal-cancel').addEventListener('click', closeModal);
    document.getElementById('modal-backdrop').addEventListener('click', closeModal);
    document.getElementById('modal-confirm').addEventListener('click', () => { if (modalCb.onConfirm) modalCb.onConfirm(); });

    /* Bulk bar */
    document.getElementById('bulk-deselect').addEventListener('click', () => { state.selected.clear(); renderTable(); renderBulkBar(); });
    document.getElementById('bulk-close').addEventListener('click', () => { state.selected.clear(); renderTable(); renderBulkBar(); });
    document.getElementById('bulk-approve').addEventListener('click', () => startApproveFlow(Array.from(state.selected)));
    document.getElementById('bulk-send').addEventListener('click', () => startSendFlow(Array.from(state.selected)));
    document.getElementById('bulk-export').addEventListener('click', startExportFlow);

    /* Clear filters (element removed with empty state — guard) */
    document.getElementById('btn-clear-filters')?.addEventListener('click', () => {
      state.q = ''; state.clientId = 'all'; state.taxType = 'all';
      document.getElementById('global-search').value = '';
      document.getElementById('filter-client').value = 'all';
      document.getElementById('filter-tax').value = 'all';
      renderTable();
    });

    /* Escape */
    document.addEventListener('keydown', e => {
      if (e.key !== 'Escape') return;
      if (document.getElementById('modal').classList.contains('is-open')) closeModal();
      else if (document.getElementById('drawer').classList.contains('is-open')) closeDrawer();
    });

    /* Popstate */
    window.addEventListener('popstate', () => {
      const p = new URLSearchParams(location.search);
      setTab(p.get('tab') || 'all', false);
    });

    /* Open drawer if ?id= */
    if (openId) setTimeout(() => openDrawer(openId), 200);

    /* Page in */
    setTimeout(() => {
      document.body.classList.remove('is-loading');
      document.body.classList.add('is-loaded');
    }, 100);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
