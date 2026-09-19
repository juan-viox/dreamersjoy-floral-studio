#!/usr/bin/env python3
"""
DreamersJoy Journal — post content.

Add a post by appending a dict to POSTS and re-running build_journal.py.
Newest first. `body` is a list of blocks:

    ("h2",   "A heading")
    ("p",    "A paragraph. <em>Inline HTML</em> is fine.")
    ("ul",   ["first item", "second item"])
    ("quote","A pulled line.")
    ("img",  ("image-file.webp", "Alt text / caption"))
"""

SITE = "https://dreamersjoystudio.com"
AUTHOR = "Sarah De Jesus"

POSTS = [
    {
        "slug": "autumn-flowers-in-season-new-jersey",
        "title": "What's in Season: Autumn Flowers in New Jersey, Month by Month",
        "category": "Seasonal Guide",
        "date": "2026-09-22",
        "date_label": "September 22, 2026",
        "read": "6 min",
        "description": (
            "A month-by-month guide to what actually blooms in New Jersey from "
            "September through November: dahlias, chrysanthemum, hellebore and "
            "the branches that carry an arrangement once the flowers thin out."
        ),
        "image": "fall-burnt-ember.webp",
        "excerpt": (
            "Dahlias peak and vanish faster than anyone expects. Here is what is "
            "actually available in Bergen County through the autumn, and when."
        ),
        "body": [
            ("p", "Autumn in New Jersey is a short, fast season. The flowers that define it, dahlias above all, arrive in force in September and are gone by the first hard frost, usually somewhere in late October. What replaces them is not a lesser thing, but it is a different thing: pods, branches, grasses, and the structural greens that carry a table once the blooms thin out."),
            ("p", "Here is what we actually source, month by month, and what we do with it."),

            ("h2", "September: peak dahlia"),
            ("p", "September is the most abundant month of the autumn and also the most expensive. It coincides with peak wedding season in the Northeast, which means the flowers everyone wants are the flowers everyone is bidding on."),
            ("ul", [
                "<strong>Dahlias</strong>: caf&eacute; au lait, rust, burgundy. The season's defining bloom. Short-lived in the vase, roughly four to six days, so they are worth the cost only when they are the focal point.",
                "<strong>Butterfly ranunculus</strong>: the first of the new crop. Finer and more translucent than standard ranunculus, and they open beautifully over several days.",
                "<strong>Chocolate cosmos</strong>: the dark, almost black note. A few stems change the entire read of an arrangement.",
                "<strong>Amaranthus</strong>: hanging varieties give you a long draping line. Nothing else does this as well in autumn.",
                "<strong>Celosia and ornamental millet</strong>: texture that photographs well and lasts.",
            ]),
            ("p", "If you are hosting in September, this is the month to spend on flowers rather than foliage. The blooms are at their best and there is no reason to hide them."),

            ("h2", "October: the turn"),
            ("p", "Dahlias hold through most of October and then stop, often abruptly. Garden roses become more reliable as the heat goes out of the season. This is the month where an arrangement starts leaning on its structure rather than its blooms."),
            ("ul", [
                "<strong>Garden roses</strong>: antique and toffee tones come into their own. More dependable than September's, and they open slowly.",
                "<strong>Copper beech</strong>: the branch that makes an autumn arrangement look autumnal without a single orange flower in it.",
                "<strong>Smokebush</strong>: deep plum foliage, wonderful mass low and centre.",
                "<strong>Scabiosa pods and nigella pods</strong>: the airy top layer. They dry in place, so they outlast everything else in the vase.",
                "<strong>Chrysanthemum</strong>: specifically spider and spoon varieties. Worth reclaiming from their reputation; the cultivated forms are sculptural and last two weeks.",
            ]),
            ("quote", "By late October the branch is doing more work than the bloom. That is not a compromise; it is the season telling you what it wants to be."),

            ("h2", "November: structure and restraint"),
            ("p", "November is the honest month. Local flowers are essentially finished, and what remains is either imported or dried. This is where a defined palette earns its keep: with fewer options, colour discipline is the only thing keeping an arrangement from looking like whatever was left."),
            ("ul", [
                "<strong>Hellebore</strong>: the season's quiet gift. Green, cream and plum forms. Cut late, once the seed pod has set, and they last.",
                "<strong>Olive and eucalyptus</strong>: silvered structure that reads cool against warm browns.",
                "<strong>Dried grasses and ruscus</strong>: used sparingly, not as a bohemian gesture but as line.",
                "<strong>Clematis vine</strong>: for trailing movement when nothing else is trailing.",
                "<strong>Imported ranunculus</strong>: the first of the new season begins arriving late in the month.",
            ]),

            ("h2", "A note on Thanksgiving"),
            ("p", "Thanksgiving is the single busiest delivery day of the autumn, and the flowers available that week are not the flowers available three weeks earlier. If you want dahlias on your Thanksgiving table, you are usually asking for something that stopped being available a month before."),
            ("p", "We plan Thanksgiving arrangements around what November actually offers: hellebore, garden roses, copper beech, pods; and we close orders the Monday before so nothing is rushed. Earlier is genuinely better, not a sales line."),

            ("h2", "What this means if you are ordering"),
            ("p", "Tell us the date before you tell us the flower. A September table and a November table want different things, and an arrangement designed for the week it is delivered will always look better than one designed against the calendar."),
        ],
    },
    {
        "slug": "choosing-centerpiece-size",
        "title": "How to Choose the Right Centerpiece Size for Your Table",
        "category": "Practical",
        "date": "2026-09-29",
        "date_label": "September 29, 2026",
        "read": "4 min",
        "description": (
            "Centerpiece sizing explained plainly: how vessel dimensions translate "
            "to a real table, why height matters more than width, and which scale "
            "suits a dinner for six versus a long table for twelve."
        ),
        "image": "fall-olive-smoke.webp",
        "excerpt": (
            "The most common ordering mistake is buying by price rather than by "
            "table. Here is how the three scales actually behave in a room."
        ),
        "body": [
            ("p", "Most people order a centerpiece by price. It is a reasonable instinct and it is usually the wrong one, because the thing that determines whether an arrangement works is not how much it cost; it is whether it fits the table it lands on."),
            ("p", "We build in three scales, described by the vessel rather than the spread, because the vessel is the part that does not change. Here is what each one actually does."),

            ("h2", "Petite: a 4 to 6 inch vessel"),
            ("p", "A single small footed bowl. It reads as a gesture rather than a centerpiece, which is exactly the point."),
            ("p", "Right for a kitchen island, a powder room, a bedside table, a desk, or a two-top. Also the correct choice when you want three or five small pieces running down a long table instead of one large one; a repeated Petite often looks better than a single Statement, and costs about the same."),

            ("h2", "Signature: a 7 to 9 inch vessel"),
            ("p", "Our most-ordered scale, and the default answer for a dining table seating four to six. A compote or pedestal bowl, roughly the footprint of a dinner plate, with the arrangement spreading wider than the vessel."),
            ("p", "This is also the right scale for an entry console or a mantel, where it is seen from one side and from a distance."),

            ("h2", "Statement: a 12 to 16 inch vessel"),
            ("p", "The anchor piece. A larger sculptural vessel for a long table, a foyer, or a room that needs one composition to carry it rather than several."),
            ("p", "Worth saying plainly: a Statement on a small table is not generous, it is crowded. If the table seats four, a Signature will look better and you will spend less."),

            ("h2", "The rule that matters more than size"),
            ("quote", "If your guests cannot see each other over it, the arrangement has failed, however beautiful it is."),
            ("p", "Roughly twelve to fourteen inches from the tabletop is the ceiling for anything sitting between seated guests. Above that, people lean around it all evening. We build dining centerpieces low and wide for this reason, and save height for consoles and entries where nobody is trying to talk through it."),

            ("h2", "Scent, and why we mostly avoid it"),
            ("p", "Heavily scented flowers on a dining table compete with the food. Lilies and hyacinth are the usual offenders. We keep the strongly fragrant material for entries and powder rooms, where it works in your favour."),

            ("h2", "A word on vessels"),
            ("p", "Vessels are chosen per arrangement and vary with availability: ceramic, compote, pedestal or glass, always selected to suit the palette. If you have a vessel you love and want us to design into it, say so when you order. We are happy to."),
        ],
    },
    {
        "slug": "why-we-design-color-first",
        "title": "Why We Design Colour First, and Flowers Second",
        "category": "The Studio",
        "date": "2026-10-06",
        "date_label": "October 6, 2026",
        "read": "5 min",
        "description": (
            "The case for a palette-led floral practice: how setting colour before "
            "sourcing produces more consistent work, and why it means no two "
            "DreamersJoy arrangements are ever identical."
        ),
        "image": "fall-mahogany-dusk.webp",
        "excerpt": (
            "Start with flowers and you end up with whatever the market had. Start "
            "with colour and the market becomes a set of options instead."
        ),
        "body": [
            ("p", "There are two ways to design an arrangement. You can start with the flowers: go to market, see what is beautiful, buy it, and compose around what you found. Or you can start with the colour, fix it before you leave the studio, and then find the best available material that serves it."),
            ("p", "We do the second, and it is the single decision that most shapes how our work looks."),

            ("h2", "What goes wrong with flowers-first"),
            ("p", "Sourcing first feels creative and is mostly not. What actually happens is that the market makes the decision for you. A good dahlia crop that week means a dahlia arrangement. A thin week means filler. Over a season the work drifts, and the drift is invisible to the designer and completely visible to a client looking at your last twenty pieces."),
            ("p", "It also makes consistency impossible. If a client loved what you delivered in April and wants something in that spirit in October, flowers-first has no way to answer that. Colour-first does."),

            ("h2", "How a palette actually gets built"),
            ("p", "Each season we set three. We always design with the colours that are in season, as well as the blooms: we read where colour is moving in fashion and interiors, and we set our palettes against it, so the work stays in conversation with what our clients are already seeing everywhere else."),
            ("p", "Every palette gets five roles, and each colour is assigned one:"),
            ("ul", [
                "<strong>Anchor</strong>: the deepest value. Gives the arrangement its weight and usually sits low and centre.",
                "<strong>Primary</strong>: the colour you will remember afterwards. The most stems.",
                "<strong>Bridge</strong>: the shade that makes the anchor and the primary look related rather than adjacent.",
                "<strong>Breath</strong>: the light value. Cream, ivory, pale tan. Without it a palette reads heavy and the eye has nowhere to rest.",
                "<strong>Accent</strong>: five to ten percent, no more. The note that stops the whole thing being tasteful and forgettable.",
            ]),
            ("p", "That last one does the most work for the least volume. In this season's Burnt Ember palette the accent is a single chartreuse bloom. Remove it and the arrangement reads as harvest decor. Include it and it reads as design."),

            ("h2", "What it means for what arrives at your door"),
            ("p", "No two arrangements we make are identical, because we compose to whatever is genuinely at its best that week. If the butterfly ranunculus are extraordinary on Tuesday, you get more of them. If they are tired, we use something else in the same value."),
            ("quote", "The palette is the promise. The specific stems are a judgement we make on the day."),
            ("p", "So the guarantee is not <em>these exact flowers</em>. It is that the piece will be unmistakably its palette, and that it will be built from the best material available rather than the material we committed to a week earlier."),

            ("h2", "Restraint is part of it"),
            ("p", "A defined palette also gives you permission to leave things out. When every colour has a job, a stem that does not serve one is easy to reject. Most arrangements we make are improved in the last five minutes by removing something, not adding it."),
            ("p", "We would rather deliver something quieter and more certain than something fuller and less sure."),
        ],
    },
]
