import { Experience } from './experience.js';
import { SECTIONS, mapRange, smoothstep, clamp01 } from './sections.js';

function supportsWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl')));
  } catch (e) {
    return false;
  }
}

const canvas = document.getElementById('webgl');
let experience = null;
let webglOK = supportsWebGL();

if (webglOK) {
  try {
    experience = new Experience(canvas);
  } catch (err) {
    console.error('3D experience failed to initialize — falling back to static background.', err);
    webglOK = false;
  }
}

if (!webglOK) {
  document.body.classList.add('no-webgl');
}

/* ---------------- Panels ---------------- */

const panels = Array.from(document.querySelectorAll('.panel'));

function panelOpacity(progress, sec, { fadeIn = true, fadeOut = true } = {}) {
  const fadeMargin = (sec.end - sec.start) * 0.28;
  const inEnd = sec.start + (fadeIn ? fadeMargin : 0);
  const outStart = sec.end - (fadeOut ? fadeMargin : 0);
  if (progress <= sec.start) return fadeIn ? 0 : 1;
  if (progress < inEnd) return smoothstep(mapRange(progress, sec.start, inEnd));
  if (progress <= outStart) return 1;
  if (!fadeOut) return 1;
  if (progress < sec.end) return 1 - smoothstep(mapRange(progress, outStart, sec.end));
  return 0;
}

function updatePanels(progress) {
  panels.forEach((panel) => {
    const sec = SECTIONS.find((s) => s.key === panel.dataset.key);
    if (!sec) return;
    const op = panelOpacity(progress, sec, {
      fadeIn: sec.key !== 'hero',
      fadeOut: sec.key !== 'contact',
    });
    panel.style.opacity = op.toFixed(3);
    panel.style.transform = `translateY(${(1 - op) * 24}px)`;
    panel.classList.toggle('active-interactive', op > 0.6);
  });
}

/* ---------------- Scene rail ---------------- */

const RAIL_GROUPS = {
  hero: ['hero'],
  problem: ['problem'],
  hyfin: ['hyfin-a', 'hyfin-b', 'hyfin-c'],
  credentials: ['credentials'],
  research: ['research'],
  contact: ['contact'],
};

const railDots = Array.from(document.querySelectorAll('.rail-dot'));

function currentSectionKey(progress) {
  const sec = SECTIONS.find((s) => progress >= s.start && progress < s.end);
  return (sec || SECTIONS[SECTIONS.length - 1]).key;
}

function updateRail(progress) {
  const key = currentSectionKey(progress);
  const group = Object.keys(RAIL_GROUPS).find((g) => RAIL_GROUPS[g].includes(key));
  railDots.forEach((dot) => dot.classList.toggle('active', dot.dataset.target === group));
}

railDots.forEach((dot) => {
  dot.addEventListener('click', () => {
    const keys = RAIL_GROUPS[dot.dataset.target];
    const sec = SECTIONS.find((s) => s.key === keys[0]);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo({ top: sec.start * max, behavior: 'smooth' });
  });
});

/* ---------------- Research drawer ---------------- */

const drawer = document.getElementById('research-drawer');
const openBtn = document.getElementById('research-toggle');
const closeBtn = document.getElementById('research-close');

function openDrawer() {
  drawer.classList.add('open');
  drawer.setAttribute('aria-hidden', 'false');
  openBtn.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
}

function closeDrawer() {
  drawer.classList.remove('open');
  drawer.setAttribute('aria-hidden', 'true');
  openBtn.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

if (openBtn && drawer && closeBtn) {
  openBtn.addEventListener('click', openDrawer);
  closeBtn.addEventListener('click', closeDrawer);
  drawer.addEventListener('click', (e) => { if (e.target === drawer) closeDrawer(); });
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeDrawer(); });
}

/* ---------------- Citation chart ---------------- */

function initChart() {
  const ctx = document.getElementById('citationChart');
  if (!ctx || !window.Chart) return;
  new window.Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['2020', '2021', '2022', '2023', '2024', '2025'],
      datasets: [
        {
          label: 'Citations',
          data: [2, 5, 14, 15, 20, 53],
          backgroundColor: 'rgba(111, 227, 196, 0.55)',
          borderRadius: 4,
          barPercentage: 0.6,
          categoryPercentage: 0.7,
          order: 2,
        },
        {
          label: 'Cumulative',
          data: [2, 7, 21, 36, 56, 109],
          type: 'line',
          borderColor: '#ffb672',
          backgroundColor: 'transparent',
          borderWidth: 2,
          pointBackgroundColor: '#ffb672',
          pointRadius: 3,
          tension: 0.4,
          order: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: { color: 'rgba(244,242,238,0.8)', font: { size: 10 }, boxWidth: 10 },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { color: 'rgba(244,242,238,0.6)', font: { size: 9 } },
          grid: { color: 'rgba(255,255,255,0.08)' },
        },
        x: {
          ticks: { color: 'rgba(244,242,238,0.6)', font: { size: 9 } },
          grid: { display: false },
        },
      },
    },
  });
}

if (window.Chart) initChart();
else window.addEventListener('load', initChart);

/* ---------------- Render loop ---------------- */

function getProgress() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  return max <= 0 ? 0 : clamp01(window.scrollY / max);
}

if (webglOK) {
  let last = performance.now();
  let rafId = null;

  function loop(now) {
    const delta = Math.min((now - last) / 1000, 0.05);
    last = now;
    const progress = getProgress();
    experience.setProgress(progress);
    experience.render(delta);
    updatePanels(progress);
    updateRail(progress);
    rafId = requestAnimationFrame(loop);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = null;
    } else if (!rafId) {
      last = performance.now();
      rafId = requestAnimationFrame(loop);
    }
  });

  rafId = requestAnimationFrame(loop);

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => experience.resize(), 150);
  });
} else {
  updateRail(0);
}
