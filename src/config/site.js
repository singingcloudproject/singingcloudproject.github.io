// ─────────────────────────────────────────────────────────────
// SITE SETTINGS: contact details and switches. Edit here.
// ─────────────────────────────────────────────────────────────
export const SITE = {
  name: 'Singing Cloud Project',
  url: 'https://singingcloudproject.com/',
  email: 'singingcloudstudio@outlook.com',
  instagram: 'singingcloudstudio',
  telegram: 'singingcloudstudio',
  youtubeChannel: 'UCcuXMC1Ovg2Qm6cCFlelEHQ',
  formspreeId: 'mzeeydoz',

  // Black Friday offer: shown until the end of this day (visitor's own clock), then it disappears by itself.
  offerEnds: new Date(2026, 11, 7, 23, 59, 59),

  // Draft mode keeps the site hidden from Google ("noindex"). Set to false only when approved.
  isDraft: true,
}

export const igLink = `https://ig.me/m/${SITE.instagram}`
export const igProfile = `https://www.instagram.com/${SITE.instagram}/`
export const tgLink = `https://t.me/${SITE.telegram}`
export const ytLink = `https://www.youtube.com/channel/${SITE.youtubeChannel}`

export const CONTACTS = [
  { id: 'instagram', label: 'Instagram', handle: `@${SITE.instagram}`, href: igProfile },
  { id: 'telegram', label: 'Telegram', handle: `@${SITE.telegram}`, href: tgLink },
  { id: 'youtube', label: 'YouTube', handle: 'Singing Cloud Project', href: ytLink },
]
