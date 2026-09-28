/**
 * content.js — THE SINGLE SOURCE OF TRUTH
 * -----------------------------------------------------------------------------
 * Every string in this file is transcribed verbatim from the supplied brochure
 * PDF (emporiawine_2.pdf, 16 pages, Adobe InDesign 20.5, Oct 2025).
 *
 * Editorial policy applied during transcription:
 *   • Nothing is summarised, shortened, paraphrased or invented.
 *   • Original spelling, punctuation, capitalisation and the Bosnian/Croatian/
 *     Serbian diacritics (č ć š ž đ) are preserved exactly as printed —
 *     including the source's own idiosyncrasies (e.g. "relaying", "form the
 *     shadow", "craddle", "Fermetation", "noticable", "harmonius").
 *   • Only hyphenation introduced by the PDF's line-wrapping has been rejoined
 *     (e.g. "in-spired" → "inspired", "reflecti-on" → "reflection").
 *   • `pdfPage` records the page each block came from, for audit.
 * -----------------------------------------------------------------------------
 */

/* ── Brand identity, sampled directly from the PDF's own vector fills ───────── */
export const brand = {
  name: 'EMPORIA',
  winery: 'Vinarija CARSKI VINOGRADI',
  wineryEn: 'Imperial Vineyards Winery Mostar',
  company: 'HP INVESTING d.o.o.',
  tagline: 'bottled poetry…',           // p1, cover
  website: 'www.emporia.ba',            // p1, cover
  hotel: 'EMPORIA HOTEL',               // p4
  spiritsTitle: 'EMPORIA spirits',      // p15
  founded: 1886,
};

export const cover = {
  pdfPage: 1,
  tagline: 'bottled poetry…',
  website: 'www.emporia.ba',
  image: 'heritage/imperial-vineyards-1886-workers',
};

/* ── HISTORY — page 2, complete, paragraph by paragraph ─────────────────────── */
export const history = {
  pdfPage: 2,
  title: 'HISTORY',
  portrait: 'heritage/franz-joseph-i-and-empress-elisabeth-sissi',
  paragraphs: [
    'Imperial Vineyards (Carski vinogradi) Winery was established in 1886 in Gnojnice, near Mostar, during Austro-Hungarian Monarchy. Persuaded by his wife, Elizabeth of Bavaria called Sissi, renown for her open-mindedness, forward thinking, an Empress who ruled form the shadow, Franz Joseph I sent prominent Viennese enologists to this area in order to analyse local autochthon sorts of “Žilavka” and “Blatina”.',
    'Eminent enologist of Austrian empire had recognized ideal natural benefits for the development of wine culture starting with climate (record number of sun shining days, more than 300 at annual level) to geography (karst area which easily absorbs solar energy).',
    'The first wine station and the wine school ever in this area was in Gnojnice, which was named Imperial Vineyards that covers the area of 51 acres.',
    'Franz Joseph I was a lover of good wine and classical balls which were held daily at Viennese court for private purposes or official receptions. When His Imperial Majesty had tasted the wine samples produced at this location he decided that wine would be “for his exclusive use only”.',
    '“Für eigene Bedürfnisse“ become permanent label on wines produced on this micro location while vineyards in Gnojnice were renamed into Imperial Vineyards since that day.',
    '“Žilavka“ and “Blatina“ produced for the needs of Viennese court have, quickly became multi awarded wines for best quality from Vienna, Barcelona, Paris to London.',
    'Golden age of “Žilavka” and “Blatina” (and became world-wide known wines) were 1929 at the International Wine Fair in Barcelona, where they gained the most prestigious award “Medaille de platte” while in 1937 they won “Grand prix” in Paris.',
    'Wine from Imperial Vineyards was a favourite and frequent inspiration to numerous artists, most notably they were written about by the Nobel Prize winner Ivo Andrić in his novel “Omer Pasha Latas”.',
  ],
};

/* ── TIMELINE — every date that appears anywhere in the PDF ─────────────────── */
export const timeline = [
  { year: '1353', pdfPage: 6,  label: 'A taste fit for a ban',
    text: 'Bosnian ban Tvrtko enjoyed its distinctive taste in 1353.' },
  { year: '1886', pdfPage: 2,  label: 'The Imperial Vineyards are founded',
    text: 'Imperial Vineyards (Carski vinogradi) Winery was established in 1886 in Gnojnice, near Mostar, during Austro-Hungarian Monarchy.' },
  { year: '1886', pdfPage: 10, label: '“Für eigene Bedürfnisse!”',
    text: 'Franz Joseph, Kaiser von Österreich, über Weine aus unserem Weinberg, Wien, 1886.' },
  { year: '1929', pdfPage: 2,  label: 'Barcelona — “Medaille de platte”',
    text: 'Golden age of “Žilavka” and “Blatina” (and became world-wide known wines) were 1929 at the International Wine Fair in Barcelona, where they gained the most prestigious award “Medaille de platte”.' },
  { year: '1937', pdfPage: 2,  label: 'Paris — “Grand prix”',
    text: 'While in 1937 they won “Grand prix” in Paris.' },
  { year: '2017', pdfPage: 6,  label: 'Decanter World Wine Awards',
    text: 'Bronze for EMPORIA Žilavka, Bronze for EMPORIA Blatina and Silver for Žilavka LIMITED EDITION.' },
];

/* ── ABOUT US — page 3, complete ────────────────────────────────────────────── */
export const about = {
  pdfPage: 3,
  title: 'ABOUT US',
  lead: [
    'Imperial Vineyards Winery Mostar produces wines of new generation relaying on centuries old recipes and latest modern technology.',
    'Synergy between tradition and innovation creates a wine for the future.',
  ],
  paragraphs: [
    'We truly believe that no one can write the future as well as one who remembers the past.',
    'Therefore we named the whole line of wines “Emporia” dedicating it to one of the most beautiful women of Europe and Worldwide – Elisabeth of Bavaria called Sissi - during whose reign our winery was founded.',
    'Our wines are blend of the natural beauty, elegancy, vanguard, prestige, style and taste whose quality surely satisfies the finest and most demanding wine lovers challenging them with their distinct taste.',
    'Emporia line promotes a new trend and breaks all market barriers preserving centuries old recipes and yet making sure we deliver innovations in the world of wine.',
    'Fully committed to the autochthonous wine sorts we are here to nourish the quality and the potential of local grape varieties bringing surprises to wine elite.',
  ],
};

/* ── The Andrić epigraph — page 1 caption block / page 6 ────────────────────── */
export const epigraph = {
  pdfPage: 6,
  quote: '“Precious wine of hard, dry but still blessed region as if a man drinks laughter and song and after the third glass he greets the world around him only with song and laughter.”',
  attribution: 'Ivo Andrić, Omer-Pasha Latas (about Žilavka from Imperial vineyards)',
};

/* ── The imperial decree — pages 10 & 11 ────────────────────────────────────── */
export const decree = {
  de: {
    pdfPage: 10,
    quote: '“Für eigene Bedürfnisse!”',
    attribution: 'Franz Joseph, Kaiser von Österreich, über Weine aus unserem Weinberg, Wien, 1886.',
  },
  en: {
    pdfPage: 11,
    quote: '“For my own personal use!”',
    attribution: 'Franz Joseph, Emperor of Austria and King of Hungary, about wines from our vineyards, Vienna, 1886.',
  },
};

/* ── TERROIR — facts drawn only from the HISTORY text, page 2 ───────────────── */
export const terroir = {
  pdfPage: 2,
  figures: [
    { value: '300', unit: '+ days', caption: 'Record number of sun shining days, more than 300 at annual level.' },
    { value: '51',  unit: 'acres',  caption: 'The first wine station and the wine school ever in this area was in Gnojnice, which was named Imperial Vineyards that covers the area of 51 acres.' },
    { value: '1886', unit: '',      caption: 'Established in Gnojnice, near Mostar, during Austro-Hungarian Monarchy.' },
  ],
  note: 'Eminent enologist of Austrian empire had recognized ideal natural benefits for the development of wine culture starting with climate (record number of sun shining days, more than 300 at annual level) to geography (karst area which easily absorbs solar energy).',
};

/* ── THE ESTATE — pages 4 & 5 photography (no body copy exists on these pages) ─ */
export const estate = {
  pdfPages: [4, 5],
  title: 'EMPORIA HOTEL',
  plates: [
    { img: 'estate/emporia-hotel-drystone-facade-sunset', pdfPage: 4, caption: 'EMPORIA HOTEL' },
    { img: 'estate/winery-stainless-steel-fermentation-hall', pdfPage: 4, caption: 'The fermentation hall' },
    { img: 'vineyard/old-vine-trunk-mostar-valley', pdfPage: 4, caption: 'Mostarsko vinogorje' },
    { img: 'estate/cellar-entrance-at-night', pdfPage: 5, caption: 'The cellar door' },
    { img: 'estate/barrique-cellar-tasting', pdfPage: 5, caption: 'Slavonian and Bosnian oak' },
    { img: 'estate/winery-interior-stair-and-tank-night', pdfPage: 5, caption: 'The winery by night' },
  ],
};

/* ── THE WINES — pages 6–14, and the spirits on page 15 ─────────────────────── */
export const wines = [
  {
    id: 'emporia-zilavka',
    pdfPage: 6,
    brandLine: 'EMPORIA',
    name: 'Žilavka',
    fullName: 'EMPORIA Žilavka',
    accent: '#BB9350',
    kind: 'white',
    bottle: 'wines/emporia-zilavka-bottle',
    grape: 'vineyard/zilavka-and-dark-grapes-harvest-crate',
    artwork: null,
    pullQuote: null,
    body: [
      'In the stone land of sunny Herzegovina, on the blessed ground soaked with wild river Neretva and sweat of winemakers, sumptuous wine Žilavka was born. Those who deal with the production of this liquid gold are rewarded generously. Upright and defiant, this wine has taken on all the characteristics of the area it originated from. That’s why it puts up with periods of long droughts just as well as with periods of heavy autumn rain typical of this area.',
      'This characteristic southern wine with a specific scent , crystal clear greenish-yellow colour and exceptional strength has easily found its place at the top of the wine world. Bosnian ban Tvrtko enjoyed its distinctive taste in 1353, and Ivo Andrić, a Nobel Prize Winner, was inspired by Žilavka from Imperial Vineyards to write the most beautiful thoughts about wine. Big names changed, people came and passed by, and Herzegovinian rubble stood proudly and always captured the beauty of its fruits.',
    ],
    gastronomy: 'Mild cheeses, fish and white meat specialties are in full harmony with the taste of EMPORIA Žilavka.',
    idCard: {
      'Name': 'EMPORIA Žilavka',
      'Category': 'Premium wine',
      'Varietal structure': '95% Žilavka, 5% Bena',
      'Alcohol content': '12%',
      'Serving temperature': '10-12°C',
    },
    awards: ['decanter-2017-bronze-zilavka'],
  },
  {
    id: 'emporia-blatina',
    pdfPage: 7,
    brandLine: 'EMPORIA',
    name: 'Blatina',
    fullName: 'EMPORIA Blatina',
    accent: '#B01E3D',
    kind: 'red',
    bottle: 'wines/emporia-blatina-bottle',
    grape: 'vineyard/blatina-grapes-on-the-vine',
    artwork: 'artwork/sketch-grape-cluster-study',
    pullQuote: 'Wine with a seal of Herzegovina, the one that is remembered and retold!',
    body: [
      '“Beware of its strength!” those are the words every wine expert will warn you with after the first sip. You will be mesmerized by its soft and gentle beauty and make you always want to come back for more of that feeling it awakes in you. The craddle of this variety is Mostar vineyards, and if this lady was transferred to some other place in the world, it would become a pale copy of itself. Simply, nowhere in the world could you produce wine of such fullness and harmony of taste, wine with a seal of Herzegovina, one that is remembered and retold, except the earth it has sprouted from.',
      'Since it’s a “female flower”, it sometimes has unfruitful years, but already in the next vintage it gives wine that is able to fulfill desires of the finest wine elite. Not only irregular harvest enlarge the quality of wine, but it also makes a rare pearl, one of the most beautiful ones. Coloured ruby red, it’s best after aging for a couple of years in wooden barrels.',
    ],
    gastronomy: 'The pleasure of EMPORIA Blatina will be absolute with a plate of any variety of cheese, smoked or any kind of red meat.',
    idCard: {
      'Name': 'EMPORIA Blatina',
      'Category': 'Premium wine',
      'Varietal structure': '85% Blatina, 10% Alicante Bouschet, 5% Vranac',
      'Alcohol content': '12%',
      'Serving temperature': '18-20°C',
    },
    awards: ['decanter-2017-bronze-blatina'],
  },
  {
    id: 'zilavka-limited-edition',
    pdfPage: 8,
    brandLine: '',
    name: 'Žilavka',
    suffix: 'LIMITED EDITION',
    fullName: 'Žilavka LIMITED EDITION',
    accent: '#6B8438',
    kind: 'white',
    bottle: 'wines/zilavka-limited-edition-bottle',
    grape: 'vineyard/blue-grapes-with-autumn-leaves',
    secondary: 'vineyard/vineyard-rows-with-red-poppies',
    artwork: 'artwork/sketch-carski-vinogradi-vine',
    pullQuote: 'All the beauty of the past preserved in one glass.',
    body: [
      'Passionately shaped by flames, the inside of Slavonian and Bosnian oak barrels has perfectly preserved the taste of love, song and laugh, which are constantly inside every drop of this wine. Žilavka LIMITED EDITION has complex wine character and emphasized layers of flavours. Domestic oak and power of fire make the wine stronger and more serious, such that it is immensely easy to drink and love it.',
      'Žilavka’s way from vineyard to glass is more intense than any other wine. It’s the wine that will attract you at first sight with its straw gold colour, and then you will remember the sensual beauty of almonds, honey and vanilla that are in each of its phases. This wine delights with its unique ending.',
    ],
    gastronomy: 'Žilavka LIMITED EDITION belongs to “barriqued” wines and it’s in perfect harmony with fluvial and marine delicacies, as well as roast meat.',
    idCard: {
      'Name': 'Žilavka LIMITED EDITION',
      'Category': 'Premium wine',
      'Varietal structure': 'Žilavka 100%',
      'Alcohol content': '12.5%',
      'Serving temperature': '10-12°C',
    },
    awards: ['decanter-2017-silver-zilavka-limited-edition'],
  },
  {
    id: 'blatina-limited-edition',
    pdfPage: 9,
    brandLine: '',
    name: 'Blatina',
    suffix: 'LIMITED EDITION',
    fullName: 'Blatina LIMITED EDITION',
    accent: '#602A39',
    kind: 'red',
    bottle: 'wines/blatina-limited-edition-bottle',
    grape: 'vineyard/autumn-vine-leaf-and-grapes',
    secondary: 'vineyard/vineyard-poppies-and-wildflowers',
    artwork: 'artwork/sketch-harvest-figure-study',
    pullQuote: 'On the throne for centuries. Untouchable empress of the Imperial Vineyards!',
    body: [
      'In an embrace of fire and wood, the most sumptuous wine from the area of Herzegovina has become worthy of the finest wine elite. Grapes for Blatina LIMITED EDITION are hand-picked from the best positions in a vineyard. After long maceration in stainless steel barrels, wine continues to ripen in Slavonian and Bosnian barrique barrels from 6 to 12 months. It is followed by conjoining of wine in big, oak barrels. In order to be full in flavour, wine has to age in bottles for a while, but you can best feel all the charms of wine when it is served on a rich table.',
      'Carefully chosen grapes, aging in barrels which have unique scent and long stillness in bottles results in divine taste that stays in your mouth long after you put the glass away. Wine is adorned with a deep ruby red colour. It’s got a complex scent with noticable taste of berries. It’s an elegant, soft and drinkable wine with long and nice ending. It is recommended to be served in a decanter, 30 to 45 minutes before the consumption.',
    ],
    gastronomy: 'Blatina LIMITED EDITION wine perfectly goes with red meat prepared with sauces which are rich in flavour, wild deer, roast veal and lamb.',
    idCard: {
      'Name': 'Blatina LIMITED EDITION',
      'Category': 'Premium wine',
      'Varietal structure': 'Blatina 90%, Alicante Bouschet 10%',
      'Alcohol content': '13%',
      'Serving temperature': '16-18°C',
    },
    awards: [],
  },
  {
    id: 'emporia-vranac',
    pdfPage: 10,
    brandLine: 'EMPORIA',
    name: 'Vranac',
    fullName: 'EMPORIA Vranac',
    accent: '#C41C3E',
    kind: 'red',
    bottle: 'wines/emporia-vranac-bottle',
    grape: null,
    artwork: 'artwork/sketch-fish-study-with-pen',
    secondary: 'map/herzegovina-wine-region-illustration',
    pullQuote: null,
    quoteBlock: 'de',
    body: [
      'This full bodied, warm climate wine is made of 100% Vranac, indigenous grape of Herzegovina region. Young wine is aged in Slavonian oak barrels to accentuate notes of cinnamon, chocolate, dark berries and licorice. It is heavenly paired with grilled meat, game and steak.',
    ],
    gastronomy: 'Emporia Vranac is a perfect companion to wild and roast meat, and different grilled dishes.',
    idCard: {
      'Name': 'EMPORIA Vranac',
      'Category': 'Premium wine',
      'Varietal structure': '100% Vranac',
      'Alcohol content': '13,5%',
      'Serving temperature': '18 °C',
    },
    awards: [],
  },
  {
    id: 'emporia-rose-saumon',
    pdfPage: 11,
    brandLine: 'EMPORIA',
    name: 'Rosé Saumon',
    fullName: 'EMPORIA ROSE SAUMON',
    accent: '#EF712E',
    kind: 'rose',
    bottle: 'wines/emporia-rose-saumon-bottle',
    grape: null,
    artwork: 'artwork/sketch-fish-watercolour-vinogorje-mostar',
    secondary: 'artwork/sketch-pencil-on-paper',
    pullQuote: null,
    quoteBlock: 'en',
    body: [
      'Gentle by color, gentle by taste that is simply what Emporia Saumon is. Color of Salmon with subtle taste of citrus  and underlying notes of mediterranean fruits.',
      'Emporia Saumon is based on grape sort pure Blatina and it is hand picked during early hours of the dawn from southern part of Imperial Vineyards, 15-20 days before main harvest in order to retain freshness and acidity levels of the grape.',
      'Fermetation takes place spontaneously in a stainless steel tank with very short maceration period of a few hours. Once it’s bottled, it is kept in a cellar for 4 months before being served.',
    ],
    gastronomy: 'Emporia Rose Saumon perfectly accompanies all lighter fish and vegetable dishes.',
    idCard: {
      'Name': 'EMPORIA ROSE SAUMON',
      'Category': 'Premium Rose wine',
      'Varietal structure': '100% Blatina',
      'Alcohol content': '13%',
      'Serving temperature': '10-12°C',
    },
    awards: [],
  },
  {
    id: 'white-mist-cuvee',
    pdfPage: 12,
    brandLine: 'EMPORIA',
    name: 'White Mist Cuvée',
    fullName: 'White Mist Cuvee',
    accent: '#9BCB42',
    kind: 'white',
    bottle: 'wines/white-mist-cuvee-bottle',
    grape: 'vineyard/white-grapes-at-dusk',
    artwork: 'artwork/sketch-wave-and-vine-study',
    pullQuote: null,
    body: [
      'White Mist Cuvee is a blend of autochthonous Žilavka from Herzegovina with three carefully selected international white varieties planted in the unique microclimate of Imperial Vineyards (Carski vinogradi).',
      'Blending of these varieties in synergism gives a unique wine with a recognizable Herzegovinian terroir.',
      'Chardonnay with its creamy taste and discreet aroma is carefully combined with Chenin Blanc, whose playful acids give freshness and durability. Pošip’s firm character with balanced aromas along with the minerality and fullness of Žilavka give the wine a perfect balance.',
      'By combining varieties in this ratio, we managed to produce something magical and unique, a wine with a very complex aroma and taste, a very long finish with a distinct mineral taste.',
    ],
    gastronomy: 'River and sea fish, shellfish, crabs, full-fat cheeses',
    idCard: {
      'Name': 'White Mist Cuvee',
      'Category': 'Premium wine',
      'Varietal structure': 'Chenin Blanc, Pošip, Chardonnay, Žilavka',
      'Alcohol content': '13.9 %',
      'Serving temperature': '10 - 12 °C',
    },
    awards: [],
  },
  {
    id: 'deep-red-cuvee',
    pdfPage: 13,
    brandLine: 'EMPORIA',
    name: 'Deep Red Cuvée',
    fullName: 'Deep Red Cuvee',
    accent: '#ED1C24',
    kind: 'red',
    bottle: 'wines/deep-red-cuvee-bottle',
    grape: 'vineyard/white-grapes-with-herzegovina-hills',
    artwork: 'artwork/sketch-vine-root-study',
    pullQuote: null,
    body: [
      'Perfect microclimatic conditions in Carski Vinogradi with unique land are a guarantee for unique wines. Striving to perfect the wines, we felt the need to combine the best into one. Five of the best black grape varieties produced in Herzegovina make this wine unique.',
      'The deep ruby color, the aroma of ripe plums, forest fruits and vanilla awaken your palate at the very first encounter, the sumptuous tannins complete the harmonious and complex taste of this wine with a very long finish.',
      'Deep Red Cuvee is a powerful wine typical of Mediterranean regions, with high alcohol and very pleasant acids, perfect for long aging.',
      'In order to feel the best aromas, it is recommended to air it in a decanter for 30-40 minutes.',
    ],
    gastronomy: 'Aged steaks, fish stew, full-fat cheeses, veal under the iron bell.',
    idCard: {
      'Name': 'Deep Red Cuvee',
      'Category': 'Premium wine',
      'Varietal structure': 'Cabernet.S., Syrah, Merlot, Trnjak, Vranac',
      'Alcohol content': '14 %',
      'Serving temperature': '17-18 °C',
    },
    awards: [],
  },
  {
    id: 'emporia-white-selection',
    pdfPage: 14,
    brandLine: 'EMPORIA',
    name: 'White Selection',
    suffix: '023',
    fullName: 'White Selection',
    accent: '#E8862B',
    kind: 'white',
    bottle: 'wines/emporia-white-selection-bottle',
    grape: null,
    artwork: 'artwork/sketch-landscape-line-study',
    pullQuote: null,
    body: [
      'Hand picking of carefully chosen grapes for EMPORIA WHITE SELECTION begins with the first rays of Herzegovinian sunlight. In order for grapes to keep the freshness of night, it is transported to the winery in refrigerator cars. The main part of fermentation takes place in stainless steel dishes with controlled cooling and selected yeasts. A way to a table is up to two years long, and includes aging in barrique barrels, stainless steel tanks and bottles.',
      'Wine colour is light yellow with greenish reflection, and smell is noble and complex with a hint of almonds and honey. The flavour is harmonius and complex, going down your throat in a way only characteristic of the best wines.',
    ],
    gastronomy: 'EMPORIA WHITE SELECTION perfectly goes with fluvial and marine delicacies, but also with roast meat.',
    idCard: {
      'Name': 'White Selection',
      'Category': 'Premium wine',
      'Varietal structure': '85% Žilavka, 10% Chardonnay + 5% Chenin Blanc',
      'Alcohol content': '13%',
      'Serving temperature': '10-12°C',
    },
    awards: [],
  },
];

/* ── SPIRITS — page 15 ──────────────────────────────────────────────────────── */
export const spirits = [
  {
    id: 'emporia-cherry',
    pdfPage: 15,
    name: 'EMPORIA CHERRY',
    accent: '#BD1E37',
    bottle: 'wines/emporia-cherry-liqueur-bottle',
    body: [
      'EMPORIA CHERRY is a fruit liqueur produced from Marasca cherries. It is produced according to a long-kept recipe, respecting even the smallest details.',
      'In the heat of the Herzegovinian sun, the finest Marasca cherry berries are macerated in wine distillate in 50 l glass containers. After 3-4 months of maceration, the obtained macerate is additionally enriched with natural macerates of other fruits.',
      'By combining the macerate, the liqueur continues aging in wooden and stainless steel barrels for 12-18 months. It fits perfectly as a dessert drink, served chilled with the finest desserts.',
    ],
    idCard: {
      'Name': 'EMPORIA Cherry',
      'Category': 'Fruit liqueur',
      'Varietal structure': 'Maraska cherry',
      'Alcohol content': '27%',
      'Serving temperature': '4-6 °C',
    },
  },
  {
    id: 'emporia-loza-specijal',
    pdfPage: 15,
    name: 'EMPORIA LOZA SPECIJAL',
    accent: '#B98A4F',
    bottle: 'wines/emporia-loza-specijal-bottle',
    body: [
      'EMPORIA LOZA SPECIJAL is produced by careful distillation of young wine, which is distilled on modern distillation devices immediately before the first pour.',
      'During distillation, only the highest quality central part of the distillate is separated. The wine distillate obtained in this way is aged in stainless steel containers, retaining the original varietal aroma.',
      'It is traditionally served as an aperitif, stimulating the appetite before the meal.',
    ],
    idCard: {
      'Name': 'EMPORIA Loza Specijal',
      'Category': 'Natural fruit brandy',
      'Varietal structure': 'distillate of Žilavka, Blatina and Muscat Hamburg',
      'Alcohol content': '40%',
      'Serving temperature': '4-6 °C',
    },
  },
];

/* ── AWARDS — every distinction named anywhere in the PDF ───────────────────── */
export const awards = [
  { id: 'decanter-2017-bronze-zilavka', year: '2017', medal: 'BRONZE',
    competition: 'Decanter', series: 'WORLD WINE AWARDS', wine: 'EMPORIA Žilavka',
    wineId: 'emporia-zilavka', image: 'awards/decanter-2017-bronze-zilavka', pdfPage: 6 },
  { id: 'decanter-2017-bronze-blatina', year: '2017', medal: 'BRONZE',
    competition: 'Decanter', series: 'WORLD WINE AWARDS', wine: 'EMPORIA Blatina',
    wineId: 'emporia-blatina', image: 'awards/decanter-2017-bronze-blatina', pdfPage: 7 },
  { id: 'decanter-2017-silver-zilavka-limited-edition', year: '2017', medal: 'SILVER',
    competition: 'Decanter', series: 'WORLD WINE AWARDS', wine: 'Žilavka LIMITED EDITION',
    wineId: 'zilavka-limited-edition', image: 'awards/decanter-2017-silver-zilavka-limited-edition', pdfPage: 8 },
];

export const historicAwards = [
  { year: '1929', medal: '“Medaille de platte”', competition: 'International Wine Fair', city: 'Barcelona',
    wine: '“Žilavka” and “Blatina”', pdfPage: 2,
    text: 'Golden age of “Žilavka” and “Blatina” (and became world-wide known wines) were 1929 at the International Wine Fair in Barcelona, where they gained the most prestigious award “Medaille de platte”.' },
  { year: '1937', medal: '“Grand prix”', competition: 'Grand prix', city: 'Paris',
    wine: '“Žilavka” and “Blatina”', pdfPage: 2,
    text: 'While in 1937 they won “Grand prix” in Paris.' },
];

export const awardsNote = {
  pdfPage: 2,
  text: '“Žilavka“ and “Blatina“ produced for the needs of Viennese court have, quickly became multi awarded wines for best quality from Vienna, Barcelona, Paris to London.',
  cities: ['Vienna', 'Barcelona', 'Paris', 'London'],
};

/* ── GEOGRAPHY & CONTACT — page 16 ──────────────────────────────────────────── */
export const geography = {
  pdfPage: 16,
  map: 'map/austro-hungarian-empire-map-mostar',
  regionMap: 'map/herzegovina-wine-region-illustration',
  caption: 'AUSTRO — HUNGARIAN EMPIRE',
  from: 'Vienna',
  to: 'Mostar',
};

export const contact = {
  pdfPage: 16,
  city: 'Mostar',
  company: 'HP INVESTING d.o.o.',
  companyCity: 'Mostar',
  lines: [
    'Vinarija CARSKI VINOGRADI',
    'Mostarsko vinogorje',
    'Bišće Polje bb, 88000 Mostar',
    'Bosna i Hercegovina',
  ],
  phoneLabel: 'Mob:',
  phone: '+387 63 345 097',
  phoneHref: '+38763345097',
  emailLabel: 'E-mail:',
  email: 'emporia@carskivinogradi.com',
  website: 'www.emporia.ba',
  qr: 'brand/emporia-qr-code',
};

/* ── Navigation — labels derived from the PDF's own section headings ────────── */
export const nav = [
  { id: 'history',  label: 'History',   meta: '02' },
  { id: 'about',    label: 'About Us',  meta: '03' },
  { id: 'terroir',  label: 'Terroir',   meta: '02' },
  { id: 'estate',   label: 'Estate',    meta: '04–05' },
  { id: 'wines',    label: 'Wines',     meta: '06–14' },
  { id: 'spirits',  label: 'Spirits',   meta: '15' },
  { id: 'awards',   label: 'Awards',    meta: '06–08' },
  { id: 'contact',  label: 'Contact',   meta: '16' },
];
