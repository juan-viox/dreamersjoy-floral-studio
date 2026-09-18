#!/usr/bin/env python3
"""
DreamersJoy Floral Studio — Season Record builder.

Renders one HTML + PDF record per season from season_data.py:
  cover  → palettes, pricing, margin summary
  page   → per design: style, palette block, floral recipe, COGS + retail

Usage:  python3 build_season_record.py
"""
import base64, os, subprocess, html
from season_data import (
    SEASONS, STEM_PRICES, HARD_GOODS, LABOUR_RATE, LABOUR_HOURS,
    SIZES, SIZE_SPECS,
)

HERE = os.path.dirname(os.path.abspath(__file__))
LOGO = os.path.join(os.path.dirname(HERE), "nextjs/public/cinematic/assets/images/dj-logo-transparent.png")
OUT = HERE


def logo_uri():
    with open(LOGO, "rb") as f:
        return "data:image/png;base64," + base64.b64encode(f.read()).decode()


IMG_DIR = os.path.join(os.path.dirname(HERE), "nextjs/public/cinematic/assets/images")


def img_uri(filename):
    """Embed an arrangement image so the HTML/PDF is self-contained."""
    path = os.path.join(IMG_DIR, filename)
    if not os.path.exists(path):
        return None
    ext = os.path.splitext(filename)[1].lstrip(".").lower()
    mime = {"webp": "image/webp", "png": "image/png",
            "jpg": "image/jpeg", "jpeg": "image/jpeg"}.get(ext, "image/webp")
    with open(path, "rb") as f:
        return f"data:{mime};base64," + base64.b64encode(f.read()).decode()


def money(v):
    return f"${v:,.2f}"


def costs_for(design, size):
    """Return (stem_cost, hard_goods_cost, labour_cost, total)."""
    stems = sum(STEM_PRICES[s] * q.get(size, 0) for s, q in design["recipe"].items())
    hg = sum(HARD_GOODS[size].values())
    lab = LABOUR_RATE * LABOUR_HOURS[size]
    return stems, hg, lab, stems + hg + lab


def sizes_for(design, season):
    offered = design.get("sizes_offered")
    if offered:
        return [s for s in SIZES if s in offered]
    return [s for s in SIZES if any(q.get(s, 0) for q in design["recipe"].values())]


CSS = """
<style>
  @page { size: Letter; margin: 0; }
  :root{
    --ink:#334155; --muted:rgba(51,65,85,.58); --line:#E2DACE;
    --accent:#8B7355; --paper:#FCFAF7; --band:#F5F0EB;
    --serif: 'Cormorant Garamond', Georgia, 'Times New Roman', serif;
    --sans: 'Jost', 'Helvetica Neue', Arial, sans-serif;
  }
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:#fff;color:var(--ink);font-family:var(--sans);-webkit-print-color-adjust:exact;print-color-adjust:exact}

  .sheet{width:8.5in;height:11in;padding:0.62in 0.7in;position:relative;overflow:hidden;
         page-break-after:always;background:var(--paper);display:flex;flex-direction:column}
  .sheet:last-child{page-break-after:auto}

  .mast{display:flex;align-items:center;gap:14px;padding-bottom:12px;border-bottom:1px solid var(--line);margin-bottom:22px;flex:0 0 auto}
  .mast img{width:46px;height:46px}
  .mast .who{font-size:8.5px;letter-spacing:.22em;text-transform:uppercase;color:var(--accent);font-weight:500;line-height:1.7}
  .mast .who b{display:block;color:var(--ink);font-weight:500;letter-spacing:.2em}
  .mast .right{margin-left:auto;text-align:right;font-size:8.5px;letter-spacing:.16em;text-transform:uppercase;color:var(--muted);line-height:1.7}

  h1{font-family:var(--serif);font-size:52px;font-weight:300;line-height:1.02;letter-spacing:.01em;margin-bottom:8px}
  h2{font-family:var(--serif);font-size:34px;font-weight:300;line-height:1.1}
  .eyebrow{font-size:9px;letter-spacing:.24em;text-transform:uppercase;color:var(--accent);font-weight:500;margin-bottom:10px}
  .lede{font-size:11.5px;line-height:1.75;color:var(--muted);max-width:62ch}

  .rule{height:1px;background:var(--line);margin:20px 0}

  /* palette */
  .sw-row{display:grid;gap:8px;margin:14px 0 6px}
  .sw{border:1px solid rgba(51,65,85,.07);border-radius:2px;overflow:hidden;background:#fff}
  .sw .chip{height:52px}
  .sw .meta{padding:7px 8px 8px}
  .sw .code{font-size:6.8px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);font-weight:500}
  .sw .nm{font-family:var(--serif);font-size:13px;font-weight:400;line-height:1.2;margin-top:1px}
  .sw .role{font-size:6.8px;letter-spacing:.1em;text-transform:uppercase;color:var(--accent);font-weight:500;margin-top:3px}

  /* tables */
  table{width:100%;border-collapse:collapse;font-size:9.5px}
  th{text-align:left;font-size:7.5px;letter-spacing:.14em;text-transform:uppercase;color:var(--accent);
     font-weight:500;padding:0 6px 7px;border-bottom:1px solid var(--line)}
  td{padding:5px 6px;border-bottom:1px solid rgba(226,218,206,.5);vertical-align:top}
  td.n,th.n{text-align:right;font-variant-numeric:tabular-nums}
  tr.tot td{border-top:1.5px solid var(--ink);border-bottom:none;font-weight:600;padding-top:7px}
  tr.sub td{border-bottom:none;color:var(--muted)}
  .stem{font-size:9.5px}
  .zero{color:rgba(51,65,85,.22)}

  .sect{font-size:8px;letter-spacing:.2em;text-transform:uppercase;color:var(--accent);font-weight:500;
        margin:18px 0 9px;padding-bottom:5px;border-bottom:1px solid var(--line)}

  .cols{display:grid;grid-template-columns:1fr 1fr;gap:26px}

  .note{font-size:9px;line-height:1.7;color:var(--muted)}
  .note li{margin-bottom:5px;margin-left:13px}

  .foot{margin-top:auto;padding-top:12px;border-top:1px solid var(--line);
        display:flex;justify-content:space-between;font-size:7.5px;letter-spacing:.1em;
        text-transform:uppercase;color:rgba(51,65,85,.4);flex:0 0 auto}

  .kpi{display:grid;grid-template-columns:repeat(4,1fr);gap:9px;margin-top:10px}
  .kpi .box{border:1px solid var(--line);border-radius:2px;padding:10px 11px;background:#fff}
  .kpi .lbl{font-size:7.5px;letter-spacing:.14em;text-transform:uppercase;color:var(--accent);font-weight:500}
  .kpi .val{font-family:var(--serif);font-size:24px;font-weight:300;margin-top:3px;line-height:1}
  .kpi .sm{font-size:8px;color:var(--muted);margin-top:3px}

  .band{background:var(--band);border-radius:2px;padding:13px 15px;margin-top:12px}

  /* design page header: title left, square arrangement plate right */
  .dhead{display:flex;align-items:flex-start;gap:24px}
  .dhead .txt{flex:1;min-width:0}
  .plates{flex:0 0 auto;display:flex;gap:9px}
  .plate{width:1.5in}
  .plate .frame{width:1.5in;height:1.5in;border-radius:3px;overflow:hidden;
                border:1px solid var(--line);background:#fff}
  .plate img{width:100%;height:100%;object-fit:cover;display:block}
  .plate-cap{font-size:7px;letter-spacing:.14em;text-transform:uppercase;color:var(--accent);
             text-align:center;margin-top:5px;font-weight:500}
</style>
"""


def mast(season, right):
    return f"""
  <div class="mast">
    <img src="{logo_uri()}" alt="">
    <div class="who"><b>DreamersJoy Floral Studio</b>Season Record</div>
    <div class="right">{html.escape(season['season'])}<br>{html.escape(right)}</div>
  </div>"""


def cover(season):
    designs = season["designs"]
    # summary table across designs × sizes
    rows = ""
    for d in designs:
        sz = sizes_for(d, season)
        for s in sz:
            stems, hg, lab, tot = costs_for(d, s)
            rt = season["retail"][s]
            prod = stems + hg
            pgm = (rt - prod) / rt * 100 if rt else 0
            net = rt - tot
            ngm = net / rt * 100 if rt else 0
            rows += (f"<tr><td>{html.escape(d['name'])}</td><td>{s}</td>"
                     f"<td class='n'>{money(stems)}</td><td class='n'>{money(hg)}</td>"
                     f"<td class='n'>{money(prod)}</td><td class='n'>{money(rt)}</td>"
                     f"<td class='n'>{pgm:.0f}%</td>"
                     f"<td class='n'>{money(lab)}</td><td class='n'>{money(net)}</td>"
                     f"<td class='n'>{ngm:.0f}%</td></tr>")

    pal = ""
    for d in designs:
        chips = "".join(f"<span style='flex:1;background:{c[2]}'></span>" for c in d["palette"])
        pal += f"""
        <div style="margin-bottom:13px">
          <div style="display:flex;height:9px;border-radius:2px;overflow:hidden;margin-bottom:5px">{chips}</div>
          <div style="display:flex;justify-content:space-between;align-items:baseline">
            <span style="font-family:var(--serif);font-size:17px">{html.escape(d['name'])}</span>
            <span style="font-size:9px;color:var(--muted);font-style:italic">{html.escape(d['tagline'])}</span>
          </div>
        </div>"""

    notes = "".join(f"<li>{html.escape(n)}</li>" for n in season["notes"])

    return f"""
<div class="sheet">
  {mast(season, "Cover")}
  <p class="eyebrow">{html.escape(season['season'])} &nbsp;·&nbsp; Season Record</p>
  <h1>{html.escape(season['edit_name'])}</h1>
  <p class="lede">{html.escape(season['window'])}<br>{html.escape(season['color_source'])}</p>

  <div class="sect">The Palettes</div>
  {pal}

  <div class="sect">Costing &amp; Margin — All Designs</div>
  <table>
    <tr><th>Design</th><th>Size</th><th class="n">Stems</th><th class="n">Hard goods</th>
        <th class="n">Product COGS</th><th class="n">Retail</th><th class="n">Product GM</th>
        <th class="n">Labour</th><th class="n">Net $</th><th class="n">Net %</th></tr>
    {rows}
  </table>

  <div class="band">
    <div class="sect" style="margin-top:0;border:none;padding:0">Season Notes</div>
    <ul class="note">{notes}</ul>
  </div>

  <div class="foot"><span>DreamersJoy Floral Studio · Wyckoff, NJ</span>
    <span>Labour @ {money(LABOUR_RATE)}/hr · Stem costs are planning estimates</span></div>
</div>"""


def design_page(season, d, idx):
    sz = sizes_for(d, season)

    shots = []
    for key, cap in (("image", "Centerpiece"), ("image_bouquet", "Bouquet")):
        uri = img_uri(d[key]) if d.get(key) else None
        if uri:
            shots.append(
                f'<div class="plate"><div class="frame"><img src="{uri}" '
                f'alt="{html.escape(d["name"])} {cap.lower()}"></div>'
                f'<p class="plate-cap">{cap}</p></div>')
    plate = f'<div class="plates">{"".join(shots)}</div>' if shots else ""

    # palette block
    cols = f"grid-template-columns:repeat({len(d['palette'])},1fr)"
    sw = "".join(
        f"""<div class="sw"><div class="chip" style="background:{c[2]}"></div>
            <div class="meta"><p class="code">{html.escape(c[0])}</p>
            <p class="nm">{html.escape(c[1])}</p><p class="role">{html.escape(c[3])}</p></div></div>"""
        for c in d["palette"])

    # recipe table
    head = "".join(f"<th class='n'>{s}</th>" for s in sz)
    body = ""
    for stem, q in d["recipe"].items():
        if not any(q.get(s, 0) for s in sz):
            continue
        cells = ""
        for s in sz:
            n = q.get(s, 0)
            cells += f"<td class='n{' zero' if not n else ''}'>{n if n else '—'}</td>"
        body += (f"<tr><td class='stem'>{html.escape(stem)}</td>"
                 f"<td class='n'>{money(STEM_PRICES[stem])}</td>{cells}</tr>")

    # cost table — product margin first, then labour
    def row(label, fn, cls=""):
        cells = "".join(f"<td class='n'>{fn(s)}</td>" for s in sz)
        return f"<tr class='{cls}'><td>{label}</td>{cells}</tr>"

    R = lambda s: season["retail"][s]
    C = lambda s: costs_for(d, s)
    prod = lambda s: C(s)[0] + C(s)[1]

    crows = (
        row("Stems", lambda s: money(C(s)[0]), "sub")
        + row("Hard goods", lambda s: money(C(s)[1]), "sub")
        + row("Product COGS", lambda s: money(prod(s)), "tot")
        + row("Retail price", lambda s: money(R(s)))
        + row("Product gross margin",
              lambda s: f"{(R(s)-prod(s))/R(s)*100:.0f}%", "tot")
        + row("Studio labour", lambda s: money(C(s)[2]), "sub")
        + row("Net after labour", lambda s: money(R(s) - C(s)[3]))
    )

    rt = ""
    gm = ""
    pc = "".join(f"<td class='n'>{(R(s)-C(s)[3])/R(s)*100:.0f}%</td>" for s in sz)

    spec = "".join(f"<td class='n' style='font-size:7.5px;color:var(--muted)'>{SIZE_SPECS[s]}</td>" for s in sz)

    return f"""
<div class="sheet">
  {mast(season, d['name'])}
  <div class="dhead">
    <div class="txt">
      <p class="eyebrow">{html.escape(d['number'])}</p>
      <h2>{html.escape(d['name'])}</h2>
      <p style="font-size:10.5px;color:var(--muted);font-style:italic;margin-top:4px">{html.escape(d['tagline'])}</p>
      <div class="sect" style="margin-top:15px">Style</div>
      <p class="lede" style="max-width:none">{html.escape(d['style'])}</p>
    </div>
    {plate}
  </div>

  <div class="sect">Colour Palette</div>
  <div class="sw-row" style="{cols}">{sw}</div>

  <div class="sect">Floral Recipe — stems per arrangement</div>
  <table>
    <tr><th>Stem</th><th class="n">Unit</th>{head}</tr>
    {body}
  </table>

  <div class="sect">Cost of Goods &amp; Retail</div>
  <table>
    <tr><th>&nbsp;</th>{''.join(f'<th class="n">{s}</th>' for s in sz)}</tr>
    <tr class="sub"><td>Dimensions</td>{spec}</tr>
    {crows}
    <tr class="tot"><td>Net margin</td>{pc}</tr>
  </table>

  <div class="foot"><span>{html.escape(season['season'])} · {html.escape(d['name'])}</span>
    <span>Page {idx + 2}</span></div>
</div>"""


def build(season):
    pages = cover(season) + "".join(design_page(season, d, i)
                                    for i, d in enumerate(season["designs"]))
    doc = (f"<!DOCTYPE html><html><head><meta charset='utf-8'>"
           f"<title>DreamersJoy — {html.escape(season['season'])} Season Record</title>"
           f"{CSS}</head><body>{pages}</body></html>")
    name = f"DreamersJoy_Season_Record_{season['slug'].replace('-', '_')}"
    hp = os.path.join(OUT, name + ".html")
    with open(hp, "w") as f:
        f.write(doc)
    return hp, os.path.join(OUT, name + ".pdf")


if __name__ == "__main__":
    jobs = [build(s) for s in SEASONS]
    for h, p in jobs:
        print("html:", h)
    with open(os.path.join(HERE, "_topdf.js"), "w") as f:
        f.write("""
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const pg = await b.newPage();
  for (const [h, p] of JSON.parse(process.argv[2])) {
    await pg.goto('file://' + h, { waitUntil: 'networkidle' });
    await pg.waitForTimeout(400);
    await pg.pdf({ path: p, width: '8.5in', height: '11in', printBackground: true });
    console.log('pdf: ' + p);
  }
  await b.close();
})();
""")
    import json
    subprocess.run(["node", os.path.join(HERE, "_topdf.js"), json.dumps(jobs)], check=True)
