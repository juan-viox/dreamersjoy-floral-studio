#!/usr/bin/env python3
"""
DreamersJoy Journal — static site generator.

Reads posts.py and writes:
  nextjs/public/cinematic/journal.html            (index)
  nextjs/public/cinematic/journal/<slug>.html     (one per post)

Page chrome (head, nav, footer) is lifted from an existing site page at build
time, so the journal can never drift out of sync with the rest of the site.

Usage:  python3 build_journal.py
"""
import html
import os
import re

HERE = os.path.dirname(os.path.abspath(__file__))
CINE = os.path.join(os.path.dirname(HERE), "nextjs/public/cinematic")
CHROME_SOURCE = os.path.join(CINE, "our-process.html")
IMG = "assets/images/"

from posts import POSTS, SITE, AUTHOR  # noqa: E402


# ── chrome -------------------------------------------------------------
def chrome():
    s = open(CHROME_SOURCE).read()
    nav = s[s.index('<nav class="nav"'):s.index('<!-- ═══', s.index('</nav>'))]
    foot = s[s.index('<!-- ═══ NEWSLETTER ═══ -->'):]
    fonts = "\n".join(
        l for l in s.splitlines()
        if ("fonts.googleapis" in l or "fonts.gstatic" in l
            or "cdnjs.cloudflare" in l or 'rel="icon"' in l
            or 'apple-touch-icon' in l)
    )
    return nav, foot, fonts


NAV, FOOT, FONTS = chrome()


def head(title, desc, url, image, extra_ld=""):
    t, d = html.escape(title), html.escape(desc)
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<base href="/cinematic/">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{t} | DreamersJoy Floral Studio</title>
<meta name="description" content="{d}">
<link rel="canonical" href="{url}">
<meta property="og:type" content="article">
<meta property="og:title" content="{t}">
<meta property="og:description" content="{d}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{SITE}/cinematic/{IMG}{image}">
<meta property="og:site_name" content="DreamersJoy Floral Studio">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{t}">
<meta name="twitter:description" content="{d}">
<meta name="twitter:image" content="{SITE}/cinematic/{IMG}{image}">
{FONTS}
<link rel="stylesheet" href="style.css">
{extra_ld}
</head>"""


# ── body blocks --------------------------------------------------------
def render_body(blocks):
    out = []
    for kind, val in blocks:
        if kind == "h2":
            out.append(f'<h2 class="jr-h2">{val}</h2>')
        elif kind == "p":
            out.append(f"<p>{val}</p>")
        elif kind == "ul":
            items = "".join(f"<li>{i}</li>" for i in val)
            out.append(f"<ul class='jr-list'>{items}</ul>")
        elif kind == "quote":
            out.append(f'<blockquote class="jr-quote">{val}</blockquote>')
        elif kind == "img":
            f, alt = val
            out.append(
                f'<figure class="jr-fig"><img src="{IMG}{f}" alt="{html.escape(alt)}" '
                f'loading="lazy" decoding="async"><figcaption>{html.escape(alt)}</figcaption></figure>')
    return "\n      ".join(out)


def plain_text(blocks):
    """Strip tags for the JSON-LD articleBody / wordCount."""
    buf = []
    for kind, val in blocks:
        if kind in ("p", "h2", "quote"):
            buf.append(re.sub(r"<[^>]+>", "", val))
        elif kind == "ul":
            buf.extend(re.sub(r"<[^>]+>", "", i) for i in val)
    return " ".join(buf)


# ── post page ----------------------------------------------------------
def post_page(p, prev_post, next_post):
    url = f"{SITE}/journal/{p['slug']}"
    text = plain_text(p["body"])
    ld = f"""<script type="application/ld+json">
{{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": {html.escape(p['title'])!r},
  "description": {html.escape(p['description'])!r},
  "image": "{SITE}/cinematic/{IMG}{p['image']}",
  "datePublished": "{p['date']}",
  "dateModified": "{p['date']}",
  "wordCount": {len(text.split())},
  "articleSection": "{p['category']}",
  "inLanguage": "en-US",
  "author": {{ "@type": "Person", "name": "{AUTHOR}" }},
  "publisher": {{
    "@type": "Organization",
    "name": "DreamersJoy Floral Studio",
    "logo": {{ "@type": "ImageObject", "url": "{SITE}/cinematic/{IMG}dj-logo.png" }}
  }},
  "mainEntityOfPage": {{ "@type": "WebPage", "@id": "{url}" }},
  "isPartOf": {{ "@type": "Blog", "@id": "{SITE}/journal", "name": "The Journal" }}
}}
</script>""".replace("'", '"')

    def link(other, label):
        if not other:
            return "<span></span>"
        return (f'<a href="/journal/{other["slug"]}" class="jr-nav-link">'
                f'<span class="jr-nav-dir">{label}</span>'
                f'<span class="jr-nav-title">{html.escape(other["title"])}</span></a>')

    return f"""{head(p['title'], p['description'], url, p['image'], ld)}
<body data-page="journal">
{NAV}

<article class="jr-article">
  <header class="jr-hero">
    <div class="jr-hero-img" style="background-image: url({IMG}{p['image']});"></div>
    <div class="container jr-hero-inner">
      <p class="jr-meta"><a href="/journal">The Journal</a> &nbsp;&middot;&nbsp; {p['category']}</p>
      <h1>{html.escape(p['title'])}</h1>
      <p class="jr-byline">{AUTHOR} &nbsp;&middot;&nbsp; {p['date_label']} &nbsp;&middot;&nbsp; {p['read']} read</p>
    </div>
  </header>

  <div class="container">
    <div class="jr-body">
      {render_body(p['body'])}
    </div>

    <nav class="jr-pager" aria-label="More journal entries">
      {link(prev_post, "Previous")}
      {link(next_post, "Next")}
    </nav>

    <aside class="jr-cta">
      <p class="section-label">From the Studio</p>
      <h2>The Fall Edit</h2>
      <p>Centerpieces in three scales and hand-tied bouquets, composed in three
         colour-led palettes and hand-delivered across Bergen County.</p>
      <a href="/fall-edit" class="btn-primary">See the Collection</a>
    </aside>
  </div>
</article>

{FOOT}
"""


# ── index page ---------------------------------------------------------
def index_page(posts):
    url = f"{SITE}/journal"
    ld = f"""<script type="application/ld+json">
{{
  "@context": "https://schema.org",
  "@type": "Blog",
  "@id": "{url}",
  "name": "The Journal — DreamersJoy Floral Studio",
  "description": "Notes on seasonal flowers, colour-led design and entertaining, from a private floral studio in Bergen County, New Jersey.",
  "url": "{url}",
  "inLanguage": "en-US",
  "publisher": {{ "@type": "Organization", "name": "DreamersJoy Floral Studio" }},
  "blogPost": [
{",".join(chr(10) + '    { "@type": "BlogPosting", "headline": "' + html.escape(p["title"]) + '", "url": "' + SITE + "/journal/" + p["slug"] + '", "datePublished": "' + p["date"] + '" }' for p in posts)}
  ]
}}
</script>"""

    cards = ""
    for i, p in enumerate(posts):
        feature = ' jr-card--lead' if i == 0 else ''
        cards += f"""
      <article class="jr-card{feature} fade-up">
        <a href="/journal/{p['slug']}" class="jr-card-link">
          <div class="jr-card-img" style="background-image: url({IMG}{p['image']});"></div>
          <div class="jr-card-body">
            <p class="jr-card-cat">{p['category']} &nbsp;&middot;&nbsp; {p['read']} read</p>
            <h2>{html.escape(p['title'])}</h2>
            <p class="jr-card-excerpt">{html.escape(p['excerpt'])}</p>
            <p class="jr-card-date">{p['date_label']}</p>
          </div>
        </a>
      </article>"""

    desc = ("Notes on seasonal flowers, colour-led design and entertaining, from a "
            "private floral studio in Bergen County, New Jersey.")
    return f"""{head("The Journal", desc, url, posts[0]['image'], ld)}
<body data-page="journal-index">
{NAV}

<section style="background: var(--bg); text-align: center;">
  <div class="container">
    <p class="section-label fade-up">The Journal</p>
    <h1 class="section-heading fade-up" style="margin-bottom: 16px;">Notes from the Studio</h1>
    <p class="fade-up" style="font-size: 18px; color: rgba(44,62,80,0.7); max-width: 56ch; margin: 0 auto; line-height: 1.7;">
      What is in season, how we build it, and how to make it look right on your
      table. Written from the studio in Wyckoff, New Jersey.</p>
  </div>
</section>

<section style="padding: clamp(32px, 4vw, 56px) 0 clamp(64px, 8vw, 96px);">
  <div class="container">
    <div class="jr-grid">{cards}
    </div>
  </div>
</section>

{FOOT}
"""


# ── write --------------------------------------------------------------
def main():
    posts = sorted(POSTS, key=lambda p: p["date"], reverse=True)
    os.makedirs(os.path.join(CINE, "journal"), exist_ok=True)

    with open(os.path.join(CINE, "journal.html"), "w") as f:
        f.write(index_page(posts))
    print(f"journal.html                    index, {len(posts)} posts")

    for i, p in enumerate(posts):
        newer = posts[i - 1] if i > 0 else None
        older = posts[i + 1] if i + 1 < len(posts) else None
        with open(os.path.join(CINE, "journal", p["slug"] + ".html"), "w") as f:
            f.write(post_page(p, older, newer))
        print(f"journal/{p['slug']}.html")


if __name__ == "__main__":
    main()
