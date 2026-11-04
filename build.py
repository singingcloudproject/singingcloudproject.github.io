#!/usr/bin/env python3
"""
Page builder for the Singing Cloud Studio website.

It reads:
  content/site.json      -> settings (website address, WhatsApp number, Formspree ID,
                            languages, section order, photo/video files)
  content/<lang>.json    -> all the words on the page, one file per language

and writes the finished pages:
  index.html             -> English (main language)
  fa/index.html          -> Persian (right-to-left)
  ru/index.html          -> Russian
  sitemap.xml, robots.txt

Run it after every change:   python build.py
"""
import html
import json
import pathlib
import re
import urllib.parse

from mascot import mascot_svg  # the layered, animatable singing cloud for the hero

ROOT = pathlib.Path(__file__).resolve().parent
CONTENT = ROOT / "content"

# Brand logos that orbit the singing cloud: the official full-colour logo files in assets/icons/color/
# (collected from the CC0 "logos" set by gilbarbara; Instagram's current gradient logo via svgl.app).
# Purely decorative — trademarks belong to their owners.
ORBIT_ICONS = ["instagram", "tiktok", "youtube", "x", "google", "facebook",
               "telegram", "whatsapp", "claude", "chatgpt", "grok"]


def e(text):
    """Make text safe to put inside HTML."""
    return html.escape(str(text), quote=True)


# ---------------------------------------------------------------- logo
# The logo is the 3D singing cloud image (made from logo.png, background removed).
# WebP is the small, fast version; PNG is the fallback for older browsers.
def logo(prefix):
    """Small logo for the header and footer (the brand name next to it is the text)."""
    return (f'<picture><source srcset="{prefix}assets/logo-header.webp" type="image/webp">'
            f'<img class="logo" src="{prefix}assets/logo-header.png" alt="" width="48" height="35" decoding="async"></picture>')


def orbit_icons(prefix):
    """The brands' own full-colour logo files, shown unchanged on small white badges.
    The files are used as images (not redrawn), so their colours and shapes stay exactly as published;
    "object-fit: contain" in styles.css keeps their proportions (no stretching)."""
    out = ""
    for name in ORBIT_ICONS:
        src = (ROOT / "assets" / "icons" / "color" / f"{name}.svg").read_text(encoding="utf-8")
        vb = [float(v) for v in re.search(r'viewBox="([^"]+)"', src).group(1).split()]
        out += (f'<span class="orb"><img src="{prefix}assets/icons/color/{name}.svg" alt="" '
                f'width="{round(vb[2])}" height="{round(vb[3])}" decoding="async" draggable="false"></span>')
    return out


def hero_logo(alt, prefix):
    """The singing cloud with its glow and the orbit of logos (animated in assets/script.js)."""
    return (
        '<div class="logo-stage">'
        '<span class="art-glow" aria-hidden="true"></span>'
        f'<div class="orbit" aria-hidden="true">{orbit_icons(prefix)}</div>'
        f"{mascot_svg(e(alt))}"
        "</div>"
    )


# ---------------------------------------------------------------- icons
ICONS = {
    "film": '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 4v16M17 4v16M3 9h4M3 15h4M17 9h4M17 15h4"/>',
    "sparkles": '<path d="M11 3l1.8 5.2L18 10l-5.2 1.8L11 17l-1.8-5.2L4 10l5.2-1.8z"/><path d="M19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8z"/>',
    "pen": '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13 7 4 4"/>',
    "carousel": '<rect x="2" y="6" width="5" height="12" rx="1.5"/><rect x="8.5" y="4" width="7" height="16" rx="1.5"/><rect x="17" y="6" width="5" height="12" rx="1.5"/>',
    "globe": '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
    "music": '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
    "heart": '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
    "cap": '<path d="m2 9 10-5 10 5-10 5z"/><path d="M6 11v5c3 2 9 2 12 0v-5"/>',
    "building": '<rect x="4" y="3" width="16" height="18" rx="1"/><path d="M9 7h1M14 7h1M9 11h1M14 11h1M9 15h1M14 15h1M10 21v-3h4v3"/>',
    "check": '<path d="m5 12 5 5 9-10"/>',
    "play": '<path d="M8 5v14l11-7z" fill="currentColor" stroke="none"/>',
    "image": '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-9 9"/>',
    "user": '<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>',
    "quote": '<path d="M7 17c-2 0-3-1.5-3-3.5C4 10 6 7 9 6M17 17c-2 0-3-1.5-3-3.5 0-3.5 2-6.5 5-7.5"/>',
    "arrow": '<path d="M12 5v14M6 13l6 6 6-6"/>',
    "arrow-side": '<path d="M5 12h14M13 6l6 6-6 6"/>',
    "browser": '<rect x="3" y="4" width="18" height="16" rx="2.5"/><path d="M3 9h18M6.5 6.5h.01M9 6.5h.01"/><path d="m9 13-2 2 2 2M15 13l2 2-2 2"/>',
    "search": '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m20 20-4.8-4.8"/><path d="M8 11.5l2-2 1.5 1.5L14 8.5"/>',
    "social": '<rect x="6" y="2.5" width="12" height="19" rx="3"/><path d="M10.5 18.5h3"/><path d="M12 13.6s-3-1.9-3-4.1a1.7 1.7 0 0 1 3-1.1 1.7 1.7 0 0 1 3 1.1c0 2.2-3 4.1-3 4.1z"/>',
    "palette": '<path d="M12 3a9 9 0 1 0 0 18c1.4 0 2-1 2-2 0-1.4-1.2-1.7-1.2-3 0-1.1.9-2 2-2H17a4 4 0 0 0 4-4c0-3.9-4-7-9-7z"/><circle cx="7.5" cy="11" r="1.2"/><circle cx="10" cy="7" r="1.2"/><circle cx="15" cy="7.5" r="1.2"/>',
    "bot": '<rect x="4" y="8" width="16" height="12" rx="3"/><path d="M12 8V4.5M9 13.5h.01M15 13.5h.01M9.5 17h5M2 13v2M22 13v2"/><circle cx="12" cy="3.5" r="1"/>',
    "whatsapp": '<path d="M20.5 11.6a8.4 8.4 0 0 1-12.4 7.4L3.5 20.5 5 16.1a8.4 8.4 0 1 1 15.5-4.5z"/><path d="M9 8.5c0 3.5 3 6.5 6.5 6.5l1-1.6-2-1-1 .8a5 5 0 0 1-2.7-2.7l.8-1-1-2z" fill="currentColor" stroke="none"/>',
}


def icon(name, cls="icon"):
    return f'<svg class="{cls}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">{ICONS.get(name, ICONS["sparkles"])}</svg>'


# ---------------------------------------------------------------- helpers
def head_block(t, align=""):
    out = f'<div class="section-head {align}">'
    if t.get("kicker"):
        out += f'<p class="kicker reveal">{e(t["kicker"])}</p>'
    out += f'<h2 class="reveal">{e(t["title"])}</h2>'
    if t.get("intro"):
        out += f'<p class="lead reveal">{e(t["intro"])}</p>'
    return out + "</div>"


def placeholder(alt, label, icon_name="image", cls=""):
    """An empty, clearly-marked space where a photo or video will go later."""
    return (
        f'<div class="ph {cls}" role="img" aria-label="{e(alt)}">'
        f'{icon(icon_name, "ph-icon")}<span>{e(label)}</span></div>'
    )


def words(text, start=0):
    """Wrap each word so the headline can reveal word by word."""
    out = []
    for i, w in enumerate(str(text).split()):
        out.append(f'<span class="w" style="--i:{start + i}"><span>{e(w)}</span></span>')
    return " ".join(out), start + len(out)


# ---------------------------------------------------------------- sections
def s_hero(sec, t, ctx):
    main, n = words(t["title"])
    sub, n = words(t.get("title_sub", ""), n)
    badges = "".join(f"<li>{icon('check')}{e(b)}</li>" for b in t.get("badges", []))
    return f"""
<section class="hero dark" id="top">
  <div class="hero-bg" aria-hidden="true">
    <span class="aurora a1"></span><span class="aurora a2"></span><span class="aurora a3"></span>
    <canvas class="stars"></canvas>
    <span class="grid-lines"></span>
  </div>
  <div class="container hero-grid">
    <div class="hero-copy">
      <p class="kicker reveal">{e(t.get("eyebrow", ""))}</p>
      <h1 class="headline" aria-label="{e(" — ".join(x for x in (t["title"], t.get("title_sub", "")) if x))}">
        <span class="h1-main" aria-hidden="true">{main}</span>
        <span class="h1-sub" aria-hidden="true">{sub}</span>
      </h1>
      <p class="lead reveal" style="--d:900ms">{e(t["subtitle"])}</p>
      <div class="hero-actions reveal" style="--d:1050ms">
        <a class="btn btn-gold" href="#contact">{e(t["cta"])}</a>
        <a class="btn btn-glass" href="#{e(t.get("secondary_target", "services"))}">{e(t.get("secondary", ""))}</a>
      </div>
      <ul class="badges reveal" style="--d:1200ms">{badges}</ul>
    </div>
    <div class="hero-art reveal-zoom" style="--d:200ms">
      {hero_logo(t.get("logo_alt", t["title"]), ctx["prefix"])}
    </div>
  </div>
  <a class="scroll-cue" href="#{e(t.get("secondary_target", "services"))}" aria-label="{e(t.get("secondary", ""))}">{icon("arrow")}</a>
</section>"""


def s_cards(sec, t, ctx):
    cards = ""
    for it in t["items"]:
        # optional button on each card (used by Services); it jumps to the form with this service selected
        cta = ""
        if t.get("cta"):
            cta = (f'<a class="btn btn-outline btn-sm card-cta" href="#contact" data-topic="{e(it["name"])}">'
                   f'{e(t["cta"])}{icon("arrow-side", "icon cta-arrow")}</a>')
        cards += f"""
      <article class="card reveal">
        <div class="card-icon">{icon(it.get("icon", "sparkles"))}</div>
        <h3>{e(it["name"])}</h3>
        <p>{e(it["text"])}</p>
        {cta}
      </article>"""
    return f"""
<section class="section {e(sec.get("bg", "light"))}" id="{e(sec["id"])}">
  <div class="container">
    {head_block(t)}
    <div class="cards {e(sec.get("variant", ""))}" data-stagger>{cards}
    </div>
  </div>
</section>"""


def s_showreel(sec, t, ctx):
    cfg = ctx["site"]
    stats = "".join(
        f'<li class="stat reveal"><strong><span class="count" data-count="{int(s["value"])}">{int(s["value"])}</span>'
        f'{e(s.get("suffix", ""))}</strong><span>{e(s["label"])}</span></li>'
        for s in t["stats"]
    )
    if cfg.get("showreel_youtube_id"):
        media = (f'<iframe src="https://www.youtube-nocookie.com/embed/{e(cfg["showreel_youtube_id"])}" title="{e(t["video_label"])}" '
                 'loading="lazy" allow="encrypted-media; picture-in-picture" allowfullscreen></iframe>')
    elif cfg.get("showreel_video"):
        media = (f'<video src="{ctx["prefix"]}{e(cfg["showreel_video"])}" controls playsinline preload="metadata" '
                 f'aria-label="{e(t["video_label"])}"></video>')
    else:
        media = placeholder(t["video_label"], t["video_note"], "play", "video-ph")
    return f"""
<section class="section dark showreel" id="{e(sec["id"])}">
  <div class="hero-bg soft" aria-hidden="true"><span class="aurora a2"></span><span class="aurora a3"></span></div>
  <div class="container">
    {head_block(t)}
    <ul class="stats" data-stagger>{stats}</ul>
    <div class="video-frame reveal-zoom">
      <div class="video" data-parallax="0.06">{media}</div>
    </div>
  </div>
</section>"""


def s_portfolio(sec, t, ctx):
    tiles = ""
    for i, it in enumerate(t["items"]):
        if it.get("image"):
            media = f'<img src="{ctx["prefix"]}{e(it["image"])}" alt="{e(it["alt"])}" loading="lazy" width="800" height="1000">'
        else:
            media = placeholder(it["alt"], t["placeholder_label"], "image")
        tiles += f"""
      <figure class="work reveal {"work-wide" if i == 0 else ""}">
        <div class="work-media"><div class="parallax-inner" data-parallax="0.08">{media}</div></div>
        <figcaption><h3>{e(it["title"])}</h3><p>{e(it.get("tag", ""))}</p></figcaption>
      </figure>"""
    return f"""
<section class="section light" id="{e(sec["id"])}">
  <div class="container">
    {head_block(t)}
    <div class="gallery" data-stagger>{tiles}
    </div>
  </div>
</section>"""


def s_packages(sec, t, ctx):
    """Packages & prices: one card per offer with a "starting from" price in USD.
    "popular": true adds the gold "Most popular" badge."""
    cards = ""
    for it in t["items"]:
        pop = it.get("popular")
        badge = f'<span class="tag-gold pkg-badge">{e(t["popular"])}</span>' if pop else ""
        unit = f'<span class="pkg-unit">{e(it["unit"])}</span>' if it.get("unit") else ""
        note = f'<p class="pkg-note">{e(it["note"])}</p>' if it.get("note") else ""
        cards += f"""
      <article class="card pkg reveal {"popular" if pop else ""}">
        {badge}
        <p class="pkg-cat">{e(it["cat"])}</p>
        <h3>{e(it["name"])}</h3>
        <p class="pkg-price"><span class="pkg-from">{e(t["from"])}</span> <bdi dir="ltr" class="pkg-amount">{e(it["price"])}</bdi> {unit}</p>
        {note}
      </article>"""
    return f"""
<section class="section light tint" id="{e(sec["id"])}">
  <div class="container">
    {head_block(t)}
    <div class="cards pkg-grid" data-stagger>{cards}
    </div>
    <div class="pkg-custom reveal">
      <p>{e(t["custom"])}</p>
      <a class="btn btn-gold" href="#contact">{e(t["custom_cta"])}</a>
    </div>
  </div>
</section>"""


def s_steps(sec, t, ctx):
    steps = ""
    for i, st in enumerate(t["steps"]):
        num = str(i + 1).translate(ctx["digits"])
        steps += f"""
      <li class="step reveal">
        <span class="step-num">{e(num)}</span>
        <h3>{e(st["title"])}</h3>
        <p>{e(st["text"])}</p>
      </li>"""
    return f"""
<section class="section dark" id="{e(sec["id"])}">
  <div class="hero-bg soft" aria-hidden="true"><span class="aurora a1"></span></div>
  <div class="container">
    {head_block(t)}
    <ol class="steps" data-stagger>{steps}
    </ol>
  </div>
</section>"""


def s_testimonials(sec, t, ctx):
    items = ""
    for it in t["items"]:
        if it.get("photo"):
            pic = f'<img class="t-photo" src="{ctx["prefix"]}{e(it["photo"])}" alt="{e(it["photo_alt"])}" loading="lazy" width="96" height="96">'
        else:
            pic = placeholder(it["photo_alt"], "", "user", "t-photo")
        items += f"""
      <figure class="testimonial reveal-zoom">
        {icon("quote", "quote-icon")}
        <blockquote><p>{e(it["quote"])}</p></blockquote>
        <figcaption>{pic}<span><strong>{e(it["name"])}</strong><small>{e(it["role"])}</small></span></figcaption>
      </figure>"""
    return f"""
<section class="section light" id="{e(sec["id"])}">
  <div class="container narrow">
    {head_block(t)}
    {items}
  </div>
</section>"""


def s_contact(sec, t, ctx):
    cfg = ctx["site"]
    f = t["form"]
    wa = f'https://wa.me/{cfg["whatsapp_number"]}?text={urllib.parse.quote(t["whatsapp_text"])}'
    options = "".join(f"<option>{e(o)}</option>" for o in f["topic_options"])
    connected = "YOUR_" not in cfg["formspree_id"]
    return f"""
<section class="section dark contact-section" id="{e(sec["id"])}">
  <div class="hero-bg soft" aria-hidden="true"><span class="aurora a1"></span><span class="aurora a3"></span></div>
  <div class="container contact">
    <div class="contact-text">
      <p class="kicker reveal">{e(t["kicker"])}</p>
      <h2 class="reveal">{e(t["title"])}</h2>
      <p class="lead reveal">{e(t["intro"])}</p>
      <a class="btn btn-whatsapp reveal" href="{e(wa)}" target="_blank" rel="noopener">{icon("whatsapp")}{e(t["whatsapp_btn"])}</a>
      <p class="small reveal">{e(t.get("whatsapp_note", ""))}</p>
    </div>
    <form class="form reveal-right" action="https://formspree.io/f/{e(cfg["formspree_id"])}" method="POST"
          data-connected="{str(connected).lower()}" data-sending="{e(f["sending"])}" data-success="{e(f["success"])}"
          data-error="{e(f["error"])}" data-not-connected="{e(f["not_connected"])}">
      <p class="form-or">{e(t["or"])}</p>
      <input type="hidden" name="_subject" value="{e(f["subject"])}">
      <input type="hidden" name="_language" value="{e(ctx["lang"]["code"])}">
      <div class="hp" aria-hidden="true"><label>Leave empty <input type="text" name="_gotcha" tabindex="-1" autocomplete="off"></label></div>
      <label>{e(f["name"])}<input type="text" name="name" required autocomplete="name"></label>
      <label>{e(f["email"])}<input type="email" name="email" required autocomplete="email" dir="ltr"></label>
      <label>{e(f["phone"])}<input type="tel" name="phone" autocomplete="tel" dir="ltr"></label>
      <label>{e(f["topic"])}<select name="topic">{options}</select></label>
      <label>{e(f["message"])}<textarea name="message" rows="4" required></textarea></label>
      <button class="btn btn-gold" type="submit">{e(f["send"])}</button>
      <p class="form-status" role="status" aria-live="polite"></p>
    </form>
  </div>
</section>"""



def s_closing(sec, t, ctx):
    """Closing line just above the footer, with a button to the contact form."""
    return f"""
<section class="section dark closing" id="{e(sec["id"])}">
  <div class="hero-bg soft" aria-hidden="true"><span class="aurora a2"></span><span class="aurora a3"></span></div>
  <div class="container narrow closing-inner">
    <p class="closing-line reveal">{e(t["line"])}</p>
    <a class="btn btn-gold reveal" href="#contact">{e(t["cta"])}</a>
  </div>
</section>"""


RENDERERS = {
    "hero": s_hero,
    "cards": s_cards,
    "showreel": s_showreel,
    "portfolio": s_portfolio,
    "packages": s_packages,
    "steps": s_steps,
    "testimonials": s_testimonials,
    "contact": s_contact,
    "closing": s_closing,
}

PERSIAN = str.maketrans("0123456789", "۰۱۲۳۴۵۶۷۸۹")
LATIN = str.maketrans("", "")


# ---------------------------------------------------------------- page
OG_LOCALES = {"en": "en_US", "fa": "fa_IR", "ru": "ru_RU", "hy": "hy_AM"}
LANG_NAMES = {"en": "English", "fa": "Persian", "ru": "Russian", "hy": "Armenian"}


def build_schema(site, lang, t, langs, base, url):
    """Structured data for Google: the studio (a creative professional service) with its services,
    the website, and this page."""
    studio = {
        "@type": "ProfessionalService",
        "@id": base + "#studio",
        "name": site["brand"],
        "url": base,
        "logo": base + "assets/logo-hero.png",
        "image": base + "assets/og-image.jpg",
        "description": t["meta"]["description"],
        "slogan": t["hero"].get("title_sub", ""),
        "areaServed": "Worldwide",
        "availableLanguage": [LANG_NAMES[l["code"]] for l in langs],
        "knowsAbout": [it["name"] for it in t["services"]["items"]],
        "hasOfferCatalog": {
            "@type": "OfferCatalog",
            "name": t["services"]["title"],
            "itemListElement": [
                {"@type": "Offer", "itemOffered": {"@type": "Service", "name": it["name"], "description": it["text"],
                                                   "provider": {"@id": base + "#studio"}}}
                for it in t["services"]["items"]
            ],
        },
    }
    # packages with "starting from" prices (USD)
    studio["makesOffer"] = [
        {"@type": "Offer", "name": it["name"], "description": it.get("note") or it["cat"],
         "priceSpecification": {"@type": "PriceSpecification", "minPrice": it["amount"], "priceCurrency": "USD",
                                **({"unitCode": it["unit_code"]} if it.get("unit_code") else {})}}
        for it in t.get("packages", {}).get("items", []) if "amount" in it
    ]
    website = {"@type": "WebSite", "@id": base + "#website", "url": base, "name": site["brand"],
               "inLanguage": [l["code"] for l in langs], "publisher": {"@id": base + "#studio"}}
    webpage = {"@type": "WebPage", "@id": url + "#webpage", "url": url, "name": t["meta"]["title"],
               "description": t["meta"]["description"], "inLanguage": lang["code"],
               "isPartOf": {"@id": base + "#website"}, "about": {"@id": base + "#studio"}}
    return {"@context": "https://schema.org", "@graph": [studio, website, webpage]}

def page(site, lang, t, langs):
    prefix = "../" * lang["path"].count("/")
    base = site["site_url"].rstrip("/") + "/"
    url = base + lang["path"]
    ctx = {"site": site, "lang": lang, "prefix": prefix, "digits": PERSIAN if lang["code"] == "fa" else LATIN}

    nav_links = "".join(f'<li><a href="#{e(sid)}">{e(label)}</a></li>' for sid, label in t["nav"]["links"].items())
    switch = "".join(
        f'<a href="{prefix}{l["path"]}index.html" hreflang="{l["code"]}" lang="{l["code"]}"'
        + (' aria-current="true"' if l["code"] == lang["code"] else "")
        + f'>{e(l["label"])}</a>'
        for l in langs
    )
    alternates = "\n".join(f'  <link rel="alternate" hreflang="{l["code"]}" href="{base}{l["path"]}">' for l in langs)
    alternates += f'\n  <link rel="alternate" hreflang="x-default" href="{base}">'

    body = "".join(RENDERERS[sec["type"]](sec, t[sec["id"]], ctx) for sec in site["sections"])

    schema = build_schema(site, lang, t, langs, base, url)
    # "noindex" keeps the site out of Google until it is final (set "noindex": false in content/site.json to go live)
    robots = '  <meta name="robots" content="noindex">\n' if site.get("noindex") else ""
    og_alt_locales = "".join(f'  <meta property="og:locale:alternate" content="{OG_LOCALES[l["code"]]}">\n'
                             for l in langs if l["code"] != lang["code"])
    fonts = ("https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800"
             "&family=Inter:wght@400;500;600&family=Vazirmatn:wght@400;500;700;800&display=swap")
    return f"""<!doctype html>
<html lang="{lang["code"]}" dir="{lang["dir"]}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{e(t["meta"]["title"])}</title>
  <meta name="description" content="{e(t["meta"]["description"])}">
  <link rel="canonical" href="{url}">
{alternates}
{robots}  <meta property="og:type" content="website">
  <meta property="og:site_name" content="{e(site["brand"])}">
  <meta property="og:title" content="{e(t["meta"].get("og_title", t["meta"]["title"]))}">
  <meta property="og:description" content="{e(t["meta"]["description"])}">
  <meta property="og:url" content="{url}">
  <meta property="og:locale" content="{e(t["meta"]["og_locale"])}">
{og_alt_locales}  <meta property="og:image" content="{base}assets/og-image.jpg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="{e(t["meta"].get("og_image_alt", site["brand"]))}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="{e(t["meta"].get("og_title", t["meta"]["title"]))}">
  <meta name="twitter:description" content="{e(t["meta"]["description"])}">
  <meta name="twitter:image" content="{base}assets/og-image.jpg">
  <meta name="theme-color" content="#070d1f">
  <link rel="icon" href="{prefix}assets/favicon-32.png" type="image/png" sizes="32x32">
  <link rel="apple-touch-icon" href="{prefix}assets/favicon-180.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="{fonts}">
  <link rel="stylesheet" href="{prefix}assets/styles.css">
  <script type="application/ld+json">{json.dumps(schema, ensure_ascii=False)}</script>
</head>
<body>
<a class="skip" href="#main">{e(t["nav"]["skip"])}</a>
<header class="site-header">
  <div class="container header-inner">
    <a class="brand" href="#top" aria-label="{e(site["brand"])}">{logo(prefix)}<span>{e(site["brand"])}</span></a>
    <nav class="nav" id="site-nav" aria-label="{e(t["nav"]["menu"])}">
      <ul>{nav_links}</ul>
    </nav>
    <div class="header-actions">
      <div class="lang-switch" role="navigation" aria-label="{e(t["nav"]["language"])}">{switch}</div>
      <a class="btn btn-gold btn-sm header-cta" href="#contact">{e(t["nav"]["cta"])}</a>
      <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav" aria-label="{e(t["nav"]["menu"])}"><span></span><span></span></button>
    </div>
  </div>
</header>
<main id="main">{body}
</main>
<footer class="site-footer">
  <div class="container footer-inner">
    <a class="brand" href="#top">{logo(prefix)}<span>{e(site["brand"])}</span></a>
    <p>{e(t["footer"]["tagline"])}</p>
    <div class="lang-switch">{switch}</div>
    <p class="small">© <span data-year></span> {e(site["brand"])}. {e(t["footer"]["rights"])}</p>
  </div>
</footer>
<script src="{prefix}assets/script.js" defer></script>
</body>
</html>
"""


def main():
    site = json.loads((CONTENT / "site.json").read_text(encoding="utf-8"))
    langs = [l for l in site["languages"] if l.get("enabled", True)]
    for lang in langs:
        t = json.loads((CONTENT / f'{lang["code"]}.json').read_text(encoding="utf-8"))
        out = ROOT / lang["path"] / "index.html"
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(page(site, lang, t, langs), encoding="utf-8")
        print("built", out.relative_to(ROOT))

    base = site["site_url"].rstrip("/") + "/"
    urls = ""
    for l in langs:
        alts = "".join(f'\n    <xhtml:link rel="alternate" hreflang="{a["code"]}" href="{base}{a["path"]}"/>' for a in langs)
        urls += f"\n  <url>\n    <loc>{base}{l['path']}</loc>\n    <lastmod>{__import__('datetime').date.today().isoformat()}</lastmod>{alts}\n  </url>"
    (ROOT / "sitemap.xml").write_text(
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">'
        f"{urls}\n</urlset>\n",
        encoding="utf-8",
    )
    (ROOT / "robots.txt").write_text(f"User-agent: *\nAllow: /\n\nSitemap: {base}sitemap.xml\n", encoding="utf-8")
    print("built sitemap.xml, robots.txt")


if __name__ == "__main__":
    main()
