# Ghost Journal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A "Journal" blog at `/blog/` rendered statically from committed content, authored in a local Dockerized Ghost, synced into the repo by script — plus nav/footer/sitemap/llms wiring and three seed drafts.

**Architecture:** Local Ghost (Docker, `~/.birken-ghost` volume) is editor-only. `scripts/sync-posts.mjs` snapshots published posts to `content/posts/*.json` with images localized into `public/images/blog/`. `app/blog/` renders from the committed JSON via `lib/posts.ts`. CI never contacts Ghost. `public/sitemap.xml` migrates to build-time `app/sitemap.ts`.

**Tech Stack:** Next.js 15 static export, React 19, Ghost 5 (Docker), Node scripts with zero new dependencies (manual JWT via `node:crypto`, `sips` for image dims — sync runs only on the author's Mac).

**Spec:** `docs/superpowers/specs/2026-07-16-ghost-journal-design.md`

## Global Constraints

- Branch `ghost-journal`. Gate: `npm run build` + `npm run lint` exit 0 (only the pre-existing `no-img-element` warning at `components/ImageSlot.tsx` — new raw `<img>`s carry inline disables).
- **The build must succeed with ZERO posts** (fresh clone, empty `content/posts/`) — the Journal launches with an empty state until the user publishes.
- No new package.json `dependencies`/`devDependencies`; `package-lock.json` unchanged. Adding entries to `"scripts"` IS allowed (Task 2 adds `sync-posts`).
- NEVER `git add -A` (untracked at repo root: `pagespeed.txt` = API key, `mobie.zip`, `finishes.pptx`, two PDFs). Stage files explicitly.
- NEVER commit: `.env.local`, seed-draft copy, rehearsal artifacts (test posts/images), or anything containing credentials.
- The user's real Ghost instance is NOT set up by implementers. All live testing uses a THROWAWAY Ghost on port **2369**, bound to loopback only (`-p 127.0.0.1:2369:2368` — never expose it to the network), with a temp-dir volume and fake credentials, torn down afterwards. `.env.local` is never written by rehearsals (pass env vars directly).
- Docker is available (29.5.3, daemon up). `docker compose` v2 syntax.
- Do not run `npm run dev`. Serve `out/` on 4173 for headless checks; kill after; playwright in repo node_modules.
- Ghost API facts (v5): setup status `GET /ghost/api/admin/authentication/setup/`; create owner `POST` same URL with `{"setup":[{"name","email","password","blogTitle"}]}`; session login `POST /ghost/api/admin/session/` with `{"username","password"}` + `Origin: http://localhost:<port>` header (grab the `set-cookie`); create integration `POST /ghost/api/admin/integrations/?include=api_keys` with the session cookie, body `{"integrations":[{"name":"Site Sync"}]}`; Admin JWT = HS256, header `{alg,typ:'JWT',kid:<key id>}`, payload `{iat, exp: iat+300, aud:'/admin/'}`, secret = hex-decoded second half of the admin key; create post `POST /ghost/api/admin/posts/?source=html`; publish `PUT /ghost/api/admin/posts/<id>/` with `{"posts":[{"status":"published","updated_at":<fetched updated_at>}]}`; content list `GET /ghost/api/content/posts/?key=<content key>&include=tags&formats=html&limit=all`.

---

### Task 1: Ghost editor infrastructure

**Files:**
- Create: `infra/ghost/docker-compose.yml`, `infra/ghost/README.md`, `scripts/setup-ghost.mjs`, `scripts/push-draft.mjs`
- Modify: `.gitignore` (add `.env.local`)

**Interfaces:**
- Produces: a compose file exposing Ghost at `localhost:2368` (volume `~/.birken-ghost`); `setup-ghost.mjs` writing `.env.local` with `GHOST_URL`, `GHOST_CONTENT_KEY`, `GHOST_ADMIN_KEY`; `push-draft.mjs <file.html> --title "..." [--excerpt "..."] [--tags a,b]` creating a DRAFT. Both scripts read config from `.env.local` OR process env (env wins — rehearsals rely on this).

- [ ] **Step 1: Create `infra/ghost/docker-compose.yml`**:

```yaml
# Local Ghost editor for the Birken Lofts Journal. Editor-only: visitors never
# reach this instance; published posts are synced into the repo by
# `npm run sync-posts`. Content (posts, images, your account) persists in
# ~/.birken-ghost on this machine — it is NOT part of the repo.
services:
  ghost:
    image: ghost:5
    container_name: birken-ghost
    restart: unless-stopped
    ports:
      # Loopback only — never expose the editor (or its one-time setup endpoint) to the network.
      - '127.0.0.1:2368:2368'
    environment:
      url: http://localhost:2368
      NODE_ENV: development
    volumes:
      - ~/.birken-ghost:/var/lib/ghost/content
```

- [ ] **Step 2: Create `scripts/setup-ghost.mjs`** with exactly:

```js
// One-time bootstrap for the local Ghost editor.
// Usage:  node scripts/setup-ghost.mjs
// Prompts for the owner account (or reads GHOST_SETUP_NAME/EMAIL/PASSWORD env),
// creates it, creates a "Site Sync" integration, and writes .env.local.
// Idempotent: if Ghost is already set up, prints manual instructions instead.
import { createInterface } from 'node:readline/promises';
import { writeFileSync, existsSync } from 'node:fs';

const GHOST_URL = process.env.GHOST_URL || 'http://localhost:2368';

async function waitForGhost() {
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch(`${GHOST_URL}/ghost/api/admin/authentication/setup/`);
      if (r.ok) return (await r.json()).setup[0].status;
    } catch {
      /* not up yet */
    }
    await new Promise((res) => setTimeout(res, 2000));
    process.stdout.write('.');
  }
  throw new Error(`Ghost did not come up at ${GHOST_URL} — is docker compose running?`);
}

async function ask(question, hide = false) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const answer = await rl.question(question);
  rl.close();
  if (hide) process.stdout.write('\n');
  return answer.trim();
}

const alreadySetUp = await waitForGhost();
console.log(`\nGhost is up at ${GHOST_URL}`);

let name = process.env.GHOST_SETUP_NAME;
let email = process.env.GHOST_SETUP_EMAIL;
let password = process.env.GHOST_SETUP_PASSWORD;

if (alreadySetUp) {
  console.log(`This Ghost instance already has an owner account.
To (re)generate API keys manually:
  1. Open ${GHOST_URL}/ghost and sign in
  2. Settings -> Advanced -> Integrations -> Add custom integration -> "Site Sync"
  3. Copy the Content API key and Admin API key into .env.local:
       GHOST_URL=${GHOST_URL}
       GHOST_CONTENT_KEY=<content key>
       GHOST_ADMIN_KEY=<admin key>`);
  if (!email || !password) process.exit(0);
  console.log('Credentials provided via env — attempting to create the integration…');
} else {
  if (!name) name = await ask('Owner name: ');
  if (!email) email = await ask('Owner email: ');
  if (!password) password = await ask('Owner password (10+ chars): ', true);
  const res = await fetch(`${GHOST_URL}/ghost/api/admin/authentication/setup/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ setup: [{ name, email, password, blogTitle: 'Birken Lofts Journal' }] }),
  });
  if (!res.ok) throw new Error(`Setup failed: ${res.status} ${await res.text()}`);
  console.log('Owner account created.');
}

const login = await fetch(`${GHOST_URL}/ghost/api/admin/session/`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Origin: GHOST_URL },
  body: JSON.stringify({ username: email, password }),
});
if (!login.ok) throw new Error(`Login failed: ${login.status} ${await login.text()}`);
const cookie = login.headers.get('set-cookie');

const integration = await fetch(`${GHOST_URL}/ghost/api/admin/integrations/?include=api_keys`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Origin: GHOST_URL, Cookie: cookie },
  body: JSON.stringify({ integrations: [{ name: 'Site Sync' }] }),
});
if (!integration.ok) throw new Error(`Integration creation failed: ${integration.status} ${await integration.text()}`);
const keys = (await integration.json()).integrations[0].api_keys;
const contentKey = keys.find((k) => k.type === 'content').secret;
const adminKey = keys.find((k) => k.type === 'admin');
const adminKeyString = `${adminKey.id}:${adminKey.secret}`;

const envPath = new URL('../.env.local', import.meta.url).pathname;
const lines = `GHOST_URL=${GHOST_URL}\nGHOST_CONTENT_KEY=${contentKey}\nGHOST_ADMIN_KEY=${adminKeyString}\n`;
if (existsSync(envPath)) console.log('NOTE: .env.local exists — appending Ghost keys.');
writeFileSync(envPath, lines, { flag: existsSync(envPath) ? 'a' : 'w' });
console.log(`Wrote Ghost keys to .env.local — you're ready: write at ${GHOST_URL}/ghost, then \`npm run sync-posts\`.`);
```

- [ ] **Step 3: Create `scripts/push-draft.mjs`** with exactly:

```js
// Push an HTML file into the local Ghost as a DRAFT post.
// Usage: node scripts/push-draft.mjs <file.html> --title "Title" [--excerpt "..."] [--tags a,b]
import { readFileSync, existsSync } from 'node:fs';
import { createHmac } from 'node:crypto';

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
const ADMIN_KEY = process.env.GHOST_ADMIN_KEY;
if (!ADMIN_KEY) throw new Error('GHOST_ADMIN_KEY missing — run scripts/setup-ghost.mjs first.');

export function adminToken(key) {
  const [id, secret] = key.split(':');
  const now = Math.floor(Date.now() / 1000);
  const b64 = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url');
  const header = b64({ alg: 'HS256', typ: 'JWT', kid: id });
  const payload = b64({ iat: now, exp: now + 300, aud: '/admin/' });
  const signature = createHmac('sha256', Buffer.from(secret, 'hex'))
    .update(`${header}.${payload}`)
    .digest('base64url');
  return `${header}.${payload}.${signature}`;
}

const [file] = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const flag = (name) => {
  const i = process.argv.indexOf(`--${name}`);
  return i === -1 ? undefined : process.argv[i + 1];
};
const title = flag('title');
if (!file || !title) throw new Error('Usage: node scripts/push-draft.mjs <file.html> --title "Title" [--excerpt "..."] [--tags a,b]');

const post = {
  title,
  html: readFileSync(file, 'utf8'),
  status: 'draft',
  ...(flag('excerpt') ? { custom_excerpt: flag('excerpt') } : {}),
  ...(flag('tags') ? { tags: flag('tags').split(',').map((t) => ({ name: t.trim() })) } : {}),
};

const res = await fetch(`${GHOST_URL}/ghost/api/admin/posts/?source=html`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Authorization: `Ghost ${adminToken(ADMIN_KEY)}` },
  body: JSON.stringify({ posts: [post] }),
});
if (!res.ok) throw new Error(`Draft push failed: ${res.status} ${await res.text()}`);
const created = (await res.json()).posts[0];
console.log(`Draft created: "${created.title}" (${created.slug}) — edit at ${GHOST_URL}/ghost/#/editor/post/${created.id}`);
```

- [ ] **Step 4: Create `infra/ghost/README.md`** — concise doc covering: what this is (editor-only local Ghost; visitors never reach it; content persists in `~/.birken-ghost`); quick start (`docker compose -f infra/ghost/docker-compose.yml up -d`, then `node scripts/setup-ghost.mjs` once); the manual setup path (the 3 steps the script prints); the publishing workflow (write/publish in Ghost → `npm run sync-posts` → commit `content/` + `public/images/blog/` → push); how drafts can be pushed with `push-draft.mjs`; troubleshooting (container logs, resetting = delete `~/.birken-ghost`). Write it in the repo's documentation voice; no credentials examples beyond placeholders.

- [ ] **Step 5: `.gitignore`** — append (with a comment):

```
# local secrets (Ghost API keys)
.env.local
```

- [ ] **Step 6: Rehearsal — validate both scripts against a THROWAWAY Ghost**

```bash
TMPGHOST=$(mktemp -d)
docker run -d --rm --name ghost-rehearsal -p 127.0.0.1:2369:2368 -e url=http://localhost:2369 -e NODE_ENV=development -v "$TMPGHOST":/var/lib/ghost/content ghost:5
GHOST_URL=http://localhost:2369 GHOST_SETUP_NAME="Rehearsal" GHOST_SETUP_EMAIL="rehearsal@example.com" GHOST_SETUP_PASSWORD="rehearsal-password-123" node scripts/setup-ghost.mjs
```

CAUTION: the rehearsal setup writes `.env.local` pointing at port 2369 — that is expected script behavior; DELETE `.env.local` at the end of the rehearsal (the user's real setup will recreate it).

Then create a test HTML file in /tmp and:

```bash
node scripts/push-draft.mjs /tmp/test-post.html --title "Rehearsal Post" --tags "Test"
```

Expected: setup prints the .env.local success line; push prints "Draft created: … (rehearsal-post)". Verify via the Content API that the draft is NOT visible (drafts excluded):

```bash
source .env.local 2>/dev/null || true
node -e "fetch(process.env.GHOST_URL+'/ghost/api/content/posts/?key='+process.env.GHOST_CONTENT_KEY).then(r=>r.json()).then(d=>{if((d.posts||[]).length!==0)throw new Error('draft leaked to content API');console.log('DRAFT-HIDDEN-OK')})"
```

Teardown:

```bash
docker stop ghost-rehearsal
rm -f .env.local
rm -rf "$TMPGHOST"
git status --porcelain   # only the intended new files; NO .env.local
```

- [ ] **Step 7: Build gate (nothing site-facing changed, still must pass) + commit**

```bash
npm run build > /dev/null && npm run lint 2>&1 | tail -1
git add infra scripts/setup-ghost.mjs scripts/push-draft.mjs .gitignore
git commit -m "Add local Ghost editor infrastructure and draft-push tooling"
```

---

### Task 2: Content sync script

**Files:**
- Create: `scripts/sync-posts.mjs`, `content/posts/.gitkeep`
- Modify: `package.json` (scripts only: add `"sync-posts": "node scripts/sync-posts.mjs"`)

**Interfaces:**
- Consumes: `.env.local`/env (`GHOST_URL`, `GHOST_CONTENT_KEY`); local Ghost Content API.
- Produces: `content/posts/<slug>.json` matching the `Post` interface Task 3 defines: `{ slug, title, custom_excerpt, html, feature_image, feature_image_width, feature_image_height, published_at, updated_at, reading_time, tags }` (tags = string array of tag names; image fields null when absent); `content/posts/index.json` = slug array, `published_at` desc; images under `public/images/blog/<slug>/`.

- [ ] **Step 1: Create `scripts/sync-posts.mjs`** with exactly:

```js
// Snapshot published Ghost posts into the repo.
// Usage: npm run sync-posts [-- --allow-empty]
// Pulls published posts from the local Ghost Content API, localizes images
// into public/images/blog/<slug>/, and writes content/posts/*.json.
// Deletes JSON + images for posts no longer published.
// macOS-only (uses `sips` for image dimensions) — sync always runs on the
// author's machine, never in CI.
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
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
} catch (e) {
  throw new Error(`Ghost unreachable at ${GHOST_URL} — start it with: docker compose -f infra/ghost/docker-compose.yml up -d`);
}
if (!res.ok) throw new Error(`Content API error: ${res.status} ${await res.text()}`);
const { posts } = await res.json();

if (posts.length === 0 && !ALLOW_EMPTY) {
  throw new Error('Ghost returned ZERO published posts. If you really unpublished everything, re-run with: npm run sync-posts -- --allow-empty');
}

mkdirSync(POSTS_DIR, { recursive: true });

async function localizeImage(url, slug) {
  const filename = path.basename(new URL(url, GHOST_URL).pathname);
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
    html = html.replace(tag, newTag);
  }

  const record = {
    slug,
    title: post.title,
    custom_excerpt: post.custom_excerpt ?? null,
    html,
    feature_image: featureImage,
    feature_image_width: featureW,
    feature_image_height: featureH,
    published_at: post.published_at,
    updated_at: post.updated_at,
    reading_time: post.reading_time ?? 1,
    tags: (post.tags || []).map((t) => t.name),
  };

  const json = JSON.stringify(record, null, 2);
  if (/localhost|:2368|__GHOST_URL__/.test(json)) {
    throw new Error(`GUARD: local URL leaked into ${slug}.json — aborting before write.`);
  }
  writeFileSync(path.join(POSTS_DIR, `${slug}.json`), json + '\n');
  console.log(`synced: ${slug}`);
}

// Remove posts (and their images) that are no longer published.
for (const file of readdirSync(POSTS_DIR)) {
  if (!file.endsWith('.json') || file === 'index.json') continue;
  const slug = file.replace(/\.json$/, '');
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
```

- [ ] **Step 2: `package.json`** — add to `"scripts"`: `"sync-posts": "node scripts/sync-posts.mjs"`. Create empty `content/posts/.gitkeep`.

- [ ] **Step 3: Rehearse against a throwaway Ghost** — same pattern as Task 1 Step 6 (port 2369, temp volume, env-var config, NO `.env.local` left behind): set up, push a draft containing at least one inline image (upload via the Admin API images endpoint is complex — instead include a remote-hosted `https://` image AND publish the post so `feature_image` is null; the localization path for local images gets full coverage in Task 5's E2E against a real editor-uploaded image). Publish the draft (`PUT` per Global Constraints), run `GHOST_URL=http://localhost:2369 GHOST_CONTENT_KEY=<key> node scripts/sync-posts.mjs`, and verify: `content/posts/index.json` lists the slug; the post JSON has no `localhost`/`2368`/`2369` strings (external `https://` images stay untouched — assert the guard passed); then unpublish is NOT tested here (Task 5 covers it) — instead run the deletion path by re-running sync with the post unpublished via `PUT status:'draft'` and `--allow-empty`, confirming the JSON and index empty out. Teardown: stop container, `rm -rf` temp volume, `git checkout -- content` if needed, delete any rehearsal images under `public/images/blog/`, `git status --porcelain` clean except intended files.

- [ ] **Step 4: Gate + commit**

```bash
npm run build > /dev/null && npm run lint 2>&1 | tail -1
git status --porcelain package-lock.json   # empty
git add scripts/sync-posts.mjs package.json content/posts/.gitkeep
git commit -m "Add Ghost content sync script"
```

---

### Task 3: Journal pages

**Files:**
- Create: `lib/posts.ts`, `app/blog/page.tsx`, `app/blog/[slug]/page.tsx`
- Modify: `app/site.css` (append `— journal —` block after the finishes block, before the responsive section)

**Interfaces:**
- Consumes: `content/posts/*.json` per Task 2's record shape; Organic CSS/tokens; `.history-cta` band classes.
- Produces: `lib/posts.ts` exporting `interface Post` (exact fields as Task 2's record) plus `getAllPosts(): Post[]` and `getPost(slug: string): Post | null`; routes `/blog/` and `/blog/<slug>/`.

- [ ] **Step 1: Create `lib/posts.ts`** with exactly:

```ts
import fs from 'node:fs';
import path from 'node:path';

export interface Post {
  slug: string;
  title: string;
  custom_excerpt: string | null;
  html: string;
  feature_image: string | null;
  feature_image_width: number | null;
  feature_image_height: number | null;
  published_at: string;
  updated_at: string;
  reading_time: number;
  tags: string[];
}

const POSTS_DIR = path.join(process.cwd(), 'content', 'posts');

export function getAllPosts(): Post[] {
  const indexPath = path.join(POSTS_DIR, 'index.json');
  if (!fs.existsSync(indexPath)) return [];
  const slugs: string[] = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
  return slugs.map((slug) => JSON.parse(fs.readFileSync(path.join(POSTS_DIR, `${slug}.json`), 'utf8')));
}

export function getPost(slug: string): Post | null {
  const file = path.join(POSTS_DIR, `${slug}.json`);
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

export function formatPostDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'America/Chicago',
  });
}
```

- [ ] **Step 2: Create `app/blog/page.tsx`** with exactly:

```tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import { formatPostDate, getAllPosts } from '@/lib/posts';

export const metadata: Metadata = {
  title: 'Journal | Birken Lofts',
  description:
    'Notes from the conversion of the 1905 S. Birkenstein & Sons Building into Birken Lofts — construction updates, design selections, and River North history.',
  alternates: { canonical: 'https://birkenlofts.com/blog/' },
  openGraph: {
    title: 'The Birken Lofts Journal',
    description:
      'Construction updates, design selections, and River North history from Birken Lofts.',
    type: 'website',
    url: 'https://birkenlofts.com/blog/',
    images: ['https://birkenlofts.com/images/elevations/401-W-Ontario-No-Signs-1024w.webp'],
  },
};

export default function JournalPage() {
  const posts = getAllPosts();
  return (
    <main>
      <header className="journal-header container">
        <span className="tag tag-accent-2">The Journal</span>
        <h1>Journal</h1>
        <p className="journal-lede">
          Notes from the making of Birken Lofts &mdash; construction, selections, and the
          building&rsquo;s second century.
        </p>
      </header>
      <div className="container">
        {posts.length === 0 ? (
          <p className="journal-empty">First entries are on their way.</p>
        ) : (
          <div className="journal-grid">
            {posts.map((p) => (
              <Link key={p.slug} href={`/blog/${p.slug}/`} className="card elev-sm journal-card">
                {p.feature_image && p.feature_image_width && p.feature_image_height && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.feature_image}
                    alt=""
                    width={p.feature_image_width}
                    height={p.feature_image_height}
                    loading="lazy"
                    className="journal-card-img"
                  />
                )}
                <div className="journal-card-meta">
                  {formatPostDate(p.published_at)} · {p.reading_time} min read
                </div>
                <div className="card-title">{p.title}</div>
                {p.custom_excerpt && <div className="card-body">{p.custom_excerpt}</div>}
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
```

- [ ] **Step 3: Create `app/blog/[slug]/page.tsx`** with exactly:

```tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { formatPostDate, getAllPosts, getPost } from '@/lib/posts';

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  const description = post.custom_excerpt ?? `${post.title} — from the Birken Lofts Journal.`;
  return {
    title: `${post.title} | Birken Lofts Journal`,
    description,
    alternates: { canonical: `https://birkenlofts.com/blog/${post.slug}/` },
    openGraph: {
      title: post.title,
      description,
      type: 'article',
      url: `https://birkenlofts.com/blog/${post.slug}/`,
      images: post.feature_image ? [`https://birkenlofts.com${post.feature_image}`] : undefined,
    },
  };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    datePublished: post.published_at,
    dateModified: post.updated_at,
    ...(post.feature_image ? { image: `https://birkenlofts.com${post.feature_image}` } : {}),
    mainEntityOfPage: `https://birkenlofts.com/blog/${post.slug}/`,
    author: { '@type': 'Organization', name: 'Birken Lofts', url: 'https://birkenlofts.com' },
    publisher: { '@type': 'Organization', name: 'Birken Lofts', url: 'https://birkenlofts.com' },
  };

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <article className="post container">
        <header className="post-header">
          <Link className="post-back" href="/blog/">
            &larr; Journal
          </Link>
          {post.tags.length > 0 && <span className="tag tag-accent-2">{post.tags[0]}</span>}
          <h1>{post.title}</h1>
          <p className="post-meta">
            {formatPostDate(post.published_at)} · {post.reading_time} min read
          </p>
        </header>
        {post.feature_image && post.feature_image_width && post.feature_image_height && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.feature_image}
            alt=""
            width={post.feature_image_width}
            height={post.feature_image_height}
            className="post-feature"
            fetchPriority="high"
          />
        )}
        <div className="post-prose" dangerouslySetInnerHTML={{ __html: post.html }} />
        <section className="history-cta">
          <p>Come see the building behind the stories.</p>
          <div className="history-cta-btns">
            <Link className="btn btn-primary" href="/#contact">Join the interest list</Link>
            <Link className="btn btn-secondary" href="/#plans">View floor plans</Link>
          </div>
        </section>
      </article>
    </main>
  );
}
```

- [ ] **Step 4: Append to `app/site.css`** (after the finishes block, before the `— responsive —` section) exactly:

```css
/* — journal — */
.journal-header { padding-block: 64px 8px; }
.journal-header h1 { font-size: clamp(40px, 5vw, 58px); margin: 18px 0 16px; }
.journal-lede { font-size: 19px; line-height: 1.6; color: var(--color-neutral-700); max-width: 56ch; margin: 0; }
.journal-empty { font-size: 17px; color: var(--color-neutral-600); padding-block: 48px 96px; }
.journal-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; padding-block: 36px 88px; }
.journal-card { text-decoration: none; color: inherit; gap: 10px; }
.journal-card-img { width: 100%; height: 220px; object-fit: cover; border-radius: var(--radius-md); display: block; }
.journal-card-meta { font-size: 13px; color: var(--color-neutral-600); }
.journal-card .card-title { font-size: 24px; }
.post { max-width: 760px; }
.post-header { padding-block: 56px 8px; }
.post-back { display: inline-block; font-size: 14px; font-weight: 600; color: var(--color-accent-700); text-decoration: none; margin-bottom: 22px; }
.post-back:hover { text-decoration: underline; }
.post-header .tag { margin-bottom: 12px; }
.post-header h1 { font-size: clamp(34px, 4.5vw, 48px); line-height: 1.12; margin: 10px 0 12px; }
.post-meta { font-size: 14px; color: var(--color-neutral-600); margin: 0 0 28px; }
.post-feature { width: 100%; height: auto; display: block; border-radius: calc(var(--radius-lg) * 1.2); box-shadow: var(--shadow-md); margin-bottom: 36px; }
.post-prose { font-size: 17px; line-height: 1.75; color: var(--color-neutral-800); }
.post-prose h2 { font-size: 28px; margin: 40px 0 14px; }
.post-prose h3 { font-size: 21px; margin: 32px 0 10px; }
.post-prose p { margin: 0 0 20px; }
.post-prose a { color: var(--color-accent-700); }
.post-prose ul, .post-prose ol { margin: 0 0 20px; padding-left: 26px; }
.post-prose li { margin-bottom: 8px; }
.post-prose blockquote {
  margin: 28px 0; padding: 4px 0 4px 22px;
  border-left: 3px solid var(--color-accent);
  font-family: var(--font-heading); font-size: 21px; line-height: 1.5; color: var(--color-text);
}
.post-prose img { max-width: 100%; height: auto; border-radius: var(--radius-lg); margin: 8px 0; }
.post-prose figure { margin: 28px 0; }
.post-prose figcaption { font-size: 13px; color: var(--color-neutral-600); margin-top: 10px; }
.post-prose hr { border: 0; border-top: 1px solid var(--color-divider); margin: 36px 0; }
.post .history-cta { margin-top: 64px; }
@media (max-width: 768px) {
  .journal-header { padding-block: 40px 0; }
  .journal-header h1 { font-size: 36px; }
  .journal-lede { font-size: 17px; }
  .journal-grid { grid-template-columns: 1fr; gap: 20px; padding-block: 28px 56px; }
  .post-header { padding-block: 40px 0; }
  .post-header h1 { font-size: 30px; }
  .post-prose { font-size: 16px; }
  .post-prose h2 { font-size: 24px; }
  .post-prose blockquote { font-size: 19px; }
}
```

- [ ] **Step 5: Verify — zero-post build AND fixture render**

```bash
npm run build && npm run lint
test -f out/blog/index.html && echo JOURNAL-INDEX-OK
grep -o 'First entries are on their way' out/blog/index.html
```

Then create an UNCOMMITTED fixture: `content/posts/fixture-post.json` (realistic record: a heading, two paragraphs, a blockquote, an `<hr>`, no images, tags `["Test"]`) and `content/posts/index.json` = `["fixture-post"]`; rebuild; verify `out/blog/fixture-post/index.html` exists, contains the Article JSON-LD (node JSON.parse check), the `.post-prose` content, and the back-link. Serve + headless at 390 and 1400: index card → post navigation works, styles render (screenshot both, view them). THEN delete both fixture files and rebuild (back to empty state, exit clean):

```bash
rm content/posts/fixture-post.json content/posts/index.json
npm run build > /dev/null && grep -o 'First entries are on their way' out/blog/index.html
git status --porcelain   # no content/ leftovers
```

- [ ] **Step 6: Commit**

```bash
git add lib/posts.ts app/blog app/site.css
git commit -m "Add Journal index and post pages rendered from synced content"
```

---

### Task 4: Nav, footer, sitemap migration, llms

**Files:**
- Create: `app/sitemap.ts`
- Delete: `public/sitemap.xml`
- Modify: `components/Nav.tsx`, `components/Footer.tsx`, `app/site.css` (drawer breakpoint if needed), `public/llms.txt`, `public/llms-full.txt`

**Interfaces:**
- Consumes: `getAllPosts()` from Task 3; `/blog/` route.
- Produces: 8-item nav; `/sitemap.xml` served from `app/sitemap.ts`.

- [ ] **Step 1: `components/Nav.tsx`** — add after the `const onFinishes = ...` line:

```tsx
  const onBlog = pathname.startsWith('/blog');
```

and insert into `links` between the History and Amenities entries:

```tsx
    { href: '/blog/', label: 'Journal', current: onBlog },
```

- [ ] **Step 2: `components/Footer.tsx`** — insert after the History link:

```tsx
        <Link href="/blog/">Journal</Link>
```

- [ ] **Step 3: Measure the 8-item nav wrap and adjust the drawer breakpoint.** Build, serve `out/`, and with playwright step viewport widths 990→1140 (10px steps) measuring `.site-nav` offsetHeight with the full `.nav-links` visible; find the smallest width W where height ≤ 70 and nothing wraps. Set the drawer media query in `app/site.css` from `@media (max-width: 980px)` to `@media (max-width: <W - 1 + 20 buffer>px)` (round up to a clean value, e.g. 1060). Update BOTH occurrences if any other rule keys on 980 for the nav (there is one block). Re-verify: at breakpoint+5 the full nav fits on one line; at breakpoint−5 the hamburger shows.

- [ ] **Step 4: Create `app/sitemap.ts`** with exactly:

```ts
import type { MetadataRoute } from 'next';
import { getAllPosts } from '@/lib/posts';

export const dynamic = 'force-static';

const BASE = 'https://birkenlofts.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();
  const newestPost = posts[0]?.published_at;
  return [
    { url: `${BASE}/`, lastModified: '2026-03-18', changeFrequency: 'weekly', priority: 1.0 },
    { url: `${BASE}/history/`, lastModified: '2026-07-15', changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/finishes/`, lastModified: '2026-07-15', changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/blog/`, lastModified: newestPost ?? '2026-07-16', changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE}/ohio-feeder-ramp-cam/`, lastModified: '2026-07-14', changeFrequency: 'monthly', priority: 0.6 },
    ...posts.map((p) => ({
      url: `${BASE}/blog/${p.slug}/`,
      lastModified: p.updated_at,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ];
}
```

Then `git rm public/sitemap.xml`.

- [ ] **Step 5: `public/llms.txt`** — insert between `## Building History` and `## Live Traffic Camera`:

```markdown
## Journal

The Birken Lofts Journal publishes construction updates, interior design selections, and River North history: https://birkenlofts.com/blog/

```

`public/llms-full.txt` — append after the building-history pointer line (end of `## About the Building`):

```markdown
Construction updates and design notes are published on the Birken Lofts Journal at https://birkenlofts.com/blog/
```

- [ ] **Step 6: Build + verify**

```bash
npm run build && npm run lint
test -f out/sitemap.xml && echo SITEMAP-OK
python3 -c "
import re
xml = open('out/sitemap.xml').read()
urls = re.findall(r'<loc>([^<]+)</loc>', xml)
assert 'https://birkenlofts.com/blog/' in urls, urls
assert len(urls) >= 5
print('SITEMAP-XML-OK', len(urls))
"   # regex scan of our own build output — no XML parser needed
grep -o 'href="/blog/"' out/index.html | head -1
grep -o 'birkenlofts.com/blog/' out/llms.txt out/llms-full.txt
grep -o 'aria-current' out/blog/index.html | head -1
git status --porcelain package.json package-lock.json   # package.json only if scripts changed in Task 2 (already committed); expect empty
```

Headless: 390×844 — open drawer, Journal link present between History and Amenities, tap → `/blog/`, aria-current on Journal; desktop at breakpoint+5 — 8 items on one line.

- [ ] **Step 7: Commit**

```bash
git add components/Nav.tsx components/Footer.tsx app/sitemap.ts app/site.css public/llms.txt public/llms-full.txt
git rm -q --cached public/sitemap.xml 2>/dev/null || true
git commit -m "Add Journal to nav and footer; generate sitemap at build time"
```

(Ensure `public/sitemap.xml` is actually deleted from disk and the commit removes it.)

---

### Task 5: End-to-end rehearsal + seed drafts

**Files:** none committed (rehearsal artifacts are transient; seed drafts live only in Ghost).

- [ ] **Step 1: Full-pipeline rehearsal on a throwaway Ghost** (port 2369 via `-p 127.0.0.1:2369:2368`, temp volume, env-var config only):
1. Start throwaway, run `setup-ghost.mjs` with rehearsal env creds, delete the `.env.local` it writes but capture the keys into shell vars first.
2. Upload an image to Ghost via the Admin API images endpoint (`POST /ghost/api/admin/images/upload/` multipart with the JWT — use a small webp from `public/images/finishes/`) so the rehearsal covers LOCAL image localization; create a post via Admin API whose html includes that uploaded image inline, set it as `feature_image` too; publish it.
3. `GHOST_URL=http://localhost:2369 GHOST_CONTENT_KEY=$KEY node scripts/sync-posts.mjs` → verify: post JSON written; images copied under `public/images/blog/<slug>/`; no `localhost|2368|2369|__GHOST_URL__` in any written file; inline `<img>` gained width/height and lost srcset.
4. `npm run build` → `out/blog/<slug>/index.html` exists; sitemap.xml includes it; serve + headless: index card → post → back-link; JSON-LD parses.
5. Unpublish via Admin API (`PUT status:'draft'`), re-run sync with `--allow-empty` → JSON + images removed, index.json empty; rebuild → empty state returns.
6. Teardown: stop container, remove temp volume, `git status --porcelain` must show NO changes (all rehearsal writes reverted/removed). This is the acceptance test for the whole feature.

- [ ] **Step 2: Compose the three seed drafts** in the session scratchpad (NOT the repo) as clean HTML (h2/p/blockquote only, no images — the user can add images in Ghost):
1. **"The House of Birkenstein: a century at 401 W. Ontario"** — adapted from `app/history/page.tsx` copy (condense; link to `https://birkenlofts.com/history/`). Facts must match the page verbatim.
2. **"Where the conversion stands: October 2026 construction start"** — from `data/timeline.ts` milestones exactly (Design & Planning complete 2025; Permits & Approvals complete early 2026; construction begins Oct 2026; first deliveries Oct 2027). No invented progress claims.
3. **"First look: the finish selections"** — from the finishes page copy (kitchen/bath selections with brand names, corridor + paint in progress, subject-to-change note; link to `https://birkenlofts.com/finishes/`).
Each ≤500 words, site voice, with a suggested `--excerpt` and `--tags` (e.g. History / Construction / Design).

- [ ] **Step 3: HOLD for the real instance.** Pushing the seeds requires the user's real Ghost (setup is interactive). Report DONE with the drafts staged in the scratchpad and exact push commands prepared; the controller/user runs, in order: `docker compose -f infra/ghost/docker-compose.yml up -d` → `node scripts/setup-ghost.mjs` (user enters credentials) → the three prepared `push-draft.mjs` commands → user reviews drafts in Ghost.

---

## Final verification (controller/user, after all tasks)

- [ ] Controller visual pass: `/blog/` empty state + (from rehearsal screenshots) index/post rendering, desktop + mobile.
- [ ] User: run the real Ghost setup, receive the seed drafts, edit/publish in Ghost, run the first real `npm run sync-posts`, review, then merge/push (deploys live; Journal appears in nav with their first posts).
- [ ] Post-launch: llms/sitemap spot-check; consider adding `sync-posts` reminder docs to CLAUDE.md (branch-finish step).
