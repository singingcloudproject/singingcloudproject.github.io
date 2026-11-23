import { Link, Navigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { serviceBySlug, SERVICES, AUDIENCE } from '../data/services.js'
import { PORTFOLIO } from '../data/portfolio.js'
import PortfolioGrid from '../components/Portfolio.jsx'
import WebDesign from '../components/WebDesign.jsx'
import { ContactSection, DirectButtons } from '../components/Contact.jsx'
import { IconBadge } from '../components/Brand.jsx'
import { reveal, stagger, EASE } from '../lib/motion.js'
import { useMeta } from '../lib/meta.js'

const HERO_ART = {
  ai: { type: 'video', src: '/media/video/perfume-teaser-loop.mp4', poster: '/media/video/perfume-teaser.webp' },
  websites: { type: 'img', src: '/media/sites/jewelry-desktop.webp' },
  social: { type: 'img', src: '/media/work/moon-1411.webp' },
  branding: { type: 'img', src: '/media/work/whip-1.webp' },
}

function AutomationFlow() {
  const nodes = [
    ['instagram', 'Instagram DM'], ['whatsapp', 'WhatsApp'], ['telegram', 'Telegram'],
  ]
  return (
    <motion.div {...reveal} className="glass mt-14 rounded-3xl p-6 sm:p-10" aria-label="How an AI assistant works">
      <p className="kicker">How it works</p>
      <div className="mt-6 grid items-center gap-6 md:grid-cols-[1fr_auto_1fr_auto_1fr]">
        <ul className="grid gap-3">
          {nodes.map(([n, l]) => <li key={n} className="flex items-center gap-3"><IconBadge name={n} size={22} /> <span>{l}</span></li>)}
        </ul>
        <span className="hidden text-2xl text-sky md:block" aria-hidden="true">→</span>
        <div className="rounded-2xl border border-sky/30 bg-night/60 p-5 text-center">
          <div className="mx-auto flex w-max gap-2"><IconBadge name="chatgpt" size={22} label="ChatGPT" /><IconBadge name="claude" size={22} label="Claude" /></div>
          <p className="mt-3 font-semibold">Your AI assistant</p>
          <p className="mt-1 text-sm text-mute">Knows your services, prices and hours</p>
        </div>
        <span className="hidden text-2xl text-sky md:block" aria-hidden="true">→</span>
        <ul className="grid gap-2 text-mute">
          <li>✓ Instant, friendly replies</li><li>✓ Bookings and enquiries collected</li><li>✓ Hot leads sent straight to you</li>
        </ul>
      </div>
    </motion.div>
  )
}

export default function ServicePage() {
  const { slug } = useParams()
  const s = serviceBySlug(slug)
  useMeta(s?.name, s ? `${s.headline} ${s.intro}` : undefined)
  if (!s) return <Navigate to="/" replace />
  const work = PORTFOLIO.filter((p) => p.services.includes(s.id) && p.category !== 'websites')
  const art = HERO_ART[s.id]
  const i = SERVICES.indexOf(s)
  const next = SERVICES[(i + 1) % SERVICES.length]

  return (
    <>
      {/* Arrival: continues the flash from the 3D studio */}
      <motion.div className="pointer-events-none fixed inset-0 z-50 bg-[radial-gradient(circle_at_center,#cfeaff,#8fd3ff_40%,#070b1f)]"
        initial={{ opacity: 1 }} animate={{ opacity: 0 }} transition={{ duration: 0.7, ease: EASE }} aria-hidden="true" />

      <section className="relative overflow-hidden pb-16 pt-28 sm:pt-36">
        <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-0 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-sky-deep/20 blur-[130px]" />
        <div className="wrap relative grid items-center gap-12 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <nav aria-label="Breadcrumb" className="text-sm text-mute"><Link to="/#services" className="hover:text-ink">Services</Link> <span aria-hidden="true">/</span> {s.name}</nav>
            <motion.p className="kicker mt-6" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.7, ease: EASE }}>{s.kicker}</motion.p>
            <motion.h1 className="display mt-4 text-[clamp(42px,9vw,84px)]" initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} transition={{ delay: 0.35, duration: 0.9, ease: EASE }}>
              {s.name}
            </motion.h1>
            <motion.p className="mt-5 max-w-xl text-xl text-ink/90" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6, duration: 0.8 }}>{s.headline}</motion.p>
            <motion.p className="mt-4 max-w-xl text-mute" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7, duration: 0.8 }}>{s.intro}</motion.p>
            <motion.div className="mt-8 flex flex-wrap gap-3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.85, duration: 0.7, ease: EASE }}>
              <a href="#contact" className="btn btn-primary">{s.cta}</a>
              <DirectButtons message={s.message} compact />
            </motion.div>
          </div>
          {art ? (
            <motion.div className="relative mx-auto w-full max-w-[460px] overflow-hidden rounded-[2rem] border border-white/10 shadow-[0_60px_120px_-50px_rgba(59,155,255,0.6)]"
              initial={{ opacity: 0, scale: 0.94, rotate: -2 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} transition={{ delay: 0.4, duration: 1.1, ease: EASE }}
              style={{ aspectRatio: s.id === 'websites' ? '16/10' : '4/5' }}>
              {art.type === 'video'
                ? <video src={art.src} poster={art.poster} autoPlay muted loop playsInline className="h-full w-full object-cover" aria-label="AI perfume teaser, a concept piece" />
                : <img src={art.src} alt="" className="h-full w-full object-cover" />}
            </motion.div>
          ) : (
            <motion.div className="relative mx-auto aspect-square w-full max-w-[420px]" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4, duration: 1.1, ease: EASE }} aria-hidden="true">
              <div className="absolute inset-[22%] rounded-full bg-[radial-gradient(circle_at_35%_30%,#cfeaff,#5fb8ff_45%,#1d4fd8)] shadow-[0_0_120px_20px_rgba(95,184,255,0.45)]" />
              {['instagram', 'whatsapp', 'telegram', 'chatgpt', 'claude', 'google'].map((n, k) => (
                <span key={n} className="absolute left-1/2 top-1/2 flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-xl"
                  style={{ transform: `translate(-50%,-50%) rotate(${k * 60}deg) translateY(-160px) rotate(-${k * 60}deg)` }}>
                  <img src={`/icons/${n}.svg`} alt="" width="28" height="28" />
                </span>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      <section className="py-16 sm:py-24" aria-labelledby="does-title">
        <div className="wrap grid gap-12 lg:grid-cols-2">
          <motion.div {...reveal}>
            <h2 id="does-title" className="display text-4xl sm:text-5xl">What I do</h2>
            <ul className="mt-8 grid gap-4">
              {s.does.map((d, k) => (
                <motion.li key={d} {...stagger(k)} className="flex gap-4 border-b border-line/60 pb-4 text-lg">
                  <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-sky shadow-[0_0_12px_2px_rgba(143,211,255,0.7)]" aria-hidden="true" />{d}
                </motion.li>
              ))}
            </ul>
          </motion.div>
          <motion.div {...reveal}>
            <h2 className="display text-4xl sm:text-5xl">Who it’s for</h2>
            <dl className="mt-8 grid gap-3 sm:grid-cols-2">
              {AUDIENCE.map((a, k) => (
                <motion.div key={a.id} {...stagger(k)} className="rounded-2xl border border-line/70 bg-deep/60 p-5">
                  <dt className="font-semibold text-gold">{a.label}</dt>
                  <dd className="mt-1 text-mute">{s.forWho[a.id]}</dd>
                </motion.div>
              ))}
            </dl>
          </motion.div>
        </div>
      </section>

      {s.id === 'automation' && <div className="wrap"><AutomationFlow /></div>}

      {s.id === 'websites' ? <WebDesign /> : work.length > 0 && (
        <section className="py-16 sm:py-24" aria-labelledby="examples-title">
          <div className="wrap">
            <motion.h2 {...reveal} id="examples-title" className="display text-4xl sm:text-5xl">Examples</motion.h2>
            <div className="mt-10"><PortfolioGrid only={(p) => work.includes(p)} showFilters={false} /></div>
          </div>
        </section>
      )}

      <section className="py-16 sm:py-24" aria-labelledby="price-title">
        <div className="wrap">
          <motion.div {...reveal} className="overflow-hidden rounded-3xl border border-gold/30 bg-[linear-gradient(160deg,#121a40,#070b1f)]">
            <div className="grid gap-8 p-6 sm:p-10 lg:grid-cols-[1fr_1.3fr]">
              <div>
                <p className="kicker">Starting prices</p>
                <h2 id="price-title" className="display mt-3 text-4xl sm:text-5xl">Clear prices, no surprises.</h2>
                <p className="mt-4 text-mute">Prices are in US dollars. Tell me about your project and I’ll send you an exact quote.</p>
              </div>
              <ul className="divide-y divide-line/70">
                {s.prices.map((p) => (
                  <li key={p.item} className="flex items-baseline justify-between gap-6 py-4">
                    <span className="text-lg">{p.item}</span>
                    <span className="display shrink-0 text-3xl text-gold">{p.price}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </section>

      <ContactSection service={s} />

      <section className="border-t border-line/60 py-14">
        <div className="wrap flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <p className="text-mute">Next door in the studio</p>
          <Link to={`/services/${next.slug}`} className="display text-3xl hover:text-sky sm:text-4xl">{next.name} →</Link>
        </div>
      </section>
    </>
  )
}
