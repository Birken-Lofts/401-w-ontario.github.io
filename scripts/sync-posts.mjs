// Snapshot published Ghost posts into the repo.
// Usage: npm run sync-posts [-- --allow-empty]
// Pulls published posts from the local Ghost Content API, localizes images
// into public/images/blog/<slug>/, and writes content/posts/*.json.
// Deletes JSON + images for posts no longer published.
// macOS-only (uses `sips` for image dimensions) — sync always runs on the
// author's machine, never in CI.
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import path from 'node:path';

function loadEnv() {
  const envPath = new URL('../.env.local', import.meta.url).pathname;
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}
loadEnv();

const GHOST_URL = process.env.GHOST_URL || 'http://localhost:2368';
const CONTENT_KEY = process.env.GHOST_CONTENT_KEY;
if (!CONTENT_KEY) throw new Error('GHOST_CONTENT_KEY missing — run scripts/setup-ghost.mjs first.');
const ALLOW_EMPTY = process.argv.includes('--allow-empty');

const ROOT = new URL('..', import.meta.url).pathname;
const POSTS_DIR = path.join(ROOT, 'content', 'posts');
const IMAGES_ROOT = path.join(ROOT, 'public', 'images', 'blog');

let res;
try {
  res = await fetch(`${GHOST_URL}/ghost/api/content/posts/?key=${CONTENT_KEY}&include=tags&formats=html&limit=all`);
} catch {
  throw new Error(`Ghost unreachable at ${GHOST_URL} — start it with: docker compose -f infra/ghost/docker-compose.yml up -d`);
}
if (!res.ok) throw new Error(`Content API error: ${res.status} ${await res.text()}`);
const { posts } = await res.json();

if (posts.length === 0 && !ALLOW_EMPTY) {
  throw new Error('Ghost returned ZERO published posts. If you really unpublished everything, re-run with: npm run sync-posts -- --allow-empty');
}

mkdirSync(POSTS_DIR, { recursive: true });

async function localizeImage(url, slug) {
  const pathname = new URL(url, GHOST_URL).pathname;
  const hash = createHash('sha1').update(pathname).digest('hex').slice(0, 8);
  const filename = `${hash}-${path.basename(pathname)}`;
  const dir = path.join(IMAGES_ROOT, slug);
  mkdirSync(dir, { recursive: true });
  const dest = path.join(dir, filename);
  const r = await fetch(new URL(url, GHOST_URL));
  if (!r.ok) throw new Error(`Image download failed (${r.status}): ${url}`);
  writeFileSync(dest, Buffer.from(await r.arrayBuffer()));
  return { publicPath: `/images/blog/${slug}/${filename}`, filePath: dest };
}

function imageDims(filePath) {
  try {
    const out = execFileSync('sips', ['-g', 'pixelWidth', '-g', 'pixelHeight', filePath], { encoding: 'utf8' });
    const w = Number(out.match(/pixelWidth: (\d+)/)?.[1]);
    const h = Number(out.match(/pixelHeight: (\d+)/)?.[1]);
    return w && h ? { w, h } : null;
  } catch {
    return null;
  }
}

const seenSlugs = [];
for (const post of posts) {
  const slug = post.slug;
  seenSlugs.push(slug);
  let html = post.html || '';
  let featureImage = null;
  let featureW = null;
  let featureH = null;

  if (post.feature_image) {
    const { publicPath, filePath } = await localizeImage(post.feature_image, slug);
    featureImage = publicPath;
    const dims = imageDims(filePath);
    if (dims) ({ w: featureW, h: featureH } = dims);
  }

  // Localize inline images; strip Ghost's srcset/sizes; add width/height.
  const imgTags = [...html.matchAll(/<img\b[^>]*>/g)].map((m) => m[0]);
  for (const tag of imgTags) {
    const src = tag.match(/src="([^"]+)"/)?.[1];
    if (!src) continue;
    let newTag = tag.replace(/\s(?:srcset|sizes)="[^"]*"/g, '');
    if (src.startsWith(GHOST_URL) || src.startsWith('/content/') || src.includes('__GHOST_URL__')) {
      const cleanSrc = src.replace('__GHOST_URL__', GHOST_URL);
      const { publicPath, filePath } = await localizeImage(cleanSrc, slug);
      newTag = newTag.replace(/src="[^"]+"/, `src="${publicPath}"`);
      const dims = imageDims(filePath);
      if (dims && !/\swidth=/.test(newTag)) {
        newTag = newTag.replace('<img ', `<img width="${dims.w}" height="${dims.h}" `);
      }
    }
    html = html.replace(tag, () => newTag);
  }

  const record = {
    slug,
    title: post.title,
    custom_excerpt: post.custom_excerpt ?? null,
    meta_description: post.meta_description ?? null,
    html,
    feature_image: featureImage,
    feature_image_width: featureW,
    feature_image_height: featureH,
    feature_image_alt: post.feature_image_alt ?? null,
    published_at: post.published_at,
    updated_at: post.updated_at,
    reading_time: post.reading_time ?? 1,
    tags: (post.tags || []).map((t) => t.name),
  };

  const json = JSON.stringify(record, null, 2);
  if (/localhost|127\.0\.0\.1|:2368|__GHOST_URL__/.test(json)) {
    throw new Error(`GUARD: local URL leaked into ${slug}.json — aborting before write.`);
  }
  writeFileSync(path.join(POSTS_DIR, `${slug}.json`), json + '\n');
  console.log(`synced: ${slug}`);
}

// Remove posts (and their images) that are no longer published.
for (const file of readdirSync(POSTS_DIR)) {
  if (!file.endsWith('.json') || file === 'index.json') continue;
  const slug = file.replace(/\.json$/, '');
  if (!/^[a-z0-9-]+$/i.test(slug)) continue;
  if (!seenSlugs.includes(slug)) {
    rmSync(path.join(POSTS_DIR, file));
    rmSync(path.join(IMAGES_ROOT, slug), { recursive: true, force: true });
    console.log(`removed (unpublished): ${slug}`);
  }
}

const ordered = posts
  .slice()
  .sort((a, b) => new Date(b.published_at) - new Date(a.published_at))
  .map((p) => p.slug);
writeFileSync(path.join(POSTS_DIR, 'index.json'), JSON.stringify(ordered, null, 2) + '\n');
console.log(`index.json: ${ordered.length} post(s). Now: git add content public/images/blog && commit && push.`);
