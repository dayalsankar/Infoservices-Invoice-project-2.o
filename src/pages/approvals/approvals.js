/* ═══════════════════════════════════════════════════════════════════════
 *  APPROVAL MANAGEMENT — main state + logic
 *  Governance hub: invoice / setup / change-request approvals
 *  Cross-screen sync via localStorage 'info-platform-state'
 * ════════════════════════════════════════════════════════════════════ */

// ── Lookups ───────────────────────────────────────────────────────────
const COMPANIES = {
  'CO-001': { id: 'CO-001', name: 'INFO Services LLP', gstin: '36AABCI1234X1Z5', state: 'Telangana' },
  'CO-002': { id: 'CO-002', name: 'INFO Consulting Pvt Ltd', gstin: '29AABCI5678Y1Z3', state: 'Karnataka' },
  'CO-003': { id: 'CO-003', name: 'INFO Services Inc', state: 'Texas, US' },
};
const CLIENTS = {
  'CL-001': { id: 'CL-001', name: 'Accenture India Pvt Ltd', state: 'Maharashtra', tax: 'IGST', gstin: '27AABCA1234X1Z5' },
  'CL-002': { id: 'CL-002', name: 'TCS Limited', state: 'Maharashtra', tax: 'CGST+SGST', gstin: '27AAACT1234X1Z5' },
  'CL-003': { id: 'CL-003', name: 'Infosys BPM', state: 'Karnataka', tax: 'SEZ-LUT', gstin: '29AAACI1234X1Z5' },
  'CL-004': { id: 'CL-004', name: 'Cognizant Technology', state: 'Tamil Nadu', tax: 'IGST', gstin: '33AAACC1234X1Z5' },
  'CL-005': { id: 'CL-005', name: 'Wipro Technologies', state: 'Karnataka', tax: 'CGST+SGST', gstin: '29AAACW1234X1Z5' },
};
const CONSULTANTS = {
  'CS-001': { id: 'CS-001', name: 'Rahul Verma', billing: 'Hourly', rate: 2500, currency: 'INR' },
  'CS-002': { id: 'CS-002', name: 'Anita Krishnan', billing: 'Daily', rate: 12000, currency: 'INR' },
  'CS-003': { id: 'CS-003', name: 'Deepak Mehta', billing: 'Daily', rate: 14000, currency: 'INR' },
  'CS-004': { id: 'CS-004', name: 'Kiran Nair', billing: 'Hourly', rate: 65, currency: 'USD' },
  'CS-005': { id: 'CS-005', name: 'Sneha Pillai', billing: 'Hourly', rate: 2400, currency: 'INR' },
};

const USD_RATE = 83.25;

// ── 18 Approval items ─────────────────────────────────────────────────
const APPROVALS = [
  // ─── INVOICE APPROVALS (3) — High priority ───
  {
    id: 'APV-001', ref: 'INV-2401', type: 'invoice', priority: 'high', status: 'pending',
    title: 'Accenture India · Jun W1 2026',
    subtitle: '40 hrs × ₹2,500 · IGST 18%',
    submittedBy: 'Priya Sharma', submittedRole: 'Finance Admin',
    submittedAt: '2026-05-30 09:45',
    daysAgo: '2 days ago',
    amount: 118000, amountUSD: 1416,
    clientId: 'CL-001', companyId: 'CO-001', consultantId: 'CS-001',
    period: 'Jun W1 2026', taxType: 'IGST 18%', hsn: '998314',
    units: '40 hrs', rate: '₹2,500/hr', subtotal: 100000, tax: 18000, total: 118000,
    slaHours: 48, slaUsed: 30,
    sourceTimesheet: 'TS-2406-001',
    compliance: { gstin: true, tax: true, hsn: true, period: true, amount: true, reverseCharge: false },
  },
  {
    id: 'APV-002', ref: 'INV-2402', type: 'invoice', priority: 'high', status: 'pending',
    title: 'TCS Limited · Jun 2026 Monthly',
    subtitle: '22 days × ₹12,000 · CGST+SGST',
    submittedBy: 'Priya Sharma', submittedRole: 'Finance Admin',
    submittedAt: '2026-06-01 11:30',
    daysAgo: 'Today',
    amount: 311520, amountUSD: 3742,
    clientId: 'CL-002', companyId: 'CO-002', consultantId: 'CS-002',
    period: 'Jun 2026 Monthly', taxType: 'CGST 9% + SGST 9%', hsn: '998314',
    units: '22 days', rate: '₹12,000/day', subtotal: 264000, tax: 47520, total: 311520,
    slaHours: 48, slaUsed: 6,
    sourceTimesheet: 'TS-2406-002',
    compliance: { gstin: true, tax: true, hsn: true, period: true, amount: true },
  },
  {
    id: 'APV-003', ref: 'INV-2403', type: 'invoice', priority: 'high', status: 'pending',
    title: 'Infosys BPM · Jun W2 2026',
    subtitle: '38 hrs × $85 · SEZ-LUT Zero-rated',
    submittedBy: 'Priya Sharma', submittedRole: 'Finance Admin',
    submittedAt: '2026-05-18 14:20',
    daysAgo: '14 days ago',
    amount: 269170, amountUSD: 3233,
    clientId: 'CL-003', companyId: 'CO-002', consultantId: 'CS-005',
    period: 'Jun W2 2026', taxType: 'SEZ-LUT (0%)', hsn: '998313',
    units: '38 hrs', rate: '$85/hr', subtotal: 269170, tax: 0, total: 269170,
    slaHours: 48, slaUsed: 96,
    sourceTimesheet: 'TS-2406-003',
    compliance: { gstin: true, tax: true, hsn: true, period: true, amount: true },
    slaBreached: true,
  },

  // ─── SETUP APPROVALS — Assignments (3) ───
  {
    id: 'APV-004', ref: 'ASGN-2026-014', type: 'setup', subType: 'assignment', priority: 'normal', status: 'pending',
    title: 'New Assignment — Cognizant Tech',
    subtitle: 'Rahul Verma · Hourly ₹2,500/hr · Mar–Dec 2026',
    submittedBy: 'HR Admin', submittedRole: 'HR Admin',
    submittedAt: '2026-05-29 10:00',
    daysAgo: '3 days ago',
    amount: null,
    details: {
      Client: 'Cognizant Technology', Consultant: 'Rahul Verma',
      Billing: 'Hourly · ₹2,500/hr', Period: 'Mar 2026 – Dec 2026',
      'HSN Code': '998314', 'Tax Type': 'IGST 18%',
      'SOW/PO': 'PO-CG-2026-05 (uploaded)',
    },
    docs: [{ name: 'PO-CG-2026-05.pdf' }, { name: 'SOW-CG-2026-01.pdf' }],
    slaHours: 72, slaUsed: 50,
  },
  {
    id: 'APV-005', ref: 'ASGN-2026-015', type: 'setup', subType: 'assignment', priority: 'normal', status: 'pending',
    title: 'New Assignment — Tech Mahindra',
    subtitle: 'Deepak Mehta · Daily ₹14,000/day · Jul–Dec 2026',
    submittedBy: 'HR Admin', submittedRole: 'HR Admin',
    submittedAt: '2026-05-30 16:15',
    daysAgo: '2 days ago',
    amount: null,
    details: {
      Client: 'Tech Mahindra', Consultant: 'Deepak Mehta',
      Billing: 'Daily · ₹14,000/day', Period: 'Jul 2026 – Dec 2026',
      'HSN Code': '998313', 'Tax Type': 'CGST+SGST',
      'SOW/PO': 'PO-TM-2026-08 (uploaded)',
    },
    docs: [{ name: 'PO-TM-2026-08.pdf' }],
    slaHours: 72, slaUsed: 30,
  },
  {
    id: 'APV-006', ref: 'ASGN-2026-016', type: 'setup', subType: 'assignment', priority: 'normal', status: 'pending',
    title: 'New Assignment — Wipro Tech',
    subtitle: 'Sneha Pillai · Hourly ₹2,400/hr · Apr–Sep 2026',
    submittedBy: 'HR Admin', submittedRole: 'HR Admin',
    submittedAt: '2026-05-31 09:00',
    daysAgo: '1 day ago',
    amount: null,
    details: {
      Client: 'Wipro Technologies', Consultant: 'Sneha Pillai',
      Billing: 'Hourly · ₹2,400/hr', Period: 'Apr 2026 – Sep 2026',
      'HSN Code': '998314', 'Tax Type': 'CGST+SGST',
      'SOW/PO': 'PO-WP-2026-12 (uploaded)',
    },
    docs: [{ name: 'PO-WP-2026-12.pdf' }],
    slaHours: 72, slaUsed: 12,
  },

  // ─── SETUP — Clients (2) ───
  {
    id: 'APV-007', ref: 'CLIENT-2026-019', type: 'setup', subType: 'client', priority: 'normal', status: 'pending',
    title: 'New Client — Mphasis Limited',
    subtitle: 'Bengaluru · CGST+SGST · Net 60 days',
    submittedBy: 'HR Admin', submittedRole: 'HR Admin',
    submittedAt: '2026-05-28 13:00',
    daysAgo: '4 days ago',
    amount: null,
    details: {
      Company: 'INFO Consulting Pvt Ltd', GSTIN: '29AABCM1234X1Z5',
      Location: 'Bengaluru, Karnataka', 'Tax Type': 'CGST+SGST',
      'Payment Terms': 'Net 60', SEZ: 'No',
    },
    slaHours: 72, slaUsed: 60,
  },
  {
    id: 'APV-008', ref: 'CLIENT-2026-020', type: 'setup', subType: 'client', priority: 'normal', status: 'pending',
    title: 'New Client — Persistent Systems',
    subtitle: 'Pune · CGST+SGST · Net 45 days',
    submittedBy: 'HR Admin', submittedRole: 'HR Admin',
    submittedAt: '2026-05-30 11:00',
    daysAgo: '2 days ago',
    amount: null,
    details: {
      Company: 'INFO Services LLP', GSTIN: '27AABCP9876Y2Z4',
      Location: 'Pune, Maharashtra', 'Tax Type': 'CGST+SGST',
      'Payment Terms': 'Net 45', SEZ: 'No',
    },
    slaHours: 72, slaUsed: 24,
  },

  // ─── SETUP — Consultants (2) ───
  {
    id: 'APV-009', ref: 'CONS-2026-035', type: 'setup', subType: 'consultant', priority: 'normal', status: 'pending',
    title: 'New Consultant — Arjun Singh',
    subtitle: 'Daily billing · ₹13,000/day · Mgr: Priya Sharma',
    submittedBy: 'HR Admin', submittedRole: 'HR Admin',
    submittedAt: '2026-05-31 14:00',
    daysAgo: '1 day ago',
    amount: null,
    details: {
      Email: 'arjun.s@info.com', Billing: 'Daily · ₹13,000/day',
      Currency: 'INR', Frequency: 'Monthly',
      Manager: 'Priya Sharma', 'Start Date': '01 Jul 2026',
    },
    slaHours: 72, slaUsed: 12,
  },
  {
    id: 'APV-010', ref: 'CONS-2026-036', type: 'setup', subType: 'consultant', priority: 'normal', status: 'pending',
    title: 'New Consultant — Neha Verma',
    subtitle: 'Hourly billing · ₹2,200/hr · Mgr: Rajesh Kumar',
    submittedBy: 'HR Admin', submittedRole: 'HR Admin',
    submittedAt: '2026-05-30 09:00',
    daysAgo: '2 days ago',
    amount: null,
    details: {
      Email: 'neha.v@info.com', Billing: 'Hourly · ₹2,200/hr',
      Currency: 'INR', Frequency: 'Weekly',
      Manager: 'Rajesh Kumar', 'Start Date': '15 Jul 2026',
    },
    slaHours: 72, slaUsed: 36,
  },

  // ─── SETUP — Company (1) ───
  {
    id: 'APV-011', ref: 'COMPANY-2026-005', type: 'setup', subType: 'company', priority: 'low', status: 'pending',
    title: 'New Company — INFO Services Singapore',
    subtitle: 'Singapore · SGD billing · GST exempt',
    submittedBy: 'Super Admin', submittedRole: 'Super Admin',
    submittedAt: '2026-05-27 17:00',
    daysAgo: '5 days ago',
    amount: null,
    details: {
      'Legal Name': 'INFO Services Pte Ltd',
      'Country': 'Singapore', 'Tax ID': 'UEN-SG-2026-005',
      'Currency': 'SGD', 'GST': 'Exempt',
      'Registered Office': '1 Raffles Place, Singapore',
    },
    slaHours: 72, slaUsed: 72,
    slaBreached: true,
  },

  // ─── CHANGE REQUESTS (4) ───
  {
    id: 'APV-012', ref: 'CR-2026-008', type: 'change', subType: 'rate', priority: 'normal', status: 'pending',
    title: 'Rate Change — Anita Krishnan',
    subtitle: '₹12,000/day → ₹14,000/day (+16.7%)',
    submittedBy: 'HR Admin', submittedRole: 'HR Admin',
    submittedAt: '2026-05-26 10:00',
    daysAgo: '6 days ago',
    amount: 2000,
    consultantId: 'CS-002', clientId: 'CL-002',
    change: { from: '₹12,000/day', to: '₹14,000/day', delta: '+₹2,000 (+16.7%)', effective: '01 Jul 2026' },
    impact: {
      'Effective Date': '01 Jul 2026', 'Assignment': 'TCS — Data Engineering',
      'Client Impacted': 'TCS Limited', 'Remaining days': '62 days',
      'Additional cost': '₹1,24,000', 'Client notification': 'Required',
    },
    justification: 'Annual rate revision per market benchmarking and performance review.',
    slaHours: 72, slaUsed: 48,
  },
  {
    id: 'APV-013', ref: 'CR-2026-009', type: 'change', subType: 'rate', priority: 'normal', status: 'pending',
    title: 'Rate Change — Kiran Nair',
    subtitle: '$65/hr → $75/hr (+15.4%)',
    submittedBy: 'HR Admin', submittedRole: 'HR Admin',
    submittedAt: '2026-05-27 12:00',
    daysAgo: '5 days ago',
    amount: 10,
    consultantId: 'CS-004',
    change: { from: '$65/hr', to: '$75/hr', delta: '+$10 (+15.4%)', effective: '01 Jul 2026' },
    impact: {
      'Effective Date': '01 Jul 2026', 'Assignment': 'Infosys — AI Solutions',
      'Client Impacted': 'Infosys BPM', 'Remaining hours': '480 hrs',
      'Additional cost': '$4,800 (₹3,99,600)', 'Client notification': 'Required',
    },
    justification: 'Skills upgrade certification — Cloud Architecture (AWS Pro).',
    slaHours: 72, slaUsed: 40,
  },
  {
    id: 'APV-014', ref: 'CR-2026-010', type: 'change', subType: 'extension', priority: 'normal', status: 'pending',
    title: 'Contract Extension — Wipro QA',
    subtitle: 'Kiran Nair · End 30 Jun → 31 Dec 2026 (+6 mo)',
    submittedBy: 'HR Admin', submittedRole: 'HR Admin',
    submittedAt: '2026-05-30 09:30',
    daysAgo: '2 days ago',
    amount: null,
    change: { from: '30 Jun 2026', to: '31 Dec 2026', delta: '+6 months', effective: '01 Jul 2026' },
    impact: {
      'Rate': 'Unchanged · $65/hr', 'New PO': 'Yes (upload pending)',
      'SOW Amendment': 'Attached (v2)', 'Client notification': 'Sent',
    },
    justification: 'Phase 2 of QA Automation roadmap approved by client.',
    docs: [{ name: 'SOW-WP-v2.pdf' }],
    slaHours: 72, slaUsed: 28,
  },
  {
    id: 'APV-015', ref: 'CR-2026-011', type: 'change', subType: 'tax', priority: 'high', status: 'pending',
    title: 'Tax Override — Cognizant INV-2406',
    subtitle: 'IGST 18% → CGST+SGST · Reg office moved',
    submittedBy: 'Priya Sharma', submittedRole: 'Finance Admin',
    submittedAt: '2026-05-31 10:00',
    daysAgo: '1 day ago',
    amount: null,
    change: { from: 'IGST 18%', to: 'CGST 9% + SGST 9%', delta: 'Intra-state', effective: 'INV-2406' },
    impact: {
      'Affected Invoice': 'INV-2406', 'Tax Recalculation': 'Required',
      'Audit Trail': 'Will be logged', 'GST Filing': 'Updated period',
    },
    justification: 'Client registered office recently moved to Karnataka. Tax type updated to reflect new registration.',
    docs: [{ name: 'GST_Update_Letter.pdf' }],
    slaHours: 48, slaUsed: 18,
  },

  // ─── DOCUMENT APPROVALS (3) — Low priority ───
  {
    id: 'APV-016', ref: 'DOC-2026-012', type: 'document', priority: 'low', status: 'pending',
    title: 'SOW Update — Infosys BPM',
    subtitle: 'Updated SOW v2 for AI Solutions · Valid Dec 2026',
    submittedBy: 'HR Admin', submittedRole: 'HR Admin',
    submittedAt: '2026-05-30 14:00',
    daysAgo: '2 days ago',
    amount: null,
    details: {
      'Document Type': 'SOW Amendment',
      'Client': 'Infosys BPM', 'Project': 'AI Solutions',
      'Version': 'v2', 'Valid Until': 'Dec 2026',
    },
    docs: [{ name: 'SOW-IB-AI-v2.pdf' }],
    slaHours: 96, slaUsed: 36,
  },
  {
    id: 'APV-017', ref: 'DOC-2026-013', type: 'document', priority: 'low', status: 'pending',
    title: 'PO Renewal — TCS Limited',
    subtitle: 'PO-TCS-2026-Q3 · Data Engineering',
    submittedBy: 'HR Admin', submittedRole: 'HR Admin',
    submittedAt: '2026-05-29 11:00',
    daysAgo: '3 days ago',
    amount: null,
    details: {
      'Document Type': 'Purchase Order Renewal',
      'Client': 'TCS Limited', 'Project': 'Data Engineering',
      'PO Number': 'PO-TCS-2026-Q3', 'Valid Until': 'Sep 2026',
    },
    docs: [{ name: 'PO-TCS-2026-Q3.pdf' }],
    slaHours: 96, slaUsed: 48,
  },
  {
    id: 'APV-018', ref: 'DOC-2026-014', type: 'document', priority: 'low', status: 'pending',
    title: 'NDA Update — HCL Technologies',
    subtitle: 'Revised mutual NDA · 3-yr term',
    submittedBy: 'HR Admin', submittedRole: 'HR Admin',
    submittedAt: '2026-05-30 16:00',
    daysAgo: '2 days ago',
    amount: null,
    details: {
      'Document Type': 'Non-Disclosure Agreement',
      'Client': 'HCL Technologies', 'Term': '3 years',
      'Valid From': '01 Jul 2026', 'Mutual': 'Yes',
    },
    docs: [{ name: 'NDA-HCL-2026.pdf' }],
    slaHours: 96, slaUsed: 24,
  },
];

// ── Historical: approved + rejected ───────────────────────────────────
const APPROVED_HISTORY = [
  { ref: 'INV-2400', type: 'invoice', desc: 'Cognizant Technology · Mar 2026', amount: 94400, by: 'Rajesh Kumar', date: '2026-06-01 09:15', group: 'today' },
  { ref: 'ASGN-2026-013', type: 'setup', desc: 'HCL Methods · Sneha Pillai', amount: null, by: 'Rajesh Kumar', date: '2026-06-01 11:30', group: 'today' },
  { ref: 'INV-2399', type: 'invoice', desc: 'Wipro · Q1 Sprint Delivery', amount: 162000, by: 'Rajesh Kumar', date: '2026-05-28 14:00', group: 'week' },
  { ref: 'CR-2026-007', type: 'change', desc: 'Rate Change — Deepak Mehta', amount: null, by: 'Rajesh Kumar', date: '2026-05-27 10:30', group: 'week' },
  { ref: 'CLIENT-2026-018', type: 'setup', desc: 'Tech Mahindra · New Client', amount: null, by: 'Rajesh Kumar', date: '2026-05-26 16:00', group: 'week' },
  { ref: 'INV-2397', type: 'invoice', desc: 'Accenture · May W4 2026', amount: 89400, by: 'Rajesh Kumar', date: '2026-05-25 11:00', group: 'month' },
  { ref: 'INV-2396', type: 'invoice', desc: 'TCS · May Monthly', amount: 264000, by: 'Rajesh Kumar', date: '2026-05-22 09:30', group: 'month' },
  { ref: 'CONS-2026-034', type: 'setup', desc: 'New Consultant · Vikram Joshi', amount: null, by: 'Rajesh Kumar', date: '2026-05-20 14:00', group: 'month' },
];

const REJECTED_HISTORY = [
  { ref: 'INV-2398', type: 'invoice', desc: 'HCL Technologies · May 2026', amount: 89400, by: 'Rajesh Kumar', date: '2026-05-23 14:00', reason: 'Tax type incorrect — should be IGST (inter-state)', group: 'week' },
  { ref: 'ASGN-2026-012', type: 'setup', desc: 'Mphasis · New Assignment', amount: null, by: 'Rajesh Kumar', date: '2026-05-20 11:00', reason: 'Incomplete documentation — PO not attached', group: 'month' },
  { ref: 'CR-2026-006', type: 'change', desc: 'Rate Change — Vivek Sharma', amount: null, by: 'Rajesh Kumar', date: '2026-05-18 09:00', reason: 'Rate increase exceeds policy threshold (>20%)', group: 'month' },
];

// ── Activity feed events ─────────────────────────────────────────────
const ACTIVITY = [
  { when: '2026-06-01 09:15', type: 'approved', dot: 'success', msg: 'INV-2400 Approved', meta: 'by Rajesh Kumar · ₹94,400', group: 'today', unread: true },
  { when: '2026-06-01 11:30', type: 'approved', dot: 'royal', msg: 'ASGN-2026-013 Activated', meta: 'HCL Methods · Sneha Pillai', group: 'today', unread: true },
  { when: '2026-05-31 16:00', type: 'submitted', dot: 'warning', msg: 'INV-2402 submitted for approval', meta: 'by Priya Sharma · ₹3,11,520', group: 'today' },
  { when: '2026-05-28 14:00', type: 'approved', dot: 'success', msg: 'INV-2399 Approved', meta: 'by Rajesh Kumar · ₹1,62,000', group: 'week' },
  { when: '2026-05-27 10:30', type: 'approved', dot: 'azure', msg: 'CR-2026-007 Rate Change Approved', meta: 'Deepak Mehta', group: 'week' },
  { when: '2026-05-26 16:00', type: 'approved', dot: 'royal', msg: 'CLIENT-2026-018 Activated', meta: 'Tech Mahindra', group: 'week' },
  { when: '2026-05-23 14:00', type: 'rejected', dot: 'danger', msg: 'INV-2398 Rejected', meta: 'by Rajesh Kumar · "Tax type incorrect"', linkText: 'Resubmit →', group: 'week' },
];

// ── State ─────────────────────────────────────────────────────────────
const state = {
  activeTab: 'all',
  setupSubtab: 'all',
  changeSubtab: 'all',
  selectedIds: new Set(),
  searchQuery: '',
  sortBy: 'date',
  filters: { type: 'all', priority: 'all', requester: 'all', dateFrom: '', dateTo: '' },
  notes: {},     // by approval id
};

// ── Formatters ────────────────────────────────────────────────────────
const fmtINR = (n) => '₹' + n.toLocaleString('en-IN');
const fmtINRShort = (n) => {
  if (n >= 10000000) return '₹' + (n / 10000000).toFixed(2).replace(/\.?0+$/, '') + ' Cr';
  if (n >= 100000) return '₹' + (n / 100000).toFixed(2).replace(/\.?0+$/, '') + ' L';
  return '₹' + n.toLocaleString('en-IN');
};
const fmtUSD = (n) => '$' + n.toLocaleString('en-US', { maximumFractionDigits: 2 });

// ═══════════════════════════════════════════════════════════════════════
//  TAB RENDERING
// ═══════════════════════════════════════════════════════════════════════

function renderPanel() {
  const panel = document.getElementById('apv-panel');
  panel.innerHTML = '';

  const subfilter = document.getElementById('apv-subfilter');
  subfilter.hidden = !['setup', 'change'].includes(state.activeTab);

  switch (state.activeTab) {
    case 'all':      return renderAllApprovals(panel);
    case 'invoice':  return renderInvoiceApprovals(panel);
    case 'setup':    renderSetupSubfilter(); return renderSetupApprovals(panel);
    case 'change':   renderChangeSubfilter(); return renderChangeRequests(panel);
    case 'approved': return renderApprovedHistory(panel);
    case 'rejected': return renderRejectedHistory(panel);
  }
}

// ── ALL APPROVALS — table-style ──────────────────────────────────────
function renderAllApprovals(panel) {
  let items = APPROVALS.filter(a => a.status === 'pending');
  items = applyFilters(applySort(applySearch(items)));
  if (!items.length) return panel.appendChild(makeEmpty('all'));

  const list = document.createElement('div');
  list.className = 'apv-rowlist';
  list.innerHTML = `
    <div class="apv-rowlist__head" role="row">
      <span><input type="checkbox" class="apv-row__check" id="apv-select-all" aria-label="Select all" /></span><span></span><span>Type</span><span>Reference</span>
      <span>Description</span><span>Submitted By</span><span>Date</span>
      <span style="text-align:right">Amount</span><span style="text-align:right">Actions</span>
    </div>
  `;
  items.forEach(it => list.appendChild(makeRow(it)));
  panel.appendChild(list);
}

function makeRow(it) {
  const row = document.createElement('div');
  row.className = 'apv-row';
  row.dataset.id = it.id;
  row.dataset.priority = it.priority;
  row.dataset.status = it.status;

  const checked = state.selectedIds.has(it.id) ? 'checked' : '';
  if (state.selectedIds.has(it.id)) row.classList.add('is-selected');

  row.innerHTML = `
    <input type="checkbox" class="apv-row__check" data-id="${it.id}" ${checked} aria-label="Select ${it.ref}" />
    <span class="apv-row__priority"><span class="apv-row__priority-dot apv-row__priority-dot--${it.priority}"></span></span>
    <span class="apv-row__type-pill apv-pill--${it.type}">${typeLabel(it.type)}</span>
    <span class="apv-row__ref">${it.ref}</span>
    <div class="apv-row__desc">
      <p class="apv-row__desc-title">${it.title}</p>
      <p class="apv-row__desc-sub">${it.subtitle}</p>
    </div>
    <div class="apv-row__by">
      <p class="apv-row__by-name">${it.submittedBy}</p>
      <p class="apv-row__by-when">${it.daysAgo}</p>
    </div>
    <span class="apv-row__by-when">${it.submittedAt.split(' ')[0]}</span>
    <span class="apv-row__amount ${it.amount === null ? 'apv-row__amount--muted' : ''}">${it.amount === null ? '—' : fmtINRShort(it.amount)}</span>
    <div class="apv-row__actions">
      <button class="btn btn--sm btn--success" data-action="approve" data-id="${it.id}"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M20 6 9 17l-5-5"/></svg> Approve</button>
      <button class="btn btn--sm btn--danger" data-action="reject" data-id="${it.id}"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg> Reject</button>
      <button class="btn btn--sm btn--ghost" data-action="view" data-id="${it.id}">View</button>
    </div>
  `;
  return row;
}

function typeLabel(t) {
  return { invoice: 'Invoice Approval', setup: 'Setup Approval', change: 'Change Request', document: 'Document Approval' }[t] || t;
}

// ── INVOICE APPROVALS tab — Section A (rich cards) + B (history) ─────
function renderInvoiceApprovals(panel) {
  const pending = APPROVALS.filter(a => a.type === 'invoice' && a.status === 'pending');

  // Section A — Pending rich cards
  const sectionA = document.createElement('section');
  sectionA.className = 'apv-section';
  sectionA.innerHTML = `
    <div class="apv-section__head">
      <h3 class="apv-section__title">Pending Invoice Approvals <span class="apv-section__title-count">${pending.length}</span></h3>
      ${pending.length > 1 ? `<button class="btn btn--success btn--sm" id="approve-all-invoices"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M20 6 9 17l-5-5"/></svg> Approve All ${pending.length}</button>` : ''}
    </div>
    <div class="apv-cards" id="invoice-cards"></div>
  `;
  panel.appendChild(sectionA);
  const cards = sectionA.querySelector('#invoice-cards');
  if (!pending.length) cards.appendChild(makeEmpty('invoice'));
  pending.forEach(it => cards.appendChild(makeInvoiceCard(it)));

  // Section B — Recently processed
  const recent = [...APPROVED_HISTORY.filter(h => h.type === 'invoice'), ...REJECTED_HISTORY.filter(h => h.type === 'invoice')]
    .sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);

  const sectionB = document.createElement('section');
  sectionB.className = 'apv-section';
  sectionB.innerHTML = `
    <div class="apv-section__head">
      <h3 class="apv-section__title">Recently Processed <span class="apv-section__title-count">${recent.length}</span></h3>
      <a class="apv-card__link" href="#" data-tab-link="approved">View All History →</a>
    </div>
    <div class="apv-hist" id="recent-hist"></div>
  `;
  panel.appendChild(sectionB);
  const histList = sectionB.querySelector('#recent-hist');
  recent.forEach(h => {
    const row = document.createElement('div');
    row.className = 'apv-hist__row';
    const approved = h.reason ? false : true;
    row.innerHTML = `
      <span class="apv-hist__ref">${h.ref}</span>
      <span class="apv-row__type-pill apv-pill--${h.type}">${typeLabel(h.type)}</span>
      <span>${h.desc}</span>
      <span class="apv-row__amount">${h.amount === null ? '—' : fmtINRShort(h.amount)}</span>
      <div>
        <p class="apv-hist__by-name">${h.by}</p>
        <p class="apv-hist__by-when">${h.date.split(' ')[0]}</p>
      </div>
      <span class="apv-hist__result apv-hist__result--${approved ? 'approved' : 'rejected'}">${approved ? '✓ Approved' : '✗ Rejected'}</span>
      <button class="btn btn--sm btn--ghost">View</button>
      ${h.reason ? `<p class="apv-hist__reason">✗ ${h.reason}</p>` : ''}
    `;
    histList.appendChild(row);
  });
}

function makeInvoiceCard(it) {
  const card = document.createElement('article');
  card.className = 'apv-card';
  card.dataset.id = it.id;
  card.dataset.priority = it.priority;

  const clientName = CLIENTS[it.clientId]?.name || it.title.split('·')[0].trim();
  const consultantName = CONSULTANTS[it.consultantId]?.name || '—';
  const allCompliant = Object.values(it.compliance || {}).every(v => v === true || v === false);
  const failCount = Object.values(it.compliance || {}).filter(v => v === false).length;

  card.innerHTML = `
    <div class="apv-card__head">
      <div class="apv-card__pills">
        <span class="apv-card__priority"><span class="apv-card__priority-dot apv-card__priority-dot--${it.priority}"></span>${it.priority.toUpperCase()}</span>
        <span class="apv-row__type-pill apv-pill--invoice">Invoice Approval</span>
      </div>
      <span class="apv-card__when">${it.daysAgo}</span>
    </div>
    <div class="apv-card__title-row">
      <div>
        <h4 class="apv-card__ref">${it.ref}</h4>
        <p class="apv-card__subtitle">${clientName}</p>
      </div>
      <div class="apv-card__amount">
        <p class="apv-card__amount-inr">${fmtINR(it.amount)}</p>
        ${it.amountUSD ? `<p class="apv-card__amount-usd">${fmtUSD(it.amountUSD)}</p>` : ''}
      </div>
    </div>
    <div class="apv-card__grid">
      <div class="apv-card__grid-cell">
        <p class="apv-card__grid-label">Period</p>
        <p class="apv-card__grid-value">${it.period}</p>
      </div>
      <div class="apv-card__grid-cell">
        <p class="apv-card__grid-label">Consultant</p>
        <p class="apv-card__grid-value">${consultantName}</p>
      </div>
      <div class="apv-card__grid-cell">
        <p class="apv-card__grid-label">Tax Type</p>
        <p class="apv-card__grid-value">${it.taxType}</p>
      </div>
    </div>
    <div class="apv-compliance ${failCount ? 'apv-compliance--fail' : ''}">
      <p class="apv-compliance__label">Compliance:</p>
      <div class="apv-compliance__items">
        <span class="apv-compliance__item ${!it.compliance.gstin ? 'apv-compliance__item--fail' : ''}">GSTIN</span>
        <span class="apv-compliance__item ${!it.compliance.tax ? 'apv-compliance__item--fail' : ''}">Tax</span>
        <span class="apv-compliance__item ${!it.compliance.hsn ? 'apv-compliance__item--fail' : ''}">HSN</span>
        <span class="apv-compliance__item ${!it.compliance.period ? 'apv-compliance__item--fail' : ''}">Period</span>
      </div>
    </div>
    <p class="apv-card__by">Submitted by <strong>${it.submittedBy}</strong> · ${it.submittedRole}</p>
    <a class="apv-card__link" href="../invoices/?id=${it.ref}">View Invoice →</a>
    <div class="apv-card__footer">
      <button class="btn btn--ghost btn--danger-text" data-action="reject" data-id="${it.id}">✗ Reject</button>
      <button class="btn btn--primary" data-action="approve" data-id="${it.id}">✓ Approve Invoice</button>
    </div>
  `;
  return card;
}

// ── SETUP APPROVALS tab ──────────────────────────────────────────────
function renderSetupSubfilter() {
  const wrap = document.getElementById('apv-subfilter-chips');
  const setupItems = APPROVALS.filter(a => a.type === 'setup' && a.status === 'pending');
  const counts = {
    all: setupItems.length,
    company: setupItems.filter(i => i.subType === 'company').length,
    client: setupItems.filter(i => i.subType === 'client').length,
    consultant: setupItems.filter(i => i.subType === 'consultant').length,
    assignment: setupItems.filter(i => i.subType === 'assignment').length,
  };
  const subs = [
    { id: 'all', label: 'All' }, { id: 'company', label: 'Companies' },
    { id: 'client', label: 'Clients' }, { id: 'consultant', label: 'Consultants' },
    { id: 'assignment', label: 'Assignments' },
  ];
  wrap.innerHTML = subs.map(s => `
    <button class="apv-subfilter__chip ${state.setupSubtab === s.id ? 'is-active' : ''}" data-setup-sub="${s.id}">
      ${s.label}<span class="apv-subfilter__chip-count">${counts[s.id]}</span>
    </button>
  `).join('');
}

function renderSetupApprovals(panel) {
  let items = APPROVALS.filter(a => a.type === 'setup' && a.status === 'pending');
  if (state.setupSubtab !== 'all') items = items.filter(i => i.subType === state.setupSubtab);
  items = applyFilters(applySort(applySearch(items)));

  if (!items.length) return panel.appendChild(makeEmpty('setup'));

  const cards = document.createElement('div');
  cards.className = 'apv-cards';
  items.forEach(it => cards.appendChild(makeSetupCard(it)));
  panel.appendChild(cards);
}

function makeSetupCard(it) {
  const card = document.createElement('article');
  card.className = 'apv-card';
  card.dataset.id = it.id;
  card.dataset.priority = it.priority;

  const grid = Object.entries(it.details || {}).map(([k, v]) => `
    <div class="apv-card__grid-cell">
      <p class="apv-card__grid-label">${k}</p>
      <p class="apv-card__grid-value">${v}</p>
    </div>
  `).join('');

  const docs = (it.docs || []).map(d => `
    <div class="apv-card__doc">
      <svg class="apv-card__doc-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>
      <span class="apv-card__doc-name">${d.name}</span>
      <div class="apv-card__doc-actions">
        <button class="apv-card__doc-btn">View</button>
        <button class="apv-card__doc-btn">Download</button>
      </div>
    </div>
  `).join('');

  const subTypeLabel = { assignment: 'New Assignment Request', client: 'New Client Registration', consultant: 'New Consultant Onboarding', company: 'New Company Registration' }[it.subType];
  const activateLabel = { assignment: '✓ Activate Assignment', client: '✓ Activate Client', consultant: '✓ Activate Consultant', company: '✓ Activate Company' }[it.subType];

  card.innerHTML = `
    <div class="apv-card__head">
      <div class="apv-card__pills">
        <span class="apv-card__priority"><span class="apv-card__priority-dot apv-card__priority-dot--${it.priority}"></span>${it.priority.toUpperCase()}</span>
        <span class="apv-row__type-pill apv-pill--setup">Setup Approval</span>
      </div>
      <span class="apv-card__when">${it.daysAgo}</span>
    </div>
    <div>
      <h4 class="apv-card__ref">${it.ref}</h4>
      <p class="apv-card__subtitle"><strong style="color:var(--brand-navy)">${subTypeLabel}</strong> — ${it.title.replace(/^New[\w\s—-]+ — /, '')}</p>
    </div>
    <div class="apv-card__grid apv-card__grid--2">${grid}</div>
    ${docs ? `<div class="apv-card__docs">${docs}</div>` : ''}
    <p class="apv-card__by">Submitted by <strong>${it.submittedBy}</strong> · ${it.submittedAt.split(' ')[0]}</p>
    <a class="apv-card__link" href="../master-data/?id=${it.ref}">View in Master Data →</a>
    <div class="apv-card__footer">
      <button class="btn btn--ghost btn--danger-text" data-action="reject" data-id="${it.id}">✗ Reject</button>
      <button class="btn btn--primary" data-action="approve" data-id="${it.id}">${activateLabel}</button>
    </div>
  `;
  return card;
}

// ── CHANGE REQUESTS tab ──────────────────────────────────────────────
function renderChangeSubfilter() {
  const wrap = document.getElementById('apv-subfilter-chips');
  const items = APPROVALS.filter(a => a.type === 'change' && a.status === 'pending');
  const counts = {
    all: items.length,
    rate: items.filter(i => i.subType === 'rate').length,
    extension: items.filter(i => i.subType === 'extension').length,
    tax: items.filter(i => i.subType === 'tax').length,
  };
  const subs = [
    { id: 'all', label: 'All' }, { id: 'rate', label: 'Rate Changes' },
    { id: 'extension', label: 'Contract Extensions' }, { id: 'tax', label: 'Tax Overrides' },
  ];
  wrap.innerHTML = subs.map(s => `
    <button class="apv-subfilter__chip ${state.changeSubtab === s.id ? 'is-active' : ''}" data-change-sub="${s.id}">
      ${s.label}<span class="apv-subfilter__chip-count">${counts[s.id]}</span>
    </button>
  `).join('');
}

function renderChangeRequests(panel) {
  let items = APPROVALS.filter(a => a.type === 'change' && a.status === 'pending');
  if (state.changeSubtab !== 'all') items = items.filter(i => i.subType === state.changeSubtab);
  items = applyFilters(applySort(applySearch(items)));

  if (!items.length) return panel.appendChild(makeEmpty('change'));

  const cards = document.createElement('div');
  cards.className = 'apv-cards';
  items.forEach(it => cards.appendChild(makeChangeCard(it)));
  panel.appendChild(cards);
}

function makeChangeCard(it) {
  const card = document.createElement('article');
  card.className = 'apv-card';
  card.dataset.id = it.id;
  card.dataset.priority = it.priority;

  const impact = Object.entries(it.impact || {}).map(([k, v]) => `
    <div class="apv-impact__row">
      <span class="apv-impact__row-label">${k}</span>
      <span class="apv-impact__row-val">${v}</span>
    </div>
  `).join('');

  const subTypeLabel = {
    rate: 'Billing Rate Change',
    extension: 'Assignment Extension',
    tax: 'Tax Override Request',
  }[it.subType];

  const isTax = it.subType === 'tax';
  const approveLabel = {
    rate: '✓ Approve Rate Change',
    extension: '✓ Approve Extension',
    tax: '✓ Approve Override',
  }[it.subType];
  const rejectLabel = {
    rate: '✗ Reject Rate Change',
    extension: '✗ Reject Extension',
    tax: '✗ Reject Override',
  }[it.subType];

  card.innerHTML = `
    <div class="apv-card__head">
      <div class="apv-card__pills">
        <span class="apv-card__priority"><span class="apv-card__priority-dot apv-card__priority-dot--${it.priority}"></span>${it.priority.toUpperCase()}</span>
        <span class="apv-row__type-pill apv-pill--change">Change Request</span>
      </div>
      <span class="apv-card__when">${it.daysAgo}</span>
    </div>
    <div>
      <h4 class="apv-card__ref">${it.ref}</h4>
      <p class="apv-card__subtitle"><strong style="color:var(--brand-navy)">${subTypeLabel}</strong> — ${it.title.split('—')[1] || it.title}</p>
    </div>
    <div class="apv-compare">
      <div class="apv-compare__side">
        <p class="apv-compare__label">Current</p>
        <p class="apv-compare__value">${it.change.from}</p>
      </div>
      <span class="apv-compare__arrow">→</span>
      <div class="apv-compare__side">
        <p class="apv-compare__label">Proposed</p>
        <p class="apv-compare__value">${it.change.to}</p>
        <span class="apv-compare__delta">${it.change.delta}</span>
      </div>
    </div>
    <div class="apv-impact">
      <p class="apv-impact__title">${isTax ? 'Override Details' : 'Financial Impact Analysis'}</p>
      <div class="apv-impact__list">${impact}</div>
    </div>
    ${it.justification ? `<p class="apv-justify">"${it.justification}"</p>` : ''}
    ${isTax ? `<p class="apv-warn">⚠ This action will be logged in audit trail</p>` : ''}
    ${it.docs ? `<div class="apv-card__docs">${it.docs.map(d => `<div class="apv-card__doc"><svg class="apv-card__doc-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg><span class="apv-card__doc-name">${d.name}</span><div class="apv-card__doc-actions"><button class="apv-card__doc-btn">View</button></div></div>`).join('')}</div>` : ''}
    <div style="display:flex;gap:14px">
      ${it.consultantId ? `<a class="apv-card__link" href="../master-data/?tab=consultants&id=${it.consultantId}">View Consultant →</a>` : ''}
      ${it.subType === 'extension' || it.subType === 'rate' ? `<a class="apv-card__link" href="../master-data/?tab=assignments">View Assignment →</a>` : ''}
      ${isTax ? `<a class="apv-card__link" href="../invoices/?id=INV-2406">View Invoice →</a>` : ''}
    </div>
    <div class="apv-card__footer">
      <button class="btn btn--ghost btn--danger-text" data-action="reject" data-id="${it.id}">${rejectLabel}</button>
      <button class="btn btn--primary" data-action="approve" data-id="${it.id}">${approveLabel}</button>
    </div>
  `;
  return card;
}

// ── APPROVED HISTORY tab ─────────────────────────────────────────────
function renderApprovedHistory(panel) {
  const groups = {
    today: { label: 'Today', items: APPROVED_HISTORY.filter(h => h.group === 'today') },
    week: { label: 'This Week', items: APPROVED_HISTORY.filter(h => h.group === 'week') },
    month: { label: 'This Month', items: APPROVED_HISTORY.filter(h => h.group === 'month') },
  };

  Object.values(groups).forEach(g => {
    if (!g.items.length) return;
    const grp = document.createElement('section');
    grp.className = 'apv-group';
    grp.innerHTML = `
      <div class="apv-group__head">
        <h3 class="apv-group__title">${g.label}</h3>
        <span class="apv-group__count">${g.items.length}</span>
        <span class="apv-group__line"></span>
      </div>
      <div class="apv-hist"></div>
    `;
    const list = grp.querySelector('.apv-hist');
    g.items.forEach(h => {
      const row = document.createElement('div');
      row.className = 'apv-hist__row';
      row.innerHTML = `
        <span class="apv-hist__ref">${h.ref}</span>
        <span class="apv-row__type-pill apv-pill--${h.type}">${typeLabel(h.type)}</span>
        <span>${h.desc}</span>
        <span class="apv-row__amount">${h.amount === null ? '—' : fmtINRShort(h.amount)}</span>
        <div>
          <p class="apv-hist__by-name">${h.by}</p>
          <p class="apv-hist__by-when">${h.date}</p>
        </div>
        <span class="apv-hist__result apv-hist__result--approved">✓ Approved</span>
        <div style="display:flex;gap:6px">
          <button class="btn btn--sm btn--ghost">View</button>
          <button class="btn btn--sm btn--ghost">PDF</button>
        </div>
      `;
      list.appendChild(row);
    });
    panel.appendChild(grp);
  });

  const exportBar = document.createElement('div');
  exportBar.style.cssText = 'display:flex;justify-content:flex-end;padding-top:8px';
  exportBar.innerHTML = `<button class="btn btn--ghost">Export Approval Log →</button>`;
  panel.appendChild(exportBar);
}

// ── REJECTED HISTORY tab ─────────────────────────────────────────────
function renderRejectedHistory(panel) {
  const groups = {
    week: { label: 'This Week', items: REJECTED_HISTORY.filter(h => h.group === 'week') },
    month: { label: 'This Month', items: REJECTED_HISTORY.filter(h => h.group === 'month') },
  };

  Object.values(groups).forEach(g => {
    if (!g.items.length) return;
    const grp = document.createElement('section');
    grp.className = 'apv-group';
    grp.innerHTML = `
      <div class="apv-group__head">
        <h3 class="apv-group__title">${g.label}</h3>
        <span class="apv-group__count">${g.items.length}</span>
        <span class="apv-group__line"></span>
      </div>
      <div class="apv-hist"></div>
    `;
    const list = grp.querySelector('.apv-hist');
    g.items.forEach(h => {
      const row = document.createElement('div');
      row.className = 'apv-hist__row';
      row.innerHTML = `
        <span class="apv-hist__ref">${h.ref}</span>
        <span class="apv-row__type-pill apv-pill--${h.type}">${typeLabel(h.type)}</span>
        <span>${h.desc}</span>
        <span class="apv-row__amount">${h.amount === null ? '—' : fmtINRShort(h.amount)}</span>
        <div>
          <p class="apv-hist__by-name">${h.by}</p>
          <p class="apv-hist__by-when">${h.date}</p>
        </div>
        <span class="apv-hist__result apv-hist__result--rejected">✗ Rejected</span>
        <div style="display:flex;gap:6px">
          <button class="btn btn--sm btn--ghost">View</button>
          <button class="btn btn--sm btn--primary">Resubmit →</button>
        </div>
        <p class="apv-hist__reason">✗ Rejected: ${h.reason}</p>
      `;
      list.appendChild(row);
    });
    panel.appendChild(grp);
  });
}

// ── Empty states ──────────────────────────────────────────────────────
function makeEmpty(kind) {
  const empty = document.createElement('div');
  empty.className = 'apv-empty';
  const variants = {
    all: { icon: 'success', heading: 'All caught up!', sub: 'No items are waiting for approval', svg: '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>' },
    invoice: { icon: 'azure', heading: 'No invoices pending approval', sub: 'Approved invoices will appear in history', svg: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M9 12l2 2 4-4"/>' },
    setup: { icon: 'navy', heading: 'No setup requests pending', sub: 'New entity requests will appear here', svg: '<path d="M3 21h18"/><path d="M5 21V7l8-4 8 4v14"/>' },
    change: { icon: 'royal', heading: 'No change requests pending', sub: 'Rate changes and modifications will appear here', svg: '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4z"/>' },
  };
  const v = variants[kind] || variants.all;
  empty.innerHTML = `
    <div class="apv-empty__icon apv-empty__icon--${v.icon}">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">${v.svg}</svg>
    </div>
    <h3 class="apv-empty__heading">${v.heading}</h3>
    <p class="apv-empty__sub">${v.sub}</p>
  `;
  return empty;
}

// ═══════════════════════════════════════════════════════════════════════
//  DRAWER — 5 sections
// ═══════════════════════════════════════════════════════════════════════
function openDrawer(id) {
  const it = APPROVALS.find(a => a.id === id);
  if (!it) return;

  const inner = document.getElementById('drawer-inner');
  const slaPct = Math.min(100, (it.slaUsed / it.slaHours) * 100);
  const slaStatus = slaPct >= 100 ? 'danger' : slaPct >= 75 ? 'warning' : 'success';
  const slaLabel = slaPct >= 100 ? 'SLA BREACHED' : slaPct >= 75 ? 'At Risk' : 'On Track';
  const slaRemaining = Math.max(0, it.slaHours - it.slaUsed);

  inner.innerHTML = `
    <header class="apv-d-head">
      <div>
        <h2 class="apv-d-head__ref">${it.ref}</h2>
        <div class="apv-d-head__pills">
          <span class="apv-row__type-pill apv-pill--${it.type}">${typeLabel(it.type)}</span>
          <span class="apv-priority-pill apv-priority-pill--${it.priority}">${it.priority.toUpperCase()}</span>
          <span class="apv-status-pill apv-status-pill--${it.status}">${it.status.toUpperCase()}</span>
        </div>
      </div>
      <div class="apv-d-head__actions">
        <button class="apv-d-head__more" aria-label="More options"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg></button>
        <button class="apv-d-head__close" id="drawer-close" aria-label="Close">×</button>
      </div>
    </header>

    <div class="apv-d-body">
      <!-- Section 1 — Approval Summary -->
      <section class="apv-d-section">
        <h3 class="apv-d-section__title">Approval Summary</h3>
        <div class="apv-d-grid">
          <div class="apv-d-grid-cell"><span class="apv-d-grid-label">Reference</span><span class="apv-d-grid-val">${it.ref}</span></div>
          <div class="apv-d-grid-cell"><span class="apv-d-grid-label">Type</span><span class="apv-d-grid-val">${typeLabel(it.type)}</span></div>
          <div class="apv-d-grid-cell"><span class="apv-d-grid-label">Priority</span><span class="apv-d-grid-val">${it.priority.charAt(0).toUpperCase() + it.priority.slice(1)}</span></div>
          <div class="apv-d-grid-cell"><span class="apv-d-grid-label">Submitted By</span><span class="apv-d-grid-val">${it.submittedBy}<br><span style="font-size:11px;color:var(--text-secondary)">${it.submittedRole}</span></span></div>
          <div class="apv-d-grid-cell"><span class="apv-d-grid-label">Submitted On</span><span class="apv-d-grid-val">${it.submittedAt}</span></div>
          <div class="apv-d-grid-cell"><span class="apv-d-grid-label">SLA Status</span><span class="apv-d-grid-val" style="color:var(--${slaStatus === 'success' ? 'success' : slaStatus === 'warning' ? 'warning' : 'danger'})">${slaLabel}</span></div>
        </div>
        <div class="apv-sla">
          <div class="apv-sla__bar-wrap">
            <div class="apv-sla__bar">
              <div class="apv-sla__bar-fill apv-sla__bar-fill--${slaStatus}" style="width:${slaPct}%"></div>
            </div>
            <div class="apv-sla__legend">
              <span><strong>${it.slaUsed} hrs</strong> used</span>
              <span><strong>${slaRemaining} hrs</strong> remaining</span>
            </div>
          </div>
          <div class="apv-sla__ring">
            <svg width="56" height="56" viewBox="0 0 56 56">
              <circle class="apv-sla__ring-bg" cx="28" cy="28" r="24" stroke-width="5" fill="none"/>
              <circle class="apv-sla__ring-fill apv-sla__ring-fill--${slaStatus}" cx="28" cy="28" r="24" stroke-width="5" fill="none"
                stroke-dasharray="${2 * Math.PI * 24}"
                stroke-dashoffset="${2 * Math.PI * 24 * (1 - slaPct / 100)}"
                stroke-linecap="round"/>
            </svg>
            <div class="apv-sla__ring-text">${Math.round(slaPct)}%</div>
          </div>
        </div>
      </section>

      <!-- Section 2 — Item Details -->
      <section class="apv-d-section">
        <h3 class="apv-d-section__title">Item Details</h3>
        ${renderDrawerDetails(it)}
      </section>

      <!-- Section 3 — Approval Chain -->
      <section class="apv-d-section">
        <h3 class="apv-d-section__title">Approval Chain</h3>
        <div class="apv-chain">
          <div class="apv-chain__step is-done">
            <div class="apv-chain__avatar">${initials(it.submittedBy)}</div>
            <div class="apv-chain__info">
              <p class="apv-chain__level">Level 1 · ${it.submittedRole}</p>
              <p class="apv-chain__name">${it.submittedBy}</p>
              <p class="apv-chain__status">Submitted ✓ · ${it.submittedAt.split(' ')[0]}</p>
            </div>
          </div>
          <div class="apv-chain__step is-current">
            <div class="apv-chain__avatar">RK</div>
            <div class="apv-chain__info">
              <p class="apv-chain__level">Level 2 · Signing Authority</p>
              <p class="apv-chain__name">Rajesh Kumar</p>
              <p class="apv-chain__status">⏳ Pending · ${slaRemaining}h to SLA</p>
            </div>
          </div>
          <div class="apv-chain__step">
            <div class="apv-chain__avatar">📧</div>
            <div class="apv-chain__info">
              <p class="apv-chain__level">Level 3 · Notification</p>
              <p class="apv-chain__name">Auto-notification</p>
              <p class="apv-chain__status">Waiting · Triggers after L2</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Section 4 — Timeline -->
      <section class="apv-d-section">
        <h3 class="apv-d-section__title">Approval Timeline</h3>
        <div class="apv-timeline">
          <div class="apv-tl__item">
            <span class="apv-tl__when">${it.submittedAt.split(' ')[0]}<br>${it.submittedAt.split(' ')[1] || ''}</span>
            <div class="apv-tl__body">
              <p class="apv-tl__msg"><span class="apv-tl__msg-icon">📄</span> ${it.ref} created by ${it.submittedBy}</p>
            </div>
          </div>
          <div class="apv-tl__item">
            <span class="apv-tl__when">${it.submittedAt.split(' ')[0]}</span>
            <div class="apv-tl__body">
              <p class="apv-tl__msg"><span class="apv-tl__msg-icon">📤</span> Submitted for approval by ${it.submittedBy}</p>
              <p class="apv-tl__quote">"Submitted after verifying all required data"</p>
            </div>
          </div>
          <div class="apv-tl__item">
            <span class="apv-tl__when">${it.submittedAt.split(' ')[0]}</span>
            <div class="apv-tl__body">
              <p class="apv-tl__msg"><span class="apv-tl__msg-icon">🔔</span> Approval notification sent to Rajesh Kumar</p>
            </div>
          </div>
          <div class="apv-tl__item">
            <span class="apv-tl__when">Now</span>
            <div class="apv-tl__body">
              <p class="apv-tl__msg apv-tl__msg-icon--warning"><span class="apv-tl__msg-icon apv-tl__msg-icon--warning">⏳</span> Awaiting approval action…</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Section 5 — Internal Notes -->
      <section class="apv-d-section">
        <h3 class="apv-d-section__title">Internal Notes</h3>
        <div class="apv-notes" id="apv-notes-list">${renderNotes(it.id)}</div>
        <div class="apv-notes__input">
          <textarea id="apv-note-input" placeholder="Add a note visible only to Finance Admin and Signing Authority…"></textarea>
        </div>
        <button class="btn btn--ghost btn--sm" id="apv-note-post" style="margin-top:8px">Post Note</button>
      </section>
    </div>

    ${renderDrawerFooter(it)}
  `;

  document.getElementById('drawer-overlay').hidden = false;
  const drawer = document.getElementById('apv-drawer');
  drawer.setAttribute('aria-hidden', 'false');
  requestAnimationFrame(() => drawer.classList.add('is-open'));

  // Drawer event wiring
  inner.querySelector('#drawer-close')?.addEventListener('click', closeDrawer);
  inner.querySelector('[data-d-action="approve"]')?.addEventListener('click', () => { closeDrawer(); openApproveModal(it.id); });
  inner.querySelector('[data-d-action="reject"]')?.addEventListener('click', () => { closeDrawer(); openRejectModal(it.id); });
  inner.querySelector('#apv-note-post')?.addEventListener('click', () => {
    const ta = inner.querySelector('#apv-note-input');
    const text = ta.value.trim();
    if (!text) return;
    if (!state.notes[it.id]) state.notes[it.id] = [];
    state.notes[it.id].push({ by: 'Rajesh Kumar', when: 'Just now', text });
    inner.querySelector('#apv-notes-list').innerHTML = renderNotes(it.id);
    ta.value = '';
    toast({ type: 'success', title: 'Note posted', subtitle: 'Visible to authorized roles only' });
  });
}

function renderNotes(id) {
  const notes = state.notes[id] || [
    { by: 'Priya Sharma', when: '10 Jun · 09:46 AM', text: 'Please note this is for Q2 sprint delivery. Client has confirmed receipt of services.' },
  ];
  return notes.map(n => `
    <div class="apv-note">
      <div class="apv-note__head">
        <span class="apv-note__by">${n.by}</span>
        <span class="apv-note__when">${n.when}</span>
      </div>
      <p class="apv-note__body">${n.text}</p>
    </div>
  `).join('');
}

function renderDrawerDetails(it) {
  if (it.type === 'invoice') {
    const client = CLIENTS[it.clientId];
    return `
      <div class="apv-d-grid">
        <div class="apv-d-grid-cell"><span class="apv-d-grid-label">Client</span><span class="apv-d-grid-val">${client?.name || '—'}</span></div>
        <div class="apv-d-grid-cell"><span class="apv-d-grid-label">Consultant</span><span class="apv-d-grid-val">${CONSULTANTS[it.consultantId]?.name || '—'}</span></div>
        <div class="apv-d-grid-cell"><span class="apv-d-grid-label">Period</span><span class="apv-d-grid-val">${it.period}</span></div>
        <div class="apv-d-grid-cell"><span class="apv-d-grid-label">Units</span><span class="apv-d-grid-val">${it.units}</span></div>
        <div class="apv-d-grid-cell"><span class="apv-d-grid-label">Rate</span><span class="apv-d-grid-val">${it.rate}</span></div>
        <div class="apv-d-grid-cell"><span class="apv-d-grid-label">Tax Type</span><span class="apv-d-grid-val">${it.taxType}</span></div>
        <div class="apv-d-grid-cell"><span class="apv-d-grid-label">HSN/SAC</span><span class="apv-d-grid-val">${it.hsn}</span></div>
        <div class="apv-d-grid-cell"><span class="apv-d-grid-label">Total</span><span class="apv-d-grid-val" style="color:var(--brand-royal);font-weight:700">${fmtINR(it.total)}</span></div>
      </div>
      <div style="margin-top:14px">
        <p class="apv-m-section-title">Compliance Checklist</p>
        <div class="apv-m-checks">
          <div class="apv-m-check">GSTIN validated (client + company)</div>
          <div class="apv-m-check">Tax type matches client config</div>
          <div class="apv-m-check">HSN/SAC code present</div>
          <div class="apv-m-check">Invoice date within filing period</div>
          <div class="apv-m-check">Amount matches timesheet calculation</div>
        </div>
      </div>
      <div style="margin-top:14px;display:flex;gap:14px">
        <a class="apv-card__link" href="../invoices/?id=${it.ref}">View Full Invoice →</a>
        <a class="apv-card__link" href="../timesheets/?id=${it.sourceTimesheet}">View Source Timesheet →</a>
      </div>
    `;
  }
  if (it.type === 'setup') {
    const grid = Object.entries(it.details || {}).map(([k, v]) => `
      <div class="apv-d-grid-cell"><span class="apv-d-grid-label">${k}</span><span class="apv-d-grid-val">${v}</span></div>
    `).join('');
    return `<div class="apv-d-grid">${grid}</div>` +
      (it.docs ? `<div style="margin-top:14px">${it.docs.map(d => `<div class="apv-card__doc"><svg class="apv-card__doc-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg><span class="apv-card__doc-name">${d.name}</span><div class="apv-card__doc-actions"><button class="apv-card__doc-btn">View</button><button class="apv-card__doc-btn">Download</button></div></div>`).join('')}</div>` : '');
  }
  if (it.type === 'change') {
    const impact = Object.entries(it.impact || {}).map(([k, v]) => `
      <div class="apv-impact__row"><span class="apv-impact__row-label">${k}</span><span class="apv-impact__row-val">${v}</span></div>
    `).join('');
    return `
      <div class="apv-compare" style="margin-bottom:14px">
        <div class="apv-compare__side">
          <p class="apv-compare__label">Current</p>
          <p class="apv-compare__value">${it.change.from}</p>
        </div>
        <span class="apv-compare__arrow">→</span>
        <div class="apv-compare__side">
          <p class="apv-compare__label">Proposed</p>
          <p class="apv-compare__value">${it.change.to}</p>
          <span class="apv-compare__delta">${it.change.delta}</span>
        </div>
      </div>
      <div class="apv-impact" style="margin-bottom:14px">
        <p class="apv-impact__title">Impact Analysis</p>
        <div class="apv-impact__list">${impact}</div>
      </div>
      ${it.justification ? `<p class="apv-justify">"${it.justification}"</p>` : ''}
    `;
  }
  if (it.type === 'document') {
    const grid = Object.entries(it.details || {}).map(([k, v]) => `
      <div class="apv-d-grid-cell"><span class="apv-d-grid-label">${k}</span><span class="apv-d-grid-val">${v}</span></div>
    `).join('');
    return `<div class="apv-d-grid">${grid}</div>` +
      (it.docs ? `<div style="margin-top:14px">${it.docs.map(d => `<div class="apv-card__doc"><svg class="apv-card__doc-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg><span class="apv-card__doc-name">${d.name}</span><div class="apv-card__doc-actions"><button class="apv-card__doc-btn">View</button></div></div>`).join('')}</div>` : '');
  }
  return '';
}

function renderDrawerFooter(it) {
  if (it.status === 'pending') {
    return `
      <footer class="apv-d-foot">
        <button class="btn btn--ghost btn--danger-text" data-d-action="reject">✗ Reject</button>
        <button class="btn btn--primary" data-d-action="approve">✓ Approve</button>
      </footer>
    `;
  }
  if (it.status === 'approved') {
    return `
      <footer class="apv-d-foot">
        <button class="btn btn--ghost">Download Approval PDF</button>
        <button class="btn btn--primary">View Source →</button>
      </footer>
    `;
  }
  return `
    <footer class="apv-d-foot">
      <button class="btn btn--ghost">View Rejection Reason</button>
      <button class="btn btn--ghost">Escalate to Super Admin</button>
    </footer>
  `;
}

function initials(name) {
  return name.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase();
}

function closeDrawer() {
  const d = document.getElementById('apv-drawer');
  d.classList.remove('is-open');
  d.setAttribute('aria-hidden', 'true');
  setTimeout(() => { document.getElementById('drawer-overlay').hidden = true; }, 350);
}

// ═══════════════════════════════════════════════════════════════════════
//  MODAL FLOWS — approve / reject / bulk
// ═══════════════════════════════════════════════════════════════════════
function openModal(html, opts = {}) {
  const inner = document.getElementById('modal-inner');
  inner.innerHTML = html;
  document.getElementById('modal-overlay').hidden = false;
  const m = document.getElementById('apv-modal');
  m.classList.toggle('apv-modal--lg', !!opts.large);
  m.setAttribute('aria-hidden', 'false');
  requestAnimationFrame(() => m.classList.add('is-open'));
  inner.querySelector('[data-modal-close]')?.addEventListener('click', closeModal);
}

function closeModal() {
  const m = document.getElementById('apv-modal');
  m.classList.remove('is-open');
  m.setAttribute('aria-hidden', 'true');
  setTimeout(() => { document.getElementById('modal-overlay').hidden = true; }, 200);
}

// ── APPROVE INVOICE FLOW ──────────────────────────────────────────────
function openApproveModal(id) {
  const it = APPROVALS.find(a => a.id === id);
  if (!it) return;

  if (it.type === 'invoice') return openApproveInvoice(it);
  if (it.type === 'setup') return openApproveSetup(it);
  if (it.type === 'change') return openApproveChange(it);
  if (it.type === 'document') return openApproveDocument(it);
}

function openApproveInvoice(it) {
  openModal(`
    <header class="apv-m-head">
      <h2 class="apv-m-title" id="modal-title">Approve Invoice</h2>
      <button class="apv-m-close" data-modal-close>×</button>
    </header>
    <div class="apv-m-body">
      <div class="apv-m-summary">
        <div>
          <p class="apv-m-summary__title">${it.ref} · ${CLIENTS[it.clientId]?.name || ''}</p>
          <p class="apv-m-summary__sub">${it.period} · ${it.taxType}</p>
        </div>
        <p class="apv-m-summary__amt">${fmtINR(it.amount)}</p>
      </div>
      <p class="apv-m-section-title">Compliance Verification</p>
      <div class="apv-m-checks">
        <div class="apv-m-check">GSTIN verified (both parties)</div>
        <div class="apv-m-check">Tax calculation verified (${it.taxType})</div>
        <div class="apv-m-check">Amount matches timesheet (${it.units} × ${it.rate})</div>
        <div class="apv-m-check">HSN code present (${it.hsn})</div>
        <div class="apv-m-check">Period valid (${it.period})</div>
        <div class="apv-m-check">Invoice date within current period</div>
      </div>
      <p class="apv-m-sig">Your approval constitutes a digital authorization. This action will be permanently logged with your identity, timestamp, and IP address.</p>
      <p class="apv-m-section-title">Post-Approval Options</p>
      <div class="apv-m-options">
        <label class="apv-m-option"><input type="checkbox" checked /> Notify Finance Admin of approval</label>
        <label class="apv-m-option"><input type="checkbox" /> Notify client (send invoice immediately)</label>
        <label class="apv-m-option"><input type="checkbox" checked /> Set payment due date reminder</label>
      </div>
    </div>
    <footer class="apv-m-foot">
      <button class="btn btn--ghost" data-modal-close>Cancel</button>
      <button class="btn btn--primary" id="confirm-approve">✓ Confirm Approval</button>
    </footer>
  `);
  document.getElementById('confirm-approve').addEventListener('click', () => runApproveProgress(it));
}

function openApproveSetup(it) {
  const labels = {
    assignment: { title: 'Activate Assignment?', sub: 'Make this engagement live in the platform' },
    client: { title: 'Activate Client?', sub: 'Enable invoicing for this client' },
    consultant: { title: 'Activate Consultant?', sub: 'Enable timesheet submission for this consultant' },
    company: { title: 'Register Company?', sub: 'Activate this billing entity' },
  };
  const lbl = labels[it.subType] || labels.assignment;
  const detailLines = Object.entries(it.details || {}).slice(0, 4).map(([k, v]) =>
    `<div class="apv-impact__row"><span class="apv-impact__row-label">${k}</span><span class="apv-impact__row-val">${v}</span></div>`
  ).join('');

  openModal(`
    <header class="apv-m-head">
      <h2 class="apv-m-title">${lbl.title}</h2>
      <button class="apv-m-close" data-modal-close>×</button>
    </header>
    <div class="apv-m-body">
      <div class="apv-m-summary">
        <div>
          <p class="apv-m-summary__title">${it.ref}</p>
          <p class="apv-m-summary__sub">${lbl.sub}</p>
        </div>
      </div>
      <div class="apv-impact" style="margin-bottom:14px">${detailLines}</div>
      <p class="apv-m-sig">Activating this ${it.subType} will:<br>• Make it available for use platform-wide<br>• Notify the requesting team<br>• Be logged in the audit trail</p>
      <div class="apv-m-options">
        <label class="apv-m-option"><input type="checkbox" checked /> Send activation notification to relevant team</label>
        <label class="apv-m-option"><input type="checkbox" checked /> Update Master Data immediately</label>
      </div>
    </div>
    <footer class="apv-m-foot">
      <button class="btn btn--ghost" data-modal-close>Cancel</button>
      <button class="btn btn--primary" id="confirm-approve">✓ ${lbl.title.replace('?', '')}</button>
    </footer>
  `);
  document.getElementById('confirm-approve').addEventListener('click', () => runApproveProgress(it));
}

function openApproveChange(it) {
  const labels = {
    rate: { title: 'Approve Rate Change?' },
    extension: { title: 'Approve Contract Extension?' },
    tax: { title: 'Approve Tax Override?' },
  };
  const lbl = labels[it.subType] || labels.rate;

  const impact = Object.entries(it.impact || {}).map(([k, v]) =>
    `<div class="apv-impact__row"><span class="apv-impact__row-label">${k}</span><span class="apv-impact__row-val">${v}</span></div>`
  ).join('');

  openModal(`
    <header class="apv-m-head">
      <h2 class="apv-m-title">${lbl.title}</h2>
      <button class="apv-m-close" data-modal-close>×</button>
    </header>
    <div class="apv-m-body">
      <div class="apv-m-summary">
        <div>
          <p class="apv-m-summary__title">${it.ref}</p>
          <p class="apv-m-summary__sub">${it.title}</p>
        </div>
      </div>
      <div class="apv-compare" style="margin-bottom:14px">
        <div class="apv-compare__side">
          <p class="apv-compare__label">Current</p>
          <p class="apv-compare__value">${it.change.from}</p>
        </div>
        <span class="apv-compare__arrow">→</span>
        <div class="apv-compare__side">
          <p class="apv-compare__label">Proposed</p>
          <p class="apv-compare__value">${it.change.to}</p>
          <span class="apv-compare__delta">${it.change.delta}</span>
        </div>
      </div>
      <div class="apv-impact" style="margin-bottom:12px">
        <p class="apv-impact__title">Impact</p>
        <div class="apv-impact__list">${impact}</div>
      </div>
      ${it.subType === 'tax' ? '<p class="apv-warn">⚠ Tax override will be logged in audit trail and may affect GST filing</p>' : ''}
      <div class="apv-m-options">
        <label class="apv-m-option"><input type="checkbox" checked /> Notify client of change</label>
        <label class="apv-m-option"><input type="checkbox" checked /> Notify consultant of approval</label>
      </div>
    </div>
    <footer class="apv-m-foot">
      <button class="btn btn--ghost" data-modal-close>Cancel</button>
      <button class="btn btn--primary" id="confirm-approve">✓ ${lbl.title.replace('?', '')}</button>
    </footer>
  `);
  document.getElementById('confirm-approve').addEventListener('click', () => runApproveProgress(it));
}

function openApproveDocument(it) {
  openModal(`
    <header class="apv-m-head">
      <h2 class="apv-m-title">Approve Document?</h2>
      <button class="apv-m-close" data-modal-close>×</button>
    </header>
    <div class="apv-m-body">
      <div class="apv-m-summary">
        <div>
          <p class="apv-m-summary__title">${it.ref}</p>
          <p class="apv-m-summary__sub">${it.title}</p>
        </div>
      </div>
      <p class="apv-m-sig">Your approval will mark this document as the official version for the linked engagement.</p>
    </div>
    <footer class="apv-m-foot">
      <button class="btn btn--ghost" data-modal-close>Cancel</button>
      <button class="btn btn--primary" id="confirm-approve">✓ Approve Document</button>
    </footer>
  `);
  document.getElementById('confirm-approve').addEventListener('click', () => runApproveProgress(it));
}

// ── Approval progress + commit ───────────────────────────────────────
function runApproveProgress(it) {
  const inner = document.getElementById('modal-inner');
  inner.innerHTML = `
    <header class="apv-m-head">
      <h2 class="apv-m-title">Processing approval…</h2>
    </header>
    <div class="apv-m-progress">
      <div class="apv-m-progress__item" data-step="1"><span class="apv-m-progress__check">○</span>Verifying compliance…</div>
      <div class="apv-m-progress__item" data-step="2"><span class="apv-m-progress__check">○</span>Locking record…</div>
      <div class="apv-m-progress__item" data-step="3"><span class="apv-m-progress__check">○</span>Recording digital approval…</div>
      <div class="apv-m-progress__item" data-step="4"><span class="apv-m-progress__check">○</span>Notifying stakeholders…</div>
      <div class="apv-m-progress__item" data-step="5"><span class="apv-m-progress__check">○</span>Updating audit trail…</div>
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
      setTimeout(tick, 180);
    } else {
      commitApprove(it);
    }
  };
  tick();
}

function commitApprove(it) {
  it.status = 'approved';
  it.approvedBy = 'Rajesh Kumar';
  it.approvedAt = '2026-06-01 ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  closeModal();

  // Activity prepend
  ACTIVITY.unshift({
    when: it.approvedAt, type: 'approved',
    dot: it.type === 'invoice' ? 'success' : it.type === 'setup' ? 'royal' : 'azure',
    msg: `${it.ref} ${it.type === 'setup' ? 'Activated' : 'Approved'}`,
    meta: `by Rajesh Kumar${it.amount ? ' · ' + fmtINRShort(it.amount) : ''}`,
    group: 'today', unread: true,
  });

  // Move to approved history
  APPROVED_HISTORY.unshift({
    ref: it.ref, type: it.type, desc: it.title, amount: it.amount,
    by: 'Rajesh Kumar', date: it.approvedAt, group: 'today',
  });

  renderPanel();
  updateCounts();
  renderActivity();
  syncCrossScreens();

  toast({
    type: 'success',
    title: `✓ ${it.ref} ${it.type === 'setup' ? 'Activated & Locked' : 'Approved & Locked'}`,
    subtitle: `${it.title} · ${it.amount ? fmtINR(it.amount) : 'No amount'}`,
    link: it.type === 'invoice' ? { text: 'View Invoice →', href: '../invoices/' } : null,
  });
}

// ── REJECT FLOW (unified) ─────────────────────────────────────────────
function openRejectModal(id) {
  const it = APPROVALS.find(a => a.id === id);
  if (!it) return;

  const chips = it.type === 'invoice' ? [
    'Tax type incorrect', 'Amount mismatch with timesheet', 'Wrong billing period',
    'Missing or invalid HSN code', 'Client details incorrect', 'GSTIN validation failed',
    'Timesheet discrepancy', 'Requires additional documentation',
  ] : it.type === 'setup' ? [
    'Incomplete documentation', 'Invalid GSTIN', 'Duplicate record',
    'Rate not approved', 'Missing PO/SOW',
  ] : [
    'Justification insufficient', 'Exceeds policy threshold', 'Client approval pending',
    'Documents not attached', 'Effective date in past',
  ];

  openModal(`
    <header class="apv-m-head">
      <h2 class="apv-m-title">Reject ${typeLabel(it.type)}</h2>
      <button class="apv-m-close" data-modal-close>×</button>
    </header>
    <div class="apv-m-body">
      <div class="apv-m-summary">
        <div>
          <p class="apv-m-summary__title">${it.ref}</p>
          <p class="apv-m-summary__sub">${it.title}</p>
        </div>
        ${it.amount ? `<p class="apv-m-summary__amt">${fmtINR(it.amount)}</p>` : ''}
      </div>
      <div class="apv-m-field">
        <label class="apv-m-field__label">Rejection reason <span class="req">*</span> <span style="font-weight:400;color:var(--text-secondary);font-size:11px">(min 20 chars)</span></label>
        <textarea id="reject-reason" placeholder="Provide a clear reason for rejection…"></textarea>
      </div>
      <p class="apv-m-section-title">Quick reasons</p>
      <div class="apv-m-chips" id="reject-chips">
        ${chips.map(c => `<button class="apv-m-chip" data-chip>${c}</button>`).join('')}
      </div>
      <div style="margin-top:14px">
        <p class="apv-m-section-title">Return to</p>
        <div class="apv-m-options">
          <label class="apv-m-option"><input type="radio" name="return" checked /> Original submitter for correction</label>
          ${it.type === 'invoice' ? '<label class="apv-m-option"><input type="radio" name="return" /> Regenerate from source timesheets</label>' : ''}
          ${it.type === 'invoice' ? '<label class="apv-m-option"><input type="radio" name="return" /> Void entirely</label>' : ''}
        </div>
      </div>
      <div style="margin-top:8px">
        <p class="apv-m-section-title">Notify</p>
        <div class="apv-m-options">
          <label class="apv-m-option"><input type="checkbox" checked /> Notify submitter immediately</label>
          <label class="apv-m-option"><input type="checkbox" /> Flag for urgent re-review</label>
        </div>
      </div>
    </div>
    <footer class="apv-m-foot">
      <button class="btn btn--ghost" data-modal-close>Cancel</button>
      <button class="btn btn--danger" id="confirm-reject">✗ Confirm Rejection</button>
    </footer>
  `);

  document.querySelectorAll('#reject-chips [data-chip]').forEach(chip => {
    chip.addEventListener('click', () => {
      chip.classList.toggle('is-active');
      const reasons = [...document.querySelectorAll('#reject-chips .is-active')].map(c => c.textContent.trim());
      const ta = document.getElementById('reject-reason');
      if (reasons.length) ta.value = reasons.join(' · ');
    });
  });

  document.getElementById('confirm-reject').addEventListener('click', () => {
    const reason = document.getElementById('reject-reason').value.trim();
    if (reason.length < 20) {
      toast({ type: 'warning', title: 'Reason too short', subtitle: 'Minimum 20 characters required' });
      return;
    }
    it.status = 'rejected';
    it.rejectedReason = reason;
    it.rejectedBy = 'Rajesh Kumar';
    REJECTED_HISTORY.unshift({
      ref: it.ref, type: it.type, desc: it.title, amount: it.amount,
      by: 'Rajesh Kumar', date: '2026-06-01 ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      reason, group: 'week',
    });
    ACTIVITY.unshift({
      when: 'Just now', type: 'rejected', dot: 'danger',
      msg: `${it.ref} Rejected`,
      meta: `by Rajesh Kumar · "${reason.slice(0, 40)}${reason.length > 40 ? '…' : ''}"`,
      group: 'today', unread: true, linkText: 'Resubmit →',
    });
    closeModal();
    renderPanel();
    updateCounts();
    renderActivity();
    syncCrossScreens();
    toast({ type: 'danger', title: `✗ ${it.ref} Rejected`, subtitle: 'Submitter notified · audit trail updated' });
  });
}

// ── BULK FLOWS ────────────────────────────────────────────────────────
function openBulkApproveModal() {
  const items = APPROVALS.filter(a => state.selectedIds.has(a.id));
  if (!items.length) return;
  const totalInv = items.filter(i => i.type === 'invoice').reduce((s, i) => s + (i.amount || 0), 0);
  openModal(`
    <header class="apv-m-head">
      <h2 class="apv-m-title">Approve ${items.length} item${items.length > 1 ? 's' : ''}?</h2>
      <button class="apv-m-close" data-modal-close>×</button>
    </header>
    <div class="apv-m-body">
      <p class="apv-m-section-title">Items in this batch</p>
      <div class="apv-m-bulk-list">
        ${items.map(i => `<div class="apv-m-bulk-list__item"><span>${i.ref}</span><span>${i.amount ? fmtINRShort(i.amount) : typeLabel(i.type)}</span></div>`).join('')}
      </div>
      ${totalInv ? `<div class="apv-m-summary"><p class="apv-m-summary__title">Total invoice value</p><p class="apv-m-summary__amt">${fmtINR(totalInv)}</p></div>` : ''}
      <p class="apv-m-sig">All items will be approved using the same digital authorization. Each approval is logged separately in the audit trail.</p>
      <div class="apv-m-options">
        <label class="apv-m-option"><input type="checkbox" checked /> Notify all relevant parties</label>
      </div>
    </div>
    <footer class="apv-m-foot">
      <button class="btn btn--ghost" data-modal-close>Cancel</button>
      <button class="btn btn--primary" id="confirm-bulk-approve">✓ Approve All ${items.length}</button>
    </footer>
  `, { large: true });
  document.getElementById('confirm-bulk-approve').addEventListener('click', () => runBulkApprove(items));
}

function runBulkApprove(items) {
  const inner = document.getElementById('modal-inner');
  inner.innerHTML = `
    <header class="apv-m-head"><h2 class="apv-m-title">Processing ${items.length} approvals…</h2></header>
    <div class="apv-m-progress">
      <div class="apv-m-progress__item is-active"><span class="apv-m-progress__check">⏳</span>Approving items…</div>
    </div>
    <div class="apv-m-bulk-list" id="bulk-progress" style="margin:14px 24px"></div>
  `;
  const progressList = document.getElementById('bulk-progress');
  let i = 0;
  const tick = () => {
    if (i >= items.length) {
      const total = items.filter(it => it.amount).reduce((s, it) => s + it.amount, 0);
      closeModal();
      renderPanel(); updateCounts(); renderActivity(); syncCrossScreens();
      toast({ type: 'success', title: `✓ ${items.length} items approved`, subtitle: total ? `Total value: ${fmtINR(total)}` : 'All items locked' });
      return;
    }
    const it = items[i];
    it.status = 'approved'; it.approvedBy = 'Rajesh Kumar';
    APPROVED_HISTORY.unshift({ ref: it.ref, type: it.type, desc: it.title, amount: it.amount, by: 'Rajesh Kumar', date: '2026-06-01', group: 'today' });
    ACTIVITY.unshift({ when: 'Just now', type: 'approved', dot: 'success', msg: `${it.ref} Approved`, meta: 'Bulk action', group: 'today', unread: true });
    progressList.innerHTML += `<div class="apv-m-bulk-list__item"><span>✓ ${it.ref}</span><span style="color:var(--success);font-weight:600">Approved</span></div>`;
    i++;
    setTimeout(tick, 120);
  };
  tick();
}

function openBulkRejectModal() {
  const items = APPROVALS.filter(a => state.selectedIds.has(a.id));
  if (!items.length) return;
  openModal(`
    <header class="apv-m-head">
      <h2 class="apv-m-title">Reject ${items.length} item${items.length > 1 ? 's' : ''}?</h2>
      <button class="apv-m-close" data-modal-close>×</button>
    </header>
    <div class="apv-m-body">
      <p class="apv-m-section-title">Items in this batch</p>
      <div class="apv-m-bulk-list">
        ${items.map(i => `<div class="apv-m-bulk-list__item"><span>${i.ref}</span><span>${typeLabel(i.type)}</span></div>`).join('')}
      </div>
      <div class="apv-m-field">
        <label class="apv-m-field__label">Single rejection reason <span class="req">*</span></label>
        <textarea id="bulk-reject-reason" placeholder="This reason will be applied to all selected items…"></textarea>
      </div>
      <div class="apv-m-options">
        <label class="apv-m-option"><input type="checkbox" checked /> Notify all submitters</label>
      </div>
    </div>
    <footer class="apv-m-foot">
      <button class="btn btn--ghost" data-modal-close>Cancel</button>
      <button class="btn btn--danger" id="confirm-bulk-reject">✗ Reject All ${items.length}</button>
    </footer>
  `, { large: true });
  document.getElementById('confirm-bulk-reject').addEventListener('click', () => {
    const reason = document.getElementById('bulk-reject-reason').value.trim();
    if (reason.length < 20) {
      toast({ type: 'warning', title: 'Reason too short', subtitle: 'Minimum 20 characters required' });
      return;
    }
    items.forEach(it => {
      it.status = 'rejected'; it.rejectedReason = reason; it.rejectedBy = 'Rajesh Kumar';
      REJECTED_HISTORY.unshift({ ref: it.ref, type: it.type, desc: it.title, amount: it.amount, by: 'Rajesh Kumar', date: '2026-06-01', reason, group: 'week' });
      ACTIVITY.unshift({ when: 'Just now', type: 'rejected', dot: 'danger', msg: `${it.ref} Rejected`, meta: 'Bulk action', group: 'today', unread: true });
    });
    closeModal();
    renderPanel(); updateCounts(); renderActivity(); syncCrossScreens();
    toast({ type: 'danger', title: `✗ ${items.length} items rejected`, subtitle: 'All submitters notified' });
  });
}

// ═══════════════════════════════════════════════════════════════════════
//  SETTINGS PANEL
// ═══════════════════════════════════════════════════════════════════════
function openSettings() {
  const inner = document.getElementById('settings-inner');
  inner.innerHTML = `
    <header class="apv-settings__head">
      <h2 class="apv-settings__title">Approval Configuration</h2>
      <button class="apv-d-head__close" id="settings-close">×</button>
    </header>
    <div class="apv-settings__body">
      <section class="apv-settings__section">
        <h3 class="apv-settings__section-title">Invoice Approval Workflow</h3>
        <p class="apv-settings__sub">Set the approval levels required for invoice sign-off.</p>
        <div class="apv-settings__row">
          <label><input type="checkbox" checked disabled /> Level 1 — Finance Admin Review</label>
          <span style="font-size:11px;color:var(--text-secondary)">Required</span>
        </div>
        <div class="apv-settings__row">
          <label><input type="checkbox" checked disabled /> Level 2 — Signing Authority</label>
          <select><option>Rajesh Kumar</option><option>Vikram Singh</option></select>
        </div>
        <div class="apv-settings__row">
          <label><input type="checkbox" /> Level 3 — Super Admin (above ₹)</label>
          <input type="number" value="500000" />
        </div>
      </section>

      <section class="apv-settings__section">
        <h3 class="apv-settings__section-title">SLA Configuration</h3>
        <div class="apv-settings__row"><label>Invoice approval SLA</label><input type="number" value="48" /></div>
        <p class="apv-settings__sub">Hours to approve before escalation</p>
        <div class="apv-settings__row"><label>Setup approval SLA</label><input type="number" value="72" /></div>
        <div class="apv-settings__row"><label>Escalate after</label><input type="number" value="24" /></div>
        <div class="apv-settings__row">
          <label>Escalate to</label>
          <select><option>Super Admin</option><option>CEO</option></select>
        </div>
        <p class="apv-settings__sub" style="margin-top:10px;font-weight:600;color:var(--brand-navy)">Auto-reminders</p>
        <div class="apv-settings__row"><label><input type="checkbox" checked /> At 50% SLA elapsed</label></div>
        <div class="apv-settings__row"><label><input type="checkbox" checked /> At 75% SLA elapsed</label></div>
        <div class="apv-settings__row"><label><input type="checkbox" checked /> Escalate at 90%</label></div>
      </section>

      <section class="apv-settings__section">
        <h3 class="apv-settings__section-title">Auto-Approval Rules</h3>
        <div class="apv-settings__soon">
          <span class="apv-settings__soon-badge">Coming Soon</span>
          <p style="margin:6px 0 0">Set rules to auto-approve low-risk items based on amount, client, or consultant.</p>
        </div>
      </section>

      <section class="apv-settings__section">
        <h3 class="apv-settings__section-title">Notification Preferences</h3>
        <p class="apv-settings__sub" style="font-weight:600;color:var(--brand-navy);margin-top:6px">Notify Finance Admin when:</p>
        <div class="apv-settings__row"><label><input type="checkbox" checked /> Invoice submitted for approval</label></div>
        <div class="apv-settings__row"><label><input type="checkbox" checked /> Approval overdue (SLA breach)</label></div>
        <div class="apv-settings__row"><label><input type="checkbox" checked /> Invoice rejected by signing authority</label></div>
        <p class="apv-settings__sub" style="font-weight:600;color:var(--brand-navy);margin-top:14px">Channels:</p>
        <div class="apv-settings__row"><label><input type="checkbox" checked /> In-app notifications</label></div>
        <div class="apv-settings__row"><label><input type="checkbox" checked /> Email notifications</label></div>
        <div class="apv-settings__row"><label><input type="checkbox" /> Slack/Teams integration</label></div>
      </section>
    </div>
    <footer class="apv-settings__foot">
      <button class="btn btn--ghost" id="settings-cancel">Cancel</button>
      <button class="btn btn--primary" id="settings-save">Save Settings</button>
    </footer>
  `;
  document.getElementById('settings-overlay').hidden = false;
  const s = document.getElementById('apv-settings');
  s.setAttribute('aria-hidden', 'false');
  requestAnimationFrame(() => s.classList.add('is-open'));
  document.getElementById('settings-close').addEventListener('click', closeSettings);
  document.getElementById('settings-cancel').addEventListener('click', closeSettings);
  document.getElementById('settings-save').addEventListener('click', () => {
    closeSettings();
    toast({ type: 'success', title: '✓ Settings saved', subtitle: 'Approval configuration updated' });
  });
}

function closeSettings() {
  const s = document.getElementById('apv-settings');
  s.classList.remove('is-open');
  s.setAttribute('aria-hidden', 'true');
  setTimeout(() => { document.getElementById('settings-overlay').hidden = true; }, 350);
}

// ═══════════════════════════════════════════════════════════════════════
//  ACTIVITY FEED
// ═══════════════════════════════════════════════════════════════════════
function renderActivity() {
  const feed = document.getElementById('activity-feed');
  const groups = {
    today: { label: 'Today', items: ACTIVITY.filter(a => a.group === 'today') },
    week: { label: 'This Week', items: ACTIVITY.filter(a => a.group === 'week') },
  };
  feed.innerHTML = Object.values(groups).map(g => !g.items.length ? '' : `
    <div class="apv-activity__group">
      <p class="apv-activity__group-label">${g.label}</p>
      ${g.items.map(it => `
        <div class="apv-activity__item ${it.unread ? 'is-unread' : ''}">
          <span class="apv-activity__dot apv-activity__dot--${it.dot}"></span>
          <div>
            <p class="apv-activity__msg">${it.msg}</p>
            <p class="apv-activity__meta">${it.meta}</p>
            ${it.linkText ? `<a class="apv-activity__link" href="#">${it.linkText}</a>` : ''}
          </div>
        </div>
      `).join('')}
    </div>
  `).join('');
}

function toggleActivity() {
  document.getElementById('apv-activity').classList.toggle('is-open');
}

// ═══════════════════════════════════════════════════════════════════════
//  BULK SELECTION BAR
// ═══════════════════════════════════════════════════════════════════════
function updateBulkBar() {
  const bar = document.getElementById('apv-bulk-bar');
  const count = state.selectedIds.size;
  if (count < 1) {
    bar.classList.remove('is-open');
    setTimeout(() => { bar.hidden = true; }, 350);
    return;
  }
  bar.hidden = false;
  requestAnimationFrame(() => bar.classList.add('is-open'));
  document.getElementById('bulk-count').textContent = count;
  const selected = APPROVALS.filter(a => state.selectedIds.has(a.id));
  const breakdown = ['invoice', 'setup', 'change', 'document'].map(t => {
    const c = selected.filter(s => s.type === t).length;
    return c ? `${c} ${t}${c > 1 ? 's' : ''}` : null;
  }).filter(Boolean).join(' · ');
  document.getElementById('bulk-breakdown').textContent = breakdown;
}

// ═══════════════════════════════════════════════════════════════════════
//  HELPERS — search / sort / counts
// ═══════════════════════════════════════════════════════════════════════
function applySearch(items) {
  if (!state.searchQuery) return items;
  const q = state.searchQuery.toLowerCase();
  return items.filter(i => [i.ref, i.title, i.subtitle, i.submittedBy].join(' ').toLowerCase().includes(q));
}

function applyFilters(items) {
  const f = state.filters;
  if (!f) return items;
  return items.filter(it => {
    if (f.type !== 'all' && it.type !== f.type) return false;
    if (f.priority !== 'all' && it.priority !== f.priority) return false;
    if (f.requester !== 'all' && it.submittedBy !== f.requester) return false;
    const date = (it.submittedAt || '').slice(0, 10);
    if (f.dateFrom && date < f.dateFrom) return false;
    if (f.dateTo && date > f.dateTo) return false;
    return true;
  });
}

function activeFilterCount() {
  const f = state.filters;
  return ['type', 'priority', 'requester'].filter(k => f[k] !== 'all').length
    + (f.dateFrom ? 1 : 0) + (f.dateTo ? 1 : 0);
}

function renderActiveFilterChips() {
  const c = document.getElementById('apv-filter-active-chips');
  if (!c) return;
  c.innerHTML = '';
  const f = state.filters;
  const entries = [];
  if (f.type !== 'all') entries.push({ k: 'type', label: `Type: ${f.type}` });
  if (f.priority !== 'all') entries.push({ k: 'priority', label: `Priority: ${f.priority}` });
  if (f.requester !== 'all') entries.push({ k: 'requester', label: `By: ${f.requester}` });
  if (f.dateFrom) entries.push({ k: 'dateFrom', label: `From: ${f.dateFrom}` });
  if (f.dateTo) entries.push({ k: 'dateTo', label: `To: ${f.dateTo}` });
  entries.forEach(e => {
    const chip = document.createElement('span');
    chip.className = 'apv-filter-active-chip';
    chip.innerHTML = `${e.label}<button data-clear="${e.k}" aria-label="Remove ${e.label}">×</button>`;
    chip.querySelector('button').addEventListener('click', () => {
      if (e.k === 'dateFrom' || e.k === 'dateTo') state.filters[e.k] = '';
      else state.filters[e.k] = 'all';
      syncFilterPopover();
      renderActiveFilterChips();
      renderPanel();
    });
    c.appendChild(chip);
  });
  if (entries.length) {
    const clear = document.createElement('button');
    clear.className = 'apv-filter-clear-all';
    clear.textContent = 'Clear All';
    clear.addEventListener('click', resetFilters);
    c.appendChild(clear);
  }
}

function resetFilters() {
  state.filters = { type: 'all', priority: 'all', requester: 'all', dateFrom: '', dateTo: '' };
  syncFilterPopover();
  renderActiveFilterChips();
  renderPanel();
}

function syncFilterPopover() {
  const f = state.filters;
  document.querySelectorAll('#apv-filter-type .chip').forEach(c =>
    c.classList.toggle('is-active', c.dataset.filterType === f.type));
  document.querySelectorAll('#apv-filter-priority .chip').forEach(c =>
    c.classList.toggle('is-active', c.dataset.filterPriority === f.priority));
  const req = document.getElementById('apv-filter-requester');
  if (req) req.value = f.requester;
  const df = document.getElementById('apv-filter-date-from');
  if (df) df.value = f.dateFrom;
  const dt = document.getElementById('apv-filter-date-to');
  if (dt) dt.value = f.dateTo;
}

function applySort(items) {
  const sorted = [...items];
  switch (state.sortBy) {
    case 'priority':
      const order = { high: 0, normal: 1, low: 2 };
      sorted.sort((a, b) => order[a.priority] - order[b.priority]);
      break;
    case 'type':
      sorted.sort((a, b) => a.type.localeCompare(b.type));
      break;
    case 'amount':
      sorted.sort((a, b) => (b.amount || 0) - (a.amount || 0));
      break;
    case 'date':
    default:
      sorted.sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
  }
  return sorted;
}

function updateCounts() {
  const pending = APPROVALS.filter(a => a.status === 'pending');
  const counts = {
    all: pending.length,
    invoice: pending.filter(i => i.type === 'invoice').length,
    setup: pending.filter(i => i.type === 'setup').length,
    change: pending.filter(i => i.type === 'change').length,
    approved: APPROVED_HISTORY.length,
    rejected: REJECTED_HISTORY.length,
  };
  Object.entries(counts).forEach(([k, v]) => {
    const el = document.getElementById(`tab-count-${k}`);
    if (el) el.textContent = v;
  });
  // Stats strip (cards removed — null-guard)
  const sp = document.getElementById('stat-pending'); if (sp) sp.textContent = counts.all;
  const si = document.getElementById('stat-invoice'); if (si) si.textContent = counts.invoice;
  // Side nav badge
  document.getElementById('nav-badge-apv').textContent = counts.all;

  // SLA banner check
  const breached = pending.filter(a => a.slaBreached || (a.slaUsed / a.slaHours) >= 1).length;
  const banner = document.getElementById('sla-banner');
  if (breached > 0) {
    banner.hidden = false;
    document.getElementById('sla-breach-count').textContent = breached;
  } else {
    banner.hidden = true;
  }
}

// ═══════════════════════════════════════════════════════════════════════
//  CROSS-SCREEN SYNC via localStorage
// ═══════════════════════════════════════════════════════════════════════
function syncCrossScreens() {
  const pending = APPROVALS.filter(a => a.status === 'pending');
  const lastAction = APPROVED_HISTORY[0] || REJECTED_HISTORY[0];
  try {
    const state = JSON.parse(localStorage.getItem('info-platform-state') || '{}');
    state.approvals = {
      pending: pending.length,
      invoicePending: pending.filter(i => i.type === 'invoice').length,
      setupPending: pending.filter(i => i.type === 'setup').length,
      changePending: pending.filter(i => i.type === 'change').length,
      lastAction: lastAction ? { ref: lastAction.ref, by: lastAction.by, at: lastAction.date } : null,
      ts: Date.now(),
    };
    localStorage.setItem('info-platform-state', JSON.stringify(state));
  } catch (e) {
    console.warn('Cross-screen sync failed', e);
  }
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
  const dismiss = () => {
    el.classList.remove('is-open');
    setTimeout(() => el.remove(), 300);
  };
  el.querySelector('.toast__close').addEventListener('click', dismiss);
  setTimeout(dismiss, duration);
}

// ═══════════════════════════════════════════════════════════════════════
//  EVENT WIRING
// ═══════════════════════════════════════════════════════════════════════
function init() {
  // URL state
  const params = new URLSearchParams(location.search);
  const tab = params.get('tab');
  if (tab && ['all', 'invoice', 'setup', 'change', 'approved', 'rejected'].includes(tab)) {
    state.activeTab = tab;
  }

  // Tab clicks
  document.querySelectorAll('.apv-tabs .md-tab').forEach(t => {
    t.addEventListener('click', () => {
      const tabId = t.dataset.tab;
      document.querySelectorAll('.apv-tabs .md-tab').forEach(x => {
        x.classList.toggle('is-active', x === t);
        x.setAttribute('aria-selected', x === t ? 'true' : 'false');
      });
      state.activeTab = tabId;
      const url = new URL(location.href);
      url.searchParams.set('tab', tabId);
      history.pushState({}, '', url);
      renderPanel();
    });
    if (t.dataset.tab === state.activeTab) {
      document.querySelectorAll('.apv-tabs .md-tab').forEach(x => {
        x.classList.toggle('is-active', x.dataset.tab === state.activeTab);
        x.setAttribute('aria-selected', x.dataset.tab === state.activeTab ? 'true' : 'false');
      });
    }
  });

  // Stat clicks
  document.querySelectorAll('.md-stat[data-stat]').forEach(s => {
    s.addEventListener('click', () => {
      const target = s.dataset.stat;
      if (target === 'pending') { state.activeTab = 'all'; }
      else if (target === 'invoice') { state.activeTab = 'invoice'; }
      document.querySelectorAll('.apv-tabs .md-tab').forEach(x => {
        x.classList.toggle('is-active', x.dataset.tab === state.activeTab);
        x.setAttribute('aria-selected', x.dataset.tab === state.activeTab ? 'true' : 'false');
      });
      renderPanel();
    });
  });

  // Global click delegation for rows / cards / buttons / subfilter chips
  // Attached to .main (not #apv-panel) so subfilter chips outside the panel still fire
  document.querySelector('.main').addEventListener('click', e => {
    const checkbox = e.target.closest('.apv-row__check');
    if (checkbox) {
      e.stopPropagation();
      // Select-all header checkbox
      if (checkbox.id === 'apv-select-all') {
        document.querySelectorAll('.apv-row .apv-row__check').forEach(cb => {
          cb.checked = checkbox.checked;
          const rowId = cb.dataset.id;
          if (!rowId) return;
          if (checkbox.checked) state.selectedIds.add(rowId);
          else state.selectedIds.delete(rowId);
          cb.closest('.apv-row')?.classList.toggle('is-selected', checkbox.checked);
        });
        updateBulkBar();
        return;
      }
      const id = checkbox.dataset.id;
      if (checkbox.checked) state.selectedIds.add(id);
      else state.selectedIds.delete(id);
      checkbox.closest('.apv-row').classList.toggle('is-selected', checkbox.checked);
      updateBulkBar();
      return;
    }
    const btn = e.target.closest('[data-action]');
    if (btn) {
      e.stopPropagation();
      const id = btn.dataset.id;
      const action = btn.dataset.action;
      if (action === 'approve') openApproveModal(id);
      else if (action === 'reject') openRejectModal(id);
      else if (action === 'view') openDrawer(id);
      return;
    }
    const subSetup = e.target.closest('[data-setup-sub]');
    if (subSetup) {
      state.setupSubtab = subSetup.dataset.setupSub;
      renderPanel();
      return;
    }
    const subChange = e.target.closest('[data-change-sub]');
    if (subChange) {
      state.changeSubtab = subChange.dataset.changeSub;
      renderPanel();
      return;
    }
    const tabLink = e.target.closest('[data-tab-link]');
    if (tabLink) {
      e.preventDefault();
      state.activeTab = tabLink.dataset.tabLink;
      document.querySelectorAll('.apv-tabs .md-tab').forEach(x => {
        x.classList.toggle('is-active', x.dataset.tab === state.activeTab);
      });
      renderPanel();
      return;
    }
    const approveAll = e.target.closest('#approve-all-invoices');
    if (approveAll) {
      APPROVALS.filter(a => a.type === 'invoice' && a.status === 'pending').forEach(it => state.selectedIds.add(it.id));
      updateBulkBar();
      openBulkApproveModal();
      return;
    }
    // Row click → open drawer (anywhere except checkbox + action button)
    const row = e.target.closest('.apv-row');
    if (row) openDrawer(row.dataset.id);
    const card = e.target.closest('.apv-card');
    if (card && !e.target.closest('button, a')) openDrawer(card.dataset.id);
  });

  // Search
  document.getElementById('apv-search').addEventListener('input', e => {
    state.searchQuery = e.target.value;
    renderPanel();
  });

  // Sort
  document.getElementById('apv-sort').addEventListener('change', e => {
    state.sortBy = e.target.value;
    renderPanel();
  });

  // Topbar buttons
  document.getElementById('btn-export').addEventListener('click', () => {
    const items = APPROVALS.filter(a => a.status === 'pending');
    const csv = ['Ref,Type,Priority,Title,SubmittedBy,SubmittedAt,Amount,Status']
      .concat(items.map(i => [i.ref, i.type, i.priority, `"${i.title}"`, i.submittedBy, i.submittedAt, i.amount || '', i.status].join(',')))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `approvals-${Date.now()}.csv`;
    a.click();
    toast({ type: 'success', title: 'Export complete', subtitle: `${items.length} approvals exported` });
  });

  // Filter popover
  const filterBtn = document.getElementById('btn-filter');
  const filterPop = document.getElementById('apv-filter-popover');
  filterBtn.addEventListener('click', e => {
    e.stopPropagation();
    if (filterPop.hasAttribute('hidden')) {
      syncFilterPopover();
      filterPop.removeAttribute('hidden');
    } else {
      filterPop.setAttribute('hidden', '');
    }
  });
  document.getElementById('apv-filter-close').addEventListener('click', () =>
    filterPop.setAttribute('hidden', ''));
  document.addEventListener('click', e => {
    if (filterPop.hasAttribute('hidden')) return;
    if (filterPop.contains(e.target) || e.target === filterBtn || filterBtn.contains(e.target)) return;
    filterPop.setAttribute('hidden', '');
  });
  document.getElementById('apv-filter-type').addEventListener('click', e => {
    const chip = e.target.closest('[data-filter-type]');
    if (!chip) return;
    state.filters.type = chip.dataset.filterType;
    syncFilterPopover();
  });
  document.getElementById('apv-filter-priority').addEventListener('click', e => {
    const chip = e.target.closest('[data-filter-priority]');
    if (!chip) return;
    state.filters.priority = chip.dataset.filterPriority;
    syncFilterPopover();
  });
  document.getElementById('apv-filter-reset').addEventListener('click', () => {
    resetFilters();
    toast({ type: 'info', title: 'Filters cleared' });
  });
  document.getElementById('apv-filter-apply').addEventListener('click', () => {
    state.filters.requester = document.getElementById('apv-filter-requester').value;
    state.filters.dateFrom = document.getElementById('apv-filter-date-from').value;
    state.filters.dateTo = document.getElementById('apv-filter-date-to').value;
    renderActiveFilterChips();
    renderPanel();
    filterPop.setAttribute('hidden', '');
    const n = activeFilterCount();
    toast({ type: 'success', title: n ? `${n} filter${n > 1 ? 's' : ''} applied` : 'Filters cleared' });
  });

  document.getElementById('btn-activity').addEventListener('click', toggleActivity);
  document.getElementById('activity-close').addEventListener('click', toggleActivity);
  document.getElementById('activity-markread').addEventListener('click', () => {
    ACTIVITY.forEach(a => a.unread = false);
    renderActivity();
  });

  document.getElementById('btn-settings').addEventListener('click', openSettings);

  // SLA banner
  document.getElementById('sla-review').addEventListener('click', () => {
    state.activeTab = 'all';
    state.sortBy = 'priority';
    document.getElementById('apv-sort').value = 'priority';
    document.querySelectorAll('.apv-tabs .md-tab').forEach(x => {
      x.classList.toggle('is-active', x.dataset.tab === 'all');
    });
    renderPanel();
  });

  // Bulk bar
  document.getElementById('bulk-approve').addEventListener('click', openBulkApproveModal);
  document.getElementById('bulk-reject').addEventListener('click', openBulkRejectModal);
  document.getElementById('bulk-deselect').addEventListener('click', () => {
    state.selectedIds.clear();
    document.querySelectorAll('.apv-row__check').forEach(c => c.checked = false);
    document.querySelectorAll('.apv-row').forEach(r => r.classList.remove('is-selected'));
    updateBulkBar();
  });
  document.getElementById('bulk-close').addEventListener('click', () => {
    state.selectedIds.clear();
    document.querySelectorAll('.apv-row__check').forEach(c => c.checked = false);
    document.querySelectorAll('.apv-row').forEach(r => r.classList.remove('is-selected'));
    updateBulkBar();
  });
  document.getElementById('bulk-export').addEventListener('click', () => {
    toast({ type: 'success', title: 'Selected items exported', subtitle: `${state.selectedIds.size} items in CSV` });
  });

  // Overlay clicks
  document.getElementById('drawer-overlay').addEventListener('click', closeDrawer);
  document.getElementById('modal-overlay').addEventListener('click', closeModal);
  document.getElementById('settings-overlay').addEventListener('click', closeSettings);

  // ESC to close
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      const m = document.getElementById('apv-modal');
      if (m.classList.contains('is-open')) return closeModal();
      const d = document.getElementById('apv-drawer');
      if (d.classList.contains('is-open')) return closeDrawer();
      const s = document.getElementById('apv-settings');
      if (s.classList.contains('is-open')) return closeSettings();
    }
  });

  // Browser back / forward
  window.addEventListener('popstate', () => {
    const p = new URLSearchParams(location.search);
    state.activeTab = p.get('tab') || 'all';
    document.querySelectorAll('.apv-tabs .md-tab').forEach(x => {
      x.classList.toggle('is-active', x.dataset.tab === state.activeTab);
    });
    renderPanel();
  });

  // Boot
  renderPanel();
  updateCounts();
  renderActivity();
  syncCrossScreens();

  // Strip is-loading
  document.body.classList.remove('is-loading');
}

document.addEventListener('DOMContentLoaded', init);
