/**
 * scroll.js — smooth scrolling (Lenis) wired into GSAP's ScrollTrigger.
 * Falls back to native scrolling when the visitor prefers reduced motion.
 */
import Lenis from '../../../vendor/lenis.module.js';
import { env } from './env.js';

export let lenis = null;

export function initScroll() {
  if (env.reduced || env.touch) {
    // Native scrolling: better for touch inertia and for reduced-motion users.
    document.documentElement.style.scrollBehavior = env.reduced ? 'auto' : 'smooth';
    ScrollTrigger.defaults({ scroller: window });
    return null;
  }

  lenis = new Lenis({
    duration: 1.15,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),  // expo-out
    smoothWheel: true,
    wheelMultiplier: 0.95,
    touchMultiplier: 1.6,
    lerp: 0.09,
  });

  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  return lenis;
}

/** One scroll-to used by nav, menu and the wine index. */
export function scrollTo(target, opts = {}) {
  const el = typeof target === 'string' ? document.querySelector(target) : target;
  if (!el) return;
  if (lenis) lenis.scrollTo(el, { offset: 0, duration: 1.3, ...opts });
  else el.scrollIntoView({ behavior: env.reduced ? 'auto' : 'smooth', block: 'start' });
}

export const stopScroll  = () => lenis ? lenis.stop()  : document.body.classList.add('is-loading');
export const startScroll = () => lenis ? lenis.start() : document.body.classList.remove('is-loading');
