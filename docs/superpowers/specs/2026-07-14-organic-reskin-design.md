# Organic Reskin (design.zip) — Design

**Date:** 2026-07-14
**Status:** Approved in conversation; pending final spec review

## Goal

Rebuild birkenlofts.com to the "Organic" design system delivered in `design.zip`
(handoff: `design_handoff_birken_lofts/` — README, `home.dc.html`,
`traffic-cam.dc.html`, `styles.css`), migrating the codebase from Vite + React
SPA to **Next.js (App Router) with static export**, on a branch, tested locally.
Three deliberate departures from the mock (user decisions):

1. **Persistent nav** — fixed at top, always solid-backed; never scrolls away.
2. **Neighborhood keeps our interactive Leaflet map**, restyled Organic.
3. **Construction schedule stays a horizontal timeline** (today's 4 milestones),
   restyled Organic — not the mock's 3-card grid.

Ghost blog integration is **out of scope** (later project). Gallery, History
page, Resident Portal: out of scope; their nav/footer links are omitted until
those pages exist.

## Decisions (settled with user)

- **Stack:** Next.js 15, TypeScript, App Router, `output: 'export'`,
  `trailingSlash: true`, `images: { unoptimized: true }`. Hosting stays GitHub
  Pages + custom domain; deploy workflow updated (`dist/` → `out/`, add
  `public/.nojekyll`).
- **Styling:** the handoff's `styles.css` is ported as the global design system
  (tokens + component classes, used directly). **Tailwind is removed** on this
  branch, along with `@tailwindcss/vite` and `framer-motion` (no animations in
  the design). Layout styles from the mock's inline styles become section
  classes in a second global stylesheet (`app/site.css`). Dependencies kept:
  `leaflet`, `react-hook-form`, `lucide-react`. Added: `next`. Removed: `vite`,
  `@vitejs/plugin-react`, `tailwindcss`, `@tailwindcss/vite`, `framer-motion`.
- **Fonts:** Caprasimo + Figtree via `next/font/google` (no external `<link>`).
- **Cam page URL:** stays `/ohio-feeder-ramp-cam/` (SEO already earned). Nav
  labels it "Traffic Cam". The design's `/traffic-cam` route is not created.
- **Nav items:** Residences (`/#plans`), History (`/#history`), Amenities
  (`/#amenities`), Neighborhood (`/#neighborhood`), Traffic Cam
  (`/ohio-feeder-ramp-cam/`), Contact (`/#contact`), pill button "Contact us"
  (`/#contact`). Gallery / Blog / Resident Portal omitted.
- **Floor plans content:** design copy **as written** (Studio / One bedroom /
  Two bedroom, 550–700 / 750–1,000 / 1,100–1,400 sq ft, "Interest list open"
  tags, placeholder images). `units.ts` and its floor-plan images are retired
  from the page. Crawl files (`llms.txt`, `llms-full.txt`) and home JSON-LD are
  updated to match the new public story (studios–two-bedrooms, 550–1,400 sq ft)
  so the site never contradicts itself to crawlers.
- **Contact block:** street address only — **no email line** (mailbox not
  confirmed). Form still POSTs JSON to Formspree `https://formspree.io/f/xqeyrene`
  via `react-hook-form`; success state = inline confirmation replacing the form
  in the same card. (Existing behavior of showing success on network failure is
  replaced by a proper error message — small, deliberate improvement.)
- **Branch:** work happens on `reskin-organic`; test locally with `npm run dev`
  and a static `out/` check before any merge decision.

## Architecture / file structure

```
next.config.ts            output:'export', trailingSlash, images.unoptimized
app/
  layout.tsx              html/body, fonts, GA (next/script, G-YVPGP24V3P),
                          Nav + Footer, metadataBase
  globals.css             ported styles.css (tokens + component classes, verbatim
                          apart from removing its Google Fonts @import — fonts
                          come from next/font; expose CSS vars for the two font
                          families from layout.tsx)
  site.css                section/layout classes translated from the mocks'
                          inline styles (hero grid, stats band, cards grid,
                          history band, neighborhood grid, schedule timeline,
                          contact grid, footer) + Leaflet Organic re-theme
                          (.bk-* replacements) + sticky-nav + responsive rules
  page.tsx                Home (server component; composes sections; exports
                          metadata; renders ApartmentComplex JSON-LD)
  ohio-feeder-ramp-cam/
    page.tsx              Cam page (server component; metadata; VideoObject +
                          FAQPage JSON-LD; embed + text stack + FAQ)
components/
  Nav.tsx                 'use client' (mobile drawer state, scroll-spy)
  Footer.tsx              server component
  home/Hero.tsx, StatsBand.tsx, FloorPlans.tsx, HistoryBand.tsx,
       Amenities.tsx, Neighborhood.tsx, Schedule.tsx, Contact.tsx
                          (all server components except Contact and the map)
  map/NeighborhoodMap.tsx 'use client'; Leaflet logic ported from Location.tsx;
                          imported in Neighborhood.tsx via next/dynamic ssr:false
  ImageSlot.tsx           placeholder image area (washed treatment wrapper,
                          neutral-300 fill + label) used by Hero/FloorPlans/History
hooks/useScrollSpy.ts     ported as-is (client)
data/location.ts          ported as-is (categories, pois, HOME)
data/timeline.ts          ported as-is (4 milestones)
public/                   unchanged: CNAME, favicon.svg, images/, robots.txt,
                          sitemap.xml, llms.txt, llms-full.txt; + new .nojekyll
```

Deleted on this branch: `vite.config.ts`, `index.html`,
`ohio-feeder-ramp-cam/index.html` (content moves into the route),
`src/` (App.tsx, main.tsx, index.css, components, hooks, data — ported pieces
move to the new top-level dirs), `eslint.config.js` Vite bits (replaced by
`next lint` config or a minimal eslint setup consistent with create-next-app).
`src/data/units.ts` and `features.ts` retire (floor-plan/amenity content now
comes from the design copy, hardcoded in their sections like the mock).

## Design system port

`app/globals.css` = handoff `styles.css` with only these changes:
- Remove the `@import url(...fonts.googleapis...)` line; `--font-heading`/
  `--font-body` are set from `next/font` variables in `layout.tsx`.
- Append nothing else — component classes stay verbatim so the file remains
  "the source of truth" it claims to be.

`app/site.css` holds everything the mock does with inline styles, as classes
(one section = one class cluster, mirroring the mock's values: 1280px max
width, 48px page padding, 88px section rhythm, the exact grid templates, font
sizes, radii multipliers). Also:
- **Sticky nav**: `.site-nav { position: fixed; top: 0; left: 0; right: 0;
  z-index: 1000; background: var(--color-bg); border-bottom: 1px solid
  var(--color-divider); }` + body padding-top equal to nav height. Link and
  brand styling from `.nav`/`.nav-brand` unchanged; `aria-current="page"` gets
  accent per the design.
- **Leaflet Organic theme** replacing today's dark `.bk-*` rules: light warm
  tiles (Carto `light_all`), popups as cream surface cards
  (`--color-surface`, `--radius-md`+, `--shadow-md`, body text `--color-text`),
  pins keep per-category colors from `location.ts` with `--color-bg` borders,
  home marker solid `--color-accent` with terracotta pulse, zoom controls and
  attribution restyled light.
- **Responsive rules** (not designed; sensible stacking per handoff): grids →
  single column ≤768px; nav collapses to hamburger + drawer (Lucide Menu/X,
  ported pattern from current Navbar) below ~860px; stats band wraps; timeline
  becomes horizontally scrollable with snap.

Icons: Lucide (`lucide-react`), stroke-width 2.75 (amenity checks, menu).

## Home page composition

Section order and content per `home.dc.html`, copy verbatim except where noted:

1. **Nav** — see above (fixed; reduced link set).
2. **Hero** — 2-col grid, sage tag, H1 58px, body, primary "View floor plans"
   + secondary "Contact us"; right: 480px blob-masked (`border-radius:
   46% 54% 52% 48% / 44% 46% 54% 56%`) washed `ImageSlot` ("Building exterior —
   north facade"). A real photo exists in `public/images/elevations/` — use it
   inside the slot with the washed filter (improvement over empty placeholder,
   same treatment the handoff prescribes for when photos arrive).
3. **Stats band** — sage-100 fill, radius `--radius-lg × 1.4`; 1905 / 57 / 4 /
   0.2 mi with the design's labels.
4. **Floor plans** (`#plans`) — heading + intro, 3 `.card elev-sm` cards:
   Studio / One bedroom / Two bedroom, design copy as written, sage "Interest
   list open" tag, 200px washed image slots, secondary pill "Inquire" →
   `#contact`.
5. **History band** (`#history`) — terracotta-100 container, "Since 1905" tag,
   H2 "The House of Birkenstein", paragraph, 340px circular washed slot
   ("Archival photo or 1916 advertisement"). The mock's ghost link "Read the
   building's story →" is **omitted** until the History page exists —
   consistent with the no-dead-links decision.
6. **Amenities** (`#amenities`) — 3-col grid, six rows: sage-200 40px circle +
   Lucide check (stroke 2.75) + 16px label; the design's six labels.
7. **Neighborhood** (`#neighborhood`) — design's H2 "River North" + intro.
   Then, replacing the mock's iframe composition: full-width rounded container
   (`--radius-lg × 1.4`, 1px divider border, min 420px) holding the
   **interactive Leaflet map** (all current behavior: category pill filters,
   place list, fly-to + popup on select, scroll-zoom gated behind click,
   pulsing home marker, StrictMode-safe teardown) restyled Organic. The filter
   chips become `.tag`-style pills (active = category color tint), the place
   list becomes a light surface panel (kept, at the map's left as today, 350px
   column ≥920px, stacked below on mobile). The design's three cards (Eat &
   drink / Transit / Outside, copy verbatim) render as a 3-across `.card` row
   beneath the map container. The current dark proximity strip is dropped
   (its content overlaps the cards + stats band).
8. **Construction schedule** (`#schedule`) — design's H2 + intro line, then the
   **horizontal timeline**: 4 milestones from `data/timeline.ts` on one line —
   dot + connector (complete = filled `--color-accent`; next = accent-outlined
   dot, connector gradient to neutral; upcoming = neutral-outlined), pill
   status tag per milestone derived from `state` (complete → `.tag-accent-2`
   "Complete", next → `.tag-accent` "Next", upcoming → `.tag-neutral`
   "Planned"), date shown as the `label` field's date part only (e.g.
   "Oct 2026" — the " · status" suffix is dropped in favor of the tag),
   Caprasimo 20–22px milestone titles, 13px neutral-700 date labels,
   13–14px body. Horizontal
   scroll + snap under 660px (today's pattern). This resolves the mock's
   `[date TBD]` placeholders with real dates.
9. **Contact** (`#contact`) — surface container, H2 + blurb + address block
   (street address only, **no email**); right: the design's 2-col pill-input
   form (Name, Email, Phone, Interested in, Message, "Send message"), wired via
   `react-hook-form` to Formspree `xqeyrene`; required validation on Name +
   Email; success = inline confirmation replacing the form; network failure =
   inline error message (not fake success).
10. **Footer** — neutral-900 ground per design; brand block + link row:
    Residences, History, Traffic Cam, Contact (Gallery/Blog/Resident Portal
    omitted). Traffic Cam link doubles as the crawl path to the cam page.

## Traffic cam page (`/ohio-feeder-ramp-cam/`)

Layout per `traffic-cam.dc.html`: same nav/footer (Traffic Cam gets
`aria-current="page"`), sage "Live · 24/7" tag, H1 50px "Ohio Feeder Ramp Cam",
full-width rounded 16:9 player (neutral-900 fill) with the YouTube embed —
video ID `DdyWM2B-FYQ` (resolves the design's `[TBD]`), `youtube-nocookie.com`
embed URL kept from the current page (privacy + parity; the design's
`autoplay=1&mute=1` params are adopted), `title`, `allowfullscreen`. Below: the
design's three-line text stack, then the existing three FAQ items restyled as
Organic cards/rows — kept because the FAQPage JSON-LD must mirror visible copy.

SEO carried over verbatim from the current page: `metadata` export (existing
title, description, canonical `https://birkenlofts.com/ohio-feeder-ramp-cam/`,
OG incl. `og:video`), VideoObject JSON-LD (`isLiveBroadcast: true`) and
FAQPage JSON-LD as inline scripts. The page's H1 changes to the design's "Ohio
Feeder Ramp Cam" while the `<title>`/meta keep the keyword-rich phrasing.
The design's "Footage is not recorded." line ships only if true — flagged to
user at review; default in.

## SEO / crawl continuity

- Home: `metadata` export reproduces current title/description/OG/canonical;
  ApartmentComplex JSON-LD kept, with `amenityFeature` reconciled to the new
  amenities list and unit-mix facts updated per the floor-plans decision.
- `sitemap.xml`, `robots.txt` unchanged. `llms.txt` / `llms-full.txt`: update
  the Residences/unit-mix sections to the new public story (studio–two-bedroom,
  550–1,400 sq ft, interest list open; drop the retired per-unit floor-plan
  entries); Live Traffic Camera sections unchanged.
- GA tag on both pages via root layout.
- All copy server-rendered into static HTML (LLM-crawler readable, as today).

## Error handling

- Map: dynamic import with `ssr: false`; if Leaflet fails to load the section
  shows the design's rounded empty container (no crash — component renders
  container first, map enhances it).
- Form: submitting state disables the button (45% opacity per design);
  Formspree failure shows inline error text in the card; success replaces form.
- YouTube offline: embed shows YouTube's own offline state (as today).

## Out of scope

Ghost blog (`/blog`), History page, Gallery page, Resident Portal, real
photography, responsive designs beyond sensible stacking, any hosting change.

## Testing / verification

No test suite (unchanged). Gates:
1. `npm run build` (Next: typecheck + static export) succeeds; `out/index.html`
   and `out/ohio-feeder-ramp-cam/index.html` exist.
2. Grep checks on `out/`: home title/JSON-LD present; cam page canonical,
   VideoObject, FAQPage, embed URL present; llms files copied; CNAME +
   .nojekyll present in `out/`.
3. `npm run dev` — user visually reviews: sticky nav, all sections vs mock,
   map interactivity (filters, popups, fly-to), timeline, form validation +
   success state, cam page, mobile drawer at narrow width.
4. Deploy workflow updated but **not exercised until merge** (branch is local).
