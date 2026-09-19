#!/usr/bin/env python3
"""
DreamersJoy — Fall Edit palette carousel for Instagram / Facebook.

Four 4:5 slides (1600x2000): a cover, then one slide per palette.
Type is sized for a phone feed, not a printed page.

Usage:  python3 build_palette_carousel.py
"""
import base64, os, json, subprocess

HERE = os.path.dirname(os.path.abspath(__file__))
IMG = os.path.join(os.path.dirname(HERE), "nextjs/public/cinematic/assets/images")


def uri(fn):
    ext = fn.rsplit(".", 1)[-1]
    with open(os.path.join(IMG, fn), "rb") as f:
        return f"data:image/{ext};base64," + base64.b64encode(f.read()).decode()


LOGO = uri("dj-logo-transparent.png")

# Colour names are the studio's own descriptors, never a colour system's.
PALETTES = [
    ("Burnt Ember", "Warm, spiced and sunlit", "fall-burnt-ember.webp", [
        ("#8B4630", "Rust", "Anchor"), ("#D89B87", "Clay", "Primary"),
        ("#C1A18B", "Ginger", "Bridge"), ("#F0EBE1", "Cream", "Breath"),
        ("#DDD45F", "Chartreuse", "Accent")]),
    ("Olive Smoke", "Herbal, architectural, restrained", "fall-olive-smoke.webp", [
        ("#5A5641", "Olive", "Anchor"), ("#9C9426", "Moss", "Primary"),
        ("#918F8C", "Smoke", "Bridge"), ("#F0EBE1", "Cream", "Breath"),
        ("#7C5231", "Chestnut", "Accent")]),
    ("Mahogany Dusk", "Deep, candlelit, built for evening", "fall-mahogany-dusk.webp", [
        ("#5B3139", "Mahogany", "Anchor"), ("#C695A6", "Dusty Rose", "Primary"),
        ("#7C5231", "Chestnut", "Bridge"), ("#C1A18B", "Tan", "Breath"),
        ("#9E2469", "Fuchsia", "Accent")]),
]

CSS = """
  * { margin:0; padding:0; box-sizing:border-box; }
  body { width:1600px; height:2000px; background:#F7F7F5; font-family:'Jost',sans-serif;
         color:#2C3E50; display:flex; flex-direction:column; overflow:hidden; }
  .kicker { font-size:24px; letter-spacing:.26em; text-transform:uppercase; color:#87734C; }

  /* ---- cover ---- */
  .cover { flex:1; display:flex; flex-direction:column; align-items:center;
           justify-content:center; text-align:center; padding:90px 100px; }
  .cover img.logo { width:230px; height:230px; margin-bottom:34px; }
  .cover h1 { font-family:'Cormorant Garamond',serif; font-size:132px; font-weight:300;
              line-height:1; margin:26px 0 20px; }
  .cover .sub { font-family:'Cormorant Garamond',serif; font-style:italic; font-size:54px;
                color:rgba(44,62,80,.62); }
  .ribbon { display:flex; width:100%; margin:62px 0 44px; gap:14px; }
  .ribbon .band { flex:1; }
  .ribbon .band .bar { display:flex; height:104px; border-radius:2px; overflow:hidden; }
  .ribbon .band .bar span { flex:1; }
  .ribbon .band p { font-family:'Cormorant Garamond',serif; font-size:33px; margin-top:16px; }
  .cover .line { font-size:29px; line-height:1.6; color:rgba(44,62,80,.66); max-width:34ch; }
  .cover .url { margin-top:40px; font-size:25px; letter-spacing:.14em;
                text-transform:uppercase; color:#87734C; }

  /* ---- palette slides ---- */
  .pic { width:100%; height:1000px; background-size:cover; background-position:center; }
  .body { flex:1; padding:58px 100px 0; display:flex; flex-direction:column; }
  .head { display:flex; align-items:baseline; justify-content:space-between; }
  .head h2 { font-family:'Cormorant Garamond',serif; font-size:104px; font-weight:400;
             line-height:1; }
  .head .num { font-size:26px; letter-spacing:.22em; color:#87734C; }
  .tag { font-family:'Cormorant Garamond',serif; font-style:italic; font-size:46px;
         color:rgba(44,62,80,.6); margin-top:14px; }
  .sws { display:flex; gap:18px; margin-top:52px; }
  .sw { flex:1; }
  .sw span { display:block; height:190px; border-radius:2px;
             border:1px solid rgba(44,62,80,.09); margin-bottom:18px; }
  .sw b { display:block; font-size:33px; font-weight:400; line-height:1.2; }
  .sw i { display:block; font-size:21px; letter-spacing:.1em; text-transform:uppercase;
          color:#87734C; font-style:normal; margin-top:6px; }
  .foot { margin-top:auto; padding:34px 0 42px; display:flex; align-items:center;
          justify-content:center; gap:18px; }
  .foot img { width:62px; height:62px; }
  .foot span { font-size:22px; letter-spacing:.2em; text-transform:uppercase;
               color:rgba(44,62,80,.45); }
"""

HEAD = ("""<!DOCTYPE html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Jost:wght@300;400;500&display=swap" rel="stylesheet">
<style>""" + CSS + "</style></head><body>")


def cover_slide():
    bands = ""
    for name, _tag, _img, cols in PALETTES:
        bars = "".join(f'<span style="background:{hx}"></span>' for hx, _n, _r in cols)
        bands += f'<div class="band"><div class="bar">{bars}</div><p>{name}</p></div>'
    return HEAD + f"""
<div class="cover">
  <img class="logo" src="{LOGO}">
  <p class="kicker">Fall 2026</p>
  <h1>The Fall Edit</h1>
  <p class="sub">Color first. Flowers second.</p>
  <div class="ribbon">{bands}</div>
  <p class="line">We always design with the colors that are in season, as well as the blooms.</p>
  <p class="url">dreamersjoystudio.com</p>
</div></body></html>"""


def palette_slide(i, name, tag, img, cols):
    sw = "".join(
        f'<div class="sw"><span style="background:{hx}"></span><b>{n}</b><i>{r}</i></div>'
        for hx, n, r in cols)
    return HEAD + f"""
<div class="pic" style="background-image:url({uri(img)})"></div>
<div class="body">
  <div class="head"><h2>{name}</h2><span class="num">{i} / 3</span></div>
  <p class="tag">{tag}</p>
  <div class="sws">{sw}</div>
  <div class="foot"><img src="{LOGO}"><span>The Fall Edit</span></div>
</div></body></html>"""


def main():
    slides = [("01-cover", cover_slide())]
    for i, (name, tag, img, cols) in enumerate(PALETTES, 1):
        slug = name.lower().replace(" ", "-")
        slides.append((f"0{i+1}-{slug}", palette_slide(i, name, tag, img, cols)))

    out = os.path.join(HERE, "carousel")
    os.makedirs(out, exist_ok=True)
    jobs = []
    for slug, html in slides:
        h = os.path.join(out, f"{slug}.html")
        open(h, "w").write(html)
        jobs.append([h, os.path.join(out, f"{slug}.png")])

    subprocess.run(["node", os.path.join(HERE, "_shot.js"), json.dumps(jobs)], check=True)

    from PIL import Image
    for _h, png in jobs:
        jpg = png[:-4] + ".jpg"
        Image.open(png).convert("RGB").save(jpg, "JPEG", quality=93, optimize=True)
        os.remove(png)
        print(f"  {os.path.basename(jpg):28} {round(os.path.getsize(jpg)/1024)}KB")
    for h, _p in jobs:
        os.remove(h)


if __name__ == "__main__":
    main()
