/**
 * wines.js — Chapter 08, the collection, and Chapter 09, the spirits.
 *
 * Every wine is given one of five layout archetypes (a–e). The sequence is
 * chosen so that no two adjacent wines share a layout, an accent family or a
 * media treatment — the rule from §48 enforced in data rather than by eye.
 */
import { img, esc, hexToRgbTriplet, readableOn } from '../core/util.js';
import { wines, spirits, awards, decree } from '../data/content.js';

/**
 * Three bottles are shot with a white label running out to the silhouette
 * edge, where no matte can separate label from backdrop — the two are the same
 * brightness. Those are shipped with the backdrop extinguished into shadow
 * rather than cut, and get a soft frame fade so no photographic edge shows.
 */
const PLATED = new Set(['zilavka-limited-edition', 'blatina-limited-edition', 'white-mist-cuvee']);

/** Layout sequence — deliberately never repeating a neighbour. */
const LAYOUTS = ['a', 'b', 'c', 'd', 'e', 'a', 'd', 'b', 'c'];

const awardById = Object.fromEntries(awards.map(a => [a.id, a]));

function idCardHTML(card) {
  return `<dl>${Object.entries(card).map(([k, v]) =>
    `<div><dt>${esc(k)}:</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>`;
}

function medalHTML(id) {
  const a = awardById[id];
  if (!a) return '';
  return `
  <a class="wine__medal" href="#awards" data-magnetic="0.25" data-cursor="Awards"
     aria-label="${esc(`${a.competition} ${a.series} ${a.year} — ${a.medal} for ${a.wine}`)}">
    ${img(a.image, `${a.competition} ${a.series} ${a.year} ${a.medal} medal awarded to ${a.wine}`, { sizes: '152px' })}
  </a>`;
}

function headHTML(w) {
  const scriptName = ['emporia-zilavka', 'emporia-blatina', 'zilavka-limited-edition',
    'blatina-limited-edition', 'emporia-vranac', 'emporia-rose-saumon'].includes(w.id);
  return `
  <div class="wine__head" data-stagger="90">
    <p class="wine__no" data-reveal="up">${String(wines.indexOf(w) + 1).padStart(2, '0')} — Page ${w.pdfPage}</p>
    ${w.brandLine ? `<p class="wine__brand" data-reveal="up">${esc(w.brandLine)}</p>` : ''}
    <h3 class="wine__name ${scriptName ? '' : 'wine__name--plain'}" data-reveal="wipe-up">${esc(w.name)}
      ${w.suffix ? `<span class="wine__suffix">${esc(w.suffix)}</span>` : ''}
    </h3>
  </div>`;
}

function copyHTML(w) {
  return `
  <div class="wine__copy" data-stagger="80">
    <div class="t-body">
      ${w.body.map(p => `<p data-reveal="up">${esc(p)}</p>`).join('')}
    </div>
    <div class="rule-dashed" style="margin-top:var(--s-4)" data-reveal="fade"></div>
    <div class="wine__facts">
      <div class="wine__gastro" data-reveal="up">
        <h4>Gastronomic recommendation</h4>
        <p>${esc(w.gastronomy)}</p>
      </div>
      <div class="wine__id" data-reveal="up">
        <h4>ID card</h4>
        ${idCardHTML(w.idCard)}
      </div>
    </div>
  </div>`;
}

function pullHTML(w) {
  if (w.quoteBlock) {
    const d = decree[w.quoteBlock];
    return `
    <figure class="wine__pull" data-reveal="iris">
      <p>${esc(d.quote)}</p>
      <cite>${esc(d.attribution)}</cite>
    </figure>`;
  }
  if (!w.pullQuote) return '';
  return `<figure class="wine__pull" data-reveal="iris"><p>${esc(w.pullQuote)}</p></figure>`;
}

function mediaHTML(w) {
  // Order of preference: the fruit, then the label artwork, then anything
  // else from the page. A near-blank pencil study reads as an empty circle,
  // so it is only ever used when nothing more legible exists on that page.
  const pool = [w.grape, w.artwork, w.secondary].filter(Boolean);
  const discs = pool.slice(0, 2).map((src, i) => ({ src, cls: i ? 'wine__disc--two' : '' }));
  return `
  <div class="wine__media">
    ${discs.map((d, i) => `
      <figure class="wine__disc ${d.cls}" data-reveal="iris" style="--reveal-delay:${i * 140}ms">
        ${img(d.src, ALT[d.src] || '', { sizes: '(max-width:1024px) 38vw, 24rem', cls: 'js-disc' })}
      </figure>`).join('')}
  </div>`;
}

/** Alt text for the decorative-but-informative circular crops. */
const ALT = {
  'vineyard/zilavka-and-dark-grapes-harvest-crate': 'Freshly picked white Žilavka and dark grapes together in a harvest crate',
  'vineyard/blatina-grapes-on-the-vine': 'Deep blue Blatina grape clusters hanging on the vine among green leaves',
  'vineyard/blue-grapes-with-autumn-leaves': 'Blue grape clusters framed by scarlet and gold autumn vine leaves',
  'vineyard/vineyard-rows-with-red-poppies': 'Trellised vineyard rows in early summer with red poppies flowering between the vines',
  'vineyard/autumn-vine-leaf-and-grapes': 'A vine leaf turning scarlet in autumn beside a small cluster of dark grapes',
  'vineyard/vineyard-poppies-and-wildflowers': 'Vineyard rows with poppies and wildflowers growing along the trellis line',
  'vineyard/white-grapes-at-dusk': 'A cluster of white grapes on the vine at dusk, the vineyard rows falling away behind',
  'vineyard/white-grapes-with-herzegovina-hills': 'White grapes in the foreground with the hills of Herzegovina in the hazy distance',
  'artwork/sketch-fish-study-with-pen': 'Pen study of a fish on paper, with technical pen and eraser alongside',
  'map/herzegovina-wine-region-illustration': 'Illustrated map of the Herzegovina wine region in red against the blue of the Adriatic',
  'artwork/sketch-fish-watercolour-vinogorje-mostar': 'Watercolour and ink fish study inscribed VINOGORJE MOSTAR from the Rosé Saumon label artwork',
  'artwork/sketch-pencil-on-paper': 'Faint pencil study on textured paper from the label artwork series',
  'artwork/sketch-wave-and-vine-study': 'Ink study of waves and vine tendrils from the White Mist Cuvée label artwork',
  'artwork/sketch-vine-root-study': 'Ink study of a vine root system from the Deep Red Cuvée label artwork',
  'artwork/sketch-landscape-line-study': 'Ink line study of the Herzegovinian landscape from the White Selection label artwork',
  'artwork/sketch-grape-cluster-study': 'Pencil study of a grape cluster from the Carski Vinogradi label artwork',
  'artwork/sketch-carski-vinogradi-vine': 'Pencil study of an old vine inscribed CARSKI VINOGRADI from the label artwork',
  'artwork/sketch-harvest-figure-study': 'Ink and colour study of a harvest figure from the Blatina Limited Edition label artwork',
};

function wineHTML(w, i) {
  const layout = LAYOUTS[i % LAYOUTS.length];
  const rgb = hexToRgbTriplet(w.accent);
  const decreeBlock = layout === 'e' && w.quoteBlock ? decree[w.quoteBlock] : null;

  return `
  <article class="wine" id="${w.id}" data-layout="${layout}" data-accent="${w.accent}"
           style="--wine-accent:${w.accent};--wine-accent-rgb:${rgb};--wine-ink:${readableOn(w.accent)}"
           aria-labelledby="${w.id}-h">
    <div class="wine__bg" aria-hidden="true">
      <div class="wine__bg-glow" style="left:${i % 2 ? '-20%' : '55%'};top:${i % 3 ? '-25%' : '35%'}"></div>
      <div class="wine__ribbon" data-parallax="0.06" data-parallax-axis="x"></div>
      ${w.artwork && (layout === 'b' || layout === 'd')
        ? `<div class="wine__strip">${img(w.artwork, '', { sizes: '100vw' })}</div>` : ''}
    </div>

    <div class="wine__inner">
      <figure class="wine__bottle" data-reveal="up">
        ${img(w.bottle, ALTBOTTLE[w.id], {
          sizes: '(max-width:1024px) 72vw, 34vw',
          cls: `js-bottle${PLATED.has(w.id) ? ' is-plated' : ''}`,
        })}
        <span class="wine__bottle-shadow" aria-hidden="true"></span>
      </figure>

      ${decreeBlock ? `
      <div class="wine__decree" data-stagger="90">
        <blockquote data-split="chars" data-reveal="fade">${esc(decreeBlock.quote)}</blockquote>
        <cite data-reveal="up">${esc(decreeBlock.attribution)}</cite>
      </div>` : ''}

      <div class="wine__text">
        <h3 id="${w.id}-h" class="visually-hidden">${esc(w.fullName)}</h3>
        ${headHTML(w)}
        ${copyHTML(w)}
      </div>

      ${layout === 'e' && decreeBlock ? '' : pullHTML(w)}
      ${mediaHTML(w)}
      ${(w.awards || []).map(medalHTML).join('')}
    </div>
  </article>`;
}

const ALTBOTTLE = {
  'emporia-zilavka': 'Bottle of EMPORIA Žilavka with its black label and gold Sissi motif',
  'emporia-blatina': 'Bottle of EMPORIA Blatina with its black label and crimson Sissi motif',
  'zilavka-limited-edition': 'Bottle of Žilavka LIMITED EDITION with its white and green label',
  'blatina-limited-edition': 'Bottle of Blatina LIMITED EDITION 019 with its white label and deep red harvest illustration',
  'emporia-vranac': 'Bottle of EMPORIA Vranac with its black label and magenta Sissi motif',
  'emporia-rose-saumon': 'Salmon-coloured bottle of EMPORIA Rosé Saumon with its white fish emblem',
  'white-mist-cuvee': 'Bottle of EMPORIA White Mist Cuvée with its textured white label and green capsule',
  'deep-red-cuvee': 'Bottle of EMPORIA Deep Red Cuvée with its matte black label',
  'emporia-white-selection': 'Bottle of EMPORIA White Selection 023 with its black label and engraved vine illustration',
  'emporia-cherry': 'Bottle of EMPORIA Cherry fruit liqueur, dark red spirit in a rounded flask with a black label',
  'emporia-loza-specijal': 'Bottle of EMPORIA Loza Special natural fruit brandy, clear spirit in a rounded flask with a kraft label',
};

export function winesHTML() {
  return `
  <section class="wines" id="wines" aria-labelledby="wines-h" data-accent="#BB9350">
    <div class="wines__intro wrap">
      <span class="t-meta" data-reveal="up">Chapter 05 — Pages 06–14</span>
      <h2 id="wines-h" class="t-chapter" data-reveal="wipe-up">The collection</h2>
      <nav class="wines__index" aria-label="The wines">
        ${wines.map((w, i) => `
        <a href="#${w.id}" style="--wine-accent:${w.accent};--wine-ink:${readableOn(w.accent)}" data-cursor="View">
          <em>${String(i + 1).padStart(2, '0')}</em>
          <b>${esc(w.fullName)}</b>
          <span>${esc(w.idCard['Category'])}</span>
        </a>`).join('')}
      </nav>
    </div>
    ${wines.map(wineHTML).join('')}
  </section>`;
}

/* ── 09 · SPIRITS ─────────────────────────────────────────────────────────── */
export function spiritsHTML() {
  return `
  <section class="spirits" id="spirits" aria-labelledby="spirits-h" data-accent="#B98A4F">
    <div class="wrap">
      <figure class="spirits__artwork" aria-hidden="true">
        ${img('artwork/sketch-vine-study-spirits', '', { sizes: '100vw' })}
      </figure>
      <div class="spirits__head">
        <span class="t-meta" style="color:rgb(35 31 32 / 0.5)" data-reveal="up">Chapter 06 — Page 15</span>
        <h2 id="spirits-h" data-reveal="wipe-up">EMPORIA<em>spirits</em></h2>
      </div>
      <div class="spirits__grid">
        ${spirits.map(s => `
        <article class="spirit" style="--spirit-accent:${s.accent}" aria-labelledby="${s.id}-h">
          <figure class="spirit__bottle" data-reveal="up">
            ${img(s.bottle, ALTBOTTLE[s.id], { sizes: '(max-width:1024px) 52vw, 18rem' })}
          </figure>
          <div data-stagger="70">
            <h3 id="${s.id}-h" data-reveal="up">${esc(s.name)}</h3>
            <div class="t-body">
              ${s.body.map(p => `<p data-reveal="up">${esc(p)}</p>`).join('')}
            </div>
            <div class="spirit__id" data-reveal="up">
              <h4>ID card</h4>
              ${idCardHTML(s.idCard)}
            </div>
          </div>
        </article>`).join('')}
      </div>
    </div>
  </section>`;
}
