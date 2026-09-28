/**
 * renderer.js — WebGL plumbing.
 *
 * Each scene owns a renderer whose canvas lives inside its own slot element.
 * That keeps every scene correctly layered with the DOM around it. A single
 * shared full-viewport canvas would have to sit either above or below every
 * section background at once, which is exactly wrong for a site where one
 * scene is a hero backdrop and another is a mid-layer sandwiched between
 * photographs and type.
 *
 * The cost of separate contexts is bounded: three scenes, each paused the
 * moment its slot leaves the viewport or the tab is hidden, and all of them
 * torn down together if the visitor turns on reduced motion. A scene that
 * needs more than one pass into its canvas provides a `_composite()` method.
 */
import * as THREE from '../../../vendor/three.module.js';
import { env } from '../core/env.js';

const scenes = [];
let running = false;
let clock = null;

/**
 * @param {object} s  { el, scene, camera, update(dt,t,rect), resize(w,h),
 *                      dispose(), _composite? }
 *                    `el` is the slot; the canvas is created inside it.
 */
export function register(s) {
  const renderer = new THREE.WebGLRenderer({
    antialias: env.tier === 'high',
    alpha: true,
    powerPreference: 'high-performance',
    stencil: false,
  });
  renderer.setPixelRatio(env.dpr);
  const r = s.el.getBoundingClientRect();
  renderer.setSize(Math.max(1, r.width), Math.max(1, r.height), false);
  renderer.setClearColor(0x000000, 0);
  renderer.domElement.style.cssText =
    'position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none;';
  s.el.appendChild(renderer.domElement);
  s.renderer = renderer;
  s.visible = false;

  // A lost context must never take the page with it (§81).
  renderer.domElement.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    s.visible = false;
    document.documentElement.classList.add('no-webgl');
    console.warn('[emporia] WebGL context lost; the CSS fallbacks take over.');
  });

  const io = new IntersectionObserver(([e]) => { s.visible = e.isIntersecting; },
    { rootMargin: '20% 0px 20% 0px' });
  io.observe(s.el);
  s._io = io;

  scenes.push(s);
  if (!running) start();
  return s;
}

function start() {
  running = true;
  clock = new THREE.Clock();

  const frame = () => {
    if (!running) return;
    requestAnimationFrame(frame);
    if (document.hidden) return;

    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.getElapsedTime();

    for (const s of scenes) {
      if (!s.visible) continue;
      const rect = s.el.getBoundingClientRect();
      if (rect.bottom < -200 || rect.top > window.innerHeight + 200) continue;

      // A slot can be zero-sized or a different size at mount than it is when
      // it first scrolls into view (sticky stages, and the responsive layouts
      // that turn a pinned 100svh stage into an auto-height block). Keep the
      // drawing buffer matched to the slot rather than trusting mount-time.
      const w = Math.max(1, Math.round(rect.width));
      const h = Math.max(1, Math.round(rect.height));
      if (s._w !== w || s._h !== h) {
        s._w = w; s._h = h;
        s.renderer.setSize(w, h, false);
        s.resize?.(w, h);
      }

      s.update?.(dt, t, rect);
      if (s._composite) s._composite();
      else s.renderer.render(s.scene, s.camera);
    }
  };
  requestAnimationFrame(frame);

  let rt = 0;
  addEventListener('resize', () => {
    clearTimeout(rt);
    rt = setTimeout(() => {
      scenes.forEach((s) => {
        const r = s.el.getBoundingClientRect();
        s.renderer.setPixelRatio(env.dpr);
        s.renderer.setSize(Math.max(1, r.width), Math.max(1, r.height), false);
        s.resize?.(r.width, r.height);
      });
    }, 140);
  });
}

/** Full teardown — used if the visitor turns on reduced motion mid-session. */
export function disposeAll() {
  running = false;
  scenes.forEach((s) => {
    s._io?.disconnect();
    s.dispose?.();
    s.renderer?.dispose();
    s.renderer?.forceContextLoss?.();
    s.renderer?.domElement.remove();
  });
  scenes.length = 0;
}

/** Recursively free geometries, materials and textures of a scene graph. */
export function disposeScene(scene) {
  scene.traverse((o) => {
    o.geometry?.dispose?.();
    const mats = Array.isArray(o.material) ? o.material : o.material ? [o.material] : [];
    mats.forEach((m) => {
      Object.values(m).forEach(v => { if (v && v.isTexture) v.dispose(); });
      m.dispose?.();
    });
  });
}

export { THREE };
