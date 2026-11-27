import { Link, Navigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { serviceBySlug, SERVICES, AUDIENCE } from '../data/services.js'
import { PORTFOLIO } from '../data/portfolio.js'
import PortfolioGrid from '../components/Portfolio.jsx'
import WebDesign from '../components/WebDesign.jsx'
import { ContactSection, DirectButtons } from '../components/Contact.jsx'
import { IconBadge } from '../components/Brand.jsx'
import { XpWindow } from '../components/Xp.jsx'
import { reveal, stagger, EASE } from '../lib/motion.js'
import { useMeta } from '../lib/meta.js'

const HERO_ART = {
  ads: { type: 'video', src: '/media/video/perfume-teaser-loop.mp4', poster: '/media/video/perfume-teaser.webp', label: 'AI perfume teaser' },
  websites: { type: 'img', src: '/media/sites/jewelry-desktop.webp' },
}

function AutomationFlow() {
  const nodes = [['instagram', 'Instagram DM'], ['telegram', 'Telegram'], [null, 'Your website chat']]
  return (
    <motion.div {...reveal} className="mt-10" aria-label="How an AI assistant works">
      <XpWindow title="How it works" bodyClassName="p-5 sm:p-8">
        <div className="grid items-center gap-6 md:grid-cols-[1fr_auto_1fr_auto_1fr]">
          <ul className="grid gap-3 text-black">
            {nodes.map(([n, l]) => (
              <li key={l} className="flex items-center gap-3">
                {n ? <IconBadge name={n} size={22} /> : <span aria-hidden="true" className="flex h-[38px] w-[38px] items-center justify-center rounded-full bg-white text-xl">💬</span>} <span>{l}</span>
              </li>
            ))}
          </ul>
          <span className="hidden text-2xl text-[#003399] md:block" aria-hidden="true">→</span>
          <div className="xp-inset p-5 text-center text-black">
            <div className="mx-auto flex w-max gap-2"><IconBadge name="chatgpt" size={22} label="ChatGPT" /><IconBadge name="claude" size={22} label="Claude" /></div>
            <p className="mt-3 font-bold">Your AI assistant</p>
            <p className="mt-1 text-sm">Knows your services, answers in your voice</p>
          </div>
          <span className="hidden text-2xl text-[#003399] md:block" aria-hidden="true">→</span>
          <ul className="grid gap-2 text-black">
            <li>✓ Instant, friendly replies</li><li>✓ Bookings and enquiries collected</li><li>✓ Serious buyers sent straight to you</li>
          </ul>
        </div>
      </XpWindow>
    </motion.div>
  )
}

export default function ServicePage() {
  const { slug } = useParams()
  const s = serviceBySlug(slug)
  useMeta(s?.name, s ? `${s.headline} ${s.intro}` : undefined)
  if (!s) return <Navigate to="/" replace />
  if (s.slug !== slug) return <Navigate to={`/services/${s.slug}`} replace />
  const work = PORTFOLIO.filter((p) => p.services.includes(s.id) && p.category !== 'websites')
  const art = HERO_ART[s.id]
  const next = SERVICES[(SERVICES.indexOf(s) + 1) % SERVICES.length]

  return (
    <>
      <section className="relative pb-10 pt-24 sm:pt-32">
        <div className="wrap">
          <nav aria-label="Breadcrumb" className="text-sm text-white/90"><Link to="/#services" className="underline-offset-4 hover:underline">Services</Link> <span aria-hidden="true">›</span> {s.name}</nav>
          <XpWindow title={`${s.name}.exe`} className="mt-4" bodyClassName="grid items-center gap-10 p-5 sm:p-10 lg:grid-cols-[1.1fr_1fr]">
            <div>
              <motion.p className="xp-kicker" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.6, ease: EASE }}>{s.kicker}</motion.p>
              <motion.h1 className="pixel mt-3 text-[clamp(40px,8vw,72px)] leading-[0.95] text-[#003399]" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.7, ease: EASE }}>
                {s.name}
              </motion.h1>
              <p className="mt-4 max-w-xl text-xl font-bold text-black">{s.headline}</p>
              <p className="mt-3 max-w-xl text-[17px] leading-relaxed text-[#1a1a1a]">{s.intro}</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <a href="#contact" className="xp-btn xp-btn-lg xp-btn-default">{s.cta}</a>
                <DirectButtons compact />
              </div>
            </div>
            {art ? (
              <motion.div className="xp-inset relative mx-auto w-full max-w-[460px] overflow-hidden"
                initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3, duration: 0.8, ease: EASE }}
                style={{ aspectRatio: s.id === 'websites' ? '16/10' : '4/5' }}>
                {art.type === 'video'
                  ? <video src={art.src} poster={art.poster} autoPlay muted loop playsInline className="h-full w-full object-cover" aria-label={art.label} />
                  : <img src={art.src} alt="" className="h-full w-full object-cover" />}
              </motion.div>
            ) : (
              <div className="relative mx-auto aspect-square w-full max-w-[380px]" aria-hidden="true">
                <img src="/media/ui/cloud-2.webp" alt="" className="companion-bob absolute left-1/2 top-1/2 w-[46%] -translate-x-1/2 -translate-y-1/2" />
                {['instagram', 'telegram', 'chatgpt', 'claude', 'google', 'youtube'].map((n, k) => (
                  <span key={n} className="absolute left-1/2 top-1/2 flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-lg"
                    style={{ transform: `translate(-50%,-50%) rotate(${k * 60}deg) translateY(-150px) rotate(-${k * 60}deg)` }}>
                    <img src={`/icons/${n}.svg`} alt="" width="28" height="28" style={{ objectFit: 'contain' }} />
                  </span>
                ))}
              </div>
            )}
          </XpWindow>
        </div>
      </section>

      <section className="py-10 sm:py-16" aria-labelledby="does-title">
        <div className="wrap grid gap-6 lg:grid-cols-2">
          <motion.div {...reveal}>
            <XpWindow title="What I do" className="h-full" bodyClassName="p-5 sm:p-8">
              <h2 id="does-title" className="pixel text-4xl text-[#003399]">What I do</h2>
              <ul className="mt-5 grid gap-3">
                {s.does.map((d, k) => (
                  <motion.li key={d} {...stagger(k)} className="flex gap-3 border-b border-[#cfcab8] pb-3 text-[17px] text-black">
                    <span className="xp-check mt-0.5" aria-hidden="true">✓</span>{d}
                  </motion.li>
                ))}
              </ul>
            </XpWindow>
          </motion.div>
          <motion.div {...reveal}>
            <XpWindow title="Who it’s for" className="h-full" bodyClassName="p-5 sm:p-8">
              <h2 className="pixel text-4xl text-[#003399]">Who it’s for</h2>
              <dl className="mt-5 grid gap-3 sm:grid-cols-2">
                {AUDIENCE.map((a, k) => (
                  <motion.div key={a.id} {...stagger(k)} className="xp-inset p-4">
                    <dt className="font-bold text-[#003399]">{a.label}</dt>
                    <dd className="mt-1 text-[15px] text-black">{s.forWho[a.id]}</dd>
                  </motion.div>
                ))}
              </dl>
            </XpWindow>
          </motion.div>
        </div>
      </section>

      {s.id === 'automation' && <div className="wrap"><AutomationFlow /></div>}

      {s.id === 'websites' ? <WebDesign /> : work.length > 0 && (
        <section className="py-10 sm:py-16" aria-labelledby="examples-title">
          <div className="wrap">
            <XpWindow title="My Pictures - Examples" bodyClassName="p-4 sm:p-7">
              <h2 id="examples-title" className="pixel text-4xl text-[#003399] sm:text-5xl">Examples</h2>
              <div className="mt-6"><PortfolioGrid only={(p) => work.includes(p)} showFilters={false} /></div>
            </XpWindow>
          </div>
        </section>
      )}

      <ContactSection service={s} />

      <section className="py-12">
        <div className="wrap flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <p className="text-white/90">Next cloud</p>
          <Link to={`/services/${next.slug}`} className="xp-btn xp-btn-lg">{next.name} →</Link>
        </div>
      </section>
    </>
  )
}
