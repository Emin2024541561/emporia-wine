import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium',
  args:['--no-sandbox','--use-gl=swiftshader','--enable-unsafe-swiftshader'] });
const ctx = await b.newContext({ viewport:{width:1440,height:900} });
await ctx.addInitScript(()=>{
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
const p = await ctx.newPage();
const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
await p.goto('http://localhost:8123/index.html',{waitUntil:'networkidle'});
await p.waitForTimeout(6000);
const info = await p.evaluate(()=>({
  canvases: document.querySelectorAll('canvas').length,
  noWebgl: document.documentElement.classList.contains('no-webgl'),
  tier: [...document.documentElement.classList].find(c=>c.startsWith('tier-')),
  glCanvasSize: (()=>{const c=document.querySelector('canvas');return c?`${c.width}x${c.height}`:null;})(),
  glOk: (()=>{const c=document.querySelector('canvas');if(!c)return false;
    const gl=c.getContext('webgl2')||c.getContext('webgl');return !!gl && !gl.isContextLost();})(),
}));
console.log('WEBGL PATH');
console.log('  canvases       :', info.canvases);
console.log('  canvas size    :', info.glCanvasSize);
console.log('  context alive  :', info.glOk);
console.log('  no-webgl class :', info.noWebgl, '| tier:', info.tier);
// Confirm the hero canvas is actually painting (non-uniform pixels).
await p.evaluate(()=>window.emporia?.lenis?.scrollTo(0,{immediate:true}));
await p.waitForTimeout(1500);
const shot = await p.screenshot({ clip:{x:200,y:200,width:400,height:300} });
const uniq = new Set(); for (let i=0;i<shot.length;i+=997) uniq.add(shot[i]);
console.log('  hero pixel variety (higher = painting):', uniq.size);
console.log('  errors         :', errs.length, errs.slice(0,3));
await p.screenshot({ path:'/home/claude/emporia/qa/gl-hero.png' });
// scroll to terroir + awards to exercise the other two scenes
for (const sel of ['#terroir','#awards']) {
  const y = await p.evaluate(s=>document.querySelector(s).getBoundingClientRect().top+scrollY, sel);
  await p.evaluate(v=>window.emporia?.lenis?window.emporia.lenis.scrollTo(v,{immediate:true,force:true}):scrollTo(0,v), y);
  await p.waitForTimeout(2500);
  await p.screenshot({ path:`/home/claude/emporia/qa/gl-${sel.slice(1)}.png` });
}
console.log('  post-scene errors:', errs.length);
await b.close();
