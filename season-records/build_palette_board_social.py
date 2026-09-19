import base64, os, subprocess, json
IMG = "../nextjs/public/cinematic/assets/images/"
HERE = os.getcwd()

def uri(fn):
    p = os.path.join(HERE, IMG, fn)
    ext = fn.rsplit('.',1)[-1]
    with open(p,'rb') as f:
        return f"data:image/{ext};base64," + base64.b64encode(f.read()).decode()

LOGO = uri("dj-logo-transparent.png")

# Plain colour descriptors — the studio's own language, not Pantone's names or codes.
PAL = [
  ("Burnt Ember", "Warm, spiced and sunlit", "fall-burnt-ember.webp", [
    ("#8B4630","Rust","Anchor"), ("#D89B87","Clay","Primary"),
    ("#C1A18B","Ginger","Bridge"), ("#F0EBE1","Cream","Breath"),
    ("#DDD45F","Chartreuse","Accent")]),
  ("Olive Smoke", "Herbal, architectural, restrained", "fall-olive-smoke.webp", [
    ("#5A5641","Olive","Anchor"), ("#9C9426","Moss","Primary"),
    ("#918F8C","Smoke","Bridge"), ("#F0EBE1","Cream","Breath"),
    ("#7C5231","Chestnut","Accent")]),
  ("Mahogany Dusk", "Deep, candlelit, built for evening", "fall-mahogany-dusk.webp", [
    ("#5B3139","Mahogany","Anchor"), ("#C695A6","Dusty Rose","Primary"),
    ("#7C5231","Chestnut","Bridge"), ("#C1A18B","Tan","Breath"),
    ("#9E2469","Fuchsia","Accent")]),
]

blocks = ""
for name, tag, img, cols in PAL:
    sw = "".join(
      f'<div class="sw"><span style="background:{hx}"></span>'
      f'<b>{nm}</b><i>{role}</i></div>' for hx, nm, role in cols)
    blocks += f"""
    <section class="pal">
      <div class="pic" style="background-image:url({uri(img)})"></div>
      <div class="meta">
        <h2>{name}</h2>
        <p class="tag">{tag}</p>
        <div class="sws">{sw}</div>
      </div>
    </section>"""

html = f"""<!DOCTYPE html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500&family=Jost:wght@300;400;500&display=swap" rel="stylesheet">
<style>
  * {{ margin:0; padding:0; box-sizing:border-box; }}
  body {{ width:1600px; height:2000px; background:#F7F7F5; font-family:'Jost',sans-serif;
          color:#2C3E50; padding:74px 84px 60px; display:flex; flex-direction:column; }}
  header {{ text-align:center; margin-bottom:30px; }}
  header img {{ width:158px; height:158px; margin-bottom:14px; }}
  .kicker {{ font-size:15px; letter-spacing:.24em; text-transform:uppercase;
             color:#87734C; margin-bottom:14px; }}
  h1 {{ font-family:'Cormorant Garamond',serif; font-size:82px; font-weight:300; line-height:1; }}
  .sub {{ font-family:'Cormorant Garamond',serif; font-style:italic; font-size:31px;
          color:rgba(44,62,80,.62); margin-top:14px; }}
  .pal {{ display:flex; gap:48px; align-items:center; padding:52px 0;
          border-top:1px solid rgba(135,115,76,.22); }}
  .pic {{ width:470px; height:352px; flex:none; background-size:cover;
          background-position:center; border-radius:3px; }}
  .meta {{ flex:1; }}
  h2 {{ font-family:'Cormorant Garamond',serif; font-size:56px; font-weight:400; }}
  .tag {{ font-family:'Cormorant Garamond',serif; font-style:italic; font-size:25px;
          color:rgba(44,62,80,.6); margin:6px 0 24px; }}
  .sws {{ display:flex; gap:16px; }}
  .sw {{ flex:1; }}
  .sw span {{ display:block; height:112px; border-radius:2px;
              border:1px solid rgba(44,62,80,.09); margin-bottom:10px; }}
  .sw b {{ display:block; font-size:17px; font-weight:400; }}
  .sw i {{ display:block; font-size:11.5px; letter-spacing:.14em; text-transform:uppercase;
           color:#87734C; font-style:normal; margin-top:3px; }}
  footer {{ margin-top:auto; padding-top:26px; border-top:1px solid rgba(135,115,76,.22);
            text-align:center; font-size:15px; color:rgba(44,62,80,.5); line-height:1.7; }}
</style></head><body>
  <header>
    <img src="{LOGO}">
    <p class="kicker">DreamersJoy Floral Studio &middot; Fall 2026</p>
    <h1>The Fall Edit</h1>
    <p class="sub">Color first. Flowers second.</p>
  </header>
  {blocks}
  <footer>
    We always design with the colors that are in season, as well as the blooms.<br>
    Every piece is composed from the best material available that week,
    so no two arrangements are identical.
  </footer>
</body></html>"""

open("/tmp/board.html","w").write(html)
print("html written")
