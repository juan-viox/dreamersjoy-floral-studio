#!/usr/bin/env python3
"""
Two PDFs for the bag.

  DreamersJoy-Studio-Booklet.pdf   cover, terms, pricing with photographs,
                                   delivery & returns, materials checklist.
                                   Safe to open in front of a customer.

  DreamersJoy-COGS-Internal.pdf    what each arrangement actually costs to
                                   make, and what is left. NOT for customers.

Split on purpose: the booklet is the thing handed across a table, and the
margin sheet is the thing that must never be handed across a table.

    python3 booklet.py
"""
import base64, html, io, os, re, subprocess
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "out")
SITE = os.path.join(HERE, "..", "nextjs")
IMGS = os.path.join(SITE, "public", "cinematic", "assets", "images")
CHROME = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome"

CREAM, FRAME, NAVY, GOLD = "#FAF5EE", "#C9B8A8", "#334155", "#8B7355"
INK_SOFT, INK_MUTE, LINE, SURFACE = "#6B6358", "#938A7D", "#E0D6C9", "#FFFCF8"
FLAG = "#A8543F"


def e(s):
    return html.escape(str(s), quote=True)


def fonts_css():
    with open(os.path.join(HERE, "fonts-inline.css"), encoding="utf-8") as fh:
        return fh.read()


def img_uri(name, max_px=1100, quality=82):
    path = os.path.join(IMGS, name)
    im = Image.open(path).convert("RGB")
    im.thumbnail((max_px, max_px), Image.LANCZOS)
    buf = io.BytesIO()
    im.save(buf, "JPEG", quality=quality, optimize=True, progressive=True)
    return "data:image/jpeg;base64," + base64.b64encode(buf.getvalue()).decode()


def to_pdf(markup, name):
    work = os.path.join(HERE, ".work")
    os.makedirs(work, exist_ok=True)
    os.makedirs(OUT, exist_ok=True)
    src = os.path.join(work, name + ".html")
    with open(src, "w", encoding="utf-8") as fh:
        fh.write(markup)
    pdf = os.path.join(OUT, name + ".pdf")
    subprocess.run(
        [CHROME, "--headless", "--disable-gpu", "--no-sandbox", "--hide-scrollbars",
         "--virtual-time-budget=25000", "--run-all-compositor-stages-before-draw",
         "--no-pdf-header-footer", "--print-to-pdf=" + pdf, "file://" + src],
        capture_output=True, timeout=240,
    )
    return pdf


# ─────────────────────────────────────────────── catalogue, from the real one

def load_catalog():
    s = open(os.path.join(SITE, "src", "lib", "arrangement-catalog.ts"), encoding="utf-8").read()
    body = s[s.index("export const CATALOG"):s.index("export const SHIPPING_OPTIONS")]
    rows = re.findall(
        r"'([a-z0-9\-]+)':\s*\{\s*id:[^,]+,\s*name:\s*'([^']*)',\s*amount:\s*(\d+),"
        r"\s*description:\s*'((?:[^'\\]|\\.)*)',\s*collection:\s*'([^']*)',"
        r"\s*size:\s*'([^']*)',\s*image:\s*BASE \+ '([^']*)'", body)
    out = []
    for cid, name, amt, desc, coll, size, image in rows:
        if "Mother" in coll:          # seasonal, and the page now redirects
            continue
        out.append(dict(id=cid, name=name, price=int(amt) / 100,
                        desc=desc.replace("\\'", "'"), collection=coll,
                        size=size, image=image))
    return out


CATALOG = load_catalog()

# One page per family, not per photograph. A collection and its hand-tied
# version belong together; four giftable bouquets are one page, not four.
def family_of(item):
    c = item["collection"]
    if "Fall Edit" in c:
        for palette in ("Burnt Ember", "Olive Smoke", "Mahogany Dusk"):
            if palette.lower().replace(" ", "-") in item["id"]:
                return ("The Fall Edit \u2014 " + palette, 2)
    if "Giftable" in c:
        return ("Giftable Hand-Tied Bouquets", 3)
    return (c, 1)

_fam = {}
for item in CATALOG:
    title, order = family_of(item)
    f = _fam.setdefault(title, dict(title=title, order=order, desc=item["desc"],
                                    images=[], rows=[]))
    if item["image"] not in f["images"]:
        f["images"].append(item["image"])
    label = item["size"]
    if "Fall Edit" in item["collection"] and "Hand-Tied" in item["collection"]:
        label = "Hand-Tied Bouquet"
    f["rows"].append((label, item["price"]))

GROUPS = sorted(_fam.values(), key=lambda f: (f["order"], f["title"]))

# Working stem counts, matching the build sheets.
STEMS = {"Petite": (15, 20), "Signature": (28, 36), "Statement": (45, 60),
         "Hand-Tied": (24, 32), "Small": (12, 16), "Medium": (18, 24),
         "Large": (26, 34)}

VESSEL_COST = {"Petite": 8, "Signature": 14, "Statement": 22,
               "Hand-Tied": 0, "Small": 0, "Medium": 0, "Large": 0}

# Assumptions, stated so they can be argued with.
STEM_RETAIL = 3.00      # Trader Joe's / Whole Foods, effective per usable stem
STEM_WHOLESALE = 1.50   # what a trade account should land near
CONSUMABLES = 3.50      # wire, tape, card, envelope, food sachet, wrap
DELIVERY_COST = 6.00    # fuel and wear on a local run
BUILD_HOURS = {"Petite": 0.75, "Signature": 1.25, "Statement": 2.25,
               "Hand-Tied": 0.75, "Small": 0.5, "Medium": 0.75, "Large": 1.0}


BASE_CSS = """
@page { size: letter; margin: 0; }
* { box-sizing: border-box; }
body { margin:0; background:%(cream)s; color:%(navy)s;
  font-family:'Jost',ui-sans-serif,system-ui,sans-serif; font-size:12.5px; line-height:1.55;
  -webkit-print-color-adjust:exact; print-color-adjust:exact; }
h1,h2,h3,.serif { font-family:'Cormorant Garamond',Garamond,serif; font-weight:400; margin:0; }
.page { width:8.5in; height:11in; padding:0.62in 0.7in; position:relative;
  break-after:page; overflow:hidden; }
.page:last-child { break-after:auto; }
.eyebrow { font-size:10px; text-transform:uppercase; letter-spacing:.16em;
  color:%(gold)s; margin:0 0 7px; }
h1 { font-size:30px; line-height:1.1; }
h2 { font-size:21px; margin-bottom:6px; }
.deck { color:%(inksoft)s; font-size:13px; margin:10px 0 0; max-width:62ch; }
.rule { height:1px; background:%(line)s; border:0; margin:16px 0; }
.foot { position:absolute; left:0.7in; right:0.7in; bottom:0.42in;
  font-size:10px; color:%(inkmute)s; border-top:1px solid %(line)s; padding-top:8px;
  display:flex; justify-content:space-between; }
""" % dict(cream=CREAM, navy=NAVY, gold=GOLD, inksoft=INK_SOFT, inkmute=INK_MUTE, line=LINE)


def foot(left, right):
    return f'<div class="foot"><span>{e(left)}</span><span>{e(right)}</span></div>'


# ─────────────────────────────────────────────────────────── booklet pages

def page_cover():
    return f'''<div class="page cover">
  <img class="cover-img" src="{img_uri('hero-fall-2026.webp', 1400)}" alt="" />
  <div class="cover-veil"></div>
  <div class="cover-text">
    <p class="cover-eyebrow">Wyckoff, New Jersey &middot; By appointment</p>
    <h1 class="cover-title">DreamersJoy<br/>Floral Studio</h1>
    <hr class="cover-rule" />
    <p class="cover-tag">Refined floral design for intimate gatherings</p>
    <p class="cover-meta">dreamersjoystudio.com &middot; (551) 465-5200<br/>
      sarah@dreamersjoystudio.com</p>
  </div>
</div>'''


def page_terms():
    import importlib.util
    spec = importlib.util.spec_from_file_location(
        "ot", os.path.join(HERE, "order_terms_shim.py"))
    terms = TERMS_FALLBACK
    items = "".join(
        f'<div class="term"><h3>{e(h)}</h3><p>{e(b)}</p></div>' for h, b in terms)
    return f'''<div class="page">
  <p class="eyebrow">Purchasing terms</p>
  <h1>How we work</h1>
  <p class="deck">Plainly said, so there are no surprises. These are the terms
    shown at checkout and sent with every invoice.</p>
  <hr class="rule" />
  <div class="terms">{items}</div>
  {foot('DreamersJoy Floral Studio', 'Purchasing terms')}
</div>'''


TERMS_FALLBACK = [
    ("Every arrangement is one of a kind",
     "Each piece is designed and built by hand, in the studio, for your order. No two are ever "
     "identical. The photographs show a representative example of a palette and a scale, not the "
     "exact stems you will receive."),
    ("We build with what is in season",
     "Flowers are seasonal and the market changes week to week. We buy what is at its best on the "
     "day rather than forcing a variety that has gone over or not yet arrived."),
    ("Substitutions",
     "If a flower named in a description is unavailable, or is not up to standard on the day, we "
     "replace it with another of similar value, tone and character, keeping the palette intact. We "
     "never substitute downward in value. Substitution is part of how seasonal work is made, so it "
     "is not grounds for a refund."),
    ("Vessels",
     "Vessel measurements are approximate and given as a guide to scale. Style and dimensions vary "
     "with availability; an equivalent of similar size, material and character may be used."),
    ("Changes and cancellations",
     "Tell us at least 72 hours before the delivery date and we will change or cancel without "
     "charge. After that the flowers have been bought for your piece specifically — they are cut, "
     "they are yours, and they cannot go back."),
    ("Prices",
     "All prices are in US dollars. A processing and handling charge of 3.5% is added at checkout "
     "and shown as its own line."),
]


def page_pricing(group, idx, total):
    rows = "".join(
        f'<tr><td>{e(label)}</td><td class="n">${price:,.0f}</td></tr>'
        for label, price in group["rows"])
    n = len(group["images"])
    figs = "".join(f'<img src="{img_uri(i, 900 if n > 1 else 1100)}" alt="" />'
                   for i in group["images"])
    return f'''<div class="page">
  <p class="eyebrow">Collection {idx} of {total}</p>
  <h1>{e(group["title"])}</h1>
  <div class="price-grid">
    <figure class="imgs n{min(n, 4)}">{figs}</figure>
    <div>
      <p class="deck" style="margin-top:0;">{e(group["desc"])}</p>
      <table class="prices">
        <thead><tr><th>Size</th><th class="n">From</th></tr></thead>
        <tbody>{rows}</tbody>
      </table>
      <p class="fineprint">Prices are a starting point for the size. Delivery and a
        3.5% processing and handling charge are added at checkout. Every piece is
        made by hand and no two are identical.</p>
    </div>
  </div>
  {foot('DreamersJoy Floral Studio', 'Pricing')}
</div>'''


def page_delivery():
    return f'''<div class="page">
  <p class="eyebrow">Delivery &amp; returns</p>
  <h1>Getting it to the door</h1>
  <p class="deck">You give us the delivery postcode and we show you the price.
    There is nothing to work out.</p>

  <table class="zones">
    <thead><tr><th>Distance from the studio</th><th class="n">Delivery</th></tr></thead>
    <tbody>
      <tr><td>Within about 9 miles<span class="sub">Wyckoff, Ridgewood, Franklin Lakes, Paramus,
        Glen Rock, Fair Lawn, Hackensack, Mahwah, Ramsey and the near ring</span></td>
        <td class="n">$12<span class="sub">Complimentary over $125</span></td></tr>
      <tr><td>Roughly 10&ndash;15 miles<span class="sub">Englewood, Fort Lee, Teaneck, Tenafly,
        the Palisades, Clifton, Montclair, Wayne, Kinnelon</span></td>
        <td class="n">$18</td></tr>
      <tr><td>Beyond 15 miles<span class="sub">Newark, Jersey City, Hoboken, Manhattan</span></td>
        <td class="n">$55</td></tr>
    </tbody>
  </table>

  <hr class="rule" />

  <div class="two">
    <div>
      <h2>Scheduling</h2>
      <p>The date you give us is a request, and we confirm it by email. Please treat
        an order as scheduled only once you have that confirmation.</p>
      <p>Please check the recipient&rsquo;s address carefully. We cannot be responsible
        for flowers delivered to an address given to us in error.</p>
      <p>If nobody is home we leave the arrangement in a shaded, sheltered spot and
        let you know where it is.</p>
    </div>
    <div>
      <h2>If something is not right</h2>
      <p>Write within 24 hours of delivery with a photograph and we will put it right
        &mdash; a replacement or a refund, whichever suits you better. We would always
        rather know.</p>
      <h2 style="margin-top:14px;">Fresh flowers are perishable</h2>
      <p>Vase life varies by variety, by season and by where the arrangement is kept.
        Every delivery comes with a care note. Flowers kept in direct sun, near heat, or
        beside ripening fruit fade faster than the same flowers kept cool.</p>
    </div>
  </div>
  {foot('DreamersJoy Floral Studio', 'Delivery & returns')}
</div>'''


def page_materials():
    import importlib.util
    spec = importlib.util.spec_from_file_location("sup", os.path.join(HERE, "supplies.py"))
    sup = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(sup)
    cols = ""
    for title, note, items in sup.SECTIONS:
        li = "".join(
            f'<li><label><input type="checkbox" /><span class="nm">{e(i)}</span>'
            + (f'<span class="sp">{e(s)}</span>' if s else "") + "</label></li>"
            for i, s in items)
        cols += f'<section><h3>{e(title)}</h3><ul>{li}</ul></section>'
    return f'''<div class="page materials">
  <p class="eyebrow">Studio</p>
  <h1>Materials checklist</h1>
  <p class="deck">Everything that is not a flower. Tick before a supply run.</p>
  <div class="mcols">{cols}</div>
</div>'''


def build_booklet():
    groups = GROUPS
    pricing = "".join(page_pricing(g, i + 1, len(groups)) for i, g in enumerate(groups))
    extra = """
.cover { padding:0; display:flex; align-items:flex-end; }
.cover-img { position:absolute; inset:0; width:100%%; height:100%%; object-fit:cover; }
.cover-veil { position:absolute; inset:0;
  background:linear-gradient(180deg, rgba(26,26,46,.12) 0%%, rgba(26,26,46,.62) 62%%, rgba(26,26,46,.82) 100%%); }
.cover-text { position:relative; padding:0 0.85in 0.9in; color:#FAF5EE; }
.cover-eyebrow { font-size:10px; text-transform:uppercase; letter-spacing:.22em;
  color:rgba(250,245,238,.78); margin:0 0 14px; }
.cover-title { font-family:'Cormorant Garamond',serif; font-size:54px; line-height:1.04;
  font-weight:300; color:#FAF5EE; margin:0; }
.cover-rule { width:1.1in; height:1px; background:rgba(250,245,238,.55); border:0; margin:20px 0; }
.cover-tag { font-family:'Cormorant Garamond',serif; font-size:19px; font-style:italic;
  color:rgba(250,245,238,.9); margin:0 0 20px; }
.cover-meta { font-size:11.5px; letter-spacing:.04em; color:rgba(250,245,238,.72); margin:0; line-height:1.7; }

.terms { margin-top:4px; }
.term { padding:11px 0; border-top:1px solid %(line)s; break-inside:avoid; }
.term:first-child { border-top:0; }
.term h3 { font-family:'Cormorant Garamond',serif; font-size:19px; margin:0 0 3px; }
.term p { margin:0; font-size:12.5px; color:%(inksoft)s; line-height:1.65; }

.price-grid { display:grid; grid-template-columns:1.25fr 0.75fr; gap:24px; margin-top:20px; align-items:start; }
.price-grid figure { margin:0; display:grid; gap:8px; }
.imgs.n1 { grid-template-columns:1fr; }
.imgs.n2 { grid-template-columns:1fr; }
.imgs.n3, .imgs.n4 { grid-template-columns:1fr 1fr; }
/* With three, the first reads as the hero and the pair sits under it. */
.imgs.n3 img:first-child { grid-column:1 / -1; }
.imgs img { aspect-ratio:4/5; object-fit:cover; }
.imgs.n1 img, .imgs.n3 img:first-child { aspect-ratio:1/1; }
.price-grid img { width:100%%; border-radius:3px; border:1px solid %(line)s; display:block; }
table.prices { width:100%%; border-collapse:collapse; margin-top:16px; }
table.prices th { text-align:left; font-size:9.5px; text-transform:uppercase; letter-spacing:.13em;
  color:%(gold)s; font-weight:500; padding-bottom:6px; }
table.prices td { padding:9px 0; border-top:1px solid %(line)s; font-size:14px; }
table.prices .n, .zones .n { text-align:right; font-variant-numeric:tabular-nums; }
.fineprint { font-size:10.5px; color:%(inkmute)s; margin-top:14px; line-height:1.55; }

table.zones { width:100%%; border-collapse:collapse; margin-top:18px; }
table.zones th { text-align:left; font-size:9.5px; text-transform:uppercase; letter-spacing:.13em;
  color:%(gold)s; font-weight:500; padding-bottom:6px; }
table.zones td { padding:12px 0; border-top:1px solid %(line)s; font-size:14px; vertical-align:top; }
.sub { display:block; font-size:10.5px; color:%(inkmute)s; margin-top:3px; line-height:1.5; font-weight:400; }
.two { display:grid; grid-template-columns:1fr 1fr; gap:24px; margin-top:4px; }
.two h2 { font-size:18px; }
.two p { font-size:12px; color:%(inksoft)s; margin:0 0 9px; line-height:1.65; }

.materials { height:auto; min-height:11in; padding-bottom:0.6in; }
.mcols { column-count:2; column-gap:20px; margin-top:14px; }
.materials section { break-inside:avoid; margin-bottom:13px; }
.materials h3 { font-family:'Jost',sans-serif; font-size:10px; font-weight:500;
  text-transform:uppercase; letter-spacing:.13em; color:%(gold)s; margin:0 0 5px; }
.materials ul { list-style:none; margin:0; padding:0; }
.materials li { padding:3px 0; border-top:1px solid %(line)s; }
.materials li:first-child { border-top:0; }
.materials label { display:grid; grid-template-columns:auto 1fr; gap:7px; align-items:start; }
.materials input { width:10px; height:10px; margin:3px 0 0; -webkit-appearance:none; appearance:none;
  border:1px solid #B9AC9B; border-radius:2px; background:#fff; }
.materials .nm { font-size:11.5px; }
.materials .sp { grid-column:2; font-size:9.5px; color:%(inkmute)s; line-height:1.4; display:block; }
""" % dict(line=LINE, inksoft=INK_SOFT, inkmute=INK_MUTE, gold=GOLD)

    markup = f'''<meta charset="utf-8"><title>DreamersJoy Studio Booklet</title>
<style>{fonts_css()}{BASE_CSS}{extra}</style>
{page_cover()}{page_terms()}{pricing}{page_delivery()}{page_materials()}'''
    return to_pdf(markup, "DreamersJoy-Studio-Booklet")


# ─────────────────────────────────────────────────────────────── COGS sheet

def cogs_rows():
    rows = []
    for item in CATALOG:
        lo, hi = STEMS.get(item["size"], (20, 28))
        mid = (lo + hi) / 2
        vessel = VESSEL_COST.get(item["size"], 0)
        retail = mid * STEM_RETAIL + vessel + CONSUMABLES
        whole = mid * STEM_WHOLESALE + vessel + CONSUMABLES
        price = item["price"]
        fee = price * 0.029 + 0.30          # Stripe, before the 3.5% recharge
        hours = BUILD_HOURS.get(item["size"], 1.0)
        fam = family_of(item)[0].replace("The Fall Edit \u2014 ", "Fall · ")
        fam = fam.replace("Collection I — ", "").replace("Collection II — ", "")
        fam = fam.replace("Collection III — ", "").replace("Giftable Hand-Tied Bouquets", "Giftable")
        label = "Bouquet" if item["size"] == "Hand-Tied" else item["size"]
        rows.append(dict(
            name=f'{fam} · {label}',
            collection=item["collection"], size=item["size"], price=price,
            stems=f"{lo}–{hi}", retail=retail, whole=whole, fee=fee, hours=hours,
            gm_retail=price - retail - fee,
            gm_whole=price - whole - fee,
        ))
    return rows


def build_cogs():
    rows = cogs_rows()

    def tr(r):
        mr = r["gm_retail"] / r["price"] * 100
        mw = r["gm_whole"] / r["price"] * 100
        hr = r["gm_whole"] / r["hours"]
        cls = "thin" if mr < 35 else ""
        return (f'<tr class="{cls}"><td>{e(r["name"])}</td>'
                f'<td class="n">${r["price"]:,.0f}</td>'
                f'<td class="n">{r["stems"]}</td>'
                f'<td class="n">${r["retail"]:,.0f}</td>'
                f'<td class="n">${r["gm_retail"]:,.0f}<span class="pc">{mr:.0f}%</span></td>'
                f'<td class="n">${r["whole"]:,.0f}</td>'
                f'<td class="n">${r["gm_whole"]:,.0f}<span class="pc">{mw:.0f}%</span></td>'
                f'<td class="n">${hr:,.0f}</td></tr>')

    body = "".join(tr(r) for r in rows)
    thin = [r for r in rows if r["gm_retail"] / r["price"] * 100 < 35]
    avg_r = sum(r["gm_retail"] / r["price"] for r in rows) / len(rows) * 100
    avg_w = sum(r["gm_whole"] / r["price"] for r in rows) / len(rows) * 100
    swing = sum(r["retail"] - r["whole"] for r in rows) / len(rows)

    extra = """
.page { height:auto; min-height:11in; }
table.cogs { width:100%%; border-collapse:collapse; margin-top:14px; font-size:11px; }
table.cogs th { text-align:left; font-size:8.5px; text-transform:uppercase; letter-spacing:.1em;
  color:%(gold)s; font-weight:500; padding:0 6px 7px 0; vertical-align:bottom; }
table.cogs th.n, table.cogs td.n { text-align:right; padding-right:0; padding-left:8px;
  font-variant-numeric:tabular-nums; white-space:nowrap; }
table.cogs td { padding:6px 6px 6px 0; border-top:1px solid %(line)s; }
table.cogs tr.thin td { background:rgba(168,84,63,.055); }
.pc { display:block; font-size:9px; color:%(inkmute)s; }
.assume { background:%(surface)s; border-left:2px solid %(gold)s; border-radius:0 3px 3px 0;
  padding:13px 15px; margin-top:16px; }
.assume h2 { font-size:17px; margin-bottom:6px; }
.assume ul { margin:0; padding-left:1.1em; font-size:11.5px; color:%(inksoft)s; line-height:1.7; }
.flagbox { background:rgba(168,84,63,.07); border-left:2px solid %(flag)s;
  border-radius:0 3px 3px 0; padding:13px 15px; margin-top:14px; }
.flagbox h2 { font-size:17px; color:%(flag)s; margin-bottom:5px; }
.flagbox p { margin:0 0 7px; font-size:12px; line-height:1.6; }
.stat { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; margin-top:16px; }
.stat div { background:%(surface)s; border:1px solid %(line)s; border-radius:4px; padding:12px 13px; }
.stat b { display:block; font-family:'Cormorant Garamond',serif; font-size:27px; font-weight:400; }
.stat span { font-size:10px; color:%(inkmute)s; text-transform:uppercase; letter-spacing:.1em; }
.conf { position:absolute; top:0.5in; right:0.7in; font-size:9px; letter-spacing:.16em;
  text-transform:uppercase; color:%(flag)s; }
""" % dict(gold=GOLD, line=LINE, inkmute=INK_MUTE, surface=SURFACE, inksoft=INK_SOFT, flag=FLAG)

    markup = f'''<meta charset="utf-8"><title>DreamersJoy COGS</title>
<style>{fonts_css()}{BASE_CSS}{extra}</style>
<div class="page">
  <p class="conf">Internal &middot; not for customers</p>
  <p class="eyebrow">Cost of goods</p>
  <h1>What it costs, and what is left</h1>
  <p class="deck">Every figure is a model, not a measurement. The assumptions are
    written below so you can argue with them — change one and the whole sheet moves.</p>

  <div class="stat">
    <div><b>{avg_r:.0f}%</b><span>Avg margin, retail</span></div>
    <div><b>{avg_w:.0f}%</b><span>Avg margin, wholesale</span></div>
    <div><b>${swing:,.0f}</b><span>Avg saved per piece</span></div>
  </div>

  <table class="cogs">
    <thead><tr>
      <th>Arrangement</th><th class="n">Price</th><th class="n">Stems</th>
      <th class="n">COGS<br/>retail</th><th class="n">Gross<br/>retail</th>
      <th class="n">COGS<br/>trade</th><th class="n">Gross<br/>trade</th>
      <th class="n">Per hr<br/>trade</th>
    </tr></thead>
    <tbody>{body}</tbody>
  </table>

  <div class="flagbox">
    <h2>{len(thin)} of {len(rows)} lose money or come close at retail prices</h2>
    <p>Shaded rows earn under 35% gross when stems are bought at Trader Joe's or
      Whole Foods. That is before your own time, and before anything goes wrong.</p>
    <p>The same pieces are healthy on wholesale. This sheet is really one argument:
      the trade account is not admin, it is the difference between a business and
      an expensive hobby.</p>
  </div>

  <div class="assume">
    <h2>Assumptions</h2>
    <ul>
      <li>Stems at <strong>${STEM_RETAIL:.2f}</strong> retail, <strong>${STEM_WHOLESALE:.2f}</strong>
        wholesale, per usable stem — waste and unusable heads included.</li>
      <li>Vessel: $8 Petite, $14 Signature, $22 Statement. Nothing for hand-tieds.</li>
      <li>Consumables <strong>${CONSUMABLES:.2f}</strong> — wire, tape, card, envelope,
        food sachet, wrap.</li>
      <li>Stripe at 2.9% + 30&cent;. Your 3.5% charge covers this and a little over.</li>
      <li>Build time: 45 min Petite, 1h15 Signature, 2h15 Statement. Excludes
        sourcing, conditioning and the drive.</li>
      <li>Delivery is priced separately and is not in these figures. At $12 local
        against roughly ${DELIVERY_COST:.0f} of fuel and wear, a local run roughly covers itself.</li>
    </ul>
  </div>

  {foot('DreamersJoy Floral Studio — internal', 'Cost of goods')}
</div>'''
    return to_pdf(markup, "DreamersJoy-COGS-Internal")


if __name__ == "__main__":
    b = build_booklet()
    c = build_cogs()
    for p in (b, c):
        print(f"{os.path.basename(p):42} {os.path.getsize(p)//1024:>5} KB")
