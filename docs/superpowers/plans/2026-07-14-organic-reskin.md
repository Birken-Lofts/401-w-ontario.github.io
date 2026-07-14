# Organic Reskin / Next.js Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild birkenlofts.com to the "Organic" design system from `design.zip`, migrating from Vite React SPA to Next.js App Router with static export, on branch `reskin-organic`.

**Architecture:** Next.js 15 (`output: 'export'`, `trailingSlash: true`) emits static HTML to `out/`; GitHub Pages hosting is unchanged. The handoff's `styles.css` becomes `app/globals.css` (design tokens + component classes, replacing Tailwind); mock inline styles become classes in `app/site.css`. Two routes: `/` and `/ohio-feeder-ramp-cam/`. The Leaflet map is a client-only component; everything else is server components.

**Tech Stack:** Next.js 15, React 19, TypeScript, plain CSS (design-system file), Leaflet, react-hook-form, lucide-react, next/font (Caprasimo + Figtree).

## Global Constraints

- Spec: `docs/superpowers/specs/2026-07-14-organic-reskin-design.md`. Design sources (committed in Task 1): `reference/design-2026/README.md`, `home.dc.html`, `traffic-cam.dc.html`, `styles.css`. Copy from the mocks is final — reproduce it verbatim (including `&`/`·`/`—` characters), except: **no email in the contact block**, **no Gallery/Blog/Resident Portal links**, **no "Read the building's story →" link**.
- Cam page URL stays `/ohio-feeder-ramp-cam/`; YouTube video ID `DdyWM2B-FYQ`; embed host `www.youtube-nocookie.com`.
- Nav links (exact set + order): Residences `/#plans`, History `/#history`, Amenities `/#amenities`, Neighborhood `/#neighborhood`, Traffic Cam `/ohio-feeder-ramp-cam/`, Contact `/#contact`, pill button "Contact us" `/#contact`. Footer links: Residences, History, Traffic Cam, Contact.
- Section ids on the home page: `plans`, `history`, `amenities`, `neighborhood`, `schedule`, `contact`.
- Google Analytics id `G-YVPGP24V3P` on every page (root layout).
- Formspree endpoint `https://formspree.io/f/xqeyrene` (JSON POST). Network failure shows an inline error — never a fake success.
- `robots.txt` and `sitemap.xml` are NOT modified. `public/CNAME`, `favicon.svg`, `icons.svg`, `images/` are NOT modified.
- No test suite. The gate for every task is `npm run build` (Next typecheck + static export) plus grep checks against `out/`.
- No SRI attributes on the gtag.js script (Google serves it dynamically; a pinned hash breaks it).
- Node 22 in CI (unchanged). Do not run `npm run dev` in tasks (long-running); the controller/user does interactive checks.

---

### Task 1: Next.js scaffold replacing Vite

**Files:**
- Create: `reference/design-2026/` (from `design.zip`), `next.config.ts`, `.eslintrc.json`, `app/layout.tsx`, `app/page.tsx`, `app/globals.css`, `app/site.css`, `public/.nojekyll`
- Modify: `package.json`, `tsconfig.json`, `.gitignore`
- Move: `src/data/location.ts` → `data/location.ts`, `src/data/timeline.ts` → `data/timeline.ts`
- Delete: `vite.config.ts`, `index.html`, `ohio-feeder-ramp-cam/index.html`, `eslint.config.js`, `tsconfig.app.json`, `tsconfig.node.json`, and the remainder of `src/`

**Interfaces:**
- Produces: a building Next.js app; `app/globals.css` design tokens/classes (`.btn`, `.btn-primary/-secondary/-ghost`, `.card`, `.card-title/-body/-kicker`, `.tag`, `.tag-accent/-accent-2/-neutral`, `.field`, `.input`, `.washed`, `.elev-sm`, `.nav-brand`); `app/site.css` layout classes used by all later tasks (`.container`, `.site-nav`, `.nav-links`, `.nav-menu-btn`, `.nav-drawer`, `.hero`, `.hero-lede`, `.hero-ctas`, `.hero-blob`, `.stats-band`, `.stat-figure`, `.stat-label`, `.section`, `.section-intro`, `.cards-3`, `.plan-card`, `.plan-media`, `.history-band`, `.history-photo`, `.amenities-grid`, `.amenity`, `.amenity-icon`, `.nbhd-intro`, `.map-frame`, `.map-panel`, `.map-filter-head`, `.map-filter-label`, `.map-chips`, `.map-chip`, `.chip-dot`, `.place-list`, `.place-item`, `.place-name`, `.place-walk`, `.place-blurb`, `.map-canvas`, `.map-address`, `.addr-name`, `.addr-dot`, `.nbhd-cards`, `.bk-pin`, `.bk-home`, `.timeline`, `.tl-item`, `.tl-track`, `.tl-connector`, `.tl-dot`, `.tl-dot-complete/-next/-upcoming`, `.tl-date`, `.tl-title`, `.tl-body`, `.contact-band`, `.contact-blurb`, `.contact-address`, `.contact-form`, `.full`, `.form-error`, `.form-success`, `.site-footer`, `.footer-brand`, `.footer-meta`, `.footer-links`, `.cam-header`, `.cam-player`, `.cam-notes`, `.cam-note-1/-2/-3`, `.cam-faq`, `.faq-item`, `.faq-q`, `.faq-a`, `.img-slot`, `.img-cover`); `data/location.ts` exporting `categories`, `pois`, `HOME`, type `Poi`; `data/timeline.ts` exporting `milestones`, types `Milestone`, `MilestoneState`; path alias `@/*` → repo root.

- [ ] **Step 1: Commit the design sources into the repo**

```bash
mkdir -p reference/design-2026
unzip -j -o design.zip -d reference/design-2026
ls reference/design-2026   # expect: README.md home.dc.html styles.css traffic-cam.dc.html
```

- [ ] **Step 2: Replace `package.json`** with exactly:

```json
{
  "name": "birken-lofts",
  "private": true,
  "version": "1.0.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "lint": "eslint ."
  },
  "dependencies": {
    "leaflet": "^1.9.4",
    "lucide-react": "^0.577.0",
    "next": "^15.5.0",
    "react": "^19.2.4",
    "react-dom": "^19.2.4",
    "react-hook-form": "^7.71.2"
  },
  "devDependencies": {
    "@eslint/eslintrc": "^3.3.1",
    "@types/leaflet": "^1.9.21",
    "@types/node": "^24.12.0",
    "@types/react": "^19.2.14",
    "@types/react-dom": "^19.2.3",
    "eslint": "^9.39.4",
    "eslint-config-next": "^15.5.0",
    "typescript": "~5.9.3"
  }
}
```

- [ ] **Step 3: Create `next.config.ts`**:

```ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
```

- [ ] **Step 4: Replace `tsconfig.json`** (and delete `tsconfig.app.json`, `tsconfig.node.json`):

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules", "out", "reference"]
}
```

- [ ] **Step 5: Replace `eslint.config.js` with `eslint.config.mjs`** (ESLint 9 flat config, the create-next-app pattern — delete `eslint.config.js`):

```js
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

const eslintConfig = [
  { ignores: ['.next/**', 'out/**', 'node_modules/**', 'reference/**', 'next-env.d.ts'] },
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
];

export default eslintConfig;
```

- [ ] **Step 6: Move data files, delete the rest of the Vite app**

```bash
mkdir -p data
git mv src/data/location.ts data/location.ts
git mv src/data/timeline.ts data/timeline.ts
git rm -r src
git rm vite.config.ts index.html ohio-feeder-ramp-cam/index.html eslint.config.js tsconfig.app.json tsconfig.node.json
rmdir ohio-feeder-ramp-cam 2>/dev/null || true
```

(If `tsconfig.app.json`/`tsconfig.node.json` don't exist, skip them.) Do not edit the two moved data files — they are consumed as-is.

- [ ] **Step 7: Append to `.gitignore`**:

```
# next.js
/.next/
/out/
next-env.d.ts
```

- [ ] **Step 8: Create `app/globals.css`** — a modified copy of the design system:

```bash
cp reference/design-2026/styles.css app/globals.css
```

Then make exactly two edits to `app/globals.css`:
1. Delete the line `@import url('https://fonts.googleapis.com/css2?family=Caprasimo:wght@400&family=Figtree:wght@400;600;700&display=swap');` (fonts load via next/font).
2. Replace the two font tokens:
   - `--font-heading: "Caprasimo", system-ui, sans-serif;` → `--font-heading: var(--font-caprasimo), Georgia, serif;`
   - `--font-body: "Figtree", system-ui, sans-serif;` → `--font-body: var(--font-figtree), system-ui, sans-serif;`

Change nothing else in the file — it is the design-system source of truth.

- [ ] **Step 9: Create `app/site.css`** with exactly this content:

```css
/* Layout & section styles translated from the design mocks
   (reference/design-2026/home.dc.html, traffic-cam.dc.html).
   Design tokens and component classes live in globals.css. */

/* — page scaffold — */
.container { max-width: 1280px; margin-inline: auto; padding-inline: 48px; }
body { padding-top: 64px; } /* clearance for the fixed nav */

/* — fixed nav (always visible, solid — departure from the mock's static nav) — */
.site-nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 1000;
  height: 64px; display: flex; align-items: center; gap: var(--space-4);
  padding-inline: 48px; background: var(--color-bg);
  border-bottom: 1px solid var(--color-divider);
}
.site-nav .nav-brand {
  font-family: var(--font-heading); font-weight: var(--font-heading-weight);
  font-size: 18px; margin-right: auto; color: inherit; text-decoration: none;
}
.site-nav .nav-links { display: flex; align-items: center; gap: 26px; }
.site-nav .nav-links a { color: inherit; text-decoration: none; font-size: 14px; }
.site-nav .nav-links a:hover,
.site-nav .nav-links a[aria-current='page'] { color: var(--color-accent); }
.site-nav .nav-links a.btn-primary { color: var(--color-bg); }
.site-nav .nav-links a.btn-primary:hover { color: var(--color-bg); }
.nav-menu-btn { display: none; background: none; border: 0; cursor: pointer; color: var(--color-text); padding: 6px; }
.nav-drawer { display: none; }

/* — hero — */
.hero { display: grid; grid-template-columns: 1.05fr 1fr; gap: 56px; align-items: center; padding-block: 64px 72px; }
.hero h1 { font-size: 58px; line-height: 1.06; margin: 20px 0 18px; max-width: 12ch; }
.hero-lede { font-size: 18px; line-height: 1.6; max-width: 46ch; margin: 0 0 28px; color: var(--color-neutral-700); }
.hero-ctas { display: flex; gap: 14px; }
.hero-blob { position: relative; border-radius: 46% 54% 52% 48% / 44% 46% 54% 56%; overflow: hidden; height: 480px; }

/* — stats band — */
.stats-band {
  display: flex; gap: 64px; flex-wrap: wrap;
  padding: 36px 48px; max-width: 1080px; margin-inline: 48px;
  background: var(--color-accent-2-100); border-radius: calc(var(--radius-lg) * 1.4);
}
.stat-figure { font-family: var(--font-heading); font-size: 38px; }
.stat-label { font-size: 13px; color: var(--color-neutral-700); }

/* — section rhythm — */
.section { padding-top: 88px; }
.section h2 { font-size: 38px; margin: 0 0 10px; }
.section-intro { font-size: 16px; color: var(--color-neutral-700); max-width: 52ch; margin: 0 0 36px; }

/* — floor plans — */
.cards-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 28px; }
.plan-card { gap: 14px; }
.plan-card .card-title { font-size: 22px; }
.plan-media { position: relative; border-radius: var(--radius-lg); overflow: hidden; height: 200px; }

/* — history band — */
.history-band {
  margin-top: 88px; background: var(--color-accent-100);
  border-radius: calc(var(--radius-lg) * 1.6); padding: 56px;
  display: grid; grid-template-columns: 1fr 380px; gap: 48px; align-items: center;
}
.history-band h2 { font-size: 36px; margin: 16px 0 14px; }
.history-band p { font-size: 16px; line-height: 1.65; color: var(--color-neutral-800); max-width: 54ch; margin: 0; }
.history-photo { position: relative; border-radius: 50%; overflow: hidden; width: 340px; height: 340px; justify-self: end; }

/* — amenities — */
.amenities-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px 40px; margin-top: 26px; }
.amenity { display: flex; align-items: center; gap: 14px; font-size: 16px; }
.amenity-icon {
  flex: none; width: 40px; height: 40px; border-radius: 999px;
  background: var(--color-accent-2-200); color: var(--color-accent-2-800);
  display: grid; place-items: center;
}

/* — neighborhood + map — */
.nbhd-intro { font-size: 17px; line-height: 1.65; color: var(--color-neutral-700); max-width: 56ch; margin: 0 0 36px; }
.map-frame {
  border-radius: calc(var(--radius-lg) * 1.4); overflow: hidden;
  border: 1px solid var(--color-divider);
  display: grid; grid-template-columns: 350px 1fr; background: var(--color-neutral-100);
}
.map-panel { display: flex; flex-direction: column; border-right: 1px solid var(--color-divider); }
.map-filter-head { padding: 20px 22px 14px; border-bottom: 1px solid var(--color-divider); }
.map-filter-label { font-size: 11px; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; color: var(--color-neutral-600); margin-bottom: 8px; }
.map-chips { display: flex; flex-wrap: wrap; gap: 8px; }
.map-chip {
  display: inline-flex; align-items: center; gap: 7px; cursor: pointer;
  font-family: var(--font-body); font-size: 12px; font-weight: 600;
  padding: 6px 12px; border-radius: 999px;
  border: 1px solid var(--color-divider); background: transparent; color: var(--color-neutral-700);
}
.chip-dot { width: 9px; height: 9px; border-radius: 50%; flex: none; }
.place-list { overflow-y: auto; max-height: 430px; padding-block: 6px; }
.place-list::-webkit-scrollbar { width: 7px; }
.place-list::-webkit-scrollbar-thumb { background: var(--color-neutral-300); border-radius: 4px; }
.place-item {
  width: 100%; text-align: left; display: flex; gap: 12px; align-items: flex-start;
  padding: 13px 22px; cursor: pointer; background: none; border: 0;
  border-bottom: 1px solid color-mix(in srgb, var(--color-text) 7%, transparent);
  font: inherit; color: inherit;
}
.place-item:hover { background: color-mix(in srgb, var(--color-text) 4%, transparent); }
.place-head { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; }
.place-name { font-size: 14px; font-weight: 600; }
.place-walk { font-size: 11px; font-weight: 700; letter-spacing: 0.04em; color: var(--color-accent); white-space: nowrap; }
.place-blurb { font-size: 12px; line-height: 1.45; color: var(--color-neutral-600); margin-top: 3px; }
.map-canvas { position: relative; min-height: 520px; }
.map-canvas .map-target { position: absolute; inset: 0; }
.map-address {
  position: absolute; left: 18px; top: 18px; z-index: 600; pointer-events: none;
  background: color-mix(in srgb, var(--color-bg) 85%, transparent);
  backdrop-filter: blur(8px);
  border: 1px solid var(--color-divider); border-radius: var(--radius-md);
  padding: 14px 16px; max-width: 230px; font-size: 12px; line-height: 1.5; color: var(--color-neutral-700);
}
.addr-name { display: flex; align-items: center; gap: 9px; font-size: 13px; font-weight: 700; color: var(--color-text); margin-bottom: 6px; }
.addr-dot { width: 11px; height: 11px; border-radius: 50%; background: var(--color-accent); border: 2px solid var(--color-bg); flex: none; }
.nbhd-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 28px; }

/* — Leaflet Organic theme — */
@keyframes bk-pulse {
  0%   { box-shadow: 0 0 0 0 rgba(198, 113, 57, 0.5); }
  70%  { box-shadow: 0 0 0 16px rgba(198, 113, 57, 0); }
  100% { box-shadow: 0 0 0 0 rgba(198, 113, 57, 0); }
}
.leaflet-container { font-family: var(--font-body); background: var(--color-neutral-200); }
.leaflet-popup-content-wrapper {
  background: var(--color-neutral-100); color: var(--color-text);
  border-radius: var(--radius-md); box-shadow: var(--shadow-md);
  border: 1px solid var(--color-divider);
}
.leaflet-popup-content { margin: 14px 16px; line-height: 1.45; }
.leaflet-popup-tip { background: var(--color-neutral-100); border: 1px solid var(--color-divider); }
.leaflet-popup-close-button { color: var(--color-neutral-600) !important; }
.leaflet-bar a { background: var(--color-neutral-100); color: var(--color-text); border-color: var(--color-divider); }
.leaflet-bar a:hover { background: var(--color-neutral-200); }
.leaflet-control-attribution { background: color-mix(in srgb, var(--color-bg) 70%, transparent) !important; color: var(--color-neutral-600) !important; }
.leaflet-control-attribution a { color: var(--color-neutral-700) !important; }
.bk-pin {
  width: 18px; height: 18px; border-radius: 50%;
  border: 2.5px solid var(--color-bg); box-shadow: var(--shadow-sm);
  transition: transform 0.15s;
}
.bk-pin:hover { transform: scale(1.35); }
.bk-home {
  width: 30px; height: 30px; border-radius: 50%; background: var(--color-accent);
  border: 3px solid var(--color-bg); display: flex; align-items: center; justify-content: center;
  color: #fff; font: 700 13px var(--font-body); box-shadow: var(--shadow-md);
  animation: bk-pulse 2.6s infinite;
}

/* — construction schedule: horizontal timeline (departure from the mock's cards) — */
.timeline { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; }
.tl-track { position: relative; height: 20px; margin-bottom: 18px; }
.tl-connector { position: absolute; left: 10px; right: -24px; top: 9px; height: 2px; }
.tl-dot { position: absolute; left: 0; top: 0; width: 20px; height: 20px; border-radius: 50%; z-index: 1; }
.tl-dot-complete { background: var(--color-accent); border: 3px solid var(--color-bg); box-shadow: 0 0 0 1px var(--color-accent); }
.tl-dot-next { background: var(--color-bg); border: 3px solid var(--color-accent); }
.tl-dot-upcoming { background: var(--color-bg); border: 3px solid var(--color-neutral-400); }
.tl-date { font-size: 13px; color: var(--color-neutral-700); margin-top: 10px; }
.tl-title { font-size: 21px; margin: 6px 0 8px; }
.tl-body { font-size: 14px; line-height: 1.6; color: var(--color-neutral-700); margin: 0; }

/* — contact — */
.contact-band {
  margin-block: 88px 88px; background: var(--color-surface);
  border-radius: calc(var(--radius-lg) * 1.6); padding: 56px;
  display: grid; grid-template-columns: 1fr 1.2fr; gap: 56px;
}
.contact-band h2 { font-size: 36px; margin: 0 0 14px; }
.contact-blurb { font-size: 16px; line-height: 1.6; color: var(--color-neutral-700); max-width: 38ch; }
.contact-address { font-size: 14px; line-height: 1.8; color: var(--color-neutral-700); margin-top: 28px; }
.contact-form { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; align-content: start; }
.contact-form .full { grid-column: 1 / -1; }
.form-error { grid-column: 1 / -1; font-size: 13px; color: var(--color-accent-700); margin: 0; }
.form-success { font-size: 16px; line-height: 1.6; margin: 0; }

/* — footer — */
.site-footer {
  background: var(--color-neutral-900); color: var(--color-neutral-200);
  padding: 48px; display: flex; justify-content: space-between; align-items: flex-start; gap: 40px;
}
.footer-brand { font-family: var(--font-heading); font-size: 22px; color: var(--color-bg); }
.footer-meta { font-size: 13px; margin-top: 10px; line-height: 1.7; }
.footer-links { display: flex; gap: 28px; font-size: 13px; flex-wrap: wrap; }
.footer-links a { color: inherit; text-decoration: none; }
.footer-links a:hover { color: var(--color-bg); }

/* — traffic cam page — */
.cam-header { padding-block: 56px 36px; }
.cam-header h1 { font-size: 50px; line-height: 1.08; margin: 18px 0 0; }
.cam-player { border-radius: calc(var(--radius-lg) * 1.4); overflow: hidden; aspect-ratio: 16 / 9; background: var(--color-neutral-900); }
.cam-player iframe { width: 100%; height: 100%; border: 0; display: block; }
.cam-notes { padding-block: 36px 72px; display: flex; flex-direction: column; gap: 14px; }
.cam-note-1 { font-size: 18px; line-height: 1.6; margin: 0; color: var(--color-neutral-800); }
.cam-note-2 { font-size: 16px; line-height: 1.6; margin: 0; color: var(--color-neutral-700); }
.cam-note-3 { font-size: 13px; line-height: 1.6; margin: 0; color: var(--color-neutral-500); }
.cam-faq { padding-bottom: 88px; max-width: 680px; }
.cam-faq h2 { font-size: 26px; margin: 0 0 18px; }
.faq-item { padding-block: 16px; border-top: 1px solid var(--color-divider); }
.faq-q { font-family: var(--font-body); font-size: 15px; font-weight: 700; margin: 0 0 6px; }
.faq-a { font-size: 14px; line-height: 1.7; color: var(--color-neutral-700); margin: 0; }

/* — image slots — */
.img-slot {
  width: 100%; height: 100%; display: grid; place-items: center;
  background: var(--color-neutral-300); color: var(--color-neutral-600);
  font-size: 13px; text-align: center; padding: 12px;
}
.img-cover { object-fit: cover; }

/* — responsive (not designed; sensible stacking per handoff) — */
@media (max-width: 900px) {
  .site-nav .nav-links { display: none; }
  .nav-menu-btn { display: block; margin-left: auto; }
  .nav-drawer {
    display: block; position: fixed; top: 64px; left: 0; right: 0; z-index: 999;
    background: var(--color-bg); border-bottom: 1px solid var(--color-divider);
    padding: 8px 48px 24px;
  }
  .nav-drawer a { display: block; padding: 12px 0; color: inherit; text-decoration: none; font-size: 15px; }
  .nav-drawer a[aria-current='page'] { color: var(--color-accent); }
  .nav-drawer a.btn-primary { display: inline-flex; margin-top: 12px; color: var(--color-bg); }
}
@media (max-width: 768px) {
  .container { padding-inline: 20px; }
  .site-nav, .nav-drawer { padding-inline: 20px; }
  .hero { grid-template-columns: 1fr; padding-block: 40px 48px; }
  .hero h1 { font-size: 40px; }
  .hero-blob { height: 320px; }
  .stats-band { margin-inline: 20px; gap: 28px; padding: 28px; }
  .section h2 { font-size: 30px; }
  .cards-3, .amenities-grid, .nbhd-cards { grid-template-columns: 1fr; }
  .history-band { grid-template-columns: 1fr; padding: 32px; }
  .history-photo { width: 260px; height: 260px; justify-self: center; }
  .map-frame { grid-template-columns: 1fr; }
  .map-panel { border-right: 0; border-bottom: 1px solid var(--color-divider); }
  .place-list { max-height: 260px; }
  .contact-band { grid-template-columns: 1fr; padding: 32px; gap: 32px; }
  .contact-form { grid-template-columns: 1fr; }
  .site-footer { flex-direction: column; }
  .cam-header h1 { font-size: 36px; }
}
@media (max-width: 660px) {
  .timeline { display: flex; gap: 24px; overflow-x: auto; scroll-snap-type: x mandatory; padding-bottom: 6px; scrollbar-width: none; }
  .timeline::-webkit-scrollbar { display: none; }
  .tl-item { width: 240px; flex: none; scroll-snap-align: start; }
}
```

- [ ] **Step 10: Create `app/layout.tsx`** (Nav/Footer arrive in Task 2 — this version compiles without them):

```tsx
import type { Metadata } from 'next';
import Script from 'next/script';
import { Caprasimo, Figtree } from 'next/font/google';
import './globals.css';
import './site.css';

const caprasimo = Caprasimo({ weight: '400', subsets: ['latin'], variable: '--font-caprasimo' });
const figtree = Figtree({ weight: ['400', '600', '700'], subsets: ['latin'], variable: '--font-figtree' });

export const metadata: Metadata = {
  metadataBase: new URL('https://birkenlofts.com'),
  icons: { icon: '/favicon.svg' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${caprasimo.variable} ${figtree.variable}`}>
      <body>
        {children}
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-YVPGP24V3P" strategy="afterInteractive" />
        <Script id="ga" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-YVPGP24V3P');
        `}</Script>
      </body>
    </html>
  );
}
```

- [ ] **Step 11: Create placeholder `app/page.tsx`** (replaced by real sections in Tasks 3–5):

```tsx
export default function Home() {
  return <main />;
}
```

- [ ] **Step 12: Create `public/.nojekyll`** (empty file):

```bash
touch public/.nojekyll
```

- [ ] **Step 13: Install and build**

```bash
npm install
npm run build
test -f out/index.html && echo ENTRY-OK
test -f out/CNAME && test -f out/.nojekyll && echo PUBLIC-OK
grep -o 'gtag/js?id=G-YVPGP24V3P' out/index.html
```

Expected: build succeeds (typecheck included), `ENTRY-OK`, `PUBLIC-OK`, GA snippet present. `package-lock.json` will change — commit it.

- [ ] **Step 14: Commit**

```bash
git add -A
git commit -m "Replace Vite scaffold with Next.js static export + Organic design system"
```

---

### Task 2: Nav, Footer, scroll spy

**Files:**
- Create: `components/Nav.tsx`, `components/Footer.tsx`, `hooks/useScrollSpy.ts`
- Modify: `app/layout.tsx`

**Interfaces:**
- Consumes: CSS classes from Task 1 (`.site-nav`, `.nav-brand`, `.nav-links`, `.nav-menu-btn`, `.nav-drawer`, `.btn`, `.btn-primary`, `.site-footer`, `.footer-brand`, `.footer-meta`, `.footer-links`).
- Produces: `Nav` and `Footer` default exports rendered by the root layout on every page; `useScrollSpy(enabled?: boolean): string` returning the active home-section id.

- [ ] **Step 1: Create `hooks/useScrollSpy.ts`**:

```ts
'use client';

import { useEffect, useState } from 'react';

const sections = ['plans', 'history', 'amenities', 'neighborhood', 'schedule', 'contact'];

export default function useScrollSpy(enabled: boolean = true) {
  const [active, setActive] = useState('');

  useEffect(() => {
    if (!enabled) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: '-40% 0px -40% 0px' },
    );
    for (const id of sections) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [enabled]);

  return active;
}
```

- [ ] **Step 2: Create `components/Nav.tsx`**:

```tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import useScrollSpy from '@/hooks/useScrollSpy';

export default function Nav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const onHome = pathname === '/';
  const active = useScrollSpy(onHome);
  const onCam = pathname.startsWith('/ohio-feeder-ramp-cam');

  const links = [
    { href: '/#plans', label: 'Residences', current: onHome && active === 'plans' },
    { href: '/#history', label: 'History', current: onHome && active === 'history' },
    { href: '/#amenities', label: 'Amenities', current: onHome && active === 'amenities' },
    { href: '/#neighborhood', label: 'Neighborhood', current: onHome && active === 'neighborhood' },
    { href: '/ohio-feeder-ramp-cam/', label: 'Traffic Cam', current: onCam },
    { href: '/#contact', label: 'Contact', current: onHome && active === 'contact' },
  ];

  const close = () => setOpen(false);

  return (
    <>
      <nav className="site-nav">
        <Link href="/" className="nav-brand">Birken Lofts</Link>
        <div className="nav-links">
          {links.map((l) => (
            <Link key={l.label} href={l.href} aria-current={l.current ? 'page' : undefined}>
              {l.label}
            </Link>
          ))}
          <Link className="btn btn-primary" href="/#contact">Contact us</Link>
        </div>
        <button
          className="nav-menu-btn"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          {open ? <X size={24} strokeWidth={2.75} /> : <Menu size={24} strokeWidth={2.75} />}
        </button>
      </nav>
      {open && (
        <div className="nav-drawer">
          {links.map((l) => (
            <Link key={l.label} href={l.href} onClick={close} aria-current={l.current ? 'page' : undefined}>
              {l.label}
            </Link>
          ))}
          <Link className="btn btn-primary" href="/#contact" onClick={close}>Contact us</Link>
        </div>
      )}
    </>
  );
}
```

- [ ] **Step 3: Create `components/Footer.tsx`**:

```tsx
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div>
        <div className="footer-brand">Birken Lofts</div>
        <div className="footer-meta">
          S. Birkenstein &amp; Sons Building · Built 1905
          <br />
          401 W. Ontario Street, Chicago, IL 60654
        </div>
      </div>
      <div className="footer-links">
        <Link href="/#plans">Residences</Link>
        <Link href="/#history">History</Link>
        <Link href="/ohio-feeder-ramp-cam/">Traffic Cam</Link>
        <Link href="/#contact">Contact</Link>
      </div>
    </footer>
  );
}
```

- [ ] **Step 4: Wire into `app/layout.tsx`** — add the two imports and wrap children:

```tsx
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
```

and change the body to:

```tsx
      <body>
        <Nav />
        {children}
        <Footer />
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-YVPGP24V3P" strategy="afterInteractive" />
        <Script id="ga" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-YVPGP24V3P');
        `}</Script>
      </body>
```

- [ ] **Step 5: Build and verify**

```bash
npm run build
grep -c 'Traffic Cam' out/index.html
grep -o 'href="/ohio-feeder-ramp-cam/"' out/index.html | head -1
grep -o 'class="site-nav"' out/index.html
grep -o 'class="site-footer"' out/index.html
grep -c 'Gallery\|Blog\|Resident Portal' out/index.html || echo OMITTED-OK
```

Expected: build passes; Traffic Cam appears (nav + footer); nav/footer classes server-rendered; final grep finds nothing → `OMITTED-OK`.

- [ ] **Step 6: Commit**

```bash
git add components hooks app/layout.tsx
git commit -m "Add fixed Organic nav, footer, and scroll spy"
```

---

### Task 3: Home page static sections (Hero → Amenities) + metadata + JSON-LD

**Files:**
- Create: `components/ImageSlot.tsx`, `components/home/Hero.tsx`, `components/home/StatsBand.tsx`, `components/home/FloorPlans.tsx`, `components/home/HistoryBand.tsx`, `components/home/Amenities.tsx`
- Modify: `app/page.tsx` (full replacement)

**Interfaces:**
- Consumes: Task 1 CSS classes; `next/image`.
- Produces: `ImageSlot` component (`{ src?: string; alt: string; label: string }` — renders a washed cover `next/image` with `fill` when `src` given, else a labeled placeholder; parent must be `position: relative` with a set height — `.hero-blob`, `.plan-media`, `.history-photo` already are); section components rendered by `app/page.tsx`, which Tasks 4–5 will extend by inserting `<Neighborhood />` after `<Amenities />` and `<Schedule />` + `<Contact />` after that.

- [ ] **Step 1: Create `components/ImageSlot.tsx`**:

```tsx
import Image from 'next/image';

interface ImageSlotProps {
  /** Omit src to render a labeled placeholder slot (no photography exists yet). */
  src?: string;
  alt: string;
  label: string;
}

export default function ImageSlot({ src, alt, label }: ImageSlotProps) {
  if (!src) {
    return (
      <div className="img-slot" role="img" aria-label={alt}>
        {label}
      </div>
    );
  }
  return <Image src={src} alt={alt} fill className="img-cover washed" sizes="100vw" />;
}
```

- [ ] **Step 2: Create `components/home/Hero.tsx`**:

```tsx
import ImageSlot from '@/components/ImageSlot';

export default function Hero() {
  return (
    <header className="hero container">
      <div>
        <span className="tag tag-accent-2">401 W. Ontario Street · River North, Chicago</span>
        <h1>Historic timber lofts in the heart of River North</h1>
        <p className="hero-lede">
          Fifty-seven residences inside the 1905 S. Birkenstein &amp; Sons Building — original
          brick and heavy timber, a block from the Brown Line, steps from the river.
        </p>
        <div className="hero-ctas">
          <a className="btn btn-primary" href="#plans">View floor plans</a>
          <a className="btn btn-secondary" href="#contact">Contact us</a>
        </div>
      </div>
      <div className="hero-blob">
        <ImageSlot
          src="/images/elevations/401-W-Ontario-No-Signs-1920w.webp"
          alt="Birken Lofts building exterior — north facade"
          label="Building exterior — north facade"
        />
      </div>
    </header>
  );
}
```

- [ ] **Step 3: Create `components/home/StatsBand.tsx`**:

```tsx
const stats = [
  { figure: '1905', label: 'Built for S. Birkenstein & Sons' },
  { figure: '57', label: 'Loft residences' },
  { figure: '4', label: 'Stories of brick & heavy timber' },
  { figure: '0.2 mi', label: 'To the Chicago River' },
];

export default function StatsBand() {
  return (
    <section className="stats-band" aria-label="Building facts">
      {stats.map((s) => (
        <div key={s.label}>
          <div className="stat-figure">{s.figure}</div>
          <div className="stat-label">{s.label}</div>
        </div>
      ))}
    </section>
  );
}
```

- [ ] **Step 4: Create `components/home/FloorPlans.tsx`**:

```tsx
import ImageSlot from '@/components/ImageSlot';

const plans = [
  { title: 'Studio', body: '550–700 sq ft · oversized windows · in-unit laundry', slot: 'Studio interior' },
  { title: 'One bedroom', body: '750–1,000 sq ft · exposed brick · walk-in closet', slot: 'One-bedroom interior' },
  { title: 'Two bedroom', body: '1,100–1,400 sq ft · corner exposures · original timber posts', slot: 'Two-bedroom interior' },
];

export default function FloorPlans() {
  return (
    <section id="plans" className="section container">
      <h2>Floor plans</h2>
      <p className="section-intro">
        Studios to two-bedrooms, no two exactly alike. Original posts and beams in every plan.
      </p>
      <div className="cards-3">
        {plans.map((p) => (
          <div key={p.title} className="card elev-sm plan-card">
            <div className="plan-media">
              <ImageSlot alt={p.slot} label={p.slot} />
            </div>
            <span className="tag tag-accent-2" style={{ alignSelf: 'flex-start' }}>Interest list open</span>
            <div className="card-title">{p.title}</div>
            <div className="card-body">{p.body}</div>
            <a className="btn btn-secondary" href="#contact" style={{ alignSelf: 'flex-start' }}>Inquire</a>
          </div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Create `components/home/HistoryBand.tsx`** (no "Read the building's story" link — omitted until the History page exists):

```tsx
import ImageSlot from '@/components/ImageSlot';

export default function HistoryBand() {
  return (
    <section id="history" className="container">
      <div className="history-band">
        <div>
          <span className="tag tag-accent">Since 1905</span>
          <h2>The House of Birkenstein</h2>
          <p>
            Built for a family scrap-trade firm at the height of Smokey Hollow&rsquo;s industrial
            boom, 401 W. Ontario spent a century as warehouse and workshop before becoming the
            lofts you see today. The posts, beams and brick are all original.
          </p>
        </div>
        <div className="history-photo">
          <ImageSlot
            src="/images/elevations/401-W-Ontario-No-Signs-Black-White-800w.webp"
            alt="The S. Birkenstein & Sons Building"
            label="Archival photo or 1916 advertisement"
          />
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 6: Create `components/home/Amenities.tsx`**:

```tsx
import { Check } from 'lucide-react';

const amenities = [
  'Exposed brick & heavy timber',
  'Oversized windows',
  'In-unit laundry',
  'Fitness center',
  'Garage parking',
  'Pet friendly',
];

export default function Amenities() {
  return (
    <section id="amenities" className="section container">
      <h2>Amenities</h2>
      <div className="amenities-grid">
        {amenities.map((a) => (
          <div key={a} className="amenity">
            <span className="amenity-icon">
              <Check size={18} strokeWidth={2.75} />
            </span>
            <span>{a}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 7: Replace `app/page.tsx`** with the composed page, metadata, and JSON-LD:

```tsx
import type { Metadata } from 'next';
import Hero from '@/components/home/Hero';
import StatsBand from '@/components/home/StatsBand';
import FloorPlans from '@/components/home/FloorPlans';
import HistoryBand from '@/components/home/HistoryBand';
import Amenities from '@/components/home/Amenities';

export const metadata: Metadata = {
  title: 'Birken Lofts | Historic Loft Living in River North',
  description:
    '57 residences within the historic 1905 S. Birkenstein & Sons Building in River North, Chicago. Construction begins October 2026.',
  alternates: { canonical: 'https://birkenlofts.com' },
  openGraph: {
    title: 'Birken Lofts | Historic Loft Living in River North',
    description:
      '57 residences within the historic 1905 S. Birkenstein & Sons Building in River North, Chicago.',
    type: 'website',
    url: 'https://birkenlofts.com',
    images: ['https://birkenlofts.com/images/elevations/401-W-Ontario-No-Signs-1024w.webp'],
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ApartmentComplex',
  name: 'Birken Lofts',
  description:
    '57 residences within the historic 1905 S. Birkenstein & Sons Building in River North, Chicago. A thoughtful adaptive reuse preserving exposed heavy timber beams, original masonry walls, and distinctive arched window openings.',
  url: 'https://birkenlofts.com',
  image: 'https://birkenlofts.com/images/elevations/401-W-Ontario-No-Signs-1024w.webp',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '401 W. Ontario Street',
    addressLocality: 'Chicago',
    addressRegion: 'IL',
    postalCode: '60654',
    addressCountry: 'US',
  },
  geo: { '@type': 'GeoCoordinates', latitude: 41.8935, longitude: -87.6388 },
  numberOfAvailableAccommodation: 57,
  amenityFeature: [
    { '@type': 'LocationFeatureSpecification', name: 'Exposed Brick & Heavy Timber' },
    { '@type': 'LocationFeatureSpecification', name: 'Oversized Windows' },
    { '@type': 'LocationFeatureSpecification', name: 'In-Unit Laundry' },
    { '@type': 'LocationFeatureSpecification', name: 'Fitness Center' },
    { '@type': 'LocationFeatureSpecification', name: 'Garage Parking' },
    { '@type': 'LocationFeatureSpecification', name: 'Pet Friendly' },
  ],
  developer: {
    '@type': 'Organization',
    name: 'Monroe Residential Partners',
    url: 'https://monroeresidential.com',
  },
};

export default function Home() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Hero />
      <StatsBand />
      <FloorPlans />
      <HistoryBand />
      <Amenities />
    </main>
  );
}
```

- [ ] **Step 8: Build and verify**

```bash
npm run build
grep -o '<title>Birken Lofts | Historic Loft Living in River North</title>' out/index.html
grep -o '"@type":"ApartmentComplex"' out/index.html
grep -c 'Historic timber lofts in the heart of River North' out/index.html
grep -o 'Interest list open' out/index.html | head -1
grep -o 'The House of Birkenstein' out/index.html
grep -o 'rel="canonical" href="https://birkenlofts.com/"' out/index.html || grep -o 'rel="canonical" href="https://birkenlofts.com"' out/index.html
```

Expected: build passes; every grep prints a match (h1 count ≥ 1).

- [ ] **Step 9: Commit**

```bash
git add components app/page.tsx
git commit -m "Add Organic home sections: hero, stats, floor plans, history, amenities"
```

---

### Task 4: Interactive neighborhood map (Leaflet, Organic theme)

**Files:**
- Create: `components/map/NeighborhoodMap.tsx`, `components/home/Neighborhood.tsx`
- Modify: `app/page.tsx` (insert `<Neighborhood />` after `<Amenities />`)

**Interfaces:**
- Consumes: `data/location.ts` exports `categories: { id: string; label: string; color: string }[]`, `pois: Poi[]` (`Poi = { name: string; cat: string; ll: [number, number]; walk: number; blurb: string }`), `HOME: [number, number]` (verify exact shapes by reading `data/location.ts` first; adjust nothing in it). Task 1 CSS (`.map-*`, `.place-*`, `.addr-*`, `.bk-pin`, `.bk-home`, `.nbhd-*`, Leaflet overrides).
- Produces: `<Neighborhood />` section with id `neighborhood`.

- [ ] **Step 1: Create `components/map/NeighborhoodMap.tsx`** — a port of the old `Location.tsx` map (git history: `src/components/sections/Location.tsx`) with light tiles and Organic popups:

```tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { categories, pois, HOME, type Poi } from '@/data/location';

const colorOf = (catId: string) => categories.find((c) => c.id === catId)?.color ?? '#c67139';
const allOn = () => Object.fromEntries(categories.map((c) => [c.id, true]));

export default function NeighborhoodMap() {
  const mapEl = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ poi: Poi; marker: L.Marker }[]>([]);
  const [active, setActive] = useState<Record<string, boolean>>(allOn);

  // Initialize the map once (cleaned up fully so StrictMode's double-mount is safe).
  useEffect(() => {
    if (!mapEl.current) return;
    const map = L.map(mapEl.current, { zoomControl: false, scrollWheelZoom: false }).setView(HOME, 15);
    mapRef.current = map;
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap, © CARTO',
      subdomains: 'abcd',
      maxZoom: 20,
    }).addTo(map);

    // Gate scroll-wheel zoom behind a click so the map doesn't hijack page scroll.
    map.on('click', () => map.scrollWheelZoom.enable());
    map.on('mouseout', () => map.scrollWheelZoom.disable());

    const homeIcon = L.divIcon({
      className: '',
      html: '<div class="bk-home">BL</div>',
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    });
    L.marker(HOME, { icon: homeIcon, zIndexOffset: 1000 })
      .addTo(map)
      .bindPopup(
        `<b style="font-family:var(--font-heading);font-weight:400;font-size:17px">Birken Lofts</b><br><span style="color:var(--color-neutral-600);font-size:12px">401 W. Ontario Street · River North</span>`,
      );

    markersRef.current = pois.map((poi) => {
      const color = colorOf(poi.cat);
      const icon = L.divIcon({
        className: '',
        html: `<div class="bk-pin" style="background:${color}"></div>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });
      const marker = L.marker(poi.ll, { icon }).bindPopup(
        `<b style="font-size:14px">${poi.name}</b><br><span style="color:${color};font:600 11px var(--font-body);letter-spacing:.08em;text-transform:uppercase">${poi.walk} min walk</span><br><span style="color:var(--color-neutral-600);font-size:12px">${poi.blurb}</span>`,
      );
      return { poi, marker };
    });

    setTimeout(() => map.invalidateSize(), 200);

    return () => {
      map.remove();
      mapRef.current = null;
      markersRef.current = [];
    };
  }, []);

  // Add/remove pins as category filters change (also runs on mount → initial render).
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    markersRef.current.forEach(({ poi, marker }) => {
      const on = active[poi.cat];
      const has = map.hasLayer(marker);
      if (on && !has) marker.addTo(map);
      else if (!on && has) map.removeLayer(marker);
    });
  }, [active]);

  const toggle = (id: string) => setActive((s) => ({ ...s, [id]: !s[id] }));

  const selectPlace = (poi: Poi) => {
    const map = mapRef.current;
    if (!map) return;
    map.flyTo(poi.ll, 17, { duration: 0.8 });
    const found = markersRef.current.find((m) => m.poi === poi);
    if (found) {
      if (!map.hasLayer(found.marker)) found.marker.addTo(map);
      setTimeout(() => found.marker.openPopup(), 650);
    }
  };

  const visiblePois = pois.filter((p) => active[p.cat]);

  return (
    <div className="map-frame">
      <div className="map-panel">
        <div className="map-filter-head">
          <div className="map-filter-label">Explore by</div>
          <div className="map-chips">
            <button className="map-chip" onClick={() => setActive(allOn())}>All</button>
            {categories.map((c) => {
              const on = active[c.id];
              return (
                <button
                  key={c.id}
                  className="map-chip"
                  onClick={() => toggle(c.id)}
                  style={{
                    borderColor: on ? c.color : undefined,
                    background: on ? `${c.color}26` : undefined,
                    color: on ? 'var(--color-text)' : undefined,
                  }}
                >
                  <span className="chip-dot" style={{ background: c.color }} />
                  {c.label}
                </button>
              );
            })}
          </div>
        </div>
        <div className="place-list">
          {visiblePois.map((poi) => (
            <button key={poi.name} className="place-item" onClick={() => selectPlace(poi)}>
              <span className="chip-dot" style={{ background: colorOf(poi.cat), marginTop: 6 }} />
              <span style={{ flex: 1, minWidth: 0 }}>
                <span className="place-head">
                  <span className="place-name">{poi.name}</span>
                  <span className="place-walk">{poi.walk} min</span>
                </span>
                <span className="place-blurb" style={{ display: 'block' }}>{poi.blurb}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
      <div className="map-canvas">
        <div ref={mapEl} className="map-target" />
        <div className="map-address">
          <div className="addr-name">
            <span className="addr-dot" />
            Birken Lofts
          </div>
          401 W. Ontario Street
          <br />
          Chicago, IL 60654
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create `components/home/Neighborhood.tsx`** (client component — `ssr: false` dynamic imports must live in client components):

```tsx
'use client';

import dynamic from 'next/dynamic';

const NeighborhoodMap = dynamic(() => import('@/components/map/NeighborhoodMap'), {
  ssr: false,
  loading: () => <div className="map-frame" style={{ minHeight: 520 }} aria-hidden />,
});

const cards = [
  { kicker: 'Eat & drink', body: "River North's restaurant row is out the front door." },
  { kicker: 'Transit', body: 'Brown & Purple Lines at Chicago; 90/94 on-ramp one block south.' },
  { kicker: 'Outside', body: 'The Riverwalk, Ward Park and the lakefront trail, minutes away.' },
];

export default function Neighborhood() {
  return (
    <section id="neighborhood" className="section container">
      <h2>River North</h2>
      <p className="nbhd-intro">
        Galleries, the Riverwalk, the Merchandise Mart and half the city&rsquo;s best restaurants
        — all within a ten-minute walk. The Brown Line at Chicago Ave. puts the Loop six minutes
        away.
      </p>
      <NeighborhoodMap />
      <div className="nbhd-cards">
        {cards.map((c) => (
          <div key={c.kicker} className="card">
            <div className="card-kicker">{c.kicker}</div>
            <div className="card-body">{c.body}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Insert into `app/page.tsx`** — add the import and render `<Neighborhood />` between `<Amenities />` and the closing `</main>`:

```tsx
import Neighborhood from '@/components/home/Neighborhood';
```

```tsx
      <Amenities />
      <Neighborhood />
    </main>
```

- [ ] **Step 4: Build and verify**

```bash
npm run build
grep -o 'id="neighborhood"' out/index.html
grep -o 'restaurant row is out the front door' out/index.html
grep -c 'basemaps.cartocdn.com' out/index.html || echo CLIENT-ONLY-OK
```

Expected: build passes (no `window is not defined` — the map is client-only); the section and cards are server-rendered; the tile URL is NOT in the HTML (`CLIENT-ONLY-OK`) because Leaflet renders only in the browser.

- [ ] **Step 5: Commit**

```bash
git add components app/page.tsx
git commit -m "Port interactive Leaflet neighborhood map with Organic theme"
```

---

### Task 5: Construction schedule timeline + contact form

**Files:**
- Create: `components/home/Schedule.tsx`, `components/home/Contact.tsx`
- Modify: `app/page.tsx` (insert `<Schedule />` and `<Contact />` after `<Neighborhood />`)

**Interfaces:**
- Consumes: `data/timeline.ts` exports `milestones: Milestone[]` (`{ label: string; title: string; description: string; state: 'complete' | 'next' | 'upcoming' }` — `label` is e.g. `"Oct 2026 · Next"`), type `MilestoneState`; Task 1 CSS (`.timeline`, `.tl-*`, `.contact-*`, `.form-*`, `.field`, `.input`, `.tag*`).
- Produces: sections `schedule` and `contact` completing the home page.

- [ ] **Step 1: Create `components/home/Schedule.tsx`**:

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

const ACCENT = '#c67139'; /* --color-accent */
const NEUTRAL = '#dcd3c4'; /* --color-neutral-300 */

// Connector leading into the NEXT milestone, colored by that milestone's state.
function connectorBackground(nextState: MilestoneState): string {
  if (nextState === 'complete') return ACCENT;
  if (nextState === 'next')
    return `linear-gradient(90deg,${ACCENT} 0%,${ACCENT} 60%,${NEUTRAL} 60%,${NEUTRAL} 100%)`;
  return NEUTRAL;
}

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
                {next && (
                  <div className="tl-connector" style={{ background: connectorBackground(next.state) }} />
                )}
                <span className={`tl-dot ${dotCls[ms.state]}`} />
              </div>
              <span className={`tag ${tagFor[ms.state].cls}`}>{tagFor[ms.state].text}</span>
              <div className="tl-date">{date}</div>
              <h3 className="tl-title">{ms.title}</h3>
              <p className="tl-body">{ms.description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Create `components/home/Contact.tsx`** (client; address only, no email; real error state):

```tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';

interface FormData {
  name: string;
  email: string;
  phone: string;
  interest: string;
  message: string;
}

export default function Contact() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>();
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const onSubmit = async (data: FormData) => {
    try {
      const res = await fetch('https://formspree.io/f/xqeyrene', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data),
      });
      setStatus(res.ok ? 'success' : 'error');
    } catch {
      setStatus('error');
    }
  };

  return (
    <section id="contact" className="container">
      <div className="contact-band">
        <div>
          <h2>Contact us</h2>
          <p className="contact-blurb">
            Interested in Birken Lofts? Tell us a bit about what you&rsquo;re looking for and
            we&rsquo;ll be in touch within a business day.
          </p>
          <p className="contact-address">
            401 W. Ontario Street
            <br />
            Chicago, IL 60654
          </p>
        </div>
        {status === 'success' ? (
          <p className="form-success">
            Thank you — your message is on its way. We&rsquo;ll be in touch within a business day.
          </p>
        ) : (
          <form className="contact-form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="field">
              <label htmlFor="contact-name">Name</label>
              <input id="contact-name" className="input" type="text" placeholder="Your name" {...register('name', { required: true })} />
            </div>
            <div className="field">
              <label htmlFor="contact-email">Email</label>
              <input id="contact-email" className="input" type="email" placeholder="you@email.com" {...register('email', { required: true })} />
            </div>
            <div className="field">
              <label htmlFor="contact-phone">Phone</label>
              <input id="contact-phone" className="input" type="tel" placeholder="(312) 555-0100" {...register('phone')} />
            </div>
            <div className="field">
              <label htmlFor="contact-interest">Interested in</label>
              <input id="contact-interest" className="input" type="text" placeholder="e.g. One bedroom" {...register('interest')} />
            </div>
            <div className="field full">
              <label htmlFor="contact-message">Message</label>
              <textarea id="contact-message" className="input" placeholder="Your message" {...register('message')} />
            </div>
            {(errors.name || errors.email) && (
              <p className="form-error">Please add your name and email so we can reach you.</p>
            )}
            {status === 'error' && (
              <p className="form-error">
                Something went wrong sending your message — please try again in a moment.
              </p>
            )}
            <button className="btn btn-primary" type="submit" disabled={isSubmitting} style={{ justifySelf: 'start' }}>
              {isSubmitting ? 'Sending…' : 'Send message'}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Insert into `app/page.tsx`** — add imports and render after `<Neighborhood />`:

```tsx
import Schedule from '@/components/home/Schedule';
import Contact from '@/components/home/Contact';
```

```tsx
      <Neighborhood />
      <Schedule />
      <Contact />
    </main>
```

- [ ] **Step 4: Build and verify**

```bash
npm run build
grep -o 'id="schedule"' out/index.html
grep -o 'Construction Begins' out/index.html
grep -o 'First Deliveries' out/index.html
grep -o 'id="contact"' out/index.html
grep -c 'leasing@birkenlofts.com' out/index.html || echo NO-EMAIL-OK
grep -o 'Oct 2026' out/index.html | head -1
```

Expected: build passes; all four milestones server-rendered with dates; contact section present; NO email address (`NO-EMAIL-OK`).

- [ ] **Step 5: Commit**

```bash
git add components app/page.tsx
git commit -m "Add horizontal construction timeline and Organic contact form"
```

---

### Task 6: Traffic cam page

**Files:**
- Create: `app/ohio-feeder-ramp-cam/page.tsx`

**Interfaces:**
- Consumes: Task 1 CSS (`.cam-*`, `.faq-*`, `.tag`); nav/footer come from the root layout automatically.
- Produces: static page at `out/ohio-feeder-ramp-cam/index.html` — same URL as the pre-redesign site.

- [ ] **Step 1: Create `app/ohio-feeder-ramp-cam/page.tsx`**:

```tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ohio Street Feeder Ramp Live Cam — Chicago I-90/94 Traffic Camera | Birken Lofts',
  description:
    'Live 24/7 traffic camera view of the Ohio Street feeder ramp connecting the Kennedy Expressway (I-90/94) to downtown Chicago. Streamed from River North at 401 W. Ontario Street.',
  alternates: { canonical: 'https://birkenlofts.com/ohio-feeder-ramp-cam/' },
  openGraph: {
    title: 'Ohio Street Feeder Ramp Live Cam — Chicago I-90/94 Traffic Camera',
    description:
      'Live 24/7 traffic camera view of the Ohio Street feeder ramp connecting the Kennedy Expressway (I-90/94) to downtown Chicago.',
    type: 'video.other',
    url: 'https://birkenlofts.com/ohio-feeder-ramp-cam/',
    images: ['https://i.ytimg.com/vi/DdyWM2B-FYQ/maxresdefault.jpg'],
    videos: ['https://www.youtube-nocookie.com/embed/DdyWM2B-FYQ'],
  },
};

const faqs = [
  {
    q: 'Is this traffic camera live?',
    a: 'Yes. The camera streams 24/7 via YouTube Live. The stream may occasionally restart for maintenance; if it appears offline, check back in a few minutes.',
  },
  {
    q: 'What does this camera show?',
    a: 'The Ohio Street feeder ramp, the elevated roadway that carries traffic between the Kennedy Expressway (I-90/94) and downtown Chicago through the River North neighborhood.',
  },
  {
    q: 'Where is the camera located?',
    a: "The camera streams from near 401 W. Ontario Street in Chicago's River North neighborhood, the site of Birken Lofts, overlooking the Ohio and Ontario Street feeder corridor.",
  },
];

const videoJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'VideoObject',
  name: 'Ohio Street Feeder Ramp Live Cam — Chicago I-90/94 Traffic Camera',
  description:
    'Live 24/7 streaming traffic camera showing the Ohio Street feeder ramp, which carries traffic between the Kennedy Expressway (I-90/94) and downtown Chicago through the River North neighborhood.',
  thumbnailUrl: 'https://i.ytimg.com/vi/DdyWM2B-FYQ/maxresdefault.jpg',
  uploadDate: '2026-07-14',
  embedUrl: 'https://www.youtube-nocookie.com/embed/DdyWM2B-FYQ',
  contentUrl: 'https://www.youtube.com/live/DdyWM2B-FYQ',
  publication: {
    '@type': 'BroadcastEvent',
    isLiveBroadcast: true,
    startDate: '2026-07-14T00:00:00-05:00',
  },
  publisher: { '@type': 'Organization', name: 'Birken Lofts', url: 'https://birkenlofts.com' },
  contentLocation: {
    '@type': 'Place',
    name: 'Ohio Street Feeder Ramp, River North, Chicago',
    geo: { '@type': 'GeoCoordinates', latitude: 41.8935, longitude: -87.6388 },
  },
};

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
};

export default function TrafficCamPage() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(videoJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <header className="cam-header container">
        <span className="tag tag-accent-2">Live · 24/7</span>
        <h1>Ohio Feeder Ramp Cam</h1>
      </header>
      <div className="container">
        <div className="cam-player">
          <iframe
            src="https://www.youtube-nocookie.com/embed/DdyWM2B-FYQ?autoplay=1&mute=1"
            title="Ohio Feeder Ramp live stream"
            allow="autoplay; encrypted-media; picture-in-picture"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </div>
      </div>
      <section className="cam-notes container">
        <p className="cam-note-1">
          Live view of the Ohio Street feeder ramp to the Kennedy Expressway, looking west from
          the south elevation of the S. Birkenstein &amp; Sons Building.
        </p>
        <p className="cam-note-2">The camera streams 24/7. Refresh the page if the stream stalls.</p>
        <p className="cam-note-3">
          Stream provided for neighborhood traffic awareness. Footage is not recorded.
        </p>
      </section>
      <section className="cam-faq container">
        <h2>Frequently asked questions</h2>
        {faqs.map((f) => (
          <div key={f.q} className="faq-item">
            <h3 className="faq-q">{f.q}</h3>
            <p className="faq-a">{f.a}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
```

- [ ] **Step 2: Build and verify**

```bash
npm run build
test -f out/ohio-feeder-ramp-cam/index.html && echo CAM-OK
grep -o '"isLiveBroadcast":true' out/ohio-feeder-ramp-cam/index.html
grep -o '"@type":"FAQPage"' out/ohio-feeder-ramp-cam/index.html
grep -o 'youtube-nocookie.com/embed/DdyWM2B-FYQ' out/ohio-feeder-ramp-cam/index.html | head -1
grep -o 'rel="canonical" href="https://birkenlofts.com/ohio-feeder-ramp-cam/"' out/ohio-feeder-ramp-cam/index.html
grep -c 'Ohio Street feeder ramp' out/ohio-feeder-ramp-cam/index.html
node -e "
const html = require('fs').readFileSync('out/ohio-feeder-ramp-cam/index.html','utf8');
const blocks = [...html.matchAll(/<script type=\"application\/ld\+json\">([\s\S]*?)<\/script>/g)];
if (blocks.length !== 2) throw new Error('expected 2 JSON-LD blocks, got ' + blocks.length);
blocks.forEach(b => JSON.parse(b[1]));
console.log('JSONLD-OK');
"
```

Expected: `CAM-OK`, all greps match (copy count ≥ 3), `JSONLD-OK`.

- [ ] **Step 3: Commit**

```bash
git add app/ohio-feeder-ramp-cam
git commit -m "Rebuild traffic cam page in Organic design at existing URL"
```

---

### Task 7: Deploy workflow, crawl files, docs, final verification

**Files:**
- Modify: `.github/workflows/deploy.yml` (one line), `public/llms.txt`, `public/llms-full.txt`, `CLAUDE.md`

**Interfaces:**
- Consumes: the full built site from Tasks 1–6.
- Produces: a deployable branch; crawl files consistent with the new page copy.

- [ ] **Step 1: Update the artifact path in `.github/workflows/deploy.yml`** — change:

```yaml
      - uses: actions/upload-pages-artifact@v4
        with:
          path: dist
```

to:

```yaml
      - uses: actions/upload-pages-artifact@v4
        with:
          path: out
```

Nothing else in the workflow changes.

- [ ] **Step 2: Update `public/llms.txt`** — replace the `## Residences` section (from the `## Residences` heading up to but not including `## Features & Amenities`) with:

```markdown
## Residences

- Total units: 57
- Unit types: Studio, one-bedroom, and two-bedroom lofts
- Unit sizes: 550–1,400 square feet
- Floor plans:
  - Studio: 550–700 sq ft — oversized windows, in-unit laundry
  - One bedroom: 750–1,000 sq ft — exposed brick, walk-in closet
  - Two bedroom: 1,100–1,400 sq ft — corner exposures, original timber posts
- Availability: Interest list open

```

Then replace the `## Features & Amenities` section's bullet list (keep the heading) with:

```markdown
- Exposed brick & heavy timber (original 1905)
- Oversized windows
- In-unit laundry
- Fitness center
- Garage parking
- Pet friendly
- River North location steps from galleries, dining, and the Riverwalk
```

- [ ] **Step 3: Update `public/llms-full.txt`** — replace the `## Unit Mix` section (from the `## Unit Mix` heading up to but not including the next `##` heading) with:

```markdown
## Unit Mix

Total units: 57
Unit types: Studio, one-bedroom, and two-bedroom lofts
Size range: 550–1,400 square feet
Availability: Interest list open

### Floor Plans

#### Studio
- Size: 550–700 square feet
- Features: oversized windows, in-unit laundry

#### One bedroom
- Size: 750–1,000 square feet
- Features: exposed brick, walk-in closet

#### Two bedroom
- Size: 1,100–1,400 square feet
- Features: corner exposures, original timber posts

```

Read the file first; if an amenities section lists items that conflict with the six above (fitness center, garage parking, pet friendly), update that list to match. Leave the `## Live Traffic Camera` section untouched.

- [ ] **Step 4: Update `CLAUDE.md`** — replace the `## Commands`, `## Deploy`, `## Architecture`, `## Styling`, and `## Map (Location section)` sections to describe the new stack. Use exactly (the inner ``` fences are part of the CLAUDE.md content):

````markdown
## Commands

```bash
npm run dev      # Next.js dev server
npm run build    # next build → static export in out/ (typecheck included)
npm run lint     # next lint (eslint-config-next)
```

There is no test suite. `npm run build` is the gate — it typechecks before exporting, so a type error fails the build (and the deploy).

## Deploy

Pushing to `main` triggers `.github/workflows/deploy.yml`, which runs `npm ci && npm run build` and publishes `out/` to GitHub Pages. No manual deploy step. The site is served from the custom apex domain (`public/CNAME`); `public/.nojekyll` keeps Pages from mangling `_next/` assets.

## Architecture

Next.js 15 App Router with `output: 'export'` and `trailingSlash: true` — every route is plain static HTML. Two routes: `/` (`app/page.tsx`) and `/ohio-feeder-ramp-cam/` (`app/ohio-feeder-ramp-cam/page.tsx`). The root layout (`app/layout.tsx`) renders `Nav` + `Footer` on every page, loads fonts via `next/font` (Caprasimo headings, Figtree body), and injects the GA tag.

- Home is composed of section components under `components/home/`, each owning its section `id` (`plans`, `history`, `amenities`, `neighborhood`, `schedule`, `contact`). `Nav.tsx` links to `/#id` and `hooks/useScrollSpy.ts` observes the same ids — its `sections` array must match the section ids or nav highlighting silently breaks.
- Content data lives in `data/` (`location.ts` for the map POIs, `timeline.ts` for the construction milestones). Floor-plan and amenity copy is design-final and hardcoded in the section components (see `reference/design-2026/`).
- Per-page SEO uses Next `metadata` exports; JSON-LD blocks are inline `<script type="application/ld+json">` in the page components.

## Styling

The "Organic" design system from `reference/design-2026/styles.css` is checked in as `app/globals.css` — design tokens (`--color-*`, `--radius-*`, `--shadow-*`) and component classes (`.btn`, `.card`, `.tag`, `.input`…). **Do not restyle ad hoc: retune tokens there.** Layout/section classes translated from the design mocks live in `app/site.css`. No Tailwind. Headings use Caprasimo (400 only); body is Figtree. Buttons/inputs/tags are pills; photography gets the `.washed` filter treatment.

## Map (Neighborhood section)

`components/map/NeighborhoodMap.tsx` renders the interactive map with vanilla Leaflet in a `'use client'` component, dynamically imported with `ssr: false` from `components/home/Neighborhood.tsx` (static export never touches `window`). Two effects: one initializes the map once and fully tears it down (`map.remove()`) on cleanup so StrictMode's double-mount is safe; a second syncs pin visibility with the category filters. Pins/popups are custom `divIcon`s styled by the Leaflet block in `app/site.css` (light Carto tiles, Organic popups).
````

Also update the opening "What this is" paragraph's stack sentence from "React 19 + TypeScript + Vite, styled with Tailwind CSS v4" to "Next.js 15 (App Router, static export) + TypeScript, styled with the checked-in Organic design system CSS". Update the `## Assets` section's mention of `reference/` to note `reference/design-2026/` holds the design handoff. Leave the `## Contact form` section but change the last sentence about failure behavior to: "On network failure it shows an inline error (no fake success). Changing the recipient means swapping the Formspree form id."

- [ ] **Step 5: Full build, lint, and final verification sweep**

```bash
npm run build
npm run lint
test -f out/index.html && test -f out/ohio-feeder-ramp-cam/index.html && echo PAGES-OK
test -f out/CNAME && test -f out/.nojekyll && test -f out/robots.txt && test -f out/sitemap.xml && echo STATIC-OK
grep -o 'ohio-feeder-ramp-cam' out/sitemap.xml | head -1
grep -c 'Studio' out/llms.txt out/llms-full.txt
grep -c '564–819\|Unit 108\|Unit 111\|Unit 202' out/llms.txt out/llms-full.txt || echo OLD-UNITS-GONE
grep -o '"@type":"ApartmentComplex"' out/index.html
grep -o '"isLiveBroadcast":true' out/ohio-feeder-ramp-cam/index.html
grep -o 'path: out' .github/workflows/deploy.yml
```

Expected: build + lint pass; `PAGES-OK`, `STATIC-OK`; sitemap still lists the cam page; llms files mention Studio and no longer mention the retired unit data (`OLD-UNITS-GONE`); JSON-LD present on both pages; workflow uploads `out`.

- [ ] **Step 6: Commit**

```bash
git add .github/workflows/deploy.yml public/llms.txt public/llms-full.txt CLAUDE.md
git commit -m "Update deploy path, crawl files, and docs for Next.js reskin"
```

---

## Final verification (controller/user, after all tasks)

- [ ] `npm run dev` — interactive review by the user: fixed nav (desktop + hamburger), all home sections vs `reference/design-2026/home.dc.html`, map interactivity (filter chips, place list fly-to, popups, scroll-zoom gating), horizontal timeline, form validation/success/error, cam page, narrow-viewport stacking.
- [ ] Branch stays local until the user decides to merge (merging to `main` deploys the redesign live).
