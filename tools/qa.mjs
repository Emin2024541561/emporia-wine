import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const URL = 'http://localhost:8123/index.html';
const OUT = '/home/claude/emporia/qa';
await mkdir(OUT, { recursive: true });

const forceGL = process.argv.includes('--gl');
const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium',
  args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--no-sandbox', '--font-render-hinting=none'],
});

const errors = [], failed = [];
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
if (forceGL) {
  // Pretend the software rasteriser is a real GPU so the WebGL path is exercised.
  await ctx.addInitScript(() => {
    for (const C of [self.WebGLRenderingContext, self.WebGL2RenderingContext]) {
      if (!C) continue;
      const g = C.prototype.getExtension;
      C.prototype.getExtension = function (n) { return n === 'WEBGL_debug_renderer_info' ? null : g.call(this, n); };
    }
    Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 8 });
    Object.defineProperty(navigator, 'deviceMemory', { get: () => 8 });
  });
}
const page = await ctx.newPage();
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));
page.on('requestfailed', r => failed.push(`${r.failure()?.errorText} ${r.url()}`));

await page.goto(URL, { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForTimeout(3200);

// Walk the whole page so every lazy image and every reveal fires.
const h = await page.evaluate(() => document.body.scrollHeight);
const jump = async (y) => page.evaluate((v) => {
  if (window.emporia?.lenis) window.emporia.lenis.scrollTo(v, { immediate: true, force: true });
  else window.scrollTo(0, v);
}, y);
// Walk the page, re-measuring as lazy images load and make it taller.
let docH = h;
for (let y = 0; y < docH; y += 600) {
  await jump(y); await page.waitForTimeout(90);
  docH = await page.evaluate(() => document.body.scrollHeight);
}
await jump(docH); await page.waitForTimeout(500);
await jump(0);
await page.waitForTimeout(1800);

const info = await page.evaluate(() => {
  const revealed = [...document.querySelectorAll('[data-reveal]')];
  return {
    loaderGone: !document.querySelector('.loader'),
    wines: document.querySelectorAll('.wine').length,
    medals: document.querySelectorAll('.award__medal').length,
    imgs: [...document.images].map(i => ({ src: (i.currentSrc || i.src).split('/assets/img/')[1] || i.src, ok: i.complete && i.naturalWidth > 0, alt: i.alt })),
    scrollW: document.documentElement.scrollWidth,
    clientW: document.documentElement.clientWidth,
    bodyH: document.body.scrollHeight,
    canvases: document.querySelectorAll('canvas').length,
    noWebgl: document.documentElement.classList.contains('no-webgl'),
    reveals: revealed.length,
    unrevealed: revealed.filter(e => !e.classList.contains('is-in')).length,
    fonts: [...new Set([...document.querySelectorAll('h1,h2,h3,p,.hero__tagline')].slice(0,40)
      .map(e => getComputedStyle(e).fontFamily.split(',')[0].replace(/['"]/g,'')))],
    railItems: document.querySelectorAll('.rail__item').length,
  };
});

console.log('loader removed :', info.loaderGone);
console.log('wines / medals :', info.wines, '/', info.medals, '| rail items:', info.railItems);
console.log('page height    :', info.bodyH, 'px');
console.log('h-overflow     :', info.scrollW > info.clientW + 1 ? `YES (${info.scrollW} > ${info.clientW})` : 'none');
console.log('canvases       :', info.canvases, '| no-webgl class:', info.noWebgl);
console.log('reveals        :', info.reveals, '| still hidden after full scroll:', info.unrevealed);
console.log('fonts in use   :', info.fonts.join(' · '));
const broken = info.imgs.filter(i => !i.ok);
console.log('images         :', info.imgs.length, '| broken:', broken.length);
broken.slice(0,15).forEach(i => console.log('   ✗', i.src));
console.log('\nERRORS (' + errors.length + ')'); [...new Set(errors)].slice(0,12).forEach(e => console.log('  !', e.slice(0,240)));
console.log('FAILED REQ (' + failed.length + ')'); [...new Set(failed)].slice(0,12).forEach(e => console.log('  !', e.slice(0,180)));

await browser.close();
