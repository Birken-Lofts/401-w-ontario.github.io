# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Single-page marketing site for **Birken Lofts** — a residential conversion at 401 W. Ontario St, Chicago. React 19 + TypeScript + Vite, styled with Tailwind CSS v4, with an interactive **Leaflet** neighborhood map as the centerpiece. Deployed to GitHub Pages at `birkenlofts.com` (custom domain via `public/CNAME`).

## Commands

```bash
npm run dev      # Vite dev server with HMR
npm run build    # tsc -b (typecheck) then vite build → dist/
npm run lint     # ESLint over the repo
npm run preview  # Serve the production build locally
```

There is no test suite. `npm run build` is the gate — it typechecks via project references before bundling, so a type error fails the build (and the deploy).

## Deploy

Pushing to `main` triggers `.github/workflows/deploy.yml`, which runs `npm ci && npm run build` and publishes `dist/` to GitHub Pages. No manual deploy step. `vite.config.ts` uses `base: '/'` because the site is served from a custom apex domain, not a project subpath.

## Architecture

The whole site is one scrolling page. `App.tsx` renders `Navbar`, then a fixed list of `<section>` components in order, then `Footer`. Each section owns its own `id` and is a self-contained file under `src/components/sections/`.

- **Section-as-anchor navigation.** Each section's `id` (`hero`, `about`, `residences`, `features`, `location`, `timeline`, `contact`) is the navigation contract. `Navbar` links to `#id`, and `useScrollSpy` (`src/hooks/`) observes those same ids via `IntersectionObserver` to highlight the active link. **The section id list is duplicated in three places** — the section's own JSX, the `links` array in `Navbar.tsx`, and the `sections` array in `useScrollSpy.ts`. When adding, removing, or renaming a section, update all three or scroll-spy and nav links silently break.
- **Content lives in `src/data/`.** `units.ts`, `features.ts`, `timeline.ts`, and `location.ts` export typed arrays that the matching section maps over. Edit data here rather than hardcoding it in JSX. Unit floor-plan images carry explicit `floorPlanWidth`/`floorPlanHeight` to reserve layout space and avoid CLS. `location.ts` holds the map's `categories`, `pois` (coordinates are approximate — verify before launch), and the `HOME` pin.
- **Reusable UI** is in `src/components/ui/`: `Logo` (the SVG arched-window "BL" monogram lockup, used in nav + footer), `ScrollReveal` (a Framer Motion `whileInView` fade-up wrapper), and `SectionHeading` — which also exports a named `Eyebrow` (the rule + uppercase terracotta label that precedes most section headings).

## Styling

Tailwind v4 configured **in CSS, not a JS config** — `src/index.css` defines the design tokens in an `@theme` block. There is no `tailwind.config.js`. The brand palette is **semantic, single-value tokens** (not numbered 50–900 scales): `terracotta` (accent/CTA, with `terracotta-soft`), `paper`/`cream` (light surfaces), `ink` (text on light), `charcoal`/`charcoal-deep`/`panel` (dark surfaces), warm text grays (`sand`, `sand-2`, `taupe`, `taupe-2`, `stone`, `stone-2`), hairlines (`line`, `line-2`, `line-dark`, `line-dark-2`), and `cat-*` map-category colors. Headings use `font-display` (Instrument Serif); body uses `font-body` (Space Grotesk). Use these tokens (e.g. `bg-paper`, `text-terracotta`) rather than default Tailwind colors. Because tokens are single-value, components lean on **arbitrary values** for sizing — e.g. `text-[clamp(40px,5.5vw,72px)]`, `max-w-[1320px]`, `py-[clamp(80px,11vw,150px)]`, and the custom `min-[860px]:` / `min-[920px]:` breakpoints from the design spec.

## Map (Location section)

`Location.tsx` renders the interactive map with **vanilla Leaflet** (not react-leaflet) inside a `useEffect`. Two effects: one initializes the map once and **fully tears it down** (`map.remove()`) on cleanup so React StrictMode's double-mount in dev doesn't throw "already initialized"; a second syncs pin visibility when category filters change. Pins/popups are custom `divIcon`s; their CSS (`.bk-pin`, `.bk-home`, `.leaflet-*` overrides, the pulse keyframe) lives in `index.css`, and `leaflet/dist/leaflet.css` is imported there too. Scroll-wheel zoom is gated behind a map click so it doesn't hijack page scroll. Leaflet makes the JS bundle large (~525 kB) — lazy-loading this section is the obvious win if bundle size matters.

## Contact form

`Contact.tsx` POSTs JSON to a **Formspree** endpoint (`https://formspree.io/f/xqeyrene`) using `react-hook-form`. On network failure it still shows the success state rather than surfacing an error. Changing the recipient means swapping the Formspree form id.

## Assets

Production images live in `public/images/` as pre-generated multi-width `.webp` files. `public/` also holds SEO/LLM files (`sitemap.xml`, `robots.txt`, `llms.txt`, `llms-full.txt`) served at the site root. The `reference/` directory holds source material (PDFs, original elevation/floor-plan images, pitch book) — it is not bundled; it's the source of truth for site content.
