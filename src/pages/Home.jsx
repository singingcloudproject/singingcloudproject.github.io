import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Hero from '../components/Hero.jsx'
import PortfolioGrid from '../components/Portfolio.jsx'
import WebDesign from '../components/WebDesign.jsx'
import { ContactSection } from '../components/Contact.jsx'
import { XpWindow } from '../components/Xp.jsx'
import { SERVICES, AUDIENCE } from '../data/services.js'
import { PORTFOLIO } from '../data/portfolio.js'
import { reveal, stagger } from '../lib/motion.js'
import { useMeta } from '../lib/meta.js'

// A picture per service window
const COVER = {
  websites: '/media/sites/jewelry-desktop.webp',
  automation: null,
  ads: '/media/video/perfume-teaser.webp',
}

function AutomationArt() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_50%_45%,#ffffff_0%,#dbe8ff_55%,#a8c4f0_100%)]" aria-hidden="true">
      <img src="/media/ui/cloud-2.webp" alt="" className="w-32" loading="lazy" />
      {['instagram', 'telegram', 'chatgpt', 'claude'].map((n, i) => (
        <span key={n} className="absolute flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-md"
          style={{ transform: `rotate(${i * 90 + 45}deg) translateY(-86px) rotate(-${i * 90 + 45}deg)` }}>
          <img src={`/icons/${n}.svg`} alt="" width="24" height="24" loading="lazy" style={{ objectFit: 'contain' }} />
        </span>
      ))}
    </div>
  )
}

function ServicesOverview() {
  return (
    <section id="services" className="relative scroll-mt-16 py-20 sm:py-28" aria-labelledby="services-title">
      <div className="wrap">
        <motion.div {...reveal} className="max-w-2xl">
          <p className="xp-kicker !text-white">Services</p>
          <h2 id="services-title" className="pixel mt-3 text-5xl leading-none text-white sm:text-6xl">Three things I do brilliantly.</h2>
          <p className="mt-4 text-lg text-white/90">Pick one, or combine them. Every project is made one-to-one, fully online, for clients anywhere in the world.</p>
        </motion.div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {SERVICES.map((s, i) => (
            <motion.div key={s.id} {...stagger(i)}>
              <XpWindow title={`${s.name}.exe`} className="h-full" bodyClassName="flex h-full flex-col p-0">
                <Link to={`/services/${s.slug}`} className="group relative block aspect-[16/10] overflow-hidden" aria-label={`Open ${s.name}`}>
                  {COVER[s.id]
                    ? <img src={COVER[s.id]} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                    : <AutomationArt />}
                </Link>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="pixel text-[28px] leading-tight text-[#003399]">{s.name}</h3>
                  <p className="mt-2 text-[15px] text-[#1a1a1a]">{s.pitch}</p>
                  <div className="mt-auto flex flex-wrap gap-2 pt-5">
                    <Link to={`/services/${s.slug}`} className="xp-btn xp-btn-default">Open</Link>
                    <Link to="/contact" state={{ service: s.name }} className="xp-btn">{s.cta}</Link>
                  </div>
                </div>
              </XpWindow>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function WhoFor() {
  return (
    <section className="py-10" aria-labelledby="who-title">
      <div className="wrap">
        <div className="xp-panel flex flex-col gap-5 p-6 lg:flex-row lg:items-center lg:justify-between">
          <h2 id="who-title" className="pixel text-3xl text-[#003399] sm:text-4xl">Made for people with something to sell.</h2>
          <ul className="flex flex-wrap gap-2">
            {AUDIENCE.map((a) => <li key={a.id} className="xp-chip">{a.label}</li>)}
          </ul>
        </div>
      </div>
    </section>
  )
}

function FeaturedWork() {
  const featured = ['perfume-teaser', 'moonlight', 'fine-jewelry', 'latte-wave', 'rouge', 'game-banners', 'fig-honey', 'cafe-food']
  const pick = (p) => featured.includes(p.id)
  return (
    <section id="work" className="py-20 sm:py-28" aria-labelledby="work-title">
      <div className="wrap">
        <XpWindow title="My Pictures - Selected work" bodyClassName="p-4 sm:p-7">
          <motion.div {...reveal} className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="xp-kicker">Selected work</p>
              <h2 id="work-title" className="pixel mt-2 text-5xl leading-none text-[#003399] sm:text-6xl">Made in the clouds.</h2>
            </div>
            <Link to="/work" className="xp-btn xp-btn-lg self-start sm:self-auto">See all {PORTFOLIO.length} pieces</Link>
          </motion.div>
          <div className="mt-8"><PortfolioGrid only={pick} showFilters={false} /></div>
        </XpWindow>
      </div>
    </section>
  )
}

function Process() {
  const steps = [
    ['Tell me your idea', 'Send a message or fill in the form. A few lines about your business is enough.'],
    ['Get a clear plan', 'I reply with ideas, the next steps and a timeline. No surprises.'],
    ['Watch it come alive', 'I create, you review. Changes are part of the process.'],
    ['Launch & grow', 'Your website, automation or ad goes live, and I stay on hand for support.'],
  ]
  return (
    <section className="py-16 sm:py-24" aria-labelledby="process-title">
      <div className="wrap">
        <motion.h2 {...reveal} id="process-title" className="pixel max-w-xl text-5xl leading-none text-white sm:text-6xl">From first message to launch.</motion.h2>
        <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map(([t, d], i) => (
            <motion.li key={t} {...stagger(i, 0.08)}>
              <XpWindow title={`Step ${i + 1}`} className="h-full" bodyClassName="p-5">
                <span className="pixel text-5xl text-[#3c9a2c]">0{i + 1}</span>
                <h3 className="mt-3 text-lg font-bold text-black">{t}</h3>
                <p className="mt-1.5 text-[15px] text-[#222]">{d}</p>
              </XpWindow>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  )
}

export default function Home() {
  useMeta(null, 'Singing Cloud Project builds websites with SEO, automations and AI assistants, and product ads: storyboards, AI product photos and videos and ad campaigns.')
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
