# Canopy to Coral: image slots

All scenery (canopy, understory, river, mangroves, reef, deep reef, seabed) is inline SVG, so the page
looks complete with no image files at all. The slots below are for Celine's real photos and for
four optional generated "specimen plate" illustrations.

Every slot uses the shared placeholder contract (`../shared/ph.js`): drop a file at the exact path
and it replaces the placeholder automatically. Photos are cropped with `object-fit: cover`, so keep
the subject roughly centred.

## Photos (`celine/photos/`)

| Path | Where it appears | Ideal aspect | Notes |
|---|---|---|---|
| `../photos/headshot.jpg` | Canopy (hero), arch-shaped portrait framed by leaves | 4:5 portrait | Exists (644×965). Cropped from the top (`object-position: 50% 18%`). |
| `../photos/peru-rainforest.jpg` | Understory, tall photo beside the Peru card | 4:5 portrait or taller | On desktop it stretches to the card's height (about 3:5), so a vertical shot works best. |
| `../photos/peru-caiman.jpg` | Understory, photo row (1 of 3) | 4:3 (1:1 on phones) | A caiman from monitoring. |
| `../photos/peru-reforestation.jpg` | Understory, photo row (2 of 3) | 4:3 (1:1 on phones) | Planting / agroforestry plot. |
| `../photos/peru-expedition.jpg` | Understory, photo row (3 of 3) | 4:3 (3:2 full width on phones) | Patrol or expedition. |
| `../photos/gottingen.jpg` | River, top of the University of Göttingen card | 3:2 landscape | Campus, lecture hall or first field course. |
| `../photos/bund-local.jpg` | River, top of the BUND card | 3:2 landscape | A local group activity. |
| `../photos/utila-mangroves.jpg` | Mangrove, beside the "Mangrove reforestation" card | 15:11 (≈4:3) landscape | Planting mangroves on the shore. |
| `../photos/utila-coral-nursery.jpg` | Reef mosaic, large tile | ≈ 5:4 to 4:3 landscape | Fragments on a nursery tree. |
| `../photos/utila-reef-survey.jpg` | Reef mosaic, small tile | ≈ 4:3 or 1:1 | Survey with a dive slate. |
| `../photos/utila-lionfish.jpg` | Reef mosaic, small tile | ≈ 4:3 or 1:1 | Removal dive or dissection. |
| `../photos/utila-whaleshark.jpg` | Reef mosaic, small tile | ≈ 4:3 or 1:1 | Whale shark off Utila. |
| `../photos/utila-dive.jpg` | Reef mosaic, small tile | ≈ 4:3 or 1:1 | Celine on a dive. |
| `../photos/sodwana-reef.jpg` | Deep reef, Sodwana Bay card | 3:2 landscape | The reef at Sodwana Bay. |
| `../photos/sodwana-coast.jpg` | Deep reef, Sodwana Bay card | 3:2 landscape | Coast or dunes at Sodwana Bay. |
| `../photos/field-portrait.jpg` | Seabed, "Get in touch" (arch frame, mirrors the hero portrait) | 4:5 portrait | Celine in the field or in dive gear. |

Not used in this variant: `australia` (the brief says to keep Work & Travel light, so it is a text line in the hero's field log).

## Generated art (`celine/canopy-to-coral/art/`)

Four round "specimen plates" sit on the corners of field cards like stickers in a field notebook.
Each already has a hand-drawn inline SVG version underneath, so the art is optional: when a PNG
exists it simply covers the SVG. They are shown as circles about 85 to 130 px across, so keep the subject inside the
central ~70% of the square, with plain cream paper around it.

Shared style (already included in each prompt): naturalist field-journal plate, fine sepia ink line
with soft watercolour washes, warm cream paper `#f3ecd9`, muted natural colours, no text, no frame.

| Path | Where it appears | Aspect | Prompt |
|---|---|---|---|
| `art/plate-caiman.png` | Understory, top-right of the Peruvian Amazon card | 1:1, 800×800 PNG | `Naturalist field-journal illustration of a caiman lying at the surface of a calm Amazon oxbow lake, only its eyes, snout and the ridge of its back above the water, a single floating leaf nearby, gentle ripples. Fine sepia ink linework with soft watercolour washes in olive green, khaki and pale teal. Centered subject with generous empty margin on plain warm cream paper (#f3ecd9). No text, no labels, no border. Square composition.` |
| `art/plate-mangrove.png` | Mangrove, top-right of the "Mangrove reforestation" card | 1:1, 800×800 PNG | `Naturalist field-journal illustration of a young red mangrove seedling planted in shallow tidal water: a long propagule stem, four glossy oval leaves at the top, small arching prop roots entering pale sandy mud, a thin bamboo marker stake beside it. Fine sepia ink linework with soft watercolour washes in leaf green, warm brown and pale turquoise. Centered with generous margin on plain warm cream paper (#f3ecd9). No text, no labels, no border. Square composition.` |
| `art/plate-coral.png` | Reef, top-right of "Slate 01: Coral restoration" | 1:1, 800×800 PNG | `Naturalist field-journal illustration of three small branching staghorn coral fragments hanging on fishing line from a horizontal white PVC pipe of a coral nursery tree, tiny bubbles rising. Fine sepia ink linework with soft watercolour washes in coral orange, ochre, soft lilac and pale aqua. Centered with generous margin on plain warm cream paper (#f3ecd9). No text, no labels, no border. Square composition.` |
| `art/plate-lionfish.png` | Reef, top-right of "Slate 03: Invasive species" | 1:1, 800×800 PNG | `Naturalist field-journal illustration of a red lionfish in side view, facing left, with its striped body, long venomous dorsal spines and wide fan-like pectoral fins spread out. Fine sepia ink linework with soft watercolour washes in rust red, cream and soft coral. Centered with generous margin on plain warm cream paper (#f3ecd9). No text, no labels, no border. Square composition.` |

## Textures (vendored, not slots)

`textures/caustics.svg` (light network on the reef) and `textures/sand.svg` (sand ripples on the seabed)
are generated SVG tiles referenced from `style.css`.
