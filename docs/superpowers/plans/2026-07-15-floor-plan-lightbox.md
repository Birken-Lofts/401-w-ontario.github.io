# Floor-Plan Lightbox Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Clicking a floor-plan card opens a full-screen lightbox showing a high-res drawing, with scroll/swipe/arrow/keyboard navigation between the three plans.

**Architecture:** Two parts. (1) One-off asset generation: rasterize the vector pitch PDF at 300 DPI with `pdftoppm` and crop each unit's region to a `-large` webp in `public/images/floor-plans/`. (2) A custom client-side lightbox: `FloorPlans.tsx` becomes `'use client'` with each card's media as a trigger button; new `PlanLightbox.tsx` renders a fixed overlay containing a CSS scroll-snap track (one slide per plan). No new runtime dependency.

**Tech Stack:** Next.js 15 static export, React 19, plain CSS in `app/site.css`, lucide-react icons (already a dependency), `pdftoppm` (installed locally) for assets.

**Spec:** `docs/superpowers/specs/2026-07-15-floor-plan-lightbox-design.md`

## Global Constraints

- Branch `reskin-organic`. The gate for every task is `npm run build` + `npm run lint` (one pre-existing expected warning: `@next/next/no-img-element` at `components/ImageSlot.tsx`; a second instance of the same warning from the lightbox `<img>` is acceptable).
- Do not run `npm run dev` (long-running; it also conflicts with `npm run build` over `.next/`). For interactive checks, serve the static `out/` directory on a port and kill the server afterwards.
- No new entries in `package.json` `dependencies`/`devDependencies`; `package-lock.json` unchanged (verify with `git status` before committing).
- `robots.txt`, `sitemap.xml`, `public/CNAME`, `favicon.svg`, `icons.svg`, and existing files in `public/images/` are NOT modified (adding new files to `public/images/floor-plans/` is fine).
- Card thumbnails keep the existing small webp files; `-large` images are referenced only by the lightbox.
- If webp encoding is unavailable (`sips -s format webp` fails and no `cwebp`), fall back to PNG named `-large.png` and use those paths in Task 2's `plans` data — report the substitution.

---

### Task 1: High-res floor-plan assets from the pitch PDF

**Files:**
- Create: `public/images/floor-plans/401-W-Ontario-1-Bed-Floor-Plan-108-large.webp`, `public/images/floor-plans/401-W-Ontario-1-Bed-Floor-Plan-Unit-111-large.webp`, `public/images/floor-plans/401-W-Ontario-2-Bed-Floor-Plan-Unit-202-large.webp`

**Interfaces:**
- Consumes: `reference/Floor-Plan/401 W. Ontario (02-19-26).pdf` — 3 pages: 1 = basement, 2 = first floor (contains UNIT 108 bottom center-right and UNIT 111 top right), 3 = second floor (contains UNIT 202 left middle).
- Produces: the three `-large.webp` files above (exact names — Task 2 hardcodes them), each ~1400–2000px on the long edge, ≤ 300 KB, cropped to frame one unit's drawing including its "UNIT NNN" label, matching the framing of the existing small crops (`401-W-Ontario-1-Bed-Floor-Plan-108.webp` 325×778, `...Unit-111.webp` 331×859, `...Unit-202-400w.webp` / `...Unit-202.webp` 693×609).

This task is visual-iterative: you (the implementer) must LOOK at images with the Read tool at each step. Do not guess crop coordinates blindly.

- [ ] **Step 1: Render reference thumbnails and the existing crops for comparison**

```bash
TMP=$(mktemp -d)
echo "$TMP"
pdftoppm -png -r 75 -f 2 -l 2 "reference/Floor-Plan/401 W. Ontario (02-19-26).pdf" "$TMP/first75"
pdftoppm -png -r 75 -f 3 -l 3 "reference/Floor-Plan/401 W. Ontario (02-19-26).pdf" "$TMP/second75"
ls "$TMP"
```

Read (view) `$TMP/first75-2.png` and `$TMP/second75-3.png` (pdftoppm suffixes the page number; check `ls` output for exact names). Also Read the three existing small webp files in `public/images/floor-plans/` to see the target framing of each unit crop.

- [ ] **Step 2: Locate each unit's crop box at 75 DPI**

From the 75 DPI page images, estimate a pixel box `(x, y, W, H)` around each unit's drawing: UNIT 108 and UNIT 111 on the first-floor page, UNIT 202 on the second-floor page. Include the unit's full walls and its "UNIT NNN / N-BED N-BATH / NNN FT² INTERIOR AREA" text block; exclude neighboring units where the existing small crops do (they clip at shared walls — mirror that). Aspect ratios to aim for: 108 ≈ 0.42 (W/H), 111 ≈ 0.39, 202 ≈ 1.14.

- [ ] **Step 3: Render each crop at 300 DPI and inspect**

Scale each 75 DPI box by 4 and render only that region (`-x -y -W -H` are in pixels at the target resolution):

```bash
pdftoppm -png -r 300 -f 2 -l 2 -x <4x> -y <4y> -W <4W> -H <4H> "reference/Floor-Plan/401 W. Ontario (02-19-26).pdf" "$TMP/unit108"
```

(similarly `unit111` from page 2, `unit202` from page 3 with `-f 3 -l 3`.)

Read each output PNG. Verify: the whole unit is inside the frame, the unit label is legible, no significant bleed from adjacent units, framing comparable to the small webp. Adjust the box and re-render until right — expect 2–3 iterations per unit. This visual check is the acceptance test for this task; do not skip it.

- [ ] **Step 4: Downscale to ~1600px long edge and encode webp**

```bash
for u in unit108 unit111 unit202; do
  sips --resampleHeightWidthMax 1600 "$TMP/$u-"*.png --out "$TMP/$u-1600.png"
done
sips -s format webp -s formatOptions 80 "$TMP/unit108-1600.png" --out "public/images/floor-plans/401-W-Ontario-1-Bed-Floor-Plan-108-large.webp"
sips -s format webp -s formatOptions 80 "$TMP/unit111-1600.png" --out "public/images/floor-plans/401-W-Ontario-1-Bed-Floor-Plan-Unit-111-large.webp"
sips -s format webp -s formatOptions 80 "$TMP/unit202-1600.png" --out "public/images/floor-plans/401-W-Ontario-2-Bed-Floor-Plan-Unit-202-large.webp"
ls -la public/images/floor-plans/*large*
```

If `sips -s format webp` errors ("Unable to write" / unsupported format), try `cwebp -q 80 in.png -o out.webp`; if that's also unavailable, use the PNG fallback per Global Constraints (copy the `-1600.png` files as `...-large.png` into `public/images/floor-plans/`) and say so in your report.

Expected: three files, each ≤ 300 KB. Read each final file to confirm it renders and is crisp (zoom-worthy linework, not blurry).

- [ ] **Step 5: Verify no protected files changed, and commit**

```bash
git status --porcelain   # expect ONLY the three new -large files as untracked
git add public/images/floor-plans/
git commit -m "Add high-res floor-plan crops rendered from the pitch PDF"
```

---

### Task 2: Lightbox component, trigger wiring, styles

**Files:**
- Create: `components/home/PlanLightbox.tsx`
- Modify: `components/home/FloorPlans.tsx` (full replacement below), `app/site.css` (append one block)

**Interfaces:**
- Consumes: the three `-large.webp` paths produced by Task 1 (exact names in the `plans` array below — if Task 1 fell back to `.png`, change the three `large:` extensions accordingly). Existing CSS: `.plan-media` (positioned, white bg, 280px tall), `.card`, design tokens (`--color-*`, `--radius-*`, `--shadow-*`). `ImageSlot` component (`src`, `alt`, `label`, `fit` props). `lucide-react` icons.
- Produces: `PlanLightbox` default export with props `{ plans: LightboxPlan[]; openIndex: number | null; onClose: () => void }` where `LightboxPlan = { title: string; unit: string; large: string; alt: string }`; used only by `FloorPlans`.

- [ ] **Step 1: Create `components/home/PlanLightbox.tsx`** with exactly:

```tsx
'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

export interface LightboxPlan {
  title: string;
  unit: string;
  large: string;
  alt: string;
}

interface PlanLightboxProps {
  plans: LightboxPlan[];
  openIndex: number | null;
  onClose: () => void;
}

export default function PlanLightbox({ plans, openIndex, onClose }: PlanLightboxProps) {
  if (openIndex === null) return null;
  return <Overlay plans={plans} initialIndex={openIndex} onClose={onClose} />;
}

function Overlay({
  plans,
  initialIndex,
  onClose,
}: {
  plans: LightboxPlan[];
  initialIndex: number;
  onClose: () => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [current, setCurrent] = useState(initialIndex);

  const scrollTo = useCallback(
    (i: number) => {
      const track = trackRef.current;
      if (!track || i < 0 || i >= plans.length) return;
      track.scrollTo({ left: track.clientWidth * i, behavior: 'smooth' });
    },
    [plans.length],
  );

  // Before first paint: jump the track to the clicked plan, focus the dialog, lock page scroll.
  useLayoutEffect(() => {
    const track = trackRef.current;
    if (track) track.scrollLeft = track.clientWidth * initialIndex;
    closeRef.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [initialIndex]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') scrollTo(current + 1);
      else if (e.key === 'ArrowLeft') scrollTo(current - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [current, onClose, scrollTo]);

  const handleScroll = () => {
    const track = trackRef.current;
    if (!track) return;
    const i = Math.round(track.scrollLeft / track.clientWidth);
    if (i !== current) setCurrent(Math.min(Math.max(i, 0), plans.length - 1));
  };

  return (
    <div className="lightbox" role="dialog" aria-modal="true" aria-label="Floor plan viewer" onClick={onClose}>
      <div className="lightbox-track" ref={trackRef} onScroll={handleScroll}>
        {plans.map((p) => (
          <figure key={p.unit} className="lightbox-slide">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.large} alt={p.alt} loading="lazy" onClick={(e) => e.stopPropagation()} />
          </figure>
        ))}
      </div>
      <button
        ref={closeRef}
        type="button"
        className="lightbox-btn lightbox-close"
        aria-label="Close floor plan viewer"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      >
        <X size={20} strokeWidth={2.5} />
      </button>
      {current > 0 && (
        <button
          type="button"
          className="lightbox-btn lightbox-prev"
          aria-label="Previous floor plan"
          onClick={(e) => {
            e.stopPropagation();
            scrollTo(current - 1);
          }}
        >
          <ChevronLeft size={22} strokeWidth={2.5} />
        </button>
      )}
      {current < plans.length - 1 && (
        <button
          type="button"
          className="lightbox-btn lightbox-next"
          aria-label="Next floor plan"
          onClick={(e) => {
            e.stopPropagation();
            scrollTo(current + 1);
          }}
        >
          <ChevronRight size={22} strokeWidth={2.5} />
        </button>
      )}
      <div className="lightbox-caption" onClick={(e) => e.stopPropagation()}>
        <span>
          {plans[current].title} · {plans[current].unit}
        </span>
        <span className="lightbox-counter">
          {current + 1} / {plans.length}
        </span>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Replace `components/home/FloorPlans.tsx`** with exactly:

```tsx
'use client';

import { useRef, useState } from 'react';
import ImageSlot from '@/components/ImageSlot';
import PlanLightbox from '@/components/home/PlanLightbox';

const plans = [
  {
    title: 'Studio',
    body: '550–700 sq ft · oversized windows · in-unit laundry',
    thumb: '/images/floor-plans/401-W-Ontario-1-Bed-Floor-Plan-108.webp',
    large: '/images/floor-plans/401-W-Ontario-1-Bed-Floor-Plan-108-large.webp',
    unit: 'Unit 108',
    alt: 'Floor plan — Unit 108',
  },
  {
    title: 'One bedroom',
    body: '750–1,000 sq ft · exposed brick · walk-in closet',
    thumb: '/images/floor-plans/401-W-Ontario-1-Bed-Floor-Plan-Unit-111.webp',
    large: '/images/floor-plans/401-W-Ontario-1-Bed-Floor-Plan-Unit-111-large.webp',
    unit: 'Unit 111',
    alt: 'Floor plan — Unit 111',
  },
  {
    title: 'Two bedroom',
    body: '1,100–1,400 sq ft · corner exposures · original timber posts',
    thumb: '/images/floor-plans/401-W-Ontario-2-Bed-Floor-Plan-Unit-202.webp',
    large: '/images/floor-plans/401-W-Ontario-2-Bed-Floor-Plan-Unit-202-large.webp',
    unit: 'Unit 202',
    alt: 'Floor plan — Unit 202',
  },
];

export default function FloorPlans() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const triggerRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const close = () => {
    const i = openIndex;
    setOpenIndex(null);
    if (i !== null) triggerRefs.current[i]?.focus();
  };

  return (
    <section id="plans" className="section container">
      <h2>Floor plans</h2>
      <p className="section-intro">
        Studios to two-bedrooms, no two exactly alike. Original posts and beams in every plan.
      </p>
      <div className="cards-3">
        {plans.map((p, i) => (
          <div key={p.title} className="card elev-sm plan-card">
            <button
              type="button"
              className="plan-media plan-zoom"
              aria-label={`View larger floor plan — ${p.title}`}
              onClick={() => setOpenIndex(i)}
              ref={(el) => {
                triggerRefs.current[i] = el;
              }}
            >
              <ImageSlot src={p.thumb} alt={p.alt} label={p.alt} fit="contain" />
            </button>
            <span className="tag tag-accent-2" style={{ alignSelf: 'flex-start' }}>Interest list open</span>
            <div className="card-title">{p.title}</div>
            <div className="card-body">{p.body}</div>
            <a className="btn btn-secondary" href="#contact" style={{ alignSelf: 'flex-start' }}>Inquire</a>
          </div>
        ))}
      </div>
      <PlanLightbox
        plans={plans.map(({ title, unit, large, alt }) => ({ title, unit, large, alt }))}
        openIndex={openIndex}
        onClose={close}
      />
    </section>
  );
}
```

(The only content changes from the current file: `'use client'`, the `thumb`/`large`/`unit` fields, the media `div` → trigger `button`, and the `PlanLightbox` at the end. Copy, tags, and Inquire buttons are unchanged.)

- [ ] **Step 3: Append to `app/site.css`** (after the `— image slots —` block, before the responsive section):

```css
/* — floor-plan lightbox — */
.plan-zoom { display: block; width: 100%; border: 0; padding: 0; cursor: zoom-in; font: inherit; text-align: inherit; }
.plan-zoom:focus-visible { outline: 2px solid var(--color-accent); outline-offset: 2px; }
.lightbox {
  position: fixed; inset: 0; z-index: 2000;
  background: color-mix(in srgb, var(--color-neutral-900) 88%, transparent);
}
.lightbox-track {
  position: absolute; inset: 0; display: flex;
  overflow-x: auto; overflow-y: hidden;
  scroll-snap-type: x mandatory; scrollbar-width: none;
}
.lightbox-track::-webkit-scrollbar { display: none; }
.lightbox-slide {
  flex: none; width: 100%; height: 100%; margin: 0;
  display: flex; align-items: center; justify-content: center;
  scroll-snap-align: start;
}
.lightbox-slide img {
  max-width: min(90vw, 1100px); max-height: 86vh;
  background: #fff; border-radius: var(--radius-md); padding: 18px;
  box-shadow: var(--shadow-md);
}
.lightbox-btn {
  position: absolute; z-index: 2; display: grid; place-items: center;
  width: 44px; height: 44px; border-radius: 999px;
  border: 1px solid var(--color-divider); background: var(--color-bg);
  color: var(--color-text); cursor: pointer;
}
.lightbox-btn:hover { background: var(--color-neutral-100); }
.lightbox-close { top: 20px; right: 20px; }
.lightbox-prev { left: 20px; top: 50%; transform: translateY(-50%); }
.lightbox-next { right: 20px; top: 50%; transform: translateY(-50%); }
.lightbox-caption {
  position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); z-index: 2;
  display: flex; gap: 14px; align-items: baseline; white-space: nowrap;
  padding: 10px 20px; border-radius: 999px;
  background: var(--color-bg); border: 1px solid var(--color-divider);
  font-size: 14px;
}
.lightbox-counter { font-size: 12px; color: var(--color-neutral-600); }
@media (max-width: 768px) {
  .lightbox-slide img { max-width: 96vw; max-height: 80vh; padding: 10px; }
  .lightbox-prev, .lightbox-next { display: none; }
}
```

- [ ] **Step 4: Build, lint, static greps**

```bash
npm run build
npm run lint
grep -c 'Floor-Plan-108-large' out/index.html
grep -c 'role="dialog"' out/index.html || echo CLOSED-BY-DEFAULT-OK
grep -o 'aria-label="View larger floor plan — Studio"' out/index.html
git status --porcelain package.json package-lock.json   # expect empty
```

Expected: build + lint pass (only the two `no-img-element` warnings, one pre-existing, one suppressed inline — if the inline disable comment works there is exactly one); `-large` path present in HTML (it's in the client component's serialized props/JSX); NO `role="dialog"` in server HTML (`CLOSED-BY-DEFAULT-OK`); trigger button server-rendered; no dependency-file changes.

- [ ] **Step 5: Interactive verification against the static export**

```bash
python3 -m http.server 4173 -d out &
SERVER_PID=$!
npm i --no-save playwright   # dev-only, --no-save leaves package.json/lock untouched
```

Create `/tmp/lightbox-check.mjs` (or in your temp dir) with exactly:

```js
import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' });

// Open at the SECOND plan to prove index targeting
await page.click('button[aria-label="View larger floor plan — One bedroom"]');
await page.waitForSelector('.lightbox');
const counterIs = async (want) => {
  const t = (await page.textContent('.lightbox-counter')).trim();
  if (t !== want) throw new Error(`counter ${t}, want ${want}`);
};
await counterIs('2 / 3');
if ((await page.evaluate(() => document.body.style.overflow)) !== 'hidden') throw new Error('body scroll not locked');

await page.click('.lightbox-next');
await page.waitForTimeout(700);
await counterIs('3 / 3');
if (await page.$('.lightbox-next')) throw new Error('next arrow should hide at last plan');

await page.keyboard.press('ArrowLeft');
await page.waitForTimeout(700);
await counterIs('2 / 3');

// image actually loaded (high-res asset resolves)
const ok = await page.evaluate(() => {
  const img = document.querySelectorAll('.lightbox-slide img')[1];
  return img.complete && img.naturalWidth > 1000;
});
if (!ok) throw new Error('large image failed to load or is low-res');

await page.keyboard.press('Escape');
if (await page.$('.lightbox')) throw new Error('Escape did not close');
const focused = await page.evaluate(() => document.activeElement?.getAttribute('aria-label') || '');
if (!focused.includes('One bedroom')) throw new Error(`focus not returned to trigger: "${focused}"`);
if ((await page.evaluate(() => document.body.style.overflow)) === 'hidden') throw new Error('body scroll not unlocked');

// scrim click closes
await page.click('button[aria-label="View larger floor plan — Studio"]');
await page.waitForSelector('.lightbox');
await page.mouse.click(60, 450); // left edge, over the scrim/empty slide area
await page.waitForTimeout(200);
if (await page.$('.lightbox')) throw new Error('scrim click did not close');

console.log('LIGHTBOX-OK');
await browser.close();
```

```bash
node /tmp/lightbox-check.mjs
kill $SERVER_PID
```

Expected: `LIGHTBOX-OK`. If the scrim-click assertion fails because (60,450) lands on the prev-arrow, adjust the click point to (60, 100) and note it.

- [ ] **Step 6: Commit**

```bash
git status --porcelain   # confirm only the three intended files (+ no node_modules/package changes staged)
git add components/home/PlanLightbox.tsx components/home/FloorPlans.tsx app/site.css
git commit -m "Add floor-plan lightbox with scroll-snap navigation"
```

---

## Final verification (controller/user, after all tasks)

- [ ] User clicks each plan card in their own browser (`npm run dev`, run by the user, not the implementer): correct plan opens large and crisp, trackpad/swipe scrolls between plans, arrows/keys work, Esc/scrim/✕ close, page scroll locked while open.
