# Singing Cloud Studio — website

A one-page website in English (main) and Persian (right-to-left). Armenian can be added later.
Nothing has been uploaded yet — it all lives in this folder on your computer.

## What's in this folder

| File / folder | What it is | Do you edit it? |
|---|---|---|
| `content/en.json`, `fa.json` | **All the words on the site**, one file per language | ✅ Yes — this is where you change text |
| `content/site.json` | Settings: WhatsApp number, Formspree form ID, website address, languages | ✅ Yes |
| `assets/styles.css` | The look: colours, fonts, animations | Only if you want to change the design |
| `assets/script.js` | The motion: starry sky, scroll animations, counting numbers, parallax, sending the form | No |
| `logo.png` | Your 3D cloud logo, converted to a real PNG (original background kept) | No |
| `assets/logo-header.*`, `logo-hero.png` | The logo with the background removed: small (header/footer) and large (shown to Google) | No |
| `mascot.py` | Draws the singing cloud in the hero as layers (body, shine, mouth) so the mouth can move | Only to change its look |
| `assets/icons/color/` | The brands' official full-colour logo files that orbit the cloud | No |
| `assets/favicon-32.png`, `favicon-180.png` | The browser-tab icon and the phone home-screen icon | No |
| `build.py` | The "page builder": turns the text files into web pages | No |
| `index.html`, `fa/index.html` | The finished pages (made by `build.py`) | ❌ No — they get overwritten |
| `sitemap.xml`, `robots.txt` | Help Google find all three languages | No (made by `build.py`) |

## How to change text

1. Open `content/en.json` (or `fa.json`) in Notepad or VS Code.
2. Change only the words **inside the quotes on the right side**, e.g.
   `"title": "What I create for you"` → `"title": "What I make for you"`.
   Keep the quotes, commas and brackets exactly as they are.
3. Open a terminal in this folder and run:

   ```bash
   python build.py
   ```

4. Double-click `index.html` to see the result in your browser.

Anything in `[square brackets]` is a placeholder for you to replace.
The Persian text is a **draft translation — please check it**.

The language buttons link straight to each page's `index.html` file (e.g. `fa/index.html`), so switching languages works when you open the site by double-clicking, as well as once it's online.

## Things to fill in before going live (`content/site.json`)

- **`whatsapp_number`** — your WhatsApp Business number, digits only with country code, no `+` or spaces (e.g. `374XXXXXXXX`).
- **`formspree_id`** — create a free form at formspree.io; it gives you an address like `https://formspree.io/f/abcdwxyz`. Put just the last part (`abcdwxyz`) here. Until then, the form politely tells visitors to use WhatsApp.
- **`site_url`** — your real web address once you have one (used by Google).

## Adding your showreel video

Either:
- **YouTube** (easiest, fastest): upload it (it can be "Unlisted"), copy the code at the end of the link — for `https://youtu.be/AbC123xyz` that's `AbC123xyz` — and put it in `content/site.json` as `"showreel_youtube_id": "AbC123xyz"`.
- **Your own file:** make a folder called `videos`, put the file in it, and set `"showreel_video": "videos/showreel.mp4"`. Keep it small (under ~20 MB) so phones load it quickly.

## Changing the counting numbers

In each language file, under `"showreel"` → `"stats"`, change `"value"` (must be a plain number, e.g. `50`) and `"suffix"` (e.g. `"+"`). The numbers count up from 0 when a visitor scrolls to them. In Persian they appear with Persian digits automatically.

## Packages

Under `"packages"` in each language file. There are no prices or payments on the site — the buttons say "Ask for a quote" and jump to the contact form. `"featured": true` makes a package the dark, highlighted "Most popular" one.

## Adding portfolio images

1. Make a folder called `images` here and put your picture in it, e.g. `images/brother-nature.jpg`.
2. In each language file, find the portfolio item and add an `"image"` line:
   `{ "title": "...", "tag": "...", "alt": "...", "image": "images/brother-nature.jpg" }`
3. Write a good `alt` (a short description of the picture) in each language — it helps Google and blind visitors.
4. Run `python build.py`.

The testimonial has a round space for the client's photo: add `"photo": "images/client.jpg"` next to `"photo_alt"`.

## The logo

The logo came from `Logo.pnj` (really a JPEG photo, 512 × 279 px). The white background was removed and web versions were made from it.
The cloud itself is only about 250 px wide, so it can look slightly soft on large, sharp screens. **If you have a bigger version (ideally 1000 px wide or more, PNG), send it and the logo files can be re-made much crisper.**

## About the animations

- **The singing cloud:** in the hero, the logo is redrawn as layers so its mouth can move. It sings a little looping melody (about 15 seconds): wide "ah", round "oh" and nearly-closed "mm" shapes, long held notes and quick phrases. On big notes it stretches up, leans back, gets a light vibrato and its blue glow brightens; between phrases it squashes down a little. It floats and sways the whole time. To change the melody, edit `MELODY` in `assets/script.js`.
- **Orbiting icons:** Instagram, TikTok, YouTube, X, Google, Facebook, Telegram, WhatsApp, Claude, ChatGPT and Grok drift slowly around the cloud on a tilted oval, passing behind and in front of it. Each is the brand's own full-colour logo, unchanged, on a small white badge (so black logos like X, ChatGPT and Grok stay visible on the dark sky). They are decoration only (no text suggests any partnership).
- **Scrolling:** the hero fades and drifts upward as you scroll down; sections fade in as they appear.
- The cloud and icons pause when the hero is off screen or the tab is hidden.
- Stars and soft light slowly move behind the hero (they pause when you scroll away, to save phone battery).
- The headline appears word by word; sections and cards slide in one after another as you scroll.
- Parallax (photos moving slightly slower than the page) is switched off on phones to keep them smooth.
- If a visitor has **"Reduce motion"** turned on in their phone or computer settings, all animation stops and the page simply shows everything, still.

## Logo credits

The orbiting logos are the brands' official full-colour logo files, collected from the open [logos](https://github.com/gilbarbara/logos) set (CC0); the current Instagram gradient logo comes from [svgl](https://svgl.app). They are shown unchanged — no recolouring, reshaping or stretching. The logos are trademarks of their owners.

## Adding Armenian later

1. Copy `content/en.json` to `content/hy.json` and translate it.
2. In `content/site.json`, change Armenian's `"enabled": false` to `"enabled": true`.
3. Run `python build.py` — a new `hy/` page appears and the language switcher shows ՀՅ.
   (The fonts already used support Armenian letters only partly; ask Claude to add an Armenian font at that point.)
