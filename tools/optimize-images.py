#!/usr/bin/env python3
"""
Make AVIF and WebP copies of the site's images, and list them in data/media.js.

Run from the repository root after adding or replacing a JPEG in
assets/media/visual or assets/media/shop:

    python3 tools/optimize-images.py

For every JPEG it writes a .avif and a .webp beside it (same name), and for each
"-large" artwork also a 1000px "-medium" pair, which phones use in the viewer.
Where a full-size original exists in assets/media/originals (same name, or the
name followed by "-poster", "-album-cover" and so on) the copies are made from
that, otherwise from the JPEG. The JPEGs themselves are never touched.

The page (assets/js/main.js) only offers a browser the formats listed in
data/media.js, so an image without copies simply stays a JPEG.

Needs Pillow 11.3 or newer (AVIF support): pip install pillow
"""
import json
import pathlib
from PIL import Image

Image.MAX_IMAGE_PIXELS = None
ROOT = pathlib.Path(__file__).resolve().parent.parent
FOLDERS = ["assets/media/visual", "assets/media/shop"]
ORIGINALS = ROOT / "assets/media/originals"
AVIF_QUALITY = 62      # grainy greyscale artwork holds up well here
WEBP_QUALITY = 80
MEDIUM = 1000          # px, the phone-size copy of a "-large" image


def original_for(stem):
    """The full-size original for a web image, if there is one."""
    base = stem[:-6] if stem.endswith("-large") else stem
    matches = sorted(p for p in ORIGINALS.glob("*") if p.stem == base or p.stem.startswith(base + "-"))
    exact = [p for p in matches if p.stem == base]
    return (exact or matches or [None])[0]


def save_copies(picture, target, size):
    """Write target.avif and target.webp at the given size; return their sizes in bytes."""
    resized = picture if picture.size == size else picture.resize(size, Image.LANCZOS)
    resized.save(target.with_suffix(".avif"), quality=AVIF_QUALITY, speed=4)
    resized.save(target.with_suffix(".webp"), quality=WEBP_QUALITY, method=6)
    return target.with_suffix(".avif").stat().st_size, target.with_suffix(".webp").stat().st_size


def main():
    listing = {}
    for folder in FOLDERS:
        for jpg in sorted((ROOT / folder).glob("*.jpg")):
            if jpg.stem.endswith("-medium"):
                continue
            with Image.open(jpg) as im:
                size = im.size
            source = original_for(jpg.stem) or jpg
            picture = Image.open(source).convert("RGB")
            avif, webp = save_copies(picture, jpg, size)
            entry = {"w": size[0], "h": size[1], "avif": True, "webp": True}
            line = f"{jpg.relative_to(ROOT)}  jpg {jpg.stat().st_size // 1024} KB  avif {avif // 1024} KB  webp {webp // 1024} KB"
            if jpg.stem.endswith("-large") and size[0] > MEDIUM:
                medium = jpg.with_name(jpg.stem[:-6] + "-medium.jpg")   # only the .avif / .webp are written
                m_avif, m_webp = save_copies(picture, medium, (MEDIUM, round(MEDIUM * size[1] / size[0])))
                entry["medium"] = MEDIUM
                line += f"  | medium avif {m_avif // 1024} KB  webp {m_webp // 1024} KB"
            listing[str(jpg.relative_to(ROOT))] = entry
            print(line + ("" if source == jpg else f"  (from {source.name})"))
    out = ROOT / "data/media.js"
    out.write_text(
        "/*\n  Written by tools/optimize-images.py: do not edit by hand.\n"
        "  For each JPEG on the site: its size in pixels, and which lighter copies\n"
        "  (AVIF, WebP, and a 1000px \"-medium\" pair for phones) sit beside it.\n*/\n"
        "window.VZN_MEDIA = " + json.dumps(listing, indent=2) + ";\n"
    )
    print(f"wrote {out.relative_to(ROOT)} ({len(listing)} images)")


if __name__ == "__main__":
    main()
