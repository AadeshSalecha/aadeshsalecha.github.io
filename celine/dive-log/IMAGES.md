# Dive Log: image slots

Drop real photos into `celine/photos/` using exactly these filenames. Nothing else needs to change: until a file
exists, `../shared/ph.js` shows a "viewfinder" placeholder with the slot name and a hint.

Photos are cropped with `object-fit: cover`, so any reasonably sized photo works. The ratios below are the boxes
they are cropped into; keep the subject near the centre. Aim for at least 1600 px on the long edge for the large
slots and 1000 px for the rest.

| Path | Where it appears | Box ratio (desktop / phone) | What works best |
|---|---|---|---|
| `photos/headshot.jpg` (exists) | Hero, inside the brass porthole | 1:1 circle, face upper centre | Studio portrait. The crop zooms on face and shoulders |
| `photos/gottingen.jpg` | 5 m "Now": above the programme card | 3:2 / 3:2 | Göttingen campus, old town or a first field course |
| `photos/australia.jpg` | 5 m "Now": small "Topside · 2026" thumbnail | 1:1 (92 px) | Any simple Work & Travel moment; reads at thumbnail size |
| `photos/utila-whaleshark.jpg` | Log 04 Utila: large lead photo | ~16:9 (2×2 grid cell) / 16:10 | Whale shark at or near the surface |
| `photos/utila-coral-nursery.jpg` | Log 04 Utila: grid | ~16:9 cell / 4:3 | Coral fragments on a nursery tree or line |
| `photos/utila-reef-survey.jpg` | Log 04 Utila: grid | ~16:9 cell / 4:3 | Survey slate, transect tape or fish count |
| `photos/utila-lionfish.jpg` | Log 04 Utila: grid, bottom row | ~16:9 cell / 4:3 | Lionfish removal or dissection |
| `photos/utila-mangroves.jpg` | Log 04 Utila: grid, bottom row | ~16:9 cell / 4:3 | Planting mangrove seedlings |
| `photos/utila-dive.jpg` | Log 04 Utila: grid, bottom row | ~16:9 cell / 16:9 | Celine on a dive, in gear |
| `photos/peru-rainforest.jpg` | Log 03 Peru: large lead photo | ~5:4 (2×2 cell) / 16:10 | Rainforest canopy or river near the sanctuary |
| `photos/peru-caiman.jpg` | Log 03 Peru: grid | ~5:4 cell / 4:3 | Caiman during a monitoring session |
| `photos/peru-reforestation.jpg` | Log 03 Peru: grid | ~5:4 cell / 4:3 | Planting saplings or agroforestry work |
| `photos/peru-expedition.jpg` | Log 03 Peru: grid, wide cell | ~2.6:1 cell / 16:9 | On patrol or expedition in the forest (wide shot) |
| `photos/sodwana-reef.jpg` | Log 02 Sodwana Bay: lead photo | ~2:1 / 16:10 | Reef scene at Sodwana Bay |
| `photos/sodwana-coast.jpg` | Log 02 Sodwana Bay: second photo | ~5:4 / 16:9 | Coastline, dunes or dive boat launch |
| `photos/bund-local.jpg` | Log 01 BUND: beside the details | 3:2 / 3:2 | With the BUND local group, Neukirchen-Vluyn/Moers |
| `photos/field-portrait.jpg` | 30 m Certifications: taped polaroid next to the logbook stamps | 4:5 portrait | Celine in the field or in dive gear |

## Illustrations (`art/`)

There are no `art/` slots in this variant. Every illustration is inline SVG drawn into the page, so nothing needs
generating:

- the brass porthole around the headshot, the surface ripples and the light rays
- the whale shark silhouette on the descent line, the fish school, the sea fans and the seabed
- the rainforest canopy leaves and the caiman at the waterline in the Peru "surface interval" band
- the three logbook stamps (Open Water, Advanced, Rescue + EFR) and the small line icons
- the dive-computer gauge and its dive profile (drawn by `script.js`)
