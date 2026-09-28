/**
 * story.js — builds chapters 01–07 from the content model.
 * Markup is generated here so the copy lives in exactly one place (content.js)
 * and can be audited against the PDF programmatically.
 */
import { img, esc } from '../core/util.js';
import { cover, history, timeline, about, epigraph, terroir, estate } from '../data/content.js';

/* ── 01 · HERO ────────────────────────────────────────────────────────────── */
export function heroHTML() {
  return `
  <section class="hero" id="top" data-accent="#BB9350">
    <div class="hero__canvas" aria-hidden="true"></div>
    <div class="hero__fallback" role="img"
         aria-label="Historic black-and-white photograph of workers tending the young vines of the Imperial Vineyards estate at Gnojnice near Mostar"></div>
    <div class="hero__scrim" aria-hidden="true"></div>

    <div class="hero__content">
      <div class="hero__mark" data-reveal="scale">
        ${img('brand/emporia-logo-mark', 'Emporia mark: a crowned Empress Elisabeth holding a fan', { eager: true, sizes: '128px' })}
      </div>
      <h1 class="visually-hidden">Emporia — Vinarija Carski Vinogradi, Mostar. Imperial Vineyards, established 1886.</h1>
      <p class="hero__wordmark" aria-hidden="true" data-reveal="up" style="--reveal-delay:120ms">EMPORIA</p>
      <p class="hero__tagline" data-split="chars" data-reveal="fade" style="--reveal-delay:260ms">${esc(cover.tagline)}</p>
      <p class="hero__meta" data-reveal="up" style="--reveal-delay:640ms">
        <span>Imperial Vineyards</span><i></i><span>Est. 1886</span><i></i><span>Mostar · Herzegovina</span>
      </p>
    </div>

    <div class="hero__foot">
      <p class="hero__caption">Gnojnice, near Mostar — the first wine station and the wine school ever in this area.</p>
      <div class="scroll-cue"><span>Scroll</span><i></i></div>
      <p class="hero__caption" style="text-align:right">${esc(cover.website)}</p>
    </div>
  </section>`;
}

/* ── 02 · EPIGRAPH ────────────────────────────────────────────────────────── */
export function epigraphHTML() {
  return `
  <section class="epigraph" aria-labelledby="epigraph-h" data-accent="#BB9350">
    <div class="epigraph__glow" aria-hidden="true"></div>
    <div class="wrap">
      <h2 id="epigraph-h" class="visually-hidden">A Nobel laureate on the wine of the Imperial Vineyards</h2>
      <blockquote class="epigraph__q" data-split="chars" data-reveal="fade">${esc(epigraph.quote)}</blockquote>
      <p class="epigraph__attr" data-reveal="up" style="--reveal-delay:500ms">${esc(epigraph.attribution)}</p>
    </div>
  </section>`;
}

/* ── 03 · HISTORY ─────────────────────────────────────────────────────────── */
export function historyHTML() {
  return `
  <section class="history" id="history" aria-labelledby="history-h" data-accent="#BB9350">
    <div class="history__inner">
      <figure class="history__media">
        ${img(history.portrait, 'Studio portrait of Emperor Franz Joseph I in full dress uniform beside Empress Elisabeth of Bavaria, called Sissi', { sizes: '50vw', cls: 'js-hist-img' })}
        <span class="history__year" aria-hidden="true">1886</span>
      </figure>

      <div class="history__col">
        <span class="t-meta" data-reveal="up">Chapter 01 — Page 02</span>
        <h2 id="history-h" data-reveal="wipe-up" style="--reveal-delay:80ms">${esc(history.title)}</h2>
        <div class="t-body" data-stagger="70">
          ${history.paragraphs.map((p, i) =>
            `<p data-reveal="up" style="--reveal-delay:${i * 60}ms">${esc(p)}</p>`).join('')}
        </div>
      </div>
    </div>
  </section>`;
}

/* ── 04 · TIMELINE — vertical scroll driven horizontally ──────────────────── */
export function timelineHTML() {
  return `
  <section class="timeline" id="timeline" aria-labelledby="timeline-h" data-accent="#BB9350">
    <div class="timeline__viewport">
      <div class="timeline__track js-timeline-track">
        <div class="timeline__intro">
          <span class="t-meta">Chapter 02</span>
          <h2 id="timeline-h" class="t-chapter">A line drawn<br>through six<br>centuries</h2>
        </div>
        ${timeline.map(t => `
        <article class="timeline__entry">
          <b>${esc(t.year)}</b>
          <h3>${esc(t.label)}</h3>
          <p>${esc(t.text)}</p>
        </article>`).join('')}
      </div>
      <div class="timeline__rail" aria-hidden="true"><i class="js-timeline-progress"></i></div>
    </div>
  </section>`;
}

/* ── 05 · ABOUT US ────────────────────────────────────────────────────────── */
export function aboutHTML() {
  return `
  <section class="about" id="about" aria-labelledby="about-h" data-accent="#8E9093">
    ${img('brand/empress-elisabeth-silhouette', 'Silhouette of Empress Elisabeth of Bavaria, called Sissi, in a bustled gown holding a fan', { cls: 'about__sil', sizes: '40vw' })}
    <div class="wrap">
      <div class="about__inner">
        <h2 id="about-h" data-reveal="wipe-up">${esc(about.title)}</h2>
        <div class="about__lead" data-stagger="80">
          ${about.lead.map(p => `<p data-reveal="up">${esc(p)}</p>`).join('')}
        </div>
        <div class="about__body" data-stagger="70">
          ${about.paragraphs.map((p, i) =>
            `<p data-reveal="up" style="--i:${i}">${esc(p)}</p>`).join('')}
        </div>
        <div class="about__logo" data-reveal="scale">
          ${img('brand/emporia-logo-lockup', 'Emporia logo lockup', { sizes: '190px' })}
        </div>
      </div>
    </div>
  </section>`;
}

/* ── 06 · TERROIR ─────────────────────────────────────────────────────────── */
export function terroirHTML() {
  return `
  <section class="terroir" id="terroir" aria-labelledby="terroir-h" data-accent="#6B8438">
    <div class="terroir__stage">
      <div class="terroir__sticky">
        <div class="terroir__layer terroir__layer--far" data-parallax="0.05" aria-hidden="true">
          ${img('vineyard/white-grapes-with-herzegovina-hills', '', { sizes: '100vw' })}
        </div>
        <div class="terroir__layer terroir__layer--mid" data-parallax="0.13" aria-hidden="true">
          ${img('vineyard/vineyard-rows-with-red-poppies', '', { sizes: '100vw' })}
        </div>
        <div class="terroir__layer terroir__layer--near" data-parallax="0.26" aria-hidden="true">
          ${img('vineyard/old-vine-trunk-mostar-valley', '', { sizes: '100vw' })}
        </div>
        <div class="terroir__canvas" aria-hidden="true"></div>
        <div class="terroir__scrim" aria-hidden="true"></div>

        <div class="terroir__content wrap">
          <span class="t-meta" data-reveal="up">Chapter 03 — Terroir</span>
          <h2 id="terroir-h" class="t-chapter" data-reveal="wipe-up">Karst, sun<br>and the Neretva</h2>
          <div class="terroir__figs" data-stagger="140">
            ${terroir.figures.map(f => `
            <div class="terroir__fig" data-reveal="up">
              <b>${esc(f.value)}${f.unit ? `<em>${esc(f.unit)}</em>` : ''}</b>
              <p>${esc(f.caption)}</p>
            </div>`).join('')}
          </div>
          <p class="terroir__note" data-reveal="fade">${esc(terroir.note)}</p>
        </div>
      </div>
    </div>
  </section>`;
}

/* ── 07 · THE ESTATE ──────────────────────────────────────────────────────── */
export function estateHTML() {
  return `
  <section class="estate" id="estate" aria-labelledby="estate-h" data-accent="#BB9350">
    <div class="wrap">
      <div class="estate__head">
        <div>
          <span class="t-meta" data-reveal="up">Chapter 04 — Pages 04–05</span>
          <h2 id="estate-h" class="t-chapter" data-reveal="wipe-up">The estate</h2>
        </div>
        <p class="estate__hint" data-reveal="fade">Drag or scroll sideways</p>
      </div>
    </div>

    <div class="estate__rail" data-drag-rail data-cursor="Drag" tabindex="0"
         role="region" aria-label="Photographs of the winery, the cellar and the Emporia Hotel">
      ${estate.plates.map((p, i) => `
      <figure class="estate__plate plate" data-reveal="${i % 2 ? 'wipe-dn' : 'wipe-up'}">
        ${img(p.img, p.caption, { sizes: '(max-width:720px) 78vw, 46rem' })}
        <figcaption>${esc(p.caption)}</figcaption>
      </figure>`).join('')}
    </div>

    <div class="wrap">
      <figure class="estate__coda plate" data-reveal="wipe-up">
        ${img('vineyard/vineyard-poppies-and-wildflowers', 'Vineyard rows with poppies and wildflowers growing along the trellis line', { sizes: '100vw' })}
        <figcaption>Mostarsko vinogorje — the vines in early summer</figcaption>
      </figure>

      <div class="estate__hotel" data-reveal="up">
        <span>EMPORIA</span><small>HOTEL</small>
      </div>
    </div>
  </section>`;
}
