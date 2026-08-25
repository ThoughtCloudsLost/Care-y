// Regenerates the committed document-mockup JPEGs in src/assets from the
// HTML pages in this directory. Run from the repo root or packages/demo:
//   node packages/demo/scripts/generate-doc-images/screenshot.mjs
// Uses the workspace root @playwright/test chromium install.
import { chromium } from "@playwright/test";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join } from "node:path";
import { mkdir } from "node:fs/promises";

const here = dirname(fileURLToPath(import.meta.url));
const assetsDir = join(here, "..", "..", "src", "assets");

const pages = [
  {
    html: "housing-notice.html",
    out: "demo-doc-housing-notice.jpg",
    width: 1000,
    height: 1400,
  },
  {
    html: "appointment-card.html",
    out: "demo-doc-appointment-card.jpg",
    width: 1200,
    height: 800,
  },
];

await mkdir(assetsDir, { recursive: true });
const browser = await chromium.launch();
try {
  for (const { html, out, width, height } of pages) {
    const page = await browser.newPage({ viewport: { width, height } });
    await page.goto(pathToFileURL(join(here, html)).href);
    await page.screenshot({
      path: join(assetsDir, out),
      type: "jpeg",
      quality: 85,
    });
    await page.close();
    console.log(`Wrote ${join(assetsDir, out)}`);
  }
} finally {
  await browser.close();
}
