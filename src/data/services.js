// ─────────────────────────────────────────────────────────────
// SERVICES: the three clouds on the mountain and their pages.
// No prices or packages anywhere on the site.
// ─────────────────────────────────────────────────────────────

export const AUDIENCE = [
  { id: 'shops', label: 'Online shops' },
  { id: 'brands', label: 'Product brands' },
  { id: 'clinics', label: 'Clinics & beauty' },
  { id: 'business', label: 'Local businesses' },
  { id: 'experts', label: 'Coaches & experts' },
  { id: 'startups', label: 'Startups' },
]

export const SERVICES = [
  {
    id: 'websites', slug: 'website-seo', name: 'Website & SEO', short: 'Website & SEO',
    kicker: 'From a blank page to the site people remember',
    headline: 'A website that feels like walking into your best shop window.',
    intro: 'Most websites are polite. Yours should be unforgettable. I design and build sites that look expensive, load fast on every phone, and quietly guide each visitor towards one thing: getting in touch with you. Then I make sure Google can find you.',
    pitch: 'Design, UI/UX, development from zero to hero, ongoing support and SEO, all in one pair of hands.',
    does: [
      'Website design that makes your brand look as good as it really is',
      'UI/UX: every button, page and scroll planned so visitors know exactly where to go',
      'Development from zero to hero: from the first sketch to a fast, live, mobile-first site',
      'Website support: updates, fixes and new pages whenever you need them',
      'SEO: clear structure, fast pages and the right words, so the right people find you on Google',
    ],
    forWho: {
      shops: 'A storefront that turns browsing into buying',
      brands: 'A showcase that makes your products feel premium',
      clinics: 'A calm, trustworthy site that brings in bookings',
      business: 'Your services and contact details, beautifully clear',
      experts: 'A home for your offer that builds trust before the first call',
      startups: 'A launch site that looks ready for the big league',
    },
    cta: 'Start my website',
    message: 'Hi! I’d like to talk about a website.',
  },
  {
    id: 'automation', slug: 'automation-ai-assistants', name: 'Automation & AI Assistants', short: 'Automation & AI',
    kicker: 'Your business, answering itself',
    headline: 'Imagine every message answered while you sleep.',
    intro: 'You didn’t start a business to copy and paste the same reply all day. I build automations and AI assistants that greet your customers, answer their questions in your voice, collect the details you need and hand you the warm leads, so you get your time back for the work you love.',
    pitch: 'n8n workflows, AI assistants and chatbots that work for your business around the clock.',
    does: [
      'Automations (for example n8n workflows) that connect your tools and take repetitive tasks off your plate',
      'AI assistants that know your services and reply to customers in your tone of voice',
      'Chatbots for your website, Instagram, Telegram or WhatsApp Business',
      'Enquiry and booking flows that collect the right details before you ever pick up the phone',
      'Smart hand-offs: the assistant answers the easy questions and passes the serious buyers straight to you',
    ],
    forWho: {
      shops: 'Product and order questions answered instantly',
      brands: 'Every enquiry caught, sorted and followed up',
      clinics: 'Booking questions handled at any hour',
      business: 'No more missed messages or forgotten follow-ups',
      experts: 'Leads qualified before your first call',
      startups: 'Big-team support without the big team',
    },
    cta: 'Automate my business',
    message: 'Hi! I’d like an AI assistant or automation.',
  },
  {
    id: 'ads', slug: 'product-ads', name: 'Product Ads', short: 'Product Ads',
    kicker: 'Make people want it before they’ve read a word',
    headline: 'Ads that make your product the main character.',
    intro: 'A great product deserves a stage. I plan and create product ads that stop the scroll: from the first storyboard to cinematic AI product videos, striking photos and ready-to-run campaign visuals. Jewelry that sparkles off the screen, cosmetics you can almost feel, food you can almost taste.',
    pitch: 'Storyboards, AI product photos and videos, ad visuals and full ad campaigns for your products.',
    does: [
      'Storyboards that plan every second of your ad before anything is made',
      'AI product videos with cinematic light, motion and mood',
      'AI product photos in any setting you can imagine, without a studio day',
      'Ad visuals and designs for social media, websites and marketplaces',
      'Ad campaigns: a full set of matching visuals so your launch looks big and consistent',
    ],
    forWho: {
      shops: 'Product visuals that lift every listing',
      brands: 'Launch campaigns that look like a big-budget shoot',
      clinics: 'Elegant visuals for your products and treatments',
      business: 'Scroll-stopping ads without hiring a film crew',
      experts: 'Promo visuals for your courses and programmes',
      startups: 'A polished campaign from day one',
    },
    cta: 'Create my product ad',
    message: 'Hi! I’d like a product ad.',
  },
]

// Old page addresses keep working
const OLD = { websites: 'website-seo', 'ai-videos-photos': 'product-ads', 'social-media-content': 'product-ads', 'branding-logos': 'product-ads' }
export const serviceBySlug = (slug) => SERVICES.find((s) => s.slug === (OLD[slug] || slug))
export const serviceById = (id) => SERVICES.find((s) => s.id === id)
