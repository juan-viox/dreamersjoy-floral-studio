#!/usr/bin/env python3
"""
DreamersJoy Floral Studio — Season Record data.

ONE source of truth per season. To start a new season, copy a SEASON dict,
change the palettes / recipes / prices, and re-run build_season_record.py.

All wholesale stem prices are ESTIMATES for planning. Overwrite STEM_PRICES
with your actual invoice costs to make the COGS column real.
"""

# ── Wholesale stem prices (USD per stem / per branch) ──────────────────
# Fall 2026 estimates, Northeast US, peak wedding-season pricing.
STEM_PRICES = {
    # Fall
    "Dahlia — rust":                    4.00,
    "Dahlia — café au lait":            4.75,
    "Dahlia — burgundy":                4.25,
    "Butterfly ranunculus — terracotta":4.00,
    "Ranunculus — copper":              2.50,
    "Garden rose — antique dusty rose": 5.50,
    "Garden rose — toffee":             5.00,
    "Lisianthus — cream":               2.25,
    "Chocolate cosmos":                 3.50,
    "Scabiosa — plum":                  2.50,
    "Scabiosa pods":                    1.75,
    "Nigella pods":                     1.50,
    "Astilbe — blush":                  3.00,
    "Amaranthus — hanging":             2.75,
    "Copper beech branch":              4.25,
    "Smokebush branch":                 4.50,
    "Olive branch":                     2.75,
    "Hellebore — green":                4.75,
    "Spider chrysanthemum — white":     2.25,
    "Clematis vine":                    5.25,
    "Ornamental millet":                2.00,
    "Dried ruscus":                     1.75,
    # Spring
    "Ranunculus — butter yellow":       2.75,
    "Ranunculus — white":               2.75,
    "Sweet pea":                        2.25,
    "Jasmine vine":                     4.25,
    "French tulip — butter":            3.25,
    "Garden rose — blush":              5.00,
    "Lisianthus — white":               2.25,
    "Spirea branch":                    3.50,
    "Scabiosa — soft":                  2.25,
    "Hellebore — white":                4.75,
}

# ── Hard goods per size (vessel, mechanics, finishing) ─────────────────
HARD_GOODS = {
    "Petite":    {"Vessel — footed ceramic, 8–10\"": 7.50,  "Mechanics (frog, tape)": 1.50, "Care card": 0.75},
    "Signature": {"Vessel — footed ceramic, 12–14\"": 12.00, "Mechanics (frog, tape)": 2.25, "Care card": 0.75},
    "Statement": {"Vessel — low compote, 24–30\"": 16.00,   "Mechanics (pillow, wire)": 3.50, "Care card": 0.75},
    "Bouquet":   {"Kraft wrap": 1.25, "Cotton ribbon": 2.00, "Water tube + sleeve": 2.00, "Care card": 0.75},
}

# ── Studio design labour ───────────────────────────────────────────────
LABOUR_RATE = 40.00                               # $/hour, studio design time
LABOUR_HOURS = {"Petite": 0.50, "Signature": 0.75, "Statement": 1.25, "Bouquet": 0.40}

SIZES = ["Petite", "Signature", "Statement", "Bouquet"]

SIZE_SPECS = {
    "Petite":    "8–10\" wide · 9\" tall",
    "Signature": "12–14\" wide · 14\" tall",
    "Statement": "24–30\" long · low profile",
    "Bouquet":   "Hand-tied, wrapped",
}


# ═══════════════════════════════════════════════════════════════════════
#  SEASON — FALL 2026
# ═══════════════════════════════════════════════════════════════════════
FALL_2026 = {
    "slug": "fall-2026",
    "season": "Fall 2026",
    "edit_name": "The Fall Edit",
    "window": "September 22 – November 26, 2026",
    "color_source": "Pantone® Fashion Color Trend Report — New York, Autumn/Winter 2026",
    "color_source_note": "Palettes drawn directly from the Pantone AW26 report. Swatches are sRGB approximations for screen — not for colour matching.",
    "retail": {"Petite": 95, "Signature": 155, "Statement": 245, "Bouquet": 115},
    "notes": [
        "Fall stems carry a genuine peak-season premium: September–October is peak Northeast wedding season and dahlias, garden roses and butterfly ranunculus all price up.",
        "Entry price held at $95 to stay under Wyckoff Florist's $150 ceiling; margin recovered at Signature and Statement where the expensive focal stems concentrate.",
        "Statement is a long, low runner piece — a genuinely larger build than a standard large arrangement, priced accordingly.",
    ],
    "designs": [
        {
            "name": "Burnt Ember",
            "number": "Palette I",
            "tagline": "Rust, clay, candied ginger, cream",
            "style": (
                "The most extroverted of the three. Warm, spiced and sunlit, built on a single long "
                "draping line of amaranthus falling from the low side, with deliberate negative space "
                "held open on the high side. Copper beech gives the silhouette its width; the café au "
                "lait dahlia is the still point everything else moves around. One chartreuse bloom keeps "
                "it modern rather than rustic — without it the palette reads as harvest decor."
            ),
            "palette": [
                ("19-1245 TCX", "Arabian Spice",  "#8B4630", "Anchor"),
                ("16-1330 TCX", "Muted Clay",     "#D89B87", "Primary"),
                ("15-1213 TCX", "Candied Ginger", "#C1A18B", "Bridge"),
                ("11-0103 TCX", "Egret",          "#F0EBE1", "Breath"),
                ("13-0640 TCX", "Acacia",         "#DDD45F", "Accent — 5%"),
            ],
            # stem: {size: qty}
            "recipe": {
                "Dahlia — café au lait":             {"Petite": 1, "Signature": 1, "Statement": 2, "Bouquet": 1},
                "Dahlia — rust":                     {"Petite": 2, "Signature": 3, "Statement": 5, "Bouquet": 2},
                "Butterfly ranunculus — terracotta": {"Petite": 2, "Signature": 3, "Statement": 4, "Bouquet": 2},
                "Lisianthus — cream":                {"Petite": 2, "Signature": 3, "Statement": 4, "Bouquet": 3},
                "Chocolate cosmos":                  {"Petite": 0, "Signature": 2, "Statement": 3, "Bouquet": 1},
                "Amaranthus — hanging":              {"Petite": 1, "Signature": 1, "Statement": 2, "Bouquet": 1},
                "Copper beech branch":               {"Petite": 0, "Signature": 1, "Statement": 2, "Bouquet": 0},
                "Ornamental millet":                 {"Petite": 0, "Signature": 0, "Statement": 0, "Bouquet": 1},
            },
        },
        {
            "name": "Olive Smoke",
            "number": "Palette II",
            "tagline": "Burnt olive, green envy, smoke, cream",
            "style": (
                "The most restrained palette we've run. Herbal, architectural, almost entirely green and "
                "grey, with the cream spider chrysanthemum doing the work a focal bloom would normally do. "
                "Olive branches set a wide horizontal axis; smokebush adds the darker mass low and centre. "
                "This one lives or dies on negative space — under-fill it. The single toffee accent is what "
                "stops it reading cold."
            ),
            "palette": [
                ("18-0521 TCX", "Burnt Olive",  "#5A5641", "Anchor"),
                ("16-0541 TCX", "Green Envy",   "#9C9426", "Primary"),
                ("17-4005 TCX", "Underworld",   "#918F8C", "Bridge"),
                ("11-0103 TCX", "Egret",        "#F0EBE1", "Breath"),
                ("18-1031 TCX", "Toffee",       "#7C5231", "Accent — 10%"),
            ],
            "recipe": {
                "Spider chrysanthemum — white": {"Petite": 2, "Signature": 3, "Statement": 5, "Bouquet": 3},
                "Hellebore — green":            {"Petite": 2, "Signature": 3, "Statement": 4, "Bouquet": 2},
                "Olive branch":                 {"Petite": 3, "Signature": 4, "Statement": 6, "Bouquet": 3},
                "Smokebush branch":             {"Petite": 0, "Signature": 1, "Statement": 2, "Bouquet": 0},
                "Nigella pods":                 {"Petite": 2, "Signature": 3, "Statement": 4, "Bouquet": 2},
                "Scabiosa pods":                {"Petite": 1, "Signature": 2, "Statement": 3, "Bouquet": 0},
                "Lisianthus — cream":           {"Petite": 0, "Signature": 2, "Statement": 3, "Bouquet": 2},
                "Dried ruscus":                 {"Petite": 0, "Signature": 0, "Statement": 2, "Bouquet": 1},
            },
        },
        {
            "name": "Mahogany Dusk",
            "number": "Palette III",
            "tagline": "Red mahogany, foxglove, toffee",
            "style": (
                "The evening palette. Deep maroon dahlias carry the mass; antique dusty-rose garden roses "
                "lift it so the whole thing doesn't sink into shadow. Astilbe and clematis vine supply the "
                "movement — the vine should trail well past the vessel on one side only. Designed to hold a "
                "candlelit table, so it is built to read at low light: keep the dusty pink forward, the "
                "maroon behind it."
            ),
            "palette": [
                ("19-1521 TCX", "Red Mahogany",     "#5B3139", "Anchor"),
                ("16-1710 TCX", "Foxglove",         "#C695A6", "Primary"),
                ("18-1031 TCX", "Toffee",           "#7C5231", "Bridge"),
                ("15-1213 TCX", "Candied Ginger",   "#C1A18B", "Breath"),
                ("19-2434 TCX", "Festival Fuchsia", "#9E2469", "Accent — 5%"),
            ],
            "recipe": {
                "Dahlia — burgundy":               {"Petite": 2, "Signature": 3, "Statement": 5, "Bouquet": 3},
                "Garden rose — antique dusty rose":{"Petite": 2, "Signature": 3, "Statement": 4, "Bouquet": 2},
                "Garden rose — toffee":            {"Petite": 0, "Signature": 1, "Statement": 2, "Bouquet": 0},
                "Chocolate cosmos":                {"Petite": 1, "Signature": 2, "Statement": 3, "Bouquet": 2},
                "Scabiosa — plum":                 {"Petite": 1, "Signature": 2, "Statement": 3, "Bouquet": 1},
                "Astilbe — blush":                 {"Petite": 1, "Signature": 2, "Statement": 2, "Bouquet": 1},
                "Clematis vine":                   {"Petite": 0, "Signature": 0, "Statement": 1, "Bouquet": 0},
            },
        },
    ],
}


# ═══════════════════════════════════════════════════════════════════════
#  SEASON — MOTHER'S DAY 2026  (archive record)
# ═══════════════════════════════════════════════════════════════════════
MOTHERS_DAY_2026 = {
    "slug": "mothers-day-2026",
    "season": "Mother's Day 2026",
    "edit_name": "The Spring Edit",
    "window": "Pre-orders closed May 8 · Delivery May 7–10, 2026",
    "color_source": "Brand palette — drawn from the studio's spring invitation suite",
    "color_source_note": "This edit predates the Pantone-referenced palette system introduced for Fall 2026. Swatches recorded here are sRGB approximations of the colours as built.",
    "retail": {"Petite": 95, "Signature": 145, "Statement": 195, "Bouquet": 110},
    "notes": [
        "Archive record, reconstructed for the studio's files.",
        "Only Quiet Bloom was offered in the Statement size; Veiled Citrus and Olive Air ran Petite and Signature only.",
        "Spring stem costs run materially below fall — the same build prices roughly 15–20% cheaper in May than in October.",
    ],
    "designs": [
        {
            "name": "Veiled Citrus",
            "number": "Palette I",
            "tagline": "Soft yellow, cream, fresh green",
            "style": (
                "The brightest of the spring three. Butter-yellow ranunculus and French tulips against "
                "cream, lifted with jasmine vine for scent and trailing line. Sweet pea softens the edges. "
                "Built light and high-shouldered — this one should look like it is still opening."
            ),
            "palette": [
                ("—", "Butter Yellow", "#EBD9A0", "Anchor"),
                ("—", "Soft Apricot",  "#E8C4A0", "Primary"),
                ("—", "Cream",         "#F5EFE3", "Breath"),
                ("—", "Fresh Green",   "#A8B892", "Foliage"),
            ],
            "sizes_offered": ["Petite", "Signature", "Bouquet"],
            "recipe": {
                "Ranunculus — butter yellow": {"Petite": 4, "Signature": 6, "Statement": 0, "Bouquet": 5},
                "French tulip — butter":      {"Petite": 2, "Signature": 3, "Statement": 0, "Bouquet": 2},
                "Sweet pea":                  {"Petite": 3, "Signature": 4, "Statement": 0, "Bouquet": 3},
                "Lisianthus — white":         {"Petite": 1, "Signature": 2, "Statement": 0, "Bouquet": 2},
                "Jasmine vine":               {"Petite": 0, "Signature": 1, "Statement": 0, "Bouquet": 0},
            },
        },
        {
            "name": "Olive Air",
            "number": "Palette II",
            "tagline": "Muted olive, ivory, soft white",
            "style": (
                "The quiet one, and the direct ancestor of Fall's Olive Smoke. White hellebore and white "
                "ranunculus on olive branch, with nothing louder than ivory anywhere in it. Sculptural, "
                "tonal, generous with space. Sold best to clients who had already bought from us once."
            ),
            "palette": [
                ("—", "Muted Olive", "#8A8F73", "Anchor"),
                ("—", "Sage",        "#B3BCA5", "Primary"),
                ("—", "Ivory",       "#F2EDE2", "Breath"),
                ("—", "Soft White",  "#FAFAF6", "Highlight"),
            ],
            "sizes_offered": ["Petite", "Signature", "Bouquet"],
            "recipe": {
                "Hellebore — white":   {"Petite": 2, "Signature": 3, "Statement": 0, "Bouquet": 2},
                "Ranunculus — white":  {"Petite": 4, "Signature": 5, "Statement": 0, "Bouquet": 4},
                "Olive branch":        {"Petite": 2, "Signature": 3, "Statement": 0, "Bouquet": 2},
                "Lisianthus — white":  {"Petite": 0, "Signature": 2, "Statement": 0, "Bouquet": 2},
                "Spirea branch":       {"Petite": 0, "Signature": 1, "Statement": 0, "Bouquet": 0},
            },
        },
        {
            "name": "Quiet Bloom",
            "number": "Palette III",
            "tagline": "Blush, dusty rose, soft neutrals",
            "style": (
                "The best seller, and the only palette we ran in Statement. Blush garden roses layered "
                "over dusty rose and soft neutrals, with scabiosa for texture and airy movement through "
                "the top third. Romantic without being sweet — the taupe is what keeps it adult."
            ),
            "palette": [
                ("—", "Blush",        "#E5C4BE", "Anchor"),
                ("—", "Dusty Rose",   "#C99A96", "Primary"),
                ("—", "Soft Neutral", "#E3D5C8", "Bridge"),
                ("—", "Taupe",        "#B9A491", "Breath"),
            ],
            "sizes_offered": ["Petite", "Signature", "Statement", "Bouquet"],
            "recipe": {
                "Garden rose — blush": {"Petite": 2, "Signature": 3, "Statement": 4, "Bouquet": 3},
                "Ranunculus — white":  {"Petite": 3, "Signature": 4, "Statement": 5, "Bouquet": 3},
                "Lisianthus — white":  {"Petite": 2, "Signature": 3, "Statement": 4, "Bouquet": 2},
                "Scabiosa — soft":     {"Petite": 2, "Signature": 3, "Statement": 3, "Bouquet": 2},
                "Sweet pea":           {"Petite": 0, "Signature": 2, "Statement": 3, "Bouquet": 0},
                "Spirea branch":       {"Petite": 0, "Signature": 0, "Statement": 1, "Bouquet": 0},
            },
        },
    ],
}

SEASONS = [FALL_2026, MOTHERS_DAY_2026]
