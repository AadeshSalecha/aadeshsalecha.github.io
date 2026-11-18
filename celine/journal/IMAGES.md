# Field Journal variant: image slots

Every photo below is wired with the placeholder contract from `../shared/ph.js`. Until a file exists, the page shows a dashed "affix photograph here" frame with the slot name and a pencil hint. Drop a JPEG into `celine/photos/` with the exact filename and it appears; nothing else needs to change.

Photos are shown inside white snapshot borders, slightly tilted, with tape or photo corners. Any reasonable aspect ratio works (the frame follows the image), but the ratios below fit the layout best.

## Photos in use (`celine/photos/`)

| File | Where it appears | Ideal aspect | Notes |
|---|---|---|---|
| `headshot.jpg` | Title page, taped-in portrait ("fig. 1, the author") | 2:3 portrait | Exists already. A slight sepia filter is applied in CSS so it sits on the paper. |
| `field-portrait.jpg` | Field entries intro, taped snapshot "In the field" | 4:3 landscape | Her in the field or in dive gear. |
| `utila-whaleshark.jpg` | Entry No. 4 (Utila), large photo with corners | 4:3 landscape | Whale shark at the surface off Utila. |
| `utila-coral-nursery.jpg` | Entry No. 4 (Utila), small taped photo overlapping the large one | 1:1 square | Coral fragments in the nursery. |
| `peru-rainforest.jpg` | Entry No. 3 (Peru), large taped photo | 4:3 landscape | Rainforest near Puerto Maldonado. |
| `peru-caiman.jpg` | Entry No. 3 (Peru), small taped photo | 1:1 square | Caiman during a monitoring survey. |
| `sodwana-reef.jpg` | Entry No. 2 (Sodwana Bay), large photo with corners | 4:3 landscape | Reef at Sodwana Bay. |
| `bund-local.jpg` | Entry No. 1 (BUND), small taped photo | 1:1 square | With the BUND local group, Lower Rhine. |
| `gottingen.jpg` | Studies, taped beside the specimen label | 5:4 landscape | Göttingen campus or old town. |

Not used by this variant (fine to supply anyway; other variants may use them): `utila-reef-survey`, `utila-lionfish`, `utila-mangroves`, `utila-dive`, `peru-reforestation`, `peru-expedition`, `sodwana-coast`, `australia`.

## Drawings

This variant has **no `art/` slots that need filling**. All plates are hand-built inline SVG line drawings, so the page is complete without generated art:

- Plate I: branching "tree of life" timeline (two versions: wide and phone)
- Plate II: chart of field stations (land outline from Natural Earth 110m via `world-atlas@2.0.2`, public domain, projected and vendored into the page)
- Plate III: whale shark; fig. a: lionfish; fig. b: young mangrove
- Plate IV: caiman from above; fig. c: rainforest seedling
- Plate V: branching hard coral
- fig. d: oak leaf
- Certificate stamps, postmark, postage stamp, specimen tags

### Optional upgrades (not wired in)

If you later want richer, engraved versions of the plates, generate them into `celine/journal/art/` and swap the matching inline `<svg class="sketch ...">` for an `<img src="art/<name>.png" data-slot="<name>" data-hint="..." alt="..." width=".." height="..">`. Prompts that match this style:

| Path | Replaces | Aspect | Prompt |
|---|---|---|---|
| `art/plate-whaleshark.png` | Plate III | 5:2 | 19th-century naturalist's field-journal plate: a whale shark (Rhincodon typus) in side view, fine sepia ink line engraving with cross-hatching, its spot-and-stripe pattern drawn as stipple, a pale teal watercolour wash behind it, on aged cream paper, no text, no border, generous empty margin. |
| `art/plate-caiman.png` | Plate IV | 5:2 | Victorian natural-history plate of a caiman seen from directly above, legs splayed, dorsal scutes shown in neat rows, sepia ink line engraving with light hatching, soft olive-green watercolour wash, aged cream paper, no text, no border. |
| `art/plate-coral.png` | Plate V | 1:1 | Hand-coloured 19th-century engraving of a branching hard coral colony on a small rock, sepia ink outlines, pale ochre and coral-pink tint on the branches, faint blue-grey watercolour wash behind, aged cream paper, no text, no border. |
| `art/fig-lionfish.png` | fig. a | 4:3 | Naturalist field-sketch of a lionfish with fanned pectoral fins and long separate dorsal spines, sepia ink line drawing, light rust-red watercolour wash, aged cream paper, no text, no border. |
| `art/fig-mangrove.png` | fig. b | 3:5 | Botanical field sketch of a young red mangrove propagule planted in shallow water, two small leaves, waterline and mud hatched in sepia ink, faint teal wash for water, aged cream paper, no text. |
| `art/fig-seedling.png` | fig. c | 4:5 | Botanical field sketch of a tropical rainforest tree seedling with drip-tip leaves and a small root system, sepia ink with light green watercolour wash, aged cream paper, no text. |
| `art/fig-oak.png` | fig. d | 2:3 | Pressed-specimen style drawing of a single European oak leaf, sepia ink outline and veins, muted green wash, aged cream paper, no text. |
