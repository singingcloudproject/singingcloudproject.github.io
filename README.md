# Singing Cloud Project: website

The Singing Cloud Project website: a video hero ("Step into the Cloud Studio"), five service pages, a filterable portfolio, a web design showcase and a contact form.
Live at **https://singingcloudproject.com/** and open to Google since 27 Nov 2026 (sitemap: /sitemap.xml).

## What's where

| You want to change… | Edit this file |
|---|---|
| Email, Instagram, **WhatsApp number**, Formspree form, draft mode | `src/config/site.js` |
| Service texts, “who it’s for”, **prices** | `src/data/services.js` |
| Portfolio pieces (titles, labels, which service pages show them) | `src/data/portfolio.js` |
| Colours and fonts | `src/index.css` (top `@theme` block) and `index.html` (Google Fonts link) |
| The home page hero video | `media-source/hero/vertical.mp4` + `horizontal.mp4`, then `npm run hero` (see below) |

### Add your WhatsApp number
Open `src/config/site.js` and put your number in `whatsapp: ''`, using digits only with the country code (for example `'447700900123'`). Then publish. All WhatsApp buttons appear automatically. Until then, Instagram DM buttons are shown instead.

### Add new portfolio work
1. Put the original file in `media-source/` (for example `media-source/videos/new-ad.mp4`). This folder never goes online.
2. Add an entry in `src/data/portfolio.js` (copy one that's similar).
3. Run `npm run media`. It makes small, fast web copies in `public/media/`.

### Add a new website to the Web Design section
1. Run `npm run capture -- https://your-site-address name` to take phone and desktop screenshots and a scrolling preview.
2. Copy the jewelry entry at the bottom of `src/data/portfolio.js` and change the name, link, text and tags.

## Run it on your computer

```powershell
npm install
```

```powershell
npm run dev
```

Then open http://localhost:5173.

## Publish

```powershell
npm run deploy
```

This builds the site and puts it on GitHub Pages (account **singingcloudproject**). It's live about a minute later. The code itself is kept on the `source` branch of the same repository.

**Pages for Google:** `npm run build` also writes one HTML file per page, `sitemap.xml` and a no-index `404.html` (`scripts/prerender-routes.mjs`). Add a new page there too.

## Good to know
- **Phones first:** the hero is a muted looping video (9:16 on phones, 16:9 on laptops) with a poster image, so something shows instantly even when a phone won't play video. "Save data" and "reduce motion" get the still poster.
- **No sound anywhere:** portfolio videos are silent.
- **Honest labels:** "Concept" means the studio's own creative work. Pieces showing a real brand say "Concept piece — not affiliated with [brand]".
- The hero video pauses when you scroll away or switch tabs, to save battery.

### Change the hero video
1. Put your phone video (9:16) in `media-source/hero/` named `vertical` (for example `vertical.mp4` or `vertical.mov`), and your laptop video (16:9) there named `horizontal`.
2. Run `npm run hero`. It trims to 12 seconds, removes sound, and makes small MP4 + WebM copies and a poster image in `public/media/hero/`.
3. Publish with `npm run deploy`. If a file is missing, a placeholder is used instead.
