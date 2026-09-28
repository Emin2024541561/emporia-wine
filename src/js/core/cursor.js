/**
 * cursor.js — a restrained two-part cursor (§31).
 * Desktop + fine pointer only; it never replaces a real affordance, and it
 * disappears entirely for keyboard users the moment focus moves.
 */
import { $, $$, lerp } from './util.js';
import { env } from './env.js';

export function initCursor() {
  if (!env.fine || env.reduced) return;

  const root = $('.cursor');
  const dot = $('.cursor__dot');
  const ring = $('.cursor__ring');
  const label = $('.cursor__label');
  if (!root) return;

  document.body.classList.add('has-cursor');

  let mx = innerWidth / 2, my = innerHeight / 2;
  let rx = mx, ry = my;

  // Stay invisible until the pointer actually moves, so a keyboard or
  // touch visitor never sees a stray dot parked in the middle of the page.
  root.classList.add('is-hidden');
  addEventListener('mousemove', (e) => {
    mx = e.clientX; my = e.clientY;
    root.classList.remove('is-hidden');
  }, { passive: true });
  addEventListener('mouseleave', () => root.classList.add('is-hidden'));
  addEventListener('mouseenter', () => root.classList.remove('is-hidden'));

  (function frame() {
    rx = lerp(rx, mx, 0.16); ry = lerp(ry, my, 0.16);
    dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%,-50%)`;
    ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%,-50%)`;
    requestAnimationFrame(frame);
  })();

  // Interactive targets declare the word the cursor should say.
  const bind = () => {
    $$('[data-cursor]').forEach((el) => {
      if (el.dataset.cursorBound) return;
      el.dataset.cursorBound = '1';
      el.addEventListener('mouseenter', () => {
        root.classList.add('is-active');
        label.textContent = el.dataset.cursor || '';
      });
      el.addEventListener('mouseleave', () => {
        root.classList.remove('is-active');
        label.textContent = '';
      });
    });
  };
  bind();
  // Sections are built at runtime, so re-bind once the DOM settles.
  addEventListener('emporia:built', bind);
}

/**
 * Magnetic behaviour for buttons and medals (§32) — deliberately shallow,
 * so it reads as premium rather than playful.
 */
export function initMagnetic() {
  if (!env.fine || env.reduced) return;
  $$('[data-magnetic]').forEach((el) => {
    const strength = Number(el.dataset.magnetic) || 0.22;
    let raf = 0, tx = 0, ty = 0, cx = 0, cy = 0;

    const loop = () => {
      cx = lerp(cx, tx, 0.18); cy = lerp(cy, ty, 0.18);
      el.style.transform = `translate(${cx.toFixed(2)}px, ${cy.toFixed(2)}px)`;
      raf = (Math.abs(cx - tx) > 0.05 || Math.abs(cy - ty) > 0.05) ? requestAnimationFrame(loop) : 0;
    };

    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      tx = (e.clientX - (r.left + r.width / 2)) * strength;
      ty = (e.clientY - (r.top + r.height / 2)) * strength;
      if (!raf) raf = requestAnimationFrame(loop);
    });
    el.addEventListener('mouseleave', () => {
      tx = 0; ty = 0;
      if (!raf) raf = requestAnimationFrame(loop);
    });
  });
}
