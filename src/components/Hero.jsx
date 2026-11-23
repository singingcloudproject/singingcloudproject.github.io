import { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { SERVICES } from '../data/services.js'
import { canRun3D, prefersReducedMotion, isTouch } from '../lib/device.js'
import { EASE } from '../lib/motion.js'

const Studio = lazy(() => import('../three/Studio.jsx'))
const INTRO_KEY = 'scs-intro-seen'

function readSeen() { try { return localStorage.getItem(INTRO_KEY) === '1' } catch { return false } }
function writeSeen() { try { localStorage.setItem(INTRO_KEY, '1') } catch { /* private mode */ } }

/* Lightweight hero for phones without WebGL, save-data, or reduce-motion */
function StillHero() {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      <img src="/media/hero-poster.webp" alt="" className="h-full w-full object-cover opacity-90" fetchPriority="high" onError={(e) => { e.currentTarget.style.display = 'none' }} />
      <div className="starfield absolute inset-0 opacity-70" />
      <img src="/media/logo/cloud-640.webp" alt="" className="absolute left-1/2 top-[18%] w-[62vw] max-w-[420px] -translate-x-1/2 drop-shadow-[0_0_60px_rgba(143,211,255,0.45)]" />
    </div>
  )
}

export default function Hero() {
  const navigate = useNavigate()
  const [mode] = useState(() => (canRun3D() && !prefersReducedMotion() ? '3d' : 'still'))
  const [skipIntro] = useState(readSeen)
  const [introDone, setIntroDone] = useState(skipIntro)
  const [ready, setReady] = useState(false)
  const [active, setActive] = useState(true)
  const [leaving, setLeaving] = useState(false)
  const [gyro, setGyro] = useState('off') // off | on | unsupported
  const lookRef = useRef({ yaw: 0, pitch: 0, smoothYaw: 0, smoothPitch: 0, userMoved: false })
  const section = useRef()

  // Pause the 3D world when the hero is scrolled away or the tab is hidden (saves battery)
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting && !document.hidden), { threshold: 0.02 })
    if (section.current) io.observe(section.current)
    const vis = () => setActive(!document.hidden && section.current?.getBoundingClientRect().bottom > 0)
    document.addEventListener('visibilitychange', vis)
    return () => { io.disconnect(); document.removeEventListener('visibilitychange', vis) }
  }, [])

  useEffect(() => {
    if (mode === '3d' && isTouch() && typeof DeviceOrientationEvent === 'undefined') setGyro('unsupported')
  }, [mode])

  const onIntroDone = useCallback(() => { setIntroDone(true); writeSeen() }, [])

  const onSelect = useCallback((s) => {
    setLeaving(true)
    setTimeout(() => navigate(`/services/${s.slug}`), 380)
  }, [navigate])

  async function turnOnGyro() {
    try {
      if (typeof DeviceOrientationEvent?.requestPermission === 'function') {
        const res = await DeviceOrientationEvent.requestPermission() // iPhone asks the visitor
        if (res !== 'granted') { setGyro('unsupported'); return }
      }
      const { enableGyro } = await import('../three/Studio.jsx')
      enableGyro(lookRef)
      lookRef.current.userMoved = true
      setGyro('on')
    } catch { setGyro('unsupported') }
  }

  const skipToServices = () => document.getElementById('services')?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
  const showUI = mode === 'still' || introDone

  return (
    <section ref={section} className="relative h-[100svh] min-h-[600px] w-full overflow-hidden bg-night" aria-label="Step into the Cloud Studio">
      {mode === '3d' ? (
        <Suspense fallback={null}>
          <Studio onSelect={onSelect} skipIntro={skipIntro} onIntroDone={onIntroDone} lookRef={lookRef} active={active} onReady={() => setReady(true)} />
        </Suspense>
      ) : <StillHero />}

      {/* Loading veil: soft night gradient until the 3D world is ready */}
      <AnimatePresence>
        {mode === '3d' && !ready && (
          <motion.div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-night" exit={{ opacity: 0 }} transition={{ duration: 0.8 }}>
            <img src="/media/logo/cloud-640.webp" alt="" className="w-40 animate-pulse opacity-80" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Readability gradients */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-[58%] bg-gradient-to-t from-night via-night/70 to-transparent" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-night/80 to-transparent" />

      {/* Words + actions */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 pb-[104px] md:pb-14">
        <div className="wrap">
          <motion.p className="kicker" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: skipIntro ? 0.2 : 1.2, duration: 0.8, ease: EASE }}>
            Singing Cloud Studio
          </motion.p>
          <h1 className="display mt-2 max-w-[14ch] text-[clamp(40px,10.5vw,104px)] sm:mt-3">
            {['Step', 'into', 'the', 'Cloud', 'Studio.'].map((w, i) => (
              <motion.span key={i} className={`mr-[0.22em] inline-block ${i >= 3 ? 'italic text-sky' : ''}`}
                initial={{ opacity: 0, y: '0.5em', filter: 'blur(10px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ delay: (skipIntro ? 0.25 : 1.5) + i * 0.09, duration: 0.9, ease: EASE }}>{w}</motion.span>
            ))}
          </h1>
          <motion.p className="mt-3 max-w-[36ch] text-[16px] leading-snug text-mute sm:mt-4 sm:text-lg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: skipIntro ? 0.7 : 2.3, duration: 0.9 }}>
            AI visuals, websites and content that make your brand impossible to ignore.
          </motion.p>

          <AnimatePresence>
            {showUI && (
              <motion.div className="pointer-events-auto mt-6 flex flex-wrap items-center gap-3" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: EASE }}>
                <Link to="/contact" className="btn btn-primary hidden md:inline-flex">Start your project</Link>
                <button type="button" onClick={skipToServices} className="btn btn-ghost !min-h-[44px] !px-4 text-sm sm:!px-5 sm:text-[15px]">Skip to services <span aria-hidden="true">↓</span></button>
                {mode === '3d' && isTouch() && gyro === 'off' && (
                  <button type="button" onClick={turnOnGyro} className="btn btn-ghost !min-h-[44px] !px-4 text-sm">Tilt to look</button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
          {mode === '3d' && showUI && (
            <motion.p className="mt-4 text-[13px] text-mute/90 sm:mt-5 sm:text-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
              {isTouch() ? 'Swipe to look around' : 'Drag to look around'} · tap a glowing light to step inside
            </motion.p>
          )}
          {/* For the still version (and screen readers): the five doors as plain links */}
          <ul className={`pointer-events-auto mt-5 flex flex-wrap gap-2 ${mode === '3d' ? 'sr-only' : ''}`}>
            {SERVICES.map((s) => (
              <li key={s.id}><Link to={`/services/${s.slug}`} className="inline-flex min-h-[40px] items-center gap-2 rounded-full border border-sky/30 bg-night/60 px-3.5 text-sm backdrop-blur"><span className="h-2 w-2 rounded-full bg-sky shadow-[0_0_10px_2px_rgba(143,211,255,0.8)]" />{s.short}</Link></li>
            ))}
          </ul>
        </div>
      </div>

      {/* Skip the flight (first visit only) */}
      {mode === '3d' && !introDone && (
        <button type="button" onClick={skipToServices} className="btn btn-ghost absolute right-4 top-20 !min-h-[40px] !px-4 text-sm sm:right-8 sm:top-24">Skip to services</button>
      )}

      {/* Flash into the chosen service */}
      <AnimatePresence>
        {leaving && <motion.div className="absolute inset-0 z-30 bg-[radial-gradient(circle_at_center,#cfeaff,#8fd3ff_40%,#070b1f)]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.38, ease: EASE }} />}
      </AnimatePresence>
    </section>
  )
}
