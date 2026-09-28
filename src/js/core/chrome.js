/**
 * chrome.js — navigation, the full-screen index, the chapter rail, and the
 * chapter-accent engine that tints the whole site as the story progresses (§55).
 */
import { $, $$, hexToRgbTriplet } from './util.js';
import { env } from './env.js';
import { scrollTo } from './scroll.js';

/* ── Sticky / hiding navigation ───────────────────────────────────────────── */
export function initNav() {
  const nav = $('.nav');
  if (!nav) return;
  let last = 0;

  const update = () => {
    const y = window.scrollY;
    nav.classList.toggle('is-solid', y > window.innerHeight * 0.72);
    // Hide on downward scroll once past the hero; always show on the way up.
    const hide = y > last && y > window.innerHeight * 1.1 && !document.body.classList.contains('is-menu-open');
    nav.classList.toggle('is-hidden', hide);
    last = y;
  };
  addEventListener('scroll', update, { passive: true });
  update();
}

/* ── Full-screen menu overlay ─────────────────────────────────────────────── */
export function initMenu() {
  const toggle = $('.nav__toggle');
  const menu = $('.menu');
  if (!toggle || !menu) return;

  const setOpen = (open) => {
    document.body.classList.toggle('is-menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-hidden', String(!open));
    if (open) $('.menu__item a', menu)?.focus({ preventScroll: true });
  };

  toggle.addEventListener('click', () => setOpen(!document.body.classList.contains('is-menu-open')));

  menu.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    e.preventDefault();
    setOpen(false);
    setTimeout(() => scrollTo(a.getAttribute('href')), 260);
  });

  addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.body.classList.contains('is-menu-open')) {
      setOpen(false); toggle.focus();
    }
  });
}

/* ── In-page anchors (nav links, wine index, footer) ──────────────────────── */
export function initAnchors() {
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]:not([href="#"])');
    if (!a || a.closest('.menu')) return;
    const el = document.querySelector(a.getAttribute('href'));
    if (!el) return;
    e.preventDefault();
    scrollTo(el);
    history.replaceState(null, '', a.getAttribute('href'));
  });
}

/* ── Chapter rail + current-section tracking ──────────────────────────────── */
export function initRail(sections) {
  const rail = $('.rail');
  const links = $$('.nav__link');
  if (!rail) return;

  rail.innerHTML = sections.map(s =>
    `<a class="rail__item" href="#${s.id}" aria-label="${s.label}"><span>${s.label}</span><i></i></a>`
  ).join('');

  const items = $$('.rail__item', rail);
  const targets = sections.map(s => document.getElementById(s.id)).filter(Boolean);

  const visible = new Set();
  const paint = () => {
    // The prologue and hero are not tracked sections; when none is in the band
    // the marker is cleared rather than left pointing at wherever we last were.
    const id = [...visible][visible.size - 1] || null;
    items.forEach(i => i.classList.toggle('is-current', !!id && i.getAttribute('href') === `#${id}`));
    links.forEach(l => l.classList.toggle('is-current', !!id && l.getAttribute('href') === `#${id}`));
  };

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) visible.add(e.target.id);
      else visible.delete(e.target.id);
    });
    paint();
  }, { rootMargin: '-45% 0px -45% 0px' });

  targets.forEach(t => io.observe(t));
}

/* ── Chapter accent: the site's live colour, eased between chapters ───────── */
export function initAccent() {
  const root = document.documentElement;
  const zones = $$('[data-accent]');
  if (!zones.length) return;

  let current = '';
  const apply = (hex) => {
    if (hex === current) return;
    current = hex;
    root.style.setProperty('--accent', hex);
    root.style.setProperty('--accent-rgb', hexToRgbTriplet(hex));
  };

  const io = new IntersectionObserver((entries) => {
    // Choose the most visible accent zone, so the tint never flickers.
    let best = null, bestRatio = 0;
    entries.forEach(e => { if (e.intersectionRatio > bestRatio) { bestRatio = e.intersectionRatio; best = e.target; } });
    if (best && bestRatio > 0.1) apply(best.dataset.accent);
  }, { threshold: [0.1, 0.3, 0.5, 0.75] });

  zones.forEach(z => io.observe(z));

  // Give the transition a body: CSS can't ease a custom property without this.
  if (!env.reduced) {
    root.style.setProperty('transition', 'none');
    const style = document.createElement('style');
    style.textContent = `@property --accent { syntax: '<color>'; inherits: true; initial-value: #BB9350; }
      :root { transition: --accent 900ms cubic-bezier(0.22,1,0.36,1); }`;
    document.head.appendChild(style);
  }
}
