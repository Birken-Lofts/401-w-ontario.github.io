# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Single-page marketing site for **Birken Lofts** — a residential conversion at 401 W. Ontario St, Chicago. Next.js 15 (App Router, static export) + TypeScript, styled with the checked-in Organic design system CSS, with an interactive **Leaflet** neighborhood map as the centerpiece. Deployed to GitHub Pages at `birkenlofts.com` (custom domain via `public/CNAME`).

## Commands

```bash
npm run dev         # Next.js dev server
npm run build       # next build → static export in out/ (typecheck included)
npm run lint        # next lint (eslint-config-next)
npm run sync-posts  # snapshot published Ghost posts into content/posts/ (macOS-only; see Journal below)
```

There is no test suite. `npm run build` is the gate — it typechecks before exporting, so a type error fails the build (and the deploy).

## Deploy

Pushing to `main` triggers `.github/workflows/deploy.yml`, which runs `npm ci && npm run build` and publishes `out/` to GitHub Pages. No manual deploy step. The site is served from the custom apex domain (`public/CNAME`); `public/.nojekyll` keeps Pages from mangling `_next/` assets.

## Architecture

Next.js 15 App Router with `output: 'export'` and `trailingSlash: true` — every route is plain static HTML. Routes: `/` (`app/page.tsx`), `/history/`, `/finishes/`, `/blog/` + `/blog/[slug]/` (the Journal), and `/ohio-feeder-ramp-cam/`. The root layout (`app/layout.tsx`) renders `Nav` + `Footer` on every page, loads fonts via `next/font` (Caprasimo headings, Figtree body), and injects the GA tag. `app/sitemap.ts` generates `/sitemap.xml` at build time (static routes + Journal posts).

**Journal (blog)**: posts are authored in a local Docker Ghost (editor-only; `infra/ghost/README.md` is the full guide), then `npm run sync-posts` snapshots published posts into `content/posts/*.json` with images localized to `public/images/blog/` — both committed. `app/blog/` renders from those files via `lib/posts.ts`; CI never contacts Ghost. **Never hand-write files in `content/posts/`** — the sync owns that directory. To draft a post, use the `journal-post` skill (`.claude/skills/journal-post/`).

- Home is composed of section components under `components/home/`, each owning its section `id` (`plans`, `history`, `amenities`, `neighborhood`, `schedule`, `contact`). `Nav.tsx` links to `/#id` and `hooks/useScrollSpy.ts` observes the same ids — its `sections` array must match the section ids or nav highlighting silently breaks.
- Content data lives in `data/` (`location.ts` for the map POIs, `timeline.ts` for the construction milestones). Floor-plan and amenity copy is design-final and hardcoded in the section components (see `reference/design-2026/`).
- Per-page SEO uses Next `metadata` exports; JSON-LD blocks are inline `<script type="application/ld+json">` in the page components.

## Styling

The "Organic" design system from `reference/design-2026/styles.css` is checked in as `app/globals.css` — design tokens (`--color-*`, `--radius-*`, `--shadow-*`) and component classes (`.btn`, `.card`, `.tag`, `.input`…). **Do not restyle ad hoc: retune tokens there.** Layout/section classes translated from the design mocks live in `app/site.css`. No Tailwind. Headings use Caprasimo (400 only); body is Figtree. Buttons/inputs/tags are pills; photography gets the `.washed` filter treatment.

## Map (Neighborhood section)

`components/map/NeighborhoodMap.tsx` renders the interactive map with vanilla Leaflet in a `'use client'` component, dynamically imported with `ssr: false` from `components/home/Neighborhood.tsx` (static export never touches `window`). Two effects: one initializes the map once and fully tears it down (`map.remove()`) on cleanup so StrictMode's double-mount is safe; a second syncs pin visibility with the category filters. Pins/popups are custom `divIcon`s styled by the Leaflet block in `app/site.css` (light Carto tiles, Organic popups).

## Contact form

`Contact.tsx` POSTs JSON to a **Formspree** endpoint (`https://formspree.io/f/xqeyrene`) using `react-hook-form`. On network failure it shows an inline error (no fake success). Changing the recipient means swapping the Formspree form id.

## Assets

Production images live in `public/images/` as pre-generated multi-width `.webp` files. `public/` also holds SEO/LLM files (`sitemap.xml`, `robots.txt`, `llms.txt`, `llms-full.txt`) served at the site root. The `reference/` directory holds source material (PDFs, original elevation/floor-plan images, pitch book) — it is not bundled; it's the source of truth for site content. `reference/design-2026/` holds the Organic design handoff (HTML/CSS mocks) that Task 1–6 implemented.
