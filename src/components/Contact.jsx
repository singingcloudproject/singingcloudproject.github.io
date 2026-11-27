import { useState } from 'react'
import { motion } from 'framer-motion'
import { SITE, CONTACTS, igLink, tgLink } from '../config/site.js'
import { SERVICES } from '../data/services.js'
import { BrandIcon } from './Brand.jsx'
import { XpWindow } from './Xp.jsx'
import { reveal } from '../lib/motion.js'

// Quick message buttons: Instagram DM and Telegram.
export function DirectButtons({ className = '', compact = false }) {
  return (
    <div className={`flex flex-wrap gap-3 ${className}`}>
      <a className="xp-btn xp-btn-lg" href={igLink} target="_blank" rel="noopener">
        <BrandIcon name="instagram" size={20} /> {compact ? 'Instagram' : 'DM on Instagram'}
      </a>
      <a className="xp-btn xp-btn-lg" href={tgLink} target="_blank" rel="noopener">
        <BrandIcon name="telegram" size={20} /> {compact ? 'Telegram' : 'Message on Telegram'}
      </a>
    </div>
  )
}

export function EnquiryForm({ defaultService = '' }) {
  const [state, setState] = useState('idle') // idle | sending | sent | error
  async function onSubmit(e) {
    e.preventDefault()
    const form = e.currentTarget
    setState('sending')
    try {
      const res = await fetch(`https://formspree.io/f/${SITE.formspreeId}`, {
        method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' },
      })
      setState(res.ok ? 'sent' : 'error')
      if (res.ok) form.reset()
    } catch { setState('error') }
  }
  if (state === 'sent') {
    return (
      <div className="xp-panel p-8 text-center" role="status">
        <p className="pixel text-3xl text-[#003399]">Thank you, we'll get back to you ASAP</p>
      </div>
    )
  }
  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <input type="hidden" name="_subject" value="New project enquiry: Singing Cloud Project" />
      <input type="text" name="_gotcha" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="xp-label">Your name
          <input required name="name" autoComplete="name" className="xp-input" placeholder="First name is fine" />
        </label>
        <label className="xp-label">Email
          <input required type="email" name="email" autoComplete="email" className="xp-input" placeholder="So I can reply" />
        </label>
      </div>
      <label className="xp-label">What do you need?
        <select name="service" defaultValue={defaultService} className="xp-input">
          <option value="">Not sure yet, let’s talk</option>
          {SERVICES.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
        </select>
      </label>
      <label className="xp-label">Tell me about your project
        <textarea required name="message" rows={4} className="xp-input" placeholder="Your business, what you’d like to make, and any deadline" />
      </label>
      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" className="xp-btn xp-btn-lg xp-btn-default" disabled={state === 'sending'}>
          {state === 'sending' ? 'Sending…' : 'Send my enquiry'}
        </button>
        {state === 'error' && (
          <p className="text-sm text-[#b00000]" role="alert">That didn’t send. Please try again, or email <a className="underline" href={`mailto:${SITE.email}`}>{SITE.email}</a>.</p>
        )}
      </div>
    </form>
  )
}

export function ContactLinks({ className = '' }) {
  return (
    <ul className={`grid gap-2 ${className}`}>
      {CONTACTS.map((c) => (
        <li key={c.id}>
          <a className="xp-link inline-flex items-center gap-2.5" href={c.href} target="_blank" rel="noopener">
            <BrandIcon name={c.id} size={22} /> <span><b>{c.label}</b> {c.handle}</span>
          </a>
        </li>
      ))}
      <li><a className="xp-link inline-flex items-center gap-2.5" href={`mailto:${SITE.email}`}><span aria-hidden="true" className="inline-block w-[22px] text-center text-lg">✉</span> <span><b>Email</b> {SITE.email}</span></a></li>
    </ul>
  )
}

export function ContactSection({ service, title = 'Let’s make something unforgettable.' }) {
  return (
    <section id="contact" className="relative py-20 sm:py-28" aria-labelledby="contact-title">
      <div className="wrap">
        <motion.div {...reveal}>
          <XpWindow title="New Message - Singing Cloud Project" bodyClassName="grid gap-10 p-5 sm:p-8 lg:grid-cols-[1fr_1.15fr] lg:gap-14">
            <div>
              <p className="xp-kicker">Start your project</p>
              <h2 id="contact-title" className="pixel mt-3 text-4xl leading-tight text-[#003399] sm:text-5xl">{title}</h2>
              <p className="mt-4 max-w-md text-[17px] text-[#222]">Tell me what you have in mind. I’ll reply with ideas and the next steps. The first chat is free.</p>
              <DirectButtons className="mt-6" />
              <ContactLinks className="mt-6" />
            </div>
            <EnquiryForm defaultService={service?.name || ''} />
          </XpWindow>
        </motion.div>
      </div>
    </section>
  )
}
