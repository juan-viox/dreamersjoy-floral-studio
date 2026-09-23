#!/usr/bin/env python3
"""
The studio's hard-goods list, as a PDF to carry into a supplier.

Everything a florist needs that is not a flower. Grouped the way a supply
house is actually walked rather than alphabetically, with the specifications
that are easy to forget at the counter — wire gauges, tape widths, frog
diameters — written down so they do not have to be remembered.

    python3 supplies.py
"""
import os, subprocess

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "out", "DreamersJoy-Studio-Supplies-List.pdf")
CHROME = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome"

CREAM, FRAME, NAVY, GOLD = "#FAF5EE", "#C9B8A8", "#334155", "#8B7355"
INK_SOFT, INK_MUTE, LINE, SURFACE = "#6B6358", "#938A7D", "#E0D6C9", "#FFFCF8"


def fonts_css():
    with open(os.path.join(HERE, "fonts-inline.css"), encoding="utf-8") as fh:
        return fh.read()


# (section, note, [(item, spec)])
SECTIONS = [
    ("Mechanics", "No foam — everything below is what holds a stem instead.", [
        ("Chicken wire, 1″ hex, galvanised", "2 ft roll. The workhorse. Crumple into a ball for compotes."),
        ("Pin frogs / kenzan", "2″, 3″ and 4″. Heavy brass base, not the light ones."),
        ("Waterproof floral tape (Oasis / Pro)", "¼″ and ½″. Clear and green."),
        ("Anchor / pot tape", "For taping a frog down so it cannot shift in the car."),
        ("Cold glue or floral adhesive", "Oasis Floral Adhesive. For a stem that will not stay."),
        ("Bind wire", "Green, on the paddle. For hand-tied binding points."),
        ("Paddle wire", "22 and 24 gauge."),
        ("Stem wire, straight", "18, 20 and 22 gauge. Supports a heavy head that wants to nod."),
        ("Plastic or glass liner bowls", "To drop inside stone and concrete vessels — they are porous and will weep onto a table."),
        ("Cable ties", "Small. Faster than wire for an armature."),
    ]),
    ("Cutting", "Buy better than you think you need. These are used every day.", [
        ("Bypass floral snips", "Two pairs. One lives in the bucket water and goes blunt."),
        ("Branch cutters / loppers", "For woody stems — spirea, smokebush, olive."),
        ("Rose / thorn stripper", ""),
        ("Floral knife", "For a clean angled cut on a soft stem."),
        ("Wire cutters", "Keep off flower stems or they crush."),
        ("Ribbon scissors", "Label them. If they cut a stem once they will never cut ribbon cleanly again."),
    ]),
    ("Conditioning & care", "Where vase life is actually won or lost.", [
        ("Flower food sachets", "Two sizes: one for your buckets, small ones to send with the customer."),
        ("Hydration solution", "Chrysal or Floralife professional. For the first drink after cutting."),
        ("Quick-dip / instant hydrator", "For woody and wilty stems before they go in the bucket."),
        ("Finishing / anti-transpirant spray", "Crowning Glory or similar. Buys a day or two, especially on a delivery."),
        ("Buckets", "Several sizes, including tall for branches. Buy more than feels sensible."),
        ("Bucket cleaner or bleach tablets", "Dirty buckets are the commonest cause of a short vase life."),
    ]),
    ("Vessels", "Measurements are what the build sheets quote, so match them.", [
        ("Low footed compotes", "6″, 8–9″ and 10–12″ — Petite, Signature, Statement."),
        ("Low bowls", "7–8″, for centrepieces that must be seen over at a table."),
        ("Cylinder vases", "For hand-tieds a customer wants ready to stand."),
        ("Bud vases", "Small orders, and the pieces that photograph best in a row."),
        ("Glazed or glass, not raw concrete", "Or buy liners. A porous vessel marks furniture."),
    ]),
    ("Wrapping & presentation", "What the hand-tied bouquets are finished in.", [
        ("Unbleached kraft paper", "Roll. The site says hand-tied and wrapped in unbleached paper, so it should be."),
        ("Cellophane or clear sleeves", "For transport, not for the finished look."),
        ("Aqua tubes / water picks", "Keeps a hand-tied alive in a car."),
        ("Aqua-pack bases", "If any bouquet travels more than an hour."),
        ("Ribbon — satin, velvet, silk", "In palette: dusty rose, sage, cream, antique gold, midnight."),
        ("Jute twine", ""),
        ("Bouquet bands / heavy rubber bands", ""),
        ("Corsage pins", "Pearl-headed, for finishing a ribbon tail."),
    ]),
    ("Cards & branding", "You now have sixteen printed enclosure cards — they need holding.", [
        ("Card-holder picks", "The plastic fork picks. Without these the card ends up loose in the foliage."),
        ("A6 or 4×6 envelopes", "Cream or white, not kraft. Kraft fights the palette."),
        ("Blank care cards or labels", "The printed care note that goes with every delivery."),
        ("Branded stickers or labels", "For sealing paper wraps and boxes."),
        ("Business cards", "Left with every delivery. The recipient is not yet your customer — this is how they become one."),
    ]),
    ("The handover",
     "The part the recipient actually remembers. The flowers are only half of what "
     "arrives; the other half is how it is presented at the door.", [
        ("Rigid gift / hat boxes", "Sized to your compotes. A box that holds its shape is the difference between a delivery and a gift."),
        ("Box lids or sleeves", "So nothing is visible until it is opened."),
        ("Branded tissue paper", "Cream or palette-toned. Lines the box and hides the mechanics."),
        ("Shred or crinkle filler", "In palette — never bright. Steadies a vessel inside a box and looks considered."),
        ("Wax seal kit and monogram stamp", "Cheap, quick, and nothing else reads as handmade care quite so immediately."),
        ("Belly bands or paper wraps", "A band around a wrapped bouquet, stamped or stickered. Cheaper than printed paper."),
        ("Grosgrain or velvet ribbon for boxes", "Wider than stem ribbon — 1½″ or 2″."),
        ("Felt pads for vessel bases", "Stops a compote marking the table it is set down on. Nobody notices it; everybody notices the ring it prevents."),
        ("Small flower-food sachets", "Taped inside the lid with the care card, so the gift includes how to keep it."),
        ("Weatherproof door hangers", "For the doors nobody answers. Says where the flowers are and who they are from."),
    ]),
    ("Transport", "The part that ruins work already finished.", [
        ("Delivery boxes / bouquet boxes", "Rigid, with a base that grips."),
        ("Transport crates or bucket caddies", "So nothing tips on Route 4."),
        ("Non-slip matting", "For the boot. Cheap, and it saves a whole arrangement."),
        ("Tissue and bubble wrap", "Padding a vessel in transit."),
        ("Insulated blanket or collapsible cooler", "Summer deliveries. Twenty minutes in a hot car undoes a day of conditioning."),
        ("Clear umbrella or rain sleeve", "For the walk from the car to the door. A soaked wrap arrives looking careless."),
        ("Mister / fine spray bottle for the car", "A last spritz before it changes hands."),
        ("Branded magnetic car sign", "Every delivery is also thirty minutes of advertising in the towns you serve."),
        ("Branded tote or carry basket", "How it looks crossing somebody's driveway is part of the delivery."),
    ]),
    ("Studio consumables", "", [
        ("Nitrile gloves", "For dyed stems and thorns."),
        ("Apron", ""),
        ("Spray bottle / mister", ""),
        ("Bar towels", "A stack. They are always damp."),
        ("Heavy waste bags", "Stem waste is wet and heavy — the thin ones split."),
    ]),
]

ASK = [
    ("Open a trade account", "Wholesale pricing usually needs a resale certificate and an EIN — worth asking what they require before you need it."),
    ("Minimums and delivery", "Whether they deliver to Wyckoff, what the order minimum is, and the cutoff time."),
    ("What they stock weekly", "So you know what you can rely on rather than driving over to find out."),
    ("Vessel range and reorders", "Whether a compote you like can be reordered, or whether it is a one-off. This decides whether a photograph on the site can be honoured twice."),
]


def build_html():
    def section(title, note, items):
        rows = "".join(
            f'''<li><label><input type="checkbox" />
                <span class="nm">{i}</span>
                {f'<span class="sp">{s}</span>' if s else ''}
            </label></li>''' for i, s in items
        )
        return f'''<section>
  <h2>{title}</h2>
  {f'<p class="note">{note}</p>' if note else ''}
  <ul>{rows}</ul>
</section>'''

    body = "".join(section(t, n, i) for t, n, i in SECTIONS)
    ask = "".join(
        f'<li><span class="nm">{t}</span><span class="sp">{d}</span></li>' for t, d in ASK
    )

    return f'''<meta charset="utf-8">
<title>Studio Supplies</title>
<style>
{fonts_css()}
@page {{ size: letter; margin: 12mm 13mm; }}
* {{ box-sizing: border-box; }}
body {{ margin:0; background:{CREAM}; color:{NAVY};
  font-family:'Jost',ui-sans-serif,system-ui,sans-serif; font-size:12.5px; line-height:1.5; }}
h1, h2 {{ font-family:'Cormorant Garamond',Garamond,serif; font-weight:400; margin:0; }}
h1 {{ font-size:28px; line-height:1.1; }}
h2 {{ font-size:19px; margin-bottom:5px; }}
.eyebrow {{ font-size:10px; text-transform:uppercase; letter-spacing:.16em; color:{GOLD}; margin:0 0 6px; }}
.deck {{ color:{INK_SOFT}; font-size:12.5px; margin:8px 0 0; max-width:62ch; }}

.cols {{ column-count:2; column-gap:22px; margin-top:18px; }}
section {{ break-inside:avoid; margin-bottom:16px; }}
.note {{ font-size:11.5px; color:{INK_MUTE}; margin:0 0 7px; }}

ul {{ list-style:none; margin:0; padding:0; }}
li {{ padding:4px 0; border-top:1px solid {LINE}; }}
li:first-child {{ border-top:0; }}
label {{ display:grid; grid-template-columns:auto 1fr; gap:8px; align-items:start; }}
input {{ width:11px; height:11px; margin:3px 0 0; -webkit-appearance:none; appearance:none;
  border:1px solid #B9AC9B; border-radius:2px; background:#fff; }}
.nm {{ font-size:12.5px; }}
.sp {{ grid-column:2; font-size:11px; color:{INK_MUTE}; line-height:1.45; display:block; }}

.ask {{ margin-top:8px; background:{SURFACE}; border-left:2px solid {GOLD};
  border-radius:0 3px 3px 0; padding:14px 16px; break-inside:avoid; }}
.ask h2 {{ margin-bottom:8px; }}
.ask li {{ border-top:1px solid {LINE}; padding:7px 0; }}
.ask li:first-child {{ border-top:0; }}
.ask .nm {{ display:block; font-weight:500; }}
.ask .sp {{ display:block; }}

.foot {{ font-size:11px; color:{INK_MUTE}; border-top:1px solid {LINE};
  padding-top:10px; margin-top:16px; }}
</style>

<p class="eyebrow">Supply run · G &amp; G Distributors, Elmwood Park</p>
<h1>Studio supplies</h1>
<p class="deck">Everything that is not a flower. Specifications are written down because
they are the part you forget at the counter — gauges, widths, diameters. Tick what
you need before you go; nothing here is a full restock.</p>

<div class="cols">{body}</div>

<div class="ask">
  <h2>Worth asking while you are there</h2>
  <ul>{ask}</ul>
</div>

<p class="foot">DreamersJoy Floral Studio · Wyckoff, NJ · This list assumes no floral foam;
chicken wire and frogs do that work instead.</p>
'''


if __name__ == "__main__":
    work = os.path.join(HERE, ".work")
    os.makedirs(work, exist_ok=True)
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    src = os.path.join(work, "supplies.html")
    with open(src, "w", encoding="utf-8") as fh:
        fh.write(build_html())
    subprocess.run(
        [CHROME, "--headless", "--disable-gpu", "--no-sandbox", "--hide-scrollbars",
         "--virtual-time-budget=20000", "--run-all-compositor-stages-before-draw",
         "--no-pdf-header-footer", "--print-to-pdf=" + OUT, "file://" + src],
        capture_output=True, timeout=180,
    )
    print("written:", OUT, os.path.getsize(OUT) // 1024, "KB")
