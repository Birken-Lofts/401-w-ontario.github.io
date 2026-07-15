# "The House of Birkenstein" History Page — Design Spec

**Date:** 2026-07-15
**Status:** User-approved
**Context:** birkenlofts.com reskin branch `reskin-organic` (Next.js 15 static export, Organic design system). The user supplied two source documents at the repo root: `S. Birkenstein and Sons Building -PDIL Narrative.pdf` (8-page Preliminary Determination for Individual Listing narrative, IL SHPO) and `S. Birkenstein and Sons Building -PDIL Photos.pdf` (19 pages: location maps, 1906 Sanborn map, Louis Birkenstein portrait, 1916/1918/1920 trade ads, current exterior/interior photos).

## Decision summary (user-confirmed)

1. **URL: `/history/`** (`app/history/page.tsx`, static export with trailing slash).
2. **Nav "History" repoints to `/history/`** (top nav + footer). The home history band **stays on the home page** as a teaser and gains a **"Read the building's story →"** link to the page (the link the reskin spec deliberately omitted until this page existed).
3. **Full story depth**: ~900–1,200 words across titled sections with captioned historic figures.

## Content (facts strictly from the PDIL narrative — no invented history)

Page header: `Since 1905` tag, H1 **The House of Birkenstein**, lede sentence. Sections:

1. **Smokey Hollow** — Near North Side industrial history: 1850s industries, immigrant settlement, 1871 fire and rebuilding, the smoke-and-soot nickname, east-side Potter Palmer exodus (1882), the district staying industrial until developer Albert Friedman rebranded it "River North" in the late 1970s–80s. Figure: 1906 Sanborn map (caption notes the building labeled "J. Birkenstein & Sons Junk & Rags").
2. **A rag peddler's empire** — Sigmund Birkenstein: born Kissingen, Germany; emigrated 1857 (Richmond, VA and Hannibal, MO); Chicago 1866; rag-trade peddler; S. Birkenstein & Co. with partner Moses Kaufman (late 1870s, Kinzie Street); bought out partner in the 1880s; son Louis joined 1890; sons Henry, Albert, Milton; firm became S. Birkenstein & Sons by Sigmund's death in 1900. Figure: Louis Birkenstein portrait (The Rubber Age and Tire News, 1919).
3. **The house that Birkenstein built** — Louis's growth era: rubber/iron demand from autos and steel; 1905 purpose-built warehouse at 401 W. Ontario (offices + shipping/receiving on 1, storage/baling on 2, storage/sorting on 3); fourth story added 1912, designed by H. M. Eichberg; architecture (red face brick, eight bays, segmental-arch openings, limestone sill course, Prairie-style brick piers, corbeled brick frieze, dentil frieze and metal cornice, heavy timber structure). Figures: 1916 "Hey Joe! Label that Car" ad (Hide and Leather) and 1920 "The House of Birkenstein" ad (The Rubber Age and Tire News) — the page title's source.
4. **War and the scrap boom** — WWI demand; scrap a $1B industry by the late 1910s; offices in New York, Philadelphia, Minneapolis; Louis tapped in 1917 to lead the Waste Materials Branch of the Salvage Division of the Quartermaster's Department, in 1919 to head the Army's Surplus Property Division; four consecutive terms as president of the National Association of Waste Material Dealers.
5. **After Birkenstein** — 1917 land purchase at North & Kingsbury; 1920 lease of 401 W. Ontario to the Chicago Mill Paper Stock Company and move to the new headquarters; by 1950 (Sanborn) a cork and seal warehouse; later office conversion (1980s–90s).
6. **Birken Lofts today** — adaptive reuse into 57 residences; original heavy timber posts, beams, and brick exposed throughout (consistent with home-page copy). Figure: one current photo (existing `public/images/elevations/` asset or an interior from the photos PDF). CTAs: "View floor plans" → `/#plans` (btn-primary), "Contact us" → `/#contact` (btn-secondary).

Tone: the site's marketing voice (Organic), not the nomination's bureaucratic prose. Facts, names, and dates must trace to the narrative PDF. Figure captions cite sources (e.g. "Hide and Leather, February 1916").

## Assets

- Extract embedded images from the photos PDF with `pdfimages` at native resolution (fallback: 300 DPI `pdftoppm` crop like the floor plans); convert to webp; store in `public/images/history/` with descriptive kebab-case names (`sanborn-map-1906.webp`, `louis-birkenstein-1919.webp`, `hey-joe-ad-1916.webp`, `house-of-birkenstein-ad-1920.webp`, plus at most one interior shot, e.g. `timber-interior.webp`). Each ≤ 400 KB, long edge ≤ 1600px.
- Current exterior imagery reuses existing `public/images/elevations/` files — no duplicates.
- Historic artifacts are shown un-`washed` (they're already period pieces; the wash filter is for photography).

## Components / files

- **Create `app/history/page.tsx`** — server component: `metadata` export (title "The House of Birkenstein | Birken Lofts", description, canonical `https://birkenlofts.com/history/`, OpenGraph with the 1920 ad or exterior image), `Article` JSON-LD (headline, image, about the building, publisher Birken Lofts), and the sections above. Images via `next/image` with explicit `width`/`height` (no `fill`) inside figure elements; all lazy except the first.
- **Modify `components/Nav.tsx`** — History link `href: '/history/'`, `current: pathname.startsWith('/history')` (same pattern as Traffic Cam). Remove the `onHome && active === 'history'` wiring.
- **Modify `hooks/useScrollSpy.ts`** — remove `'history'` from the `sections` array.
- **Modify `components/Footer.tsx`** — History link → `/history/`.
- **Modify `components/home/HistoryBand.tsx`** — after the paragraph, add `<a className="history-link" href="/history/">Read the building&rsquo;s story &rarr;</a>` (band otherwise unchanged).
- **Modify `app/site.css`** — new `— history page —` block: prose measure (~65ch), section rhythm, `figure`/`figcaption` styles, alternating two-column figure+text layout at desktop, stacking at ≤768px; `.history-link` styling (terracotta, arrow).
- **Modify `public/sitemap.xml`** — add `/history/` entry (priority below home, above cam page or similar).
- **Modify `public/llms.txt` and `public/llms-full.txt`** — add a brief History section/pointer to `https://birkenlofts.com/history/` with 2–3 factual lines (1905, S. Birkenstein & Sons, scrap trade, 1912 fourth floor, adaptive reuse).

## Edge cases / constraints

- `robots.txt`, CNAME, favicon, icons: untouched. Existing images: untouched (new files only).
- Scroll-spy: after removing `history`, the band no longer highlights anything in the nav while scrolled past — intended.
- Cross-page hash links (`/#plans`, `/#contact`) from the history page must work (same mechanism the cam page already uses).
- The gate: `npm run build` + `npm run lint` + greps against `out/history/index.html` + a headless check of nav highlighting and the band link.

## Verification

- Build/lint; `out/history/index.html` exists; canonical + Article JSON-LD greps; nav has `/history/` and no `/#history` anywhere; sitemap contains `/history/`; band contains "Read the building's story".
- Headless browser: nav History navigates home → history page; aria-current set on History when on the page; "Read the building's story →" navigates; CTAs land on home sections; images load; no console errors (except sandbox GA).
- Fact-check pass: every date/name/claim on the page verified against the narrative PDF before commit.
