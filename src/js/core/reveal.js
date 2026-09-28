/**
 * reveal.js — the entrance system.
 *
 * Every reveal in the site is declared in markup with `data-reveal="<kind>"`,
 * where kind is one of: up · fade · wipe-up · wipe-dn · iris · curtain ·
 * scale · blur · rot.  Neighbouring sections deliberately use different kinds
 * so no two consecutive transitions read the same (§12).
 *
 * `data-stagger` on a parent staggers its `data-reveal` children.
 * `data-split="lines|chars"` prepares text for a masked line or character reveal.
 */
import { $$, esc } from './util.js';
import { env } from './env.js';

/** Wrap each word/char so it can be animated without breaking selection. */
export function splitText(el, mode = 'lines') {
  if (el.dataset.splitDone) return;
  const text = el.textContent.trim();
  el.dataset.splitDone = '1';

  if (mode === 'chars') {
    // Split into words first so wrapping stays natural, then chars inside words.
    let i = 0;
    el.innerHTML = text.split(/(\s+)/).map((tok) => {
      if (/^\s+$/.test(tok)) return ' ';
      const chars = Array.from(tok).map((ch) =>
        `<span class="split-char" style="--char-delay:${(i++) * 14}ms">${esc(ch)}</span>`).join('');
      return `<span style="display:inline-block;white-space:nowrap">${chars}</span>`;
    }).join('');
    // Preserve the readable string for assistive tech and for copy-paste.
    el.setAttribute('aria-label', text);
    return;
  }

  // Line mode: each source line becomes a masked row that slides up.
  const parts = text.split(/\n+/).map(s => s.trim()).filter(Boolean);
  const lines = parts.length > 1 ? parts : [text];
  el.innerHTML = lines.map((l, i) =>
    `<span class="split-line"><span style="--line-delay:${i * 90}ms">${esc(l)}</span></span>`).join('');
}

export function initReveal() {
  // Prepare split text before observing.
  $$('[data-split]').forEach((el) => splitText(el, el.dataset.split));

  // Stagger groups: assign an incremental delay to each child.
  $$('[data-stagger]').forEach((group) => {
    const step = Number(group.dataset.stagger) || 90;
    $$('[data-reveal]', group).forEach((child, i) => {
      if (!child.style.getPropertyValue('--reveal-delay'))
        child.style.setProperty('--reveal-delay', `${i * step}ms`);
    });
  });

  const targets = $$('[data-reveal], [data-split], .rule-draw');

  if (env.reduced) {
    // No animation, but everything must still be visible and complete (§40).
    targets.forEach(el => el.classList.add('is-in'));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-in');
      io.unobserve(e.target);
    });
    // threshold 0, not a ratio: zero-height rules and hairlines would never
    // reach a ratio threshold, and fast scrolling can skip past one.
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0 });

  /**
   * Horizontal containers are a special case: their children can sit far off
   * to the right and so never intersect the viewport, which would leave them
   * permanently hidden and their images permanently unloaded. When the
   * container itself arrives, we reveal its children on a stagger and promote
   * their images to eager loading (§46, §78 — content must never be lost to
   * a layout decision).
   */
  const HORIZONTAL = '[data-drag-rail], .timeline__track';
  const horizontals = $$(HORIZONTAL);
  const inHorizontal = new Set();
  horizontals.forEach(c => $$('[data-reveal], [data-split]', c).forEach(el => inHorizontal.add(el)));

  const hio = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      hio.unobserve(e.target);
      $$('img[loading="lazy"]', e.target).forEach(im => { im.loading = 'eager'; });
      $$('[data-reveal], [data-split]', e.target).forEach((el, i) => {
        el.style.setProperty('--reveal-delay', `${Math.min(i * 70, 700)}ms`);
        el.classList.add('is-in');
      });
    });
  }, { rootMargin: '20% 0px 20% 0px', threshold: 0.02 });
  horizontals.forEach(c => hio.observe(c));

  targets.forEach((el) => { if (!inHorizontal.has(el)) io.observe(el); });

  /**
   * Safety net. IntersectionObserver can miss an element during a very fast
   * scroll, an anchor jump or a restored scroll position, and a missed reveal
   * means content the visitor can never read. A cheap throttled sweep catches
   * anything the observer skipped, so no paragraph is ever lost to animation.
   */
  const sweep = () => {
    const vh = window.innerHeight;
    for (const el of targets) {
      if (el.classList.contains('is-in')) continue;
      const r = el.getBoundingClientRect();
      // Anything at or above the fold is revealed — including content the
      // visitor has already scrolled past. An anchor jump, a restored scroll
      // position or a fast flick can carry an element clean over the
      // observer's threshold; without this it would still be clipped when
      // they scrolled back up, and a paragraph nobody can read is a
      // paragraph that is missing (§46).
      if (r.top < vh * 0.92) { el.classList.add('is-in'); io.unobserve(el); }
    }
  };

  let sweeping = false;
  const queueSweep = () => {
    if (sweeping) return;
    sweeping = true;
    requestAnimationFrame(() => { sweep(); sweeping = false; });
  };
  addEventListener('scroll', queueSweep, { passive: true });
  addEventListener('resize', queueSweep);
  requestAnimationFrame(sweep);
}
