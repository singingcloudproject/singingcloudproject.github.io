import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { chime } from '../lib/sound.js'

/* The little singing cloud that travels with the visitor and talks in XP-style balloon tips. */

const EVENT = 'scp:cloud-say'
/** Make the companion say something from anywhere on the site. */
export function say(text, { sound = true } = {}) {
  window.dispatchEvent(new CustomEvent(EVENT, { detail: { text, sound } }))
}

const ROUTE_LINES = [
  [/^\/$/, 'Hi! I’m your cloud guide. Say “Yes” and I’ll fly you to the mountain.'],
  [/^\/services\//, 'This is one of the three things I do best. Like it? Send me a message below.'],
  [/^\/work/, 'Everything here was made in the clouds. Tap any piece to see it big.'],
  [/^\/contact/, 'Write me a few lines. I’ll make sure it reaches the studio.'],
]

export default function Companion() {
  const { pathname } = useLocation()
  const [text, setText] = useState('')
  const [open, setOpen] = useState(false)
  const timer = useRef()

  const show = (t, sound = true) => {
    setText(t); setOpen(true)
    if (sound) chime()
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setOpen(false), Math.max(6000, t.length * 90))
  }

  useEffect(() => {
    const on = (e) => show(e.detail.text, e.detail.sound)
    window.addEventListener(EVENT, on)
    return () => { window.removeEventListener(EVENT, on); clearTimeout(timer.current) }
  }, [])

  useEffect(() => {
    const line = ROUTE_LINES.find(([re]) => re.test(pathname))?.[1]
    if (!line) return
    const t = setTimeout(() => show(line, false), pathname === '/' ? 900 : 700)
    return () => clearTimeout(t)
  }, [pathname])

  // on the home page, chat about the services when they scroll into view
  useEffect(() => {
    if (pathname !== '/') return
    const el = document.getElementById('services')
    if (!el) return
    let said = false
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !said) { said = true; show('These three are what I build. Tap one to see more.', false) }
    }, { threshold: 0.35 })
    io.observe(el)
    return () => io.disconnect()
  }, [pathname])

  return (
    <div className="companion pointer-events-none fixed bottom-[92px] left-3 z-[45] md:bottom-6 md:left-6">
      {open && text && (
        <div className="xp-balloon pointer-events-auto absolute bottom-[62px] left-1 w-[min(78vw,290px)] md:bottom-[96px]" role="status" aria-live="polite">
          <button type="button" className="xp-balloon-close" aria-label="Close tip" onClick={() => setOpen(false)}>×</button>
          <p className="pr-5">{text}</p>
        </div>
      )}
      <button type="button" className="companion-cloud pointer-events-auto block" aria-label="Your cloud guide. Tap for a tip."
        onClick={() => (open ? setOpen(false) : show(text || 'Psst, tap a cloud to see what I build.'))}>
        <img src="/media/ui/companion.webp" alt="" width="104" height="70" className="h-auto w-[62px] md:w-[104px]" draggable="false" />
      </button>
    </div>
  )
}
