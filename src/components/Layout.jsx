import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { LogoMark, BrandIcon } from './Brand.jsx'
import Companion from './Companion.jsx'
import BlackFriday from './BlackFriday.jsx'
import { ContactLinks } from './Contact.jsx'
import { SERVICES } from '../data/services.js'
import { SITE, CONTACTS, igLink, tgLink } from '../config/site.js'
import { setSound, onSoundChange, soundOn } from '../lib/sound.js'

const NAV = [
  { to: '/#services', label: 'Services' },
  { to: '/work', label: 'Work' },
  { to: '/#websites', label: 'Websites' },
  { to: '/contact', label: 'Contact' },
]

function SoundToggle() {
  const [on, setOn] = useState(soundOn())
  useEffect(() => onSoundChange(setOn), [])
  return (
    <button type="button" className="xp-tray-btn" aria-pressed={on} aria-label={on ? 'Sound is on. Turn sound off' : 'Sound is off. Turn sound on'}
      title={on ? 'Sound on' : 'Sound off'} onClick={() => setSound(!on)}>
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
        <path d="M4 9h4l5-4v14l-5-4H4z" fill="#fff" stroke="#0a246a" strokeWidth="1.2" strokeLinejoin="round" />
        {on ? (
          <g fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"><path d="M16 9.5a4 4 0 0 1 0 5" /><path d="M18.5 7a7.5 7.5 0 0 1 0 10" /></g>
        ) : (
          <g stroke="#e8352b" strokeWidth="2.4" strokeLinecap="round"><path d="M16 9l5 6" /><path d="M21 9l-5 6" /></g>
        )}
      </svg>
      <span className="hidden text-[13px] font-bold text-white sm:inline">{on ? 'Sound on' : 'Sound off'}</span>
    </button>
  )
}

/* Windows XP Start-menu style panel, opened by the two-line menu button (phones and laptops). */
function StartMenu({ onClose }) {
  const panel = useRef()
  useEffect(() => {
    const prev = document.activeElement
    panel.current?.querySelector('a, button')?.focus()
    const key = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'Tab') { // keep keyboard focus inside the menu
        const items = [...panel.current.querySelectorAll('a, button')]
        const first = items[0], last = items[items.length - 1]
        if (e.shiftKey && document.activeElement === first) { last.focus(); e.preventDefault() }
        else if (!e.shiftKey && document.activeElement === last) { first.focus(); e.preventDefault() }
      }
    }
    document.addEventListener('keydown', key)
    const narrow = innerWidth < 768
    if (narrow) document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', key); document.body.style.overflow = ''; prev?.focus?.() }
  }, [onClose])

  // rendered into <body>, outside the header, so it can never be clipped by the header's own effects
  return createPortal(
    <div className="fixed inset-0 z-[60]" role="presentation">
      <button type="button" className="absolute inset-0 h-full w-full cursor-default bg-black/30" aria-label="Close menu" onClick={onClose} tabIndex={-1} />
      <nav ref={panel} id="site-menu" aria-label="Menu" className="start-menu absolute right-2 top-[60px] w-[min(94vw,420px)] sm:right-4">
        <div className="start-menu-top">
          <img src="/media/ui/companion.webp" alt="" className="h-9 w-auto" />
          <span>Singing Cloud Project</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-[1.15fr_1fr]">
          <ul className="start-menu-left">
            <li><Link to="/" onClick={onClose}>Home</Link></li>
            {SERVICES.map((s) => <li key={s.id}><Link to={`/services/${s.slug}`} onClick={onClose}>{s.name}</Link></li>)}
            <li><Link to="/work" onClick={onClose}>Work</Link></li>
            <li><Link to="/#websites" onClick={onClose}>Websites</Link></li>
            <li><Link to="/contact" onClick={onClose}><b>Contact</b></Link></li>
          </ul>
          <ul className="start-menu-right">
            {CONTACTS.map((c) => (
              <li key={c.id}><a href={c.href} target="_blank" rel="noopener" onClick={onClose}><BrandIcon name={c.id} size={20} /> {c.label}</a></li>
            ))}
            <li><a href={`mailto:${SITE.email}`} onClick={onClose}><span aria-hidden="true" className="inline-block w-5 text-center">✉</span> Email</a></li>
          </ul>
        </div>
        <div className="start-menu-bottom">
          <Link to="/contact" onClick={onClose} className="xp-btn xp-btn-default">Start your project</Link>
          <button type="button" className="xp-btn" onClick={onClose}>Close</button>
        </div>
      </nav>
    </div>,
    document.body,
  )
}

function Header() {
  const [open, setOpen] = useState(false)
  const { pathname, hash } = useLocation()
  useEffect(() => setOpen(false), [pathname, hash])
  return (
    <>
      <header className="xp-header fixed inset-x-0 top-0 z-40">
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:bg-white focus:px-4 focus:py-2 focus:text-black">Skip to content</a>
        <div className="wrap flex h-[52px] items-center justify-between gap-3">
          <Link to="/" aria-label="Singing Cloud Project, home" className="min-w-0"><LogoMark /></Link>
          <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
            {NAV.map((n) => <NavLink key={n.to} to={n.to} className="xp-nav">{n.label}</NavLink>)}
          </nav>
          <div className="flex items-center gap-1.5">
            <SoundToggle />
            <button type="button" className="xp-tray-btn !px-3" aria-expanded={open} aria-controls="site-menu" aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen((v) => !v)}>
              <span className="flex flex-col gap-[5px]" aria-hidden="true">
                <span className={`block h-[2px] w-6 bg-white transition-transform duration-200 ${open ? 'translate-y-[3.5px] rotate-45' : ''}`} />
                <span className={`block h-[2px] w-6 bg-white transition-transform duration-200 ${open ? '-translate-y-[3.5px] -rotate-45' : ''}`} />
              </span>
              <span className="hidden text-[13px] font-bold text-white sm:inline">Menu</span>
            </button>
          </div>
        </div>
      </header>
      {open && <StartMenu onClose={() => setOpen(false)} />}
    </>
  )
}

// Thumb-friendly XP taskbar on phones
function MobileBar() {
  const { pathname } = useLocation()
  if (pathname === '/contact') return null
  return (
    <div className="xp-taskbar fixed inset-x-0 bottom-0 z-30 px-2 pb-[max(8px,env(safe-area-inset-bottom))] pt-2 md:hidden">
      <div className="flex items-center gap-2">
        <Link to="/contact" className="xp-start flex-1">Start your project</Link>
        <a className="xp-tray-btn" href={igLink} target="_blank" rel="noopener" aria-label="Message on Instagram"><BrandIcon name="instagram" size={24} /></a>
        <a className="xp-tray-btn" href={tgLink} target="_blank" rel="noopener" aria-label="Message on Telegram"><BrandIcon name="telegram" size={24} /></a>
      </div>
    </div>
  )
}

function Footer() {
  return (
    <footer className="xp-footer pb-28 pt-12 md:pb-10">
      <div className="wrap grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <LogoMark />
          <p className="mt-4 max-w-sm text-[15px] text-white/90">Websites & SEO, automation & AI assistants, and product ads. Working with clients worldwide, fully online.</p>
        </div>
        <div>
          <p className="xp-footer-title">Services</p>
          <ul className="mt-3 grid gap-2">
            {SERVICES.map((s) => <li key={s.id}><Link className="text-white/90 underline-offset-4 hover:underline" to={`/services/${s.slug}`}>{s.name}</Link></li>)}
          </ul>
        </div>
        <div>
          <p className="xp-footer-title">Contact</p>
          <ContactLinks className="mt-3 [&_a]:!text-white" />
        </div>
      </div>
      <div className="wrap mt-10 text-sm text-white/80">
        <p>© {new Date().getFullYear()} Singing Cloud Project</p>
      </div>
    </footer>
  )
}

export default function Layout({ children }) {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1))
      if (el) { setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60); return }
    }
    window.scrollTo(0, 0)
  }, [pathname, hash])
  return (
    <>
      <Header />
      <main id="main">{children}</main>
      <Footer />
      <MobileBar />
      <Companion />
      <BlackFriday />
    </>
  )
}
