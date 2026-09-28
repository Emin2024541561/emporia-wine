/**
 * loader.js — the opening (§37).
 *
 * A drop of wine forms in the Emporia roundel and fills as the real assets
 * load; when it is full the drop floods the screen in burgundy and the flood
 * peels away to reveal the hero. Progress is genuine: it tracks the decode of
 * the images the first screen actually needs.
 */
import { $ } from './util.js';
import { env } from './env.js';
import { startScroll, stopScroll } from './scroll.js';

const CRITICAL = [
  'assets/img/heritage/imperial-vineyards-1886-workers.webp',
  'assets/img/brand/emporia-logo-mark.webp',
  'assets/img/brand/emporia-logo-lockup.webp',
];

export function initLoader(onDone) {
  const el = $('.loader');
  const pct = $('.loader__pct');
  const arc = $('.loader__arc');
  const fill = $('.loader__fill');
  const flood = $('.loader__flood');
  if (!el) { onDone?.(); return; }

  document.body.classList.add('is-loading');
  stopScroll();

  const LEN = Number(arc?.dataset.len || 289);
  let shown = 0, target = 0, done = false;

  const draw = () => {
    shown += (target - shown) * 0.12;
    if (pct) pct.textContent = String(Math.round(shown)).padStart(2, '0');
    if (arc) arc.style.strokeDashoffset = String(LEN * (1 - shown / 100));
    if (fill) fill.style.transform = `scaleY(${(shown / 100).toFixed(3)})`;
    if (!done || shown < 99.4) requestAnimationFrame(draw);
    else finish();
  };
  requestAnimationFrame(draw);

  // Real progress: count decoded critical images, then the document load event.
  let loaded = 0;
  const total = CRITICAL.length + 1;
  const bump = () => { loaded++; target = Math.min(96, (loaded / total) * 100); };

  CRITICAL.forEach((src) => {
    const i = new Image();
    i.onload = i.onerror = bump;
    i.src = src;
  });

  const onWinLoad = () => { bump(); target = 100; done = true; };
  if (document.readyState === 'complete') setTimeout(onWinLoad, 120);
  else window.addEventListener('load', onWinLoad, { once: true });

  // Safety valve: never trap the visitor behind a stuck loader (§81).
  setTimeout(() => { target = 100; done = true; }, 6000);

  let finished = false;
  function finish() {
    if (finished) return;
    finished = true;

    const reveal = () => {
      el.remove();
      document.body.classList.remove('is-loading');
      startScroll();
      onDone?.();
    };

    if (env.reduced || !flood) { el.style.opacity = '0'; setTimeout(reveal, 200); return; }

    // Burgundy flood in, hero behind, flood peels away downward.
    const tl = gsap.timeline({ defaults: { ease: 'expo.inOut' } });
    tl.to(el.querySelector('.loader__inner'), { opacity: 0, y: -18, duration: 0.5, ease: 'power2.in' })
      .set(flood, { clipPath: 'inset(100% 0 0 0)' })
      .to(flood, { clipPath: 'inset(0% 0 0 0)', duration: 0.9 }, '-=0.15')
      .add(reveal)
      .to(flood, { clipPath: 'inset(0 0 100% 0)', duration: 1.1 }, '+=0.05')
      .set(flood, { display: 'none' });
  }
}
