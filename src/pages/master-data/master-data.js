/* ============================================================================
 * master-data.js — Master Data Management
 * Vanilla JS. Four entity tabs (companies / clients / consultants / assignments),
 * shared side drawer, multi-step Add modal, URL state via History API.
 * ========================================================================== */

(() => {
  'use strict';

  /* ── 1. DATASETS ────────────────────────────────────────────────────────── */

  const COMPANIES = [
    { id: 1, name: 'INFO Services Pvt Ltd',  type: 'Pvt Ltd', gstin: '29AABCI1234A1Z5', pan: 'AABCI1234A', cin: 'U72900KA2015PTC082', address: 'Bengaluru, Karnataka',  clients: 6, invoiced: 24000000, status: 'Active',   bank: { name: 'HDFC Bank',  account: '50100123456789', ifsc: 'HDFC0000123', branch: 'Koramangala' }, signatory: 'Rajesh Iyer · CFO',         prefix: 'INV-INF',  currency: 'INR' },
    { id: 2, name: 'INFO Tech Solutions',    type: 'Pvt Ltd', gstin: '27AABCI5678B1Z3', pan: 'AABCI5678B', cin: 'U72900MH2018PTC091', address: 'Mumbai, Maharashtra',  clients: 5, invoiced: 12000000, status: 'Active',   bank: { name: 'ICICI Bank', account: '00112233445566', ifsc: 'ICIC0001122', branch: 'Andheri East' }, signatory: 'Priya Kapoor · MD',         prefix: 'INV-ITS',  currency: 'INR' },
    { id: 3, name: 'INFO Global Services',   type: 'Pvt Ltd', gstin: '07AABCI9012C1Z1', pan: 'AABCI9012C', cin: 'U72900DL2020PTC103', address: 'New Delhi',            clients: 4, invoiced: 8600000,  status: 'Active',   bank: { name: 'Axis Bank',  account: '91110011223344', ifsc: 'UTIB0000456', branch: 'Connaught Place' }, signatory: 'Amit Sharma · Director',  prefix: 'INV-IGS',  currency: 'USD' },
    { id: 4, name: 'INFO Consulting LLP',    type: 'LLP',     gstin: '33AABCI3456D1Z9', pan: 'AABCI3456D', cin: 'U72900TN2022PTC115', address: 'Chennai, Tamil Nadu',  clients: 3, invoiced: 4000000,  status: 'Inactive', bank: { name: 'SBI',        account: '20140123456789', ifsc: 'SBIN0008765', branch: 'Anna Salai' },     signatory: 'Lakshmi Iyer · Partner',     prefix: 'INV-ICN',  currency: 'INR' },
  ];

  const CLIENTS = [
    { id: 1, name: 'Accenture India Pvt Ltd', companyId: 1, location: 'Mumbai, Maharashtra', gstin: '27AAACC1234A1Z5', pan: 'AAACC1234A', taxType: 'IGST 18%',  sez: false, terms: 30, outstanding: 480000, status: 'Active',   primary: 'Rajiv Sharma · rajiv.sharma@accenture.com', currency: 'INR', invoices: 28, billed: 12400000 },
    { id: 2, name: 'TCS Limited',             companyId: 1, location: 'Bengaluru, Karnataka', gstin: '29AAACC5678B1Z3', pan: 'AAACC5678B', taxType: 'CGST+SGST', sez: false, terms: 45, outstanding: 240000, status: 'Active',   primary: 'Anand Iyer · anand.iyer@tcs.com',           currency: 'INR', invoices: 22, billed: 9800000 },
    { id: 3, name: 'Infosys BPM Ltd',         companyId: 2, location: 'Pune, Maharashtra',    gstin: '27AABCI9012C1Z2', pan: 'AABCI9012C', taxType: 'SEZ/LUT',   sez: true,  terms: 30, outstanding: 600000, status: 'Active',   primary: 'Sneha Rao · sneha.rao@infosys.com',         currency: 'USD', invoices: 18, billed: 8400000 },
    { id: 4, name: 'Wipro Technologies',      companyId: 2, location: 'Hyderabad, Telangana', gstin: '36AAACW3456D1Z4', pan: 'AAACW3456D', taxType: 'CGST+SGST', sez: false, terms: 60, outstanding: 0,      status: 'Active',   primary: 'Karthik Menon · karthik.menon@wipro.com',   currency: 'INR', invoices: 24, billed: 6200000 },
    { id: 5, name: 'HCL Methods Pvt Ltd',     companyId: 3, location: 'Noida, Uttar Pradesh', gstin: '09AAACH5678E1Z2', pan: 'AAACH5678E', taxType: 'IGST 18%',  sez: false, terms: 30, outstanding: 320000, status: 'Overdue',  primary: 'Vikram Singh · vikram.singh@hcl.com',       currency: 'INR', invoices: 14, billed: 4800000 },
    { id: 6, name: 'Cognizant Technology',    companyId: 3, location: 'Chennai, Tamil Nadu',  gstin: '33AAACC9012F1Z6', pan: 'AAACC9012F', taxType: 'IGST 18%',  sez: false, terms: 45, outstanding: 180000, status: 'Active',   primary: 'Meera Pillai · meera.pillai@cognizant.com', currency: 'INR', invoices: 19, billed: 5600000 },
    { id: 7, name: 'Tech Mahindra Ltd',       companyId: 4, location: 'Bengaluru, Karnataka', gstin: '29AAACT3456G1Z8', pan: 'AAACT3456G', taxType: 'SEZ/LUT',   sez: true,  terms: 30, outstanding: 0,      status: 'Active',   primary: 'Arun Nair · arun.nair@techmahindra.com',    currency: 'USD', invoices: 11, billed: 3200000 },
    { id: 8, name: 'Mphasis Limited',         companyId: 4, location: 'Bengaluru, Karnataka', gstin: '29AAACM7890H1Z0', pan: 'AAACM7890H', taxType: 'CGST+SGST', sez: false, terms: 60, outstanding: 90000,  status: 'Inactive', primary: 'Divya Krishnan · divya.krishnan@mphasis.com',currency: 'INR', invoices: 7,  billed: 1100000 },
  ];

  const CONSULTANTS = [
    { id: 1, code: 'INF-001', name: 'Rahul Verma',    email: 'rahul.verma@info.com',    phone: '+91 98765 43210', billing: 'Hourly', rate: 2500,  currency: 'INR', manager: 'Deepak S',  freq: 'Weekly',  assignments: 2, status: 'Active',   joined: '2023-04-12', skills: ['AWS','Cloud Architecture','Microservices'], hours: 840, revenue: 2100000 },
    { id: 2, code: 'INF-002', name: 'Anita Krishnan', email: 'anita.k@info.com',        phone: '+91 98765 43211', billing: 'Daily',  rate: 12000, currency: 'INR', manager: 'Priya M',   freq: 'Monthly', assignments: 1, status: 'Active',   joined: '2022-09-05', skills: ['Data Engineering','Snowflake','Airflow'],   hours: 188, revenue: 2256000 },
    { id: 3, code: 'INF-003', name: 'Deepak Mehta',   email: 'deepak.m@info.com',       phone: '+91 98765 43212', billing: 'Hourly', rate: 85,    currency: 'USD', manager: 'Rahul S',   freq: 'Weekly',  assignments: 3, status: 'Active',   joined: '2021-11-20', skills: ['LLMs','MLOps','TensorFlow'],                  hours: 720, revenue: 61200 },
    { id: 4, code: 'INF-004', name: 'Sneha Pillai',   email: 'sneha.p@info.com',        phone: '+91 98765 43213', billing: 'Daily',  rate: 15000, currency: 'INR', manager: 'Deepak S',  freq: 'Monthly', assignments: 1, status: 'Active',   joined: '2023-01-15', skills: ['DevOps','Kubernetes','Terraform'],            hours: 92,  revenue: 1380000 },
    { id: 5, code: 'INF-005', name: 'Kiran Nair',     email: 'kiran.n@info.com',        phone: '+91 98765 43214', billing: 'Hourly', rate: 65,    currency: 'USD', manager: 'Priya M',   freq: 'Weekly',  assignments: 2, status: 'Active',   joined: '2022-06-03', skills: ['QA Automation','Selenium','Cypress'],         hours: 624, revenue: 40560 },
    { id: 6, code: 'INF-006', name: 'Meera Joshi',    email: 'meera.j@info.com',        phone: '+91 98765 43215', billing: 'Daily',  rate: 10000, currency: 'INR', manager: 'Rahul S',   freq: 'Monthly', assignments: 0, status: 'Inactive', joined: '2024-02-08', skills: ['BI Dashboards','Power BI','Looker'],          hours: 24,  revenue: 240000 },
  ];

  const ASSIGNMENTS = [
    { id: 1, code: 'AS-2026-001', project: 'Accenture — Cloud Dev',     clientId: 1, consultantId: 1, billing: 'Hourly', rate: 2500,  currency: 'INR', start: '2026-01-01', end: '2026-12-31', doc: 'PO-AC-2026-01',  docType: 'PO',  hsn: '998314', tax: 'IGST 18%',  status: 'Active',         hours: 480, invoiced: 1200000, freq: 'Weekly' },
    { id: 2, code: 'AS-2026-002', project: 'TCS — Data Engineering',    clientId: 2, consultantId: 2, billing: 'Daily',  rate: 12000, currency: 'INR', start: '2026-03-01', end: '2026-08-31', doc: 'PO-TC-2026-03',  docType: 'PO',  hsn: '998313', tax: 'CGST+SGST', status: 'Active',         hours: 96,  invoiced: 1152000, freq: 'Monthly' },
    { id: 3, code: 'AS-2026-003', project: 'Infosys — AI Solutions',    clientId: 3, consultantId: 3, billing: 'Hourly', rate: 85,    currency: 'USD', start: '2026-02-01', end: '2026-07-31', doc: 'SOW-IN-2026-02', docType: 'SOW', hsn: '998315', tax: 'SEZ/LUT',   status: 'Active',         hours: 600, invoiced: 51000,   freq: 'Weekly' },
    { id: 4, code: 'AS-2026-004', project: 'Wipro — QA Automation',     clientId: 4, consultantId: 5, billing: 'Hourly', rate: 65,    currency: 'USD', start: '2026-04-01', end: '2026-06-25', doc: 'PO-WI-2026-04',  docType: 'PO',  hsn: '998312', tax: 'CGST+SGST', status: 'Expiring Soon',  hours: 524, invoiced: 34060,   freq: 'Weekly' },
    { id: 5, code: 'AS-2026-005', project: 'HCL — DevOps Setup',        clientId: 5, consultantId: 4, billing: 'Daily',  rate: 15000, currency: 'INR', start: '2026-01-15', end: '2026-05-15', doc: 'SOW-HM-2026-01', docType: 'SOW', hsn: '998316', tax: 'IGST 18%',  status: 'Expired',        hours: 88,  invoiced: 1320000, freq: 'Monthly' },
    { id: 6, code: 'AS-2026-006', project: 'Cognizant — BI Dashboard',  clientId: 6, consultantId: 1, billing: 'Hourly', rate: 2500,  currency: 'INR', start: '2026-05-01', end: '2026-10-31', doc: 'PO-CG-2026-05',  docType: 'PO',  hsn: '998314', tax: 'IGST 18%',  status: 'Active',         hours: 120, invoiced: 300000,  freq: 'Weekly' },
  ];

  /* Resolve foreign keys for display */
  const lookup = {
    company:    id => COMPANIES.find(c => c.id === id) || {},
    client:     id => CLIENTS.find(c => c.id === id) || {},
    consultant: id => CONSULTANTS.find(c => c.id === id) || {},
  };

  /* ── 2. STATS PER TAB ─────────────────────────────────────────────────── */

  const STATS = {
    companies: () => [
      { label: 'Total Companies', value: COMPANIES.length, tint: 'navy',    icon: iconBuilding() },
      { label: 'Active',          value: COMPANIES.filter(c => c.status === 'Active').length, tint: 'success', icon: iconCheck() },
      { label: 'Total Clients',   value: CLIENTS.length, tint: 'azure',   icon: iconUsers() },
      { label: 'Total Invoiced',  value: '₹' + (COMPANIES.reduce((a, c) => a + c.invoiced, 0) / 1e7).toFixed(2) + ' Cr', tint: 'royal', icon: iconReceipt() },
    ],
    clients: () => [
      { label: 'Total Clients',     value: CLIENTS.length, tint: 'navy',    icon: iconUsers() },
      { label: 'Active',            value: CLIENTS.filter(c => c.status === 'Active').length, tint: 'success', icon: iconCheck() },
      { label: 'SEZ Enabled',       value: CLIENTS.filter(c => c.sez).length, tint: 'azure', icon: iconShield() },
      { label: 'Avg Payment Terms', value: 'Net ' + Math.round(CLIENTS.reduce((a, c) => a + c.terms, 0) / CLIENTS.length), tint: 'royal', icon: iconClock() },
    ],
    consultants: () => [
      { label: 'Total Consultants', value: CONSULTANTS.length, tint: 'navy',    icon: iconUsers() },
      { label: 'Active',            value: CONSULTANTS.filter(c => c.status === 'Active').length, tint: 'success', icon: iconCheck() },
      { label: 'Hourly Billing',    value: CONSULTANTS.filter(c => c.billing === 'Hourly').length, tint: 'azure', icon: iconClock() },
      { label: 'Daily Billing',     value: CONSULTANTS.filter(c => c.billing === 'Daily').length, tint: 'royal', icon: iconCalendar() },
    ],
    assignments: () => [
      { label: 'Total Assignments', value: ASSIGNMENTS.length, tint: 'navy',    icon: iconClipboard() },
      { label: 'Active',            value: ASSIGNMENTS.filter(a => a.status === 'Active').length, tint: 'success', icon: iconCheck() },
      { label: 'Expiring Soon',     value: ASSIGNMENTS.filter(a => a.status === 'Expiring Soon').length, tint: 'warning', icon: iconClock() },
      { label: 'Expired',           value: ASSIGNMENTS.filter(a => a.status === 'Expired').length, tint: 'danger', icon: iconAlert() },
    ],
  };

  /* ── 3. TAB DATA + RENDERERS ──────────────────────────────────────────── */

  const TAB_CONFIG = {
    companies: {
      label: 'Companies',
      placeholder: 'Search companies, GSTIN, PAN…',
      filters: [
        { id: 'status', label: 'Status', options: ['All', 'Active', 'Inactive'] },
      ],
      columns: ['#', 'Company', 'GSTIN', 'PAN', 'CIN', 'Clients', 'Total Invoiced', 'Status', ''],
      rows:    () => COMPANIES,
      filterFn: (item, q, filters) => {
        const matchQ = !q || (item.name + item.gstin + item.pan + item.cin).toLowerCase().includes(q);
        const matchS = !filters.status || filters.status === 'All' || item.status === filters.status;
        return matchQ && matchS;
      },
      renderRow: (item, idx) => `
        <tr data-id="${item.id}">
          <td class="col-num">${idx}</td>
          <td>
            <div class="md-cell">
              <span class="md-cell__primary">${item.name}</span>
              <span class="md-cell__secondary">${item.address} · ${item.type}</span>
            </div>
          </td>
          <td class="mono-cell">${item.gstin}</td>
          <td class="mono-cell">${item.pan}</td>
          <td class="mono-cell">${item.cin}</td>
          <td><span class="md-cell__primary">${item.clients}</span></td>
          <td><span class="md-cell__primary">${fmtCr(item.invoiced)}</span></td>
          <td>${statusPill(item.status)}</td>
          <td class="col-actions">${rowKebab()}</td>
        </tr>`,
    },

    clients: {
      label: 'Clients',
      placeholder: 'Search clients, GSTIN, contact…',
      filters: [
        { id: 'status',  label: 'Status',  options: ['All', 'Active', 'Inactive', 'Overdue'] },
        { id: 'taxType', label: 'Tax Type', options: ['All', 'IGST 18%', 'CGST+SGST', 'SEZ/LUT'] },
        { id: 'company', label: 'Company',  options: ['All', ...COMPANIES.map(c => c.name)] },
      ],
      columns: ['#', 'Client', 'Company', 'GSTIN', 'Tax Type', 'Pay Terms', 'SEZ', 'Outstanding', 'Status', ''],
      rows:    () => CLIENTS,
      filterFn: (item, q, filters) => {
        const matchQ = !q || (item.name + item.location + item.gstin + item.primary).toLowerCase().includes(q);
        const matchS = !filters.status  || filters.status  === 'All' || item.status  === filters.status;
        const matchT = !filters.taxType || filters.taxType === 'All' || item.taxType === filters.taxType;
        const matchC = !filters.company || filters.company === 'All' || lookup.company(item.companyId).name === filters.company;
        return matchQ && matchS && matchT && matchC;
      },
      renderRow: (item, idx) => `
        <tr data-id="${item.id}">
          <td class="col-num">${idx}</td>
          <td>
            <div class="md-cell--with-avatar">
              <span class="avatar avatar--azure">${initials(item.name)}</span>
              <div class="md-cell">
                <span class="md-cell__primary">${item.name}</span>
                <span class="md-cell__secondary">${item.location}</span>
              </div>
            </div>
          </td>
          <td><span class="md-cell__secondary">${lookup.company(item.companyId).name || '—'}</span></td>
          <td class="mono-cell">${item.gstin}</td>
          <td><span class="md-tax-pill">${item.taxType}</span></td>
          <td><span class="mono-cell">Net ${item.terms}</span></td>
          <td>${item.sez ? '<span class="status status--info">Yes</span>' : '<span class="status status--default">No</span>'}</td>
          <td><span class="md-cell__primary">${fmtINR(item.outstanding)}</span></td>
          <td>${statusPill(item.status)}</td>
          <td class="col-actions">${rowKebab()}</td>
        </tr>`,
    },

    consultants: {
      label: 'Consultants',
      placeholder: 'Search consultants, email, code…',
      filters: [
        { id: 'status',  label: 'Status',       options: ['All', 'Active', 'Inactive'] },
        { id: 'billing', label: 'Billing Type', options: ['All', 'Hourly', 'Daily'] },
      ],
      columns: ['#', 'Consultant', 'Email', 'Billing', 'Rate', 'Manager', 'Assignments', 'Status', ''],
      rows:    () => CONSULTANTS,
      filterFn: (item, q, filters) => {
        const matchQ = !q || (item.name + item.email + item.code + item.manager).toLowerCase().includes(q);
        const matchS = !filters.status  || filters.status  === 'All' || item.status  === filters.status;
        const matchB = !filters.billing || filters.billing === 'All' || item.billing === filters.billing;
        return matchQ && matchS && matchB;
      },
      renderRow: (item, idx) => `
        <tr data-id="${item.id}">
          <td class="col-num">${idx}</td>
          <td>
            <div class="md-cell--with-avatar">
              <span class="avatar avatar--royal">${initials(item.name)}</span>
              <div class="md-cell">
                <span class="md-cell__primary">${item.name}</span>
                <span class="md-cell__secondary">${item.code}</span>
              </div>
            </div>
          </td>
          <td><span class="md-cell__secondary">${item.email}</span></td>
          <td><span class="md-tax-pill">${item.billing}</span></td>
          <td><span class="mono-cell">${fmtRate(item.rate, item.currency, item.billing)}</span></td>
          <td><span class="md-cell__secondary">${item.manager}</span></td>
          <td><span class="md-cell__primary">${item.assignments} ${item.assignments === 1 ? 'Assignment' : 'Assignments'}</span></td>
          <td>${statusPill(item.status)}</td>
          <td class="col-actions">${rowKebab()}</td>
        </tr>`,
    },

    assignments: {
      label: 'Assignments',
      placeholder: 'Search assignments, PO, SOW, project…',
      filters: [
        { id: 'status',  label: 'Status',  options: ['All', 'Active', 'Expiring Soon', 'Expired', 'Inactive'] },
        { id: 'client',  label: 'Client',  options: ['All', ...CLIENTS.map(c => c.name)] },
        { id: 'billing', label: 'Billing', options: ['All', 'Hourly', 'Daily'] },
      ],
      columns: ['#', 'Assignment', 'Client', 'Consultant', 'Billing', 'Rate', 'Period', 'Document', 'Status', ''],
      rows:    () => ASSIGNMENTS,
      filterFn: (item, q, filters) => {
        const cName = lookup.client(item.clientId).name || '';
        const conN  = lookup.consultant(item.consultantId).name || '';
        const matchQ = !q || (item.project + item.code + item.doc + cName + conN).toLowerCase().includes(q);
        const matchS = !filters.status  || filters.status  === 'All' || item.status  === filters.status;
        const matchC = !filters.client  || filters.client  === 'All' || cName === filters.client;
        const matchB = !filters.billing || filters.billing === 'All' || item.billing === filters.billing;
        return matchQ && matchS && matchC && matchB;
      },
      renderRow: (item, idx) => {
        const client = lookup.client(item.clientId);
        const cons   = lookup.consultant(item.consultantId);
        return `
          <tr data-id="${item.id}">
            <td class="col-num">${idx}</td>
            <td>
              <div class="md-cell">
                <span class="md-cell__primary">${item.project}</span>
                <span class="md-cell__secondary">${item.code} · HSN ${item.hsn}</span>
              </div>
            </td>
            <td><span class="md-cell__secondary">${client.name || '—'}</span></td>
            <td><span class="md-cell__secondary">${cons.name || '—'}</span></td>
            <td><span class="md-tax-pill">${item.billing}</span></td>
            <td><span class="mono-cell">${fmtRate(item.rate, item.currency, item.billing)}</span></td>
            <td><span class="mono-cell">${fmtMonth(item.start)} – ${fmtMonth(item.end)}</span></td>
            <td><span class="mono-cell">${item.doc}</span></td>
            <td>${statusPill(item.status)}</td>
            <td class="col-actions">${rowKebab()}</td>
          </tr>`;
      },
    },
  };

  /* ── 4. STATE + RENDER ────────────────────────────────────────────────── */

  let state = {
    tab:     'clients',
    q:       '',
    filters: {},
    sort:    null,        // { col: 1, dir: 'asc' | 'desc' }
  };

  function render() {
    renderStats();
    renderFilters();
    renderTable();
    renderBanner();
  }

  function renderStats() {
    const stats = STATS[state.tab]();
    const el = document.getElementById('stats-strip');
    el.innerHTML = stats.map(s => `
      <article class="md-stat">
        <span class="md-stat__icon md-stat__icon--${s.tint}">${s.icon}</span>
        <div>
          <p class="md-stat__label">${s.label}</p>
          <p class="md-stat__value">${s.value}</p>
        </div>
      </article>
    `).join('');
  }

  function renderFilters() {
    const cfg = TAB_CONFIG[state.tab];
    const el = document.getElementById('filter-bar');
    el.innerHTML = `
      <label class="md-filters__search">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
        <input id="local-search" type="search" placeholder="${cfg.placeholder}" value="${state.q}" />
      </label>
      ${cfg.filters.map(f => `
        <select class="md-select" data-filter="${f.id}" aria-label="${f.label}">
          ${f.options.map(o => `<option value="${o}" ${state.filters[f.id] === o ? 'selected' : ''}>${f.label}: ${o}</option>`).join('')}
        </select>
      `).join('')}
      <div class="md-view-toggle" role="group" aria-label="View">
        <button class="is-active" aria-label="Table view">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
        <button aria-label="Card view">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
        </button>
      </div>
    `;

    document.getElementById('local-search').addEventListener('input', e => {
      state.q = e.target.value.trim().toLowerCase();
      renderTable();
    });
    el.querySelectorAll('[data-filter]').forEach(sel => {
      sel.addEventListener('change', e => {
        state.filters[sel.dataset.filter] = e.target.value;
        renderTable();
      });
    });
  }

  function renderTable() {
    const cfg = TAB_CONFIG[state.tab];
    const all = cfg.rows();
    const filtered = all.filter(r => cfg.filterFn(r, state.q, state.filters));

    /* Header */
    document.getElementById('table-head').innerHTML = `
      <tr>${cfg.columns.map((c, i) => `<th${i > 0 && i < cfg.columns.length - 1 ? ' class="is-sortable"' : ''}>${c}</th>`).join('')}</tr>
    `;

    /* Body */
    const body = document.getElementById('table-body');
    const empty = document.getElementById('md-empty');
    if (filtered.length === 0) {
      body.innerHTML = '';
      empty.hidden = false;
    } else {
      empty.hidden = true;
      body.innerHTML = filtered.map((item, i) => cfg.renderRow(item, i + 1)).join('');

      /* Row click → drawer */
      body.querySelectorAll('tr').forEach(tr => {
        tr.addEventListener('click', e => {
          if (e.target.closest('.md-row-actions')) return;
          const id = Number(tr.dataset.id);
          const item = all.find(r => r.id === id);
          if (item) openDrawer(state.tab, item);
        });
      });
    }

    /* Update pagination summary */
    document.getElementById('pagination-info').textContent =
      `Showing 1–${filtered.length} of ${all.length}`;

    /* Update top tab badge */
    document.getElementById(`tab-count-${state.tab}`).textContent = all.length;
  }

  function renderBanner() {
    const slot = document.getElementById('banner-slot');
    if (state.tab === 'assignments') {
      const exp = ASSIGNMENTS.filter(a => a.status === 'Expiring Soon').length;
      if (exp > 0) {
        slot.innerHTML = `
          <div class="md-banner" role="alert">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><path d="M12 9v4M12 17h.01"/></svg>
            <span>${exp} assignment${exp === 1 ? '' : 's'} ${exp === 1 ? 'is' : 'are'} expiring within 30 days. Review and renew.</span>
            <a href="#" class="md-banner__cta">Review Expiring →</a>
          </div>`;
        return;
      }
    }
    slot.innerHTML = '';
  }

  /* ── 5. TAB SWITCHING + URL STATE ──────────────────────────────────────── */

  function setTab(tab, push = true) {
    state.tab = tab;
    state.q = '';
    state.filters = {};
    document.querySelectorAll('.md-tab').forEach(t => {
      const on = t.dataset.tab === tab;
      t.classList.toggle('is-active', on);
      t.setAttribute('aria-selected', String(on));
    });
    if (push) {
      const url = new URL(window.location);
      url.searchParams.set('tab', tab);
      history.pushState({ tab }, '', url);
    }
    render();
  }

  /* ── 6. DRAWER ────────────────────────────────────────────────────────── */

  function openDrawer(tab, item) {
    const drawer = document.getElementById('drawer');
    const backdrop = document.getElementById('drawer-backdrop');
    const title    = document.getElementById('drawer-title');
    const sub      = document.getElementById('drawer-subtitle');
    const status   = document.getElementById('drawer-status');
    const icon     = document.getElementById('drawer-icon');
    const body     = document.getElementById('drawer-body');

    let titleText, subText, statusText, iconHTML, bodyHTML;

    if (tab === 'companies') {
      titleText = item.name;
      subText = `${item.type} · ${item.address}`;
      statusText = item.status;
      iconHTML = `<span>${initials(item.name)}</span>`;
      bodyHTML = renderCompanyDrawer(item);
    } else if (tab === 'clients') {
      titleText = item.name;
      subText = `${item.location} · ${lookup.company(item.companyId).name || ''}`;
      statusText = item.status;
      iconHTML = `<span>${initials(item.name)}</span>`;
      bodyHTML = renderClientDrawer(item);
    } else if (tab === 'consultants') {
      titleText = item.name;
      subText = `${item.code} · ${item.email}`;
      statusText = item.status;
      iconHTML = `<span>${initials(item.name)}</span>`;
      bodyHTML = renderConsultantDrawer(item);
    } else {
      titleText = item.project;
      subText = `${item.code} · ${lookup.client(item.clientId).name || ''}`;
      statusText = item.status;
      iconHTML = `<span>${initials(item.project)}</span>`;
      bodyHTML = renderAssignmentDrawer(item);
    }

    title.textContent = titleText;
    sub.textContent = subText;
    status.className = 'status ' + statusClass(statusText);
    status.textContent = statusText;
    icon.innerHTML = iconHTML;
    body.innerHTML = bodyHTML;

    backdrop.hidden = false;
    drawer.setAttribute('aria-hidden', 'false');
    requestAnimationFrame(() => {
      backdrop.classList.add('is-visible');
      drawer.classList.add('is-open');
    });

    /* Wire mini-chart for consultant drawer */
    if (tab === 'consultants') initConsultantChart();
  }

  function closeDrawer() {
    const drawer = document.getElementById('drawer');
    const backdrop = document.getElementById('drawer-backdrop');
    backdrop.classList.remove('is-visible');
    drawer.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    setTimeout(() => { backdrop.hidden = true; }, 350);
  }

  function renderCompanyDrawer(c) {
    const linkedClients = CLIENTS.filter(cl => cl.companyId === c.id).length;
    const linkedActive = ASSIGNMENTS.filter(a => {
      const cl = lookup.client(a.clientId); return cl.companyId === c.id && a.status === 'Active';
    }).length;
    return `
      <section class="drawer-section">
        <p class="drawer-section__title">Legal Identity</p>
        <div class="drawer-grid">
          <div class="drawer-field"><span class="drawer-field__label">GSTIN</span><span class="drawer-field__value mono">${c.gstin}</span></div>
          <div class="drawer-field"><span class="drawer-field__label">PAN</span><span class="drawer-field__value mono">${c.pan}</span></div>
          <div class="drawer-field"><span class="drawer-field__label">CIN</span><span class="drawer-field__value mono">${c.cin}</span></div>
          <div class="drawer-field"><span class="drawer-field__label">Type</span><span class="drawer-field__value">${c.type}</span></div>
          <div class="drawer-field drawer-field--wide"><span class="drawer-field__label">Registered Address</span><span class="drawer-field__value">${c.address}</span></div>
          <div class="drawer-field drawer-field--wide"><span class="drawer-field__label">Authorized Signatory</span><span class="drawer-field__value">${c.signatory}</span></div>
        </div>
      </section>

      <section class="drawer-section">
        <p class="drawer-section__title">Bank Details</p>
        <div class="drawer-grid">
          <div class="drawer-field"><span class="drawer-field__label">Bank Name</span><span class="drawer-field__value">${c.bank.name}</span></div>
          <div class="drawer-field"><span class="drawer-field__label">Account No</span><span class="drawer-field__value mono">${maskAccount(c.bank.account)}</span></div>
          <div class="drawer-field"><span class="drawer-field__label">IFSC</span><span class="drawer-field__value mono">${c.bank.ifsc}</span></div>
          <div class="drawer-field"><span class="drawer-field__label">Branch</span><span class="drawer-field__value">${c.bank.branch}</span></div>
        </div>
      </section>

      <section class="drawer-section">
        <p class="drawer-section__title">Invoice Configuration</p>
        <div class="drawer-grid">
          <div class="drawer-field"><span class="drawer-field__label">Invoice Prefix</span><span class="drawer-field__value mono">${c.prefix}</span></div>
          <div class="drawer-field"><span class="drawer-field__label">Default Currency</span><span class="drawer-field__value">${c.currency}</span></div>
        </div>
      </section>

      <section class="drawer-section">
        <p class="drawer-section__title">Linked Entities</p>
        <div class="drawer-linked">
          <div class="drawer-linked__card"><p class="drawer-linked__label">Clients →</p><p class="drawer-linked__value">${linkedClients}</p></div>
          <div class="drawer-linked__card"><p class="drawer-linked__label">Active Assignments →</p><p class="drawer-linked__value">${linkedActive}</p></div>
          <div class="drawer-linked__card"><p class="drawer-linked__label">Total Invoices →</p><p class="drawer-linked__value">148</p></div>
          <div class="drawer-linked__card"><p class="drawer-linked__label">Total Revenue</p><p class="drawer-linked__value">${fmtCr(c.invoiced)}</p></div>
        </div>
      </section>

      <div class="drawer-actions">
        <button class="btn btn--primary">Edit Company</button>
        <button class="btn btn--ghost">Add Client</button>
        <button class="btn btn--ghost">View Invoices</button>
        <button class="btn btn--ghost">${c.status === 'Active' ? 'Deactivate' : 'Activate'}</button>
      </div>`;
  }

  function renderClientDrawer(c) {
    const activeAssigns = ASSIGNMENTS.filter(a => a.clientId === c.id && a.status === 'Active').length;
    const recentInvoices = [
      { num: 'INV-2401', period: 'Jun 2026', amount: 480000, status: 'Pending' },
      { num: 'INV-2392', period: 'May 2026', amount: 540000, status: 'Paid'    },
      { num: 'INV-2381', period: 'Apr 2026', amount: 520000, status: 'Paid'    },
    ];
    return `
      <section class="drawer-section">
        <p class="drawer-section__title">Billing &amp; Address</p>
        <div class="drawer-grid">
          <div class="drawer-field drawer-field--wide"><span class="drawer-field__label">Billing Address</span><span class="drawer-field__value">${c.location}</span></div>
          <div class="drawer-field"><span class="drawer-field__label">GSTIN</span><span class="drawer-field__value mono">${c.gstin}</span></div>
          <div class="drawer-field"><span class="drawer-field__label">PAN</span><span class="drawer-field__value mono">${c.pan}</span></div>
          <div class="drawer-field drawer-field--wide"><span class="drawer-field__label">Primary Contact</span><span class="drawer-field__value">${c.primary}</span></div>
        </div>
      </section>

      <section class="drawer-section">
        <p class="drawer-section__title">Tax Configuration</p>
        <div class="drawer-grid">
          <div class="drawer-field"><span class="drawer-field__label">Tax Type</span><span class="drawer-field__value">${c.taxType}</span></div>
          <div class="drawer-field"><span class="drawer-field__label">SEZ Enabled</span><span class="drawer-field__value">${c.sez ? 'Yes' : 'No'}</span></div>
        </div>
      </section>

      <section class="drawer-section">
        <p class="drawer-section__title">Payment Configuration</p>
        <div class="drawer-grid">
          <div class="drawer-field"><span class="drawer-field__label">Payment Terms</span><span class="drawer-field__value mono">Net ${c.terms}</span></div>
          <div class="drawer-field"><span class="drawer-field__label">Currency</span><span class="drawer-field__value">${c.currency}</span></div>
        </div>
      </section>

      <section class="drawer-section">
        <p class="drawer-section__title">Linked Data</p>
        <div class="drawer-linked">
          <div class="drawer-linked__card"><p class="drawer-linked__label">Active Assignments →</p><p class="drawer-linked__value">${activeAssigns}</p></div>
          <div class="drawer-linked__card"><p class="drawer-linked__label">Total Invoices →</p><p class="drawer-linked__value">${c.invoices}</p></div>
          <div class="drawer-linked__card"><p class="drawer-linked__label">Total Billed</p><p class="drawer-linked__value">${fmtCr(c.billed)}</p></div>
          <div class="drawer-linked__card"><p class="drawer-linked__label">Outstanding</p><p class="drawer-linked__value">${fmtINR(c.outstanding)}</p></div>
        </div>
      </section>

      <section class="drawer-section">
        <p class="drawer-section__title">Recent Invoices</p>
        <table class="drawer-mini-table">
          <thead><tr><th>Invoice #</th><th>Period</th><th>Amount</th><th>Status</th></tr></thead>
          <tbody>
            ${recentInvoices.map(r => `
              <tr>
                <td class="mono-cell">${r.num}</td>
                <td>${r.period}</td>
                <td class="mono-cell">${fmtINR(r.amount)}</td>
                <td>${statusPill(r.status)}</td>
              </tr>`).join('')}
          </tbody>
        </table>
      </section>

      <div class="drawer-actions">
        <button class="btn btn--primary">Edit Client</button>
        <button class="btn btn--ghost">New Assignment</button>
        <button class="btn btn--ghost">Generate Invoice</button>
      </div>`;
  }

  function renderConsultantDrawer(c) {
    return `
      <section class="drawer-section">
        <p class="drawer-section__title">Personal &amp; Contact</p>
        <div class="drawer-grid">
          <div class="drawer-field"><span class="drawer-field__label">Employee Code</span><span class="drawer-field__value mono">${c.code}</span></div>
          <div class="drawer-field"><span class="drawer-field__label">Phone</span><span class="drawer-field__value">${c.phone}</span></div>
          <div class="drawer-field"><span class="drawer-field__label">Email</span><span class="drawer-field__value">${c.email}</span></div>
          <div class="drawer-field"><span class="drawer-field__label">Joining Date</span><span class="drawer-field__value">${fmtDate(c.joined)}</span></div>
          <div class="drawer-field drawer-field--wide"><span class="drawer-field__label">Skills</span><span class="drawer-field__value">${c.skills.map(s => `<span class="md-tax-pill" style="margin-right:6px;margin-top:4px">${s}</span>`).join('')}</span></div>
        </div>
      </section>

      <section class="drawer-section">
        <p class="drawer-section__title">Billing Configuration</p>
        <div class="drawer-grid">
          <div class="drawer-field"><span class="drawer-field__label">Type</span><span class="drawer-field__value">${c.billing}</span></div>
          <div class="drawer-field"><span class="drawer-field__label">Rate</span><span class="drawer-field__value mono">${fmtRate(c.rate, c.currency, c.billing)}</span></div>
          <div class="drawer-field"><span class="drawer-field__label">Currency</span><span class="drawer-field__value">${c.currency}</span></div>
          <div class="drawer-field"><span class="drawer-field__label">Timesheet</span><span class="drawer-field__value">${c.freq}</span></div>
        </div>
      </section>

      <section class="drawer-section">
        <p class="drawer-section__title">Reporting</p>
        <div class="drawer-grid">
          <div class="drawer-field drawer-field--wide"><span class="drawer-field__label">Reporting Manager</span><span class="drawer-field__value">${c.manager}</span></div>
        </div>
      </section>

      <section class="drawer-section">
        <p class="drawer-section__title">Assignment Summary</p>
        <div class="drawer-linked">
          <div class="drawer-linked__card"><p class="drawer-linked__label">Active Assignments →</p><p class="drawer-linked__value">${c.assignments}</p></div>
          <div class="drawer-linked__card"><p class="drawer-linked__label">Hours Billed YTD</p><p class="drawer-linked__value">${c.hours}</p></div>
          <div class="drawer-linked__card"><p class="drawer-linked__label">Revenue Generated</p><p class="drawer-linked__value">${c.currency === 'INR' ? fmtCr(c.revenue) : '$' + (c.revenue / 1000).toFixed(1) + 'K'}</p></div>
          <div class="drawer-linked__card"><p class="drawer-linked__label">Timesheet</p><p class="drawer-linked__value" style="font-size:13px">${c.freq}</p></div>
        </div>
      </section>

      <section class="drawer-section">
        <p class="drawer-section__title">Timesheet — Last 4 weeks</p>
        <div style="height:140px;background:var(--bg-subtle);border-radius:var(--radius-sm);padding:8px;">
          <canvas id="consultant-chart" aria-label="Hours per week"></canvas>
        </div>
      </section>

      <div class="drawer-actions">
        <button class="btn btn--primary">Edit Consultant</button>
        <button class="btn btn--ghost">View Timesheets</button>
        <button class="btn btn--ghost">Assign to Project</button>
      </div>`;
  }

  function renderAssignmentDrawer(a) {
    const client = lookup.client(a.clientId);
    const cons   = lookup.consultant(a.consultantId);
    const company = lookup.company(client.companyId || 0);
    const daysLeft = Math.ceil((new Date(a.end) - new Date()) / (1000 * 60 * 60 * 24));
    const totalDays = Math.ceil((new Date(a.end) - new Date(a.start)) / (1000 * 60 * 60 * 24));
    const pct = Math.max(0, Math.min(100, (daysLeft / totalDays) * 100));
    const barColor = daysLeft < 0 ? 'var(--danger)' : daysLeft < 30 ? 'var(--warning)' : 'var(--success)';
    return `
      <section class="drawer-section">
        <p class="drawer-section__title">Assignment Overview</p>
        <div class="drawer-grid">
          <div class="drawer-field"><span class="drawer-field__label">Client</span><span class="drawer-field__value">${client.name || '—'}</span></div>
          <div class="drawer-field"><span class="drawer-field__label">Consultant</span><span class="drawer-field__value">${cons.name || '—'}</span></div>
          <div class="drawer-field"><span class="drawer-field__label">Company</span><span class="drawer-field__value">${company.name || '—'}</span></div>
          <div class="drawer-field"><span class="drawer-field__label">HSN/SAC</span><span class="drawer-field__value mono">${a.hsn}</span></div>
          <div class="drawer-field drawer-field--wide"><span class="drawer-field__label">Project Name</span><span class="drawer-field__value">${a.project}</span></div>
        </div>
      </section>

      <section class="drawer-section">
        <p class="drawer-section__title">Billing Configuration</p>
        <div class="drawer-grid">
          <div class="drawer-field"><span class="drawer-field__label">Billing Type</span><span class="drawer-field__value">${a.billing}</span></div>
          <div class="drawer-field"><span class="drawer-field__label">Rate</span><span class="drawer-field__value mono">${fmtRate(a.rate, a.currency, a.billing)}</span></div>
          <div class="drawer-field"><span class="drawer-field__label">Currency</span><span class="drawer-field__value">${a.currency}</span></div>
          <div class="drawer-field"><span class="drawer-field__label">Tax Treatment</span><span class="drawer-field__value"><span class="md-tax-pill">${a.tax}</span></span></div>
          <div class="drawer-field"><span class="drawer-field__label">Timesheet Frequency</span><span class="drawer-field__value">${a.freq}</span></div>
        </div>
      </section>

      <section class="drawer-section">
        <p class="drawer-section__title">Contract Details</p>
        <div class="drawer-grid">
          <div class="drawer-field"><span class="drawer-field__label">${a.docType} Number</span><span class="drawer-field__value mono">${a.doc}</span></div>
          <div class="drawer-field"><span class="drawer-field__label">Start</span><span class="drawer-field__value mono">${fmtDate(a.start)}</span></div>
          <div class="drawer-field"><span class="drawer-field__label">End</span><span class="drawer-field__value mono">${fmtDate(a.end)}</span></div>
          <div class="drawer-field"><span class="drawer-field__label">Days Remaining</span><span class="drawer-field__value mono">${daysLeft < 0 ? 'Expired' : daysLeft + ' days'}</span></div>
        </div>
        <div style="height:6px;background:var(--bg-muted);border-radius:var(--radius-full);overflow:hidden">
          <div style="height:100%;width:${pct}%;background:${barColor};border-radius:var(--radius-full);transition:width 350ms"></div>
        </div>
        <div style="display:flex;gap:8px;margin-top:10px">
          <button class="btn btn--ghost" style="flex:1">View ${a.docType}</button>
          <button class="btn btn--ghost" style="flex:1">Upload Document</button>
        </div>
      </section>

      <section class="drawer-section">
        <p class="drawer-section__title">Financial Summary</p>
        <div class="drawer-linked">
          <div class="drawer-linked__card"><p class="drawer-linked__label">${a.billing === 'Hourly' ? 'Hours' : 'Days'} Billed</p><p class="drawer-linked__value">${a.hours}</p></div>
          <div class="drawer-linked__card"><p class="drawer-linked__label">Total Invoiced</p><p class="drawer-linked__value">${a.currency === 'INR' ? fmtCr(a.invoiced) : '$' + (a.invoiced / 1000).toFixed(1) + 'K'}</p></div>
        </div>
      </section>

      <div class="drawer-actions">
        <button class="btn btn--primary">Edit Assignment</button>
        <button class="btn btn--ghost">Generate Invoice</button>
        <button class="btn btn--ghost">Extend</button>
      </div>`;
  }

  function initConsultantChart() {
    const el = document.getElementById('consultant-chart');
    if (!el || typeof Chart === 'undefined') return;
    new Chart(el.getContext('2d'), {
      type: 'bar',
      data: {
        labels: ['W1', 'W2', 'W3', 'W4'],
        datasets: [
          { label: 'Submitted', data: [42, 38, 45, 40], backgroundColor: '#3b82c4', borderRadius: 4, barThickness: 14 },
          { label: 'Approved',  data: [42, 38, 40, 38], backgroundColor: '#10b981', borderRadius: 4, barThickness: 14 },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 10 } } },
          y: { display: false },
        },
      },
    });
  }

  /* ── 7. MODAL — Add / Edit ─────────────────────────────────────────────── */

  let modalState = { entity: null, step: 0, totalSteps: 1, values: {} };

  const MODAL_STEPS = {
    companies: [
      { title: 'Legal Identity',  fields: [
        { name: 'name',  label: 'Company Name', type: 'text', req: true },
        { name: 'type',  label: 'Legal Entity Type', type: 'select', options: ['Pvt Ltd', 'LLP', 'Public Ltd', 'Sole Prop'], req: true },
        { name: 'gstin', label: 'GSTIN', type: 'text', req: true, validate: 'gstin' },
        { name: 'pan',   label: 'PAN', type: 'text', req: true, validate: 'pan' },
        { name: 'cin',   label: 'CIN', type: 'text', req: true, validate: 'cin' },
        { name: 'address', label: 'Registered Address', type: 'text', wide: true, req: true },
      ]},
      { title: 'Bank & Signatory', fields: [
        { name: 'bank',    label: 'Bank Name', type: 'text', req: true },
        { name: 'account', label: 'Account Number', type: 'text', req: true },
        { name: 'ifsc',    label: 'IFSC Code', type: 'text', req: true },
        { name: 'branch',  label: 'Branch', type: 'text' },
        { name: 'signatory', label: 'Authorized Signatory', type: 'text', wide: true, req: true },
        { name: 'sig_email', label: 'Signatory Email', type: 'email', req: true, validate: 'email' },
      ]},
      { title: 'Invoice Configuration', fields: [
        { name: 'prefix', label: 'Invoice Prefix', type: 'text', req: true, hint: 'e.g. INV-INF' },
        { name: 'start_num', label: 'Starting Number', type: 'number', hint: 'e.g. 1001' },
        { name: 'currency', label: 'Default Currency', type: 'select', options: ['INR', 'USD'], req: true },
        { name: 'template', label: 'Invoice Template', type: 'select', options: ['Standard', 'Detailed', 'Minimal'] },
        { name: 'logo', label: 'Upload Company Logo', type: 'upload', wide: true },
      ]},
    ],
    clients: [
      { title: 'Client Details', fields: [
        { name: 'name', label: 'Client Name', type: 'text', req: true },
        { name: 'company', label: 'Parent Company', type: 'select', options: COMPANIES.map(c => c.name), req: true },
        { name: 'address', label: 'Billing Address', type: 'text', wide: true, req: true },
        { name: 'contact', label: 'Contact Person', type: 'text', req: true },
        { name: 'email',   label: 'Email', type: 'email', req: true, validate: 'email' },
        { name: 'phone',   label: 'Phone', type: 'tel' },
      ]},
      { title: 'Tax & GST Configuration', fields: [
        { name: 'gstin', label: 'GSTIN', type: 'text', req: true, validate: 'gstin' },
        { name: 'pan',   label: 'PAN', type: 'text', validate: 'pan' },
        { name: 'taxType', label: 'Tax Type', type: 'select', options: ['IGST 18%', 'CGST+SGST', 'SEZ/LUT'], req: true },
        { name: 'sez', label: 'SEZ Enabled', type: 'select', options: ['No', 'Yes'] },
        { name: 'lutNum', label: 'LUT Number (if SEZ/LUT)', type: 'text' },
        { name: 'lutExp', label: 'LUT Expiry', type: 'date' },
      ]},
      { title: 'Payment Configuration', fields: [
        { name: 'terms', label: 'Payment Terms', type: 'select', options: ['Net 30', 'Net 45', 'Net 60', 'Custom'], req: true },
        { name: 'currency', label: 'Currency', type: 'select', options: ['INR', 'USD', 'Both'], req: true },
        { name: 'template', label: 'Invoice Template', type: 'select', options: ['Standard', 'Detailed'] },
        { name: 'notes', label: 'Notes', type: 'text' },
      ]},
    ],
    consultants: [
      { title: 'Consultant Details', fields: [
        { name: 'code', label: 'Employee Code', type: 'text', req: true, hint: 'e.g. INF-007' },
        { name: 'first', label: 'First Name', type: 'text', req: true },
        { name: 'last',  label: 'Last Name', type: 'text', req: true },
        { name: 'email', label: 'Email', type: 'email', req: true, validate: 'email' },
        { name: 'phone', label: 'Phone', type: 'tel' },
        { name: 'billing', label: 'Billing Type', type: 'select', options: ['Hourly', 'Daily'], req: true },
        { name: 'rate', label: 'Rate', type: 'number', req: true },
        { name: 'currency', label: 'Currency', type: 'select', options: ['INR', 'USD'], req: true },
        { name: 'freq', label: 'Timesheet Frequency', type: 'select', options: ['Weekly', 'Monthly'], req: true },
        { name: 'manager', label: 'Reporting Manager', type: 'text', req: true },
        { name: 'joined', label: 'Joining Date', type: 'date', req: true },
        { name: 'skills', label: 'Skills (comma separated)', type: 'text', wide: true },
      ]},
    ],
    assignments: [
      { title: 'Link Entities', fields: [
        { name: 'company',  label: 'Company', type: 'select', options: COMPANIES.map(c => c.name), req: true },
        { name: 'client',   label: 'Client',  type: 'select', options: CLIENTS.map(c => c.name), req: true },
        { name: 'consultant', label: 'Consultant', type: 'select', options: CONSULTANTS.map(c => c.name), req: true },
        { name: 'project',  label: 'Project Name', type: 'text', wide: true, req: true },
      ]},
      { title: 'Contract Details', fields: [
        { name: 'docType',  label: 'Document Type', type: 'select', options: ['PO', 'SOW'], req: true },
        { name: 'docNum',   label: 'Document Number', type: 'text', req: true },
        { name: 'hsn',      label: 'HSN / SAC Code', type: 'text', req: true },
        { name: 'tax',      label: 'Tax Treatment', type: 'select', options: ['IGST 18%', 'CGST+SGST', 'SEZ/LUT'], req: true },
        { name: 'start',    label: 'Start Date', type: 'date', req: true },
        { name: 'end',      label: 'End Date', type: 'date', req: true },
        { name: 'docUpload', label: 'Upload Document', type: 'upload', wide: true },
      ]},
      { title: 'Billing Configuration', tip: 'Based on client location, IGST 18% is recommended.', fields: [
        { name: 'billing', label: 'Billing Type', type: 'select', options: ['Hourly', 'Daily'], req: true },
        { name: 'rate',    label: 'Rate', type: 'number', req: true },
        { name: 'currency', label: 'Currency', type: 'select', options: ['INR', 'USD'], req: true },
        { name: 'freq',    label: 'Timesheet Frequency', type: 'select', options: ['Weekly', 'Monthly'], req: true },
      ]},
      { title: 'Review & Confirm', review: true, fields: [] },
    ],
  };

  function openAddModal(entity) {
    modalState = { entity, step: 0, totalSteps: MODAL_STEPS[entity].length, values: {} };
    document.getElementById('modal-title').textContent =
      `Add ${entity.charAt(0).toUpperCase() + entity.slice(1, -1)}`;
    renderModalStep();
    document.getElementById('modal-backdrop').hidden = false;
    document.getElementById('modal').setAttribute('aria-hidden', 'false');
    requestAnimationFrame(() => {
      document.getElementById('modal-backdrop').classList.add('is-visible');
      document.getElementById('modal').classList.add('is-open');
    });
  }

  function renderModalStep() {
    const steps = MODAL_STEPS[modalState.entity];
    const step  = steps[modalState.step];
    const total = steps.length;

    document.getElementById('modal-subtitle').textContent =
      total === 1 ? step.title : `Step ${modalState.step + 1} of ${total} · ${step.title}`;

    /* Stepper dots */
    const stepper = document.getElementById('modal-stepper');
    stepper.innerHTML = steps.map((_, i) => `
      <span class="modal__step-dot ${i < modalState.step ? 'is-done' : ''} ${i === modalState.step ? 'is-active' : ''}"></span>
    `).join('');
    stepper.style.display = total === 1 ? 'none' : 'flex';

    /* Body */
    const body = document.getElementById('modal-body');
    if (step.review) {
      body.innerHTML = `
        <p style="font-size:13px;color:var(--text-tertiary);margin-bottom:8px">Please review your details before confirming.</p>
        ${steps.slice(0, -1).map(s => `
          <section class="drawer-section">
            <p class="drawer-section__title">${s.title}</p>
            <div class="drawer-grid">
              ${s.fields.filter(f => modalState.values[f.name]).map(f => `
                <div class="drawer-field ${f.wide ? 'drawer-field--wide' : ''}">
                  <span class="drawer-field__label">${f.label}</span>
                  <span class="drawer-field__value">${modalState.values[f.name] || '—'}</span>
                </div>
              `).join('')}
            </div>
          </section>
        `).join('')}
      `;
    } else {
      body.innerHTML = (step.tip ? `
        <div class="form-tip">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
          <span>${step.tip}</span>
          <span class="form-tip__action">Apply →</span>
        </div>
      ` : '') + `
        <div class="form-grid">
          ${step.fields.map(f => renderField(f)).join('')}
        </div>
      `;

      /* Wire input change */
      body.querySelectorAll('[data-name]').forEach(input => {
        input.addEventListener('input', () => {
          modalState.values[input.dataset.name] = input.value;
        });
        input.addEventListener('blur', () => validateField(input));
      });
    }

    /* Footer buttons */
    const back = document.getElementById('modal-back');
    const next = document.getElementById('modal-next');
    const save = document.getElementById('modal-save');
    back.hidden = modalState.step === 0;
    if (modalState.step === total - 1) {
      next.hidden = true;
      save.hidden = false;
      save.textContent = step.review ? 'Confirm & Create' : 'Save';
    } else {
      next.hidden = false;
      save.hidden = true;
    }
  }

  function renderField(f) {
    const id = `f-${f.name}`;
    const cls = `form-field ${f.wide ? 'form-field--wide' : ''}`;
    const req = f.req ? '<span class="req">*</span>' : '';
    const val = modalState.values[f.name] || '';
    if (f.type === 'select') {
      return `
        <div class="${cls}">
          <label for="${id}">${f.label} ${req}</label>
          <select id="${id}" data-name="${f.name}" data-validate="${f.validate || ''}">
            <option value="" disabled ${!val ? 'selected' : ''}>Select…</option>
            ${f.options.map(o => `<option ${val === o ? 'selected' : ''}>${o}</option>`).join('')}
          </select>
          <span class="form-field__error"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg> <span class="msg">Required</span></span>
          ${f.hint ? `<span class="form-field__hint">${f.hint}</span>` : ''}
        </div>`;
    }
    if (f.type === 'upload') {
      return `
        <div class="${cls}">
          <label>${f.label} ${req}</label>
          <div class="upload-zone" tabindex="0" data-upload>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
            <div>
              <p class="upload-zone__title">Drop file here or click to upload</p>
              <p class="upload-zone__sub">PDF · max 5 MB</p>
            </div>
          </div>
        </div>`;
    }
    return `
      <div class="${cls}">
        <label for="${id}">${f.label} ${req}</label>
        <input id="${id}" data-name="${f.name}" data-validate="${f.validate || ''}" type="${f.type}" value="${val}" placeholder="${f.hint || ''}" />
        <span class="form-field__error"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg> <span class="msg">Required</span></span>
        ${f.hint ? `<span class="form-field__hint">${f.hint}</span>` : ''}
      </div>`;
  }

  const VALIDATORS = {
    gstin: v => /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(v || '') || 'Invalid GSTIN format',
    pan:   v => /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(v || '') || 'Invalid PAN (e.g. AAAAA9999A)',
    cin:   v => /^[UL]\d{5}[A-Z]{2}\d{4}[A-Z]{3}\d{6}$/.test(v || '') || 'Invalid CIN format',
    email: v => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v || '') || 'Invalid email',
  };

  function validateField(input) {
    const wrap = input.closest('.form-field');
    const validator = VALIDATORS[input.dataset.validate];
    const val = input.value.trim();
    if (!val) return;
    if (validator) {
      const result = validator(val.toUpperCase());
      if (result !== true) {
        wrap.classList.add('is-error');
        wrap.querySelector('.msg').textContent = result;
        return false;
      }
    }
    wrap.classList.remove('is-error');
    return true;
  }

  function validateStep() {
    const inputs = document.querySelectorAll('.modal__body [data-name]');
    let ok = true;
    inputs.forEach(input => {
      if (input.required || input.closest('.form-field').querySelector('.req')) {
        if (!input.value.trim()) {
          input.closest('.form-field').classList.add('is-error');
          input.closest('.form-field').querySelector('.msg').textContent = 'Required';
          ok = false;
          return;
        }
      }
      if (input.value.trim() && !validateField(input)) ok = false;
    });
    return ok;
  }

  function closeModal() {
    document.getElementById('modal-backdrop').classList.remove('is-visible');
    document.getElementById('modal').classList.remove('is-open');
    document.getElementById('modal').setAttribute('aria-hidden', 'true');
    setTimeout(() => {
      document.getElementById('modal-backdrop').hidden = true;
    }, 250);
  }

  /* ── 8. HELPERS ────────────────────────────────────────────────────────── */

  const INR_PER_USD = 83.5;
  function fmtINR(v) { return '₹' + new Intl.NumberFormat('en-IN').format(v); }
  function fmtCr(v)  { return '₹' + (v / 1e7).toFixed(2) + ' Cr'; }
  function fmtRate(rate, currency, billing) {
    const sym = currency === 'INR' ? '₹' : '$';
    const suffix = billing === 'Hourly' ? '/hr' : '/day';
    return `${sym}${new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : 'en-US').format(rate)}${suffix}`;
  }
  function fmtDate(iso) {
    const d = new Date(iso);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }
  function fmtMonth(iso) {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  }
  function maskAccount(s) { return s.replace(/.(?=.{4})/g, '•'); }
  function initials(name) {
    return name.split(/\s+/).slice(0, 2).map(p => p[0]).join('').toUpperCase();
  }

  function statusPill(s) {
    return `<span class="status ${statusClass(s)}">${s}</span>`;
  }
  function statusClass(s) {
    if (s === 'Active' || s === 'Paid') return 'status--success';
    if (s === 'Expiring Soon')          return 'status--expiring';
    if (s === 'Expired' || s === 'Overdue') return 'status--danger';
    if (s === 'Inactive')               return 'status--inactive';
    if (s === 'Pending')                return 'status--warning';
    return 'status--info';
  }

  function rowKebab() {
    return `<button class="md-row-actions" aria-label="Row actions" onclick="event.stopPropagation()">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
    </button>`;
  }

  function iconBuilding() { return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-4"/></svg>`; }
  function iconUsers()    { return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/></svg>`; }
  function iconCheck()    { return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`; }
  function iconReceipt()  { return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M9 13h6M9 17h4"/></svg>`; }
  function iconShield()   { return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`; }
  function iconClock()    { return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>`; }
  function iconCalendar() { return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="17" rx="2.5"/><path d="M3 9h18M8 2v4M16 2v4"/></svg>`; }
  function iconClipboard(){ return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="17" rx="2.5"/><path d="M9 2h6v4H9z"/></svg>`; }
  function iconAlert()    { return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><path d="M12 9v4M12 17h.01"/></svg>`; }

  /* ── 9. BOOTSTRAP ──────────────────────────────────────────────────────── */

  function init() {
    /* Read URL ?tab= */
    const params = new URLSearchParams(location.search);
    const initial = params.get('tab') || 'clients';
    if (TAB_CONFIG[initial]) state.tab = initial;

    /* Tab clicks */
    document.querySelectorAll('.md-tab').forEach(t => {
      t.addEventListener('click', () => setTab(t.dataset.tab));
    });
    setTab(state.tab, false);

    /* Add New dropdown */
    const drop = document.getElementById('add-new-dropdown');
    const trig = document.getElementById('btn-add-new');
    const menu = drop.querySelector('.dropdown__menu');
    trig.addEventListener('click', e => {
      e.stopPropagation();
      const open = drop.classList.toggle('is-open');
      menu.hidden = !open;
      trig.setAttribute('aria-expanded', String(open));
    });
    document.addEventListener('click', () => {
      drop.classList.remove('is-open');
      menu.hidden = true;
      trig.setAttribute('aria-expanded', 'false');
    });
    menu.querySelectorAll('[data-add]').forEach(b => {
      b.addEventListener('click', e => {
        e.stopPropagation();
        drop.classList.remove('is-open');
        menu.hidden = true;
        openAddModal(b.dataset.add);
      });
    });

    /* Global search → set active tab's search field */
    document.getElementById('global-search').addEventListener('input', e => {
      state.q = e.target.value.trim().toLowerCase();
      const localSearch = document.getElementById('local-search');
      if (localSearch) localSearch.value = e.target.value;
      renderTable();
    });

    /* Drawer close */
    document.getElementById('drawer-close').addEventListener('click', closeDrawer);
    document.getElementById('drawer-backdrop').addEventListener('click', closeDrawer);

    /* Modal */
    document.getElementById('modal-close').addEventListener('click', closeModal);
    document.getElementById('modal-cancel').addEventListener('click', closeModal);
    document.getElementById('modal-backdrop').addEventListener('click', closeModal);
    document.getElementById('modal-back').addEventListener('click', () => {
      if (modalState.step > 0) { modalState.step--; renderModalStep(); }
    });
    document.getElementById('modal-next').addEventListener('click', () => {
      if (validateStep()) {
        modalState.step++;
        renderModalStep();
      }
    });
    document.getElementById('modal-save').addEventListener('click', () => {
      if (validateStep()) {
        closeModal();
        /* Brief in-app toast could go here. For demo: just close. */
      }
    });

    /* Empty-state clear filters */
    document.getElementById('btn-clear-filters').addEventListener('click', () => {
      state.q = '';
      state.filters = {};
      document.getElementById('global-search').value = '';
      render();
    });

    /* Escape closes drawer / modal */
    document.addEventListener('keydown', e => {
      if (e.key !== 'Escape') return;
      if (document.getElementById('modal').classList.contains('is-open'))  closeModal();
      else if (document.getElementById('drawer').classList.contains('is-open')) closeDrawer();
    });

    /* Back/forward */
    window.addEventListener('popstate', () => {
      const params = new URLSearchParams(location.search);
      setTab(params.get('tab') || 'clients', false);
    });

    /* Page enter */
    setTimeout(() => {
      document.body.classList.remove('is-loading');
      document.body.classList.add('is-loaded');
    }, 100);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
