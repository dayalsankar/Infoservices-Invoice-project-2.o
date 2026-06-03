/* ── SESSION GUARD ─ runs before anything else ──────────────────────── */
(function saGuardSession() {
  const raw = sessionStorage.getItem('is_demo_session');
  if (!raw) { window.location.replace('/src/pages/login/index.html'); return; }
  try {
    const u = JSON.parse(raw);
    document.addEventListener('DOMContentLoaded', () => {
      document.querySelectorAll('[data-user="name"]').forEach(el => { el.textContent = u.name; });
      document.querySelectorAll('[data-user="role"]').forEach(el => {
        const svg = el.querySelector('svg');
        el.innerHTML = (svg ? svg.outerHTML : '') + ' ' + u.role;
      });
      document.querySelectorAll('.sa-rail__avatar span').forEach(el => {
        el.textContent = u.initials || (u.name || '').slice(0, 2).toUpperCase();
      });
      document.querySelectorAll('[data-action="logout"]').forEach(el => {
        el.addEventListener('click', e => {
          e.preventDefault();
          sessionStorage.removeItem('is_demo_session');
          window.location.replace('/src/pages/login/index.html');
        });
      });
    });
  } catch (e) {}
})();

/* ═══════════════════════════════════════════════════════════════════════
 *  SA DASHBOARD — data + render + interactions
 *  All functions prefixed `sa`
 * ════════════════════════════════════════════════════════════════════ */

// ── Data ─────────────────────────────────────────────────────────────
const SA_SERVICES = [
  { name: 'API Gateway',        sub: 'gateway.infoservices.com', metric: '38ms avg', status: 'operational', icon: 'gateway' },
  { name: 'Database',           sub: 'PostgreSQL 15 · primary',  metric: '14% CPU',  status: 'operational', icon: 'database' },
  { name: 'File Storage',       sub: 'S3 · 1.2TB used',          metric: '99.99% up', status: 'operational', icon: 'storage' },
  { name: 'Email Service',      sub: 'SES · 4,820 sent today',   metric: '0 bounces', status: 'operational', icon: 'mail' },
  { name: 'Background Jobs',    sub: 'Queue · 14 pending',       metric: 'lag 2.4s', status: 'degraded', icon: 'jobs' },
  { name: 'PDF Generator',      sub: 'Puppeteer · v22',          metric: '120 invoices/h', status: 'operational', icon: 'pdf' },
];

const SA_RECENT_USERS = [
  { name: 'Aditi Reddy',     initials: 'AR', avatar: 'green',  role: 'Consultant',        email: 'aditi.reddy@infoservices.com',  status: 'active', created: 'Today · 14:22' },
  { name: 'Karan Malhotra',  initials: 'KM', avatar: 'azure',  role: 'Delivery Manager',  email: 'karan.malhotra@infoservices.com', status: 'active', created: 'Today · 11:08' },
  { name: 'Tanvi Sharma',    initials: 'TS', avatar: 'purple', role: 'HR / Ops Admin',    email: 'tanvi.sharma@infoservices.com', status: 'pending', created: 'Yesterday · 17:45' },
  { name: 'Rohan Krishnan',  initials: 'RK', avatar: 'navy',   role: 'Consultant',        email: 'rohan.k@infoservices.com',      status: 'active', created: '2 days ago · 10:30' },
  { name: 'Sneha Pillai',    initials: 'SP', avatar: 'amber',  role: 'HR / Ops Admin',    email: 'sneha.pillai@infoservices.com', status: 'active', created: '3 days ago · 09:15' },
];

const SA_FEED = [
  { type: 'success', when: '2 min ago',  msg: '<strong>Priya Sharma</strong> approved invoice INV-2401',       actor: 'Finance Admin' },
  { type: 'royal',   when: '14 min ago', msg: '<strong>Rajesh Kumar</strong> signed off ASGN-2026-014',         actor: 'Signing Authority' },
  { type: 'azure',   when: '32 min ago', msg: 'New user <strong>Aditi Reddy</strong> onboarded',                actor: 'Super Admin · Arjun' },
  { type: 'warning', when: '1 hr ago',   msg: '<strong>Failed login</strong> from suspicious IP 102.34.x.x',    actor: 'Security' },
  { type: 'success', when: '2 hr ago',   msg: 'Payment <strong>₹1,18,000</strong> recorded for INV-2401',       actor: 'Finance Admin' },
  { type: 'royal',   when: '3 hr ago',   msg: 'Role <strong>"Delivery Manager"</strong> permissions updated',   actor: 'Super Admin · Arjun' },
  { type: 'azure',   when: '5 hr ago',   msg: 'Integration <strong>GSTN</strong> sync completed (48 invoices)', actor: 'System' },
  { type: 'warning', when: '8 hr ago',   msg: 'SLA breach on approval <strong>APV-2026-011</strong>',           actor: 'Approval Engine' },
  { type: 'danger',  when: '12 hr ago',  msg: 'Background job <strong>"invoice-batch"</strong> failed (retried)', actor: 'System' },
  { type: 'success', when: '1 day ago',  msg: 'Daily backup completed · <strong>2.4GB</strong> archived',       actor: 'System' },
];

const SA_INTEGRATIONS = [
  { logo: 'G',  name: 'GSTN Portal',     sub: 'Connected · Last sync 8 min ago',  status: 'operational' },
  { logo: 'D',  name: 'DigiLocker',      sub: 'Connected · KYC verification',     status: 'operational' },
  { logo: 'T',  name: 'Tally ERP',       sub: 'Connected · Bidirectional sync',   status: 'operational' },
  { logo: 'S',  name: 'Slack Workspace', sub: 'Connected · #finance-alerts',      status: 'degraded' },
];

// SVG icon set for services (small, scoped)
const SA_ICONS = {
  gateway:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M2 12h20"/><circle cx="12" cy="12" r="4"/></svg>',
  database: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v6c0 1.7 4 3 9 3s9-1.3 9-3V5M3 11v6c0 1.7 4 3 9 3s9-1.3 9-3v-6"/></svg>',
  storage:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="6" rx="1"/><rect x="2" y="15" width="20" height="6" rx="1"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>',
  mail:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22 6 12 13 2 6"/></svg>',
  jobs:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  pdf:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>',
};

// ── Render: Service Health list ──────────────────────────────────────
function saRenderServices() {
  const ul = document.getElementById('sa-services');
  if (!ul) return;
  ul.innerHTML = SA_SERVICES.map(s => `
    <li class="sa-service">
      <span class="sa-service__icon">${SA_ICONS[s.icon] || SA_ICONS.gateway}</span>
      <div>
        <p class="sa-service__name">${s.name}</p>
        <p class="sa-service__sub">${s.sub}</p>
      </div>
      <span class="sa-service__metric">${s.metric}</span>
      <span class="sa-status-pill sa-status-pill--${s.status}">${s.status}</span>
    </li>
  `).join('');
}

// ── Render: Recent Users table ───────────────────────────────────────
function saRenderRecentUsers() {
  const tbody = document.getElementById('sa-recent-users-body');
  if (!tbody) return;
  tbody.innerHTML = SA_RECENT_USERS.map(u => `
    <tr>
      <td>
        <div class="sa-user-cell">
          <span class="sa-avatar sa-avatar--${u.avatar}">${u.initials}</span>
          <span class="sa-user-cell__name">${u.name}</span>
        </div>
      </td>
      <td><span class="sa-role-pill">${u.role}</span></td>
      <td><span style="color:var(--sa-text-muted);font-size:12px">${u.email}</span></td>
      <td><span class="sa-status-pill sa-status-pill--${u.status === 'active' ? 'operational' : 'degraded'}">${u.status}</span></td>
      <td><span style="color:var(--sa-text-muted);font-size:12px">${u.created}</span></td>
    </tr>
  `).join('');
}

// ── Render: Audit Activity feed ──────────────────────────────────────
function saRenderFeed() {
  const ul = document.getElementById('sa-feed');
  if (!ul) return;
  ul.innerHTML = SA_FEED.map(f => `
    <li class="sa-feed-item">
      <span class="sa-feed-item__dot sa-feed-item__dot--${f.type}"></span>
      <div>
        <p class="sa-feed-item__msg">${f.msg}</p>
        <p class="sa-feed-item__actor">${f.actor}</p>
      </div>
      <span class="sa-feed-item__when">${f.when}</span>
    </li>
  `).join('');
}

// ── Render: Integrations ─────────────────────────────────────────────
function saRenderIntegrations() {
  const ul = document.getElementById('sa-integrations');
  if (!ul) return;
  ul.innerHTML = SA_INTEGRATIONS.map(i => `
    <li class="sa-integration">
      <span class="sa-integration__logo">${i.logo}</span>
      <div>
        <p class="sa-integration__name">${i.name}</p>
        <p class="sa-integration__sub">${i.sub}</p>
      </div>
      <span class="sa-status-pill sa-status-pill--${i.status}">${i.status}</span>
    </li>
  `).join('');
}

// ── Toast ────────────────────────────────────────────────────────────
function saToast({ type = 'info', title, sub, duration = 3500 }) {
  const region = document.getElementById('sa-toast-region');
  if (!region) return;
  const el = document.createElement('div');
  el.className = `sa-toast sa-toast--${type}`;
  el.innerHTML = `
    <div style="flex:1">
      <p style="font-weight:600;color:var(--sa-navy)">${title}</p>
      ${sub ? `<p style="font-size:11px;color:var(--sa-text-muted);margin-top:2px">${sub}</p>` : ''}
    </div>
    <button style="background:transparent;border:none;color:var(--sa-text-muted);cursor:pointer;font-size:16px;padding:0 4px" aria-label="Dismiss">×</button>
  `;
  region.appendChild(el);
  const dismiss = () => {
    el.classList.add('is-leaving');
    setTimeout(() => el.remove(), 250);
  };
  el.querySelector('button').addEventListener('click', dismiss);
  setTimeout(dismiss, duration);
}

// ── Quick Actions wiring ─────────────────────────────────────────────
function saWireQuickActions() {
  document.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', e => {
      const action = btn.dataset.action;
      if (action === 'logout') return;       // handled by guard
      e.preventDefault();
      if (action === 'add-user' || btn.id === 'sa-quick-add-user') {
        saToast({ type: 'info', title: 'Add User wizard', sub: 'Opening in next sprint' });
      } else if (action === 'create-role') {
        window.location.href = '../roles/';
      } else if (action === 'view-audit') {
        window.location.href = '../audit/';
      }
    });
  });
}

// ── Refresh button ───────────────────────────────────────────────────
function saWireRefresh() {
  const btn = document.getElementById('sa-refresh-health');
  if (!btn) return;
  btn.addEventListener('click', () => {
    btn.disabled = true;
    btn.style.opacity = '.6';
    saRenderServices();
    saToast({ type: 'success', title: '✓ Health refreshed', sub: 'All services checked just now' });
    setTimeout(() => { btn.disabled = false; btn.style.opacity = '1'; }, 800);
  });
}

// ── Search ───────────────────────────────────────────────────────────
function saWireSearch() {
  const input = document.getElementById('sa-global-search');
  if (!input) return;
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      const q = input.value.trim();
      if (q) saToast({ type: 'info', title: `Searching "${q}"`, sub: 'Cross-module search coming in next sprint' });
    }
  });
}

// ── Init ─────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  saRenderServices();
  saRenderRecentUsers();
  saRenderFeed();
  saRenderIntegrations();
  saWireQuickActions();
  saWireRefresh();
  saWireSearch();
});
