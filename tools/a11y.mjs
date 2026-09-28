/** a11y.mjs — keyboard, contrast, semantics and reduced-motion checks. */
import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });

/* 1 · Reduced motion: content must still be complete and visible. */
const rm = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
const p1 = await rm.newPage();
const errs = []; p1.on('pageerror', e => errs.push(e.message));
await p1.goto('http://localhost:8123/index.html', { waitUntil: 'networkidle' });
await p1.waitForTimeout(2500);
const rmInfo = await p1.evaluate(() => ({
  hidden: [...document.querySelectorAll('[data-reveal]')].filter(e => !e.classList.contains('is-in')).length,
  canvases: document.querySelectorAll('canvas').length,
  noWebgl: document.documentElement.classList.contains('no-webgl'),
  reducedClass: document.documentElement.classList.contains('reduced-motion'),
  textLen: document.body.innerText.length,
  loaderGone: !document.querySelector('.loader'),
}));
console.log('REDUCED MOTION');
console.log('  unrevealed elements :', rmInfo.hidden, rmInfo.hidden === 0 ? '✓ all content visible' : '✗');
console.log('  webgl canvases      :', rmInfo.canvases, rmInfo.canvases === 0 ? '✓ 3D suppressed' : '✗');
console.log('  no-webgl class      :', rmInfo.noWebgl, '| reduced-motion class:', rmInfo.reducedClass);
console.log('  loader completed    :', rmInfo.loaderGone);
console.log('  body text length    :', rmInfo.textLen);
await p1.close();

/* 2 · Keyboard traversal and semantics. */
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
const p = await ctx.newPage();
await p.goto('http://localhost:8123/index.html', { waitUntil: 'networkidle' });
await p.waitForTimeout(3000);

const sem = await p.evaluate(() => {
  const nodes = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')];
  const hs = nodes.map(h => +h.tagName[1]);
  let jumps = 0; const jumpList = [];
  for (let i = 1; i < hs.length; i++) if (hs[i] - hs[i - 1] > 1) {
    jumps++;
    jumpList.push(`h${hs[i-1]} "${nodes[i-1].textContent.trim().slice(0,22)}" → h${hs[i]} "${nodes[i].textContent.trim().slice(0,22)}"`);
  }
  return {
    h1: document.querySelectorAll('h1').length,
    headings: hs.length,
    skips: jumps, jumpList,
    landmarks: {
      main: document.querySelectorAll('main').length,
      header: document.querySelectorAll('header').length,
      footer: document.querySelectorAll('footer').length,
      nav: document.querySelectorAll('nav').length,
    },
    imgsNoAlt: [...document.images].filter(i => !i.hasAttribute('alt')).length,
    decorative: [...document.images].filter(i => i.alt === '').length,
    lang: document.documentElement.lang,
    title: document.title.length,
    metaDesc: document.querySelector('meta[name=description]')?.content.length,
    ariaExpanded: document.querySelector('.nav__toggle')?.getAttribute('aria-expanded'),
    focusables: document.querySelectorAll('a[href],button,[tabindex]:not([tabindex="-1"])').length,
  };
});
console.log('\nSEMANTICS');
console.log('  <h1>                :', sem.h1, sem.h1 === 1 ? '✓ exactly one' : '✗');
console.log('  headings / skips    :', sem.headings, '/', sem.skips, sem.skips === 0 ? '✓ no level skipped' : '✗');
sem.jumpList?.forEach(j => console.log('      ✗', j));
console.log('  landmarks           :', JSON.stringify(sem.landmarks));
console.log('  images without alt  :', sem.imgsNoAlt, sem.imgsNoAlt === 0 ? '✓' : '✗');
console.log('  decorative (alt="") :', sem.decorative);
console.log('  lang / title / desc :', sem.lang, '/', sem.title, 'chars /', sem.metaDesc, 'chars');
console.log('  focusable elements  :', sem.focusables);

/* 3 · Tab through the first 20 stops; every one must be visible and focusable. */
const stops = [];
for (let i = 0; i < 20; i++) {
  await p.keyboard.press('Tab');
  stops.push(await p.evaluate(() => {
    const a = document.activeElement;
    if (!a || a === document.body) return null;
    const r = a.getBoundingClientRect();
    const cs = getComputedStyle(a);
    return { tag: a.tagName, label: (a.innerText || a.getAttribute('aria-label') || '').trim().slice(0, 26),
             visible: r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' };
  }));
}
const real = stops.filter(Boolean);
console.log('\nKEYBOARD — first', real.length, 'stops');
console.log('  all focusable & visible:', real.every(s => s.visible) ? '✓' : '✗ ' + JSON.stringify(real.filter(s => !s.visible)));
console.log('  ' + real.map(s => `${s.tag}:${s.label || '·'}`).join('  ›  ').slice(0, 400));

/* 4 · Menu open/close — the toggle only exists below 1024px. */
await p.setViewportSize({ width: 390, height: 844 });
await p.waitForTimeout(500);
await p.click('.nav__toggle');
await p.waitForTimeout(600);
const openState = await p.evaluate(() => ({
  open: document.body.classList.contains('is-menu-open'),
  expanded: document.querySelector('.nav__toggle').getAttribute('aria-expanded'),
  menuHidden: document.querySelector('.menu').getAttribute('aria-hidden'),
}));
await p.keyboard.press('Escape');
await p.waitForTimeout(400);
const closedState = await p.evaluate(() => document.body.classList.contains('is-menu-open'));
await p.setViewportSize({ width: 1440, height: 900 });
await p.waitForTimeout(400);
console.log('\nMENU');
console.log('  opens               :', openState.open, '| aria-expanded:', openState.expanded, '| aria-hidden:', openState.menuHidden);
console.log('  Escape closes it    :', !closedState ? '✓' : '✗');

/* 5 · Body-copy contrast against its own background. */
const contrast = await p.evaluate(() => {
  const lin = c => { c /= 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
  const lum = ([r, g, b]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  const parse = s => (s.match(/[\d.]+/g) || [0, 0, 0]).slice(0, 3).map(Number);
  const bgOf = (el) => {
    let n = el;
    while (n && n !== document.documentElement) {
      const bg = getComputedStyle(n).backgroundColor;
      const a = parse(bg); const alpha = (bg.match(/[\d.]+/g) || [])[3];
      if (bg !== 'rgba(0, 0, 0, 0)' && (alpha === undefined || +alpha > 0.6)) return a;
      n = n.parentElement;
    }
    return [12, 10, 11];
  };
  const out = [];
  document.querySelectorAll('.t-body p, .wine__id dd, .wine__id dt, .honour p, .foot li, .contact__card span').forEach((el) => {
    const fg = parse(getComputedStyle(el).color), bg = bgOf(el);
    const l1 = lum(fg), l2 = lum(bg);
    out.push({ sel: el.className || el.tagName, ratio: +(((Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)).toFixed(2)) });
  });
  const byMin = {};
  out.forEach(o => { const k = String(o.sel).slice(0, 26); byMin[k] = Math.min(byMin[k] ?? 99, o.ratio); });
  return byMin;
});
console.log('\nCONTRAST (body copy vs its ground, WCAG AA needs 4.5)');
Object.entries(contrast).forEach(([k, v]) => console.log(`  ${String(k || 'p').padEnd(28)} ${v}  ${v >= 4.5 ? '✓' : v >= 3 ? '△ large-text only' : '✗'}`));

console.log('\nJS errors during a11y run:', errs.length);
await b.close();
