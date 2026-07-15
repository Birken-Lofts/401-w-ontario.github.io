# Finishes Page — Design Spec

**Date:** 2026-07-15
**Status:** User-approved
**Context:** birkenlofts.com (Next.js 15 static export, Organic design system), branch `finishes-page`. Source: `finishes.pptx` at the repo root (untracked, stays untracked) — "Interior Finish Selections, Monroe Residential Partners, June 2026," 12 slides. Media already extracted to the session scratchpad (`…/scratchpad/pptx/ppt/media/`); re-extract with `unzip` if needed.

## Decision summary (user-confirmed)

1. **Curated marketing version** — present each room's selected direction confidently; corridor and paint keep honest "In progress" tags. DROP: pull alternates, door-lever Options A/B framing, pricing/procurement notes ("Price 3cm…", "Available through Roca Tile"), the Open Items slide, and the Appendix links slide. Add a "selections shown reflect current design direction and are subject to change" note.
2. **Name real brands/products** (Daltile, Silestone, Egger, Amwell, Evolux, MSI, Roca, CFG). No procurement details.
3. **Home-page link = teaser band after Floor plans** with the kitchen concept render and "Explore the finish selections →".
4. URL **`/finishes/`**; nav order becomes Residences · **Finishes** · History · Amenities · Neighborhood · Traffic Cam · Contact; footer gains Finishes (after Residences).

## Page content (copy grounded in the deck; concept renders labeled as such)

Header: tag `Interior finish selections`, H1 **Finishes**, lede: "Warm flat-panel cabinetry and dark stone against the building&rsquo;s original brick and heavy timber." Then a full-width hero figure: the kitchen concept render, caption "Concept rendering — kitchen design direction."

Sections (numbered eyebrow labels like the deck's "01 · KITCHEN" rhythm, restyled with the site's tags):

1. **Kitchen** — selections list beside the photographed material board (and the 4-up concept-render collage as a second figure):
   - Backsplash — Daltile Artigiano, Venice Statue · 3" × 6"
   - Countertop — Silestone, Charcoal Soapstone Eternal · suede finish
   - Cabinets — Egger, Pebble Grey · flat-panel; handle-less uppers
   - Hardware — Amwell bar pulls · brushed satin nickel
   - Floor — Evolux Whisper Woods, Sevilla Oak · 9" × 60" plank
2. **Bath** — selections list beside the bath material board:
   - Countertop — MSI, Carrara Trigato · polished
   - Cabinets — Egger, Cashmere Gray
   - Hardware — Amwell Lawrence pulls · brushed satin nickel, set vertically
   - Floor — Roca, Limestone Blanco · 12" × 24"
   - Wall tile — being finalized
3. **Fixtures & hardware** — CFG in polished chrome, three product cards: Aluma high-arc pulldown kitchen faucet; Ember bath faucet; four-function eco-performance showerhead. One line: "Door levers throughout in satin nickel — final selection in review."
4. **Corridors** — tag `In progress`: woven wool runner (herringbone and stripe colorways shown as texture figures), industrial black barn pendants, corridor mood image. Short copy tying to the building's brick/timber corridors.
5. **Paint** — tag `In progress`: sheen schedule as a compact table (Doors/base/case → Semi-gloss; Bathroom walls → Satin; Unit walls → Eggshell; Ceilings → Flat), "Colors to follow."

Close: disclaimer line (small, muted): "Selections shown reflect the current design direction and are subject to change." CTA band (same pattern as the history page): "Want these finishes under your own timber beams?" → buttons "Join the interest list" (`/#contact`, primary) and "View floor plans" (`/#plans`, secondary).

## Assets (`public/images/finishes/`, webp, long edge ≤1600px, ≤400 KB each)

From the pptx media (slide-N mapping):
- `kitchen-render.webp` (image-1-1, hero) · `kitchen-renders-4up.webp` (image-2-2)
- `kitchen-board.webp` (image-3-1) — styled kitchen material board (tile, stone, pull, oak)
- `bath-board.webp` (image-5-1)
- `faucet-kitchen.webp` (image-6-1) · `faucet-bath.webp` (image-6-2) · `showerhead.webp` (image-6-3)
- `runner-herringbone.webp` (image-8-1) · `runner-stripe.webp` (image-8-2)
- `pendant.webp` (image-9-2) · `corridor-mood.webp` (image-9-1)
(image-4-1/4-2 pull-alternate boards, image-7-* lever options, image-11-1 are NOT used — internal.)
Product cutouts (faucets, showerhead, pendant) sit on white; display them on white card backgrounds. Concept renders get "Concept rendering" captions.

## Components / files

- **Create `app/finishes/page.tsx`** — server component: metadata (title "Finishes | Birken Lofts", description, canonical `https://birkenlofts.com/finishes/`, OpenGraph with the kitchen render), the sections above. `next/image`, explicit width/height, first (hero) image `priority`, rest lazy.
- **Create `components/home/FinishesTeaser.tsx`** — home teaser band (accent-2 background like the stats band family): kitchen render thumb, heading "Finishes", one line ("Charcoal stone, warm cabinetry, satin nickel — see what's going into the residences."), link "Explore the finish selections →" to `/finishes/`. Rendered in `app/page.tsx` after `<FloorPlans />`.
- **Modify `components/Nav.tsx`** — insert `{ href: '/finishes/', label: 'Finishes', current: onFinishes }` after Residences (`onFinishes = pathname.startsWith('/finishes')`).
- **Modify `components/Footer.tsx`** — insert Finishes link after Residences.
- **Modify `app/site.css`** — `— finishes page —` block: selections list styling (definition-list rows: item label / product / spec), product-card grid, texture-figure pair, sheen table, teaser band, reusing history-page figure/caption patterns where possible.
- **Modify `public/sitemap.xml`** — add `/finishes/` (lastmod 2026-07-15, monthly, 0.7).
- **Modify `public/llms.txt` / `public/llms-full.txt`** — brief finishes summary + link (kitchen/bath selections with brand names, corridor/paint in progress).

## Constraints / edge cases

- `finishes.pptx` and the PDIL PDFs stay untracked — never `git add -A`.
- `robots.txt`, CNAME, favicon, icons, existing images untouched.
- Scroll-spy untouched (Finishes is a page, not a home section).
- Gate: `npm run build` + `npm run lint`, greps on `out/finishes/index.html`, headless nav/teaser/CTA checks (same pattern as the history page — scroll before asserting lazy images).
- Copy tone: site voice; the deck's factual product names/specs verbatim; no invented specs.

## Verification

- Build/lint; `out/finishes/index.html` exists with title/canonical; nav + footer + teaser links server-rendered; sitemap + llms updated; no internal-only content ("Option A", "alternates", "Price 3cm", "Open Items") anywhere in `out/`.
- Headless: nav Finishes navigates + `aria-current`; teaser band link navigates; CTAs land on home sections; all images load after scroll; mobile stacking.
- Controller visual pass on the assembled page before handoff (screenshots, desktop + mobile).
