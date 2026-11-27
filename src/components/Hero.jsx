import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { SERVICES } from '../data/services.js'
import { EASE } from '../lib/motion.js'

/* Hero videos live in public/media/hero/ (made by `npm run hero` from media-source/hero/). */
const HERO = '/media/hero/hero-'
const TALL = '(max-aspect-ratio: 1/1)' // phones held upright, tall tablets → 9:16 video
const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches
const saveData = () => Boolean(navigator.connection?.saveData)

function useMedia(query) {
  const [match, setMatch] = useState(() => matchMedia(query).matches)
  useEffect(() => {
    const m = matchMedia(query)
    const on = () => setMatch(m.matches)
    on() // the screen may have changed shape before this ran
    // older iPhones (iOS 13 and earlier) only know addListener
    if (m.addEventListener) m.addEventListener('change', on); else m.addListener(on)
    return () => (m.removeEventListener ? m.removeEventListener('change', on) : m.removeListener(on))
  }, [query])
  return match
}

function HeroVideo() {
  const tall = useMedia(TALL)
  const still = useMedia('(prefers-reduced-motion: reduce)') || saveData()
  const name = tall ? 'portrait' : 'landscape'
  const video = useRef()
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    const v = video.current
    if (!v) return
    setPlaying(false)
    // iPhones only autoplay when muted is set as a property before play()
    v.muted = true; v.defaultMuted = true; v.playsInline = true
    const tryPlay = () => v.play()?.catch(() => { /* Low Power Mode or blocked: the poster stays */ })
    tryPlay()
    // Low Power Mode blocks autoplay until the visitor touches the page once
    const kick = () => { if (v.paused) tryPlay() }
    window.addEventListener('touchstart', kick, { passive: true, once: true })
    // pause when scrolled away or the tab is hidden (saves battery and data)
    const io = new IntersectionObserver(([e]) => (e.isIntersecting && !document.hidden ? tryPlay() : v.pause()), { threshold: 0.05 })
    io.observe(v)
    const vis = () => (document.hidden ? v.pause() : tryPlay())
    document.addEventListener('visibilitychange', vis)
    return () => { io.disconnect(); document.removeEventListener('visibilitychange', vis); window.removeEventListener('touchstart', kick) }
  }, [name, still])

  return (
    <div className="hero-drift absolute inset-0" aria-hidden="true">
      {/* Poster shows instantly, and stays if video can't play */}
      <picture>
        <source media={TALL} srcSet={`${HERO}portrait.jpg`} />
        <img src={`${HERO}landscape.jpg`} alt="" fetchPriority="high" decoding="async" className="absolute inset-0 h-full w-full object-cover" />
      </picture>
      {!still && (
        <video key={name} ref={video} className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${playing ? 'opacity-100' : 'opacity-0'}`}
          autoPlay muted loop playsInline preload="auto" poster={`${HERO}${name}.jpg`}
          disablePictureInPicture disableRemotePlayback onPlaying={() => setPlaying(true)}>
          <source src={`${HERO}${name}.webm`} type='video/webm; codecs="vp9"' />
          <source src={`${HERO}${name}.mp4`} type="video/mp4" />
        </video>
      )}
    </div>
  )
}

export default function Hero() {
  const skipToServices = () => document.getElementById('services')?.scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth' })

  return (
    <section className="relative h-[100svh] min-h-[600px] w-full overflow-hidden bg-night" aria-label="Step into the Cloud Studio">
      <HeroVideo />

      {/* Readability: overall dim + darker bottom where the words sit */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-night/25" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-[62%] bg-gradient-to-t from-night via-night/70 to-transparent" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-night/80 to-transparent" />

      {/* Words + actions */}
      <div className="absolute inset-x-0 bottom-0 pb-[104px] md:pb-14">
        <div className="wrap">
          <motion.p className="kicker" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.8, ease: EASE }}>
            Singing Cloud Project
          </motion.p>
          <h1 className="display mt-2 max-w-[14ch] text-[clamp(40px,10.5vw,104px)] [text-shadow:0_2px_30px_rgba(7,11,31,0.6)] sm:mt-3">
            {['Step', 'into', 'the', 'Cloud', 'Studio.'].map((w, i) => (
              <motion.span key={i} className={`mr-[0.22em] inline-block ${i >= 3 ? 'italic text-sky' : ''}`}
                initial={{ opacity: 0, y: '0.5em', filter: 'blur(10px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ delay: 0.3 + i * 0.09, duration: 0.9, ease: EASE }}>{w}</motion.span>
            ))}
          </h1>
          <motion.p className="mt-3 max-w-[36ch] text-[16px] leading-snug text-mute sm:mt-4 sm:text-lg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8, duration: 0.9 }}>
            AI visuals, websites and content that make your brand impossible to ignore.
          </motion.p>

          <motion.div className="mt-6 flex flex-wrap items-center gap-3" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1, duration: 0.7, ease: EASE }}>
            <Link to="/contact" className="btn btn-primary hidden md:inline-flex">Start your project</Link>
            <button type="button" onClick={skipToServices} className="btn btn-ghost !min-h-[44px] !px-4 text-sm sm:!px-5 sm:text-[15px]">Skip to services <span aria-hidden="true">↓</span></button>
          </motion.div>
          <ul className="mt-5 flex flex-wrap gap-2">
            {SERVICES.map((s) => (
              <li key={s.id}><Link to={`/services/${s.slug}`} className="inline-flex min-h-[40px] items-center gap-2 rounded-full border border-sky/30 bg-night/60 px-3.5 text-sm backdrop-blur"><span className="h-2 w-2 rounded-full bg-sky shadow-[0_0_10px_2px_rgba(143,211,255,0.8)]" />{s.short}</Link></li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
