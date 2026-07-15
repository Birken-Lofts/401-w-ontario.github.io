# Handoff: Birken Lofts — Mobile-Friendly Version

## Overview
Mobile designs for birkenlofts.com — the already-live Next.js marketing site for Birken Lofts (57 residences, 1905 S. Birkenstein & Sons Building, 401 W. Ontario St, River North, Chicago). The desktop design is live; this package specifies the **responsive mobile treatment for all four pages**: Home, Finishes, History, Traffic Cam. Reference width 390px; treat as the ≤768px breakpoint of the existing site, not a separate site.

## About the Design Files
`mobile-home.dc.html`, `mobile-finishes.dc.html`, `mobile-history.dc.html`, `mobile-traffic-cam.dc.html` are design references in a single-file HTML component format — readable as plain HTML (markup between `<x-dc>` tags; `{{ }}` holes are template variables driven by the small logic class at the bottom, e.g. the hamburger state). They are NOT production code — implement as responsive behavior in the existing Next.js codebase. `styles.css` is the Organic design-system stylesheet already used by the live site (tokens in `:root`).

## Fidelity
High-fidelity: spacing, sizes and copy are as designed. Copy is identical to the live desktop site — no content changes. Images in the mockups are hotlinked from birkenlofts.com; production uses the site's own assets via `next/image`.

## Global Mobile Rules
- Breakpoint: collapse to the mobile layout ≤768px; 390px is the design reference.
- Page gutter 20px; section rhythm 56px (desktop uses 88px).
- All tap targets ≥44px (buttons 46–50px tall, full-width, centered label; menu rows ~50px).
- Type scale: H1 34–37px, H2 26–28px, body 15–16px, captions 13px. Same fonts (Caprasimo/Figtree via `next/font/google`).
- Keep the Organic tokens/classes — pill buttons, `.washed` images, rounded containers, tags.

### Mobile Header + Hamburger Menu (all pages)
- Sticky top bar (z-index above content), page background, 1px divider shadow at bottom: brand "Birken Lofts" (Caprasimo 18px, links home) left; 44×44px hamburger button right (Lucide `menu` icon, 26px, stroke 2.75; becomes `x` when open).
- Open state: dropdown panel below the header (not full-screen): page-bg fill, shadow-lg, bottom corners rounded ~22px. Stacked links, 18px, 13px vertical padding, hairline dividers: Residences, Finishes, History, Amenities, Neighborhood, Traffic Cam, Contact — then a full-width primary pill "Contact us". Current page's link in accent-700. Menu closes on link tap. Recommend closing on outside tap / Escape too (not drawn).
- Desktop nav stays as-is above the breakpoint.

## Screens

### 1. Home (`/`) — `mobile-home.dc.html`
Section order and treatment (all single-column):
1. **Hero**: sage tag (12px) → H1 37px/1.1 → body 16px → two stacked full-width buttons (primary "View floor plans", secondary "Contact us", 48px) → blob-masked hero photo, 320px tall (same blob radius as desktop: `46% 54% 52% 48% / 44% 46% 54% 56%`), `.washed`.
2. **Stats band**: sage-100 fill, radius ~22px, **2×2 grid** (gap 20px), figure 30px Caprasimo over 12px label. Third label shortens to "Stories of brick & timber" to fit.
3. **Floor plans** (`#plans`): stacked cards (gap 20px). Card: 190px plan image on white (`object-fit: contain`, washed), sage tag "Interest list open", 20px title, body line, full-width secondary "Inquire" (46px).
4. **History band** (`#history`): terracotta-100 container, 32/24px padding, stacked: tag, H2, **220px circle image centered**, paragraph, ghost link "Read the building's story →" to /history.
5. **Amenities** (`#amenities`): single-column list, six rows — 38px sage circle + check icon + 16px label.
6. **Neighborhood** (`#neighborhood`): H2, intro, **map embed 280px tall** (rounded, divider border), then the three cards stacked (gap 14px).
7. **Construction schedule** (`#schedule`): the live site's 4 milestones as a **vertical timeline** — 14px dot + 2px connector line on the left, content right: tag "Status · Date" (Complete·2025 sage / Complete·Early 2026 sage / Next·Oct 2026 terracotta / Planned·Oct 2027 neutral outlined dot), 19px Caprasimo title, 14px description. Copy verbatim from the live site.
8. **Contact** (`#contact`): surface container, stacked form fields (48px inputs), full-width primary "Send message" (50px), address block below the form.
9. **Footer**: neutral-900, stacked brand block then wrapped link row (14px, 6px vertical padding): Residences, Finishes, History, Traffic Cam, Contact.

### 2. Finishes (`/finishes`) — `mobile-finishes.dc.html`
Mobile treatment of the live Finishes page. All copy, spec data and images verbatim from birkenlofts.com/finishes/. Single column, 48px section rhythm:
- **Header**: sage tag "Interior finish selections", H1 36px "Finishes", 17px lede, full-width kitchen render figure (rounded ~19px, `.washed`, 13px italic caption).
- **Kitchen** (kicker "01 · Kitchen", 13px accent-700 semibold above the H2): intro paragraph, then the 5-row **spec card** — a `.card` where each row is `flex; justify-content: space-between`: 13px semibold neutral-600 label (fixed 88px column: Backsplash / Countertop / Cabinets / Hardware / Floor) and 14px right-aligned value, hairline dividers between rows. Then two full-width figures (material board, 4-up renders) with captions.
- **Bath** (kicker "02 · Bath"): same pattern — intro, 5-row spec card (Wall tile row's value is italic neutral-600 "Being finalized"), material-board figure.
- **Fixtures & hardware** (kicker "03"): three horizontal cards (`.card.elev-sm`, row layout): 96px square product image on white (`object-fit: contain`, washed) + sage tag (Kitchen/Bath) + 18px title + 13px body. Closing 14px note about door levers.
- **Corridors** (neutral tag "In progress"): intro, full-width atmosphere figure, then a **3-up thumbnail grid** (gap 12px, 110px tall images) — pendant, herringbone runner, stripe runner — each with a 12px italic caption.
- **Paint** (neutral tag "In progress"): intro, then a 4-row two-column card (Surface / Sheen, 14px, sheen semibold): Doors base & case—Semi-gloss, Bathroom walls—Satin, Unit walls—Eggshell, Ceilings—Flat. 13px neutral-500 disclaimer below.
- **Closing CTA**: terracotta-100 container — 22px Caprasimo "Want these finishes under your own timber beams?" + stacked primary "Join the interest list" (→ /#contact) and secondary "View floor plans" (→ /#plans).
- Standard mobile header/menu/footer; Finishes link in accent-700 in the open menu.

### 3. History (`/history`) — `mobile-history.dc.html`
- Header block: tag "Since 1905", H1 34px, 17px lede.
- Article: single column, sections gap 36px, H2 26px, body 15px/1.7. All six sections and figures from the live page, in order. Figures full-width, rounded ~19px, washed, 13px italic captions below; **Louis Birkenstein portrait is a 200px centered circle**.
- Closing CTA: terracotta-100 container — 22px Caprasimo line "See what the House of Birkenstein holds now." + stacked "View floor plans" (primary) and "Contact us" (secondary).
- Standard mobile header/menu/footer.

### 4. Traffic Cam (`/ohio-feeder-ramp-cam`) — `mobile-traffic-cam.dc.html`
- Tag "Live · 24/7", H1 34px "Ohio Feeder Ramp Cam".
- 16:9 YouTube live embed (`autoplay=1&mute=1`), rounded ~19px, neutral-900 background — same VIDEO_ID as the live page.
- Below, stacked text (gap 14px): 16px description, 15px "streams 24/7" note, 13px disclaimer — full width.
- Standard mobile header/menu/footer.

## Interactions & State
- Only new state: `menuOpen` boolean per page (client component for the header only; rest stays server-rendered).
- In-page anchors must account for the sticky header (`scroll-margin-top` on sections).
- Form behavior unchanged from the live site.
- Map embed lazy-loaded below the fold.

## Files
- `mobile-home.dc.html`, `mobile-finishes.dc.html`, `mobile-history.dc.html`, `mobile-traffic-cam.dc.html` — design sources
- `styles.css` — Organic design-system tokens (same as live site)
