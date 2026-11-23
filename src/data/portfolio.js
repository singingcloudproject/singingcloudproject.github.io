// ─────────────────────────────────────────────────────────────────────────────
// PORTFOLIO: every piece of work on the site.
// To add work: put the original in media-source/, add an entry here, run `npm run media`.
//
// category: 'ai-videos' | 'ai-photos' | 'carousels' | 'websites'  (the portfolio filters)
// services: which service pages show it: 'ai' | 'websites' | 'social' | 'branding' | 'automation'
// label:    honest tag shown on the card ("Concept", "Client project", "Demo", or a brand disclaimer)
// ─────────────────────────────────────────────────────────────────────────────

const CONCEPT = 'Concept'
const notAffiliated = (brand) => `Concept piece — not affiliated with ${brand}`

const photo = (id, src, alt) => ({ id, src, alt, kind: 'photo' })
const video = (id, src) => ({ id, src, kind: 'video' })

export const PORTFOLIO = [
  // ── AI videos ─────────────────────────────────────────────
  { id: 'latte-wave', title: 'Latte wave', category: 'ai-videos', services: ['ai', 'social'], label: CONCEPT,
    alt: 'A tiny surfer rides a wave of milk foam rising out of a latte cup',
    media: [video('latte-wave', 'videos/484745037_1794661886828811.mp4')], ratio: '9/16' },
  { id: 'burger-drop', title: 'Burger drop', category: 'ai-videos', services: ['ai', 'social'], label: CONCEPT,
    alt: 'A double cheeseburger builds itself layer by layer as cheese melts down the sides',
    media: [video('burger-drop', 'videos/928933801_1794661628623235.mp4')], ratio: '9/16' },
  { id: 'fig-honey', title: 'Fig & honey hand cream', category: 'ai-videos', services: ['ai', 'branding'], label: CONCEPT,
    alt: 'Honey pours slowly down a sage-green hand cream tube between halved figs',
    media: [video('fig-honey', 'videos/doitong_1794664488.mp4')], ratio: '9/16' },
  { id: 'perfume-teaser', title: 'Luxury perfume teaser', category: 'ai-videos', services: ['ai', 'social'], label: notAffiliated('Versace'),
    alt: 'A black and gold perfume bottle in water droplets, golden light and cinnamon',
    media: [video('perfume-teaser', 'videos/perfume-teaser.mp4')], ratio: '9/16' },

  // ── AI photos ─────────────────────────────────────────────
  ...[
    ['window-light', 'photos/447719182_1794706754211937.jpg', 'Window-light portrait', 'Black and white portrait of a woman on a wooden chair by a bright window'],
    ['warehouse', 'photos/545426477_1792450091073948.jpg', 'Warehouse portrait', 'Black and white portrait of a woman sitting on a concrete step in soft light'],
    ['double-exposure', 'photos/72940337_1792190557740330.jpg', 'Double exposure', 'Black and white double-exposure fashion portrait', 'Calvin Klein'],
    ['night-drive', 'photos/IMG_0590.jpg', 'Night drive', 'A woman in a long leather coat steps out of a black SUV at night'],
    ['mountain-road', 'photos/IMG_0591.jpg', 'Mountain road trip', 'A woman in a cap sits in an open SUV door with misty green mountains behind'],
    ['studio-dream', 'photos/IMG_0594.jpg', 'Studio dream', 'Black and white studio portrait with a soft double exposure', 'Calvin Klein'],
    ['high-key', 'photos/IMG_0678.jpg', 'High-key portrait', 'Bright black and white portrait of a woman on a stool'],
    ['backlit', 'photos/IMG_0683.png', 'Backlit portrait', 'Grainy black and white backlit portrait'],
    ['survival-selfie', 'photos/IMG_0898.png', 'Survival-game selfie', 'A mirror selfie turned into a foggy survival-game screen with a health bar', 'Puma'],
    ['front-row', 'photos/IMG_1271.jpg', 'Front row', 'A smiling guest in sunglasses in the front row of a fashion show', 'Chanel, Prada or Burberry'],
    ['soho-stride', 'photos/IMG_1273.jpg', 'Street style, New York', 'A woman strides across a New York crosswalk past yellow taxis'],
    ['old-hollywood', 'photos/IMG_1274.jpg', 'Old Hollywood', 'Black and white old-Hollywood portrait in a satin gown on a film set'],
    ['character-sheet', 'photos/IMG_1369.png', 'AI character sheet', 'One AI-generated man shown from the front, three-quarter and side'],
    ['flat-outfit', 'photos/IMG_1370.png', 'Floating outfit', 'A white tank top, belted jeans and sneakers on an invisible body', 'Adidas'],
    ['pink-supercar', 'photos/IMG_1371.png', 'Pink supercar', 'A glossy hot-pink supercar in front of a pale concrete wall'],
    ['turnaround', 'photos/IMG_1382.jpg', 'Character turnaround', 'An AI-generated woman shown from the front, side and three-quarter'],
    ['liquid-portrait', 'photos/IMG_1396.jpg', 'Liquid portrait', 'A face rising out of a clear pool of water on white marble'],
    ['liquid-portrait-2', 'photos/IMG_1397.jpg', 'Liquid portrait II', 'A face framed by a puddle of clear liquid on marble, seen from above'],
    ['cloud-crew', 'photos/IMG_1426.jpg', 'Cloud crew', 'Illustrated duo in bandanas carrying Singing Cloud bags at a sunset gas station'],
  ].map(([id, src, title, alt, brand]) => ({
    id, title, category: 'ai-photos', services: ['ai'], label: brand ? notAffiliated(brand) : CONCEPT,
    alt, media: [photo(id, src, alt)],
  })),

  // ── Carousels / campaign sets (swipe through) ─────────────
  { id: 'brother-nature', title: 'Brother Nature: Instagram carousels', category: 'carousels', services: ['social'], label: 'Client project',
    alt: 'Instagram carousel slides for the artist Brother Nature',
    media: [2, 1, 3, 4, 5, 6].map((n, i) => photo(`bn-${n}`, `carousels/brother-nature/slide-${n}.jpg`, `Brother Nature carousel, slide ${i + 1} of 6`)) },
  { id: 'moonlight', title: 'Moonlight: hand cream campaign', category: 'carousels', services: ['social', 'branding', 'ai'], label: CONCEPT,
    alt: 'Navy and ice-blue campaign posters for a hand cream called Moonlight',
    media: ['1411', '1400', '1405', '1409', '1410', '1412', '1401', '1402', '1406', '1403', '1407', '1404', '1408'].map((n, i) =>
      photo(`moon-${n}`, `campaign/IMG_${n}.jpg`, `Moonlight hand cream campaign, image ${i + 1} of 13`)) },
  { id: 'rouge', title: 'Rouge: lipstick campaign', category: 'carousels', services: ['social', 'ai'], label: notAffiliated('Chanel'),
    alt: 'A red lipstick with a gold case on black marble with white camellia petals',
    media: [['rouge-1', '251555489_1794662640142630.jpg'], ['rouge-2', 'IMG_1334.jpg'], ['rouge-3', 'IMG_1336.jpg']].map(([id, f], i) =>
      photo(id, `campaign/${f}`, `Lipstick campaign, image ${i + 1} of 3`)) },
  { id: 'cafe-food', title: 'Café & food ads', category: 'carousels', services: ['social', 'ai'], label: CONCEPT,
    alt: 'Food and café advertising images',
    media: [['cafe-1', 'IMG_1326.jpg', 'A surfer rides a wave of latte foam'], ['cafe-2', 'IMG_1330.jpg', 'Iced coffee splash poster for Aura Cafe'],
      ['cafe-3', 'IMG_1324.jpg', 'A floating double cheeseburger'], ['cafe-4', 'IMG_1331.jpg', 'A pizza slice pulled with stretchy cheese'],
      ['cafe-5', 'IMG_1325.jpg', 'A barista pours latte art in a sunny café']].map(([id, f, alt]) => photo(id, `campaign/${f}`, alt)) },
  { id: 'fine-jewelry', title: 'Fine jewelry campaign', category: 'carousels', services: ['ai', 'social'], label: CONCEPT,
    alt: 'Diamond and teal gemstone jewelry on dark velvet',
    media: [['jewel-1', 'IMG_1520.jpg'], ['jewel-2', 'IMG_1525.jpg'], ['jewel-3', 'IMG_1524.jpg'], ['jewel-4', 'IMG_1522.jpg']].map(([id, f], i) =>
      photo(id, `campaign/${f}`, `Diamond and teal gemstone jewelry, image ${i + 1} of 4`)) },
  { id: 'game-banners', title: 'Mobile game ad banners', category: 'carousels', services: ['social', 'ai'], label: CONCEPT,
    alt: 'Advertising banners for mobile games',
    media: [['game-1', 'IMG_1471.png', 'Neon street-racing game banner: Own the night'], ['game-2', 'IMG_1472.png', 'Fighting game banner: Fight for the crown'],
      ['game-3', 'IMG_1470.png', 'Horror game banner: Don’t follow the static'], ['game-4', 'IMG_1473.png', 'Farming game banner: Build your dream island'],
      ['game-5', 'IMG_1474.png', 'Farming game banner: Grow. Harvest. Explore.'], ['game-6', 'IMG_1475.png', 'Farming game banner: From wild to wow']]
      .map(([id, f, alt]) => photo(id, `game-banners/${f}`, alt)) },
  { id: 'whipped-cloud', title: 'Whipped Cloud: product & mood board', category: 'carousels', services: ['branding'], label: CONCEPT,
    alt: 'A butter-yellow cream tube on whipped cream in a silver coupe, with its mood board',
    media: [['whip-1', 'IMG_1533.png', 'Whipped Cloud mood board with colours, typography and product photos'],
      ['whip-2', 'IMG_1346.jpg', 'A yellow tube resting on whipped cream in a silver coupe'],
      ['whip-3', 'IMG_1349.jpg', 'Honey pouring down a sage-green hand cream tube between figs']].map(([id, f, alt]) => photo(id, `campaign/${f}`, alt)) },

  // ── Websites ──────────────────────────────────────────────
  { id: 'jewelry-store', title: 'Luxury jewelry store', category: 'websites', services: ['websites'], label: 'Demo',
    kindLabel: 'Luxury jewelry store — Demo',
    alt: 'The luxury jewelry store website on a phone and a laptop',
    url: 'https://singingcloudproject.github.io/jewelry-store-demo/',
    description: 'A boutique you can step into: a cinematic scroll journey, a 360° store with glowing display cases, and a full catalogue.',
    tags: ['360° store', 'Mobile-first', 'Cinematic animations', 'Contact form', 'Filters & product pages'],
    shots: { phone: 'sites/jewelry-phone.webp', phoneTall: 'sites/jewelry-phone-tall.webp', desktop: 'sites/jewelry-desktop.webp', video: 'sites/jewelry-scroll.mp4' } },
]

// Flat list of files for scripts/optimize-media.mjs
export const MEDIA = PORTFOLIO.flatMap((p) => p.media || [])

export const FILTERS = [
  { id: 'all', label: 'All work' },
  { id: 'ai-videos', label: 'AI Videos' },
  { id: 'ai-photos', label: 'AI Photos' },
  { id: 'websites', label: 'Websites' },
  { id: 'carousels', label: 'Carousels' },
]
