# SEO report — singing-cloud-studio (English + Persian)

Date: 3 November 2026 · Status: **online at https://singingcloudproject.github.io/ but hidden from Google with "noindex"** (see "Going live" below)

## Keywords chosen
Picked from real searches and how competitors (freelancers, agencies, job ads) describe these services. Used naturally in the title, headline, intro and service cards — not repeated over and over.

**English**
- website design for small businesses · website design and support
- SEO / get found on Google
- social media management for Instagram, TikTok and YouTube
- Instagram carousels · reels / video editing
- logo design and visual identity
- AI photos and videos · AI-generated video
- AI chatbot · Instagram and WhatsApp auto-replies

**Persian (فارسی)**
- طراحی سایت (website design) · پشتیبانی سایت (website support)
- سئو سایت (website SEO)
- ادمین اینستاگرام (Instagram admin — the most common way Persian speakers search for social media management) · مدیریت پیج (page management)
- تولید محتوا (content creation)
- طراحی لوگو و هویت بصری (logo design & visual identity)
- عکس و ویدیو با هوش مصنوعی (AI photos & videos)
- ربات پاسخگوی خودکار / پاسخ خودکار اینستاگرام و واتس‌اپ (auto-reply bot)

## What changed
**On-page**
- Titles: "Website Design, SEO & Social Media | Singing Cloud Studio" / "طراحی سایت، سئو و ادمین اینستاگرام | استودیو سینگینگ کلاد" (both under 60 characters).
- Descriptions (under 160 characters) listing the main services.
- Headline line under the brand name and the opening paragraph now name the services people search for.
- Service card texts lightly reworded with the keywords; Persian card names now match search wording (e.g. "طراحی سایت", "سئو سایت", "ادمین شبکه‌های اجتماعی", "طراحی لوگو و گرافیک"). The contact form's "What do you need?" list was updated to match.
- The singing cloud now has a proper description for Google and screen readers ("Singing Cloud Studio logo: a glossy blue cloud singing").

**Honest content (nothing invented)**
- Stats are now **6 services · 2 languages · 24h average reply** (removed "50+ projects done" and "30+ happy clients").
- Package contents no longer contain made-up quantities ("4 reels per month" etc. became "Edited reels every month"). They are still marked as placeholders — please edit them to your real offer.
- The empty placeholder testimonial is **hidden** until you have a real one (it would have looked like a fake review). To show it again, move `"testimonials"` from `hidden_sections` back into `sections` in `content/site.json`.

**Technical**
- `noindex` on every page (switch: `"noindex": true` in `content/site.json`).
- Canonical links, `hreflang` (en, fa, x-default) and sitemap with alternate-language links and today's date.
- Open Graph + Twitter/X tags with a new 1200×630 sharing image (`assets/og-image.jpg`) and the other language listed as an alternate.
- Structured data: `ProfessionalService` (the studio, its 6 services, languages), `WebSite` and `WebPage`.
- robots.txt allows crawling on purpose (Google must be able to read the page to see "noindex").
- Already fast: animation only uses transform/opacity, pauses off-screen; images are small; fonts load with `display=swap`.

## Going live — checklist
1. Set your real web address in `content/site.json` → `"site_url"` (now `https://singingcloudproject.github.io/`).
2. Set `"noindex": false`, then run `python build.py`.
3. Add the site to Google Search Console and submit `sitemap.xml`.
4. Optional: check real search volumes for the Persian keywords in Google Keyword Planner.
