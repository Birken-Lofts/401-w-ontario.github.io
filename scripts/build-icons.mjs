/**
 * Raster icons from public/favicon.svg (the source of truth):
 *   favicon.ico (16/32/48), icon-96.png  — Google Search won't show an SVG-only favicon
 *   apple-touch-icon.png (180)            — iOS home screen
 *   icon-192.png, icon-512.png            — site.webmanifest
 * Home-screen/manifest icons are full-bleed squares: iOS and Android apply their
 * own mask, and the SVG's transparent rounded corners would render black.
 *
 *   node scripts/build-icons.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import sharp from 'sharp';

const svg = readFileSync('public/favicon.svg', 'utf8');
const square = svg.replace(/\s*rx="[^"]*"/, '');

const png = (src, size) => sharp(Buffer.from(src), { density: 72 * (size / 64) * 2 }).resize(size, size).png().toBuffer();

// ICO with embedded PNG frames (supported by every current browser and Google).
function ico(frames) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(frames.length, 4);
  let offset = 6 + 16 * frames.length;
  const entries = frames.map(({ size, data }) => {
    const e = Buffer.alloc(16);
    e.writeUInt8(size >= 256 ? 0 : size, 0);
    e.writeUInt8(size >= 256 ? 0 : size, 1);
    e.writeUInt16LE(1, 4); // planes
    e.writeUInt16LE(32, 6); // bpp
    e.writeUInt32LE(data.length, 8);
    e.writeUInt32LE(offset, 12);
    offset += data.length;
    return e;
  });
  return Buffer.concat([header, ...entries, ...frames.map((f) => f.data)]);
}

const out = {
  'public/favicon.ico': ico(await Promise.all([16, 32, 48].map(async (size) => ({ size, data: await png(svg, size) })))),
  'public/icon-96.png': await png(svg, 96),
  'public/apple-touch-icon.png': await png(square, 180),
  'public/icon-192.png': await png(square, 192),
  'public/icon-512.png': await png(square, 512),
};
for (const [path, buf] of Object.entries(out)) {
  writeFileSync(path, buf);
  console.log(`${path}  ${buf.length} B`);
}
