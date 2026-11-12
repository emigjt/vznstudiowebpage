# vznstudiowebpage
Webpage for all things VZN studios and jozemi productions.

The site for **VZN — Vision Studio Co.**: one page with four parts — the home hero,
**Work** (beats, mixes, artwork), **Shop** (merch) and **Contact**.
No build step: plain HTML, CSS and JavaScript.

Design direction: greyscale only, taken from the eye logo artwork. A charcoal page, soft
greys, bone white and a fine film grain; no accent colour. Gamiya Retro
(self-hosted) for display type and Inter Tight (self-hosted) for everything else.
In Work, scrolling down moves the page sideways from **Sound** (charcoal) into **Visual**
(ink on bone).

The first page is only the logo in the top left corner and the centred headline, slogan
and small Work / Shop / Contact links. The large menu in the top right (a Menu button on
phones) comes in once the hero has been scrolled past.

## Preview locally

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Structure

```
index.html              Page content: hero, work, shop, contact; sharing tags in the head
data/portfolio.js       Work: the Sound and Visual lists (edit this to add work)
data/shop.js            Shop products and their checkout links
data/media.js           Written by tools/optimize-images.py: sizes and lighter copies of each image
assets/css/styles.css   All styles; every colour, size, spacing and timing lives in :root at the top
assets/js/main.js       Work rails, the player, viewer, shop, nav, contact form
assets/js/logo-fx.js    Hero logo scroll reveal
assets/js/boot.js       Boot sequence (off; only downloaded when it will play)
assets/js/editor.js     Edit mode (only downloaded with ?edit)
assets/brand/           The eye mark (eye-white/-grey/-black.svg, eye.svg), icons, share image
assets/brand/source/    Logo artwork as supplied, and the template the icons and share image are made from
assets/fonts/           Self-hosted web fonts (Gamiya Retro, Inter Tight; Patchcode for the boot)
assets/fonts/source/    Font files as supplied
assets/media/texture/   Overlay textures (vintage scratches)
assets/media/audio/     Beats as 320 kbps MP3
assets/media/visual/    Artwork: ~800 px card image + ~1600 px "-large" version, each with AVIF and WebP copies
assets/media/shop/      Product photos (~1000 px square), each with AVIF and WebP copies
assets/media/originals/ Full-size originals (kept for reference; the site never loads them)
tools/                  optimize-images.py (image copies), make-brand-images.mjs (icons, share image)
site.webmanifest        Name and icons for "add to home screen"
```

The previous logo files (`logo*.svg`, `og-image.png`, `favicon-32.png`, `icon-512.png`,
`apple-touch-icon.png`) and the Coldag Serif fonts are still in the repository, unused, so
either swap can be undone.

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

Images: keep the full-size original in `assets/media/originals/` and add web-sized
JPEGs (about 800 px for the card, 1600 px for `full`). Then run

```bash
python3 tools/optimize-images.py     # needs Pillow 11.3+: pip install pillow
```

It writes an AVIF and a WebP copy beside every JPEG (and a 1000 px "-medium" pair of each
"-large" one, which phones use in the viewer) and lists them in `data/media.js`. Browsers
take the lightest format they understand and fall back to the JPEG. An image that hasn't
been through the tool simply stays a JPEG. The tool never changes the JPEGs.

Audio: convert masters to 320 kbps MP3 for the site (browsers can't rely on 24-bit
WAV, and MP3s are ~8x smaller), e.g.
`ffmpeg -i beat_master.wav -map_metadata -1 -c:a libmp3lame -b:a 320k assets/media/audio/beat.mp3`.
A beat's `peaks` (its real waveform on the cover) can be generated from the MP3; ask
whoever maintains the site, or leave it out for a generated waveform.

## The player

Pressing **Play** on a beat starts it and brings up a bar along the bottom of the screen
with play / pause, the title, the time, a close button, and a progress line along its
top edge with a round playhead: drag the playhead, or press anywhere on the line, to move
through the beat. One beat plays at a time; switching fades the old one out. Space pauses and resumes, the left
and right arrows move 5 seconds, and the phone's lock screen and headphone buttons work
(play, pause, next, previous).

The waveform on the cover is part of the player: its bars fill from the left as the beat
plays. Pressing a point on the waveform of the beat that is playing jumps there (dragging
works too); pressing a point on any other beat's waveform starts that beat from there.
With a mouse, a thin line follows the pointer to show where the press would land.

- `--wave-player: 0` in `assets/css/styles.css` switches the cover waveform back to a
  still picture with a thin progress line under it.
- `AUTO_ADVANCE` in `assets/js/main.js` is `false`: a beat stops when it ends. `true`
  plays the next one.

## Coming into view

Headlines, covers, artwork and the product photo arrive the way the hero logo does: out of
focus, then sharp. Small text fades and settles. Work turns from charcoal to bone through
a soft edge. `--focus-fx: 0` in `assets/css/styles.css` goes back to everything rising
into place, with a hard edge between Sound and Visual. Visitors who ask for reduced motion
get neither.

## Edit mode

Open the site with `?edit` (or `#edit`) on the end of the address (e.g. `http://localhost:8000/?edit`)
to get a design panel on the live page:

- colour pickers for the background, text and lines
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

The hero logo rests faint behind the headline: softly blurred, with a still greyscale
double-exposure ghost. Scrolling holds the hero in place while the headline fades away
and the logo sharpens into full view, crisp, then the page carries on. Nothing animates
on its own; every change follows the scroll.

To stay smooth, the blurred, half-sharp and sharp logos are separate layers whose blur
never changes (drawn once); scrolling only crossfades them. The layers are in
`index.html`, so the logo is in place from the first paint. The scene also eases toward
the scroll position (`EASE_MS` in `logo-fx.js`) so mouse-wheel notches glide.

It lives in `assets/js/logo-fx.js` and is controlled from `:root` in
`assets/css/styles.css`:

- `--logo-fx: 1` turns it on (the default); `0` turns it off and puts the logo back
  above the headline.
- `--fx-rest`, `--fx-blur`, `--fx-ghost`, `--fx-offset` and `--fx-scroll` set how it looks
  behind the text and how much scrolling the reveal takes. (`--fx-distort`, an ink warp
  made for the old line-drawn logo, is at 0.)
- `--fx-edge` is the softness of the revealed logo's edge and `--fx-halo` a glow around
  it (0 to 1). Both are at 0, so the revealed logo is crisp; the logo artwork's own look
  is about `1.4px` and `0.5`.
- `--fx-hold` is how much further the visitor scrolls with the revealed logo held in
  place before the page moves on, so it isn't skipped by accident.
- `--mark-scale` sets the logo size; `--fx-mark-y` and `--fx-mark-x` move it from the
  centre of the screen (negative = up / left).

All of these are in edit mode under **Logo effect**, so changes can be tried on the
live site without visitors seeing them.

## Boot sequence (being workshopped, off by default)

On a visitor's first load (once per browser session) the screen starts empty and plays
like a terminal: "Vision Studios" types out, `password:` appears and `visionbeyondsight`
types out, a loading bar fills to 100%, and "access granted" appears. Then the text
clears and the eye logo glitches on like a damaged tape (wavy tracking rows, torn and
cut bands, smears and drips, static and scanlines, flicker; all greyscale, drawn on a
canvas at a video-like 24 fps), exactly where the hero logo sits. It settles on the clean
logo and the screen fades into the page (the logo hands over to the hero logo). About 7.5 s; any click, key, scroll or tap skips it; visitors who ask for reduced
motion never see it. It is only an animation: nobody types anything and nothing is locked.

It lives in `assets/js/boot.js`, which (with its font) is only downloaded when the
sequence is going to play. The words are the `data-text`, `data-prompt`,
`data-password` and `data-granted` attributes on the `.boot` element in `index.html`.

- `--boot: 0` keeps it off; `1` turns it on for everyone.
- `--boot-speed`, `--boot-delay`, `--boot-load`, `--boot-hold`, `--boot-logo-time`,
  `--boot-glitch`, `--boot-fade`, `--boot-size`, `--boot-align` (`center` or `top-left`)
  and `--boot-password` (`show` or `hide`, which types asterisks) set its timing and look.

In edit mode it has its own group with these settings and a **Replay** button, and plays
on every load so changes can be judged.

To watch it while it's off, add `?boot` to the address (e.g. `…/vznstudiowebpage/?boot`,
or `?edit&boot` with the panel): it then plays on every load, on any device.

## Film grain and vintage scratches

**Grain** is a fine layer of light and dark specks over the whole page, like the logo
artwork's texture. It is balanced so it doesn't lighten or darken the page. `--grain`
sets its strength (0 is off); it is **Film grain** in edit mode.

**Scratches**: dust and scratch marks taken from a film texture
(`assets/media/originals/vintage-scratches.jpg`, reduced to greyscale scratches only in
`assets/media/texture/scratches.webp`), as a still texture behind all the content. It
shows wherever nothing paints its own background: the hero, Sound, Shop and Contact (the
boot screen, the bone Visual side and the viewer cover it). `--scratch` sets its opacity
(0 now, so it's off); at 0 the image isn't downloaded. It is **Vintage scratches** in
edit mode.

## The design system

Everything the page is built from is a named value at the top of `assets/css/styles.css`
(`:root`). Change a value there and it changes everywhere it is used.

- **Colour**: `--bg`, `--surface`, `--line`, `--line-strong`, `--text`, `--muted` on the
  dark side; `--paper`, `--ink`, `--ink-muted` on the bone side of Work. Four greys from
  the logo artwork (`#1c1b1b`, `#474646`, `#7a7979`, `#acabab`) and bone (`#e8e7e3`).
- **Type**: `--font-display`, `--font-ui`; sizes `--text-xs` to `--text-3xl` step up from
  `--text-size` by a fixed ratio; `--display-xl` and `--display-l` are the big headlines.
- **Spacing**: `--space-1` to `--space-9` (4 to 96 px), `--gap-fluid`, `--gap-wide`,
  `--space-block`.
- **Motion**: two curves (`--ease-out`, `--ease-in-out`), four lengths (`--dur-1` to
  `--dur-4`: 150, 300, 600, 1000 ms) and one stagger (`--stagger`).
- **Layers**: `--z-below` to `--z-skip` say what sits over what.
- **Switches**: `--logo-fx`, `--focus-fx`, `--wave-player`, `--boot`, `--grain`,
  `--scratch`.

## Rebranding

- **Colours and fonts:** edit the variables at the top of `assets/css/styles.css`.
- **Own fonts:** put `.woff2` files in `assets/fonts/` and add an `@font-face` rule at the
  top of `assets/css/styles.css` (Gamiya Retro's rule shows the pattern), then name the
  font first in `--font-display` or `--font-ui`. To go back to Coldag Serif, put
  `"Coldag Serif", "Playfair Display"` first in `--font-display`; its files and rules are
  still there. (Coldag has no `. , : - /`; those come from Playfair Display, which the
  page no longer loads by default: add its Google Fonts link back to `index.html`.)
- **Logo:** `assets/brand/eye-grey.svg` and `eye-white.svg` are used on the site
  (`eye-black.svg` for light backgrounds, `eye.svg` takes the surrounding text colour when
  inlined). If the logo's proportions change, update `--mark-ratio`.
- **Icons and share image:** after changing the logo, fonts or colours, preview the site
  locally and run `node tools/make-brand-images.mjs http://localhost:8000` (needs
  Playwright). It photographs `assets/brand/source/share-image.html` to make
  `assets/brand/share.jpg` (1200×630, the picture shown when the link is shared) and the
  `eye-icon-*.png` icons.
- **Sharing tags:** the title, description and picture that messaging apps and search
  engines show are in the `<head>` of `index.html`. They contain the site's full address
  (`https://emigjt.github.io/vznstudiowebpage/`); if the site moves to its own domain,
  replace that address there and in `site.webmanifest`.
- **Hero image/reel:** add an `<img>` or `<video>` inside `.hero-media` in `index.html`;
  it is shown desaturated behind the headline.

## Contact form

The form opens the visitor's email app by default. To receive submissions directly,
create a free form at [formspree.io](https://formspree.io) and paste its endpoint
into `FORM_ENDPOINT` in `assets/js/main.js`.

## Publishing

The live site is published by GitHub Pages straight from a branch (**Settings → Pages →
Deploy from a branch**), so whatever is merged into that branch goes live, including the
files the site never loads (`assets/media/originals/`, the `source/` folders, `tools/`).

`.github/workflows/pages.yml` is an alternative that deploys on every push to `main`
(**Settings → Pages → Source: GitHub Actions**); it is not in use.

## Undoing the refinement pass

The refinement pass was made as one commit per change, each named for what it does
(`G1: Gamiya Retro…`, `F2: colour roles…`, `P7: the player…`, `S1: the waveform is the
player`, and so on). Any one of them can be undone on its own with
`git revert <commit>`; undoing the merge commit undoes all of it. The two effects added
last have their own switches (`--wave-player`, `--focus-fx`), no code changes needed.
