/**
 * env.js — capability detection.
 * Everything expensive in this site asks `env` for permission first (§39, §40, §80).
 */

const mq = (q) => window.matchMedia(q).matches;

function detectWebGL() {
  try {
    const c = document.createElement('canvas');
    const gl = c.getContext('webgl2') || c.getContext('webgl') || c.getContext('experimental-webgl');
    if (!gl) return false;
    // A software rasteriser is technically WebGL but not worth the battery.
    const dbg = gl.getExtension('WEBGL_debug_renderer_info');
    if (dbg) {
      const r = String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) || '').toLowerCase();
      if (r.includes('swiftshader') || r.includes('llvmpipe')) return false;
    }
    return true;
  } catch { return false; }
}

/** Rough device tier, used to scale particle counts and pixel ratio. */
function detectTier() {
  const cores = navigator.hardwareConcurrency || 4;
  const mem = navigator.deviceMemory || 4;
  const coarse = mq('(hover: none)');
  const small = window.innerWidth < 900;
  if (coarse && (cores <= 4 || mem <= 4)) return 'low';
  if (small || cores <= 4 || mem <= 4) return 'mid';
  return 'high';
}

export const env = {
  reduced: mq('(prefers-reduced-motion: reduce)'),
  webgl: detectWebGL(),
  touch: mq('(hover: none)') || 'ontouchstart' in window,
  fine: mq('(hover: hover) and (pointer: fine)'),
  tier: detectTier(),
  get dpr() {
    const cap = this.tier === 'low' ? 1 : this.tier === 'mid' ? 1.5 : 2;
    return Math.min(window.devicePixelRatio || 1, cap);
  },
  /** Should we run any WebGL at all? */
  get gl() { return this.webgl && !this.reduced && this.tier !== 'low'; },
};

// Announce capability to CSS so the stylesheet can serve fallbacks.
const root = document.documentElement;
root.classList.toggle('no-webgl', !env.gl);
root.classList.toggle('reduced-motion', env.reduced);
root.classList.add(`tier-${env.tier}`);

/** Respond live if the visitor flips their motion preference. */
window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
  env.reduced = e.matches;
  root.classList.toggle('reduced-motion', e.matches);
  root.classList.toggle('no-webgl', !env.gl);
});
