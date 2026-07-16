# Ghost Journal — Design Spec

**Date:** 2026-07-16
**Status:** User-approved
**Context:** birkenlofts.com (Next.js 15 static export on GitHub Pages), branch `ghost-journal`. Ghost integration for a blog, with the constraint that the site is and stays fully static.

## Decision summary (user-confirmed)

1. **Architecture: local Ghost + committed content snapshot** (rejected: hosted headless Ghost with build-time API calls — costs money and couples CI to an external service; Ghost-rendered subdomain — splits SEO and design; markdown-only — loses the Ghost editor the user wants).
   - Ghost runs **locally in Docker** as a writing tool only (verified available: Docker 29.5.3, daemon up). Visitors never touch it.
   - Published posts are **synced into the repo** as JSON + localized images; the static build renders them. CI never contacts Ghost; publishing = sync + git push.
2. **Naming: label "Journal", URL `/blog/`** (and `/blog/<slug>/`).
3. **Navigation: top nav item "Journal" after History** (order becomes Residences · Finishes · History · Journal · Amenities · Neighborhood · Traffic Cam · Contact) **+ footer link** (after History). The nav-wrap threshold must be re-measured with the 8th item; raise the drawer breakpoint (currently 980px) to the measured safe value.
4. **Seed content: 3 draft posts** pushed to local Ghost via the Admin API for the user's edit/approval — drafts are NOT committed to the repo (public repo; unpublished marketing copy stays out of git). Topics adapted strictly from verified existing site material: (a) the House of Birkenstein story, (b) a construction-timeline status update, (c) a finishes-selections preview.

## Components

### 1. Ghost editor infrastructure (`infra/ghost/`)

- `docker-compose.yml` (committed): official `ghost:5` image, port `2368:2368`, `url=http://localhost:2368`, `NODE_ENV=development` (local-only instance), host volume `~/.birken-ghost:/var/lib/ghost/content` (content lives OUTSIDE the repo).
- `scripts/setup-ghost.mjs` (committed): one-time bootstrap — waits for Ghost to come up, calls Ghost's setup endpoint (`POST /ghost/api/admin/authentication/setup/`) to create the owner account, logs in via session auth, creates a custom integration ("Site Sync") via the Admin API, and writes `GHOST_URL`, `GHOST_CONTENT_KEY`, `GHOST_ADMIN_KEY` to gitignored **`.env.local`**. Credentials (name/email/password) prompted or passed via env — never committed, never echoed. Idempotent: if Ghost is already set up, it says so and exits with manual instructions.
- `infra/ghost/README.md` (committed): the full manual path (compose up, create account in browser, create integration, fill `.env.local`) for when the script can't run.
- `.gitignore` gains `.env.local` (verify Next's default; add explicitly).

### 2. Draft push (`scripts/push-draft.mjs`)

- Node script, zero new dependencies: signs the Ghost Admin API JWT manually with `node:crypto` (HS256, `kid` = key id, `aud: '/admin/'`, 5-min expiry) and `POST /ghost/api/admin/posts/?source=html` with `{ posts: [{ title, html, custom_excerpt, tags, status: 'draft' }] }`.
- CLI: `node scripts/push-draft.mjs <file.html> --title "..." [--excerpt "..."] [--tags a,b]`. Reads keys from `.env.local`.
- Used for the seed drafts and any future Claude-authored drafts.

### 3. Content sync (`scripts/sync-posts.mjs` — the heart)

- `npm run sync-posts`. Zero new dependencies (fetch + node:fs + `sips` shell-out for image dimensions — macOS-only is acceptable: the sync always runs on the author's Mac, never in CI).
- Pulls ALL published posts: `GET /ghost/api/content/posts/?key=…&include=tags&formats=html&limit=all`.
- Per post, writes `content/posts/<slug>.json`: `{ slug, title, custom_excerpt, html, feature_image, feature_image_width, feature_image_height, published_at, updated_at, reading_time, tags: [names] }`.
- **Image localization:** downloads every image the post references (feature image + inline `<img src>`) from the local Ghost into `public/images/blog/<slug>/<original-filename>`, rewrites URLs to `/images/blog/<slug>/…`, **strips Ghost-injected `srcset`/`sizes` attributes** (single-file simplicity), and adds `width`/`height` attributes to inline `<img>` tags (via `sips`) to prevent CLS.
- Writes `content/posts/index.json`: array of slugs ordered by `published_at` desc.
- **Deletion handling:** any `content/posts/*.json` (and its `public/images/blog/<slug>/` directory) whose slug is no longer in the published set is removed — unpublishing in Ghost + re-sync removes the post from the site.
- **Hard guard:** after writing, the script greps its own output for `localhost` / `:2368`; any hit = non-zero exit and a loud error. It also exits non-zero if Ghost is unreachable (never silently writes an empty set — deleting all posts requires the explicit `--allow-empty` flag).
- `content/` is committed; `content/.gitkeep` so the dir exists pre-first-sync.

### 4. Site pages

- `app/blog/page.tsx` — Journal index (server component): header (tag `The Journal`, H1 "Journal", one-line lede), then post cards (Organic `.card` family): feature image (plain `<img>` with dims from JSON), date (e.g. "July 16, 2026"), title, excerpt, reading time. Cards link to `/blog/<slug>/`. **Empty state** (zero posts): a short "First entries are on their way." note — the build must succeed with zero posts. Metadata: title "Journal | Birken Lofts", canonical `/blog/`.
- `app/blog/[slug]/page.tsx` — `generateStaticParams` from `content/posts/index.json` (empty array OK). Post page: back-link "← Journal", tag(s), H1, date + reading time line, feature image, then the post HTML via `dangerouslySetInnerHTML` inside `<div className="post-prose">`. Per-post `generateMetadata` (title, description from excerpt, canonical, OG with feature image) + Article JSON-LD (headline, datePublished/dateModified, image, publisher Birken Lofts).
- A small `lib/posts.ts` (server-only fs readers: `getAllPosts()`, `getPost(slug)`) shared by both pages and the sitemap.
- `app/site.css` — `— journal —` block: index card grid (2-col desktop, 1-col mobile), `.post-prose` typography in Organic tokens (measure ~68ch; h2/h3, p, ul/ol, blockquote with terracotta rule, img rounded + captioned via figure, hr as hairline, links in accent-700), post header styles, mobile (≤768px) treatment consistent with the site's mobile rules.

### 5. Navigation, sitemap, crawl files

- `Nav.tsx`: `{ href: '/blog/', label: 'Journal', current: onBlog }` (`pathname.startsWith('/blog')`) after History. Footer: Journal link after History. Re-measure wrap: raise the 980px drawer breakpoint to the measured safe value (expected ~1080px) in `app/site.css`.
- **Sitemap migration**: delete `public/sitemap.xml`; add `app/sitemap.ts` returning the four existing routes (preserving their current lastmod dates), `/blog/` and every post (lastmod = `updated_at`). Served at the same `/sitemap.xml` URL by Next's static export.
- `public/llms.txt`: add a `## Journal` section (one line + `https://birkenlofts.com/blog/`) between `## Building History` and `## Live Traffic Camera`. `llms-full.txt`: one pointer line appended to `## About the Building`'s history paragraph area (same pattern as before).

### 6. Seed drafts (not committed)

Composed in the session scratchpad, pushed via `push-draft.mjs` as **drafts**, then the scratchpad copies deleted. Facts strictly from the live site/PDIL narrative/finishes deck — no invented dates, prices, or availability claims. The user edits/publishes in Ghost; first real sync happens after their approval.

## Publishing workflow (documented in infra/ghost/README.md)

```
docker compose -f infra/ghost/docker-compose.yml up -d   # editor on, once per writing session
# write & publish in Ghost (localhost:2368/ghost)
npm run sync-posts
git add content public/images/blog && git commit && git push   # live in ~90s
```

## Non-goals (deferred)

RSS feed, newsletters/memberships, scheduled publishing, post search, comments, per-post OG image cards (the site-wide OG image project is separately queued).

## Verification

- Build succeeds with zero posts (empty state) AND with a test post synced; `out/blog/index.html` + post pages exist; sitemap.xml contains posts; no `localhost`/`2368` anywhere in `out/` or `content/`.
- E2E rehearsal with a THROWAWAY post: publish via Admin API → sync → build → verify page + sitemap → unpublish → re-sync → verify removal → working tree returned to clean (rehearsal artifacts not committed).
- Nav wrap measured at the new threshold ± 20px; drawer takes over below it; desktop 8-item nav clean above it.
- Headless: Journal nav highlighting on /blog/ and on a post page; index card → post navigation; back-link; mobile stacking.
- Seed drafts visible in the user's Ghost admin as drafts.
