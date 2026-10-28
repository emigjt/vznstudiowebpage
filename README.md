# vznstudiowebpage
Webpage for all things VZN studios and jozemi productions.

The site for **VZN — Vision Studio Co.**: one page with four parts — the home hero,
**Work** (beats, mixes, artwork), **Shop** (merch) and **Contact**.
No build step: plain HTML, CSS and JavaScript.

Design direction: black and bone like the ink logo, one red signal accent, a serif
(Playfair Display) for display type and a clean sans (Inter Tight) for everything else.
In Work, scrolling down moves the page sideways from **Sound** (black) into **Visual**
(black ink on bone, like the original logo artwork).

## Preview locally

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Structure

```
index.html              Page content: hero, work, shop, contact
data/portfolio.js       Work: the Sound and Visual lists (edit this to add work)
data/shop.js            Shop products and their checkout links
assets/css/styles.css   All styles; brand colours and fonts live in :root at the top
assets/js/main.js       Work rails and audio player, viewer, shop, nav, contact form
assets/brand/           Logo (traced SVG, white/black), favicon, social share image
assets/brand/source/    Original logo file
assets/media/           Your project images, audio and video files
```

## Adding work

Open `data/portfolio.js`; it has two lists, `sound` and `visual`, and a field
reference at the top.

- **Sound** (beats, mixes): title, type (e.g. "Beat", "Mix & Master"), artist, BPM, key,
  year, a square cover image, and the audio. An MP3 in `assets/media/audio/` plays right
  on the card; a SoundCloud, Spotify or YouTube link opens in a player window.
- **Visual** (cover art, artwork, videos): title, type, client, year, the image, and
  optionally a video.

Items with the same `type` next to each other are grouped under one label. Items
without an image get a generated placeholder.

## Shop

Open `data/shop.js`: name, type, price, sizes, a photo and a checkout link per product.
The site can't take payments itself, so each **Buy** button opens your store's checkout
page (for example a Stripe Payment Link, or a Shopify, Big Cartel or Fourthwall product
page) in a new tab. Products without a link show "Coming soon".

## Edit mode

Open the site with `?edit` (or `#edit`) on the end of the address (e.g. `http://localhost:8000/?edit`)
to get a design panel on the live page:

- colour pickers for the background, text, accent and lines
- headline and body font pickers (Google Fonts), headline weight and case
- **your own fonts**: *Browse installed fonts* lists every font on your computer, each
  shown in its own typeface, with search (Chrome and Edge, after you allow font access);
  *Add font files* takes `.otf`, `.ttf`, `.woff` or `.woff2` files (any browser; drop them
  on the panel too). In Font Book, right-click a font and choose **Show in Finder** to
  get its files. Added files are kept in that browser until you remove them.
- sliders for headline size, line and letter spacing, body size, margins,
  section spacing, hero logo size and film grain
- **Edit text**: click any heading or paragraph on the page and retype it

Tweaks are kept in your browser only, so visitors never see them. A font you pick from
your own computer only shows on your machine until its web font files are added to the
site (in `assets/fonts/`); **Copy changes** lists which ones are needed. **Copy changes**
gives a summary (CSS values plus before/after text) to paste into the code or hand
to whoever maintains the site. **Reset all** goes back to the original.

## Hero logo scroll reveal

The hero logo rests faint behind the headline: softly blurred, lightly ink-warped,
with a still greyscale double-exposure ghost. Scrolling holds the hero in place while
the headline fades away and the logo sharpens into full view, then the page carries
on. Nothing animates on its own; every change follows the scroll.

It lives in `assets/js/logo-fx.js` and is controlled from `:root` in
`assets/css/styles.css`:

- `--logo-fx: 1` turns it on (the default); `0` turns it off and puts the logo back
  above the headline.
- `--fx-rest`, `--fx-blur`, `--fx-distort`, `--fx-ghost`, `--fx-offset` and
  `--fx-scroll` set how it looks behind the text and how much scrolling the reveal takes.
- `--fx-hold` is how much further the visitor scrolls with the revealed logo held in
  place before the page moves on, so it isn't skipped by accident.
- `--mark-scale` sets the logo size; `--fx-mark-y` and `--fx-mark-x` move it from the
  centre of the screen (negative = up / left).

All of these are in edit mode under **Logo effect**, so changes can be tried on the
live site without visitors seeing them.

## Rebranding

- **Colours and fonts:** edit the variables at the top of `assets/css/styles.css`.
- **Logo:** `assets/brand/logo-white.svg` is used on the site (`logo-black.svg` for light
  backgrounds, `logo.svg` takes the surrounding text colour when inlined).
- **Hero image/reel:** add an `<img>` or `<video>` inside `.hero-media` in `index.html`;
  it is shown desaturated behind the headline.
- **Social preview:** `assets/brand/og-image.png` (1200×630).

## Contact form

The form opens the visitor's email app by default. To receive submissions directly,
create a free form at [formspree.io](https://formspree.io) and paste its endpoint
into `FORM_ENDPOINT` in `assets/js/main.js`.

## Publishing

`.github/workflows/pages.yml` deploys the site to GitHub Pages on every push to `main`.
Enable it once under **Settings → Pages → Source: GitHub Actions**.
