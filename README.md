# Singing Cloud Project: website

The Singing Cloud Project website: a 3D "Step into the Cloud Studio" entrance, five service pages, a filterable portfolio, a web design showcase and a contact form.
Live at **https://singingcloudproject.com/**. It's a **draft**, hidden from Google ("noindex"), until you approve the final version.

## What's where

| You want to change… | Edit this file |
|---|---|
| Email, Instagram, **WhatsApp number**, Formspree form, draft mode | `src/config/site.js` |
| Service texts, “who it’s for”, **prices** | `src/data/services.js` |
| Portfolio pieces (titles, labels, which service pages show them) | `src/data/portfolio.js` |
| Colours and fonts | `src/index.css` (top `@theme` block) and `index.html` (Google Fonts link) |
| The 3D studio (screens, objects, hotspots) | `src/three/Studio.jsx` |

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

**Going live for real (when you approve):** set `isDraft: false` in `src/config/site.js`, remove the `noindex` line in `index.html`, and change `public/robots.txt` to `Allow: /`.

## Good to know
- **Phones first:** the 3D studio loads only on the home page. Phones that are too weak (or without 3D support), "save data" mode and "reduce motion" all get a calm still version instead.
- **No sound anywhere:** portfolio videos are silent.
- **Honest labels:** "Concept" means the studio's own creative work. Pieces showing a real brand say "Concept piece — not affiliated with [brand]".
- The 3D pauses when you scroll away or switch tabs, to save battery.
