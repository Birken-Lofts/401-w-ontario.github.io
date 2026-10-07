# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Marketing site for **Birken Lofts** — a residential conversion at 401 W. Ontario St, Chicago. Next.js 15 (App Router, static export) + TypeScript, styled with a checked-in dark industrial design system (the 2026 redesign), with an interactive **Leaflet** neighborhood map on the home page (a static SVG map on phones) and a 270-listing neighborhood guide at `/things-to-do-river-north/`. Deployed to GitHub Pages at `birkenlofts.com` (custom domain via `public/CNAME`).

## Commands

```bash
npm run dev                # Next.js dev server
npm run build              # next build → static export in out/ (typecheck included)
npm run lint               # next lint (eslint-config-next)
npm test                   # node --test over lib/*.test.mts (the guide's data normalizers)
npm run sync-posts         # snapshot published Ghost posts into content/posts/ (macOS-only; see Journal below)
npm run build-guide-photos # resize downloaded listing photos → public/images/guide/ (manual; see Guide below)
npm run verify-guide       # 53 browser checks against a served build (manual; see Guide below)
```

`npm run build` is the gate — it typechecks before exporting, so a type error fails the build (and the deploy). CI runs only `npm ci && npm run build`; `npm test` and `npm run verify-guide` are local gates, and the two guide-photo/verify scripts need network, Python, or a browser that CI deliberately does not have.

## Deploy

Pushing to `main` triggers `.github/workflows/deploy.yml`, which runs `npm ci && npm run build` and publishes `out/` to GitHub Pages. No manual deploy step. The site is served from the custom apex domain (`public/CNAME`); `public/.nojekyll` keeps Pages from mangling `_next/` assets.

## Architecture

Next.js 15 App Router with `output: 'export'` and `trailingSlash: true` — every route is plain static HTML. Routes: `/` (`app/page.tsx`), `/history/`, `/things-to-do-river-north/` (the neighborhood guide), `/progress/` (construction photos), and `/blog/` + `/blog/[slug]/` (the Journal). The former `/finishes/` and `/ohio-feeder-ramp-cam/` pages were **removed by the 2026 redesign** — don't reintroduce them or link to them (finishes is a "Coming soon" teaser on the home page; the highway ramp is deliberately never mentioned). The root layout (`app/layout.tsx`) renders `Nav` + `Footer` on every page, loads fonts via `next/font` (Big Shoulders Display headings, Libre Franklin body), and injects the GA tag. `app/sitemap.ts` generates `/sitemap.xml` at build time (static routes + Journal posts).

**Journal (blog)**: posts are authored in a local Docker Ghost (editor-only; `infra/ghost/README.md` is the full guide), then `npm run sync-posts` snapshots published posts into `content/posts/*.json` with images localized to `public/images/blog/` — both committed. `app/blog/` renders from those files via `lib/posts.ts`; CI never contacts Ghost. **Never hand-write files in `content/posts/`** — the sync owns that directory. To draft a post, use the `journal-post` skill (`.claude/skills/journal-post/`).

**Neighborhood guide** (`/things-to-do-river-north/`): 270 River North listings in ten category sections. `docs/design/` holds the supplied handoff — the guide as prose, the same content as JSON, and `download-photos.py`; `content/guide/listings.json` is the verbatim runtime copy the site reads. `lib/guide.ts` owns every bit of data logic (the category table, plus `normalizeSeasons` and `priceTier`, which flatten the raw data's 28 season strings and 100+ price strings — these have real unit tests in `lib/guide.test.mts`, the only tests in the repo).

All 270 cards render **server-side** so the content is in the static HTML and works with JS off. `components/guide/GuideFilters.tsx` filters by writing a single CSS rule into a `<style>` element it owns — category and season are attribute selectors, search uses `[data-search*="…" i]`, and empty sections collapse via `:has()`. **No listing data crosses to the client**; `GuideCard` emits the `data-cat`/`data-season`/`data-search` attributes the selectors match, so changing those attribute names silently breaks filtering. Photos: run `python3 docs/design/download-photos.py` (writes to a gitignored `docs/design/photos/`), then `npm run build-guide-photos` to emit the committed `public/images/guide/<id>-{480,960}w.webp`. 226 of 270 listings have a photo; the rest render a typographic fallback tile. **Every card image is below the fold at every viewport** — do not reintroduce eager loading here, it cost 14 Lighthouse points on mobile.

**Progress** (`/progress/`): construction photos come from the shared Monroe progress-photos service (repo `monroeresidential/progress-photos-app`, `progress.monroeresidential.com`), embedded as `<progress-feed project="birken-lofts">` + a **pinned** embed script (`/embed/<version>.js` with an SRI `integrity` hash — `EMBED_SRC`/`EMBED_SRI` in `app/progress/page.tsx`). Service embed changes reach this page only when both are bumped together, after `npm run embed:release` in that repo; a mismatched hash makes the browser refuse the script and the page shows only the fallback text. Photos are uploaded through that service's app, not this repo — nothing to build or sync here. The tag is declared for TSX in `types/progress-feed.d.ts` and themed only via `--pf-*` custom properties at the end of `site.css`. The service only answers origins registered for the project, so the feed is **blank on localhost and preview URLs** — test by serving `out/` as `https://birkenlofts.com` in Playwright (route interception), or add the origin in the service. Its share card `public/images/og/progress-og.jpg` is a static snapshot rendered by `node scripts/build-progress-og.mjs <photoId> "<subtitle>"` (manual; network + playwright) — rerun it with a newer photo id from the feed API when the card goes stale.

- Home is composed of section components under `components/home/`, each owning its section `id` (`plans`, `history`, `amenities`, `neighborhood`, `schedule`, `contact`). `Nav.tsx` links to `/#id` and `hooks/useScrollSpy.ts` observes the same ids — its `sections` array must match the section ids or nav highlighting silently breaks.
- Content data lives in `data/` (`location.ts` for the map POIs, `timeline.ts` for the construction milestones). Floor-plan and amenity copy is design-final and hardcoded in the section components (see `reference/design-2026/`).
- Per-page SEO uses Next `metadata` exports; JSON-LD blocks are inline `<script type="application/ld+json">` in the page components.

## Styling

The dark industrial design system (from the `redesign.zip` / `mobile-redesign.zip` handoffs at the repo root) is checked in as `app/globals.css` — color tokens (`--color-bg/band/surface/accent/…`) and base elements (`.btn`, `.input`, headings) — with all layout/section/component classes in `app/site.css`. **Do not restyle ad hoc: retune tokens in `globals.css`.** No Tailwind. **Media queries add no specificity, so source order decides:** `site.css` has a shared `@media (max-width: 768px)` block partway down, but a section appended *after* it will beat it. Put a section's mobile rules at the end of that section, not in the shared block — doing the reverse silently killed most of the guide's mobile CSS once, and the page still looked plausible. Headings are Big Shoulders Display (700/800, uppercase); body is Libre Franklin 300. **No border radius and no shadows anywhere** — sharp edges and hairline borders (`--color-divider`). Mobile (≤768px) follows the `mobile-redesign.zip` spec: 60px header with a full-screen overlay menu (`Nav.tsx`), vertical timeline schedule, single-column stacks.

## Map (Neighborhood section)

`components/map/NeighborhoodMap.tsx` renders the interactive map with vanilla Leaflet in a `'use client'` component, dynamically imported with `ssr: false` from `components/home/Neighborhood.tsx` (static export never touches `window`). Two effects: one initializes the map and fully tears it down (`map.remove()`) on cleanup so StrictMode's double-mount is safe; a second syncs pin visibility with the category filters. Pins/popups are custom `divIcon`s styled by the Leaflet block in `app/site.css` (dark Carto tiles). Below 640px the component swaps in `components/map/MobileMap.tsx` — a static portrait SVG transcribed from the mobile handoff (tile labels are illegible at phone widths); the swap is driven by `matchMedia`, and crossing the breakpoint remounts Leaflet cleanly.

## Contact form

`Contact.tsx` POSTs JSON to a **Formspree** endpoint (`https://formspree.io/f/xqeyrene`) using `react-hook-form`. On network failure it shows an inline error (no fake success). Changing the recipient means swapping the Formspree form id.

## Assets

Production images live in `public/images/` as pre-generated multi-width `.webp` files — including `public/images/guide/` (452 files, ~19 MB, generated by `npm run build-guide-photos`; the raw downloads under `docs/design/photos/` are gitignored). `public/` also holds SEO/LLM files (`sitemap.xml`, `robots.txt`, `llms.txt`, `llms-full.txt`) served at the site root. `docs/design/` holds the neighborhood-guide handoff and `docs/superpowers/` the specs and plans. The `reference/` directory holds source material (PDFs, original elevation/floor-plan images, pitch book) — it is not bundled; it's the source of truth for site content. `reference/design-2026*/` hold the earlier Organic design handoffs (superseded); the current dark redesign's handoffs are `redesign.zip` (desktop) and `mobile-redesign.zip` (mobile) at the repo root.
