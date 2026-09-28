/**
 * parallax.js — scroll-linked motion that isn't WebGL.
 *
 * Three behaviours, all declarative:
 *   [data-parallax="0.18"]      element drifts against the scroll
 *   [data-plate-parallax]       image inside a .plate over-scans and drifts
 *   [data-tilt]                 element tilts a few degrees toward the cursor
 *
 * Everything runs off one shared rAF loop and switches off under
 * prefers-reduced-motion.
 */
import { $$, clamp, lerp } from './util.js';
import { env } from './env.js';

export function initParallax() {
  if (env.reduced) return;

  const items = [
    ...$$('[data-parallax]').map(el => ({ el, k: Number(el.dataset.parallax) || 0.15, axis: el.dataset.parallaxAxis || 'y' })),
    ...$$('[data-plate-parallax]').map(el => ({ el, k: Number(el.dataset.plateParallax) || 0.12, axis: 'y', scale: true })),
  ];
  if (!items.length) return;

  // Pre-scale over-scanned plates so the drift never exposes an edge.
  items.forEach(i => { if (i.scale) i.el.style.willChange = 'transform'; });

  let ticking = false;
  const update = () => {
    const vh = window.innerHeight;
    items.forEach((i) => {
      const r = i.el.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;   // cull offscreen work
      const progress = (r.top + r.height / 2 - vh / 2) / vh;  // -1 … 1
      const shift = -progress * i.k * 100;
      i.el.style.transform = i.axis === 'x'
        ? `translate3d(${shift.toFixed(2)}px,0,0)`
        : `translate3d(0,${shift.toFixed(2)}px,0)${i.scale ? ' scale(1.14)' : ''}`;
    });
    ticking = false;
  };

  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  update();
}

/** Cursor-reactive tilt for bottles and medals — max a few degrees. */
export function initTilt() {
  if (!env.fine || env.reduced) return;
  $$('[data-tilt]').forEach((el) => {
    const amp = Number(el.dataset.tilt) || 6;
    const scope = el.closest('section') || el.parentElement;
    let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;

    const loop = () => {
      cx = lerp(cx, tx, 0.08); cy = lerp(cy, ty, 0.08);
      el.style.transform = `perspective(1600px) rotateY(${cx.toFixed(2)}deg) rotateX(${(-cy).toFixed(2)}deg) translate3d(${(cx * 1.5).toFixed(1)}px,${(cy * -1.2).toFixed(1)}px,0)`;
      raf = (Math.abs(cx - tx) > 0.02 || Math.abs(cy - ty) > 0.02) ? requestAnimationFrame(loop) : 0;
    };

    scope.addEventListener('mousemove', (e) => {
      const r = scope.getBoundingClientRect();
      tx = clamp((e.clientX - (r.left + r.width / 2)) / (r.width / 2), -1, 1) * amp;
      ty = clamp((e.clientY - (r.top + r.height / 2)) / (r.height / 2), -1, 1) * amp;
      if (!raf) raf = requestAnimationFrame(loop);
    }, { passive: true });

    scope.addEventListener('mouseleave', () => { tx = 0; ty = 0; if (!raf) raf = requestAnimationFrame(loop); });
  });
}

/** Horizontal drag for the estate rail — pointer, wheel and keyboard. */
export function initDragRail() {
  $$('[data-drag-rail]').forEach((rail) => {
    let down = false, startX = 0, startLeft = 0;

    rail.addEventListener('pointerdown', (e) => {
      down = true; startX = e.clientX; startLeft = rail.scrollLeft;
      rail.classList.add('is-dragging'); rail.setPointerCapture(e.pointerId);
    });
    rail.addEventListener('pointermove', (e) => {
      if (!down) return;
      rail.scrollLeft = startLeft - (e.clientX - startX) * 1.15;
    });
    const up = (e) => {
      down = false; rail.classList.remove('is-dragging');
      try { rail.releasePointerCapture(e.pointerId); } catch {}
    };
    rail.addEventListener('pointerup', up);
    rail.addEventListener('pointercancel', up);

    // Vertical wheel scrolls the rail horizontally while the pointer is over it.
    rail.addEventListener('wheel', (e) => {
      if (Math.abs(e.deltaY) < Math.abs(e.deltaX)) return;
      const atStart = rail.scrollLeft <= 0 && e.deltaY < 0;
      const atEnd = rail.scrollLeft >= rail.scrollWidth - rail.clientWidth - 1 && e.deltaY > 0;
      if (atStart || atEnd) return;         // hand the scroll back to the page
      e.preventDefault();
      rail.scrollLeft += e.deltaY;
    }, { passive: false });
  });
}
