# Performance Tuning Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Lift history-mobile from PSI 70 and cam-mobile from 85 without regressing home/finishes (98–100): responsive image variants + srcset, no below-fold image preload, lazy GA, and a tap-to-play facade for the YouTube embed.

**Architecture:** New `components/StaticImg.tsx` (plain `<img srcSet>` — the established hero pattern, since `next/image` emits no srcset with `unoptimized: true`) replaces `next/image` on the seven heavy history/finishes figures. `components/CamFacade.tsx` (client island) replaces the cam iframe with a self-hosted poster + play button that mounts the autoplay iframe on tap. GA scripts go `lazyOnload`.

**Tech Stack:** Next.js 15 static export, React 19, dwebp/sips/cwebp for variants, python3 urllib for the poster fetch.

**Spec:** `docs/superpowers/specs/2026-07-15-perf-tuning-design.md`
**SECRET:** `pagespeed.txt` (repo root, untracked) holds the PSI API key — never commit, print, or stage it.

## Global Constraints

- Branch `perf-tuning`. Gate: `npm run build` + `npm run lint` exit 0 (only the pre-existing `no-img-element` warning at `components/ImageSlot.tsx` — new raw `<img>`s carry inline disables).
- Do not run `npm run dev`. Serve `out/` on 4173 for checks; kill after; playwright in repo node_modules.
- NEVER `git add -A` (untracked at repo root: `pagespeed.txt`, `mobie.zip`, `finishes.pptx`, two PDFs). Stage files explicitly.
- No content/copy changes; no dependency changes; sitemap/robots/llms untouched; JSON-LD on the cam page byte-identical.
- Desktop and mobile must render visually identical (same figure classes, same aspect ratios via width/height attrs) — except the cam player, which shows the poster until tapped.

---

### Task 1: Image variants and cam poster

**Files:**
- Create: `-480w.webp` and `-960w.webp` siblings for: `public/images/history/sanborn-map-1906`, `public/images/history/house-of-birkenstein-ad-1920`, `public/images/history/timber-ceiling`, `public/images/finishes/kitchen-render`, `public/images/finishes/kitchen-renders-4up`, `public/images/finishes/runner-herringbone`, `public/images/finishes/runner-stripe` (14 files); plus `public/images/cam-poster.webp`.

**Interfaces:**
- Consumes: the existing full-size webp files (native sizes: sanborn 1087×1600, 1920-ad 1087×1600, timber 1600×1143, kitchen-render 992×1070, 4up 992×1086, herringbone 801×775, stripe 798×805). Note herringbone/stripe are ~800px wide, so their `-960w` variant is skipped — generate only `-480w` for those two (12 variant files total, not 14).
- Produces: variants (each strictly smaller in bytes than its source; -480w targets ≤45 KB) with the exact names above; `cam-poster.webp` 1280×720 ≤60 KB. Report every file's dimensions and bytes — Task 2 hardcodes srcSet strings.

- [ ] **Step 1: Generate variants**

For each source `<name>.webp`, in a temp dir: `dwebp <src> -o t.png`, then for each target width less than the native width: `sips --resampleWidth <w> t.png --out t<w>.png` and `cwebp -q 80 t<w>.png -o public/images/<dir>/<name>-<w>w.webp`. View (Read) each output — legibility matters on the Sanborn map and ads at 480w; if text is unreadably mushy at q80, use q85 (accept slightly larger files) and note it.

- [ ] **Step 2: Fetch and convert the cam poster**

```python
# python3 - (urllib; curl may be blocked in this sandbox)
import urllib.request
for cand in ['maxresdefault', 'hqdefault']:
    try:
        urllib.request.urlretrieve(f'https://i.ytimg.com/vi/DdyWM2B-FYQ/{cand}.jpg', '/tmp/poster.jpg')
        break
    except Exception: pass
```

Then `sips --resampleWidth 1280 /tmp/poster.jpg --out /tmp/poster-1280.png` (skip resample if already ≤1280) and `cwebp -q 78 /tmp/poster-1280.png -o public/images/cam-poster.webp`. View it: it must show the feeder-ramp camera view (not a placeholder/grey frame — if YouTube returns a grey default, report BLOCKED). If not exactly 16:9, crop to 16:9 before converting; final file 1280×720, ≤60 KB (raise -q down to 70 if needed).

- [ ] **Step 3: Verify + commit**

```bash
for f in public/images/history/*-4*w.webp public/images/history/*-9*w.webp public/images/finishes/*-4*w.webp public/images/finishes/*-9*w.webp public/images/cam-poster.webp; do sips -g pixelWidth -g pixelHeight "$f"; done
ls -la public/images/history/ public/images/finishes/ public/images/cam-poster.webp
git status --porcelain    # ONLY the 13 new files
git add public/images/history public/images/finishes public/images/cam-poster.webp
git commit -m "Add responsive image variants and cam poster for performance"
```

Report all dimensions/bytes.

---

### Task 2: StaticImg srcset conversion + priority fix + lazy GA

**Files:**
- Create: `components/StaticImg.tsx`
- Modify: `app/history/page.tsx`, `app/finishes/page.tsx`, `app/layout.tsx`

**Interfaces:**
- Consumes: Task 1 variants (exact names). Existing figure CSS (`.history-fig img`, `.fin-fig img`, `.fin-hero img`, `.fin-gallery .fin-fig img`) styles plain `<img>` the same as next/image output.
- Produces: `StaticImg` default export: `{ src, srcSet, sizes, alt, width, height, className?, loading?, fetchPriority? }`.

- [ ] **Step 1: Create `components/StaticImg.tsx`** with exactly:

```tsx
interface StaticImgProps {
  src: string;
  srcSet: string;
  sizes: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  loading?: 'eager' | 'lazy';
  fetchPriority?: 'high' | 'auto';
}

/** Plain <img> with a hand-rolled srcset — next/image emits none under `images.unoptimized`. */
export default function StaticImg({
  src,
  srcSet,
  sizes,
  alt,
  width,
  height,
  className,
  loading = 'lazy',
  fetchPriority,
}: StaticImgProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      srcSet={srcSet}
      sizes={sizes}
      alt={alt}
      width={width}
      height={height}
      className={className}
      loading={loading}
      fetchPriority={fetchPriority}
    />
  );
}
```

- [ ] **Step 2: `app/history/page.tsx`** — add `import StaticImg from '@/components/StaticImg';` and convert exactly three figures (alt text, width/height, figure classes unchanged):

Sanborn (REMOVE `priority` — this is the FCP/LCP fix):

```tsx
            <StaticImg
              src="/images/history/sanborn-map-1906.webp"
              srcSet="/images/history/sanborn-map-1906-480w.webp 480w, /images/history/sanborn-map-1906-960w.webp 960w, /images/history/sanborn-map-1906.webp 1087w"
              sizes="(max-width: 768px) calc(100vw - 40px), 45vw"
              alt="1906 Sanborn fire-insurance map showing the block bounded by Ontario and Ohio Streets"
              width={1087}
              height={1600}
            />
```

1920 ad (same pattern: srcSet `-480w 480w, -960w 960w, full 1087w`, sizes `(max-width: 768px) calc(100vw - 40px), 45vw`, width 1087 height 1600).

Timber ceiling (srcSet `-480w 480w, -960w 960w, full 1600w`, same sizes, width 1600 height 1143).

The Louis portrait and hey-joe figures keep `next/image` (small files). Remove the now-unused `Image` import ONLY if no `<Image>` remains — here two remain, so keep it.

- [ ] **Step 3: `app/finishes/page.tsx`** — add the import and convert four figures:

Kitchen render hero (keeps top priority semantics):

```tsx
          <StaticImg
            src="/images/finishes/kitchen-render.webp"
            srcSet="/images/finishes/kitchen-render-480w.webp 480w, /images/finishes/kitchen-render-960w.webp 960w, /images/finishes/kitchen-render.webp 992w"
            sizes="(max-width: 768px) calc(100vw - 40px), min(90vw, 1232px)"
            alt="Concept rendering of a Birken Lofts kitchen: taupe flat-panel cabinets and dark stone counters beneath original timber beams and exposed brick"
            width={992}
            height={1070}
            loading="eager"
            fetchPriority="high"
          />
```

(The old `<Image ... priority />` is removed with it.)

4-up (srcSet `-480w 480w, -960w 960w, full 992w`, sizes `(max-width: 768px) calc(100vw - 40px), min(90vw, 1232px)`, width 992 height 1086, default lazy).

Runner herringbone (srcSet `-480w 480w, full 801w`, sizes `(max-width: 768px) 33vw, 45vw`, width 801 height 775). Runner stripe (srcSet `-480w 480w, full 798w`, same sizes, width 798 height 805).

Boards, faucets, pendant, corridor-mood keep `next/image`. Keep the `Image` import (still used). Note for the home FinishesTeaser: it uses `next/image fill` with `sizes` — leave it (the browser can't use srcset there; its 220px box loads the full kitchen-render already cached from nothing… it's below-fold lazy; out of scope).

- [ ] **Step 4: `app/layout.tsx`** — change both GA `<Script>` tags from `strategy="afterInteractive"` to `strategy="lazyOnload"`. Nothing else.

- [ ] **Step 5: Build + verify**

```bash
npm run build && npm run lint
grep -c 'rel="preload" as="image"' out/history/index.html || echo NO-IMAGE-PRELOAD-OK
grep -o 'sanborn-map-1906-480w' out/history/index.html | head -1
grep -o 'fetchPriority="high"\|fetchpriority="high"' out/history/index.html || echo NO-PRIORITY-ON-HISTORY-OK
grep -o 'fetchpriority' out/finishes/index.html | head -1
grep -o 'kitchen-render-480w' out/finishes/index.html | head -1
grep -c 'lazyOnload' out/index.html || true   # informational; strategy is runtime, just confirm GA src still present:
grep -o 'gtag/js?id=G-YVPGP24V3P' out/index.html
git status --porcelain package.json package-lock.json   # empty
```

Headless (serve out/ on 4173): at 390×844 load `/history/`, scroll fully, assert the sanborn `<img>`'s `currentSrc` contains `-480w`; at 1400×900 it contains `-960w` or the full name (either acceptable — DPR-dependent); on `/finishes/` at 390 the hero img `currentSrc` contains `480w` or `960w` (DPR 1: 480w) and it's `complete` early (eager). Print `SRCSET-OK`.

- [ ] **Step 6: Commit**

```bash
git add components/StaticImg.tsx app/history/page.tsx app/finishes/page.tsx app/layout.tsx
git commit -m "Serve responsive image variants, drop below-fold preload, lazy-load GA"
```

---

### Task 3: Cam facade

**Files:**
- Create: `components/CamFacade.tsx`
- Modify: `app/ohio-feeder-ramp-cam/page.tsx` (iframe → facade), `app/site.css` (facade styles in the cam block)

**Interfaces:**
- Consumes: `public/images/cam-poster.webp` (Task 1, 1280×720); `.cam-player` shell CSS (16:9, rounded, dark bg); tokens.
- Produces: `<CamFacade />` client component, default export, no props.

- [ ] **Step 1: Create `components/CamFacade.tsx`** with exactly:

```tsx
'use client';

import { useState } from 'react';

const EMBED_SRC = 'https://www.youtube-nocookie.com/embed/DdyWM2B-FYQ?autoplay=1&mute=1';

export default function CamFacade() {
  const [playing, setPlaying] = useState(false);

  const preconnect = () => {
    if (document.querySelector('link[data-yt-preconnect]')) return;
    const l = document.createElement('link');
    l.rel = 'preconnect';
    l.href = 'https://www.youtube-nocookie.com';
    l.setAttribute('data-yt-preconnect', '');
    document.head.appendChild(l);
  };

  if (playing) {
    return (
      <iframe
        src={EMBED_SRC}
        title="Ohio Feeder Ramp live stream"
        allow="autoplay; encrypted-media; picture-in-picture"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      />
    );
  }

  return (
    <button
      type="button"
      className="cam-facade"
      onClick={() => setPlaying(true)}
      onPointerEnter={preconnect}
      onTouchStart={preconnect}
      aria-label="Play the live stream"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/cam-poster.webp" alt="" width={1280} height={720} fetchPriority="high" />
      <span className="cam-live-badge">LIVE</span>
      <span className="cam-play">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M8 5v14l11-7z" />
        </svg>
        Play live stream
      </span>
    </button>
  );
}
```

- [ ] **Step 2: `app/ohio-feeder-ramp-cam/page.tsx`** — add `import CamFacade from '@/components/CamFacade';` and replace the `<iframe ... />` element inside `<div className="cam-player">` with `<CamFacade />`. Metadata, both JSON-LD blocks, and all copy stay byte-identical.

- [ ] **Step 3: `app/site.css`** — in the `— traffic cam page —` block, after the `.cam-player iframe { ... }` rule, add:

```css
.cam-facade { position: relative; display: block; width: 100%; height: 100%; padding: 0; border: 0; background: var(--color-neutral-900); cursor: pointer; }
.cam-facade img { width: 100%; height: 100%; object-fit: cover; display: block; opacity: 0.88; }
.cam-live-badge {
  position: absolute; top: 14px; left: 14px;
  background: var(--color-accent); color: #fff;
  font: 700 11px var(--font-body); letter-spacing: 0.08em;
  padding: 4px 10px; border-radius: 999px;
}
.cam-play {
  position: absolute; inset: 0; margin: auto; width: fit-content; height: 48px;
  display: inline-flex; align-items: center; gap: 10px; padding: 0 22px;
  background: var(--color-bg); color: var(--color-text); border-radius: 999px;
  font: 600 15px var(--font-body); box-shadow: var(--shadow-md);
}
.cam-facade:hover .cam-play { background: var(--color-neutral-100); }
```

- [ ] **Step 4: Build + verify**

```bash
npm run build && npm run lint
grep -c 'youtube-nocookie.com/embed' out/ohio-feeder-ramp-cam/index.html   # expect ≥1: the URL must STILL appear in JSON-LD (embedUrl) — verify it is ONLY in the ld+json blocks:
python3 -c "
import re
html = open('out/ohio-feeder-ramp-cam/index.html').read()
assert '<iframe' not in html, 'iframe should not be server-rendered'
blocks = re.findall(r'<script type=\"application/ld\+json\">(.*?)</script>', html, re.S)
assert len(blocks) == 2, blocks and len(blocks)
import json
[json.loads(b) for b in blocks]
assert 'cam-poster.webp' in html
print('CAM-HTML-OK')
"
git status --porcelain package.json package-lock.json   # empty
```

Headless (serve out/ on 4173, 390×844 on `/ohio-feeder-ramp-cam/`):
1. No iframe in the DOM; poster img visible (`naturalWidth` 1280); LIVE badge and play pill visible.
2. Zero network requests to any `youtube` or `ytimg` host before tap (collect via `page.on('request')`).
3. Tap the facade → iframe appears with src containing `embed/DdyWM2B-FYQ?autoplay=1&mute=1`; requests to youtube-nocookie now occur.
4. The play button's bounding box ≥ 44px tall.
5. FAQ still present (3 `.faq-item`s).
Print `FACADE-OK`. Kill the server.

- [ ] **Step 5: Commit**

```bash
git add components/CamFacade.tsx app/ohio-feeder-ramp-cam/page.tsx app/site.css
git commit -m "Replace cam autoplay embed with tap-to-play facade"
```

---

## Final verification (controller/user, after all tasks)

- [ ] Controller: visual screenshots (history + finishes figures identical at 1400/390; cam facade look); confirm no regression in lightbox/teaser images.
- [ ] User merges + pushes (deploys live) — then controller re-runs the PSI script (`scratchpad/psi-run.py`) and compares against the 2026-07-15 baseline (home-mobile 99 / home-desktop 100 / finishes 98 / history 70 / cam 85). Targets: history ≥90, cam ≥95, no regressions elsewhere.
