# vznstudiowebpage
Webpage for all things VZN studios and jozemi productions.

The site for **VZN — Vision Studio Co.**: a single-page portfolio and studio site.
No build step: plain HTML, CSS and JavaScript.

Design direction: black and bone like the ink logo, one red signal accent, a condensed
serif (Instrument Serif) for display type and a monospace (IBM Plex Mono) for everything
else. The work section is an index — a list of projects with a details table and a
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
