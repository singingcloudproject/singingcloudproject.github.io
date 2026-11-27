// Runs after `vite build` (part of `npm run build`).
// GitHub Pages only knows real files, so every page gets its own index.html (answers "200 OK" to Google,
// with its own title, description and canonical address), plus sitemap.xml and a 404 page that Google skips.
import fs from 'node:fs'
import path from 'node:path'
import { SERVICES } from '../src/data/services.js'

const SITE = 'https://singingcloudproject.com'
const DIST = path.resolve(import.meta.dirname, '..', 'dist')
const base = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8')
const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')

const pages = [
  { route: '/', title: 'Singing Cloud Project · Websites, AI assistants & product ads', description: null, priority: '1.0' },
  ...SERVICES.map((s) => ({ route: `/services/${s.slug}/`, title: `${s.name} · Singing Cloud Project`, description: `${s.headline} ${s.pitch}`, priority: '0.9' })),
  { route: '/work/', title: 'Work · Singing Cloud Project', description: 'Product videos, AI product photos, ad campaigns and websites made by Singing Cloud Project.', priority: '0.8' },
  { route: '/contact/', title: 'Contact · Singing Cloud Project', description: 'Start your project with Singing Cloud Project: message on Instagram or Telegram, or send the form.', priority: '0.7' },
]

function page({ route, title, description }) {
  let html = base
    .replace(/<title>.*?<\/title>/, `<title>${esc(title)}</title>`)
    .replace(/<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${SITE}${route}" />`)
    .replace(/<meta property="og:url" content="[^"]*" \/>/, `<meta property="og:url" content="${SITE}${route}" />`)
    .replace(/<meta property="og:title" content="[^"]*" \/>/, `<meta property="og:title" content="${esc(title)}" />`)
  if (description) {
    html = html
      .replace(/<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${esc(description)}" />`)
      .replace(/<meta property="og:description" content="[^"]*" \/>/, `<meta property="og:description" content="${esc(description)}" />`)
  }
  return html
}

for (const p of pages) {
  const dir = path.join(DIST, p.route)
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(path.join(dir, 'index.html'), page(p))
}

// unknown addresses: still show the site (the app shows "page not found"), but keep them out of Google
fs.writeFileSync(path.join(DIST, '404.html'), base
  .replace(/<meta name="robots" content="[^"]*" \/>/, '<meta name="robots" content="noindex" />')
  .replace(/\s*<link rel="canonical" href="[^"]*" \/>/, ''))

const today = new Date().toISOString().slice(0, 10)
fs.writeFileSync(path.join(DIST, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${
    pages.map((p) => `  <url><loc>${SITE}${p.route}</loc><lastmod>${today}</lastmod><priority>${p.priority}</priority></url>`).join('\n')
  }\n</urlset>\n`)

// self-check: every page file exists and has the right canonical address
for (const p of pages) {
  const html = fs.readFileSync(path.join(DIST, p.route, 'index.html'), 'utf8')
  if (!html.includes(`<link rel="canonical" href="${SITE}${p.route}" />`)) throw new Error(`canonical missing on ${p.route}`)
}
console.log(`Pages: ${pages.map((p) => p.route).join(', ')} + sitemap.xml + 404.html`)
