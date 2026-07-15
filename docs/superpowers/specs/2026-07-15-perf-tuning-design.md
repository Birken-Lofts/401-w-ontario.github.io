# Performance Tuning — Design Spec

**Date:** 2026-07-15
**Status:** User-approved
**Context:** birkenlofts.com (Next.js 15 static export), branch `perf-tuning`. Baseline from the Google PageSpeed Insights API (2026-07-15, live site): home-mobile **99**, home-desktop **100**, finishes-mobile **98**, **history-mobile 70** (LCP 5.0s — a text paragraph delayed 2.3s; FCP 2.7s; 362 KB images), **cam-mobile 85** (TBT 440ms; ~886 KB unused YouTube player JS). The API key lives in `pagespeed.txt` (repo root, untracked — NEVER commit or print it).

## Root causes

1. **History**: the Sanborn figure's `priority` prop emits a head `<link rel="preload">` for the full 186 KB image, which is below the fold on mobile — it steals critical-path bandwidth from text render (FCP 0.9s→2.7s vs home). All history/finishes figures ship desktop-resolution files (up to 294 KB) to 390px screens with no `srcSet` (`next/image` with `unoptimized: true` emits none).
2. **All pages**: gtag.js loads `afterInteractive` (66 KB unused JS in the critical window).
3. **Cam**: the autoplay YouTube iframe boots the full player at load (886 KB JS, 440ms TBT, 107 KB unused CSS).

## Fixes (user-confirmed)

### 1. Responsive image variants + srcset (history + finishes figures)

- Generate `-480w.webp` and `-960w.webp` variants (cwebp q80, from the existing full-size webp files — decode with dwebp, resample with sips) for the seven heavy images: `history/sanborn-map-1906` (186 KB), `history/house-of-birkenstein-ad-1920` (107 KB), `history/timber-ceiling` (294 KB), `finishes/kitchen-render` (105 KB), `finishes/kitchen-renders-4up` (121 KB), `finishes/runner-herringbone` (164 KB), `finishes/runner-stripe` (182 KB). Skip files already <100 KB or narrower than 700px native.
- New shared component `components/StaticImg.tsx`: a plain `<img>` (the established hero pattern — `next/image` can't emit srcset when unoptimized) with props `src`, `srcSet`, `sizes`, `alt`, `width`, `height`, `className?`, `loading?`, `fetchPriority?`; inline eslint-disable for `no-img-element`.
- The seven figures in `app/history/page.tsx` / `app/finishes/page.tsx` switch from `<Image>` to `<StaticImg>` with `srcSet` (480w/960w/full) and page-accurate `sizes` (`(max-width: 768px) calc(100vw - 40px), ~45vw` for row figures; full-width figures `(max-width: 768px) calc(100vw - 40px), min(90vw, 1232px)`). Figures already <100 KB keep `next/image` unchanged.
- **Remove `priority` from the Sanborn image** (below-fold on mobile; desktop LCP is text). The finishes hero (`kitchen-render`) KEEPS eager/high-priority — it IS the top-of-page figure there — but gains srcSet via StaticImg (`fetchPriority="high"`, `loading="eager"`).
- Rendered layout must not shift: same figure classes, same width/height attributes (aspect ratios preserved).

### 2. GA loads lazyOnload

`app/layout.tsx`: both `<Script>` tags switch `strategy="afterInteractive"` → `strategy="lazyOnload"`. Analytics still fires on every page view, just after load.

### 3. Cam facade (tap to play)

- New client component `components/CamFacade.tsx`: renders inside the existing `.cam-player` shell a self-hosted poster (`public/images/cam-poster.webp`, generated from the stream's current YouTube thumbnail, ≤60 KB, 1280×720) with a centered play button (Organic pill style, ≥44px tap target, `aria-label="Play the live stream"`). On click: swaps in the exact current iframe (`youtube-nocookie.com/embed/DdyWM2B-FYQ?autoplay=1&mute=1`, same allow/referrerPolicy/title attributes). On `pointerenter`/`touchstart` of the facade, inject `<link rel="preconnect" href="https://www.youtube-nocookie.com">` (one-time) so the tap starts faster.
- `app/ohio-feeder-ramp-cam/page.tsx`: replace the raw `<iframe>` with `<CamFacade />`. Everything else — metadata, VideoObject/FAQPage JSON-LD, copy, FAQ — unchanged. The page stays a server component; the facade is the only client island.
- A "LIVE" badge on the poster (small tag, top-left) signals it's a live stream, per the page's existing Live · 24/7 tag.

## Non-goals

- No changes to home/finishes structure (98–100 already). No new dependencies (no lite-youtube lib — the facade is ~50 lines). No sitemap/robots/llms changes. No image quality degradation on desktop (full-size stays in srcset).

## Verification

- Gate: `npm run build` + `npm run lint` (expected new warnings: none — StaticImg carries inline eslint-disable).
- Headless against `out/`: history HTML has NO image preload link and no `fetchpriority` on the Sanborn img; figures carry srcset; picking of small variant at 390px (`currentSrc` contains `-480w`); cam page has no `youtube-nocookie` iframe pre-tap, poster visible, tap injects iframe with autoplay URL; GA script still reachable (present in HTML).
- Visual: history/finishes figures render identically at 1400px and 390px (screenshots).
- **Post-deploy: re-run the PSI API script and compare against the baseline above** (target: history-mobile ≥90, cam-mobile ≥95, others not regressed).
