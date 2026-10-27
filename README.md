# vznstudiowebpage
Webpage for all things VZN studios and jozemi productions.

A static, single-page portfolio and studio site. No build step: plain HTML, CSS and JavaScript.

## Preview locally

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Structure

```
index.html              Page content: hero, work, about, services, process, contact
data/portfolio.js       Portfolio entries (edit this to add work)
assets/css/styles.css   All styles; brand colours and fonts live in :root at the top
assets/js/main.js       Portfolio grid, filters, viewer, nav, contact form
assets/brand/           Logo, favicon, social share image
assets/media/           Your thumbnails, audio and video files
```

## Adding work

Open `data/portfolio.js` and add an entry. Each entry can point to a YouTube, Vimeo,
SoundCloud or Spotify link, or to an audio, video or image file in `assets/media/`.
The field reference is at the top of that file. Projects without a thumbnail get a
generated cover automatically.

## Rebranding

- **Colours and fonts:** edit the variables at the top of `assets/css/styles.css`.
- **Logo:** replace `assets/brand/logo.svg` and `assets/brand/favicon.svg`.
- **Social preview:** replace `assets/brand/og-image.svg` with a 1200×630 image.

## Contact form

The form opens the visitor's email app by default. To receive submissions directly,
create a free form at [formspree.io](https://formspree.io) and paste its endpoint
into `FORM_ENDPOINT` in `assets/js/main.js`.

## Publishing

`.github/workflows/pages.yml` deploys the site to GitHub Pages on every push to `main`.
Enable it once under **Settings → Pages → Source: GitHub Actions**.
