import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { PORTFOLIO, FILTERS } from '../data/portfolio.js'
import { EASE } from '../lib/motion.js'

const M = '/media'
const thumbOf = (item) => {
  const m = item.media?.[0]
  if (item.category === 'websites') return `${M}/${item.shots.phone}`
  return m.kind === 'video' ? `${M}/video/${m.id}.webp` : `${M}/work/${m.id}-sm.webp`
}

function Label({ children }) {
  const long = children.length > 14
  return (
    <span className={`rounded-xl border border-white/15 bg-night/75 px-2.5 py-1 text-[11px] leading-tight font-semibold tracking-wide backdrop-blur-md ${long ? 'text-gold' : 'text-ink/90'}`}>
      {children}
    </span>
  )
}

export function WorkCard({ item, onOpen, i = 0 }) {
  const ref = useRef()
  const vid = item.media?.[0]?.kind === 'video' ? item.media[0] : null
  // Video cards play a silent preview while on screen (not on reduce-motion)
  useEffect(() => {
    if (!vid || !ref.current) return
    const v = ref.current.querySelector('video')
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!v || reduce) return
    const io = new IntersectionObserver(([e]) => { e.isIntersecting ? v.play().catch(() => {}) : v.pause() }, { threshold: 0.4 })
    io.observe(v)
    return () => io.disconnect()
  }, [vid])

  const isSet = item.media?.length > 1
  return (
    <motion.button ref={ref} type="button" layout onClick={() => onOpen(item)}
      initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.55, ease: EASE, delay: Math.min(i * 0.04, 0.3) }}
      className="lift zoom group relative block w-full overflow-hidden rounded-2xl bg-panel text-left"
      aria-label={`${item.title}: ${item.label}. ${vid ? 'Play video' : isSet ? `View ${item.media.length} images` : 'View larger'}`}>
      <div className="relative" style={{ aspectRatio: '4/5' }}>
        {vid ? (
          <video src={`${M}/video/${vid.id}-loop.mp4`} poster={thumbOf(item)} muted loop playsInline preload="none" className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <img src={thumbOf(item)} alt={item.alt} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" />
        )}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-night/90 to-transparent" />
        <div className="absolute left-2.5 right-12 top-2.5 flex flex-wrap gap-1.5"><Label>{item.label}</Label></div>
        {(vid || isSet) && (
          <span className="absolute right-2.5 top-2.5 flex h-8 min-w-8 items-center justify-center rounded-full bg-night/70 px-2 text-xs font-semibold backdrop-blur-md" aria-hidden="true">
            {vid ? '▶' : `1/${item.media.length}`}
          </span>
        )}
        <p className="absolute inset-x-3 bottom-3 text-[15px] font-semibold leading-snug">{item.title}</p>
      </div>
    </motion.button>
  )
}

export function Lightbox({ item, onClose }) {
  const [idx, setIdx] = useState(0)
  const media = item?.media || (item?.shots ? [{ id: 'site', kind: 'site' }] : [])
  const touch = useRef(null)
  const closeBtn = useRef()
  useEffect(() => { setIdx(0) }, [item])
  useEffect(() => {
    if (!item) return
    const prev = document.activeElement
    closeBtn.current?.focus()
    const key = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') setIdx((i) => Math.min(i + 1, media.length - 1))
      if (e.key === 'ArrowLeft') setIdx((i) => Math.max(i - 1, 0))
    }
    document.addEventListener('keydown', key)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', key); document.body.style.overflow = ''; prev?.focus?.() }
  }, [item, media.length, onClose])

  return (
    <AnimatePresence>
      {item && (
        <motion.div className="fixed inset-0 z-50 flex flex-col bg-night/95 backdrop-blur-xl" role="dialog" aria-modal="true" aria-label={item.title}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
          <div className="wrap flex items-center justify-between gap-4 py-4">
            <div className="min-w-0">
              <p className="truncate font-semibold">{item.title}</p>
              <p className="truncate text-sm text-gold">{item.label}</p>
            </div>
            <button ref={closeBtn} type="button" onClick={onClose} className="btn btn-ghost !min-h-[44px] shrink-0 !px-4" aria-label="Close">Close ✕</button>
          </div>
          <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 pb-4"
            onTouchStart={(e) => { touch.current = e.touches[0].clientX }}
            onTouchEnd={(e) => {
              if (touch.current == null) return
              const dx = e.changedTouches[0].clientX - touch.current
              if (dx < -40) setIdx((i) => Math.min(i + 1, media.length - 1))
              if (dx > 40) setIdx((i) => Math.max(i - 1, 0))
              touch.current = null
            }}>
            <AnimatePresence mode="wait">
              <motion.div key={idx} className="flex h-full w-full items-center justify-center"
                initial={{ opacity: 0, scale: 0.97, filter: 'blur(4px)' }} animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }} exit={{ opacity: 0, filter: 'blur(4px)' }}
                transition={{ duration: 0.3, ease: EASE }}>
                {media[idx]?.kind === 'site' ? (
                  <img src={`${M}/${item.shots.desktop}`} alt={item.alt} className="max-h-full max-w-full rounded-2xl object-contain" />
                ) : media[idx]?.kind === 'video' ? (
                  <video key={media[idx].id} src={`${M}/video/${media[idx].id}.mp4`} poster={`${M}/video/${media[idx].id}.webp`} controls autoPlay muted playsInline loop
                    className="max-h-full max-w-full rounded-2xl" aria-label={item.alt} />
                ) : (
                  <img src={`${M}/work/${media[idx]?.id}.webp`} alt={media[idx]?.alt || item.alt} className="max-h-full max-w-full rounded-2xl object-contain" />
                )}
              </motion.div>
            </AnimatePresence>
            {media.length > 1 && (
              <>
                <button type="button" aria-label="Previous image" disabled={idx === 0} onClick={() => setIdx(idx - 1)}
                  className="btn btn-ghost absolute left-3 top-1/2 hidden !h-12 !w-12 -translate-y-1/2 !p-0 disabled:opacity-30 sm:flex">←</button>
                <button type="button" aria-label="Next image" disabled={idx === media.length - 1} onClick={() => setIdx(idx + 1)}
                  className="btn btn-ghost absolute right-3 top-1/2 hidden !h-12 !w-12 -translate-y-1/2 !p-0 disabled:opacity-30 sm:flex">→</button>
              </>
            )}
          </div>
          {media.length > 1 && (
            <div className="flex items-center justify-center gap-1.5 pb-[max(20px,env(safe-area-inset-bottom))]" aria-live="polite">
              {media.map((m, i) => (
                <button key={m.id} type="button" onClick={() => setIdx(i)} aria-label={`Image ${i + 1} of ${media.length}`}
                  className="flex h-11 min-w-7 items-center justify-center px-0.5">
                  <span className={`block h-1.5 rounded-full transition-[width,background-color] duration-300 ${i === idx ? 'w-6 bg-sky' : 'w-1.5 bg-white/30'}`} />
                </button>
              ))}
            </div>
          )}
          {item.url && (
            <div className="flex justify-center pb-6"><a className="btn btn-primary" href={item.url} target="_blank" rel="noopener">View live ↗</a></div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default function PortfolioGrid({ initial = 'all', limit, only, showFilters = true }) {
  const [filter, setFilter] = useState(initial)
  const [open, setOpen] = useState(null)
  const items = useMemo(() => {
    let list = PORTFOLIO
    if (only) list = list.filter(only)
    if (filter !== 'all') list = list.filter((p) => p.category === filter)
    return limit ? list.slice(0, limit) : list
  }, [filter, limit, only])

  return (
    <div>
      {showFilters && (
        <div role="tablist" aria-label="Filter work" className="-mx-5 mb-8 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
          {FILTERS.map((f) => (
            <button key={f.id} role="tab" aria-selected={filter === f.id} type="button" onClick={() => setFilter(f.id)}
              className={`relative min-h-[44px] shrink-0 rounded-full px-5 text-sm font-semibold transition-colors duration-200 ${filter === f.id ? 'text-night' : 'text-mute hover:text-ink'}`}>
              {filter === f.id && <motion.span layoutId="filter-pill" className="absolute inset-0 rounded-full bg-sky" transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }} />}
              <span className="relative">{f.label}</span>
            </button>
          ))}
        </div>
      )}
      <motion.div layout className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
        <AnimatePresence mode="popLayout">
          {items.map((item, i) => <WorkCard key={item.id} item={item} i={i} onOpen={setOpen} />)}
        </AnimatePresence>
      </motion.div>
      <Lightbox item={open} onClose={() => setOpen(null)} />
    </div>
  )
}
