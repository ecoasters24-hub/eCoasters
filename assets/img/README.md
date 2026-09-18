# Photos

All six slots are filled with your own photography. Nothing here is stock.

| File | Source | Size | Subject |
|---|---|---|---|
| `hero.jpg` | `IMG_0753_edited.jpg` | 280 KB | The group on the boardwalk through the reeds |
| `tour-hidden-gem.jpg` | `IMG_1165_edited.jpg` | 52 KB | Caparica beach, thumbs up |
| `tour-overlooking.jpg` | `IMG_0926_edited.jpg` | 80 KB | Ridge trail, the skyline across the bay |
| `tour-into-the-woods.jpg` | `IMG_0904_edited.jpg` | 132 KB | Cliff singletrack, ocean below |
| `book.jpg` | `IMG_1243_edited.jpg` | 60 KB | Sunset silhouettes |
| `about.jpg` | `IMG_0704-.jpg` | 108 KB | Gonçalo and Silvio with the bikes |

Originals live in `~/Downloads/website_ready_edited_photos/` and
`~/Desktop/Welcoming/eCoasters/Fotos e Videos/About Us/`.

## Why the hero is the boardwalk shot

The hero was originally `IMG_0963` (the dune, with Lisbon across the bay). It's a better
photograph — but the headline sits over its bright sky, and **31% of the headline's
backdrop failed 3:1 contrast** for the gold line. Gold is darker than a bright sky, so
"LISBON ENDS" all but vanished.

Measured by compositing each candidate with the exact CSS scrim on a canvas and sampling
the real bounding boxes of the text:

| Candidate | % of headline area failing 3:1 (gold) |
|---|---|
| IMG_0963 (dune) | 30.9% |
| IMG_0904 (cliff) | 42.0% |
| IMG_1332 (coast) | 23.4% |
| IMG_1194 (promenade) | 32.8% |
| **IMG_0753 (boardwalk)** | **8.4%** |

With the strengthened scrim now in `styles.css`, IMG_0753 lands at **2.2%**, and the
lede and stat rows are at **0%**. That's why the dark, moody one won.

If you ever swap the hero photo, re-check this — a bright sky on the left will break
the headline.

## About: the founders

`about.jpg` is the shot of you both standing with the bikes. Its native ratio is 1.27,
so `.about__media` is set to `5/4` — no crop through anyone's face. The other two shots
from that set (`IMG_0692-.jpg`, `IMG_0698-.jpg`) are portrait-ish and are unused; drop
either in and change the aspect-ratio to `9/10` if you prefer one of those.

Small mismatch worth knowing: the headline says *"Two locals and a pine forest"*, but
the photo is a palm-lined park. Nobody will notice, but you might want a shot from the
pinhal there instead.

## Compression

This Mac has no ImageMagick and no `cwebp`, so these are JPEGs made with `sips`.
`sips`' numeric quality flag barely moves file size — `formatOptions low` is the real
lever, and that's what produced these.

**Converting to WebP would cut roughly another 30%.** Do it on any machine with
`cwebp`, or with Squoosh (squoosh.app) in a browser. If you do, update the six
`--photo:url('/assets/img/*.jpg')` values in `index.html`.

The paths are root-absolute, so the site must be served from a domain root.
