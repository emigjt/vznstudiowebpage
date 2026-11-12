#!/usr/bin/env node
/*
  Make the share image and the icons from assets/brand/source/share-image.html.

  Run from the repository root, with the site being served locally:

      python3 -m http.server 8000        (in one terminal)
      node tools/make-brand-images.mjs   (in another; add a URL if not http://localhost:8000)

  Writes, in assets/brand:
      share.jpg            1200 x 630, the picture shown when the link is shared
      eye-icon-512.png     app icon / lock-screen artwork
      eye-icon-192.png     app icon
      eye-icon-180.png     iPhone home-screen icon
      eye-icon-32.png      browser tab icon (fallback for favicon.svg)

  Needs Playwright (npm i playwright, then npx playwright install chromium).
*/
import { createRequire } from "node:module";
const { chromium } = createRequire(import.meta.url)("playwright");

const base = (process.argv[2] || "http://localhost:8000").replace(/\/$/, "");
const template = base + "/assets/brand/source/share-image.html";
const browser = await chromium.launch();

async function shoot(query, width, height, file) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  await page.goto(template + query, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot(file.endsWith(".jpg")
    ? { path: "assets/brand/" + file, type: "jpeg", quality: 88 }   // grain makes a PNG several times heavier
    : { path: "assets/brand/" + file });
  await page.close();
  console.log("wrote assets/brand/" + file);
}

await shoot("?view=share", 1200, 630, "share.jpg");
for (const size of [512, 192, 180, 32]) {
  await shoot("?view=icon&size=" + size, size, size, `eye-icon-${size}.png`);
}
await browser.close();
