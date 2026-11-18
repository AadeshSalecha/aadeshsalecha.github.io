# Expedition Map: image slots

Every photo below is referenced as `../photos/<name>.jpg` and uses the placeholder contract in
`../shared/ph.js`: until the file exists, a dashed "photo to come" frame shows the slot name and hint.
Drop the real file into `celine/photos/` with the exact name and it appears; nothing else to change.

The same `<img>` tags are reused in the map's field card (the sidebar on desktop, the bottom sheet on
phones), so one file fills both places.

| Slot / path | Where it appears | Ideal aspect | Notes |
|---|---|---|---|
| `../photos/headshot.jpg` | "Now" section portrait (exists) | 4:5 crop of the 644×965 original | Cropped with `object-position: 50% 18%` |
| `../photos/gottingen.jpg` | Stop 06 card (Now section + field card) | 3:2 | Campus, old town or a field course |
| `../photos/australia.jpg` | Stop 05 waypoint card | 3:2 | Any Work & Travel shot, keep it light |
| `../photos/utila-whaleshark.jpg` | Stop 04 card, first photo (shown large in the field card) | 4:3 (16:9 in field card) | Whale shark at the surface |
| `../photos/utila-coral-nursery.jpg` | Stop 04 card | 4:3 | Coral nursery work |
| `../photos/utila-reef-survey.jpg` | Stop 04 card | 4:3 | Fish or coral survey underwater |
| `../photos/utila-lionfish.jpg` | Stop 04 card | 4:3 | Lionfish removal or dissection |
| `../photos/utila-mangroves.jpg` | Stop 04 card | 4:3 | Mangrove planting |
| `../photos/utila-dive.jpg` | Stop 04 card, last photo (wide in the field card) | 4:3 (16:9 in field card) | Celine on a dive, in gear |
| `../photos/peru-rainforest.jpg` | Stop 03 card, first photo | 4:3 (16:9 in field card) | Rainforest scene, Madre de Dios |
| `../photos/peru-caiman.jpg` | Stop 03 card | 4:3 | Caiman monitoring |
| `../photos/peru-reforestation.jpg` | Stop 03 card | 4:3 | Planting / reforestation plot |
| `../photos/peru-expedition.jpg` | Stop 03 card, last photo | 4:3 (16:9 in field card) | Patrol or rainforest expedition |
| `../photos/sodwana-reef.jpg` | Stop 02 card | 4:3 (16:9 in field card) | Reef at Sodwana Bay |
| `../photos/sodwana-coast.jpg` | Stop 02 card | 4:3 (16:9 in field card) | The coast at Sodwana Bay |
| `../photos/bund-local.jpg` | Stop 01 card (Moers / BUND) | 3:2 | With the local BUND group |

Not used in this variant: `field-portrait.jpg` (the headshot carries the Now section).

## Illustrations (`art/`)

None needed. Everything decorative is drawn in code:

- **World map**: inline SVG in `index.html` (Natural Earth 110m land via `world-atlas@2.0.2`,
  projected to Equal Earth with `d3-geo@3.1.1`, about 75 KB). Pin positions are precomputed.
- **Compass rose, legend, icons, dive profile**: inline SVG / CSS.
- **Topographic contour textures**: `topo-paper.svg` (hero background) and `topo-forest.svg`
  (contact section), generated from seamless noise; about 22 KB each.
