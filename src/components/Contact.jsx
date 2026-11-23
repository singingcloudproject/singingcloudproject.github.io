import { useState } from 'react'
import { motion } from 'framer-motion'
import { SITE, waLink, igLink } from '../config/site.js'
import { SERVICES } from '../data/services.js'
import { BrandIcon } from './Brand.jsx'
import { reveal } from '../lib/motion.js'

// WhatsApp (when the number is set) or Instagram DM, plus email.
export function DirectButtons({ message, className = '', compact = false }) {
  const wa = waLink(message)
  return (
    <div className={`flex flex-wrap gap-3 ${className}`}>
      {wa && (
        <a className="btn btn-ghost" href={wa} target="_blank" rel="noopener">
          <BrandIcon name="whatsapp" size={20} /> {compact ? 'WhatsApp' : 'Message on WhatsApp'}
        </a>
      )}
      <a className="btn btn-ghost" href={igLink} target="_blank" rel="noopener">
        <BrandIcon name="instagram" size={20} /> {compact ? 'Instagram' : 'DM on Instagram'}
      </a>
    </div>
  )
}

export function EnquiryForm({ defaultService = '' }) {
  const [state, setState] = useState('idle') // idle | sending | sent | error
  async function onSubmit(e) {
    e.preventDefault()
    setState('sending')
    try {
      const res = await fetch(`https://formspree.io/f/${SITE.formspreeId}`, {
        method: 'POST', body: new FormData(e.currentTarget), headers: { Accept: 'application/json' },
      })
      setState(res.ok ? 'sent' : 'error')
      if (res.ok) e.currentTarget?.reset?.()
    } catch { setState('error') }
  }
  if (state === 'sent') {
    return (
      <div className="glass rounded-3xl p-8 text-center" role="status">
        <p className="display text-4xl">Thank you.</p>
        <p className="mt-3 text-mute">Your message is on its way to the studio. You’ll get a reply by email.</p>
      </div>
    )
  }
  const field = 'w-full rounded-2xl border border-line bg-night/60 px-4 py-3.5 text-ink placeholder:text-mute/70 outline-none transition-[border-color] duration-200 focus:border-sky'
  return (
    <form onSubmit={onSubmit} className="glass grid gap-4 rounded-3xl p-5 sm:p-8">
      <input type="hidden" name="_subject" value="New project enquiry: Singing Cloud Studio" />
      <input type="text" name="_gotcha" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1.5 text-sm font-medium">Your name
          <input required name="name" autoComplete="name" className={field} placeholder="First name is fine" />
        </label>
        <label className="grid gap-1.5 text-sm font-medium">Email
          <input required type="email" name="email" autoComplete="email" className={field} placeholder="So I can reply" />
        </label>
      </div>
      <label className="grid gap-1.5 text-sm font-medium">What do you need?
        <select name="service" defaultValue={defaultService} className={field}>
          <option value="">Not sure yet, let’s talk</option>
          {SERVICES.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
        </select>
      </label>
      <label className="grid gap-1.5 text-sm font-medium">Tell me about your project
        <textarea required name="message" rows={4} className={field} placeholder="Your business, what you’d like to make, and any deadline" />
      </label>
      <button type="submit" className="btn btn-primary mt-1 w-full sm:w-auto sm:justify-self-start" disabled={state === 'sending'}>
        {state === 'sending' ? 'Sending…' : 'Send my enquiry'}
      </button>
      {state === 'error' && (
        <p className="text-sm text-gold" role="alert">That didn’t send. Please try again, or email <a className="underline" href={`mailto:${SITE.email}`}>{SITE.email}</a>.</p>
      )}
    </form>
  )
}

export function ContactSection({ service, title = 'Let’s make something unforgettable.' }) {
  return (
    <section id="contact" className="relative overflow-hidden py-24 sm:py-32" aria-labelledby="contact-title">
      <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-0 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-sky-deep/20 blur-[120px]" />
      <div className="wrap relative grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
        <motion.div {...reveal}>
          <p className="kicker">Start your project</p>
          <h2 id="contact-title" className="display mt-4 text-5xl sm:text-6xl">{title}</h2>
          <p className="mt-5 max-w-md text-lg text-mute">Tell me what you have in mind. I’ll reply with ideas, a clear price and the next steps. The first chat is free.</p>
          <DirectButtons message={service?.message} className="mt-8" />
          <p className="mt-6 text-mute">Or email <a className="text-ink underline decoration-sky/50 underline-offset-4 hover:decoration-sky" href={`mailto:${SITE.email}`}>{SITE.email}</a></p>
        </motion.div>
        <motion.div {...reveal} transition={{ ...reveal.transition, delay: 0.1 }}>
          <EnquiryForm defaultService={service?.name || ''} />
        </motion.div>
      </div>
    </section>
  )
}
