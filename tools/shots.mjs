import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
const OUT='/home/claude/emporia/qa'; await mkdir(OUT,{recursive:true});
const gl = process.argv.includes('--gl');
const w = Number(process.argv.find(a=>a.startsWith('--w='))?.slice(4)) || 1440;
const hh = Number(process.argv.find(a=>a.startsWith('--h='))?.slice(4)) || 900;
const tag = process.argv.find(a=>a.startsWith('--tag='))?.slice(6) || 'desk';

const browser = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium',
  args:['--no-sandbox','--use-gl=swiftshader','--enable-unsafe-swiftshader','--font-render-hinting=none'] });
const ctx = await browser.newContext({ viewport:{width:w,height:hh}, deviceScaleFactor:1,
  isMobile: w<720, hasTouch: w<720 });
if (gl) await ctx.addInitScript(()=>{
  // WebGL2 has its own prototype; both must be patched or the site's
  // software-rasteriser guard (correctly) rejects SwiftShader.
  for (const C of [self.WebGLRenderingContext, self.WebGL2RenderingContext]) {
    if (!C) continue;
    const g = C.prototype.getExtension;
    C.prototype.getExtension = function (n) { return n === 'WEBGL_debug_renderer_info' ? null : g.call(this, n); };
  }
  Object.defineProperty(navigator,'hardwareConcurrency',{get:()=>8});
  Object.defineProperty(navigator,'deviceMemory',{get:()=>8});
});
const page = await ctx.newPage();
const errs=[]; page.on('pageerror',e=>errs.push(e.message));
await page.goto('http://localhost:8123/index.html',{waitUntil:'networkidle'});
await page.waitForTimeout(4000);

const jump = async (y)=>page.evaluate(v=>{ window.emporia?.lenis ? window.emporia.lenis.scrollTo(v,{immediate:true,force:true}) : scrollTo(0,v); },y);
const H = await page.evaluate(()=>document.body.scrollHeight);
// warm every lazy asset + reveal
let docH = H;
for (let y=0; y<docH; y+=600){ await jump(y); await page.waitForTimeout(70); docH = await page.evaluate(()=>document.body.scrollHeight); }
await jump(docH); await page.waitForTimeout(500);
await jump(0); await page.waitForTimeout(900);

const shots = [
  ['01-hero', '#top'], ['02-epigraph', '.epigraph'], ['03-history', '#history'],
  ['04-timeline', '#timeline'], ['05-about', '#about'], ['06-terroir', '#terroir'],
  ['07-estate', '#estate'], ['08-wines-intro', '.wines__intro'],
  ['09-wine-zilavka', '#emporia-zilavka'], ['10-wine-blatina', '#emporia-blatina'],
  ['11-wine-zilavka-le', '#zilavka-limited-edition'], ['12-wine-blatina-le', '#blatina-limited-edition'],
  ['13-wine-vranac', '#emporia-vranac'], ['14-wine-saumon', '#emporia-rose-saumon'],
  ['15-wine-white-mist', '#white-mist-cuvee'], ['16-wine-deep-red', '#deep-red-cuvee'],
  ['17-wine-white-sel', '#emporia-white-selection'], ['18-spirits', '#spirits'],
  ['19-awards', '#awards'], ['20-geography', '#geography'], ['21-contact', '#contact'], ['22-footer', '.foot'],
];
for (const [name, sel] of shots) {
  const y = await page.evaluate(s => { const e=document.querySelector(s); return e ? e.getBoundingClientRect().top + window.scrollY : null; }, sel);
  if (y === null) { console.log('missing', sel); continue; }
  await jump(y); await page.waitForTimeout(650);
  await page.screenshot({ path: `${OUT}/${tag}-${name}.png` });
}
console.log('shots done', tag, w+'x'+hh, 'gl='+gl, 'errors='+errs.length, errs.slice(0,3));
await browser.close();
