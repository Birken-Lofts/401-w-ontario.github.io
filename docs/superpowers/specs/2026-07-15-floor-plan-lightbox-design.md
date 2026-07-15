# Floor-Plan Lightbox — Design Spec

**Date:** 2026-07-15
**Status:** User-approved
**Context:** birkenlofts.com reskin branch `reskin-organic` (Next.js 15 static export, Organic design system). The three floor-plan cards in `components/home/FloorPlans.tsx` show unit drawings (108, 111, 202) in 280px-tall media boxes. Users should be able to click a plan and view it large, and move between plans without closing the viewer.

## Decision summary (user-confirmed)

1. **Lightbox images are high-res crops regenerated from the vector PDF** (`reference/Floor-Plan/401 W. Ontario (02-19-26).pdf`, 3 sheets: basement / first floor / second floor), not the existing small webp files (325–693px wide, too soft full-screen).
2. **Custom lightbox component with a CSS scroll-snap track** — no new runtime dependency. Rejected: lightbox library (dependency + styling fights for 3 images), native `<dialog>` (same code paths needed anyway).
3. **No pinch-zoom/pan** inside the lightbox (YAGNI; revisit only if asked).

## Assets

- Rasterize first-floor sheet (PDF page 2 → units 108, 111) and second-floor sheet (page 3 → unit 202) at 300 DPI with `pdftoppm`; crop each unit's drawing region (matching the framing of the existing small crops); export ~1600px-long-edge webp:
  - `public/images/floor-plans/401-W-Ontario-1-Bed-Floor-Plan-108-large.webp`
  - `public/images/floor-plans/401-W-Ontario-1-Bed-Floor-Plan-Unit-111-large.webp`
  - `public/images/floor-plans/401-W-Ontario-2-Bed-Floor-Plan-Unit-202-large.webp`
- Target ~100–200 KB each. If `sips`/`cwebp` webp encoding is unavailable, PNG at equivalent resolution is the fallback (name `-large.png` and reference accordingly).
- Card thumbnails keep the existing small files. Large files load lazily — only when the lightbox opens (render the track only while open, or `loading="lazy"`).

## Components

**`components/home/FloorPlans.tsx`** (becomes `'use client'`):
- Each card's `plan-media` becomes a `<button>` (aria-label "View larger floor plan — <title>") wrapping the existing `ImageSlot` thumbnail. Clicking opens the lightbox at that plan's index.
- Card copy, tags, Inquire buttons unchanged.

**`components/home/PlanLightbox.tsx`** (new, `'use client'`):
- Props: `plans: { title: string; large: string; alt: string }[]`, `openIndex: number | null`, `onClose: () => void`.
- Renders `null` when closed. Open: fixed full-viewport overlay, dark scrim (`color-mix` on `--color-text` or neutral-900 at ~80%), `role="dialog" aria-modal="true"` with an aria-label.
- **Track:** horizontal flex container, `overflow-x: auto`, `scroll-snap-type: x mandatory`; one full-viewport slide per plan, each image `object-fit: contain` at ~92vh / ~90vw max. On open, the clicked plan is scrolled into view instantly (no animation on mount).
- **Navigation:** prev/next arrow buttons (Organic pill styling, hidden when at first/last), ArrowLeft/ArrowRight keys, native trackpad/touch scroll with snap. Current index tracked via scroll position (IntersectionObserver or scroll handler) to drive the counter.
- **Chrome:** ✕ close button (top-right), caption bar (bottom): plan title + unit label (e.g. "Studio · Unit 108") and counter "2 / 3".
- **Close:** Esc key, scrim click (not clicks on the image/controls), ✕ button.
- **Focus & scroll:** on open, focus moves to the dialog (close button); on close, focus returns to the triggering card button; `document.body` scroll locked (`overflow: hidden`) while open.
- Styling lives in `app/site.css` (new `— plan lightbox —` block) using design tokens; no inline style soup.

## Error handling / edge cases

- Missing/failed large image: the `<img>`'s alt text shows on the scrim; no crash. No special retry UI.
- SSR safety: component renders nothing until opened; all `document`/`window` access inside effects/handlers (static export must build with no `window is not defined`).
- StrictMode-safe: effects (key listener, scroll lock) fully clean up.

## Verification

- `npm run build` + `npm run lint` (project gate).
- Greps: large-image filenames present in `out/index.html`; `role="dialog"` NOT in server HTML (lightbox closed by default).
- Interactive (headless browser): click each card → correct plan opens; arrows/keys/swipe move between plans; counter updates; Esc/scrim/✕ close; focus returns to trigger; body scroll locked while open.
