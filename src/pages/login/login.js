/* ═══════════════════════════════════════════════════════════════════════
 *  LOGIN — particles + session + form + 8 role cards
 * ════════════════════════════════════════════════════════════════════ */

// ── Session ──────────────────────────────────────────────────────────
const SESSION_KEY = 'is_demo_session';

const ROLE_DATA = {
  'finance-admin':     { name: 'Priya Sharma',    role: 'Finance Admin',     initials: 'PS', email: 'priya.sharma@infoservices.com',    redirect: '/src/pages/dashboard/index.html' },
  'super-admin':       { name: 'Arjun Mehta',     role: 'Super Admin',       initials: 'AM', email: 'arjun.mehta@infoservices.com',     redirect: '/src/pages/super-admin/dashboard/index.html' },
  'delivery-manager':  { name: 'Kavitha Nair',    role: 'Delivery Manager',  initials: 'KN', email: 'kavitha.nair@infoservices.com',    redirect: '/src/pages/timesheets/index.html' },
  'signing-authority': { name: 'Rajesh Kumar',    role: 'Signing Authority', initials: 'RK', email: 'rajesh.kumar@infoservices.com',    redirect: '/src/pages/approvals/index.html' },
  'consultant':        { name: 'Rahul Verma',     role: 'Consultant',        initials: 'RV', email: 'rahul.verma@infoservices.com',     redirect: '/src/pages/timesheets/index.html' },
  'hr-admin':          { name: 'Sneha Pillai',    role: 'HR / Ops Admin',    initials: 'SP', email: 'sneha.pillai@infoservices.com',    redirect: '/src/pages/master-data/index.html' },
  'executive':         { name: 'Vikram Bose',     role: 'Executive',         initials: 'VB', email: 'vikram.bose@infoservices.com',     redirect: '/src/pages/reports/index.html' },
  'auditor':           { name: 'Meera Joshi',     role: 'Auditor',           initials: 'MJ', email: 'meera.joshi@infoservices.com',     redirect: '/src/pages/reports/index.html' },
};

function setSession(roleId) {
  const user = ROLE_DATA[roleId];
  if (!user) return null;
  const session = { ...user, roleId, loginTime: new Date().toISOString() };
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

function getSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

window.IS_getSession = getSession;
window.IS_clearSession = () => sessionStorage.removeItem(SESSION_KEY);

// ── Particle canvas system ───────────────────────────────────────────
function initParticles() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const PARTICLE_COUNT = 60;
  const particles = [];

  class Particle {
    constructor() { this.reset(true); }
    reset(initial = false) {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 2 + 0.5;
      this.speedX = (Math.random() - 0.5) * 0.4;
      this.speedY = (Math.random() - 0.5) * 0.4;
      this.opacity = Math.random() * 0.5 + 0.1;
      this.opacityDir = Math.random() > 0.5 ? 1 : -1;
      this.opacitySpeed = Math.random() * 0.005 + 0.002;
      const colors = ['255,255,255', '59,130,196', '42,82,168', '139,92,246'];
      this.color = colors[Math.floor(Math.random() * colors.length)];
    }
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      this.opacity += this.opacityDir * this.opacitySpeed;
      if (this.opacity > 0.6 || this.opacity < 0.05) this.opacityDir *= -1;
      if (this.x < -10 || this.x > canvas.width + 10 || this.y < -10 || this.y > canvas.height + 10) {
        this.reset();
      }
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.color},${this.opacity})`;
      ctx.fill();
    }
  }

  for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());

  function drawConnections() {
    const maxDist = 120;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < maxDist) {
          const opacity = (1 - dist / maxDist) * 0.12;
          ctx.beginPath();
          ctx.strokeStyle = `rgba(59,130,196,${opacity})`;
          ctx.lineWidth = 0.5;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    drawConnections();
    requestAnimationFrame(animate);
  }
  animate();
}

// ── SVG icon strings for password toggle ────────────────────────────
const EYE_OPEN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
const EYE_CLOSED = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 0 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>';

// ── Init ─────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Already logged in? Skip to dashboard
  if (getSession()) {
    window.location.href = '/src/pages/dashboard/index.html';
    return;
  }

  // Start particles
  initParticles();

  // Password toggle
  const pwInput = document.getElementById('login-password');
  const pwToggle = document.getElementById('pw-toggle');
  pwToggle?.addEventListener('click', () => {
    const showing = pwInput.type === 'password';
    pwInput.type = showing ? 'text' : 'password';
    pwToggle.innerHTML = showing ? EYE_CLOSED : EYE_OPEN;
    pwToggle.setAttribute('aria-label', showing ? 'Hide password' : 'Show password');
  });

  // Sign In form
  document.getElementById('login-form')?.addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('login-email')?.value.trim() || '';
    const pw = document.getElementById('login-password')?.value || '';

    let valid = true;
    const emailErr = document.getElementById('err-email');
    if (!email || !email.includes('@')) { emailErr?.removeAttribute('hidden'); valid = false; }
    else emailErr?.setAttribute('hidden', '');
    const pwErr = document.getElementById('err-pw');
    if (!pw) { pwErr?.removeAttribute('hidden'); valid = false; }
    else pwErr?.setAttribute('hidden', '');
    if (!valid) return;

    const btn = document.getElementById('btn-signin');
    if (btn) {
      btn.classList.add('loading');
      btn.innerHTML = '<span class="spinner"></span>Signing in…';
    }

    // Match email prefix to role
    const emailLower = email.toLowerCase();
    let matchRole = 'finance-admin';
    const roleKeys = {
      'priya': 'finance-admin', 'arjun': 'super-admin', 'kavitha': 'delivery-manager',
      'rajesh': 'signing-authority', 'rahul': 'consultant', 'sneha': 'hr-admin',
      'vikram': 'executive', 'meera': 'auditor',
    };
    Object.entries(roleKeys).forEach(([k, v]) => { if (emailLower.includes(k)) matchRole = v; });

    setTimeout(() => {
      const user = setSession(matchRole);
      window.location.href = user?.redirect || '/src/pages/dashboard/index.html';
    }, 900);
  });

  // Demo role cards
  document.querySelectorAll('.role-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.role-card').forEach(c => c.classList.remove('is-active'));
      card.classList.add('is-active');
      const roleId = card.dataset.role;
      const user = setSession(roleId);
      const badge = card.querySelector('.role-card__badge');
      if (badge) badge.textContent = '→ Loading…';
      setTimeout(() => {
        window.location.href = user?.redirect || '/src/pages/dashboard/index.html';
      }, 550);
    });
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); card.click(); }
    });
  });

  // Forgot password tooltip
  document.querySelector('.btn-forgot')?.addEventListener('click', () => {
    const tip = document.createElement('div');
    tip.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:rgba(26,31,94,0.95);color:white;padding:10px 18px;border-radius:8px;font-size:12px;z-index:9999;white-space:nowrap;box-shadow:0 8px 24px rgba(0,0,0,0.4);font-family:Poppins,sans-serif;';
    tip.textContent = 'Demo mode — use a role card below to log in instantly';
    document.body.appendChild(tip);
    setTimeout(() => tip.remove(), 3000);
  });
});
