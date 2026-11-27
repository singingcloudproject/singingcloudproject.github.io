import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Hero from '../components/Hero.jsx'
import PortfolioGrid from '../components/Portfolio.jsx'
import WebDesign from '../components/WebDesign.jsx'
import { ContactSection } from '../components/Contact.jsx'
import { SERVICES, AUDIENCE } from '../data/services.js'
import { PORTFOLIO } from '../data/portfolio.js'
import { reveal, stagger } from '../lib/motion.js'
import { useMeta } from '../lib/meta.js'

// A cover image per service door
const COVER = {
  ai: '/media/video/perfume-teaser.webp',
  websites: '/media/sites/jewelry-desktop.webp',
  social: '/media/work/moon-1411-sm.webp',
  branding: '/media/work/whip-1-sm.webp',
  automation: null,
}

function AutomationArt() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_50%_45%,#1f4fbf_0%,#0d1433_55%,#070b1f_100%)]" aria-hidden="true">
      <div className="relative h-28 w-28 rounded-full bg-[radial-gradient(circle_at_35%_30%,#cfeaff,#5fb8ff_45%,#1d4fd8)] shadow-[0_0_80px_10px_rgba(95,184,255,0.45)]" />
      {['instagram', 'whatsapp', 'telegram', 'chatgpt'].map((n, i) => (
        <span key={n} className="absolute flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-lg"
          style={{ transform: `rotate(${i * 90 + 45}deg) translateY(-92px) rotate(-${i * 90 + 45}deg)` }}>
          <img src={`/icons/${n}.svg`} alt="" width="24" height="24" loading="lazy" />
        </span>
      ))}
    </div>
  )
}

function ServicesOverview() {
  return (
    <section id="services" className="relative scroll-mt-16 py-24 sm:py-32" aria-labelledby="services-title">
      <div className="wrap">
        <motion.div {...reveal} className="max-w-2xl">
          <p className="kicker">Services</p>
          <h2 id="services-title" className="display mt-4 text-5xl sm:text-6xl">Five doors into the studio.</h2>
          <p className="mt-5 text-lg text-mute">Pick what you need, or combine them. Every project is made one-to-one, fully online, for clients anywhere in the world.</p>
        </motion.div>
        <div className="mt-14 grid gap-4 md:grid-cols-6">
          {SERVICES.map((s, i) => (
            <motion.div key={s.id} {...stagger(i)} className={i < 2 ? 'md:col-span-3' : 'md:col-span-2'}>
              <Link to={`/services/${s.slug}`} className="lift zoom group relative flex min-h-[340px] flex-col justify-end overflow-hidden rounded-3xl bg-panel p-6 sm:min-h-[400px]">
                {COVER[s.id] ? <img src={COVER[s.id]} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-80" /> : <AutomationArt />}
                <div className="absolute inset-0 bg-gradient-to-t from-night via-night/55 to-transparent" />
                <div className="relative">
                  <p className="text-sm font-semibold text-gold">{s.prices[0].price}</p>
                  <h3 className="display mt-1 text-[34px] leading-tight">{s.name}</h3>
                  <p className="mt-2 max-w-sm text-mute">{s.kicker}</p>
                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-sky">
                    Explore <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function WhoFor() {
  return (
    <section className="border-y border-line/60 bg-deep/50 py-16" aria-labelledby="who-title">
      <div className="wrap flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <h2 id="who-title" className="display text-3xl sm:text-4xl">Made for people with <span className="italic text-sky">something to share.</span></h2>
        <ul className="flex flex-wrap gap-2">
          {AUDIENCE.map((a) => <li key={a.id} className="rounded-full border border-line px-4 py-2 text-[15px]">{a.label}</li>)}
        </ul>
      </div>
    </section>
  )
}

function FeaturedWork() {
  const featured = ['perfume-teaser', 'moonlight', 'latte-wave', 'game-banners', 'old-hollywood', 'brother-nature', 'fig-honey', 'fine-jewelry']
  const pick = (p) => featured.includes(p.id)
  return (
    <section id="work" className="py-24 sm:py-32" aria-labelledby="work-title">
      <div className="wrap">
        <motion.div {...reveal} className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="kicker">Selected work</p>
            <h2 id="work-title" className="display mt-4 text-5xl sm:text-6xl">Made in the clouds.</h2>
          </div>
          <Link to="/work" className="btn btn-ghost self-start sm:self-auto">See all {PORTFOLIO.length} pieces →</Link>
        </motion.div>
        <div className="mt-12"><PortfolioGrid only={pick} showFilters={false} /></div>
      </div>
    </section>
  )
}

function Process() {
  const steps = [
    ['Tell me your idea', 'Send a message or fill in the form. A few lines about your business is enough.'],
    ['Get a clear plan', 'I reply with ideas, a fixed price and a timeline. No surprises.'],
    ['Watch it come alive', 'I create, you review. Changes are part of the process.'],
    ['Launch & grow', 'Your visuals, site or content go live, and I stay on hand for support.'],
  ]
  return (
    <section className="py-24 sm:py-28" aria-labelledby="process-title">
      <div className="wrap">
        <motion.h2 {...reveal} id="process-title" className="display max-w-xl text-5xl sm:text-6xl">From first message to <span className="italic text-sky">launch.</span></motion.h2>
        <ol className="mt-14 grid gap-px overflow-hidden rounded-3xl border border-line/60 bg-line/60 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map(([t, d], i) => (
            <motion.li key={t} {...stagger(i, 0.08)} className="bg-night p-7">
              <span className="display text-5xl text-gold">0{i + 1}</span>
              <h3 className="mt-5 text-lg font-semibold">{t}</h3>
              <p className="mt-2 text-mute">{d}</p>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  )
}

export default function Home() {
  useMeta(null, 'Singing Cloud Project creates AI videos and photos, websites, social media content, logos and AI assistants for clinics, small businesses, brands, teachers, coaches and creators.')
  return (
    <>
      <Hero />
      <ServicesOverview />
      <WhoFor />
      <FeaturedWork />
      <WebDesign />
      <Process />
      <ContactSection />
    </>
  )
}
