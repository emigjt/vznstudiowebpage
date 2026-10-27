# vznstudiowebpage
Webpage for all things VZN studios and jozemi productions.

The site for **VZN — Vision Studio Co.**: a single-page portfolio and studio site.
No build step: plain HTML, CSS and JavaScript.

Design direction: black and bone like the ink logo, one red signal accent, a serif
(Playfair Display) for display type and a clean sans (Inter Tight) for everything else. The work section is an index — a list of projects with a details table and a
gallery of varied-size images beside it.

## Preview locally

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Structure

```
index.html              Page content: hero, work, studio, services, contact
data/portfolio.js       Portfolio entries (edit this to add work)
assets/css/styles.css   All styles; brand colours and fonts live in :root at the top
assets/js/main.js       Work index, filters, gallery/players, nav, contact form
assets/brand/           Logo (traced SVG, white/black), favicon, social share image
assets/brand/source/    Original logo file
assets/media/           Your project images, audio and video files
```

## Adding work

1. Put the project's images in a folder such as `assets/media/project-name/`.
2. Open `data/portfolio.js` and add an entry: title, client, year, type, role, the list
   of images, and optionally a YouTube, Vimeo, SoundCloud, Spotify or local audio/video
   player. The field reference is at the top of that file.

Projects without images get generated placeholder covers. Each project has its own
shareable link, e.g. `/#work/project-name`.

## Edit mode

Open the site with `?edit` (or `#edit`) on the end of the address (e.g. `http://localhost:8000/?edit`)
to get a design panel on the live page:

- colour pickers for the background, text, accent and lines
- headline and body font pickers (Google Fonts), headline weight and case
- sliders for headline size, line and letter spacing, body size, margins,
  section spacing, hero logo size and film grain
- **Edit text**: click any heading or paragraph on the page and retype it

Tweaks are kept in your browser only, so visitors never see them. **Copy changes**
gives a summary (CSS values plus before/after text) to paste into the code or hand
to whoever maintains the site. **Reset all** goes back to the original.

## Hero logo focus effect (experimental, off by default)

At rest the hero logo is blurred, ink-warped and ghosted in red and blue with
smear bands; as the cursor approaches it pulls into focus (tap on touch screens).
It lives in `assets/js/logo-fx.js` and is controlled from `:root` in
`assets/css/styles.css`:

- `--logo-fx: 0` keeps it off; set it to `1` to switch it on for everyone.
- `--fx-blur`, `--fx-offset`, `--fx-distort`, `--fx-ghost`, `--fx-slices`, `--fx-glow`,
  `--fx-tint-a` and `--fx-tint-b` set its strength and colours.

All of these are in edit mode under **Logo effect**, so it can be tried on the live
site without visitors seeing it.

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
