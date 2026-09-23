"""
The studio's catalogue, as the build sheets need it.

Everything here is lifted from the live site — the collection copy, the
named stems, the prices and the product shots — so a sheet can never
describe something the shop doesn't sell. Seasonality is the one thing
added on top, because the site doesn't say it and it is the thing that
decides whether a stem can be bought at all this week.
"""

SITE_IMAGES = "../nextjs/public/cinematic/assets/images"

# --- palettes -------------------------------------------------------------
# Swatches are INDICATIVE. The words are the studio's own; the hexes are a
# reading of them, and every sheet says so rather than implying a measurement.

PALETTES = {
    "Soft Garden": {
        "words": "Ivory, blush, pale peach, soft green",
        "line": "Classic garden florals with softness, air, and gentle movement.",
        "swatches": [("Ivory", "#F2EAE0"), ("Blush", "#E8C4BE"),
                     ("Pale peach", "#F0C9A8"), ("Soft green", "#A8B89A")],
    },
    "Dusty Romantic": {
        "words": "Mauve, antique rose, muted plum, dusty blush",
        "line": "Depth and mood through layered tones and texture.",
        "swatches": [("Mauve", "#B89BC4"), ("Antique rose", "#C08A72"),
                     ("Muted plum", "#5A2E3C"), ("Dusty blush", "#D9A898")],
    },
    "Citrus Sculptural": {
        "words": "Apricot, coral, butter yellow, soft green",
        "line": "Softness with modern structure. Fresh and sculptural.",
        "swatches": [("Apricot", "#E8A868"), ("Coral", "#E4806A"),
                     ("Butter yellow", "#EBCB7E"), ("Soft green", "#A8B89A")],
    },
    "Burnt Ember": {
        "words": "Rust, café au lait, terracotta, deep amaranth",
        "line": "Warm, spiced and sunlit.",
        "swatches": [("Rust", "#B5623A"), ("Café au lait", "#C9A88C"),
                     ("Terracotta", "#CE7A52"), ("Amaranth", "#7E3B3B")],
    },
    "Olive Smoke": {
        "words": "Olive, smoke grey, white-green, dusty blue",
        "line": "Herbal, quiet, architectural.",
        "swatches": [("Olive", "#7C8560"), ("Smoke", "#9AA39B"),
                     ("White-green", "#DDE3D4"), ("Dusty blue", "#6E7F8A")],
    },
    "Mahogany Dusk": {
        "words": "Burgundy, antique rose, chocolate, plum",
        "line": "The evening palette.",
        "swatches": [("Burgundy", "#6B2437"), ("Antique rose", "#C08A72"),
                     ("Chocolate", "#4A2A28"), ("Plum", "#5A2E3C")],
    },
    "Giftable": {
        "words": "Seasonal — florist's choice",
        "line": "Built from whatever is best that week, in one coherent palette.",
        "swatches": [("Soft", "#E8C4BE"), ("Warm", "#C08A72"),
                     ("Deep", "#5A2E3C"), ("Green", "#A8B89A")],
    },
}

# --- seasonality ----------------------------------------------------------
# Months a stem can realistically be bought in the northeast US. Garden roses,
# lisianthus and orchids are effectively year-round on the import market; the
# rest genuinely disappear, and that is what a build sheet has to warn about.

ALL = set(range(1, 13))
SEASON = {
    "garden roses":   (ALL, "Year-round on import. Best and cheapest May–September."),
    "roses":          (ALL, "Year-round."),
    "lisianthus":     (ALL, "Year-round; peak and cheapest June–September."),
    "orchid":         (ALL, "Year-round."),
    "chrysanthemum":  (ALL, "Year-round commercially; at its best in autumn."),
    "ranunculus":     ({1,2,3,4,5}, "Winter into spring only. Gone by June."),
    "sweet pea":      ({4,5,6}, "A narrow spring window. Very short vase life."),
    "tulips":         ({1,2,3,4,5,12}, "Winter into spring."),
    "hellebore":      ({2,3,4}, "Late winter into early spring. Not findable in autumn."),
    "astilbe":        ({6,7,8}, "Early to mid summer. Tails off fast in September."),
    "dahlias":        ({7,8,9,10}, "Midsummer to first frost. Peak in September."),
    "scabiosa":       ({6,7,8,9,10}, "Summer into autumn."),
    "chocolate cosmos": ({7,8,9,10}, "Summer into autumn."),
    "amaranthus":     ({7,8,9,10}, "Summer into autumn."),
    "nigella":        ({6,7,8}, "Summer. Pods hold later."),
    "smokebush":      ({6,7,8,9,10}, "Summer into autumn."),
    "clematis":       ({6,7,8,9}, "Summer."),
    "jasmine vine":   ({4,5,6,7,8}, "Spring into summer."),
    "spirea":         ({3,4,5}, "A spring branch. Foliage only later in the year."),
    "olive branch":   (ALL, "Year-round from import."),
    "anemone":        ({1,2,3,4,10,11,12}, "Autumn through spring. Absent in high summer."),
}

# --- the catalogue --------------------------------------------------------

def a(aid, collection, palette, size, price, desc, image, stems):
    return dict(id=aid, collection=collection, palette=palette, size=size,
                price=price, desc=desc, image=image, stems=stems)

CATALOGUE = [
    # ---- Soft Garden
    a("softgarden-petite", "Soft Garden", "Soft Garden", "Petite", "$85+",
      "A refined, compact arrangement with intentional spacing. Delicate and quietly present.",
      "palette-softgarden-petite.webp",
      ["garden roses", "ranunculus", "sweet pea"]),
    a("softgarden-signature", "Soft Garden", "Soft Garden", "Signature", "$125+",
      "Layered blooms with soft movement. Fuller presence, airy feel.",
      "palette-softgarden-signature.webp",
      ["garden roses", "lisianthus", "scabiosa"]),
    a("softgarden-statement", "Soft Garden", "Soft Garden", "Statement", "$175+",
      "Expansive, design-forward with sculptural presence.",
      "palette-softgarden-statement.webp",
      ["garden roses", "sweet pea", "jasmine vine", "spirea"]),

    # ---- Dusty Romantic
    a("dustyromantic-petite", "Dusty Romantic", "Dusty Romantic", "Petite", "$85+",
      "Compact with controlled movement. Moody and intimate.",
      "palette-dustyromantic-petite.webp",
      ["garden roses", "scabiosa", "astilbe"]),
    a("dustyromantic-signature", "Dusty Romantic", "Dusty Romantic", "Signature", "$125+",
      "Fuller compositions with controlled movement. Rich and textured.",
      "palette-dustyromantic-signature.webp",
      ["garden roses", "hellebore", "scabiosa", "astilbe"]),
    a("dustyromantic-statement", "Dusty Romantic", "Dusty Romantic", "Statement", "$175+",
      "Depth and structure with moodier tones. Softly dramatic.",
      "palette-dustyromantic-statement.webp",
      ["garden roses", "scabiosa", "astilbe", "spirea"]),

    # ---- Citrus Sculptural
    a("citrussculptural-petite", "Citrus Sculptural", "Citrus Sculptural", "Petite", "$85+",
      "Fresh and minimal. Modern and expressive.",
      "palette-citrussculptural-petite.webp",
      ["garden roses", "ranunculus", "tulips"]),
    a("citrussculptural-signature", "Citrus Sculptural", "Citrus Sculptural", "Signature", "$125+",
      "Warm, expressive, with structural detail.",
      "palette-citrussculptural-signature.webp",
      ["garden roses", "ranunculus", "orchid"]),
    a("citrussculptural-statement", "Citrus Sculptural", "Citrus Sculptural", "Statement", "$175+",
      "Expansive and sculptural, built on a citrus palette.",
      "palette-citrussculptural-statement.webp",
      ["garden roses", "ranunculus", "orchid", "tulips"]),

    # ---- The Fall Edit — centrepieces
    a("fall-burnt-ember-signature", "The Fall Edit — Centrepiece", "Burnt Ember", "Centrepiece", "$95+",
      "Warm, spiced and sunlit.",
      "fall-burnt-ember.webp",
      ["dahlias", "ranunculus", "amaranthus", "garden roses"]),
    a("fall-olive-smoke-signature", "The Fall Edit — Centrepiece", "Olive Smoke", "Centrepiece", "$95+",
      "Herbal, quiet, architectural.",
      "fall-olive-smoke.webp",
      ["olive branch", "smokebush", "hellebore", "chrysanthemum", "nigella"]),
    a("fall-mahogany-dusk-signature", "The Fall Edit — Centrepiece", "Mahogany Dusk", "Centrepiece", "$95+",
      "The evening palette.",
      "fall-mahogany-dusk.webp",
      ["dahlias", "garden roses", "chocolate cosmos", "scabiosa", "clematis"]),

    # ---- The Fall Edit — hand-tied bouquets
    a("fall-burnt-ember-bouquet", "The Fall Edit — Hand-Tied", "Burnt Ember", "Bouquet", "$115",
      "A hand-tied bouquet in the Burnt Ember palette.",
      "fall-bouquet-burnt-ember.webp",
      ["dahlias", "ranunculus", "amaranthus"]),
    a("fall-olive-smoke-bouquet", "The Fall Edit — Hand-Tied", "Olive Smoke", "Bouquet", "$115",
      "A hand-tied bouquet in the Olive Smoke palette.",
      "fall-bouquet-olive-smoke.webp",
      ["olive branch", "smokebush", "hellebore", "chrysanthemum"]),
    a("fall-mahogany-dusk-bouquet", "The Fall Edit — Hand-Tied", "Mahogany Dusk", "Bouquet", "$115",
      "A hand-tied bouquet in the Mahogany Dusk palette.",
      "fall-bouquet-mahogany-dusk.webp",
      ["dahlias", "garden roses", "chocolate cosmos", "scabiosa"]),

    # ---- Giftable bouquets
    a("small-bouquet", "Giftable Bouquet", "Giftable", "Small", "$75+",
      "A small hand-tied bouquet, wrapped.",
      "bouquet-small.webp", ["garden roses", "lisianthus"]),
    a("medium-bouquet", "Giftable Bouquet", "Giftable", "Medium", "$95+",
      "A medium hand-tied bouquet, wrapped.",
      "bouquet-medium.webp", ["garden roses", "lisianthus", "scabiosa"]),
    a("large-bouquet", "Giftable Bouquet", "Giftable", "Large", "$115+",
      "A large hand-tied bouquet, wrapped.",
      "bouquet-large.webp", ["garden roses", "lisianthus", "scabiosa"]),
    a("signature-bouquet", "Giftable Bouquet", "Giftable", "Signature", "$125+",
      "The signature hand-tied bouquet, wrapped.",
      "bouquet-signature.webp", ["garden roses", "lisianthus", "scabiosa", "dahlias"]),
]

# --- stem counts by size --------------------------------------------------
# Rough working counts, not a recipe: focal / secondary / accent / texture /
# foliage. What matters on the sheet is the ratio and the total.

COUNTS = {
    "Petite":      dict(focal=3, secondary=3, accent=2, texture=4, foliage=3, total="15–20"),
    "Signature":   dict(focal=5, secondary=4, accent=3, texture=6, foliage=4, total="28–36"),
    "Statement":   dict(focal=9, secondary=7, accent=5, texture=10, foliage=7, total="45–60"),
    "Centrepiece": dict(focal=4, secondary=3, accent=3, texture=5, foliage=4, total="22–28"),
    "Bouquet":     dict(focal=5, secondary=4, accent=3, texture=5, foliage=4, total="24–32"),
    "Small":       dict(focal=3, secondary=2, accent=2, texture=3, foliage=3, total="12–16"),
    "Medium":      dict(focal=4, secondary=3, accent=2, texture=4, foliage=3, total="18–24"),
    "Large":       dict(focal=6, secondary=4, accent=3, texture=6, foliage=4, total="26–34"),
}

VESSEL = {
    "Petite":      "Low bowl or small compote, 5–6″. Chicken wire, no foam.",
    "Signature":   "Low footed compote, 8–9″ across and 4–5″ tall. Chicken wire, no foam.",
    "Statement":   "Wide compote or urn, 10–12″. Chicken wire armature, taped cross.",
    "Centrepiece": "Low bowl, 7–8″ — it has to be seen over at a table.",
    "Bouquet":     "Hand-tied in the hand, spiral bind, wrapped. No vessel.",
    "Small":       "Hand-tied, wrapped. No vessel.",
    "Medium":      "Hand-tied, wrapped. No vessel.",
    "Large":       "Hand-tied, wrapped. No vessel.",
}
