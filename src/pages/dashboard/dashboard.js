/* ── SESSION GUARD ─ runs before anything else ──────────────────────────── */
(function guardSession() {
  const raw = sessionStorage.getItem('is_demo_session');
  if (!raw) { window.location.replace('/src/pages/login/index.html'); return; }
  try {
    const u = JSON.parse(raw);
    document.addEventListener('DOMContentLoaded', () => {
      document.querySelectorAll('.panel-user__name, [data-user="name"]').forEach(el => el.textContent = u.name);
      document.querySelectorAll('.panel-user__role, [data-user="role"]').forEach(el => {
        const svg = el.querySelector('svg');
        el.innerHTML = (svg ? svg.outerHTML : '') + ' ' + u.role;
      });
      document.querySelectorAll('.rail-avatar span, [data-user="initials"]').forEach(el => {
        el.textContent = u.initials || (u.name || '').slice(0, 2).toUpperCase();
      });
      document.querySelectorAll('.nav-item--logout, [data-action="logout"]').forEach(el => {
        el.addEventListener('click', e => {
          e.preventDefault();
          sessionStorage.removeItem('is_demo_session');
          window.location.replace('/src/pages/login/index.html');
        });
      });
    });
  } catch (e) {}
})();

/* ============================================================================
 * dashboard.js — Chart.js init + interactions for the Finance Dashboard.
 * Vanilla JS, no framework. Loads Chart.js from the index.html script tag.
 * ========================================================================== */

(() => {
  'use strict';

  /* ── Brand color constants (mirror of design-system.css tokens) ────────── */
  const C = {
    royal:   '#2a52a8',
    azure:   '#3b82c4',
    navy:    '#1a1f5e',
    success: '#10b981',
    warning: '#f59e0b',
    orange:  '#fb923c',
    danger:  '#ef4444',
    border:  '#e8ecf4',
    canvas:  '#f4f6fb',
    text2:   '#4a527a',
    text3:   '#8088a5',
    white:   '#ffffff',
  };

  /* ── Currency conversion (mock fixed rate for static demo) ─────────────── */
  const INR_PER_USD = 83.5;
  const formatINR = v => '₹' + new Intl.NumberFormat('en-IN').format(Math.round(v));
  const formatINRShort = v => {
    if (v >= 1e7) return '₹' + (v / 1e7).toFixed(2) + ' Cr';
    if (v >= 1e5) return '₹' + (v / 1e5).toFixed(2) + 'L';
    return formatINR(v);
  };
  const formatUSD = v => '$' + new Intl.NumberFormat('en-US').format(Math.round(v / INR_PER_USD));
  const formatUSDShort = v => {
    const u = v / INR_PER_USD;
    if (u >= 1e6) return '$' + (u / 1e6).toFixed(2) + 'M';
    if (u >= 1e3) return '$' + (u / 1e3).toFixed(1) + 'K';
    return formatUSD(v);
  };

  /* ── Chart.js global defaults ──────────────────────────────────────────── */
  if (typeof Chart !== 'undefined') {
    Chart.defaults.font.family = "'Poppins', system-ui, sans-serif";
    Chart.defaults.font.size = 12;
    Chart.defaults.color = C.text2;
    Chart.defaults.plugins.tooltip = {
      ...Chart.defaults.plugins.tooltip,
      enabled: true,
      backgroundColor: C.navy,
      titleColor: C.white,
      titleFont: { weight: 600, size: 13, family: "'Poppins', sans-serif" },
      bodyColor: '#ffffff',
      bodyFont: { weight: 500, size: 12, family: "'Poppins', sans-serif" },
      padding: 12,
      cornerRadius: 10,
      displayColors: true,
      boxPadding: 4,
      borderColor: C.azure,
      borderWidth: 0,
    };
  }

  /* ── Datasets ──────────────────────────────────────────────────────────── */

  const REVENUE_DATA = {
    '3M': {
      labels: ['Apr', 'May', 'Jun'],
      revenue:     [38, 42, 47],
      collected:   [33, 35, 37],
      outstanding: [5, 7, 10],
    },
    '6M': {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      revenue:     [28, 34, 30, 42, 38, 48],
      collected:   [22, 30, 26, 36, 33, 36],
      outstanding: [6, 4, 4, 6, 5, 11],
    },
    '1Y': {
      labels: ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      revenue:     [24, 27, 29, 32, 30, 35, 28, 34, 30, 42, 38, 48],
      collected:   [20, 24, 26, 28, 27, 31, 22, 30, 26, 36, 33, 36],
      outstanding: [4, 3, 3, 4, 3, 4, 6, 4, 4, 6, 5, 11],
    },
  };

  const DONUT_DATA = {
    labels: ['Paid', 'Approved', 'Pending', 'Overdue'],
    values: [842, 186, 152, 68],
    colors: [C.success, C.royal, C.warning, C.danger],
  };

  const AGING_DATA = {
    labels: ['0–30 days', '31–60 days', '61–90 days', '>90 days'],
    values: [7.2, 2.8, 1.05, 0.4],          // ₹ in lakhs
    colors: [C.success, C.warning, C.orange, C.danger],
  };

  /* ── Helpers — chart factories ────────────────────────────────────────── */

  function makeGradient(ctx, hex) {
    const g = ctx.createLinearGradient(0, 0, 0, 320);
    g.addColorStop(0, hex + '50');
    g.addColorStop(1, hex + '00');
    return g;
  }

  let revenueChart, donutChart, agingChart;

  function initRevenueChart() {
    const el = document.getElementById('chart-revenue');
    if (!el) return;
    const ctx = el.getContext('2d');
    const d = REVENUE_DATA['6M'];

    revenueChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: d.labels,
        datasets: [
          {
            label: 'Revenue',
            data: d.revenue,
            borderColor: C.royal,
            backgroundColor: makeGradient(ctx, C.royal),
            tension: 0.35,
            fill: true,
            borderWidth: 2.5,
            pointBackgroundColor: C.royal,
            pointBorderColor: C.white,
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
          },
          {
            label: 'Collected',
            data: d.collected,
            borderColor: C.success,
            backgroundColor: makeGradient(ctx, C.success),
            tension: 0.35,
            fill: true,
            borderWidth: 2.5,
            pointBackgroundColor: C.success,
            pointBorderColor: C.white,
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
          },
          {
            label: 'Outstanding',
            data: d.outstanding,
            borderColor: C.warning,
            backgroundColor: makeGradient(ctx, C.warning),
            tension: 0.35,
            fill: true,
            borderWidth: 2.5,
            pointBackgroundColor: C.warning,
            pointBorderColor: C.white,
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => `${ctx.dataset.label}: ₹${ctx.parsed.y}L`,
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: C.text3, font: { size: 12 } },
            border: { color: C.border },
          },
          y: {
            beginAtZero: true,
            grid: { color: C.border, drawBorder: false },
            border: { display: false },
            ticks: {
              color: C.text3,
              font: { size: 11 },
              callback: (v) => '₹' + v + 'L',
              maxTicksLimit: 6,
            },
          },
        },
      },
    });
  }

  function initDonutChart() {
    const el = document.getElementById('chart-donut');
    if (!el) return;
    const ctx = el.getContext('2d');

    donutChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: DONUT_DATA.labels,
        datasets: [{
          data: DONUT_DATA.values,
          backgroundColor: DONUT_DATA.colors,
          borderColor: C.white,
          borderWidth: 3,
          borderRadius: 4,
          spacing: 3,
          hoverOffset: 8,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '72%',
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => `${ctx.label}: ${ctx.parsed} invoices`,
            },
          },
        },
      },
    });
  }

  function initAgingChart() {
    const el = document.getElementById('chart-aging');
    if (!el) return;
    const ctx = el.getContext('2d');

    agingChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: AGING_DATA.labels,
        datasets: [{
          data: AGING_DATA.values,
          backgroundColor: AGING_DATA.colors,
          borderRadius: 8,
          borderSkipped: false,
          barThickness: 36,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => `₹${ctx.parsed.y}L outstanding`,
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            border: { color: C.border },
            ticks: { color: C.text3, font: { size: 11 } },
          },
          y: {
            beginAtZero: true,
            grid: { color: C.border, drawBorder: false },
            border: { display: false },
            ticks: {
              color: C.text3,
              font: { size: 11 },
              callback: (v) => '₹' + v + 'L',
              maxTicksLimit: 5,
            },
          },
        },
      },
    });
  }

  /* ── Interactions: filter tabs (revenue chart) ─────────────────────────── */

  function bindRangeTabs() {
    const tabs = document.querySelectorAll('[data-range]');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => {
          t.classList.remove('is-active');
          t.setAttribute('aria-selected', 'false');
        });
        tab.classList.add('is-active');
        tab.setAttribute('aria-selected', 'true');

        const range = tab.dataset.range;
        const d = REVENUE_DATA[range];
        if (!revenueChart || !d) return;

        revenueChart.data.labels = d.labels;
        revenueChart.data.datasets[0].data = d.revenue;
        revenueChart.data.datasets[1].data = d.collected;
        revenueChart.data.datasets[2].data = d.outstanding;
        revenueChart.update();
      });
    });
  }

  /* ── Interactions: invoice table filter tabs ──────────────────────────── */

  function bindFilterTabs() {
    const tabs = document.querySelectorAll('[data-filter]');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => {
          t.classList.remove('is-active');
          t.setAttribute('aria-selected', 'false');
        });
        tab.classList.add('is-active');
        tab.setAttribute('aria-selected', 'true');

        const filter = tab.dataset.filter;
        const rows = document.querySelectorAll('[data-row-status]');
        rows.forEach(row => {
          const status = row.dataset.rowStatus;
          const show = filter === 'all' || status === filter;
          row.style.display = show ? '' : 'none';
        });
      });
    });
  }

  /* ── Interactions: currency toggle ─────────────────────────────────────── */

  function bindCurrencyToggle() {
    const buttons = document.querySelectorAll('.currency-toggle__btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        buttons.forEach(b => {
          b.classList.remove('is-active');
          b.setAttribute('aria-checked', 'false');
        });
        btn.classList.add('is-active');
        btn.setAttribute('aria-checked', 'true');

        const currency = btn.dataset.currency; // 'INR' | 'USD'
        applyCurrency(currency);
      });
    });
  }

  function applyCurrency(currency) {
    const nodes = document.querySelectorAll('[data-currency-amount]');
    nodes.forEach(node => {
      // Some sub-cells are USD-only (e.g. KPI sublabel) and should never flip
      if (node.dataset.currencyFormat === 'usd-only') return;

      const amount = Number(node.dataset.currencyAmount);
      if (!Number.isFinite(amount)) return;

      // Preserve "short" formatting for KPI values (e.g. ₹36.8L → $44K)
      const original = node.textContent.trim();
      const wasShort = /[A-Za-z]+$|Cr|L|K|M/.test(original.replace(/[^A-Za-z]/g, ''));

      if (currency === 'USD') {
        node.textContent = wasShort ? formatUSDShort(amount) : formatUSD(amount);
      } else {
        node.textContent = wasShort ? formatINRShort(amount) : formatINR(amount);
      }
    });
  }

  /* ── Interactions: approve / reject buttons ────────────────────────────── */

  function bindApprovalButtons() {
    document.querySelectorAll('.btn-mini').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const item = btn.closest('.approval');
        if (!item) return;
        const isApprove = btn.classList.contains('btn-mini--success');
        const label = isApprove ? 'Approved' : 'Rejected';

        // Brief inline confirmation
        const meta = item.querySelector('.approval__meta');
        if (meta) {
          const original = meta.textContent;
          meta.style.color = isApprove ? 'var(--success-fg)' : 'var(--danger-fg)';
          meta.textContent = `${label} just now`;
          setTimeout(() => {
            item.style.opacity = '0';
            item.style.transform = 'translateX(20px)';
            item.style.transition = 'all 280ms cubic-bezier(0.4,0,0.2,1)';
            setTimeout(() => {
              item.remove();
            }, 280);
          }, 600);
        }
      });
    });
  }

  /* ── Interactions: rail item activation ────────────────────────────────── */

  function bindRailItems() {
    const items = document.querySelectorAll('.rail-item');
    items.forEach(item => {
      item.addEventListener('click', () => {
        items.forEach(i => i.classList.remove('is-active'));
        item.classList.add('is-active');
      });
    });
  }

  /* ── Interactions: side panel nav item activation ─────────────────────── */

  function bindPanelNav() {
    const items = document.querySelectorAll('.panel-nav .nav-item');
    items.forEach(item => {
      item.addEventListener('click', (e) => {
        const href = item.getAttribute('href');
        // Real link → allow native navigation (e.g. Master Data goes to its page)
        if (href && href !== '#' && !href.startsWith('javascript:')) return;

        e.preventDefault();
        items.forEach(i => i.classList.remove('is-active'));
        item.classList.add('is-active');

        const label = item.querySelector('.nav-item__label');
        if (label) {
          const breadcrumb = document.querySelector('.breadcrumb');
          if (breadcrumb) {
            const parts = breadcrumb.children;
            if (parts.length >= 3) parts[2].textContent = label.textContent.trim();
          }
        }
      });
    });
  }

  /* ── Aging bars: width animation from data attr ────────────────────────── */

  function animateAgingBars() {
    const bars = document.querySelectorAll('.aging__fill');
    bars.forEach((bar, i) => {
      const w = bar.dataset.barWidth;
      setTimeout(() => {
        bar.style.width = w + '%';
      }, 200 + i * 80);
    });
  }

  /* ── Loading skeleton transition ───────────────────────────────────────── */

  function revealAfterLoad() {
    setTimeout(() => {
      document.body.classList.remove('is-loading');
      document.body.classList.add('is-loaded');
      animateAgingBars();
    }, 300);
  }

  /* ── Bootstrap ─────────────────────────────────────────────────────────── */

  function init() {
    initRevenueChart();
    initDonutChart();
    initAgingChart();
    bindRangeTabs();
    bindFilterTabs();
    bindCurrencyToggle();
    bindApprovalButtons();
    bindRailItems();
    bindPanelNav();
    revealAfterLoad();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
