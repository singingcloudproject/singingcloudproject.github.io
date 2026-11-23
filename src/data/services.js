// ─────────────────────────────────────────────────────────────
// SERVICES: the five hotspots in the 3D studio and their pages.
// Prices are "from" prices in US dollars.
// ─────────────────────────────────────────────────────────────

export const AUDIENCE = [
  { id: 'clinics', label: 'Clinics & beauty' },
  { id: 'business', label: 'Small businesses' },
  { id: 'brands', label: 'Product brands' },
  { id: 'teachers', label: 'Teachers' },
  { id: 'coaches', label: 'Online coaches' },
  { id: 'creators', label: 'Creators' },
]

export const SERVICES = [
  {
    id: 'ai', slug: 'ai-videos-photos', name: 'AI Videos & Photos', short: 'AI Videos & Photos',
    kicker: 'Cinematic visuals, without the film crew',
    headline: 'Product shots and short films that look like a big-budget shoot.',
    intro: 'I direct AI to create the visuals your brand needs: campaign photos, product videos, ad clips and portraits. You get studio-grade images in days, not weeks, for a fraction of a photo shoot.',
    does: [
      'Product photos and campaign images in any setting you can imagine',
      'Short vertical videos for Reels, TikTok and ads',
      'AI characters and portraits for your brand story',
      'Editing of your own footage into clean, scroll-stopping clips',
    ],
    forWho: {
      clinics: 'Fresh, calming visuals for treatments and products',
      business: 'Ads and posts without hiring a photographer',
      brands: 'Product launches and campaign images',
      teachers: 'Eye-catching visuals for courses and lessons',
      coaches: 'Thumbnails, promo clips and brand imagery',
      creators: 'Cinematic content that grows your page',
    },
    prices: [
      { item: 'AI photo or video', price: 'from $100' },
      { item: 'Video editing: 4 videos', price: '$120' },
      { item: 'Video editing: 10 videos', price: '$250' },
      { item: 'Video editing: 20 videos', price: '$450' },
    ],
    cta: 'Order AI visuals',
    message: 'Hi! I’d like AI photos or videos for my brand.',
  },
  {
    id: 'websites', slug: 'websites', name: 'Websites', short: 'Websites',
    kicker: 'Websites people remember',
    headline: 'Fast, beautiful websites that turn visitors into clients.',
    intro: 'I design and build websites that feel premium on every phone: clear words, cinematic motion and a contact form that brings you enquiries. Every one-page site includes three months of support.',
    does: [
      'One-page and multi-page websites, designed for phones first',
      '3D, 360° and cinematic effects when your brand calls for them',
      'Contact forms, WhatsApp and Instagram buttons',
      'SEO setup so the right people find you on Google',
    ],
    forWho: {
      clinics: 'A trustworthy site that books consultations',
      business: 'Your services, prices and contact in one place',
      brands: 'A showcase that makes products feel premium',
      teachers: 'A home for your lessons and sign-ups',
      coaches: 'A landing page that sells your programme',
      creators: 'A portfolio that shows your best work',
    },
    prices: [
      { item: 'One-page website (incl. 3 months support)', price: 'from $500' },
      { item: 'Multi-page website', price: 'from $1,000' },
      { item: 'Website support', price: '$50 / month' },
      { item: 'SEO setup', price: 'from $200' },
    ],
    cta: 'Start my website',
    message: 'Hi! I’d like a website.',
  },
  {
    id: 'social', slug: 'social-media-content', name: 'Social Media & Content', short: 'Social & Content',
    kicker: 'Content that stops the scroll',
    headline: 'Carousels, Reels and a feed that finally looks like your brand.',
    intro: 'From one carousel to your whole account, I plan, design and edit the content that keeps your page alive, so you can focus on your clients.',
    does: [
      'Instagram carousels designed to be saved and shared',
      'Reels and short video editing',
      'Monthly social media management',
      'Ad banners and campaign graphics',
    ],
    forWho: {
      clinics: 'Before-and-after posts and treatment explainers',
      business: 'A steady, professional feed every month',
      brands: 'Launch campaigns and ad creatives',
      teachers: 'Lesson tips turned into shareable carousels',
      coaches: 'Content that builds trust and sells your offer',
      creators: 'Edits and carousels that grow your audience',
    },
    prices: [
      { item: 'Instagram carousel', price: 'from $40' },
      { item: 'Social media management', price: 'from $300 / month' },
      { item: 'Video editing: 4 / 10 / 20 videos', price: '$120 / $250 / $450' },
    ],
    cta: 'Grow my page',
    message: 'Hi! I’d like help with my social media content.',
  },
  {
    id: 'branding', slug: 'branding-logos', name: 'Branding & Logos', short: 'Branding & Logos',
    kicker: 'A look people recognise instantly',
    headline: 'Logos and visual identities with a story behind them.',
    intro: 'I create the logo, colours, fonts and mood that make your brand recognisable everywhere: on your website, your posts and your packaging.',
    does: [
      'Logo design, from first sketch to final files',
      'Colour palette and font pairing',
      'Mood boards and packaging concepts',
      'Brand assets for social media and print',
    ],
    forWho: {
      clinics: 'A calm, premium identity patients trust',
      business: 'A professional logo that looks good everywhere',
      brands: 'Packaging and product identity',
      teachers: 'A friendly, memorable brand for your school',
      coaches: 'A personal brand that feels like you',
      creators: 'A logo and style for your channel',
    },
    prices: [
      { item: 'Logo design', price: 'from $150' },
    ],
    cta: 'Design my brand',
    message: 'Hi! I’d like a logo or brand identity.',
  },
  {
    id: 'automation', slug: 'automation-ai-assistants', name: 'Automation & AI Assistants', short: 'Automation & AI',
    kicker: 'Your business, answering itself',
    headline: 'AI assistants that reply to clients while you sleep.',
    intro: 'I set up auto-replies, AI chat assistants and smart workflows for Instagram, WhatsApp and your website, so no message goes unanswered and you win back hours every week.',
    does: [
      'Instagram and WhatsApp auto-replies',
      'AI chat assistants trained on your services and prices',
      'Booking and enquiry flows that collect client details',
      'Workflows that connect your tools and save hours',
    ],
    forWho: {
      clinics: 'Answer booking questions around the clock',
      business: 'Reply to every enquiry, instantly',
      brands: 'Product questions answered automatically',
      teachers: 'Handle sign-ups and lesson questions',
      coaches: 'Qualify leads before the first call',
      creators: 'Reply to DMs and collab requests',
    },
    prices: [
      { item: 'Automation or AI assistant', price: 'from $300' },
    ],
    cta: 'Automate my business',
    message: 'Hi! I’d like an AI assistant or automation.',
  },
]

export const serviceBySlug = (slug) => SERVICES.find((s) => s.slug === slug)
export const serviceById = (id) => SERVICES.find((s) => s.id === id)
