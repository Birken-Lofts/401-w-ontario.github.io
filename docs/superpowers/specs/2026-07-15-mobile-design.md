# Mobile Design — Design Spec

**Date:** 2026-07-15
**Status:** User-approved
**Context:** birkenlofts.com (Next.js 15 static export, Organic design system), branch `mobile-design`. Source: `mobie.zip` at the repo root (untracked, stays untracked) — "Handoff: Birken Lofts — Mobile-Friendly Version": README + four 390px-reference mocks (`mobile-home/finishes/history/traffic-cam.dc.html`) + `styles.css` (byte-identical to the shipped design system — no token changes). The handoff will be committed to `reference/design-2026-mobile/` and is the source of truth for exact mobile values; this spec records decisions and deviations.

## Scope

Responsive treatment only — no content changes, no new routes, no new dependencies. Markup changes are limited to: the nav drawer redesign, class-driven timeline state colors, a responsive stats label, a portrait-figure class on the history page, and a tag-embedded timeline date. Everything else is CSS in `app/site.css`.

## Decision summary (user-confirmed)

1. **Hamburger menu serves ≤980px** (not the handoff's literal 768px) — the 7-item desktop nav wraps between 769–980px, which is why the drawer breakpoint is 980 today. The ≤768px rules still govern page layout (gutters, type, stacking). Desktop nav unchanged >980px.
2. **Mobile map = interactive Leaflet at 280px, panel hidden.** The mock's static embed is a stand-in. ≤768px: hide `.map-panel` (chips + place list) and the `.map-address` overlay; map canvas 280px tall; pins/popups/tap-zoom keep working.

## Deliberate deviations from the mocks (fidelity-to-content calls)

- **Cam page keeps its FAQ section** (mock omits it; README mandates "no content changes" and the FAQ carries FAQPage JSON-LD).
- **Historic artifacts stay un-`washed` on mobile** (Sanborn map, ads, portrait, floor-plan drawings) — same crispness decision as desktop; the mock's blanket `.washed` wrappers are not applied to line-art/scans.
- **Finishes spec rows:** the mock joins product + spec into one right-aligned string; we keep the existing two-element markup and right-align both (product line, spec line beneath) — visually equivalent, no content churn.

## Global mobile rules (≤768px unless noted)

- Gutter 20px (already); section rhythm 56px (`.section { padding-top: 56px }`); H2 28px; intros 15px.
- Tap targets ≥44px: full-width centered buttons (48–50px tall), 44×44 hamburger, menu rows ~50px.
- `scroll-margin-top: 76px` on all home anchor targets (all viewports — harmless on desktop, explicit under the fixed header).
- Fonts/tokens unchanged.

## Header + menu (≤980px)

Per mock: header bar stays (64px, brand 18px Caprasimo, divider shadow); hamburger 44×44, Lucide Menu/X at 26px stroke 2.75. Open panel: below header, page-bg, `shadow-lg`, bottom corners `calc(var(--radius-lg) * 1.4)`, padding 8px 20px 24px; stacked links 18px with 13px vertical padding and hairline dividers (last link no divider); current page accent-700; full-width primary "Contact us" pill (margin-top 14px). Closes on: link tap (existing), **Escape, and outside tap** (new — clears the deferred drawer finding). Link set/order unchanged.

## Home (≤768px, per `mobile-home.dc.html`)

- **Hero:** tag 12px; H1 37px/1.1; body 16px; CTAs stacked full-width 48px; blob photo 320px (unchanged radius).
- **Stats band:** explicit 2×2 grid, gap 20px, padding 24px, figure 30px, label 12px; third label swaps to **"Stories of brick & timber"** on mobile only (responsive `labelShort` spans in `StatsBand.tsx`; desktop copy untouched).
- **Floor plans:** stacked cards gap 20px; media 190px; title 20px; full-width secondary Inquire 46px.
- **History band:** stacked order tag → H2 (28px) → **220px centered circle** → paragraph (15px) → story link (`display: contents` on the text wrapper + `order` rules; desktop grid untouched).
- **Amenities:** single column, 38px icon circles, 16px rows.
- **Neighborhood:** map per Decision 2; three cards stacked gap 14px.
- **Schedule — vertical timeline.** `Schedule.tsx` refactor (all viewports): connector colors move from inline hex to classes `tl-connector-<nextState>` using tokens (`--color-accent`, `--color-neutral-300`) — desktop rendering pixel-identical, and this clears the deferred hardcoded-hex finding. The tag gains an embedded date (`<span className="tl-tag-date"> · {date}</span>`), hidden >768px; the separate `.tl-date` line hides ≤768px. Mobile layout: each item is a row — 20px rail column (14px dot, 2px connector below, dot above connector via flex `order`) + content (tag 11px "Status · Date", title 19px, body 14px, 26px bottom padding). Mobile state colors per mock: dots complete=`--color-accent-2`, next=`--color-accent`, upcoming=outlined `--color-neutral-400`; connectors complete/next=`--color-accent-2-300`, upcoming=`--color-neutral-300`. The 660px horizontal-scroll timeline block is removed (superseded).
- **Contact:** stacked order H2 → blurb → form → address (`display: contents` + `order`); inputs 48px min-height; submit full-width 50px.
- **Footer:** stacked (exists); links 14px with 6px vertical padding.

## Finishes (≤768px, per `mobile-finishes.dc.html`)

- Header: H1 36px, lede 17px; section rhythm 48px (exists); H2 28px; intros 15px.
- Numbered kickers ("01 · Kitchen" etc.): the `tag-accent-2` pills inside `.fin-section` restyle to plain accent-700 semibold 13px text (mock treatment); the `tag-neutral` "In progress" pills stay pills.
- Spec lists: card-like container (`--color-surface` bg, divider border, radius, 4px 18px padding); rows label (88px, 13px semibold neutral-600, no uppercase) / right-aligned value 14px (spec line beneath, also right-aligned).
- Fixture cards: horizontal — 96px square white media (grid `96px 1fr`, media spans rows), tag 11px, title 18px, body 13px.
- Corridors: mood figure full-width natural ratio; then pendant + two runners as a 3-up grid, 110px tall cover thumbnails, 12px captions.
- Paint card and disclaimer as-is (already close); CTA band stacks (heading 22px, buttons full-width 48px) — shared `.history-cta` mobile rules.
- Figure captions italic on mobile; figure radius `calc(var(--radius-lg) * 1.2)` on mobile.

## History (≤768px, per `mobile-history.dc.html`)

- H1 34px, lede 17px; article section gaps 36px (rows `padding-block: 18px`); H2 26px; body 15px/1.7.
- **Louis portrait: 200px centered circle** (`object-fit: cover`), centered caption — new `history-fig--portrait` class on that figure in `app/history/page.tsx`.
- Figures full-width, mobile radius `* 1.2`, italic captions; CTA band stacks (shared rules).

## Traffic cam (≤768px, per `mobile-traffic-cam.dc.html`)

- H1 34px; header/notes padding per mock; player radius `* 1.2`. FAQ section stays (Deviation 1) with existing styles.

## Verification

- Gate: `npm run build` + `npm run lint`; no dependency changes; `mobie.zip`/pptx/PDFs stay untracked.
- Headless at 390×844: menu open/close (tap, link, Escape, outside tap), current-page accent state, anchors landing clear of the sticky header, vertical timeline order/colors, stats 2×2 with short label (and desktop still showing the long label at 1400), map pins present with panel hidden, form field heights, finishes horizontal cards, portrait circle. At 985px: desktop nav intact; at 950px: hamburger mode.
- Controller visual pass: full-page screenshots of all four pages at 390px compared against the four mocks, plus desktop 1400px screenshots to prove zero desktop regression.
