import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Pano, { pickWidth, wrapAngle } from './Pano.jsx'
import { XpWindow, XpProgress } from './Xp.jsx'
import { say } from './Companion.jsx'
import { SERVICES } from '../data/services.js'
import { ding, whoosh } from '../lib/sound.js'

/*
  Home hero:
  1. Your XP wallpaper, exactly as it is, with a "SingingCloud.exe" loading dialog.
  2. It dissolves into the 360° panorama made from it (drag / swipe / tilt) and asks "Are you ready…?"
  3. "Yes": a 2–3 s flight to the mountain on the right. Three clouds there open the services as XP windows.
     "Skip to services": scrolls down to the services.
*/

const H = '/media/hero360'
const scene = (name, ratio, horizon, sky, ground) => ({
  name, ratio, horizon, sky, ground,
  srcs: { 2048: `${H}/${name}-2048.jpg`, 4096: `${H}/${name}-4096.jpg`, 8192: `${H}/${name}-8192.jpg` },
})
const DESK = scene('desk', 0.15556, 0.52, [0.384, 0.611, 0.924], [0.234, 0.292, 0.074])
const MOUNTAIN = scene('mountain', 0.19811, 0.5, [0.386, 0.568, 0.804], [0.353, 0.432, 0.101])
const MOUNTAIN_YAW = 0.5 // where the far mountain sits in the wallpaper panorama (radians right of centre)
const SPOTS = [
  { id: 'websites', yaw: -0.27, pitch: 0.12, img: 1 },
  { id: 'automation', yaw: 0, pitch: 0.2, img: 2 },
  { id: 'ads', yaw: 0.27, pitch: 0.12, img: 3 },
]
// upright phones see a narrow slice: pull the clouds together and stagger them so all three fit
const SPOTS_TALL = [
  { id: 'websites', yaw: -0.15, pitch: 0.06, img: 1 },
  { id: 'automation', yaw: 0, pitch: 0.27, img: 2 },
  { id: 'ads', yaw: 0.15, pitch: 0.06, img: 3 },
]
function useTall() {
  const [tall, setTall] = useState(() => innerWidth < innerHeight)
  useEffect(() => {
    const on = () => setTall(innerWidth < innerHeight)
    window.addEventListener('resize', on)
    return () => window.removeEventListener('resize', on)
  }, [])
  return tall
}

const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches
const isTouch = () => matchMedia('(pointer: coarse)').matches
const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2)
const easeIn = (t) => t * t * t
const easeOut = (t) => 1 - (1 - t) ** 3
const smooth = (a, b, t) => Math.min(1, Math.max(0, (t - a) / (b - a)))

function CloudSpot({ s, img, onOpen }) {
  return (
    <button type="button" onClick={() => onOpen(s.id)} className="cloud-spot group flex flex-col items-center" aria-label={`Open ${s.name}`}>
      <img src={`/media/ui/cloud-${img}.webp`} alt="" width="240" height="158" draggable="false"
        className="cloud-spot-img w-[clamp(110px,22vw,190px)]" />
      <span className="cloud-label -mt-3">{s.name}</span>
    </button>
  )
}

function ServiceWindow({ s, onClose }) {
  useEffect(() => {
    const k = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', k)
    return () => document.removeEventListener('keydown', k)
  }, [onClose])
  return (
    <div className="pointer-events-none absolute inset-0 z-[47] flex items-start justify-center px-3 pt-[76px] sm:items-center sm:pt-0">
      <XpWindow title={`${s.name}.exe`} titleId={`win-${s.id}`} onClose={onClose} draggable as="div" role="dialog"
        className="pointer-events-auto w-full max-w-[560px] shadow-2xl" bodyClassName="max-h-[min(64svh,560px)] overflow-y-auto p-5 sm:p-6">
        <p className="xp-kicker">{s.kicker}</p>
        <h2 className="pixel mt-2 text-[28px] leading-tight text-[#003399] sm:text-[32px]">{s.headline}</h2>
        <p className="mt-3 text-[16px] leading-relaxed text-[#1a1a1a]">{s.intro}</p>
        <ul className="mt-4 grid gap-2">
          {s.does.map((d) => <li key={d} className="flex gap-2.5 text-[15px] text-[#1a1a1a]"><span aria-hidden="true" className="xp-check">✓</span>{d}</li>)}
        </ul>
        <div className="mt-6 flex flex-wrap gap-2">
          <Link to="/contact" state={{ service: s.name }} className="xp-btn xp-btn-lg xp-btn-default">{s.cta}</Link>
          <Link to={`/services/${s.slug}`} className="xp-btn xp-btn-lg">See the full page</Link>
        </div>
      </XpWindow>
    </div>
  )
}

export default function Hero() {
  const look = useRef({ yaw: 0, pitch: 0, zoom: 1, userMoved: false, reduced: false })
  const [stage, setStage] = useState('boot') // boot | ask | desk | flying | mountain
  const [sceneName, setSceneName] = useState('desk')
  const [progress, setProgress] = useState({ desk: 0, mountain: 0 })
  const [failed, setFailed] = useState(false)
  const [openId, setOpenId] = useState(null)
  const [fx, setFx] = useState({ haze: 0, lines: 0 })
  const [gyro, setGyro] = useState('off') // off | on | denied
  const [moved, setMoved] = useState(false)
  const section = useRef()
  const shown = useRef(performance.now())
  const tall = useTall()

  useEffect(() => { look.current.reduced = reduceMotion() }, [])

  const onProgress = useCallback((name, p) => setProgress((v) => ({ ...v, [name]: Math.max(v[name], p) })), [])
  const onFail = useCallback((name) => { if (name === 'desk') setFailed(true) }, [])

  // smooth the progress bar so it always reads like a real loading dialog
  const [shownPct, setShownPct] = useState(0)
  useEffect(() => {
    if (stage !== 'boot') return
    const target = failed ? 1 : Math.max(progress.desk, 0.08)
    const t = setInterval(() => setShownPct((v) => Math.min(target, v + 0.03)), 40)
    return () => clearInterval(t)
  }, [stage, progress.desk, failed])

  // loaded → wallpaper dissolves into the 360° scene → ask
  useEffect(() => {
    if (stage !== 'boot') return
    const done = shownPct >= 1
    const giveUp = setTimeout(() => setFailed(true), 12000) // very slow connection: carry on with the wallpaper
    if (done) {
      const wait = Math.max(0, 1400 - (performance.now() - shown.current))
      const t = setTimeout(() => { setStage('ask'); ding() }, wait)
      return () => { clearTimeout(t); clearTimeout(giveUp) }
    }
    return () => clearTimeout(giveUp)
  }, [stage, shownPct])

  // as the photo dissolves, the camera pulls back from it into the open 360° scene
  useEffect(() => {
    if (stage !== 'ask' || reduceMotion()) return
    const L = look.current, start = performance.now()
    let raf
    const step = (now) => {
      const t = Math.min(1, (now - start) / 2600)
      if (!L.locked) L.zoom = 1.25 - 0.25 * easeOut(t)
      if (t < 1) raf = requestAnimationFrame(step)
    }
    L.zoom = 1.25
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [stage])

  // preload the mountain once the first scene is in, so the flight never waits
  useEffect(() => {
    if (progress.desk < 1 || failed) return
    const w = pickWidth(4096)
    for (const width of [2048, w]) { const i = new Image(); i.src = MOUNTAIN.srcs[width] }
  }, [progress.desk, failed])

  const done = () => window.dispatchEvent(new Event('scp:hero-done'))

  const skip = () => {
    setStage((s) => (s === 'ask' ? 'desk' : s))
    done()
    document.getElementById('services')?.scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth' })
  }

  const fly = () => {
    if (stage === 'flying') return
    setStage('flying'); setOpenId(null); done()
    whoosh(reduceMotion() ? 0.8 : 2.8)
    say('Hold on tight!', { sound: false })
    const L = look.current
    L.locked = true; L.userMoved = true; L.vel = 0
    const y0 = L.yaw, target = y0 + wrapAngle(MOUNTAIN_YAW - y0), p0 = L.pitch
    const land = isTouch() && innerWidth < innerHeight ? 0.88 : 1
    const reduced = reduceMotion()
    const T1 = reduced ? 350 : 2100, T2 = reduced ? 350 : 900
    let start = performance.now(), phase = 1, raf

    const step = (now) => {
      const t = Math.min(1, (now - start) / (phase === 1 ? T1 : T2))
      if (phase === 1) {
        if (!reduced) {
          L.yaw = y0 + (target - y0) * ease(Math.min(1, t * 1.5))
          L.pitch = p0 * (1 - t)
          L.zoom = 1 + 2.6 * easeIn(t)
        }
        setFx({ haze: smooth(0.68, 1, t), lines: reduced ? 0 : smooth(0.05, 0.4, t) })
        if (t >= 1) {
          setSceneName('mountain')
          L.yaw = 0; L.pitch = 0; L.zoom = reduced ? land : 1.9
          phase = 2; start = now
        }
      } else {
        L.zoom = reduced ? land : 1.9 + (land - 1.9) * easeOut(t)
        setFx({ haze: 1 - smooth(0.05, 0.9, t), lines: reduced ? 0 : 1 - smooth(0, 0.6, t) })
        if (t >= 1) {
          L.locked = false; L.zoom = land; L.spin = 0 // the menu clouds stay in view at the mountain
          setFx({ haze: 0, lines: 0 })
          setStage('mountain')
          setTimeout(() => say('Psst, tap a cloud to see what I build.'), 400)
          return
        }
      }
      raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }

  // phone tilt (iPhone asks the visitor first; this must run from a tap)
  const turnOnGyro = async () => {
    try {
      if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        const r = await DeviceOrientationEvent.requestPermission()
        if (r !== 'granted') { setGyro('denied'); say('No problem, you can still swipe to look around.', { sound: false }); return }
      }
      let base = null
      const on = (e) => {
        if (e.alpha == null) return
        const L = look.current
        if (L.locked) { base = null; return }
        const landscape = Math.abs(window.orientation || screen.orientation?.angle || 0) === 90
        const tilt = landscape ? (e.gamma > 0 ? 90 - e.gamma : -90 - e.gamma) : 90 - e.beta
        if (!base) base = { a: e.alpha, yaw: L.yaw }
        L.yaw = base.yaw - wrapAngle(((e.alpha - base.a) * Math.PI) / 180)
        L.pitch = (tilt * Math.PI) / 180 * 0.9
        L.userMoved = true; L.lastTouch = performance.now() // the phone is steering, so no auto-spin
      }
      window.addEventListener('deviceorientation', on)
      setGyro('on')
      say('Now tilt and turn your phone to look around.', { sound: false })
    } catch { setGyro('denied') }
  }

  // hide the "drag to look" hint once the visitor has moved the view
  useEffect(() => {
    if (moved) return
    const t = setInterval(() => { if (look.current.dragging || (look.current.userMoved && !look.current.locked)) setMoved(true) }, 300)
    return () => clearInterval(t)
  }, [moved])

  const current = sceneName === 'mountain' ? MOUNTAIN : DESK
  const opened = SERVICES.find((s) => s.id === openId)
  const panoVisible = !failed && stage !== 'boot'
  const spots = stage === 'mountain' && !failed
    ? (tall ? SPOTS_TALL : SPOTS).map((sp) => ({ ...sp, node: <CloudSpot s={SERVICES.find((s) => s.id === sp.id)} img={sp.img} onOpen={setOpenId} /> }))
    : []
  const pct = Math.round(shownPct * 100)

  return (
    <section ref={section} className="hero relative h-[100svh] min-h-[560px] w-full overflow-hidden bg-[#5b8fe0]" aria-label="Welcome to Singing Cloud Project">
      <h1 className="sr-only">Singing Cloud Project: websites & SEO, automation & AI assistants, and product ads</h1>

      <Pano scene={current} look={look} hotspots={spots} onProgress={onProgress} onFail={onFail}
        interactive={stage !== 'boot' && stage !== 'flying'}
        className={`transition-opacity duration-[1400ms] ${panoVisible ? 'opacity-100' : 'opacity-0'}`} />

      {/* Your wallpaper, exactly as it is: the first thing visitors see */}
      <img src={`${H}/wallpaper.webp`} alt="" fetchPriority="high" decoding="async" draggable="false"
        className={`pointer-events-none absolute inset-0 h-full w-full object-cover transition-opacity duration-[1400ms] ${panoVisible || (failed && stage === 'mountain') ? 'opacity-0' : 'opacity-100'}`}
        style={failed && stage === 'flying' && !reduceMotion() ? { transform: 'scale(2.4)', transformOrigin: '92% 60%', transition: 'transform 2.1s cubic-bezier(.5,0,.75,0)' } : undefined} />

      {/* Fallback landing if the 360° scene could not load at all */}
      {failed && stage === 'mountain' && (
        <>
          <img src={MOUNTAIN.srcs[2048]} alt="" className="absolute inset-0 h-full w-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none' }} />
          <div className="absolute inset-x-0 top-[22%] z-10 flex flex-wrap items-start justify-center gap-2 px-3">
            {SPOTS.map((sp) => <CloudSpot key={sp.id} s={SERVICES.find((s) => s.id === sp.id)} img={sp.img} onOpen={setOpenId} />)}
          </div>
        </>
      )}

      {/* Flight effects */}
      <div aria-hidden="true" className="speed-lines pointer-events-none absolute inset-0" style={{ opacity: fx.lines }} />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_60%_45%,#ffffff_0%,#dceaff_45%,#a9c8f5_100%)]" style={{ opacity: fx.haze }} />

      {/* SingingCloud.exe */}
      {(stage === 'boot' || stage === 'ask') && (
        <div className="absolute inset-0 z-20 flex items-center justify-center px-4">
          <XpWindow title="SingingCloud.exe" as="div" role="dialog" aria-modal="false" aria-labelledby="exe-msg"
            className={`exe-dialog w-full max-w-[460px] ${stage === 'ask' ? 'exe-pop' : ''}`} bodyClassName="p-4 sm:p-5">
            {stage === 'boot' ? (
              <div aria-live="polite">
                <p className="text-[15px] text-black">Type what you want to see:</p>
                <div className="xp-inset mt-2 px-3 py-2"><span className="pixel text-[26px] leading-none text-black">singing cloud project</span><span className="caret" aria-hidden="true" /></div>
                <div className="mt-4 flex items-baseline justify-between text-black">
                  <span className="text-[15px]">Generating…</span>
                  <span className="pixel text-2xl">{pct}%</span>
                </div>
                <div className="mt-1.5"><XpProgress value={shownPct} label="Loading the 360° view" /></div>
              </div>
            ) : (
              <div>
                <div className="flex items-start gap-4">
                  <img src="/media/ui/companion.webp" alt="" width="64" height="35" className="mt-1 w-14 shrink-0" />
                  <p id="exe-msg" className="text-[18px] font-bold leading-snug text-black sm:text-[19px]">Are you ready to experience my website?</p>
                </div>
                <div className="mt-6 flex flex-wrap justify-end gap-2.5">
                  <button type="button" className="xp-btn xp-btn-lg xp-btn-default min-w-[96px]" onClick={fly} autoFocus>Yes</button>
                  <button type="button" className="xp-btn xp-btn-lg" onClick={skip}>Skip to services</button>
                </div>
              </div>
            )}
          </XpWindow>
        </div>
      )}

      {/* Controls after the dialog */}
      {(stage === 'desk' || stage === 'mountain') && (
        <div className="pointer-events-none absolute inset-x-0 bottom-[96px] z-20 flex flex-col items-center gap-3 px-4 md:bottom-8">
          {!moved && !failed && (
            <p className="xp-tooltip">{isTouch() ? 'Swipe sideways to look around' : 'Drag to look around'}{stage === 'mountain' ? ' · tap a cloud to open it' : ''}</p>
          )}
          <div className="pointer-events-auto flex flex-wrap items-center justify-center gap-2">
            {stage === 'desk' && <button type="button" className="xp-btn xp-btn-lg xp-btn-default" onClick={fly}>Fly to the mountain</button>}
            {isTouch() && gyro === 'off' && !failed && <button type="button" className="xp-btn xp-btn-lg" onClick={turnOnGyro}>Tilt to look</button>}
            <button type="button" className="xp-btn xp-btn-lg" onClick={skip}>Services <span aria-hidden="true">↓</span></button>
          </div>
        </div>
      )}

      {opened && <ServiceWindow key={opened.id} s={opened} onClose={() => setOpenId(null)} />}
    </section>
  )
}
