/**
 * build-static.mjs — generates the artefacts that must exist as real files
 * for crawlers and for JavaScript-less visitors:
 *
 *   · products JSON-LD injected into index.html
 *   · content.html — the complete brochure as a plain, styled document
 *   · sitemap.xml, robots.txt
 *   · assets/favicon.svg, site.webmanifest
 *
 * Run: node tools/build-static.mjs
 */
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const C = await import(join(root, 'src/js/data/content.js'));
const SITE = 'https://www.emporia.ba';

const esc = (s = '') => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/* ── 1. Product structured data ───────────────────────────────────────────── */
const products = [...C.wines, ...C.spirits].map((p) => {
  const card = p.idCard;
  const node = {
    '@type': 'Product',
    '@id': `${SITE}/#${p.id}`,
    name: card['Name'],
    category: card['Category'],
    brand: { '@type': 'Brand', name: 'EMPORIA' },
    manufacturer: { '@id': `${SITE}/#winery` },
    image: `${SITE}/assets/img/${p.bottle}.webp`,
    description: p.body.join(' '),
    additionalProperty: Object.entries(card)
      .filter(([k]) => k !== 'Name')
      .map(([k, v]) => ({ '@type': 'PropertyValue', name: k, value: v })),
  };
  const wins = (p.awards || []).map(id => C.awards.find(a => a.id === id)).filter(Boolean);
  if (wins.length) node.award = wins.map(a => `${a.medal}, ${a.competition} ${a.series} ${a.year}`);
  return node;
});

const productLd = JSON.stringify({ '@context': 'https://schema.org', '@graph': products }, null, 2);

let html = await readFile(join(root, 'index.html'), 'utf8');
html = html.replace(
  /<script type="application\/ld\+json" id="products-ld">[\s\S]*?<\/script>/,
  `<script type="application/ld+json" id="products-ld">\n${productLd}\n</script>`
);
await writeFile(join(root, 'index.html'), html);

/* ── 2. content.html — every word, no JavaScript required ─────────────────── */
const idcard = (c) => `<dl>${Object.entries(c).map(([k, v]) =>
  `<div><dt>${esc(k)}:</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>`;

const productSection = (p, kind) => `
<article id="${p.id}">
  <h3>${esc(p.idCard['Name'])} <small>(brochure page ${p.pdfPage})</small></h3>
  ${p.pullQuote ? `<blockquote>${esc(p.pullQuote)}</blockquote>` : ''}
  ${p.quoteBlock ? `<blockquote>${esc(C.decree[p.quoteBlock].quote)}<cite>${esc(C.decree[p.quoteBlock].attribution)}</cite></blockquote>` : ''}
  ${p.body.map(t => `<p>${esc(t)}</p>`).join('')}
  ${p.gastronomy ? `<h4>Gastronomic recommendation</h4><p>${esc(p.gastronomy)}</p>` : ''}
  <h4>ID card</h4>
  ${idcard(p.idCard)}
  ${(p.awards || []).map(id => { const a = C.awards.find(x => x.id === id);
      return a ? `<p class="award">${esc(a.competition)} ${esc(a.series)} ${esc(a.year)} — ${esc(a.medal)}</p>` : ''; }).join('')}
</article>`;

const content = `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>EMPORIA — the complete brochure text | Vinarija Carski Vinogradi, Mostar</title>
<meta name="description" content="The full text of the Emporia brochure: history, about us, every wine, every ID card, every award and the contact details of Vinarija Carski Vinogradi, Mostar.">
<link rel="canonical" href="${SITE}/content.html">
<style>
  :root { color-scheme: dark }
  body { background:#0C0A0B; color:#E8E2D6; font:16px/1.7 Georgia, 'Times New Roman', serif;
         margin:0; padding:3rem 1.25rem 6rem }
  main { max-width: 46rem; margin: 0 auto }
  h1 { font-size: clamp(2rem,6vw,3.2rem); font-weight: 400; letter-spacing:.02em; margin:0 0 .4rem }
  h2 { font-size: clamp(1.4rem,3.4vw,2rem); font-weight:400; margin:3.4rem 0 1rem;
       border-top:1px solid #332c2a; padding-top:1.6rem; color:#BB9350 }
  h3 { font-size:1.25rem; font-weight:400; margin:2.4rem 0 .6rem; color:#fff }
  h4 { font-size:.72rem; letter-spacing:.24em; text-transform:uppercase; color:#BB9350;
       margin:1.4rem 0 .4rem; font-family: system-ui, sans-serif }
  small { color:#8a817a; font-size:.75rem; font-family: system-ui, sans-serif; letter-spacing:.08em }
  p { margin:0 0 1rem; color:#cfc7bb }
  blockquote { margin:1.2rem 0; padding-left:1.1rem; border-left:2px solid #BB9350; font-style:italic; color:#e8e2d6 }
  cite { display:block; margin-top:.5rem; font-size:.85rem; color:#9c948b }
  dl { margin:0 0 1rem; font-family: system-ui, sans-serif; font-size:.9rem }
  dl div { display:flex; gap:.4rem; flex-wrap:wrap; padding:.15rem 0 }
  dt { color:#fff; font-weight:600 } dd { margin:0; color:#cfc7bb }
  .award { font-family: system-ui, sans-serif; font-size:.85rem; color:#BB9350 }
  a { color:#BB9350 }
  nav ul { padding-left:1.1rem } nav li { margin:.2rem 0 }
  .back { display:inline-block; margin-bottom:2rem; font-family:system-ui,sans-serif;
          font-size:.72rem; letter-spacing:.24em; text-transform:uppercase }
</style>
</head><body><main>

<a class="back" href="/">← The Emporia experience</a>
<h1>EMPORIA</h1>
<p><small>Vinarija CARSKI VINOGRADI · Mostarsko vinogorje · Imperial Vineyards, established 1886</small></p>
<p>${esc(C.cover.tagline)} — ${esc(C.cover.website)}</p>

<nav aria-label="Contents"><h2>Contents</h2><ul>
  <li><a href="#history">History</a></li>
  <li><a href="#about">About Us</a></li>
  <li><a href="#wines">The wines</a></li>
  <li><a href="#spirits">Emporia spirits</a></li>
  <li><a href="#awards">Awards</a></li>
  <li><a href="#contact">Contact</a></li>
</ul></nav>

<section id="history"><h2>${esc(C.history.title)} <small>(page ${C.history.pdfPage})</small></h2>
${C.history.paragraphs.map(p => `<p>${esc(p)}</p>`).join('')}</section>

<section id="about"><h2>${esc(C.about.title)} <small>(page ${C.about.pdfPage})</small></h2>
${C.about.lead.map(p => `<p>${esc(p)}</p>`).join('')}
${C.about.paragraphs.map(p => `<p>${esc(p)}</p>`).join('')}</section>

<section><h2>Epigraph <small>(pages 1 &amp; ${C.epigraph.pdfPage})</small></h2>
<blockquote>${esc(C.epigraph.quote)}<cite>${esc(C.epigraph.attribution)}</cite></blockquote></section>

<section id="wines"><h2>The wines <small>(pages 6–14)</small></h2>
${C.wines.map(w => productSection(w, 'wine')).join('')}</section>

<section id="spirits"><h2>${esc(C.brand.spiritsTitle)} <small>(page 15)</small></h2>
${C.spirits.map(s => productSection(s, 'spirit')).join('')}</section>

<section id="awards"><h2>Awards</h2>
${C.awards.map(a => `<p class="award">${esc(a.year)} — ${esc(a.competition)} ${esc(a.series)} — ${esc(a.medal)} — ${esc(a.wine)} <small>(page ${a.pdfPage})</small></p>`).join('')}
<h3>The imperial honours</h3>
${C.historicAwards.map(h => `<p><strong>${esc(h.year)}</strong> — ${esc(h.medal)}, ${esc(h.competition)}, ${esc(h.city)} — ${esc(h.wine)}</p><p>${esc(h.text)}</p>`).join('')}
<p>${esc(C.awardsNote.text)}</p></section>

<section id="contact"><h2>Contact <small>(page ${C.contact.pdfPage})</small></h2>
<address style="font-style:normal">
<p><strong>${esc(C.contact.company)}</strong><br>${esc(C.contact.companyCity)}<br>
${C.contact.lines.map(esc).join('<br>')}<br>
${esc(C.contact.phoneLabel)} <a href="tel:${esc(C.contact.phoneHref)}">${esc(C.contact.phone)}</a><br>
${esc(C.contact.emailLabel)} <a href="mailto:${esc(C.contact.email)}">${esc(C.contact.email)}</a><br>
<a href="https://${esc(C.contact.website)}">${esc(C.contact.website)}</a></p>
</address></section>

</main></body></html>`;
await writeFile(join(root, 'content.html'), content);

/* ── 3. sitemap + robots ──────────────────────────────────────────────────── */
const today = new Date().toISOString().slice(0, 10);
const urls = ['/', '/content.html'];
await writeFile(join(root, 'sitemap.xml'),
`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url><loc>${SITE}${u}</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>${u === '/' ? '1.0' : '0.6'}</priority></url>`).join('\n')}
</urlset>\n`);

await writeFile(join(root, 'robots.txt'),
`User-agent: *
Allow: /

Sitemap: ${SITE}/sitemap.xml
`);

/* ── 4. Favicon + manifest ────────────────────────────────────────────────── */
await writeFile(join(root, 'assets/favicon.svg'),
`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" fill="#0C0A0B"/>
  <circle cx="32" cy="32" r="22" fill="none" stroke="#BB9350" stroke-width="2.6"/>
  <path d="M32 15 l3.2 4.4 3.4-3.2 .6 5.4 4.4-1.2-1.8 5" fill="none" stroke="#BB9350" stroke-width="2" stroke-linejoin="round"/>
  <path d="M27 26 q5-4 10 0 l2 16 q-7 4-14 0z" fill="#BB9350"/>
</svg>\n`);

await writeFile(join(root, 'site.webmanifest'), JSON.stringify({
  name: 'EMPORIA — Vinarija Carski Vinogradi, Mostar',
  short_name: 'EMPORIA',
  description: 'The wines of the Imperial Vineyards at Mostar, established 1886.',
  start_url: '/',
  display: 'standalone',
  background_color: '#0C0A0B',
  theme_color: '#0C0A0B',
  icons: [
    { src: '/assets/favicon.svg', sizes: 'any', type: 'image/svg+xml' },
    { src: '/assets/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
  ],
}, null, 2));

console.log(`✓ products JSON-LD: ${products.length} products`);
console.log(`✓ content.html, sitemap.xml, robots.txt, favicon.svg, site.webmanifest`);
