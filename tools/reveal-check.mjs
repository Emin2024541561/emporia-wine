import { chromium } from 'playwright';
const w = Number(process.argv.find(a=>a.startsWith('--w='))?.slice(4)) || 1440;
const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium', args:['--no-sandbox'] });
const p = await b.newPage({ viewport:{width:w,height:900} });
await p.goto('http://localhost:8123/index.html',{waitUntil:'networkidle'});
await p.waitForTimeout(3000);
const H = await p.evaluate(()=>document.body.scrollHeight);
const jump=async y=>p.evaluate(v=>{window.emporia?.lenis?window.emporia.lenis.scrollTo(v,{immediate:true,force:true}):scrollTo(0,v);},y);
let docH=H; for(let y=0;y<docH;y+=500){await jump(y);await p.waitForTimeout(80);docH=await p.evaluate(()=>document.body.scrollHeight);} await jump(docH); await p.waitForTimeout(600);
await p.waitForTimeout(1200);
const out = await p.evaluate(()=>[...document.querySelectorAll('[data-reveal],[data-split]')]
  .filter(e=>!e.classList.contains('is-in'))
  .map(e=>{const r=e.getBoundingClientRect();const cs=getComputedStyle(e);
    return {tag:e.tagName,cls:(e.className||'').toString().slice(0,40),sec:e.closest('section,article')?.id,
            w:Math.round(r.width),h:Math.round(r.height),clip:cs.clipPath,op:cs.opacity,txt:e.textContent.trim().slice(0,26)};}));
console.log(`viewport ${w} — hidden:`, out.length);
out.forEach(o=>console.log(' ', JSON.stringify(o)));
// also: check awards h2 visibility
const a = await p.evaluate(()=>{const h=document.querySelector('#awards h2');if(!h)return 'no h2';
  const r=h.getBoundingClientRect();const cs=getComputedStyle(h);
  return {text:h.textContent,w:r.width,h:r.height,clip:cs.clipPath,color:cs.color,fs:cs.fontSize,cls:h.className,inview:h.classList.contains('is-in')};});
console.log('awards h2:', JSON.stringify(a));
await b.close();
