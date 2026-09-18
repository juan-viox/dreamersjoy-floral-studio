# Season Records

A record of every seasonal edit the studio runs — the palette, the style intent, the
floral recipe, and the costing behind each design. One document per season, same
format every time, so seasons and years can be compared side by side.

## What's here

| File | What it is |
|---|---|
| `season_data.py` | **The only file you edit.** Stem prices, hard goods, labour rate, and one dict per season. |
| `build_season_record.py` | Renders each season in `SEASONS` to HTML + print-ready PDF. |
| `DreamersJoy_Season_Record_fall_2026.pdf` | Fall 2026 — The Fall Edit |
| `DreamersJoy_Season_Record_mothers_day_2026.pdf` | Mother's Day 2026 — The Spring Edit (archive) |
| `Fall_2026_Palette_Board.png` | Fall 2026 palette board |

## Starting a new season

1. Open `season_data.py`.
2. Copy an existing season dict (e.g. `FALL_2026`) and rename it — `WINTER_2027`, say.
3. Change `slug`, `season`, `edit_name`, `window`, `color_source`, `retail` and `notes`.
4. Replace the three `designs` — for each: `name`, `tagline`, `style`, `palette`, `recipe`.
   - `palette` entries are `(pantone_code, name, hex, role)`. Use `"—"` for the code
     if the palette isn't Pantone-referenced.
   - `recipe` is `{stem name: {size: quantity}}`. Every stem must exist in `STEM_PRICES`.
5. Add the new dict to the `SEASONS` list at the bottom.
6. Run it:

```bash
cd season-records
pip install pillow                 # first time only
python3 build_season_record.py
```

PDFs land in this folder.

## Keeping the costing honest

`STEM_PRICES` ships with **planning estimates**, not invoices. Replace the numbers with
what you actually paid and every margin in the document becomes real. Prices move a lot
by season — the same dahlia is materially more expensive in October than in May — so it's
worth updating this at the start of each season rather than carrying last season's numbers
forward.

The costing splits deliberately into two lines:

- **Product gross margin** — retail less stems and hard goods. This is the number to price
  against. Healthy is 55–65%.
- **Net after labour** — the same thing with studio design time subtracted at
  `LABOUR_RATE`. This is what the piece actually contributes.

If product GM drops below about 55%, either the recipe has grown too full or the price is
too low for the stems being used.

## Sizes

`Petite` · `Signature` · `Statement` · `Bouquet` are defined once in `SIZE_SPECS` and
`LABOUR_HOURS`. A design that doesn't run in every size just gets `0` quantities, or an
explicit `sizes_offered` list (see Mother's Day 2026, where only Quiet Bloom ran in
Statement).
