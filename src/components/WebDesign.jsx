import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { PORTFOLIO } from '../data/portfolio.js'
import { DirectButtons } from './Contact.jsx'
import { reveal, EASE } from '../lib/motion.js'

const M = '/media'
const SITES = PORTFOLIO.filter((p) => p.category === 'websites')

function Phone({ site }) {
  const ref = useRef()
  useEffect(() => {
    const v = ref.current
    if (!v || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const io = new IntersectionObserver(([e]) => { e.isIntersecting ? v.play().catch(() => {}) : v.pause() }, { threshold: 0.3 })
    io.observe(v)
    return () => io.disconnect()
  }, [])
  return (
    <div className="relative w-[34%] max-w-[210px] shrink-0 rounded-[2.2rem] border border-white/15 bg-[#05081a] p-[7px] shadow-[0_40px_80px_-30px_rgba(0,0,0,0.9),0_0_0_1px_rgba(143,211,255,0.08)]">
      <div className="relative overflow-hidden rounded-[1.8rem]" style={{ aspectRatio: '390/844' }}>
        <video ref={ref} src={`${M}/${site.shots.video}`} poster={`${M}/${site.shots.phone}`} muted loop playsInline preload="none"
          className="absolute inset-0 h-full w-full object-cover" aria-label={`Scrolling preview of the ${site.title} website on a phone`} />
        <span className="absolute left-1/2 top-2 h-[18px] w-[34%] -translate-x-1/2 rounded-full bg-black" aria-hidden="true" />
      </div>
    </div>
  )
}

function Laptop({ site }) {
  return (
    <div className="w-full">
      <div className="rounded-t-2xl border border-white/12 bg-[#05081a] p-[6px] pb-0 shadow-[0_50px_90px_-40px_rgba(0,0,0,0.95)]">
        <div className="flex items-center gap-1.5 px-2 py-1.5" aria-hidden="true">
          <span className="h-2 w-2 rounded-full bg-white/20" /><span className="h-2 w-2 rounded-full bg-white/20" /><span className="h-2 w-2 rounded-full bg-white/20" />
          <span className="ml-2 h-4 flex-1 truncate rounded-full bg-white/8 px-2 text-[10px] leading-4 text-mute">{site.url.replace('https://', '')}</span>
        </div>
        <img src={`${M}/${site.shots.desktop}`} alt={`The ${site.title} website on a laptop`} loading="lazy" className="w-full rounded-t-md" style={{ aspectRatio: '1440/900', objectFit: 'cover' }} />
      </div>
      <div className="mx-[-4%] h-3 rounded-b-xl bg-gradient-to-b from-[#2a335f] to-[#11173a]" aria-hidden="true" />
    </div>
  )
}

export default function WebDesign() {
  return (
    <section id="websites" className="relative overflow-hidden py-24 sm:py-32" aria-labelledby="web-title">
      <div aria-hidden="true" className="pointer-events-none absolute -right-40 top-20 h-[420px] w-[620px] rounded-full bg-sky-deep/15 blur-[120px]" />
      <div className="wrap relative">
        <motion.div {...reveal} className="max-w-2xl">
          <p className="kicker">Web design</p>
          <h2 id="web-title" className="display mt-4 text-5xl sm:text-6xl">Websites you can <span className="italic text-sky">step into.</span></h2>
          <p className="mt-5 text-lg text-mute">Every site is designed for the phone first, then grows beautifully onto tablets and laptops. Here’s one you can try right now.</p>
        </motion.div>

        {SITES.map((site) => (
          <motion.article key={site.id} {...reveal} className="mt-14 grid items-center gap-10 lg:grid-cols-[1.25fr_1fr] lg:gap-16">
            <div className="relative">
              <div className="pr-[14%]"><Laptop site={site} /></div>
              <motion.div className="relative -mt-[38%] flex w-full justify-end"
                initial={{ y: 40, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.9, delay: 0.2, ease: EASE }}>
                <Phone site={site} />
              </motion.div>
            </div>
            <div className="pt-6 lg:pt-0">
              <p className="kicker !text-sky">Website</p>
              <h3 className="display mt-3 text-4xl">{site.title}</h3>
              <p className="mt-4 text-lg text-mute">{site.description}</p>
              <ul className="mt-6 flex flex-wrap gap-2" aria-label="Features">
                {site.tags.map((t) => <li key={t} className="rounded-full border border-line px-3 py-1.5 text-sm text-ink/90">{t}</li>)}
              </ul>
              <a href={site.url} target="_blank" rel="noopener" className="btn btn-primary mt-8">View live <span aria-hidden="true">↗</span></a>
            </div>
          </motion.article>
        ))}

        <motion.div {...reveal} className="glass mt-20 flex flex-col items-start gap-6 rounded-3xl p-6 sm:p-10 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="display text-3xl sm:text-4xl">Want a website like this? <span className="italic text-sky">Let’s build yours.</span></p>
            <p className="mt-2 text-mute">Design, development, support and SEO, from the first sketch to launch day.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/contact" state={{ service: 'Website & SEO' }} className="btn btn-primary">Start my website</Link>
            <DirectButtons message="Hi! I’d like a website like your jewelry store." compact />
          </div>
        </motion.div>
      </div>
    </section>
  )
}
