import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { SITE } from '../config/site.js'
import { XpWindow } from './Xp.jsx'

/* Black Friday pop-up with a live countdown. Disappears by itself once the offer ends. */

const pad = (n) => String(n).padStart(2, '0')
export function timeLeft(end, now = Date.now()) {
  const ms = end.getTime() - now
  if (ms <= 0) return null
  const s = Math.floor(ms / 1000)
  return { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 }
}

export function useCountdown(end) {
  const [left, setLeft] = useState(() => timeLeft(end))
  useEffect(() => {
    if (!left) return
    const t = setInterval(() => setLeft(timeLeft(end)), 1000)
    return () => clearInterval(t)
  }, [end, !left]) // eslint-disable-line react-hooks/exhaustive-deps
  return left
}

export function Countdown({ left, className = '' }) {
  return (
    <span className={`tabular-nums ${className}`} aria-label={`${left.d} days, ${left.h} hours, ${left.m} minutes left`}>
      {left.d}d {pad(left.h)}:{pad(left.m)}:{pad(left.s)}
    </span>
  )
}

export default function BlackFriday() {
  const left = useCountdown(SITE.offerEnds)
  const { pathname } = useLocation()
  const [state, setState] = useState('hidden') // hidden | open | min
  useEffect(() => {
    if (!left || state !== 'hidden') return
    // on the home page wait until the visitor has answered the welcome dialog
    const show = () => setState((s) => (s === 'hidden' ? 'open' : s))
    let later
    const t = setTimeout(show, pathname === '/' ? 20000 : 3000)
    const afterHero = () => { clearTimeout(later); later = setTimeout(show, 8000) } // let the landing breathe first
    window.addEventListener('scp:hero-done', afterHero)
    return () => { clearTimeout(t); clearTimeout(later); window.removeEventListener('scp:hero-done', afterHero) }
  }, [pathname, left, state])

  if (!left || state === 'hidden') return null
  if (state === 'min') {
    return (
      <button type="button" onClick={() => setState('open')} className="bf-chip fixed right-2 top-[58px] z-[46] md:bottom-6 md:right-6 md:top-auto" aria-label="Open the Black Friday offer">
        <b>Black Friday</b> 20% off · <Countdown left={left} />
      </button>
    )
  }
  return (
    <div className="fixed right-2 top-[58px] z-[46] w-[min(94vw,340px)] md:bottom-6 md:right-6 md:top-auto" role="dialog" aria-label="Black Friday offer">
      <XpWindow title="Black Friday.exe" onMinimize={() => setState('min')} onClose={() => setState('min')} as="div" bodyClassName="p-4">
        <p className="text-[17px] font-bold leading-snug text-black">Black Friday: 20% off any project, until December 7</p>
        <div className="xp-inset mt-3 flex items-center justify-between px-3 py-2 text-black">
          <span className="text-sm">Ends in</span>
          <Countdown left={left} className="pixel text-2xl text-[#003399]" />
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Link to="/contact" onClick={() => setState('min')} className="xp-btn xp-btn-default">Claim my 20%</Link>
          <button type="button" className="xp-btn" onClick={() => setState('min')}>Later</button>
        </div>
      </XpWindow>
    </div>
  )
}
