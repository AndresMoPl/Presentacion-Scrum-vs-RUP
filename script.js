/* ============================================================
   SCRUM vs RUP — Premium Presentation Script
   ============================================================ */

// ── Particle Canvas (Hero) ──────────────────────────────────
(function initParticles() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [], animId;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function createParticles(n) {
    particles = [];
    for (let i = 0; i < n; i++) {
      const type = Math.random() > 0.5 ? 'blue' : 'amber';
      particles.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.8 + 0.4,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        alpha: Math.random() * 0.6 + 0.1,
        color: type === 'blue' ? '59,130,246' : '245,158,11'
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 140) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(${particles[i].color},${(1 - d / 140) * 0.12})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    // Dots
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color},${p.alpha})`;
      ctx.fill();
    });
  }

  function update() {
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
    });
  }

  function loop() {
    update(); draw();
    animId = requestAnimationFrame(loop);
  }

  resize();
  createParticles(80);
  loop();

  window.addEventListener('resize', () => {
    resize();
    createParticles(80);
  });
})();

// ── Final Canvas (ambient glow) ─────────────────────────────
(function initFinalCanvas() {
  const canvas = document.getElementById('final-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, t = 0;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    t += 0.008;

    // Blue glow left
    const gL = ctx.createRadialGradient(
      W * 0.2 + Math.sin(t) * 40, H * 0.5, 0,
      W * 0.2, H * 0.5, W * 0.55
    );
    gL.addColorStop(0, 'rgba(59,130,246,0.18)');
    gL.addColorStop(1, 'transparent');
    ctx.fillStyle = gL;
    ctx.fillRect(0, 0, W, H);

    // Amber glow right
    const gR = ctx.createRadialGradient(
      W * 0.8 + Math.cos(t) * 40, H * 0.5, 0,
      W * 0.8, H * 0.5, W * 0.55
    );
    gR.addColorStop(0, 'rgba(245,158,11,0.18)');
    gR.addColorStop(1, 'transparent');
    ctx.fillStyle = gR;
    ctx.fillRect(0, 0, W, H);

    requestAnimationFrame(draw);
  }

  resize();
  draw();
  window.addEventListener('resize', resize);
})();

// ── Progress Bar ────────────────────────────────────────────
const progressBar = document.getElementById('progress-bar');
window.addEventListener('scroll', () => {
  const total = document.documentElement.scrollHeight - window.innerHeight;
  const pct = (window.scrollY / total) * 100;
  progressBar.style.width = pct + '%';
});

// ── Active Nav ──────────────────────────────────────────────
const sections = document.querySelectorAll('.section-full[id]');
const navLinks  = document.querySelectorAll('.nav-links a');

function updateNav() {
  let current = '';
  sections.forEach(s => {
    if (window.scrollY >= s.offsetTop - 120) current = s.id;
  });
  navLinks.forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === '#' + current);
  });
}
window.addEventListener('scroll', updateNav, { passive: true });

// ── Reveal on Scroll (IntersectionObserver) ─────────────────
const revealEls = document.querySelectorAll('.reveal, .reveal-final, .reveal-final-delayed');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      // Trigger stat counter if applicable
      const nums = e.target.querySelectorAll('.stat-num[data-target]');
      nums.forEach(animateCounter);
      // Trigger comparison bars
      const bars = e.target.querySelectorAll('.ct-bar[data-w]');
      bars.forEach(b => {
        setTimeout(() => { b.style.width = b.dataset.w + '%'; }, 200);
      });
    }
  });
}, { threshold: 0.15 });

revealEls.forEach(el => revealObserver.observe(el));

// Also observe stat rows directly
document.querySelectorAll('.intro-stat-row').forEach(el => {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.querySelectorAll('.stat-num[data-target]').forEach(animateCounter);
        obs.disconnect();
      }
    });
  }, { threshold: 0.3 });
  obs.observe(el);
});

// Also observe comp table
const compTable = document.querySelector('.comp-table');
if (compTable) {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        document.querySelectorAll('.ct-bar[data-w]').forEach(b => {
          setTimeout(() => { b.style.width = b.dataset.w + '%'; }, 300);
        });
        obs.disconnect();
      }
    });
  }, { threshold: 0.1 });
  obs.observe(compTable);
}

// ── Counter Animation ───────────────────────────────────────
function animateCounter(el) {
  if (el.dataset.animated) return;
  el.dataset.animated = '1';
  const target = parseInt(el.dataset.target, 10);
  const duration = 1600;
  const start = performance.now();
  function step(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(ease * target);
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = target;
  }
  requestAnimationFrame(step);
}

// ── Comparison Table Data & Render ─────────────────────────
const compData = [
  {
    criterion: 'Flexibilidad',
    scrum: { text: 'Muy alta — se adapta cada sprint', val: 90 },
    rup:   { text: 'Baja — cambios costosos post-inicio', val: 30 }
  },
  {
    criterion: 'Documentación',
    scrum: { text: 'Mínima y funcional', val: 25 },
    rup:   { text: 'Exhaustiva y formal', val: 95 }
  },
  {
    criterion: 'Velocidad de entrega',
    scrum: { text: 'Rápida — desde el primer sprint', val: 88 },
    rup:   { text: 'Tardía — valor al final', val: 35 }
  },
  {
    criterion: 'Gestión del cambio',
    scrum: { text: 'Bienvenido en cualquier momento', val: 95 },
    rup:   { text: 'Controlado y costoso', val: 30 }
  },
  {
    criterion: 'Escalabilidad',
    scrum: { text: 'Requiere frameworks adicionales', val: 45 },
    rup:   { text: 'Diseñado para proyectos grandes', val: 85 }
  },
  {
    criterion: 'Participación del cliente',
    scrum: { text: 'Alta — continua y activa', val: 92 },
    rup:   { text: 'Moderada — en fases clave', val: 50 }
  },
  {
    criterion: 'Tamaño ideal del equipo',
    scrum: { text: '3–9 personas', val: 40 },
    rup:   { text: '10+ personas, equipos grandes', val: 85 }
  },
  {
    criterion: 'Gestión del riesgo',
    scrum: { text: 'Iterativa — detecta rápido', val: 72 },
    rup:   { text: 'Formal — mitigación planificada', val: 88 }
  },
  {
    criterion: 'Planificación',
    scrum: { text: 'Ligera y evolutiva', val: 35 },
    rup:   { text: 'Exhaustiva desde el inicio', val: 90 }
  },
  {
    criterion: 'Costo inicial',
    scrum: { text: 'Bajo — poca configuración', val: 20 },
    rup:   { text: 'Alto — setup y documentación', val: 80 }
  },
  {
    criterion: 'Trazabilidad',
    scrum: { text: 'Básica — backlog e historias', val: 40 },
    rup:   { text: 'Total — desde requisito a entrega', val: 98 }
  },
  {
    criterion: 'Sector recomendado',
    scrum: { text: 'Tech, startups, productos digitales', val: 85 },
    rup:   { text: 'Banca, gobierno, aeronáutica', val: 85 }
  }
];

function renderCompTable() {
  const container = document.getElementById('comp-rows');
  if (!container) return;

  compData.forEach((row, i) => {
    const div = document.createElement('div');
    div.className = 'ct-row';
    div.innerHTML = `
      <div class="ct-name">${row.criterion}</div>
      <div class="ct-val">
        <span class="ct-val-text">${row.scrum.text}</span>
        <div class="ct-bar-wrap">
          <div class="ct-bar bar-scrum" data-w="${row.scrum.val}" style="width:0%"></div>
        </div>
      </div>
      <div class="ct-val">
        <span class="ct-val-text">${row.rup.text}</span>
        <div class="ct-bar-wrap">
          <div class="ct-bar bar-rup" data-w="${row.rup.val}" style="width:0%"></div>
        </div>
      </div>
    `;
    container.appendChild(div);
  });
}

renderCompTable();

// ── RUP Bar animation ───────────────────────────────────────
const rupBars = document.querySelectorAll('.rp-bar');
const rupObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.opacity = '1';
      rupObs.unobserve(e.target);
    }
  });
}, { threshold: 0.3 });
rupBars.forEach(b => {
  b.style.opacity = '0';
  b.style.transition = 'opacity 0.8s ease';
  rupObs.observe(b);
});

// ── Smooth hover glow on nav scroll ────────────────────────
let lastScroll = 0;
const nav = document.getElementById('main-nav');
window.addEventListener('scroll', () => {
  if (window.scrollY > 80) {
    nav.style.background = 'rgba(8,12,20,0.95)';
  } else {
    nav.style.background = 'rgba(8,12,20,0.85)';
  }
  lastScroll = window.scrollY;
}, { passive: true });

// ── Sprint flow hover ───────────────────────────────────────
document.querySelectorAll('.sprint-event').forEach(el => {
  el.addEventListener('mouseenter', () => {
    el.style.boxShadow = '0 0 20px rgba(59,130,246,0.2)';
  });
  el.addEventListener('mouseleave', () => {
    el.style.boxShadow = '';
  });
});

// ── Keyboard navigation ─────────────────────────────────────
document.addEventListener('keydown', e => {
  const sectionsList = Array.from(sections);
  const current = sectionsList.findIndex(s => window.scrollY >= s.offsetTop - 200);
  if (e.key === 'ArrowDown' && current < sectionsList.length - 1) {
    sectionsList[current + 1].scrollIntoView({ behavior: 'smooth' });
  }
  if (e.key === 'ArrowUp' && current > 0) {
    sectionsList[current - 1].scrollIntoView({ behavior: 'smooth' });
  }
});

// ── Phase hover highlight (RUP) ─────────────────────────────
document.querySelectorAll('.rup-phase').forEach(phase => {
  phase.addEventListener('mouseenter', () => {
    const bar = phase.querySelector('.rp-bar');
    if (bar) bar.style.background = 'linear-gradient(180deg, rgba(245,158,11,0.9) 0%, rgba(245,158,11,0.3) 100%)';
  });
  phase.addEventListener('mouseleave', () => {
    const bar = phase.querySelector('.rp-bar');
    if (bar) bar.style.background = '';
  });
});

// ── CTA scroll pulse ────────────────────────────────────────
const cta = document.querySelector('.cta-btn');
if (cta) {
  let pulse = true;
  setInterval(() => {
    if (window.scrollY > 100) return;
    if (pulse) {
      cta.style.boxShadow = '0 0 0 8px rgba(59,130,246,0.15)';
    } else {
      cta.style.boxShadow = '0 8px 32px rgba(59,130,246,0.4)';
    }
    pulse = !pulse;
  }, 1200);
}

// ── Initial section fade ────────────────────────────────────
document.querySelectorAll('.section-label.reveal').forEach(el => {
  revealObserver.observe(el);
});
