// ─────────────────────────────────────────────────────────────
// SITE SETTINGS: contact details and switches. Edit here.
// ─────────────────────────────────────────────────────────────
export const SITE = {
  name: 'Singing Cloud Project',
  url: 'https://singingcloudproject.com/',
  email: 'singingcloudstudio@outlook.com',
  instagram: 'singingcloudstudio',
  formspreeId: 'mzeeydoz',

  // WhatsApp: digits only, with country code, no "+" or spaces (e.g. '447700900123').
  // While this is empty, the WhatsApp buttons are hidden and Instagram DM is shown instead.
  whatsapp: '',
  whatsappMessage: 'Hi Singing Cloud Project! I’d like to talk about a project.',

  // Draft mode keeps the site hidden from Google ("noindex"). Set to false only when approved.
  isDraft: true,
}

export const waLink = (msg = SITE.whatsappMessage) =>
  SITE.whatsapp ? `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(msg)}` : null
export const igLink = `https://ig.me/m/${SITE.instagram}`
export const igProfile = `https://www.instagram.com/${SITE.instagram}/`
