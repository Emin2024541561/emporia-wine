/**
 * main.js — assembly.
 *
 * Order matters: markup is built first so that reveal observers, WebGL slots
 * and the scroll engine all attach to a DOM that already exists. Heavy work
 * (WebGL, drag rails, magnetism) is deferred to idle time so the first paint
 * is never blocked by it.
 */
import { env } from './core/env.js';
import { $, $$, idle, clamp } from './core/util.js';
import { initScroll } from './core/scroll.js';
import { initLoader } from './core/loader.js';
import { initReveal } from './core/reveal.js';
import { initCursor, initMagnetic } from './core/cursor.js';
import { initNav, initMenu, initAnchors, initRail, initAccent } from './core/chrome.js';
import { initParallax, initTilt, initDragRail } from './core/parallax.js';

import { heroHTML, epigraphHTML, historyHTML, timelineHTML, aboutHTML, terroirHTML, estateHTML } from './sections/story.js';
import { winesHTML, spiritsHTML } from './sections/wines.js';
import { awardsHTML, geoHTML, contactHTML, footerHTML } from './sections/closing.js';
import { nav } from './data/content.js';

/* ── 1. Build the document ────────────────────────────────────────────────── */
function build() {
  $('#app').innerHTML = [
    heroHTML(), epigraphHTML(), historyHTML(), timelineHTML(), aboutHTML(),
    terroirHTML(), estateHTML(), winesHTML(), spiritsHTML(),
    awardsHTML(), geoHTML(), contactHTML(),
  ].join('\n');
  $('#app').insertAdjacentHTML('afterend', footerHTML());
  dispatchEvent(new Event('emporia:built'));
}

/* ── 2. Horizontal timeline: the chapter pins, the track travels sideways ──
   The section is given the extra height the track needs; its viewport is
   sticky, so for the whole of that height the screen holds still vertically
   and only the track moves. Scroll input stays native — wheel, trackpad,
   touch, keyboard and the scrollbar all drive it, and nothing is hijacked. */
function initTimeline() {
  const section  = $('.timeline');
  const viewport = $('.timeline__viewport');
  const track    = $('.js-timeline-track');
  const progress = $('.js-timeline-progress');
  if (!section || !viewport || !track) return;

  const small = window.matchMedia('(max-width: 720px)');
  let overflow = 0;
  let pinned = false;

  /** Small screens and reduced motion: the track stacks, nothing is pinned. */
  const release = () => {
    pinned = false;
    overflow = 0;
    section.style.height = '';
    section.removeAttribute('data-overflow');
    section.classList.remove('is-pinned');
    track.style.transform = '';
    if (progress) progress.style.width = '';
  };

  const measure = () => {
    if (small.matches || env.reduced) return release();
    pinned = true;
    section.classList.add('is-pinned');
    // How far the track sticks out past the screen is how far it must travel…
    overflow = Math.max(0, track.scrollWidth - viewport.clientWidth);
    // …and that is exactly the extra scroll length the section is given.
    section.style.height = `${Math.round(window.innerHeight + overflow)}px`;
    section.dataset.overflow = String(Math.round(overflow));
    update();
  };

  const update = () => {
    if (!pinned) return;
    const distance = section.offsetHeight - window.innerHeight;
    const p = clamp(-section.getBoundingClientRect().top / Math.max(distance, 1), 0, 1);
    track.style.transform = `translate3d(${(-p * overflow).toFixed(2)}px,0,0)`;
    if (progress) progress.style.width = `${(p * 100).toFixed(2)}%`;
  };

  let ticking = false;
  const schedule = (fn) => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { ticking = false; fn(); });
  };

  addEventListener('scroll', () => schedule(update), { passive: true });
  addEventListener('resize', () => schedule(measure));
  small.addEventListener('change', measure);
  // Web fonts land after first paint and change how wide the track is.
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
  addEventListener('emporia:revealed', measure);
  measure();
}

/* ── 3. The imperial route draws itself when the map arrives ──────────────── */
function initGeoRoute() {
  const path = $('.js-geo-route');
  if (!path) return;
  const len = path.getTotalLength();
  path.style.setProperty('--len', String(len));
  path.style.strokeDasharray = String(len);
  path.style.strokeDashoffset = env.reduced ? '0' : String(len);

  const pins = $$('.js-geo-pin');
  const ring = $('.js-geo-ring');
  if (env.reduced) { pins.forEach(p => p.style.opacity = '1'); if (ring) ring.style.opacity = '0.6'; return; }

  const io = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) return;
    io.disconnect();
    gsap.to(path, { strokeDashoffset: 0, duration: 2.4, ease: 'power2.inOut' });
    gsap.to(pins, { opacity: 1, duration: 0.6, stagger: 1.6, ease: 'power2.out' });
    if (ring) gsap.fromTo(ring,
      { opacity: 0.9, attr: { r: 0.7 } },
      { opacity: 0, attr: { r: 5 }, duration: 2.2, repeat: -1, ease: 'power2.out', delay: 1.8 });
  }, { threshold: 0.35 });
  io.observe($('.geo'));
}

/* ── 4. Bottles drift a little as their room is scrolled ──────────────────── */
function initBottleMotion() {
  if (env.reduced) return;
  $$('.js-bottle').forEach((b) => b.setAttribute('data-tilt', '5'));
  $$('.wine__disc img').forEach((i) => i.setAttribute('data-plate-parallax', '0.08'));
  $$('.estate__plate img').forEach((i) => i.setAttribute('data-plate-parallax', '0.1'));
  const h = $('.js-hist-img');
  if (h) h.setAttribute('data-plate-parallax', '0.09');
}

/* ── 5. Torn-edge mask for the wine ribbons, generated once ───────────────── */
function installTornMask() {
  // A hand-drawn-feeling ragged edge, matching the brochure's torn colour bands.
  let d = 'M0,40 ';
  let x = 0;
  const seedRand = (() => { let s = 7; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
  while (x < 1000) {
    const step = 18 + seedRand() * 46;
    const y = 18 + seedRand() * 34;
    d += `Q${(x + step / 2).toFixed(1)},${(y + (seedRand() - 0.5) * 22).toFixed(1)} ${(x + step).toFixed(1)},${y.toFixed(1)} `;
    x += step;
  }
  d += 'L1000,200 L0,200 Z';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 200" preserveAspectRatio="none"><path d="${d}" fill="#fff"/></svg>`;
  document.documentElement.style.setProperty('--torn-mask', `url("data:image/svg+xml,${encodeURIComponent(svg)}")`);
}

/* ── 6. Film grain, generated rather than shipped as a file ───────────────── */
function installGrain() {
  const s = 128;
  const c = document.createElement('canvas');
  c.width = c.height = s;
  const ctx = c.getContext('2d');
  const d = ctx.createImageData(s, s);
  for (let i = 0; i < d.data.length; i += 4) {
    const v = 120 + Math.random() * 135;
    d.data[i] = d.data[i + 1] = d.data[i + 2] = v;
    d.data[i + 3] = 26;
  }
  ctx.putImageData(d, 0, 0);
  document.documentElement.style.setProperty('--grain-url', `url(${c.toDataURL('image/png')})`);
}

/* ── 7. WebGL, loaded only when it is actually wanted ─────────────────────── */
async function initWebGL() {
  if (!env.gl) return;
  try {
    const [{ initHeroScene }, { initGrapeField }, { initAwardHall }] = await Promise.all([
      import('./three/hero-scene.js'),
      import('./three/grape-field.js'),
      import('./three/award-hall.js'),
    ]);
    initHeroScene($('.hero__canvas'), { src: 'assets/img/heritage/imperial-vineyards-1886-workers.webp' });
    initGrapeField($('.terroir__canvas'));
    initAwardHall($('.awards__canvas'));
  } catch (err) {
    // A WebGL failure must never take the site with it (§79, §81).
    console.warn('[emporia] WebGL scenes unavailable, continuing with CSS fallbacks.', err);
    document.documentElement.classList.add('no-webgl');
  }
}

/* ── Boot ─────────────────────────────────────────────────────────────────── */
function boot() {
  installGrain();
  installTornMask();
  build();

  const lenisInstance = initScroll();

  // A small debug surface: useful for automated visual QA and for anyone
  // wiring the site into an analytics or scroll-restoration layer.
  window.emporia = { env, lenis: lenisInstance, version: '1.0.0' };
  initReveal();
  initNav();
  initMenu();
  initAnchors();
  initAccent();
  initRail(nav);
  initTimeline();
  initGeoRoute();
  initBottleMotion();
  initParallax();

  initLoader(() => {
    // WebGL is imported during idle time, which can land either side of this
    // moment. A flag as well as an event means a scene that mounts late still
    // knows the curtain is already up.
    window.emporia.revealed = true;
    dispatchEvent(new Event('emporia:revealed'));
    // Deep link support: honour a #hash once the curtain is up.
    if (location.hash && location.hash.length > 1) {
      const t = document.querySelector(location.hash);
      if (t) setTimeout(() => t.scrollIntoView({ behavior: 'auto', block: 'start' }), 60);
    }
  });

  idle(() => {
    initCursor();
    initMagnetic();
    initTilt();
    initDragRail();
    initWebGL();
  });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();
