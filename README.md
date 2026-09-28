# EMPORIA — Vinarija Carski Vinogradi, Mostar

An immersive, cinematic edition of the Emporia brochure (`emporiawine_2.pdf`, 16 pages).
Every word, number, date, award and photograph in the PDF is present on the site;
the presentation is rebuilt from scratch for the screen.

---

## Running it

The site has **no build step**. It is plain ES modules, so it needs to be served
over HTTP rather than opened from the filesystem.

```bash
cd site

# any static server will do
python3 -m http.server 8080
#   or
npx serve .
#   or
npx http-server -p 8080
```

Then open <http://localhost:8080>.

To deploy: upload the contents of `site/` to any static host — Netlify, Vercel,
Cloudflare Pages, S3, or ordinary shared hosting. There is nothing to compile.

### Regenerating the static artefacts

`content.html`, `sitemap.xml`, `robots.txt`, the favicon and the product JSON-LD
are generated from the content model so they can never drift out of sync with it:

```bash
node tools/build-static.mjs
```

---

## Structure

```
site/
├── index.html                  the experience (SEO head, loader, chrome, JSON-LD)
├── content.html                every word of the brochure, no JavaScript required
├── robots.txt · sitemap.xml · site.webmanifest
├── assets/
│   ├── img/
│   │   ├── heritage/           the 1886 photograph, the imperial portrait
│   │   ├── estate/             hotel, cellar, fermentation hall
│   │   ├── vineyard/           vines, grapes, poppies
│   │   ├── wines/              11 bottles, cut from their studio backdrops
│   │   ├── awards/             3 Decanter medals, isolated with alpha
│   │   ├── artwork/            the label studies
│   │   ├── map/                Austro-Hungarian empire, Herzegovina region
│   │   └── brand/              logo, mark, Sissi silhouette, gold leaf, QR
│   └── fonts/                  self-hosted woff2, latin + latin-ext
├── vendor/                     three.js · gsap · scrolltrigger · lenis (local)
├── src/
│   ├── styles/
│   │   ├── tokens.css          colour, type, space, motion — all PDF-derived
│   │   ├── fonts.css           @font-face, generated
│   │   ├── base.css            reset, primitives, the reveal system
│   │   ├── responsive.css      the small-screen re-composition
│   │   └── sections/
│   │       ├── shell.css       loader, nav, menu, cursor, chapter rail
│   │       ├── story.css       hero, epigraph, history, timeline, about,
│   │       │                   terroir, estate
│   │       ├── wines.css       the five layout archetypes, spirits
│   │       └── closing.css     awards, map, contact, footer
│   └── js/
│       ├── main.js             assembly and boot order
│       ├── data/content.js     ★ the single source of truth — 100% of the PDF
│       ├── core/               env · util · scroll · reveal · loader ·
│       │                       cursor · chrome · parallax
│       ├── sections/           story · wines · closing  (markup from data)
│       ├── three/              renderer · hero-scene · grape-field · award-hall
│       └── shaders/            hero.glsl.js
└── tools/
    ├── build-static.mjs        generates content.html, sitemap, JSON-LD, icons
    ├── cut-bottles.py          isolates the bottles from their studio sweeps
    ├── audit.mjs               the PDF-vs-site completeness audit
    ├── qa.mjs · shots.mjs      headless QA and screenshots
    ├── a11y.mjs                keyboard, contrast, semantics, reduced motion
    └── glcheck.mjs             verifies the WebGL path and its fallback
```

**`src/js/data/content.js` is the only place the brochure's words live.** Markup is
generated from it, `content.html` is generated from it, the structured data is
generated from it, and the audit compares it back against the PDF. Change a
tasting note there and it changes everywhere, once.

---

## The chapters

| # | Chapter | Source pages | What makes it different |
|---|---------|--------------|-------------------------|
| 01 | Hero | 1 | The 1886 photograph as a WebGL relief; gold dust; gold-leaf wordmark |
| 02 | Epigraph | 6 | Andrić on black, revealed character by character |
| 03 | History | 2 | Pinned imperial portrait, scrolling column, oversized folio |
| 04 | Timeline | 2, 6, 10 | Vertical scroll converted to horizontal travel |
| 05 | About Us | 3 | The Sissi silhouette, light ground, staircase indent |
| 06 | Terroir | 2 | Three parallax layers + an instanced grape field that follows the cursor |
| 07 | Estate | 4–5 | Draggable asymmetric plate rail, then a full-width coda |
| 08 | The wines | 6–14 | Nine rooms, five layout archetypes, one accent colour each |
| 09 | Spirits | 15 | Ivory ground, watermark vine study, framed studio plates |
| 10 | Awards | 2, 6–8 | Medals floating in a dark hall over drifting gold motes |
| 11 | Geography | 16 | The empire map with a route drawn from Vienna to Mostar |
| 12 | Contact | 16 | Cellar dark, the logo, the full address, the QR code |

---

## Technology

- **Vanilla ES modules.** No framework, no bundler, no build step. The site is
  fifteen small modules that the browser loads directly.
- **Three.js 0.160** — three scenes, each with its own canvas inside its own
  slot, each paused when off-screen or when the tab is hidden.
- **GSAP 3.12 + ScrollTrigger** — the loader's wine flood and the map's route.
- **Lenis 1.1** — smooth scrolling on desktop; native scrolling on touch and
  under `prefers-reduced-motion`.
- **Custom GLSL** — the hero's depth-parallax, grain, vignette and light sweep
  run in one fragment pass, so there is no post-processing chain to pay for.

All four libraries are vendored into `vendor/`. The site makes **no third-party
requests at all** — fonts included.

---

## Performance

- Every image ships as WebP at two widths with `srcset`/`sizes`; 23 MB of
  extracted source art became **3.8 MB**.
- Below-the-fold images are lazy; the hero photograph is preloaded with
  `fetchpriority="high"`.
- WebGL is dynamically imported during idle time, after first paint, and only
  when the device qualifies.
- Particle counts, geometry detail and pixel ratio scale with a device tier
  derived from `hardwareConcurrency`, `deviceMemory` and pointer type.
- Parallax runs on one shared rAF loop with off-screen culling.
- Film grain and the torn-edge ribbon masks are generated at runtime rather
  than downloaded.

## Fallbacks

| Condition | Behaviour |
|-----------|-----------|
| `prefers-reduced-motion` | All WebGL suppressed, transitions collapsed to ~0ms, every reveal shown immediately, native scrolling. Verified: 0 hidden elements. |
| No WebGL / software rasteriser | `.no-webgl` on `<html>`; the hero falls back to a CSS-filtered photograph, the other scenes simply do not mount. |
| Context lost mid-session | Caught, the scene is parked, `.no-webgl` applied, the page continues. |
| Low-tier device | WebGL skipped entirely; particle counts and DPR reduced on mid tier. |
| JavaScript off | `<noscript>` points to `content.html`, which carries the entire brochure. |
| Print | Chrome, canvases and animation removed; the document prints as a clean black-on-white brochure. |

---

## Verification

```bash
node tools/audit.mjs      # PDF vs site: blocks, tokens, counts, images
node tools/qa.mjs         # console errors, broken images, overflow, reveals
node tools/a11y.mjs       # keyboard, semantics, contrast, reduced motion
node tools/glcheck.mjs    # the WebGL path and its fallback
node tools/shots.mjs --gl --tag=desk   # screenshots of all 22 sections
```

The audit result is committed as `AUDIT.txt` at the repository root.
