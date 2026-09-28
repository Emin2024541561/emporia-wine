/** Small shared helpers. */

export const $  = (s, c = document) => c.querySelector(s);
export const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp  = (a, b, t) => a + (b - a) * t;
export const map   = (v, a, b, c, d) => c + ((v - a) / (b - a)) * (d - c);
export const ease  = { out3: (t) => 1 - Math.pow(1 - t, 3), inOut: (t) => t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3)/2 };

/** Escape user-invisible characters that would otherwise break markup. */
export const esc = (s = '') => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** '#BB9350' → '187 147 80' for CSS colour-mix / rgb() slash syntax. */
export function hexToRgbTriplet(hex) {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16);
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
}

export function hexToRgb01(hex) {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

/**
 * Build a <picture>-style responsive <img>.
 * Every asset in this site ships at two widths; the small one covers phones.
 */
export function img(name, alt, { cls = '', sizes = '100vw', eager = false, w, h } = {}) {
  const base = `assets/img/${name}`;
  return `<img
    src="${base}.webp"
    srcset="${base}@sm.webp 760w, ${base}.webp 1600w"
    sizes="${sizes}"
    alt="${esc(alt)}"
    ${w ? `width="${w}"` : ''} ${h ? `height="${h}"` : ''}
    loading="${eager ? 'eager' : 'lazy'}"
    decoding="async"
    ${eager ? 'fetchpriority="high"' : ''}
    class="${cls}">`;
}

/** requestIdleCallback with a setTimeout fallback. */
export const idle = (fn, timeout = 1200) =>
  ('requestIdleCallback' in window)
    ? requestIdleCallback(fn, { timeout })
    : setTimeout(fn, 1);

/** A tiny pub/sub so modules stay decoupled. */
const bus = new Map();
export const on   = (k, fn) => { (bus.get(k) ?? bus.set(k, []).get(k)).push(fn); };
export const emit = (k, v)  => { (bus.get(k) || []).forEach(fn => fn(v)); };

/* ── Colour: keep a chapter accent legible as type on a dark ground ──────────
 * Some of the brochure's own accents (the Blatina Limited Edition burgundy
 * #602A39, for instance) are beautiful as a printed ink but far too dark to
 * set type in on a near-black screen. This lightens an accent just enough to
 * clear a contrast target, leaving the original untouched for ribbons, glows
 * and rules where legibility is not at stake.
 */
function srgbToLin(c) { c /= 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }

export function luminance(hex) {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  return 0.2126 * srgbToLin(r) + 0.7152 * srgbToLin(g) + 0.0722 * srgbToLin(b);
}

export function contrast(a, b) {
  const l1 = luminance(a), l2 = luminance(b);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

/** Lighten `hex` toward white until it clears `target` contrast against `bg`. */
export function readableOn(hex, bg = '#0C0A0B', target = 4.6) {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16);
  let [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  const to = (r, g, b) => '#' + [r, g, b].map(v => Math.round(v).toString(16).padStart(2, '0')).join('');
  let out = to(r, g, b);
  for (let t = 0; t <= 1.0001 && contrast(out, bg) < target; t += 0.04) {
    out = to(r + (255 - r) * t, g + (255 - g) * t, b + (255 - b) * t);
  }
  return out;
}
