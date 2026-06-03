/* ============================================================================
 * new-invoice.js — 5-step new invoice wizard
 *  Step 1: Select Entities (with live preview card)
 *  Step 2: Fetch Timesheets (skeleton load → table → running total)
 *  Step 3: Calculate & Tax (AI recommendation, compliance check, live calc)
 *  Step 4: Preview Invoice (A4 layout with template switcher)
 *  Step 5: Generate & Submit (progress steps → success page → countdown)
 *
 * URL params:
 *   ?from=timesheet&id=TS-2406-001  → pre-fill from a single timesheet
 *   ?from=ts-bulk&ids=…             → pre-fill from bulk selection
 * ========================================================================== */

(() => {
  'use strict';

  const INR_PER_USD = 83.25;
  const TODAY       = '2026-06-30';
  const TAX_RATES   = { 'IGST 18%': 0.18, 'CGST+SGST': 0.18, 'SEZ/LUT': 0, 'Zero Rated': 0, 'Exempt': 0 };

  /* Mirror master-data lookups (kept here to make this page standalone) */
  const COMPANIES = [
    { id: 1, name: 'INFO Services Pvt Ltd', gstin: '29AABCI1234A1Z5', address: 'Bengaluru, Karnataka 560001', state: 'Karnataka', bank: 'HDFC Bank · HDFC0001234 · A/C XXXXXX1234' },
    { id: 2, name: 'INFO Tech Solutions',   gstin: '27AABCI5678B1Z3', address: 'Mumbai, Maharashtra 400001', state: 'Maharashtra', bank: 'ICICI Bank · ICIC0001122 · A/C XXXXXX5566' },
    { id: 3, name: 'INFO Global Services',  gstin: '07AABCI9012C1Z1', address: 'New Delhi 110001',             state: 'Delhi',       bank: 'Axis Bank · UTIB0000456 · A/C XXXXXX3344' },
    { id: 4, name: 'INFO Consulting LLP',   gstin: '33AABCI3456D1Z9', address: 'Chennai, Tamil Nadu 600001',  state: 'Tamil Nadu',  bank: 'SBI · SBIN0008765 · A/C XXXXXX6789' },
  ];
  const CLIENTS = [
    { id: 1, name: 'Accenture India',  companyId: 1, gstin: '27AAACC1234A1Z5', address: 'Mumbai, Maharashtra 400001', state: 'Maharashtra', terms: 30, sez: false, taxDefault: 'IGST 18%' },
    { id: 2, name: 'TCS Limited',      companyId: 1, gstin: '29AAACC5678B1Z3', address: 'Bengaluru, Karnataka 560001', state: 'Karnataka',  terms: 45, sez: false, taxDefault: 'CGST+SGST' },
    { id: 3, name: 'Infosys BPM',      companyId: 2, gstin: '27AABCI9012C1Z2', address: 'Pune, Maharashtra 411001',    state: 'Maharashtra', terms: 30, sez: true,  taxDefault: 'SEZ/LUT' },
    { id: 4, name: 'Wipro Tech',       companyId: 2, gstin: '36AAACW3456D1Z4', address: 'Hyderabad, Telangana 500001', state: 'Telangana',   terms: 60, sez: false, taxDefault: 'IGST 18%' },
    { id: 5, name: 'HCL Methods',      companyId: 3, gstin: '09AAACH5678E1Z2', address: 'Noida, Uttar Pradesh 201301', state: 'Uttar Pradesh', terms: 30, sez: false, taxDefault: 'IGST 18%' },
    { id: 6, name: 'Cognizant Tech',   companyId: 3, gstin: '33AAACC9012F1Z6', address: 'Chennai, Tamil Nadu 600001',  state: 'Tamil Nadu',  terms: 45, sez: false, taxDefault: 'IGST 18%' },
  ];
  const CONSULTANTS = [
    { id: 1, name: 'Rahul Verma',    initials: 'RV', avatar: 'royal' },
    { id: 2, name: 'Anita Krishnan', initials: 'AK', avatar: 'success' },
    { id: 3, name: 'Deepak Mehta',   initials: 'DM', avatar: 'azure' },
    { id: 4, name: 'Sneha Pillai',   initials: 'SP', avatar: 'warning' },
    { id: 5, name: 'Kiran Nair',     initials: 'KN', avatar: 'danger' },
  ];
  const ASSIGNMENTS = [
    { id: 1, name: 'Accenture — Cloud Dev',     clientId: 1, consultantId: 1, hsn: '998314', billing: 'Hourly', rate: 2500,  currency: 'INR' },
    { id: 2, name: 'TCS — Data Engineering',    clientId: 2, consultantId: 2, hsn: '998313', billing: 'Daily',  rate: 12000, currency: 'INR' },
    { id: 3, name: 'Infosys — AI Solutions',    clientId: 3, consultantId: 3, hsn: '998315', billing: 'Hourly', rate: 85,    currency: 'USD' },
    { id: 4, name: 'Wipro — QA Automation',     clientId: 4, consultantId: 5, hsn: '998312', billing: 'Hourly', rate: 65,    currency: 'USD' },
    { id: 5, name: 'HCL — DevOps Setup',        clientId: 5, consultantId: 4, hsn: '998316', billing: 'Daily',  rate: 15000, currency: 'INR' },
    { id: 6, name: 'Cognizant — BI Dashboard',  clientId: 6, consultantId: 1, hsn: '998314', billing: 'Hourly', rate: 2500,  currency: 'INR' },
  ];
  /* Approved timesheets available to fetch (mirror Timesheets dataset) */
  const APPROVED_TS = [
    { id: 'TS-2406-003', consultantId: 3, assignmentId: 3, period: 'Jun W2 2026', periodLabel: '9–15 Jun', units: 38, unit: 'hrs', rate: 85,    currency: 'USD', amount: 3230 },
    { id: 'TS-2406-005', consultantId: 5, assignmentId: 4, period: 'Jun W1 2026', periodLabel: '2–8 Jun',  units: 36, unit: 'hrs', rate: 65,    currency: 'USD', amount: 2340 },
    { id: 'TS-2406-007', consultantId: 2, assignmentId: 2, period: 'Jun W1 2026', periodLabel: '2–8 Jun',  units: 5,  unit: 'days', rate: 12000, currency: 'INR', amount: 60000 },
    { id: 'TS-2406-008', consultantId: 3, assignmentId: 3, period: 'Jun W1 2026', periodLabel: '2–8 Jun',  units: 40, unit: 'hrs', rate: 85,    currency: 'USD', amount: 3400 },
    { id: 'TS-2406-012', consultantId: 1, assignmentId: 1, period: 'Jun W2 2026', periodLabel: '9–15 Jun', units: 38, unit: 'hrs', rate: 2500,  currency: 'INR', amount: 95000 },
    { id: 'TS-2406-001', consultantId: 1, assignmentId: 1, period: 'Jun W1 2026', periodLabel: '2–8 Jun',  units: 40, unit: 'hrs', rate: 2500,  currency: 'INR', amount: 100000 },
  ];

  const lookup = {
    company:    id => COMPANIES.find(c => c.id === id) || {},
    client:     id => CLIENTS.find(c => c.id === id) || {},
    consultant: id => CONSULTANTS.find(c => c.id === id) || {},
    assignment: id => ASSIGNMENTS.find(a => a.id === id) || {},
  };

  /* ── State ────────────────────────────────────────────────────────────── */

  let state = {
    step: 0,                                /* 0..4, plus 5 = success */
    invoiceNumber: 'INV-' + (2400 + Math.floor(Math.random() * 100)),
    companyId:    null,
    clientId:     null,
    consultantId: null,
    assignmentId: null,
    periodType:   'weekly',
    period:       'Jun W1 2026',
    invDate:      TODAY,
    dueDate:      '',
    lineItems:    [],     /* fetched timesheets become line items */
    taxType:      null,
    taxOverridden:false,
    overrideReason: '',
    discountActive: false,
    discount:     0,
    template:     'Standard A',
    prefillFrom:  null,   /* { type: 'timesheet', id: 'TS-…' } */
    sendDraftToClient: false,
    notifySig:    true,
    setReminder:  true,
  };

  /* ── URL pre-fill ─────────────────────────────────────────────────────── */

  function readPrefill() {
    const params = new URLSearchParams(location.search);
    const from = params.get('from');
    const id   = params.get('id');
    if (from === 'timesheet' && id) {
      const ts = APPROVED_TS.find(t => t.id === id);
      if (ts) {
        const ass = lookup.assignment(ts.assignmentId);
        const cli = lookup.client(ass.clientId);
        state.prefillFrom   = { type: 'timesheet', id: ts.id };
        state.assignmentId  = ass.id;
        state.consultantId  = ts.consultantId;
        state.clientId      = cli.id;
        state.companyId     = cli.companyId;
        state.period        = ts.period;
        state.lineItems     = [ {
          source: 'timesheet', tsId: ts.id, description: ass.name + ' · ' + ts.period,
          hsn: ass.hsn, qty: ts.units, unit: ts.unit, rate: ts.rate,
          currency: ts.currency, amount: ts.amount,
        } ];
        state.taxType       = cli.taxDefault;
        state.dueDate       = addDaysISO(state.invDate, cli.terms);
        toast({ type: 'success', title: 'Timesheet data loaded', subtitle: 'Review and generate — fields pre-filled' });
      }
    }
  }

  /* ── Step navigation ──────────────────────────────────────────────────── */

  function setStep(n) {
    state.step = n;
    updateStepperUI();
    renderStep();
    updateFooter();
    /* Scroll to top of step content */
    document.getElementById('step-content').scrollTop = 0;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function updateStepperUI() {
    document.querySelectorAll('.inv-step').forEach((el, i) => {
      el.classList.toggle('is-active', i === state.step);
      el.classList.toggle('is-done',   i <  state.step);
    });
    document.querySelectorAll('.inv-step__line').forEach((el, i) => {
      el.classList.toggle('is-done', i < state.step);
    });
  }

  function updateFooter() {
    const back     = document.getElementById('step-back');
    const next     = document.getElementById('step-next');
    const generate = document.getElementById('step-generate');
    if (state.step === 5) { /* success page */
      back.hidden = true; next.hidden = true; generate.hidden = true; return;
    }
    back.hidden = state.step === 0;
    if (state.step === 4) {
      next.hidden = true;
      generate.hidden = false;
    } else {
      next.hidden = false;
      generate.hidden = true;
      const labels = ['Next →', 'Next →', 'Next →', 'Next →'];
      next.textContent = labels[state.step];
    }
  }

  /* ── STEP RENDERERS ──────────────────────────────────────────────────── */

  function renderStep() {
    const content = document.getElementById('step-content');
    if (state.step === 0) content.innerHTML = renderStep1();
    else if (state.step === 1) content.innerHTML = renderStep2();
    else if (state.step === 2) content.innerHTML = renderStep3();
    else if (state.step === 3) content.innerHTML = renderStep4();
    else if (state.step === 4) content.innerHTML = renderStep5();
    else if (state.step === 5) content.innerHTML = renderSuccess();
    wireStep();
  }

  /* STEP 1 — Select Entities */
  function renderStep1() {
    const co = lookup.company(state.companyId);
    const cli = lookup.client(state.clientId);
    const con = lookup.consultant(state.consultantId);
    const ass = lookup.assignment(state.assignmentId);
    const prefilled = !!state.prefillFrom;

    const cFiltered = state.companyId ? CLIENTS.filter(c => c.companyId === state.companyId) : CLIENTS;
    const aFiltered = state.clientId ? ASSIGNMENTS.filter(a => a.clientId === state.clientId) : ASSIGNMENTS;

    return `
      ${prefilled ? `
        <div class="inv-prefill-chip">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          Pre-filled from Timesheet ${state.prefillFrom.id}
          <a href="#" id="change-source">Change Source</a>
        </div>` : ''}

      <div class="inv-step-grid">
        <div class="inv-form">
          <p class="inv-form__section-title">Select Entities</p>

          <div class="form-grid">
            <div class="form-field form-field--wide">
              <label>Company <span class="req">*</span></label>
              <select id="f-company" ${prefilled ? 'disabled' : ''}>
                <option value="" disabled ${!state.companyId ? 'selected' : ''}>Select company…</option>
                ${COMPANIES.map(c => `<option value="${c.id}" ${state.companyId === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}
              </select>
              ${co.gstin ? `<span class="form-field__hint">GSTIN: ${co.gstin} · ${co.address}</span>` : ''}
            </div>

            <div class="form-field form-field--wide">
              <label>Client <span class="req">*</span></label>
              <select id="f-client" ${!state.companyId || prefilled ? 'disabled' : ''}>
                <option value="" disabled ${!state.clientId ? 'selected' : ''}>${state.companyId ? 'Select client…' : 'Pick company first'}</option>
                ${cFiltered.map(c => `<option value="${c.id}" ${state.clientId === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}
              </select>
              ${cli.gstin ? `<span class="form-field__hint">GSTIN: ${cli.gstin} · Net ${cli.terms} · ${cli.taxDefault}${cli.sez ? ' · SEZ' : ''}</span>` : ''}
            </div>

            <div class="form-field">
              <label>Consultant <span class="req">*</span></label>
              <select id="f-consultant" ${prefilled ? 'disabled' : ''}>
                <option value="" disabled ${!state.consultantId ? 'selected' : ''}>Select consultant…</option>
                ${CONSULTANTS.map(c => `<option value="${c.id}" ${state.consultantId === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}
              </select>
              <a href="#" style="font-size:11px;color:var(--brand-royal);margin-top:4px;display:inline-block" id="add-consultant">+ Add Another Consultant</a>
            </div>

            <div class="form-field">
              <label>Assignment <span class="req">*</span></label>
              <select id="f-assignment" ${!state.clientId || prefilled ? 'disabled' : ''}>
                <option value="" disabled ${!state.assignmentId ? 'selected' : ''}>${state.clientId ? 'Select assignment…' : 'Pick client first'}</option>
                ${aFiltered.map(a => `<option value="${a.id}" ${state.assignmentId === a.id ? 'selected' : ''}>${a.name}</option>`).join('')}
              </select>
              ${ass.rate ? `<span class="form-field__hint">${ass.billing} · ${ass.currency === 'INR' ? '₹' : '$'}${ass.rate.toLocaleString()} · HSN ${ass.hsn}</span>` : ''}
            </div>

            <div class="form-field form-field--wide">
              <label>Billing Period <span class="req">*</span></label>
              <div style="display:flex;gap:8px;align-items:center">
                <div class="md-view-toggle">
                  <button type="button" data-period-type="weekly" class="${state.periodType === 'weekly' ? 'is-active' : ''}">Weekly</button>
                  <button type="button" data-period-type="monthly" class="${state.periodType === 'monthly' ? 'is-active' : ''}">Monthly</button>
                </div>
                <input type="text" id="f-period" value="${state.period}" style="flex:1" />
              </div>
            </div>

            <div class="form-field">
              <label>Invoice Date <span class="req">*</span></label>
              <input type="date" id="f-inv-date" value="${state.invDate}" />
            </div>

            <div class="form-field">
              <label>Due Date <span class="req">*</span></label>
              <input type="date" id="f-due-date" value="${state.dueDate || (cli.terms ? addDaysISO(state.invDate, cli.terms) : '')}" />
              ${cli.terms ? `<span class="form-field__hint">Auto-calculated: Invoice Date + ${cli.terms} days</span>` : ''}
            </div>
          </div>

          ${state.clientId && state.assignmentId && APPROVED_TS.filter(t => t.assignmentId === state.assignmentId).length === 0 ? `
            <div class="md-banner" role="alert">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg>
              <span>No approved timesheets found for this consultant + assignment. Approve timesheets before generating.</span>
              <a href="../timesheets/" class="md-banner__cta">Go to Timesheets →</a>
            </div>` : ''}
        </div>

        <!-- Live preview card -->
        <aside class="inv-preview-card">
          <p class="inv-preview-card__title">Live Preview</p>
          <div>
            <p class="inv-preview-card__title" style="margin-top:0">Bill From</p>
            <p class="inv-preview-card__value"><strong>${co.name || '—'}</strong><br>${co.gstin ? 'GSTIN: ' + co.gstin : ''}<br>${co.address || ''}</p>
          </div>
          <div>
            <p class="inv-preview-card__title">Bill To</p>
            <p class="inv-preview-card__value"><strong>${cli.name || '—'}</strong><br>${cli.gstin ? 'GSTIN: ' + cli.gstin : ''}<br>${cli.address || ''}</p>
          </div>
          <div>
            <p class="inv-preview-card__title">Consultant</p>
            <p class="inv-preview-card__value">${con.name || '—'}</p>
          </div>
          <div>
            <p class="inv-preview-card__title">Period</p>
            <p class="inv-preview-card__value">${state.period}</p>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;padding-top:10px;border-top:1px solid var(--border-subtle)">
            <div><p class="inv-preview-card__title">Invoice Date</p><p class="inv-preview-card__value">${fmtDate(state.invDate)}</p></div>
            <div><p class="inv-preview-card__title">Due Date</p><p class="inv-preview-card__value">${state.dueDate ? fmtDate(state.dueDate) : '—'}</p></div>
          </div>
        </aside>
      </div>`;
  }

  /* STEP 2 — Fetch Timesheets */
  function renderStep2() {
    const ass = lookup.assignment(state.assignmentId);
    const con = lookup.consultant(state.consultantId);
    const fetched = state.lineItems.length > 0 ? state.lineItems : APPROVED_TS.filter(t => t.assignmentId === state.assignmentId && t.consultantId === state.consultantId).map(t => ({
      source: 'timesheet', tsId: t.id, description: ass.name + ' · ' + t.period,
      hsn: ass.hsn, qty: t.units, unit: t.unit, rate: t.rate, currency: t.currency, amount: t.amount,
      period: t.period, included: true,
    }));
    /* Persist fetched into state so subsequent steps see them */
    if (state.lineItems.length === 0 && fetched.length > 0) {
      state.lineItems = fetched.map(f => ({ ...f, included: true }));
    }

    const items = state.lineItems;
    const totalHours = items.filter(i => i.unit === 'hrs').reduce((a, i) => a + (i.included !== false ? Number(i.qty) : 0), 0);
    const totalDays  = items.filter(i => i.unit === 'days').reduce((a, i) => a + (i.included !== false ? Number(i.qty) : 0), 0);
    const subtotal   = items.reduce((a, i) => a + (i.included !== false ? Number(i.amount) : 0), 0);

    if (items.length === 0) {
      return `
        <div class="md-empty" style="padding:60px;background:var(--white);border:1px solid var(--border);border-radius:var(--radius-md)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="17" rx="2.5"/><path d="M3 9h18M8 2v4M16 2v4"/></svg>
          <p class="md-empty__title">No approved timesheets found</p>
          <p class="md-empty__sub">Approve timesheets for this consultant + period before generating an invoice.</p>
          <div style="display:flex;gap:8px;margin-top:14px">
            <button class="btn btn--ghost" id="back-step">← Go Back</button>
            <a class="btn btn--primary" href="../timesheets/?tab=pending">Go to Timesheets →</a>
          </div>
        </div>`;
    }

    return `
      <div class="inv-step-grid">
        <div>
          <p class="inv-form__section-title">Fetched Timesheets</p>
          <p style="font-size:13px;color:var(--text-tertiary);margin-bottom:14px">Pre-loaded from approved timesheets for <strong>${con.name}</strong> · ${ass.name}.</p>

          <table class="md-table" style="background:var(--white);border:1px solid var(--border);border-radius:var(--radius-md);overflow:hidden">
            <thead>
              <tr>
                <th style="width:32px"><input type="checkbox" id="ts-select-all" checked /></th>
                <th>TS ID</th>
                <th>Period</th>
                <th class="num-col">Qty</th>
                <th class="num-col">Rate</th>
                <th class="num-col">Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${items.map((it, i) => `
                <tr data-idx="${i}">
                  <td><input type="checkbox" data-include="${i}" ${it.included !== false ? 'checked' : ''} /></td>
                  <td class="mono-cell">${it.tsId || '—'}</td>
                  <td>${it.period || state.period}</td>
                  <td class="num-col">${it.qty} ${it.unit}</td>
                  <td class="num-col">${it.currency === 'INR' ? '₹' : '$'}${Number(it.rate).toLocaleString()}/${it.unit === 'hrs' ? 'hr' : 'day'}</td>
                  <td class="num-col"><strong>${it.currency === 'INR' ? '₹' : '$'}${Number(it.amount).toLocaleString()}</strong></td>
                  <td><span class="status status--success">Approved ✓</span></td>
                </tr>`).join('')}
            </tbody>
          </table>

          <button class="btn btn--ghost" id="add-manual" style="margin-top:14px">+ Add Manual Line Item</button>
        </div>

        <aside class="inv-preview-card">
          <p class="inv-preview-card__title">Running Total</p>
          <div class="billing-calc__row"><span>Selected Timesheets</span><span>${items.filter(i => i.included !== false).length}</span></div>
          <div class="billing-calc__row"><span>Total Hours</span><span>${totalHours || '—'}</span></div>
          <div class="billing-calc__row"><span>Total Days</span><span>${totalDays || '—'}</span></div>
          <div class="billing-calc__divider"></div>
          <div class="billing-calc__total"><span>Subtotal</span><span>${state.lineItems[0]?.currency === 'INR' ? '₹' : '$'}${Number(subtotal).toLocaleString()}</span></div>
        </aside>
      </div>`;
  }

  /* STEP 3 — Calculate & Tax */
  function renderStep3() {
    const co = lookup.company(state.companyId);
    const cli = lookup.client(state.clientId);
    const ass = lookup.assignment(state.assignmentId);
    const items = state.lineItems.filter(i => i.included !== false);
    const subtotal = items.reduce((a, i) => a + Number(i.amount), 0);
    const currency = items[0]?.currency || 'INR';

    const recommended = co.state === cli.state ? 'CGST+SGST' : (cli.sez ? 'SEZ/LUT' : 'IGST 18%');
    const reason = cli.sez ? `${cli.name} is an SEZ unit` : co.state === cli.state ? `Same state (${co.state})` : `${co.name} (${co.state}) → ${cli.name} (${cli.state})`;

    if (!state.taxType) state.taxType = recommended;
    state.taxOverridden = state.taxType !== recommended;

    const taxRate = TAX_RATES[state.taxType] || 0;
    const discount = state.discountActive ? Number(state.discount) || 0 : 0;
    const taxable = subtotal - discount;
    const tax = taxable * taxRate;
    const total = taxable + tax;
    const usd = currency === 'INR' ? total / INR_PER_USD : total;
    const inr = currency === 'INR' ? total : total * INR_PER_USD;
    const cgst = state.taxType === 'CGST+SGST' ? tax / 2 : 0;
    const sgst = cgst;
    const igst = state.taxType === 'IGST 18%' ? tax : 0;

    return `
      <div class="inv-step-grid">
        <div class="inv-form">
          <p class="inv-form__section-title">Line Items</p>
          <div class="confirm-card">
            ${items.map((i, idx) => `
              <div class="confirm-card__row">
                <span>Line ${idx + 1}: ${i.description}</span>
                <span>${i.qty} ${i.unit} × ${currency === 'INR' ? '₹' : '$'}${i.rate.toLocaleString()} = ${currency === 'INR' ? '₹' : '$'}${i.amount.toLocaleString()}</span>
              </div>`).join('')}
          </div>

          <p class="inv-form__section-title" style="margin-top:14px">Tax Configuration</p>

          <div class="inv-ai-chip">
            <span class="inv-ai-chip__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v6M12 14v6M5 12H1M23 12h-4M19 5l-3 3M19 19l-3-3M5 19l3-3M5 5l3 3"/></svg></span>
            <div class="inv-ai-chip__body">
              <strong>${recommended}</strong> recommended.<br>
              <small>${reason}</small>
            </div>
            ${state.taxType !== recommended ? `<button class="inv-ai-chip__btn" id="apply-rec">✓ Apply</button>` : ''}
          </div>

          <div class="inv-tax-options" style="margin-top:10px">
            ${['IGST 18%', 'CGST+SGST', 'SEZ/LUT', 'Zero Rated', 'Exempt'].map(t => `
              <label class="inv-tax-option ${state.taxType === t ? 'is-checked' : ''}">
                <input type="radio" name="tax-type" value="${t}" ${state.taxType === t ? 'checked' : ''} />
                <span class="inv-tax-option__label">${t}</span>
                <span class="inv-tax-option__sub">${t === 'IGST 18%' ? 'inter-state' : t === 'CGST+SGST' ? 'intra-state' : t === 'SEZ/LUT' ? 'SEZ client' : t === 'Zero Rated' ? 'LUT' : 'custom'}</span>
              </label>`).join('')}
          </div>

          ${state.taxType === 'SEZ/LUT' ? `
            <div class="form-grid" style="margin-top:10px">
              <div class="form-field"><label>LUT Number</label><input type="text" placeholder="LUT-2026-001" /></div>
              <div class="form-field"><label>LUT Expiry</label><input type="date" value="2027-03-31" /></div>
            </div>` : ''}

          <p class="inv-form__section-title" style="margin-top:14px">Discount & Adjustment</p>
          <label class="checkbox-row"><input type="checkbox" id="disc-toggle" ${state.discountActive ? 'checked' : ''} /> Apply Discount</label>
          ${state.discountActive ? `
            <div class="form-grid">
              <div class="form-field"><label>Discount (₹)</label><input type="number" id="disc-amt" value="${state.discount}" min="0" /></div>
              <div class="form-field"><label>Reason</label><input type="text" placeholder="Volume discount, early payment…" /></div>
            </div>` : ''}

          <!-- Live calculation -->
          <div class="inv-calc" style="margin-top:14px">
            <p class="inv-calc__title">Calculation Summary</p>
            <div class="inv-calc__row"><span>Subtotal</span><span>${currency === 'INR' ? '₹' : '$'}${subtotal.toLocaleString('en-IN')}</span></div>
            ${discount > 0 ? `<div class="inv-calc__row"><span>Discount</span><span>− ${currency === 'INR' ? '₹' : '$'}${discount.toLocaleString('en-IN')}</span></div>` : ''}
            <div class="inv-calc__row"><span>Taxable Amount</span><span>${currency === 'INR' ? '₹' : '$'}${taxable.toLocaleString('en-IN')}</span></div>
            ${state.taxType === 'CGST+SGST' ? `
              <div class="inv-calc__row"><span>CGST @ 9%</span><span>${currency === 'INR' ? '₹' : '$'}${cgst.toLocaleString('en-IN')}</span></div>
              <div class="inv-calc__row"><span>SGST @ 9%</span><span>${currency === 'INR' ? '₹' : '$'}${sgst.toLocaleString('en-IN')}</span></div>` :
              state.taxType === 'IGST 18%' ? `<div class="inv-calc__row"><span>IGST @ 18%</span><span>${currency === 'INR' ? '₹' : '$'}${igst.toLocaleString('en-IN')}</span></div>` :
              `<div class="inv-calc__row"><span>${state.taxType}</span><span>—</span></div>`}
            <div class="inv-calc__divider"></div>
            <div class="inv-calc__total"><span>Total Invoice</span><span>${currency === 'INR' ? '₹' : '$'}${total.toLocaleString('en-IN')}</span></div>
            <p class="inv-calc__usd">${currency === 'INR' ? '$' + Math.round(usd).toLocaleString() + ' equivalent' : '₹' + Math.round(inr).toLocaleString('en-IN') + ' equivalent'}</p>
            <p class="inv-calc__words"><strong>Amount in words:</strong> ${amountInWords(Math.round(total))} ${currency === 'INR' ? 'Rupees' : 'Dollars'} Only</p>
          </div>
        </div>

        <div>
          ${state.taxOverridden ? `
            <div class="md-banner" style="margin-bottom:14px" role="alert">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg>
              <span>Overriding system recommendation. This action is logged.</span>
            </div>
            <div class="form-field form-field--wide" style="margin-bottom:14px">
              <label>Reason for tax override <span class="req">*</span></label>
              <input type="text" id="override-reason" value="${state.overrideReason}" placeholder="Why override the recommendation?" />
            </div>` : ''}

          <div class="inv-compliance">
            <p class="inv-compliance__title">Compliance Check</p>
            <p class="inv-compliance__item inv-compliance__item--ok"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> GSTIN validated (client)</p>
            <p class="inv-compliance__item inv-compliance__item--ok"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> GSTIN validated (company)</p>
            <p class="inv-compliance__item inv-compliance__item--ok"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> HSN/SAC code present (${ass.hsn})</p>
            ${state.taxType === 'SEZ/LUT' ? `<p class="inv-compliance__item inv-compliance__item--ok"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> LUT active until 31 Mar 2027</p>` : ''}
            <p class="inv-compliance__item inv-compliance__item--ok"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Invoice date within filing period</p>
            <p class="inv-compliance__item inv-compliance__item--warn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg> Verify reverse charge applicability</p>
          </div>

          <div class="inv-compliance" style="margin-top:14px">
            <p class="inv-compliance__title">GST Summary</p>
            <div class="billing-calc__row"><span>CGST</span><span>${currency === 'INR' ? '₹' : '$'}${cgst.toLocaleString('en-IN')}</span></div>
            <div class="billing-calc__row"><span>SGST</span><span>${currency === 'INR' ? '₹' : '$'}${sgst.toLocaleString('en-IN')}</span></div>
            <div class="billing-calc__row"><span>IGST</span><span>${currency === 'INR' ? '₹' : '$'}${igst.toLocaleString('en-IN')}</span></div>
            <div class="billing-calc__divider"></div>
            <div class="billing-calc__row" style="font-weight:600;color:var(--text-primary)"><span>Total Tax</span><span>${currency === 'INR' ? '₹' : '$'}${tax.toLocaleString('en-IN')}</span></div>
          </div>
        </div>
      </div>`;
  }

  /* STEP 4 — Preview Invoice (A4 layout) */
  function renderStep4() {
    const co = lookup.company(state.companyId);
    const cli = lookup.client(state.clientId);
    const ass = lookup.assignment(state.assignmentId);
    const items = state.lineItems.filter(i => i.included !== false);
    const subtotal = items.reduce((a, i) => a + Number(i.amount), 0);
    const currency = items[0]?.currency || 'INR';
    const taxRate = TAX_RATES[state.taxType] || 0;
    const discount = state.discountActive ? Number(state.discount) || 0 : 0;
    const taxable = subtotal - discount;
    const tax = taxable * taxRate;
    const total = taxable + tax;
    const sym = currency === 'INR' ? '₹' : '$';
    const usd = currency === 'INR' ? total / INR_PER_USD : total;
    const cgst = state.taxType === 'CGST+SGST' ? tax / 2 : 0;
    const sgst = cgst;
    const igst = state.taxType === 'IGST 18%' ? tax : 0;

    return `
      <div class="inv-preview-bar">
        <div>
          <p style="font-size:13px;font-weight:600;color:var(--text-primary)">Step 4: Invoice Preview</p>
          <p style="font-size:11px;color:var(--text-tertiary);margin-top:2px">Does this invoice look correct? Review and proceed to generate.</p>
        </div>
        <div class="inv-preview-bar__actions">
          <button class="btn btn--ghost" id="preview-pdf"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5M12 15V3"/></svg> Download Preview</button>
          <select class="md-select" id="template-picker">
            <option ${state.template === 'Standard A' ? 'selected' : ''}>Standard A</option>
            <option ${state.template === 'Standard B' ? 'selected' : ''}>Standard B</option>
            <option ${state.template === 'Detailed' ? 'selected' : ''}>Detailed</option>
            <option ${state.template === 'International' ? 'selected' : ''}>International</option>
          </select>
        </div>
      </div>

      <article class="inv-paper">
        <header class="inv-paper__head">
          <div class="inv-paper__logo">
            <span class="inv-paper__logo-square">IS</span>
            <div>
              <p class="inv-paper__co-name">${co.name}</p>
              <p class="inv-paper__co-meta">GSTIN: ${co.gstin}<br>${co.address}</p>
            </div>
          </div>
          <p class="inv-paper__title">TAX INVOICE</p>
        </header>

        <table class="inv-paper__meta-table">
          <tr><td>Invoice No</td><td>${state.invoiceNumber}</td></tr>
          <tr><td>Invoice Date</td><td>${fmtDate(state.invDate)}</td></tr>
          <tr><td>Due Date</td><td>${fmtDate(state.dueDate)}</td></tr>
          <tr><td>Billing Period</td><td>${state.period}</td></tr>
        </table>

        <section class="inv-paper__section">
          <p class="inv-paper__section-title">Bill To</p>
          <p style="font-weight:600">${cli.name}</p>
          <p style="font-size:12px;color:var(--text-tertiary)">GSTIN: ${cli.gstin}<br>${cli.address}</p>
        </section>

        <table class="inv-paper__items">
          <thead><tr><th>#</th><th>Description</th><th>HSN</th><th>Qty</th><th>Unit</th><th>Rate</th><th>Amount</th></tr></thead>
          <tbody>
            ${items.map((i, idx) => `
              <tr>
                <td>${idx + 1}</td>
                <td>${i.description}</td>
                <td>${i.hsn}</td>
                <td>${i.qty}</td>
                <td>${i.unit}</td>
                <td>${sym}${Number(i.rate).toLocaleString()}</td>
                <td>${sym}${Number(i.amount).toLocaleString()}</td>
              </tr>`).join('')}
          </tbody>
        </table>

        <div class="inv-paper__totals">
          <table class="inv-paper__totals-table">
            <tr><td>Subtotal</td><td>${sym}${subtotal.toLocaleString('en-IN')}</td></tr>
            ${discount > 0 ? `<tr><td>Discount</td><td>− ${sym}${discount.toLocaleString('en-IN')}</td></tr>` : ''}
            ${state.taxType === 'CGST+SGST' ? `
              <tr><td>CGST @ 9%</td><td>${sym}${cgst.toLocaleString('en-IN')}</td></tr>
              <tr><td>SGST @ 9%</td><td>${sym}${sgst.toLocaleString('en-IN')}</td></tr>` : ''}
            ${state.taxType === 'IGST 18%' ? `<tr><td>IGST @ 18%</td><td>${sym}${igst.toLocaleString('en-IN')}</td></tr>` : ''}
            ${['SEZ/LUT', 'Zero Rated', 'Exempt'].includes(state.taxType) ? `<tr><td>${state.taxType}</td><td>—</td></tr>` : ''}
            <tr class="is-grand"><td>TOTAL</td><td>${sym}${total.toLocaleString('en-IN')}</td></tr>
            <tr><td style="font-size:11px;color:var(--text-tertiary)">${currency === 'INR' ? 'USD equivalent' : 'INR equivalent'}</td><td style="font-size:11px;color:var(--text-tertiary)">${currency === 'INR' ? '$' + Math.round(usd).toLocaleString() : '₹' + Math.round(total * INR_PER_USD).toLocaleString('en-IN')}</td></tr>
          </table>
        </div>

        <p class="inv-paper__words"><strong>Amount in Words:</strong> ${amountInWords(Math.round(total))} ${currency === 'INR' ? 'Rupees' : 'Dollars'} Only</p>

        <footer class="inv-paper__footer">
          <div>
            <p style="font-weight:600;color:var(--brand-navy);margin-bottom:6px">Bank Details</p>
            <p>${co.bank}</p>
            <p style="margin-top:10px;font-weight:600;color:var(--brand-navy)">Terms &amp; Conditions</p>
            <p>Payment due within ${cli.terms} days of invoice date. Late payments attract interest @ 18% p.a.</p>
          </div>
          <div class="inv-paper__sign">
            <span class="inv-paper__sign-line"></span><br>
            <strong>Authorized Signatory</strong><br>
            For ${co.name}
          </div>
        </footer>
      </article>

      <div style="text-align:center;margin-top:18px">
        <p style="font-size:14px;color:var(--text-secondary);margin-bottom:10px">Does this invoice look correct?</p>
        <div style="display:flex;gap:8px;justify-content:center">
          <button class="btn btn--ghost" id="preview-back">← Make Changes</button>
          <button class="btn btn--primary" id="preview-next">Looks Good — Generate →</button>
        </div>
      </div>`;
  }

  /* STEP 5 — Generate & Submit */
  function renderStep5() {
    const co  = lookup.company(state.companyId);
    const cli = lookup.client(state.clientId);
    const con = lookup.consultant(state.consultantId);
    const items = state.lineItems.filter(i => i.included !== false);
    const subtotal = items.reduce((a, i) => a + Number(i.amount), 0);
    const currency = items[0]?.currency || 'INR';
    const taxRate = TAX_RATES[state.taxType] || 0;
    const discount = state.discountActive ? Number(state.discount) || 0 : 0;
    const taxable = subtotal - discount;
    const tax = taxable * taxRate;
    const total = taxable + tax;
    const sym = currency === 'INR' ? '₹' : '$';

    return `
      <div class="inv-step-grid">
        <div>
          <div class="inv-summary-card">
            <p class="inv-summary-card__head">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              Invoice Ready to Generate
            </p>
            <div class="inv-summary-card__row"><span>Invoice Number</span><span>${state.invoiceNumber}</span></div>
            <div class="inv-summary-card__row"><span>Client</span><span>${cli.name}</span></div>
            <div class="inv-summary-card__row"><span>Consultant</span><span>${con.name}</span></div>
            <div class="inv-summary-card__row"><span>Period</span><span>${state.period}</span></div>
            <div class="inv-summary-card__row"><span>Total Amount</span><span>${sym}${total.toLocaleString('en-IN')}</span></div>
            <div class="inv-summary-card__row"><span>Tax Type</span><span>${state.taxType}</span></div>
            <div class="inv-summary-card__row"><span>Due Date</span><span>${fmtDate(state.dueDate)}</span></div>
          </div>

          <p class="inv-form__section-title" style="margin-top:16px">What Happens Next</p>
          <div class="inv-next-list">
            <p class="inv-next-list__item"><span class="inv-next-list__num">1</span> 📄 Invoice PDF generated and saved</p>
            <p class="inv-next-list__item"><span class="inv-next-list__num">2</span> 📋 Submitted to Finance Admin for review</p>
            <p class="inv-next-list__item"><span class="inv-next-list__num">3</span> ✍️ Signing Authority approval required</p>
            <p class="inv-next-list__item"><span class="inv-next-list__num">4</span> 📧 Delivered to client after approval</p>
            <p class="inv-next-list__item"><span class="inv-next-list__num">5</span> 💰 Payment tracking begins</p>
          </div>

          <div style="margin-top:16px;display:flex;flex-direction:column;gap:6px">
            <label class="checkbox-row"><input type="checkbox" id="send-draft" ${state.sendDraftToClient ? 'checked' : ''} /> Send draft copy to client for review</label>
            <label class="checkbox-row"><input type="checkbox" id="notify-sig" ${state.notifySig ? 'checked' : ''} /> Notify signing authority immediately</label>
            <label class="checkbox-row"><input type="checkbox" id="set-rem" ${state.setReminder ? 'checked' : ''} /> Set payment reminder (7 days before due)</label>
          </div>
        </div>

        <aside>
          <p class="inv-form__section-title" style="margin-bottom:12px">Approval Path</p>
          <div class="inv-approval-chain">
            <div class="inv-approval-step">
              <span class="inv-approval-step__avatar">PS</span>
              <div class="inv-approval-step__body">
                <p class="inv-approval-step__title">Priya Sharma</p>
                <p class="inv-approval-step__role">Step 1 · Finance Admin Review</p>
              </div>
              <span class="inv-approval-step__status" style="color:var(--success-fg)">Auto-approved</span>
            </div>
            <div class="inv-approval-step">
              <span class="inv-approval-step__avatar" style="background:linear-gradient(135deg,var(--azure-500),var(--azure-700))">RK</span>
              <div class="inv-approval-step__body">
                <p class="inv-approval-step__title">Rajesh Kumar</p>
                <p class="inv-approval-step__role">Step 2 · Signing Authority</p>
              </div>
              <span class="inv-approval-step__status" style="color:var(--warning-fg)">Will be notified</span>
            </div>
            <div class="inv-approval-step">
              <span class="inv-approval-step__avatar" style="background:linear-gradient(135deg,var(--success-soft),var(--success-deep))">${initials(cli.name)}</span>
              <div class="inv-approval-step__body">
                <p class="inv-approval-step__title">${cli.name}</p>
                <p class="inv-approval-step__role">Step 3 · Client Delivery</p>
              </div>
              <span class="inv-approval-step__status" style="color:var(--text-tertiary)">After approval</span>
            </div>
          </div>
          <p style="font-size:12px;color:var(--text-tertiary);margin-top:10px;font-style:italic;text-align:center">⏱️ Estimated approval time: ~2 business days</p>
        </aside>
      </div>

      <div style="text-align:center;margin-top:18px;display:flex;gap:8px;justify-content:center">
        <button class="btn btn--ghost" id="save-draft">Save as Draft</button>
      </div>`;
  }

  /* SUCCESS — full page after generation */
  function renderSuccess() {
    const cli = lookup.client(state.clientId);
    const items = state.lineItems.filter(i => i.included !== false);
    const subtotal = items.reduce((a, i) => a + Number(i.amount), 0);
    const currency = items[0]?.currency || 'INR';
    const taxRate = TAX_RATES[state.taxType] || 0;
    const discount = state.discountActive ? Number(state.discount) || 0 : 0;
    const total = (subtotal - discount) * (1 + taxRate);
    const sym = currency === 'INR' ? '₹' : '$';

    return `
      <div class="inv-success">
        <div class="inv-success__icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <h2 class="inv-success__title">Invoice Generated Successfully!</h2>
        <p class="inv-success__meta">${state.invoiceNumber} · ${sym}${Math.round(total).toLocaleString('en-IN')} · ${cli.name}</p>
        <div class="inv-success__actions">
          <button class="btn btn--ghost" id="suc-pdf">Download PDF</button>
          <button class="btn btn--ghost" id="suc-view">View Invoice</button>
          <button class="btn btn--ghost" id="suc-another">Generate Another</button>
          <a class="btn btn--primary" href="./">Return to Invoices →</a>
        </div>
        <p class="inv-success__countdown" id="countdown">Redirecting in 5…</p>
      </div>`;
  }

  /* ── WIRE STEPS ──────────────────────────────────────────────────────── */

  function wireStep() {
    if (state.step === 0) wireStep1();
    else if (state.step === 1) wireStep2();
    else if (state.step === 2) wireStep3();
    else if (state.step === 3) wireStep4();
    else if (state.step === 4) wireStep5();
    else if (state.step === 5) wireSuccess();
  }

  function wireStep1() {
    document.getElementById('f-company')?.addEventListener('change', e => {
      state.companyId = Number(e.target.value);
      state.clientId = null; state.assignmentId = null;
      renderStep();
    });
    document.getElementById('f-client')?.addEventListener('change', e => {
      state.clientId = Number(e.target.value);
      state.assignmentId = null;
      const cli = lookup.client(state.clientId);
      state.dueDate = addDaysISO(state.invDate, cli.terms || 30);
      renderStep();
    });
    document.getElementById('f-consultant')?.addEventListener('change', e => {
      state.consultantId = Number(e.target.value);
      renderStep();
    });
    document.getElementById('f-assignment')?.addEventListener('change', e => {
      state.assignmentId = Number(e.target.value);
      renderStep();
    });
    document.getElementById('f-period')?.addEventListener('input', e => { state.period = e.target.value; });
    document.getElementById('f-inv-date')?.addEventListener('change', e => {
      state.invDate = e.target.value;
      const cli = lookup.client(state.clientId);
      if (cli.terms) state.dueDate = addDaysISO(state.invDate, cli.terms);
      renderStep();
    });
    document.getElementById('f-due-date')?.addEventListener('change', e => { state.dueDate = e.target.value; });
    document.querySelectorAll('[data-period-type]').forEach(b => {
      b.addEventListener('click', () => { state.periodType = b.dataset.periodType; renderStep(); });
    });
    document.getElementById('change-source')?.addEventListener('click', e => {
      e.preventDefault();
      state.prefillFrom = null;
      renderStep();
    });
  }

  function wireStep2() {
    document.getElementById('back-step')?.addEventListener('click', () => setStep(0));
    document.getElementById('ts-select-all')?.addEventListener('change', e => {
      state.lineItems.forEach(i => { i.included = e.target.checked; });
      renderStep();
    });
    document.querySelectorAll('[data-include]').forEach(cb => {
      cb.addEventListener('change', e => {
        const idx = Number(cb.dataset.include);
        state.lineItems[idx].included = e.target.checked;
        renderStep();
      });
    });
    document.getElementById('add-manual')?.addEventListener('click', () => {
      state.lineItems.push({
        source: 'manual', description: 'Manual line item', hsn: '998314',
        qty: 1, unit: 'hrs', rate: 2500, currency: state.lineItems[0]?.currency || 'INR', amount: 2500,
        included: true,
      });
      renderStep();
    });
  }

  function wireStep3() {
    document.querySelectorAll('[name="tax-type"]').forEach(r => {
      r.addEventListener('change', e => {
        state.taxType = e.target.value;
        renderStep();
      });
    });
    document.getElementById('apply-rec')?.addEventListener('click', () => {
      const co = lookup.company(state.companyId);
      const cli = lookup.client(state.clientId);
      state.taxType = co.state === cli.state ? 'CGST+SGST' : (cli.sez ? 'SEZ/LUT' : 'IGST 18%');
      state.taxOverridden = false;
      renderStep();
    });
    document.getElementById('disc-toggle')?.addEventListener('change', e => {
      state.discountActive = e.target.checked;
      if (!state.discountActive) state.discount = 0;
      renderStep();
    });
    document.getElementById('disc-amt')?.addEventListener('input', e => {
      state.discount = Number(e.target.value) || 0;
      renderStep();
    });
    document.getElementById('override-reason')?.addEventListener('input', e => { state.overrideReason = e.target.value; });
  }

  function wireStep4() {
    document.getElementById('template-picker')?.addEventListener('change', e => {
      state.template = e.target.value;
      toast({ type: 'info', title: `Template: ${state.template}`, subtitle: 'Preview updated' });
    });
    document.getElementById('preview-pdf')?.addEventListener('click', () => {
      toast({ type: 'info', title: 'Preparing PDF…', subtitle: 'Browser print dialog will open' });
      setTimeout(() => window.print(), 600);
    });
    document.getElementById('preview-back')?.addEventListener('click', () => setStep(2));
    document.getElementById('preview-next')?.addEventListener('click', () => setStep(4));
  }

  function wireStep5() {
    document.getElementById('send-draft')?.addEventListener('change', e => { state.sendDraftToClient = e.target.checked; });
    document.getElementById('notify-sig')?.addEventListener('change', e => { state.notifySig = e.target.checked; });
    document.getElementById('set-rem')?.addEventListener('change', e => { state.setReminder = e.target.checked; });
    document.getElementById('save-draft')?.addEventListener('click', () => {
      toast({ type: 'success', title: 'Draft saved', subtitle: state.invoiceNumber + ' saved as Draft' });
      setTimeout(() => { location.href = './'; }, 1200);
    });
  }

  function wireSuccess() {
    document.getElementById('suc-pdf')?.addEventListener('click', () => window.print());
    document.getElementById('suc-view')?.addEventListener('click', () => { location.href = './?id=' + state.invoiceNumber; });
    document.getElementById('suc-another')?.addEventListener('click', () => { location.href = './new.html'; });

    /* 5-sec countdown */
    let n = 5;
    const el = document.getElementById('countdown');
    const tick = setInterval(() => {
      n--;
      if (el) el.textContent = `Redirecting in ${n}…`;
      if (n <= 0) { clearInterval(tick); location.href = './'; }
    }, 1000);
  }

  /* ── Generate flow (Step 5 → success) ─────────────────────────────────── */

  function runGenerate() {
    /* Overlay with progress steps */
    const overlay = document.createElement('div');
    overlay.className = 'inv-gen-progress';
    overlay.innerHTML = `
      <div class="inv-gen-card">
        <p class="inv-gen-card__title">Generating Invoice…</p>
        ${['Calculating amounts', 'Applying tax rules', 'Generating PDF', 'Saving invoice', 'Notifying signing authority'].map((s, i) => `
          <div class="inv-gen-step" data-gen="${i}">
            <span class="inv-gen-step__icon">${spinnerSVG()}</span>
            <span>${s}…</span>
          </div>`).join('')}
      </div>`;
    document.body.appendChild(overlay);

    /* Step through */
    const steps = overlay.querySelectorAll('.inv-gen-step');
    let i = 0;
    const advance = () => {
      if (i > 0) {
        steps[i - 1].classList.add('is-done');
        steps[i - 1].querySelector('.inv-gen-step__icon').innerHTML = checkSVG();
      }
      if (i < steps.length) {
        steps[i].classList.add('is-active');
        i++;
        setTimeout(advance, 300);
      } else {
        setTimeout(() => {
          overlay.remove();
          setStep(5);
        }, 400);
      }
    };
    advance();
  }

  function spinnerSVG() {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="animation:spin 700ms linear infinite"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>`;
  }
  function checkSVG() {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="color:var(--success)"><polyline points="20 6 9 17 4 12"/></svg>`;
  }

  /* ── Validation ───────────────────────────────────────────────────────── */

  function validateStep() {
    if (state.step === 0) {
      if (!state.companyId || !state.clientId || !state.consultantId || !state.assignmentId) {
        toast({ type: 'danger', title: 'Complete required fields', subtitle: 'Company, client, consultant, assignment are required' });
        return false;
      }
      return true;
    }
    if (state.step === 1) {
      const included = state.lineItems.filter(i => i.included !== false);
      if (included.length === 0) {
        toast({ type: 'danger', title: 'Select at least one timesheet or line item' });
        return false;
      }
      return true;
    }
    if (state.step === 2) {
      if (state.taxOverridden && !state.overrideReason.trim()) {
        toast({ type: 'danger', title: 'Reason required for tax override' });
        return false;
      }
      return true;
    }
    return true;
  }

  /* ── Helpers ──────────────────────────────────────────────────────────── */

  function addDaysISO(iso, days) {
    const d = new Date(iso);
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  }
  function fmtDate(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }
  function initials(name) {
    return name.split(/\s+/).slice(0, 2).map(p => p[0]).join('').toUpperCase();
  }

  /* Amount in words (Indian numbering) */
  function amountInWords(num) {
    if (num === 0) return 'Zero';
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    function twoDigits(n) {
      if (n < 20) return ones[n];
      return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
    }
    function threeDigits(n) {
      const h = Math.floor(n / 100);
      const rest = n % 100;
      return (h ? ones[h] + ' Hundred' + (rest ? ' ' : '') : '') + (rest ? twoDigits(rest) : '');
    }
    const crore = Math.floor(num / 10000000);
    num %= 10000000;
    const lakh = Math.floor(num / 100000);
    num %= 100000;
    const thousand = Math.floor(num / 1000);
    num %= 1000;
    const hundred = num;

    let result = '';
    if (crore) result += twoDigits(crore) + ' Crore ';
    if (lakh) result += twoDigits(lakh) + ' Lakh ';
    if (thousand) result += twoDigits(thousand) + ' Thousand ';
    if (hundred) result += threeDigits(hundred) + ' ';
    return result.trim();
  }

  /* ── Toast ────────────────────────────────────────────────────────────── */

  function toast({ type = 'info', title, subtitle }) {
    const region = document.getElementById('toast-region');
    if (!region) return;
    const el = document.createElement('div');
    el.className = 'toast';
    const icons = {
      success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
      danger:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>',
      info:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>',
    };
    el.innerHTML = `<span class="toast__icon toast__icon--${type}">${icons[type]}</span><div class="toast__body"><p class="toast__title">${title}</p>${subtitle ? `<p class="toast__subtitle">${subtitle}</p>` : ''}</div><button class="toast__close"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg></button>`;
    region.appendChild(el);
    const close = () => { el.classList.add('toast--leave'); setTimeout(() => el.remove(), 220); };
    el.querySelector('.toast__close').addEventListener('click', close);
    setTimeout(close, 3500);
  }

  /* ── Bootstrap ────────────────────────────────────────────────────────── */

  function init() {
    readPrefill();
    setStep(0);

    document.getElementById('step-next').addEventListener('click', () => {
      if (!validateStep()) return;
      setStep(state.step + 1);
    });
    document.getElementById('step-back').addEventListener('click', () => {
      setStep(Math.max(0, state.step - 1));
    });
    document.getElementById('step-generate').addEventListener('click', () => {
      runGenerate();
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && state.step === 5) location.href = './';
    });

    setTimeout(() => {
      document.body.classList.remove('is-loading');
      document.body.classList.add('is-loaded');
    }, 100);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
