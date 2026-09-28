/**
 * closing.js — Chapters 10–12: the awards hall, the imperial map, the contact.
 */
import { img, esc } from '../core/util.js';
import { awards, historicAwards, awardsNote, geography, contact, brand, wines, spirits } from '../data/content.js';

/* ── 10 · AWARDS ──────────────────────────────────────────────────────────── */
export function awardsHTML() {
  return `
  <section class="awards" id="awards" aria-labelledby="awards-h" data-accent="#BB9350">
    <div class="awards__canvas" aria-hidden="true"></div>
    <div class="wrap">
      <header class="awards__head">
        <span class="t-meta" data-reveal="up">Chapter 07 — Pages 02, 06–08</span>
        <h2 id="awards-h" class="t-chapter" data-reveal="wipe-up">Distinctions</h2>
        <p data-reveal="up">From Vienna, Barcelona, Paris and London to the Decanter World Wine Awards — every honour recorded in the house archive.</p>
      </header>

      <div class="awards__wall" data-stagger="150">
        ${awards.map(a => `
        <article class="award" data-reveal="up" data-cursor="Medal">
          <div class="award__medal" data-magnetic="0.18" data-tilt="10">
            ${img(a.image, `${a.competition} ${a.series} ${a.year} ${a.medal} medal awarded to ${a.wine}`, { sizes: '210px' })}
          </div>
          <p class="award__year">${esc(a.year)}</p>
          <p class="award__medalname">${esc(a.medal)}</p>
          <p class="award__comp">${esc(a.competition)}</p>
          <p class="award__series">${esc(a.series)}</p>
          <p class="award__wine"><a href="#${a.wineId}">${esc(a.wine)}</a></p>
        </article>`).join('')}
      </div>

      <div class="awards__historic">
        <h3 data-reveal="up">The imperial honours</h3>
        ${historicAwards.map(h => `
        <article class="honour" data-reveal="up">
          <b>${esc(h.year)}</b>
          <div>
            <p class="honour__medal">${esc(h.medal)}</p>
            <p class="honour__where">${esc(h.competition)} — ${esc(h.city)} · ${esc(h.wine)}</p>
            <p>${esc(h.text)}</p>
          </div>
        </article>`).join('')}
      </div>

      <div class="awards__cities">
        <p data-reveal="up">${esc(awardsNote.text)}</p>
        <ul data-stagger="110">
          ${awardsNote.cities.map(c => `<li data-reveal="up">${esc(c)}</li>`).join('')}
        </ul>
      </div>
    </div>
  </section>`;
}

/* ── 11 · GEOGRAPHY ───────────────────────────────────────────────────────── */
export function geoHTML() {
  return `
  <section class="geo" id="geography" aria-labelledby="geo-h" data-accent="#BB9350">
    <div class="geo__stage">
      <div class="geo__map" aria-hidden="true">
        ${img(geography.map, 'Historical map of the Austro-Hungarian Empire showing Vienna and, marked in red, Mostar in Bosnia-Herzegovina', { sizes: '100vw' })}
      </div>

      <svg class="geo__svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <path class="geo__route js-geo-route" d="M 63 34 C 66 46, 63 56, 60.5 66.5" vector-effect="non-scaling-stroke"/>
        <circle class="geo__pin js-geo-pin"  cx="63" cy="34" r="0.7"/>
        <circle class="geo__pin js-geo-pin"  cx="60.5" cy="66.5" r="0.7"/>
        <circle class="geo__pin-ring js-geo-ring" cx="60.5" cy="66.5" r="2.2" vector-effect="non-scaling-stroke"/>
      </svg>

      <div class="geo__content wrap">
        <span class="t-meta" data-reveal="up">Chapter 08 — Page 16</span>
        <p class="geo__cap" data-reveal="up">${esc(geography.caption)}</p>
        <h2 id="geo-h" class="t-chapter" data-reveal="wipe-up">From Vienna<br>to Mostar</h2>
        <div class="geo__leg" data-stagger="120">
          <div data-reveal="up"><i></i><span>${esc(geography.from)} — the imperial court that sent its enologists south.</span></div>
          <div data-reveal="up"><i></i><span>${esc(geography.to)} — Gnojnice, Bišće Polje, and the Imperial Vineyards.</span></div>
        </div>
        <figure class="plate" style="margin-top:var(--s-4);max-width:26rem" data-reveal="wipe-up">
          ${img(geography.regionMap, 'Illustrated map of the Herzegovina wine region in red against the blue of the Adriatic', { sizes: '26rem' })}
          <figcaption>Mostarsko vinogorje</figcaption>
        </figure>
      </div>
    </div>
  </section>`;
}

/* ── 12 · CONTACT ─────────────────────────────────────────────────────────── */
export function contactHTML() {
  return `
  <section class="contact" id="contact" aria-labelledby="contact-h" data-accent="#BB9350">
    <div class="contact__glow" aria-hidden="true"></div>
    <div class="wrap">
      <div class="contact__inner" data-stagger="110">
        <p class="contact__city" aria-hidden="true" data-reveal="up">${esc(contact.city)}</p>
        <div class="contact__logo" data-reveal="scale">
          ${img('brand/emporia-logo-lockup', 'Emporia logo: a crowned Empress Elisabeth holding a fan, above the wordmark EMPORIA', { sizes: '250px' })}
        </div>
        <h2 id="contact-h" class="visually-hidden">Contact</h2>

        <address class="contact__card" data-reveal="up" style="font-style:normal">
          <b>${esc(contact.company)}</b>
          <span>${esc(contact.companyCity)}</span>
          ${contact.lines.map(l => `<span>${esc(l)}</span>`).join('')}
        </address>

        <div class="contact__links" data-reveal="up">
          <a href="tel:${esc(contact.phoneHref)}" data-cursor="Call">${esc(contact.phoneLabel)} ${esc(contact.phone)}</a>
          <a href="mailto:${esc(contact.email)}" data-cursor="Write">${esc(contact.emailLabel)} ${esc(contact.email)}</a>
          <a href="https://${esc(contact.website)}" rel="noopener" data-cursor="Visit">${esc(contact.website)}</a>
        </div>

        <div class="contact__qr" data-reveal="fade">
          ${img(contact.qr, 'QR code linking to Emporia, printed on the back cover of the brochure', { sizes: '118px' })}
        </div>
      </div>
    </div>
  </section>`;
}

/* ── FOOTER ───────────────────────────────────────────────────────────────── */
export function footerHTML() {
  return `
  <footer class="foot">
    <div class="wrap">
      <div class="foot__grid">
        <div>
          <h3>The house</h3>
          <ul>
            <li><a href="#history">History</a></li>
            <li><a href="#about">About Us</a></li>
            <li><a href="#terroir">Terroir</a></li>
            <li><a href="#estate">Estate</a></li>
          </ul>
        </div>
        <div>
          <h3>The wines</h3>
          <ul>${wines.map(w => `<li><a href="#${w.id}">${esc(w.fullName)}</a></li>`).join('')}</ul>
        </div>
        <div>
          <h3>Spirits &amp; honours</h3>
          <ul>
            ${spirits.map(s => `<li><a href="#spirits">${esc(s.idCard['Name'])}</a></li>`).join('')}
            <li><a href="#awards">Distinctions</a></li>
            <li><a href="#geography">From Vienna to Mostar</a></li>
          </ul>
        </div>
        <div>
          <h3>Contact</h3>
          <p>
            ${esc(contact.company)}, ${esc(contact.companyCity)}<br>
            ${contact.lines.map(esc).join('<br>')}<br>
            <a href="tel:${esc(contact.phoneHref)}">${esc(contact.phone)}</a><br>
            <a href="mailto:${esc(contact.email)}">${esc(contact.email)}</a>
          </p>
        </div>
      </div>
      <div class="foot__bottom">
        <span>© ${new Date().getFullYear()} ${esc(contact.company)} — ${esc(brand.winery)}</span>
        <span>${esc(brand.tagline)}</span>
        <span>${esc(contact.website)}</span>
      </div>
    </div>
  </footer>`;
}
