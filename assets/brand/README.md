# Brand assets

Generated from your Adobe Illustrator vector, `eCoasters_LogoSVG.svg`
(found in `~/Downloads`, also inside `~/Desktop/Welcoming/eCoasters/Logo/`).
No raster anywhere. These scale to any size and stay sharp.

| File | viewBox | gzip | Where |
|---|---|---|---|
| `mark-dark.svg` | 308×212 | 12.0 KB | **Header.** Symbol only — cream rider/ridge, gold sun. |
| `mark.svg` | 308×212 | 12.0 KB | Symbol in brand brown, for light surfaces. |
| `logo-full-dark.svg` | 308×300 | 18.3 KB | **Footer.** Full lockup, cream wordmark, gold slogan. |
| `logo-full.svg` | 308×300 | 18.3 KB | Full lockup in brand brown, for light surfaces. |

The originals are 500×500 with the artwork floating in the middle. These are cropped to
the artwork's real bounding box (measured with `getBBox()`), so `height: 40px` in CSS
gives you a 40px-tall logo, not 40px of mostly-empty canvas.

## The two brand colours

Read straight out of the vector's `<style>` block — not sampled, not guessed:

- **`#512406`** — brown. The wordmark, the rider, the ridge. (`.st1`)
- **`#F2B705`** — gold. The sun and the "e-bike adventures" slogan. (`.st0`)

Every colour in `styles.css` is one of these two hues at a different lightness.
If either ever changes, re-derive the whole ramp rather than nudging tokens by eye.

## Why the header doesn't use the full lockup

Below roughly 60px the wordmark and the wheel spokes collapse into a smudge. So the
header wears the **symbol alone** at 40px, with "eCoasters" set in Raleway beside it.
The footer gets the **full lockup** at 84px, where the slogan is still legible.

## ⚠️ The logo on your live Wix site is broken

Separate from this project: `LogoV2_edited_edited_edited_edited.png` in your Wix media
library has a crushed alpha channel — **max opacity 12/255, about 5%**, zero fully-opaque
pixels. On ecoasters.pt today it renders as a faint ghost. Export a fresh PNG from the
`.ai` and replace it.

## ⚠️ Acumin Pro — do not put it on the web

Your type folder contains Acumin Pro alongside Raleway. The Acumin files are named
`fonnts.com-Acumin_Pro_*.otf`; **fonnts.com is a font piracy site**. Acumin is an Adobe
typeface. Serving those files from a commercial website is copyright infringement, and
webfont licences are sold separately from desktop ones.

This site therefore uses:

- **Raleway** for body text — your brand's other face, and free on Google Fonts.
- **Anton** for the big display headlines — free, and it carries the punch that the
  reference sites you picked rely on.

If you want Acumin on the site, licence it through **Adobe Fonts** (included with a
Creative Cloud subscription) and swap `--disp` in `styles.css`. Until then, don't
self-host those `.otf` files.
