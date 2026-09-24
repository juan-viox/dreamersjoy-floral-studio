#!/usr/bin/env python3
"""
Build every studio print asset: one build sheet per arrangement, and a
front-and-back occasion card for every message the studio sends.

    python3 generate.py            # everything
    python3 generate.py sheets     # build sheets only
    python3 generate.py cards      # occasion cards only

Rendered through headless Chromium. The web fonts are embedded as base64
rather than linked because Chromium cannot complete TLS to fonts.gstatic.com
through this environment's proxy, and a linked stylesheet fails *silently* —
the PDF just comes out in a substitute serif.
"""
import base64, html, io, os, subprocess, sys, shutil
from PIL import Image

from catalogue import CATALOGUE, PALETTES, SEASON, COUNTS, VESSEL, SITE_IMAGES

HERE = os.path.dirname(os.path.abspath(__file__))
OUT_SHEETS = os.path.join(HERE, "out", "build-sheets")
OUT_CARDS = os.path.join(HERE, "out", "occasion-cards")
WORK = os.path.join(HERE, ".work")
CHROME = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome"

STUDIO = "DreamersJoy Floral Studio"
SITE = "dreamersjoystudio.com"
INSTAGRAM = "@dreamersjoy"

CREAM, FRAME, NAVY, GOLD = "#FAF5EE", "#C9B8A8", "#334155", "#8B7355"
INK_SOFT, INK_MUTE, LINE, SURFACE = "#6B6358", "#938A7D", "#E0D6C9", "#FFFCF8"

MONTHS = "JFMAMJJASOND"


# ---------------------------------------------------------------- helpers

def e(s):
    return html.escape(str(s), quote=True)


def fonts_css():
    with open(os.path.join(HERE, "fonts-inline.css"), encoding="utf-8") as fh:
        return fh.read()


def img_data_uri(path, max_px=1400, quality=84):
    """Resize and inline. Full-size webp would make a 4MB PDF per sheet."""
    im = Image.open(path).convert("RGB")
    im.thumbnail((max_px, max_px), Image.LANCZOS)
    buf = io.BytesIO()
    im.save(buf, "JPEG", quality=quality, optimize=True, progressive=True)
    return "data:image/jpeg;base64," + base64.b64encode(buf.getvalue()).decode()


def to_pdf(html_text, pdf_path, tag):
    os.makedirs(WORK, exist_ok=True)
    src = os.path.join(WORK, tag + ".html")
    with open(src, "w", encoding="utf-8") as fh:
        fh.write(html_text)
    os.makedirs(os.path.dirname(pdf_path), exist_ok=True)
    subprocess.run(
        [CHROME, "--headless", "--disable-gpu", "--no-sandbox", "--hide-scrollbars",
         "--virtual-time-budget=20000", "--run-all-compositor-stages-before-draw",
         "--no-pdf-header-footer", "--print-to-pdf=" + pdf_path, "file://" + src],
        capture_output=True, timeout=180,
    )
    return os.path.exists(pdf_path)


def season_strip(stem):
    """Twelve dots. Filled means you can actually buy it that month."""
    months, note = SEASON.get(stem, (set(range(1, 13)), ""))
    dots = "".join(
        '<i class="%s">%s</i>' % ("on" if (i + 1) in months else "off", MONTHS[i])
        for i in range(12)
    )
    return dots, note, len(months) < 12


# ---------------------------------------------------------------- sheets

SHEET_CSS = """
@page { size: letter; margin: 12mm 13mm; }
* { box-sizing: border-box; }
body { margin:0; background:%(cream)s; color:%(navy)s;
  font-family:'Jost',ui-sans-serif,system-ui,sans-serif; font-size:13px; line-height:1.55; }
h1,h2,.serif { font-family:'Cormorant Garamond',Garamond,'Times New Roman',serif;
  font-weight:400; margin:0; text-wrap:balance; }
h1 { font-size:27px; line-height:1.12; }
h2 { font-size:18px; margin-bottom:8px; }
.eyebrow { font-size:10px; text-transform:uppercase; letter-spacing:.15em;
  color:%(gold)s; margin:0 0 6px; }
.deck { color:%(inksoft)s; font-size:13px; margin:8px 0 0; }
section { margin-top:20px; break-inside:auto; }
h1,h2,.eyebrow { break-after:avoid; }
.card,.flag,.strip,ol.build li,.ref { break-inside:avoid; }

.ref { display:grid; grid-template-columns:1.05fr 1fr; gap:16px; align-items:start; margin-top:14px; }
.ref img { width:100%%; max-height:3in; object-fit:cover; border-radius:3px; border:1px solid %(line)s; }
.ref figure { margin:0; }
.ref figcaption { font-size:11px; color:%(inkmute)s; margin-top:6px; }

.palette { display:grid; grid-template-columns:repeat(4,1fr); gap:7px; margin-top:12px; }
.sw i { display:block; height:40px; border-radius:2px; border:1px solid rgba(0,0,0,.08); }
.sw span { display:block; font-size:10px; color:%(inkmute)s; margin-top:5px; text-align:center; }

.flag { padding:13px 15px; background:%(surface)s; border-left:2px solid %(gold)s;
  border-radius:0 3px 3px 0; margin-top:12px; }
.flag p { margin:0; font-size:12.5px; }
.flag p + p { margin-top:7px; }

table.stems { width:100%%; border-collapse:collapse; margin-top:10px; }
table.stems th { text-align:left; font-size:9.5px; text-transform:uppercase;
  letter-spacing:.12em; color:%(gold)s; font-weight:500; padding:0 8px 6px 0; }
table.stems td { padding:7px 8px 7px 0; border-top:1px solid %(line)s;
  font-size:12.5px; vertical-align:top; }
table.stems td.n { font-variant-numeric:tabular-nums; color:%(inkmute)s; white-space:nowrap; }
.months { white-space:nowrap; font-size:0; }
.months i { display:inline-block; width:12px; text-align:center; font-style:normal;
  font-size:8.5px; line-height:13px; border-radius:2px; margin-right:1px; }
.months i.on  { background:%(gold)s; color:#fff; }
.months i.off { background:rgba(0,0,0,.05); color:%(inkmute)s; }
.warn { color:#A8543F; font-size:11.5px; margin-top:3px; }

.where { display:grid; grid-template-columns:1fr 1fr; gap:9px; margin-top:10px; }
.card { background:%(surface)s; border:1px solid %(line)s; border-radius:4px; padding:11px 13px; }
.card h3 { font-family:'Jost',sans-serif; font-size:10px; font-weight:500;
  text-transform:uppercase; letter-spacing:.12em; color:%(gold)s; margin:0 0 5px; }
.card p { margin:0; font-size:12px; color:%(inksoft)s; }

ol.build { margin:0; padding:0; list-style:none; counter-reset:s; }
ol.build li { counter-increment:s; display:grid; grid-template-columns:22px 1fr;
  gap:10px; padding:6px 0; border-top:1px solid %(line)s; }
ol.build li:first-child { border-top:0; }
ol.build li::before { content:counter(s); font-family:'Cormorant Garamond',serif;
  font-size:15px; color:%(gold)s; }
ol.build p { margin:0; font-size:12.5px; }
ol.build .t { font-weight:500; }
ol.build .d { grid-column:2; color:%(inksoft)s; font-size:12px; }

.foot { font-size:11px; color:%(inkmute)s; border-top:1px solid %(line)s;
  padding-top:11px; margin-top:22px; }
""" % dict(cream=CREAM, navy=NAVY, gold=GOLD, inksoft=INK_SOFT, inkmute=INK_MUTE,
           line=LINE, surface=SURFACE)


def sheet_html(item):
    pal = PALETTES[item["palette"]]
    counts = COUNTS[item["size"]]
    img = img_data_uri(os.path.join(HERE, SITE_IMAGES, item["image"]))

    sw = "".join(
        '<div class="sw"><i style="background:%s"></i><span>%s</span></div>' % (hexv, e(name))
        for name, hexv in pal["swatches"]
    )

    rows, out_of_season = [], []
    roles = ["Focal", "Secondary", "Accent", "Texture", "Foliage"]
    qty = [counts["focal"], counts["secondary"], counts["accent"],
           counts["texture"], counts["foliage"]]
    for i, stem in enumerate(item["stems"]):
        dots, note, seasonal = season_strip(stem)
        if seasonal:
            out_of_season.append(stem)
        rows.append(
            '<tr><td>%s</td><td class="n">%s</td><td><span class="months">%s</span>'
            '%s</td></tr>' % (
                e(stem.title()),
                qty[i] if i < len(qty) else "—",
                dots,
                '<div class="warn">%s</div>' % e(note) if note and seasonal else "",
            )
        )

    seasonal_flag = ""
    if out_of_season:
        seasonal_flag = (
            '<div class="flag"><p><strong>Check the calendar before you promise this one.</strong> '
            "%s %s a limited season — the strip above shows when. Outside those months, "
            "substitute on palette rather than on name: the customer bought a colour and a "
            "feeling, not a botanical list.</p></div>"
            % (e(", ".join(s.title() for s in out_of_season)),
               "has" if len(out_of_season) == 1 else "have")
        )

    return """<meta charset="utf-8">
<title>%(name)s</title>
<style>%(fonts)s
%(css)s</style>

<p class="eyebrow">Build sheet · %(collection)s</p>
<h1>%(name)s</h1>
<p class="deck">%(desc)s &nbsp;·&nbsp; <strong>%(price)s</strong> &nbsp;·&nbsp; about %(total)s stems</p>

<section>
  <div class="ref">
    <figure>
      <img src="%(img)s" alt="%(name)s" />
      <figcaption>The shop photograph — what the customer is buying.</figcaption>
    </figure>
    <div>
      <p class="eyebrow">Palette</p>
      <h2>%(palwords)s</h2>
      <p class="deck" style="margin-top:4px;">%(palline)s Swatches are indicative,
      not measured — buy to the words and the photograph.</p>
      <div class="palette">%(sw)s</div>
    </div>
  </div>
</section>

<section>
  <p class="eyebrow">Vessel &amp; mechanics</p>
  <div class="flag">
    <p>%(vessel)s</p>
    <p>If the vessel is unglazed stone or concrete it is porous — it weeps and
    marks a table. Drop a plain plastic or glass liner inside and put the water
    and the wire in that, or use a glazed vessel and skip the problem.</p>
  </div>
</section>

<section>
  <p class="eyebrow">Stems</p>
  <h2>What goes in, and when you can get it</h2>
  <table class="stems">
    <thead><tr><th>Stem</th><th>Qty</th><th>Available</th></tr></thead>
    <tbody>%(rows)s</tbody>
  </table>
  %(seasonal)s
</section>

<section>
  <p class="eyebrow">Sourcing</p>
  <h2>Where to order</h2>
  <div class="where">
    <div class="card"><h3>Your wholesaler</h3><p>The right call for a Statement, or
      any week with three or more arrangements. Box minimums make it wasteful for
      a single order — check the cutoff, it is usually the morning before.</p></div>
    <div class="card"><h3>Farmstand / farmers market</h3><p>Dahlias, seasonal branches,
      anything with real character. July to first frost this is the best floral
      buying in New Jersey, and cheaper than wholesale.</p></div>
    <div class="card"><h3>Trader Joe's</h3><p>Reliable for roses, lisianthus and
      eucalyptus. Buy on colour, not on label, and walk past anything clear or
      bright if the palette is a muted one.</p></div>
    <div class="card"><h3>Whole Foods / retail florist</h3><p>The gap-filler. More
      expensive per stem but worth it for the one thing that makes the piece —
      and a retail florist will sell you single stems.</p></div>
  </div>
</section>

<section>
  <p class="eyebrow">Build</p>
  <h2>Order of work</h2>
  <ol class="build">
    <li><p class="t">Condition</p><p class="d">Cut on an angle, strip below the
      waterline, two hours minimum in cool water in the dark. Longer if it travels.</p></li>
    <li><p class="t">Mechanics</p><p class="d">%(vesselshort)s</p></li>
    <li><p class="t">Foliage sets the silhouette</p><p class="d">Establish the shape
      and the one long line before any flower goes in. The asymmetry is decided here.</p></li>
    <li><p class="t">Focal flowers</p><p class="d">Asymmetric cluster, varied heights,
      faces turned differently. Never a dome.</p></li>
    <li><p class="t">Secondary, recessed</p><p class="d">Slightly deeper than the
      focals. This is where depth comes from.</p></li>
    <li><p class="t">Accents last, riding high</p><p class="d">Above the mass on their
      own stems. Resist tucking them in.</p></li>
    <li><p class="t">Texture into the gaps</p><p class="d">Fill the negative space
      without closing it. Stop earlier than feels finished.</p></li>
  </ol>
</section>

<p class="foot">No two arrangements are identical — the studio says so publicly, and it
is true. This sheet is the target, not a specification. Match the palette and the scale
and the customer has what they paid for. &nbsp;·&nbsp; %(studio)s</p>
""" % dict(
        fonts=fonts_css(), css=SHEET_CSS,
        name=e("%s — %s" % (item["collection"], item["size"]) if item["size"] not in item["collection"] else item["collection"]),
        collection=e(item["collection"]), desc=e(item["desc"]), price=e(item["price"]),
        total=counts["total"], img=img, palwords=e(pal["words"]), palline=e(pal["line"]),
        sw=sw, vessel=e(VESSEL[item["size"]]), vesselshort=e(VESSEL[item["size"]]),
        rows="".join(rows), seasonal=seasonal_flag, studio=e(STUDIO),
    )


def build_sheets():
    made = []
    for item in CATALOGUE:
        pdf = os.path.join(OUT_SHEETS, item["id"] + ".pdf")
        if to_pdf(sheet_html(item), pdf, "sheet-" + item["id"]):
            made.append(pdf)
            print("  sheet:", item["id"], "%d KB" % (os.path.getsize(pdf) // 1024))
        else:
            print("  FAILED:", item["id"])
    return made


# ---------------------------------------------------------------- cards

# 6x4 LANDSCAPE trim + 0.125in bleed on every side = 6.25 x 4.25 document.
# Landscape to match the studio's existing Mother's Day card, so a stack of
# these reads as one family. Safety margin is 0.25in inside the trim.
CARD_CSS = """
@page { size: 6.25in 4.25in; margin: 0; }
* { box-sizing:border-box; }
body { margin:0; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
.face { position:relative; width:6.25in; height:4.25in; background:%(cream)s;
  display:flex; flex-direction:column; align-items:center; justify-content:center;
  text-align:center; break-after:page; overflow:hidden; }
.face:last-child { break-after:auto; }
/* Hairline frame sits on the TRIM plus a little, never in the bleed. */
.face::after { content:""; position:absolute; inset:0.38in; border:1px solid %(frame)s;
  pointer-events:none; }
.serif { font-family:'Cormorant Garamond',Garamond,'Times New Roman',serif;
  font-weight:300; margin:0; color:%(navy)s; }
.occasion { font-size:0.38in; line-height:1.14; letter-spacing:.004em;
  max-width:4.5in; text-wrap:balance; }
.rule { width:0.7in; height:1px; background:%(gold)s; border:0; margin:0.16in 0 0; }
.wordmark { position:absolute; left:0; right:0; bottom:0.58in;
  font-family:'Cormorant Garamond',serif; font-size:0.1in; letter-spacing:.055em;
  color:%(gold)s; margin:0; }
.back-foot { position:absolute; left:0; right:0; bottom:0.52in; }
.back-foot p { margin:0; font-family:'Cormorant Garamond',serif; color:%(gold)s; }
.back-foot .n { font-size:0.105in; letter-spacing:.055em; }
.back-foot .c { font-size:0.078in; letter-spacing:.05em; margin-top:0.045in; }
""" % dict(cream=CREAM, frame=FRAME, navy=NAVY, gold=GOLD)


OCCASIONS = [
    ("happy-birthday",      "Happy Birthday"),
    ("happy-anniversary",   "Happy Anniversary"),
    ("thinking-of-you",     "Thinking of You"),
    ("i-love-you",          "I Love You"),
    ("get-well-soon",       "Get Well Soon"),
    ("congratulations",     "Congratulations"),
    ("thank-you",           "Thank You"),
    ("with-sympathy",       "With Sympathy"),
    ("welcome-baby",        "Welcome, Baby"),
    ("happy-mothers-day",   "Happy Mother&rsquo;s Day"),
    ("happy-fathers-day",   "Happy Father&rsquo;s Day"),
    ("happy-valentines",    "Happy Valentine&rsquo;s Day"),
    ("happy-holidays",      "Happy Holidays"),
    ("welcome-home",        "Welcome Home"),
    ("just-because",        "Just Because"),
    ("blank",               ""),
]


def card_html(title):
    front_body = (
        '<p class="serif occasion">%s</p><hr class="rule" />' % title
        if title else
        '<hr class="rule" style="margin:0;" />'
    )
    return """<meta charset="utf-8">
<title>%(t)s</title>
<style>%(fonts)s
%(css)s</style>
<div class="face">
  %(front)s
  <p class="wordmark serif">%(studio)s</p>
</div>
<div class="face">
  <div class="back-foot">
    <p class="n">%(studio)s</p>
    <p class="c">%(site)s &nbsp;·&nbsp; %(ig)s</p>
  </div>
</div>
""" % dict(fonts=fonts_css(), css=CARD_CSS, front=front_body,
           t=(title or "Blank"), studio=e(STUDIO), site=e(SITE), ig=e(INSTAGRAM))


def build_cards():
    made = []
    for slug, title in OCCASIONS:
        pdf = os.path.join(OUT_CARDS, "%s-6x4-front-back.pdf" % slug)
        if to_pdf(card_html(title), pdf, "card-" + slug):
            made.append(pdf)
            print("  card:", slug)
        else:
            print("  FAILED:", slug)
    return made


# ---------------------------------------------------------------- care cards

CARE_CSS = """
.care { justify-content:flex-start; padding:0.62in 0.7in 0.5in; text-align:left; }
.care h2 { font-family:'Cormorant Garamond',Garamond,serif; font-weight:400;
  font-size:0.26in; color:%(navy)s; margin:0 0 0.02in; letter-spacing:.004em; }
.care .sub { font-family:'Jost',sans-serif; font-size:0.085in; letter-spacing:.14em;
  text-transform:uppercase; color:%(gold)s; margin:0 0 0.13in; }
.care ol { margin:0; padding-left:0.22in; }
.care li { font-family:'Jost',sans-serif; font-size:0.098in; line-height:1.62;
  color:%(navy)s; margin-bottom:0.055in; }
.care li b { font-weight:500; }
.care .close { font-family:'Cormorant Garamond',serif; font-style:italic;
  font-size:0.115in; color:%(navy)s; margin:0.13in 0 0; text-align:center; }
/* The card is left-aligned; the wordmark is not, or it sits on the frame. */
.care .wordmark { text-align:center; bottom:0.46in; }
.care .sub, .care h2 { text-align:center; }
"""  % dict(navy=NAVY, gold=GOLD)

# Two cards, because one instruction contradicts the other.
#
# A compote is built on chicken wire: recutting means dismantling it. A
# hand-tied is loose in the hand and MUST be recut or it will not drink. A
# single card telling everyone to recut their stems would kill half the work
# the studio sends out.
CARE_CARDS = [
    ("care-arrangement", "Caring for your arrangement", "In a vessel", [
        "<b>Top up the water every day.</b> The flowers sit on a wire frame and drink "
        "quickly &mdash; a Signature can take a cupful in a day. Pour gently down the inside.",
        "<b>Do not recut or rearrange.</b> Each stem is placed into a frame. Lifting one "
        "out is how an arrangement comes apart.",
        "<b>Change the water every third day</b> if you can do it without disturbing the "
        "stems. Cloudy water shortens everything.",
        "<b>Keep it cool.</b> Out of direct sun, away from radiators and vents. A cool room "
        "overnight can add days.",
        "<b>Away from the fruit bowl.</b> Ripening fruit gives off a gas that ages flowers "
        "faster than anything else in a kitchen.",
        "<b>Lift out anything spent.</b> The rest will keep going, and the shape holds.",
    ]),
    ("care-bouquet", "Caring for your bouquet", "Hand-tied", [
        "<b>Unwrap it and recut every stem</b> &mdash; about an inch, at a sharp angle, with "
        "scissors or a knife. This matters more than anything else on this card.",
        "<b>Into a clean vase</b> with fresh water and the flower food we have enclosed. A "
        "dirty vase is the commonest cause of a short life.",
        "<b>Strip any leaf below the waterline.</b> Leaves left in water rot and cloud it.",
        "<b>Keep the binding point tied</b> if you like the shape as it is &mdash; it is "
        "spiralled to stand on its own.",
        "<b>Fresh water every other day</b>, and a quick recut each time if you have a moment.",
        "<b>Cool, out of the sun, away from ripening fruit.</b>",
    ]),
]


def care_html(title, sub, lines):
    items = "".join("<li>%s</li>" % l for l in lines)
    return """<meta charset="utf-8">
<title>%(t)s</title>
<style>%(fonts)s
%(css)s
%(care)s</style>
<div class="face care">
  <p class="sub">%(sub)s</p>
  <h2>%(t)s</h2>
  <ol>%(items)s</ol>
  <p class="close">Any trouble at all, write to us &mdash; we would always rather know.</p>
  <p class="wordmark serif">%(studio)s</p>
</div>
<div class="face">
  <div class="back-foot">
    <p class="n">%(studio)s</p>
    <p class="c">%(site)s &nbsp;&middot;&nbsp; %(ig)s</p>
  </div>
</div>
""" % dict(fonts=fonts_css(), css=CARD_CSS, care=CARE_CSS, t=title, sub=sub,
           items=items, studio=e(STUDIO), site=e(SITE), ig=e(INSTAGRAM))


def build_care_cards():
    made = []
    for slug, title, sub, lines in CARE_CARDS:
        pdf = os.path.join(OUT_CARDS, "%s-6x4-front-back.pdf" % slug)
        if to_pdf(care_html(title, sub, lines), pdf, slug):
            made.append(pdf)
            print("  care:", slug)
    return made


# ---------------------------------------------------------------- main

if __name__ == "__main__":
    what = sys.argv[1] if len(sys.argv) > 1 else "all"
    if what in ("all", "sheets"):
        print("Build sheets:")
        build_sheets()
    if what in ("all", "cards"):
        print("Occasion cards:")
        build_cards()
        print("Care cards:")
        build_care_cards()
    shutil.rmtree(WORK, ignore_errors=True)
    print("done ->", os.path.join(HERE, "out"))
