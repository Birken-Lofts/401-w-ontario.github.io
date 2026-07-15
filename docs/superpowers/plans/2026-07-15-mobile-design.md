# Mobile Design Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the mobile design handoff (`mobie.zip`) across all four pages: redesigned hamburger menu, mobile home layout with a vertical timeline, and mobile treatments for Finishes, History, and Traffic Cam — desktop unchanged.

**Architecture:** CSS-first: base additions + three rewritten `@media (max-width: 768px)` blocks in `app/site.css`, plus the ≤980px nav block. Small markup changes: Nav drawer behavior (Escape/outside-tap close), class-driven timeline colors in `Schedule.tsx` (with a `.tl-content` wrapper and tag-embedded date), a responsive short label in `StatsBand.tsx`, and a `history-fig--portrait` class in `app/history/page.tsx`.

**Tech Stack:** Next.js 15 static export, React 19, plain CSS.

**Spec:** `docs/superpowers/specs/2026-07-15-mobile-design.md`
**Source (repo root, untracked — never commit the zip):** `mobie.zip`; Task 1 commits its contents to `reference/design-2026-mobile/`.

## Global Constraints

- Branch `mobile-design`. Gate: `npm run build` + `npm run lint` exit 0 (only the pre-existing `no-img-element` warning at `components/ImageSlot.tsx`).
- Do not run `npm run dev`. Interactive checks serve `out/` (`python3 -m http.server 4173 -d out`), kill after. playwright importable from repo node_modules.
- NEVER `git add -A` (`mobie.zip`, `finishes.pptx`, two PDIL PDFs sit untracked at the repo root). Stage files explicitly.
- No content changes anywhere except: the mobile-only stats label swap ("Stories of brick & timber") and the tag-embedded timeline date — both hidden on desktop. No dependency changes.
- **Desktop must be pixel-stable.** The `Schedule.tsx` refactor maps the old inline colors to classes using tokens (`--color-accent` = #c67139, `--color-neutral-300` = #dcd3c4 — same values); every other change lives inside media queries.
- Deliberate deviations (already user-approved, do not "fix"): cam FAQ stays; artifacts stay un-washed; finishes spec rows keep two-line right-aligned values.

---

### Task 1: Reference handoff, redesigned menu, scroll margins

**Files:**
- Create: `reference/design-2026-mobile/` (6 files from `mobie.zip`)
- Modify: `components/Nav.tsx`, `app/site.css`

**Interfaces:**
- Produces: drawer classes/behavior used site-wide; `scroll-margin-top` on the six home anchors. No interfaces consumed by later tasks change.

- [ ] **Step 1: Commit the handoff sources**

```bash
mkdir -p reference/design-2026-mobile
unzip -j -o mobie.zip -d reference/design-2026-mobile
ls reference/design-2026-mobile   # expect: README.md, mobile-{home,finishes,history,traffic-cam}.dc.html, styles.css
```

- [ ] **Step 2: `components/Nav.tsx`** — three changes:

(a) Change the react import line to include `useEffect`:

```tsx
import { useEffect, useState } from 'react';
```

(b) Inside the component, after the `close` definition, add:

```tsx
  // Close the drawer on Escape or a tap outside the header/panel.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    const onPointerDown = (e: PointerEvent) => {
      const t = e.target as Element | null;
      if (t && !t.closest('.site-nav') && !t.closest('.nav-drawer')) setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [open]);
```

(If the component has no `close` helper, place the effect directly after the `useState` line.)

(c) In the hamburger button, change both icon sizes from `size={24}` to `size={26}` (strokeWidth stays 2.75).

- [ ] **Step 3: `app/site.css`** — add the anchor rule after the `body { padding-top: 64px; }` line:

```css
#plans, #history, #amenities, #neighborhood, #schedule, #contact { scroll-margin-top: 76px; }
```

Then REPLACE the entire `@media (max-width: 980px) { ... }` block with exactly:

```css
@media (max-width: 980px) {
  .site-nav .nav-links { display: none; }
  .nav-menu-btn { display: grid; place-items: center; margin-left: auto; width: 44px; height: 44px; border-radius: 999px; }
  .nav-drawer {
    display: flex; flex-direction: column; position: fixed; top: 64px; left: 0; right: 0; z-index: 999;
    background: var(--color-bg); box-shadow: var(--shadow-lg);
    border-radius: 0 0 calc(var(--radius-lg) * 1.4) calc(var(--radius-lg) * 1.4);
    padding: 8px 20px 24px;
  }
  .nav-drawer a { display: block; padding: 13px 4px; color: inherit; text-decoration: none; font-size: 18px; border-bottom: 1px solid var(--color-divider); }
  .nav-drawer a:nth-last-child(2) { border-bottom: 0; }
  .nav-drawer a[aria-current='page'] { color: var(--color-accent-700); }
  .nav-drawer a.btn-primary { display: inline-flex; justify-content: center; width: 100%; min-height: 48px; margin-top: 14px; border-bottom: 0; color: var(--color-bg); }
}
```

- [ ] **Step 4: Build + headless check**

```bash
npm run build && npm run lint
```

Serve `out/` on 4173, then (playwright, viewport 390×844, `http://localhost:4173/`):
1. Click `.nav-menu-btn` → `.nav-drawer` visible; computed `border-bottom-left-radius` of the drawer is non-zero; the `a.btn-primary` inside has `offsetWidth` within 45px of the drawer's clientWidth.
2. Press `Escape` → drawer gone.
3. Open again; `page.mouse.click(195, 780)` (below the panel) → drawer gone.
4. Open again; click the drawer's `a[href="/finishes/"]` → navigates to `/finishes/`; on that page open the menu and assert the Finishes link's computed color differs from the Residences link's (accent-700 current-page state).
5. Viewport 985×800 on `/`: `.nav-links` visible, `.site-nav` offsetHeight ≤ 70.
Kill the server. Expected: all pass (print `MENU-OK`).

- [ ] **Step 5: Commit**

```bash
git add reference/design-2026-mobile components/Nav.tsx app/site.css
git commit -m "Redesign mobile menu per handoff; commit mobile design references"
```

---

### Task 2: Home page mobile layout (incl. vertical timeline)

**Files:**
- Modify: `components/home/StatsBand.tsx` (full replacement), `components/home/Schedule.tsx` (full replacement), `app/site.css`

**Interfaces:**
- Consumes: existing classes; tokens `--color-accent-2`, `--color-accent-2-300`, `--color-neutral-300`, `--color-neutral-400` (all exist in `app/globals.css`).
- Produces: classes `.tl-content`, `.tl-connector-complete/-next/-upcoming`, `.tl-tag-date`, `.stat-label-long/-short` used only within these files.

- [ ] **Step 1: Replace `components/home/StatsBand.tsx`** with exactly:

```tsx
const stats = [
  { figure: '1905', label: 'Built for S. Birkenstein & Sons' },
  { figure: '57', label: 'Loft residences' },
  { figure: '4', label: 'Stories of brick & heavy timber', labelShort: 'Stories of brick & timber' },
  { figure: '0.2 mi', label: 'To the Chicago River' },
];

export default function StatsBand() {
  return (
    <section className="stats-band" aria-label="Building facts">
      {stats.map((s) => (
        <div key={s.label}>
          <div className="stat-figure">{s.figure}</div>
          <div className="stat-label">
            {s.labelShort ? (
              <>
                <span className="stat-label-long">{s.label}</span>
                <span className="stat-label-short">{s.labelShort}</span>
              </>
            ) : (
              s.label
            )}
          </div>
        </div>
      ))}
    </section>
  );
}
```

- [ ] **Step 2: Replace `components/home/Schedule.tsx`** with exactly:

```tsx
import { milestones, type MilestoneState } from '@/data/timeline';

const tagFor: Record<MilestoneState, { cls: string; text: string }> = {
  complete: { cls: 'tag-accent-2', text: 'Complete' },
  next: { cls: 'tag-accent', text: 'Next' },
  upcoming: { cls: 'tag-neutral', text: 'Planned' },
};

const dotCls: Record<MilestoneState, string> = {
  complete: 'tl-dot-complete',
  next: 'tl-dot-next',
  upcoming: 'tl-dot-upcoming',
};

export default function Schedule() {
  return (
    <section id="schedule" className="section container">
      <h2>Construction schedule</h2>
      <p className="section-intro">
        The building&rsquo;s conversion to residences is underway. Here&rsquo;s where things stand.
      </p>
      <div className="timeline">
        {milestones.map((ms, i) => {
          const next = milestones[i + 1];
          const date = ms.label.split(' · ')[0];
          return (
            <div key={ms.title} className="tl-item">
              <div className="tl-track">
                {next && <div className={`tl-connector tl-connector-${next.state}`} />}
                <span className={`tl-dot ${dotCls[ms.state]}`} />
              </div>
              <div className="tl-content">
                <span className={`tag ${tagFor[ms.state].cls}`}>
                  {tagFor[ms.state].text}
                  <span className="tl-tag-date"> · {date}</span>
                </span>
                <div className="tl-date">{date}</div>
                <h3 className="tl-title">{ms.title}</h3>
                <p className="tl-body">{ms.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
```

(This removes the `ACCENT`/`NEUTRAL` hex constants and `connectorBackground()`; colors move to CSS classes below. Desktop output is pixel-identical.)

- [ ] **Step 3: `app/site.css` base additions** — in the `— construction schedule —` block, directly after the `.tl-connector { ... }` rule, add:

```css
.tl-connector-complete { background: var(--color-accent); }
.tl-connector-next { background: linear-gradient(90deg, var(--color-accent) 0%, var(--color-accent) 60%, var(--color-neutral-300) 60%, var(--color-neutral-300) 100%); }
.tl-connector-upcoming { background: var(--color-neutral-300); }
.tl-tag-date { display: none; }
```

And in the `— stats band —` block, after `.stat-label { ... }`, add:

```css
.stat-label-short { display: none; }
```

- [ ] **Step 4: `app/site.css`** — REPLACE the main `@media (max-width: 768px) { ... }` block (the one in the `— responsive —` section that currently starts with `.container { padding-inline: 20px; }`) AND DELETE the `@media (max-width: 660px) { ... }` timeline block that follows it, with exactly:

```css
@media (max-width: 768px) {
  .container { padding-inline: 20px; }
  .site-nav { padding-inline: 20px; }
  /* hero */
  .hero { grid-template-columns: 1fr; gap: 28px; padding-block: 32px 48px; }
  .hero .tag { font-size: 12px; }
  .hero h1 { font-size: 37px; line-height: 1.1; }
  .hero-lede { font-size: 16px; }
  .hero-ctas { flex-direction: column; gap: 12px; }
  .hero-ctas .btn { width: 100%; justify-content: center; min-height: 48px; }
  .hero-blob { height: 320px; }
  /* stats band */
  .stats-band { width: calc(100% - 40px); display: grid; grid-template-columns: 1fr 1fr; gap: 20px; padding: 24px; }
  .stat-figure { font-size: 30px; }
  .stat-label { font-size: 12px; }
  .stat-label-long { display: none; }
  .stat-label-short { display: inline; }
  /* section rhythm */
  .section { padding-top: 56px; }
  .section h2 { font-size: 28px; }
  .section-intro { font-size: 15px; margin-bottom: 24px; }
  /* floor plans */
  .cards-3, .amenities-grid, .nbhd-cards { grid-template-columns: 1fr; }
  .cards-3 { gap: 20px; }
  .plan-media { height: 190px; }
  .plan-card .card-title { font-size: 20px; }
  .plan-card .btn { width: 100%; justify-content: center; min-height: 46px; }
  /* history band */
  .history-band { display: flex; flex-direction: column; gap: 18px; padding: 32px 24px; }
  .history-band > div:first-child { display: contents; }
  .history-band .tag { order: 1; align-self: flex-start; }
  .history-band h2 { order: 2; margin: 0; font-size: 28px; }
  .history-photo { order: 3; width: 220px; height: 220px; align-self: center; }
  .history-band p { order: 4; font-size: 15px; }
  .history-band .history-link { order: 5; margin-top: 0; padding-block: 10px; }
  /* amenities */
  .amenities-grid { gap: 16px; }
  .amenity-icon { width: 38px; height: 38px; }
  /* neighborhood + map */
  .nbhd-intro { font-size: 15px; margin-bottom: 24px; }
  .map-frame { grid-template-columns: 1fr; }
  .map-panel { display: none; }
  .map-canvas { min-height: 280px; height: 280px; }
  .map-address { display: none; }
  .nbhd-cards { gap: 14px; margin-top: 20px; }
  /* schedule — vertical timeline */
  .timeline { display: flex; flex-direction: column; gap: 0; }
  .tl-item { display: flex; gap: 16px; }
  .tl-track { position: static; height: auto; margin-bottom: 0; flex: none; width: 20px; display: flex; flex-direction: column; align-items: center; }
  .tl-dot { position: static; order: 0; width: 14px; height: 14px; margin-top: 5px; }
  .tl-connector { position: static; order: 1; left: auto; right: auto; top: auto; width: 2px; height: auto; flex: 1; margin-top: 4px; }
  .tl-content { padding-bottom: 26px; }
  .tl-item:last-child .tl-content { padding-bottom: 0; }
  .tl-dot-complete { background: var(--color-accent-2); border: 0; box-shadow: none; }
  .tl-dot-next { background: var(--color-accent); border: 0; }
  .tl-dot-upcoming { border-width: 2px; border-color: var(--color-neutral-400); }
  .tl-connector-complete, .tl-connector-next { background: var(--color-accent-2-300); }
  .tl-connector-upcoming { background: var(--color-neutral-300); }
  .tl-tag-date { display: inline; }
  .tl-date { display: none; }
  .tl-item .tag { font-size: 11px; }
  .tl-title { font-size: 19px; margin: 8px 0 4px; }
  .tl-body { font-size: 14px; line-height: 1.55; }
  /* contact */
  .contact-band { display: flex; flex-direction: column; padding: 32px 24px; gap: 0; }
  .contact-band > div:first-child { display: contents; }
  .contact-band h2 { order: 1; margin: 0 0 10px; }
  .contact-blurb { order: 2; font-size: 15px; margin-bottom: 24px; }
  .contact-band form, .contact-band .form-success { order: 3; }
  .contact-form { grid-template-columns: 1fr; }
  .contact-address { order: 4; margin-top: 24px; }
  .contact-band .input { min-height: 48px; }
  .contact-band textarea.input { min-height: 96px; }
  .contact-band button.btn { width: 100%; justify-content: center; min-height: 50px; }
  /* footer */
  .site-footer { flex-direction: column; padding: 32px 24px; gap: 20px; }
  .footer-links { gap: 16px 24px; font-size: 14px; }
  .footer-links a { padding: 6px 0; }
  /* traffic cam */
  .cam-header { padding-block: 32px 24px; }
  .cam-header h1 { font-size: 34px; }
  .cam-player { border-radius: calc(var(--radius-lg) * 1.2); }
  .cam-notes { padding-block: 24px 48px; }
}
```

(Everything the old block did is carried into this one — nothing else in the file changes. The `.site-nav, .nav-drawer { padding-inline: 20px; }` line is intentionally simplified to `.site-nav` only, since the 980px drawer now sets its own 20px padding.)

- [ ] **Step 5: Build + headless checks**

```bash
npm run build && npm run lint
```

Serve `out/` on 4173. Playwright:
- 390×844 on `/` (scroll through first so lazy content loads):
  1. Stats band: computed `grid-template-columns` has exactly two tracks; the visible third label text is "Stories of brick & timber".
  2. Timeline vertical: for the first `.tl-item`, the `.tl-track` box's right edge is left of the `.tl-content` box's left edge; `.tl-date` hidden; first `.tag` in the timeline textContent contains "Complete · 2025".
  3. Dot colors: computed background-color of `.tl-dot-complete` equals the computed value of `--color-accent-2` on `:root`, and `.tl-dot-next` equals `--color-accent`.
  4. Map: `.map-panel` hidden; `.map-canvas` height 280±2; wait up to 5s for `.bk-pin` elements (Leaflet initialized) — count > 10; `.map-address` hidden.
  5. Hero CTAs: each `.hero-ctas .btn` offsetWidth within 45px of the container width; offsetHeight ≥ 46.
  6. Contact: first `.contact-band .input` offsetHeight ≥ 46; the address block's bounding top is BELOW the form's submit button top; submit `button.btn` full width.
  7. Anchor clearance: `goto('/#schedule')`, assert `#schedule`'s boundingRect top ≥ 60.
- 1400×900 on `/`: stats long label visible ("heavy timber" present, short hidden); `.timeline` computed display is `grid`; `.map-panel` visible; `.tl-date` visible and `.tl-tag-date` hidden.
Kill the server. Print `HOME-MOBILE-OK`.

- [ ] **Step 6: Commit**

```bash
git add components/home/StatsBand.tsx components/home/Schedule.tsx app/site.css
git commit -m "Mobile home layout: vertical timeline, 2x2 stats, stacked hero and contact"
```

---

### Task 3: Finishes, History, and Traffic Cam mobile treatments

**Files:**
- Modify: `app/site.css` (replace the history-page and finishes-page 768px blocks), `app/history/page.tsx` (one className)

**Interfaces:**
- Consumes: existing `.history-*`/`.fin-*` classes; `--color-surface`, `--color-accent-700` tokens.
- Produces: `.history-fig--portrait` (markup + CSS).

- [ ] **Step 1: `app/history/page.tsx`** — on the Louis Birkenstein portrait figure (the one whose `Image` src is `/images/history/louis-birkenstein-1919.webp`), change `className="history-fig"` to `className="history-fig history-fig--portrait"`. Nothing else changes.

- [ ] **Step 2: `app/site.css`** — REPLACE the history page's `@media (max-width: 768px)` block (the one containing `.history-header { padding-block: 40px 0; }`) with exactly:

```css
@media (max-width: 768px) {
  .history-header { padding-block: 40px 0; }
  .history-header h1 { font-size: 34px; line-height: 1.12; }
  .history-lede { font-size: 17px; }
  .history-row { grid-template-columns: 1fr; gap: 20px; padding-block: 18px; }
  .history-row.rev .history-prose { order: 0; }
  .history-row.rev .history-fig { order: 0; }
  .history-prose h2 { font-size: 26px; margin-bottom: 12px; }
  .history-prose p { font-size: 15px; }
  .history-solo h2 { font-size: 26px; margin-bottom: 12px; }
  .history-solo p { font-size: 15px; }
  .history-fig img { border-radius: calc(var(--radius-lg) * 1.2); }
  .history-fig figcaption { font-style: italic; }
  .history-fig--portrait img { width: 200px; height: 200px; border-radius: 50%; object-fit: cover; }
  .history-fig--portrait figcaption { text-align: center; }
  .history-cta { flex-direction: column; align-items: stretch; padding: 28px 24px; gap: 16px; }
  .history-cta p { font-size: 22px; line-height: 1.3; max-width: none; }
  .history-cta-btns { flex-direction: column; gap: 12px; }
  .history-cta-btns .btn { width: 100%; justify-content: center; min-height: 48px; }
}
```

- [ ] **Step 3: `app/site.css`** — REPLACE the finishes page's `@media (max-width: 768px)` block (the one containing `.fin-header { padding-block: 40px 0; }`) with exactly:

```css
@media (max-width: 768px) {
  .fin-header { padding-block: 40px 0; }
  .fin-header h1 { font-size: 36px; line-height: 1.1; }
  .fin-lede { font-size: 17px; }
  .fin-hero { margin-top: 24px; }
  .fin-hero img { border-radius: calc(var(--radius-lg) * 1.2); }
  .fin-hero figcaption, .fin-fig figcaption { font-style: italic; }
  .fin-section { padding-top: 48px; }
  .fin-section h2 { font-size: 28px; }
  .fin-blurb { font-size: 15px; margin-bottom: 20px; }
  .fin-section > .tag-accent-2 { background: transparent; border: 0; padding: 0; color: var(--color-accent-700); font-size: 13px; font-weight: 600; letter-spacing: 0.06em; }
  .fin-row, .fin-cards, .fin-gallery { grid-template-columns: 1fr; }
  .fin-row { gap: 20px; }
  .fin-fig img { border-radius: calc(var(--radius-lg) * 1.2); }
  .fin-selections { background: var(--color-surface); border: 1px solid var(--color-divider); border-radius: var(--radius-lg); padding: 4px 18px; }
  .fin-selections li { grid-template-columns: 88px 1fr; }
  .fin-selections li:first-child { border-top: 0; }
  .fin-item { font-size: 13px; font-weight: 600; letter-spacing: 0; text-transform: none; padding-top: 0; }
  .fin-product { font-size: 14px; font-weight: 400; text-align: right; }
  .fin-spec { text-align: right; }
  .fin-cards { gap: 16px; }
  .fin-cards .card { display: grid; grid-template-columns: 96px 1fr; column-gap: 16px; align-items: center; }
  .fin-card-media { grid-row: 1 / span 3; width: 96px; height: 96px; padding: 8px; margin-bottom: 0; }
  .fin-card-media img { max-height: 80px; }
  .fin-cards .card-title { font-size: 18px; }
  .fin-cards .card-body { font-size: 13px; }
  .fin-gallery { grid-template-columns: repeat(3, 1fr); gap: 12px; }
  .fin-gallery .fin-fig:first-child { grid-column: 1 / -1; }
  .fin-gallery .fin-fig:first-child img { aspect-ratio: auto; }
  .fin-gallery .fin-fig:not(:first-child) img { aspect-ratio: auto; height: 110px; }
  .fin-gallery .fin-fig:not(:first-child) figcaption { font-size: 12px; margin-top: 8px; }
  .fin-teaser { grid-template-columns: 1fr; padding: 28px; gap: 20px; }
  .fin-teaser-img { height: 180px; }
}
```

- [ ] **Step 4: Build + headless checks**

```bash
npm run build && npm run lint
```

Serve `out/` on 4173. Playwright:
- 390×844 on `/finishes/` (scroll through):
  1. First fixtures card lays out horizontally: `.fin-card-media` box's right edge left of the `.card-title` box's left edge, and their vertical ranges overlap.
  2. `.fin-gallery` computed grid-template-columns has three tracks; the first figure spans the full row (its width ≥ 2× the second figure's width); thumbnail image heights 110±2.
  3. The "01 · Kitchen" element's computed background-color is transparent/rgba(0,0,0,0) and color ≠ the body text color; the "In progress" tag still has a non-transparent background.
  4. `.fin-selections` has a non-transparent background and a border; `.fin-product` computed text-align is right.
- 390×844 on `/history/`: portrait figure img is 200×200 with border-radius 50%; its figcaption text-align center; a non-portrait figure caption has font-style italic.
- 390×844 on `/ohio-feeder-ramp-cam/`: `h1` font-size 34px; the FAQ section still exists (`.cam-faq` present with 3 `.faq-item`s).
- 1400×900 regression: `/finishes/` `.fin-row` has two tracks and the kicker tags are pills again (non-transparent background); `/history/` `.history-row` two tracks, portrait NOT circular (border-radius ≠ 50%).
Kill the server. Print `PAGES-MOBILE-OK`.

- [ ] **Step 5: Commit**

```bash
git add app/site.css app/history/page.tsx
git commit -m "Mobile treatments for finishes, history, and traffic cam pages"
```

---

## Final verification (controller/user, after all tasks)

- [ ] Controller: full-page screenshots of all four pages at 390×844 compared side-by-side against the four mocks in `reference/design-2026-mobile/`; desktop 1400×900 screenshots of `/` (incl. timeline + stats), `/finishes/`, `/history/` to prove zero desktop regression.
- [ ] User reviews on a real phone or devtools; merge/push is the user's call.
