/**
 * Renders public/images/og/progress-og.jpg (1200×630) — the /progress/ share
 * card — from one progress-photos-service photo, styled like birken-lofts-og.jpg.
 *
 *   node scripts/build-progress-og.mjs <photoId> "<subtitle>"
 *
 * Photo ids come from https://progress.monroeresidential.com/api/feed/birken-lofts.
 * Manual (like build-guide-photos): needs network and playwright, which is
 * deliberately not a dependency — `npm i --no-save playwright && npx playwright install chromium`.
 */
import { readFileSync } from 'node:fs';
import sharp from 'sharp';

const [id, subtitle] = process.argv.slice(2);
if (!id || !subtitle) {
  console.error('usage: node scripts/build-progress-og.mjs <photoId> "<subtitle>"');
  process.exit(2);
}

let chromium;
try {
  ({ chromium } = await import('playwright'));
} catch {
  console.error('playwright is not installed:\n  npm i --no-save playwright && npx playwright install chromium');
  process.exit(1);
}

const photoUrl = `https://progress.monroeresidential.com/img/birken-lofts/${id}-1920w.webp`;
const res = await fetch(photoUrl);
if (!res.ok) throw new Error(`photo ${id}: HTTP ${res.status}`);
const photo = Buffer.from(await res.arrayBuffer()).toString('base64');
const heading = readFileSync('app/fonts/big-shoulders-display-latin.woff2').toString('base64');
const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

const html = `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Libre+Franklin:wght@300;500&display=block" rel="stylesheet">
<style>
@font-face { font-family: "Big Shoulders"; src: url(data:font/woff2;base64,${heading}) format("woff2"); font-weight: 100 900; }
* { margin: 0; box-sizing: border-box; }
body { width: 1200px; height: 630px; overflow: hidden; background: #121110; }
.card { position: relative; width: 1200px; height: 630px;
  background: url(data:image/webp;base64,${photo}) center / cover; }
.card::after { content: ""; position: absolute; inset: 0;
  background: linear-gradient(90deg, rgba(12,11,10,.78) 0%, rgba(12,11,10,.32) 55%, rgba(12,11,10,.06) 100%),
              linear-gradient(0deg, rgba(12,11,10,.7) 0%, rgba(12,11,10,0) 55%); }
.text { position: absolute; z-index: 1; left: 68px; right: 68px; bottom: 64px; color: #ede6db; }
.kicker { display: flex; align-items: center; gap: 16px; margin-bottom: 18px;
  font: 500 17px "Libre Franklin", sans-serif; letter-spacing: .22em; text-transform: uppercase; color: #ede6db; }
.kicker::before { content: ""; width: 48px; height: 2px; background: #c86b4f; }
h1 { font: 800 112px/0.9 "Big Shoulders", sans-serif; text-transform: uppercase; letter-spacing: .01em; }
h1 span { display: block; color: #c86b4f; }
p { margin-top: 22px; font: 300 25px/1.35 "Libre Franklin", sans-serif; color: #e3dbcf; }
</style></head><body><div class="card"><div class="text">
<div class="kicker">401 W. Ontario Street · River North, Chicago</div>
<h1>Birken Lofts<span>Progress Photos</span></h1>
<p>${esc(subtitle)}</p>
</div></div></body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.setContent(html, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
const png = await page.screenshot({ type: 'png' });
await browser.close();

const out = 'public/images/og/progress-og.jpg';
await sharp(png).jpeg({ quality: 84, mozjpeg: true }).toFile(out);
const meta = await sharp(out).metadata();
console.log(`${out}: ${meta.width}×${meta.height}`);
