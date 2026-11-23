import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { LogoMark, BrandIcon } from './Brand.jsx'
import { SERVICES } from '../data/services.js'
import { SITE, waLink, igLink, igProfile } from '../config/site.js'
import { EASE } from '../lib/motion.js'

const NAV = [
  { to: '/#services', label: 'Services' },
  { to: '/work', label: 'Work' },
  { to: '/#websites', label: 'Websites' },
  { to: '/contact', label: 'Contact' },
]

function Header() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { pathname } = useLocation()
  useEffect(() => setOpen(false), [pathname])
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24)
    on(); window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  useEffect(() => { document.body.style.overflow = open ? 'hidden' : '' }, [open])

  return (
    <header className={`fixed inset-x-0 top-0 z-40 transition-[background-color,border-color] duration-300 ${scrolled || open ? 'border-b border-line/60 bg-night/80 backdrop-blur-xl' : 'border-b border-transparent'}`}>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-full focus:bg-sky focus:px-4 focus:py-2 focus:text-night">Skip to content</a>
      <div className="wrap flex h-16 items-center justify-between gap-4 sm:h-[72px]">
        <Link to="/" aria-label="Singing Cloud Studio, home"><LogoMark /></Link>
        <nav aria-label="Main" className="hidden items-center gap-8 md:flex">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} className="text-[15px] text-mute transition-colors duration-200 hover:text-ink">{n.label}</NavLink>
          ))}
          <Link to="/contact" className="btn btn-primary !min-h-[42px] !px-5">Start your project</Link>
        </nav>
        <button type="button" className="relative z-50 -mr-2 flex h-11 w-11 items-center justify-center md:hidden" aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen((v) => !v)}>
          <span className="relative block h-3 w-6">
            <span className={`absolute left-0 h-[1.5px] w-6 bg-ink transition-transform duration-300 ${open ? 'top-1.5 rotate-45' : 'top-0'}`} />
            <span className={`absolute left-0 h-[1.5px] w-6 bg-ink transition-transform duration-300 ${open ? 'top-1.5 -rotate-45' : 'top-3'}`} />
          </span>
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div id="mobile-menu" className="fixed inset-0 top-16 z-40 overflow-y-auto bg-night md:hidden"
            initial={{ opacity: 0, clipPath: 'inset(0 0 100% 0)' }} animate={{ opacity: 1, clipPath: 'inset(0 0 0% 0)' }} exit={{ opacity: 0, clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.45, ease: EASE }}>
            <nav aria-label="Mobile" className="wrap flex flex-col pb-32 pt-6">
              {[{ to: '/', label: 'Home' }, ...NAV].map((n, i) => (
                <motion.div key={n.to} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 + i * 0.05, duration: 0.5, ease: EASE }}>
                  <Link to={n.to} className="display block border-b border-line/60 py-4 text-4xl">{n.label}</Link>
                </motion.div>
              ))}
              <p className="kicker mt-10">Services</p>
              <ul className="mt-3 grid gap-1">
                {SERVICES.map((s) => <li key={s.id}><Link to={`/services/${s.slug}`} className="block py-2 text-lg text-mute hover:text-ink">{s.name}</Link></li>)}
              </ul>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

// Thumb-friendly contact bar on phones
function MobileBar() {
  const wa = waLink()
  const { pathname } = useLocation()
  if (pathname === '/contact') return null
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line/60 bg-night/85 px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl md:hidden">
      <div className="flex gap-3">
        <Link to="/contact" className="btn btn-primary flex-1">Start your project</Link>
        <a className="btn btn-ghost !px-4" href={wa || igLink} target="_blank" rel="noopener" aria-label={wa ? 'Message on WhatsApp' : 'Message on Instagram'}>
          <BrandIcon name={wa ? 'whatsapp' : 'instagram'} size={22} />
        </a>
      </div>
    </div>
  )
}

function Footer() {
  return (
    <footer className="border-t border-line/60 pb-28 pt-16 md:pb-12">
      <div className="wrap grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <LogoMark />
          <p className="mt-4 max-w-sm text-mute">AI visuals, websites, content, branding and automation. A creative studio working with clients worldwide, fully online.</p>
        </div>
        <div>
          <p className="kicker">Services</p>
          <ul className="mt-4 grid gap-2">
            {SERVICES.map((s) => <li key={s.id}><Link className="text-mute hover:text-ink" to={`/services/${s.slug}`}>{s.name}</Link></li>)}
          </ul>
        </div>
        <div>
          <p className="kicker">Contact</p>
          <ul className="mt-4 grid gap-3">
            <li><a className="inline-flex items-center gap-2.5 text-mute hover:text-ink" href={igProfile} target="_blank" rel="noopener"><BrandIcon name="instagram" size={20} /> @{SITE.instagram}</a></li>
            {waLink() && <li><a className="inline-flex items-center gap-2.5 text-mute hover:text-ink" href={waLink()} target="_blank" rel="noopener"><BrandIcon name="whatsapp" size={20} /> WhatsApp</a></li>}
            <li><a className="text-mute hover:text-ink" href={`mailto:${SITE.email}`}>{SITE.email}</a></li>
          </ul>
        </div>
      </div>
      <div className="wrap mt-12 flex flex-col gap-2 text-sm text-mute/80 sm:flex-row sm:justify-between">
        <p>© {new Date().getFullYear()} Singing Cloud Studio</p>
        <p>Pieces marked “Concept” are the studio’s own creative work, made to show what’s possible.</p>
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
    </>
  )
}
