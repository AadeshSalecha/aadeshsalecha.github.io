# Images: "Transect" (feature variant)

Drop real photos into `celine/photos/` with the exact filenames below. Each slot uses the
placeholder contract in `celine/shared/ph.js`: until the file exists, the page shows a styled
"FPO · Photo to come" proof box (crop marks, slot name, brief). Once the file is there, the photo
appears with no code changes.

Every frame crops with `object-fit: cover`, so the ratios below are what the layout shows. Shoot or
crop a little wider than the ratio and keep the subject away from the edges.

## Photo slots

| Slot / path | Where it appears | Ideal aspect | Notes |
|---|---|---|---|
| `photos/field-portrait.jpg` | **Cover**, full-bleed behind the masthead and cover line | 3:2 landscape, at least 2400 px wide | Celine in the field or in dive gear. Subject right of centre. Keep the top third calm (sky/water) for the TRANSECT masthead and the lower left calm for the cover line. On phones the frame becomes tall, so it crops to the centre. |
| `photos/headshot.jpg` *(exists)* | Feature opener portrait; Contributor box | 2:3 portrait | Already in place. |
| `photos/gottingen.jpg` | "Field file · Now" sidebar (Göttingen) | 3:2 | Campus, old town, or a first field course. Shown small (about 260 px wide). |
| `photos/utila-whaleshark.jpg` | **Chapter I opener**, full-bleed (about 92% of the screen height) | 16:9, at least 2400 px wide | The chapter title sits bottom-left over a dark gradient, so keep the lower left calm. |
| `photos/utila-coral-nursery.jpg` | Chapter I gallery, image 1 | 4:5 portrait | Becomes 4:3 on phones. |
| `photos/utila-reef-survey.jpg` | Chapter I gallery, image 2 (offset lower) | 4:5 portrait | A diver with a slate or transect tape suits the magazine's "transect" theme. |
| `photos/utila-lionfish.jpg` | Chapter I gallery, image 3 | 4:5 portrait | Lionfish on the reef, or the removal/dissection. |
| `photos/peru-rainforest.jpg` | **Chapter II**, full-bleed spread under the title | 2:1 panorama (4:3 on tablets/phones) | Canopy, river or trail. |
| `photos/peru-caiman.jpg` | Chapter II gallery, large image | 4:3 landscape | |
| `photos/peru-reforestation.jpg` | Chapter II gallery, top right | about 4:3 (square on phones) | |
| `photos/peru-expedition.jpg` | Chapter II gallery, bottom right | about 4:3 (square on phones) | |
| `photos/sodwana-reef.jpg` | **Chapter III** split spread: fills the left half of the screen and stays pinned while the text scrolls | Tall portrait, 4:5 or taller (shown at about 640 × 900 on desktop) | The caption sits on the bottom-left, so avoid detail there. |
| `photos/sodwana-coast.jpg` | Chapter III, under the field file | 3:2 | |
| `photos/bund-local.jpg` | Chapter IV, inline in the text | 3:2 | With the BUND local group in Neukirchen-Vluyn/Moers. |
| `photos/australia.jpg` | Chapter IV "Postscript" thumbnail | 4:3 | Small (about 150 px wide). Any 2026 Work & Travel scene. |

Not used in this variant: `utila-mangroves`, `utila-dive`, `peru-*` beyond the three above. Any
of them can be swapped into a gallery frame by changing the `src`/`data-slot` pair.

Every photo caption carries the credit "Photo: Celine Willemsen".

## Illustrations (`art/`)

None. Every graphic in this variant is drawn in code, so nothing needs to be generated:

- **World dot map** ("The route"): inline SVG generated from Natural Earth 1:110m land data
  (public domain, via the `world-atlas` package), Natural Earth projection, vendored into
  `index.html`. On phones the script crops it to the Atlantic so labels stay readable.
- **Transect tape rule** (masthead, section tops, field files): CSS gradients.
- **Quadrat mark** (running header logo, field-file bullets, end mark, favicon): inline SVG/CSS.
- **Depth line** (credentials): CSS.
