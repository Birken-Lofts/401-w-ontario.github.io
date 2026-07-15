# Finishes Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A curated `/finishes/` page presenting the interior finish selections from `finishes.pptx`, a Finishes tab in the top nav and footer, and a teaser band on the home page after Floor plans.

**Architecture:** One new server-component route `app/finishes/page.tsx` (metadata + five sections: Kitchen, Bath, Fixtures & hardware, Corridors, Paint). Assets extracted from the pptx's `ppt/media/` into `public/images/finishes/`. New `components/home/FinishesTeaser.tsx` band on the home page. Nav/footer gain a Finishes link. Sitemap + llms files register the page.

**Tech Stack:** Next.js 15 static export, React 19, plain CSS in `app/site.css`, `next/image`, `unzip` + `sips`/`cwebp` for assets.

**Spec:** `docs/superpowers/specs/2026-07-15-finishes-page-design.md`
**Source (repo root, untracked — never commit):** `finishes.pptx`.

## Global Constraints

- Branch `finishes-page`. Gate: `npm run build` + `npm run lint` exit 0 (only the pre-existing `@next/next/no-img-element` warning at `components/ImageSlot.tsx`).
- Do not run `npm run dev`. Interactive checks serve `out/` (`python3 -m http.server 4173 -d out`), kill the server after.
- No new package.json dependencies; `package-lock.json` unchanged. (`npm i --no-save playwright` allowed for checks; likely already in node_modules.)
- `robots.txt`, CNAME, favicon, icons, existing images untouched. `sitemap.xml`/`llms*.txt` get exactly the Task 3 insertions.
- NEVER `git add -A` — `finishes.pptx` and two PDIL PDFs sit untracked at the repo root and must stay untracked. Stage files explicitly.
- Page copy below is final — transcribe verbatim (entities included). Product names/specs come from the deck; do not invent specs.
- Internal-only deck content must NOT appear anywhere: no "Option A/B", no pull alternates, no pricing notes ("3cm", "2cm"), no "Open Items", no appendix links, no "Available through".
- Use `sips -s format webp` if it works, else `cwebp -q 80` (worked in prior tasks); q90 if fine texture goes mushy.

---

### Task 1: Finishes image assets from the pptx

**Files:**
- Create in `public/images/finishes/`: `kitchen-render.webp`, `kitchen-renders-4up.webp`, `kitchen-board.webp`, `bath-board.webp`, `faucet-kitchen.webp`, `faucet-bath.webp`, `showerhead.webp`, `runner-herringbone.webp`, `runner-stripe.webp`, `pendant.webp`, `corridor-mood.webp` (11 files)

**Interfaces:**
- Consumes: `finishes.pptx` (repo root). Its media files are named by slide: `ppt/media/image-<slide>-<n>.png`.
- Produces: the 11 webp files above (exact names — Tasks 2–3 hardcode them), each ≤400 KB, long edge ≤1600px, plus a report listing each file's final pixel dimensions (Task 2 needs them).

Source-image mapping (verify each visually before converting — this is the acceptance test):
| Target | Source | Expect to see |
|---|---|---|
| kitchen-render.webp | image-1-1.png | loft kitchen concept render: taupe cabinets, dark counters, brick + timber |
| kitchen-renders-4up.webp | image-2-2.png | 2×2 collage of four kitchen render studies |
| kitchen-board.webp | image-3-1.png | styled material board: glossy tile, dark slab, knurled pull, oak plank |
| bath-board.webp | image-5-1.png | pale board: white/carrara chip on large light tile |
| faucet-kitchen.webp | image-6-1.png | chrome high-arc pulldown faucet on white |
| faucet-bath.webp | image-6-2.png | chrome low-arc bath faucet on white |
| showerhead.webp | image-6-3.png | chrome multi-function showerhead on white |
| runner-herringbone.webp | image-8-1.png | wool herringbone weave close-up |
| runner-stripe.webp | image-8-2.png | wool striped flatweave close-up |
| pendant.webp | image-9-2.png | black industrial barn pendant on white |
| corridor-mood.webp | image-9-1.png | moody corridor photo: brick, timber ceiling, pendants, concrete bench |

Do NOT convert image-4-*, image-7-*, image-11-1 (internal: pull alternates, lever options, duplicate).

- [ ] **Step 1: Extract and inspect**

```bash
TMP=$(mktemp -d)
unzip -q finishes.pptx -d "$TMP" 'ppt/media/*'
ls "$TMP/ppt/media/"
```

View (Read tool) each source PNG in the mapping table and confirm it matches "Expect to see". If a mapping looks wrong (e.g. numbering shifted), STOP and report BLOCKED with what you saw.

- [ ] **Step 2: Convert**

For each mapped image: downscale long edge to ≤1600px (`sips --resampleHeightWidthMax 1600 <src> --out <tmp>.png` — skip if already smaller), then encode webp q80 to the target path (`cwebp -q 80 <tmp>.png -o public/images/finishes/<name>.webp`). View each final webp: legible, textures not mushy (runner weaves and board labels are the risk — bump to q90 if needed).

- [ ] **Step 3: Record dimensions, verify, commit**

```bash
for f in public/images/finishes/*.webp; do sips -g pixelWidth -g pixelHeight "$f"; done
ls -la public/images/finishes/    # 11 files, each ≤400 KB
git status --porcelain            # ONLY the 11 new files; pptx/PDFs stay untracked
git add public/images/finishes
git commit -m "Add finish-selection image assets from the options deck"
```

Report each file's width×height.

---

### Task 2: The finishes page and its styles

**Files:**
- Create: `app/finishes/page.tsx`
- Modify: `app/site.css` (append one block after the `— history page —` block, before the responsive section)

**Interfaces:**
- Consumes: the 11 image paths from Task 1 and their pixel dimensions (from Task 1's report; verify with `sips` yourself). Existing CSS: `.container`, `.tag`, `.tag-accent-2`, `.tag-neutral`, `.card`, `.card-kicker`, `.card-title`, `.card-body`, `.elev-sm`, `.btn*`, `.history-cta`, `.history-cta-btns` (reused for the CTA band), design tokens.
- Produces: static page at `out/finishes/index.html`; CSS classes `.fin-header`, `.fin-lede`, `.fin-hero`, `.fin-section`, `.fin-blurb`, `.fin-row`, `.fin-fig`, `.fin-fig-wide`, `.fin-selections`, `.fin-item`, `.fin-product`, `.fin-spec`, `.fin-cards`, `.fin-card-media`, `.fin-note`, `.fin-gallery`, `.fin-sheen`, `.fin-disclaimer`, `.fin-teaser`, `.fin-teaser-img` (teaser classes consumed by Task 3).

- [ ] **Step 1: Create `app/finishes/page.tsx`** with exactly the following — EXCEPT the `width={0} height={0}` pairs, which you must replace with each file's actual pixel dimensions from Task 1:

```tsx
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Finishes | Birken Lofts',
  description:
    'Interior finish selections for Birken Lofts: Silestone charcoal soapstone counters, warm Egger flat-panel cabinetry, satin nickel hardware, and wide-plank oak floors against original brick and heavy timber.',
  alternates: { canonical: 'https://birkenlofts.com/finishes/' },
  openGraph: {
    title: 'Finishes at Birken Lofts',
    description:
      'Charcoal stone, warm cabinetry, satin nickel — the interior finish selections for Birken Lofts.',
    type: 'website',
    url: 'https://birkenlofts.com/finishes/',
    images: ['https://birkenlofts.com/images/finishes/kitchen-render.webp'],
  },
};

interface SelectionRow {
  item: string;
  product: string;
  spec?: string;
}

const kitchenRows: SelectionRow[] = [
  { item: 'Backsplash', product: 'Daltile Artigiano — Venice Statue', spec: '3" × 6"' },
  { item: 'Countertop', product: 'Silestone — Charcoal Soapstone Eternal', spec: 'Suede finish' },
  { item: 'Cabinets', product: 'Egger — Pebble Grey', spec: 'Flat-panel; handle-less uppers' },
  { item: 'Hardware', product: 'Amwell bar pulls', spec: 'Brushed satin nickel' },
  { item: 'Floor', product: 'Evolux Whisper Woods — Sevilla Oak', spec: '9" × 60" plank' },
];

const bathRows: SelectionRow[] = [
  { item: 'Countertop', product: 'MSI — Carrara Trigato', spec: 'Polished' },
  { item: 'Cabinets', product: 'Egger — Cashmere Gray' },
  { item: 'Hardware', product: 'Amwell Lawrence pulls', spec: 'Brushed satin nickel, set vertically' },
  { item: 'Floor', product: 'Roca — Limestone Blanco', spec: '12" × 24"' },
  { item: 'Wall tile', product: 'Being finalized' },
];

const fixtures = [
  {
    kicker: 'Kitchen',
    name: 'CFG Aluma',
    body: 'One-handle high-arc pulldown faucet · polished chrome',
    img: '/images/finishes/faucet-kitchen.webp',
    alt: 'CFG Aluma high-arc pulldown kitchen faucet in polished chrome',
    width: 0,
    height: 0,
  },
  {
    kicker: 'Bath',
    name: 'CFG Ember',
    body: 'One-handle low-arc bathroom faucet · polished chrome',
    img: '/images/finishes/faucet-bath.webp',
    alt: 'CFG Ember low-arc bathroom faucet in polished chrome',
    width: 0,
    height: 0,
  },
  {
    kicker: 'Bath',
    name: 'CFG showerhead',
    body: 'Four-function eco-performance showerhead · polished chrome',
    img: '/images/finishes/showerhead.webp',
    alt: 'CFG four-function eco-performance showerhead in polished chrome',
    width: 0,
    height: 0,
  },
];

function Selections({ rows }: { rows: SelectionRow[] }) {
  return (
    <ul className="fin-selections">
      {rows.map((r) => (
        <li key={r.item}>
          <span className="fin-item">{r.item}</span>
          <span className="fin-product">{r.product}</span>
          {r.spec && <span className="fin-spec">{r.spec}</span>}
        </li>
      ))}
    </ul>
  );
}

export default function FinishesPage() {
  return (
    <main>
      <header className="fin-header container">
        <span className="tag tag-accent-2">Interior finish selections</span>
        <h1>Finishes</h1>
        <p className="fin-lede">
          Warm flat-panel cabinetry and dark stone against the building&rsquo;s original brick
          and heavy timber.
        </p>
      </header>
      <div className="container">
        <figure className="fin-hero">
          <Image
            src="/images/finishes/kitchen-render.webp"
            alt="Concept rendering of a Birken Lofts kitchen: taupe flat-panel cabinets and dark stone counters beneath original timber beams and exposed brick"
            width={0}
            height={0}
            priority
          />
          <figcaption>Concept rendering &mdash; kitchen design direction.</figcaption>
        </figure>

        <section className="fin-section">
          <span className="tag tag-accent-2">01 · Kitchen</span>
          <h2>Kitchen</h2>
          <p className="fin-blurb">
            The kitchen sets the palette: pebble-grey cabinet fronts, charcoal stone counters,
            and warm oak plank floors, sampled together against the building&rsquo;s brick.
          </p>
          <div className="fin-row">
            <Selections rows={kitchenRows} />
            <figure className="fin-fig">
              <Image
                src="/images/finishes/kitchen-board.webp"
                alt="Kitchen material board: glazed tile, charcoal stone slab, knurled satin nickel pull, and oak plank samples"
                width={0}
                height={0}
              />
              <figcaption>Kitchen material board, as sampled.</figcaption>
            </figure>
          </div>
          <figure className="fin-fig fin-fig-wide">
            <Image
              src="/images/finishes/kitchen-renders-4up.webp"
              alt="Four concept rendering studies of the kitchen cabinetry, island, and open shelving"
              width={0}
              height={0}
            />
            <figcaption>Concept renderings &mdash; cabinetry, island and shelving studies.</figcaption>
          </figure>
        </section>

        <section className="fin-section">
          <span className="tag tag-accent-2">02 · Bath</span>
          <h2>Bath</h2>
          <p className="fin-blurb">
            Calmer and lighter than the kitchen: polished Carrara-look counters over
            cashmere-gray cabinets, with pale limestone floors.
          </p>
          <div className="fin-row">
            <Selections rows={bathRows} />
            <figure className="fin-fig">
              <Image
                src="/images/finishes/bath-board.webp"
                alt="Bath material board: polished white stone chip over large-format pale limestone tile"
                width={0}
                height={0}
              />
              <figcaption>Bath material board, as sampled.</figcaption>
            </figure>
          </div>
        </section>

        <section className="fin-section">
          <span className="tag tag-accent-2">03 · Fixtures &amp; hardware</span>
          <h2>Fixtures &amp; hardware</h2>
          <p className="fin-blurb">CFG fixtures throughout, in polished chrome.</p>
          <div className="fin-cards">
            {fixtures.map((f) => (
              <div key={f.name} className="card elev-sm">
                <div className="fin-card-media">
                  <Image src={f.img} alt={f.alt} width={f.width} height={f.height} />
                </div>
                <div className="card-kicker">{f.kicker}</div>
                <div className="card-title">{f.name}</div>
                <div className="card-body">{f.body}</div>
              </div>
            ))}
          </div>
          <p className="fin-note">
            Door levers throughout in satin nickel &mdash; final selection in review.
          </p>
        </section>

        <section className="fin-section">
          <span className="tag tag-neutral">In progress</span>
          <h2>Corridors</h2>
          <p className="fin-blurb">
            The corridors keep the industrial register: woven wool runners underfoot and black
            barn pendants along the brick.
          </p>
          <div className="fin-gallery">
            <figure className="fin-fig">
              <Image
                src="/images/finishes/corridor-mood.webp"
                alt="Corridor atmosphere study: exposed brick, timber ceiling, pendants, and a concrete bench"
                width={0}
                height={0}
              />
              <figcaption>Corridor atmosphere study.</figcaption>
            </figure>
            <figure className="fin-fig">
              <Image
                src="/images/finishes/pendant.webp"
                alt="Industrial black barn pendant light"
                width={0}
                height={0}
              />
              <figcaption>Industrial barn pendant.</figcaption>
            </figure>
            <figure className="fin-fig">
              <Image
                src="/images/finishes/runner-herringbone.webp"
                alt="Woven wool runner sample in a natural and charcoal herringbone"
                width={0}
                height={0}
              />
              <figcaption>Woven wool runner &mdash; herringbone colorway.</figcaption>
            </figure>
            <figure className="fin-fig">
              <Image
                src="/images/finishes/runner-stripe.webp"
                alt="Woven wool runner sample in a natural and charcoal stripe"
                width={0}
                height={0}
              />
              <figcaption>Woven wool runner &mdash; stripe colorway.</figcaption>
            </figure>
          </div>
        </section>

        <section className="fin-section">
          <span className="tag tag-neutral">In progress</span>
          <h2>Paint</h2>
          <p className="fin-blurb">Sheens are set; colors follow with the lighting package.</p>
          <table className="fin-sheen">
            <thead>
              <tr>
                <th>Surface</th>
                <th>Sheen</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Doors, base &amp; case</td>
                <td>Semi-gloss</td>
              </tr>
              <tr>
                <td>Bathroom walls</td>
                <td>Satin</td>
              </tr>
              <tr>
                <td>Unit walls</td>
                <td>Eggshell</td>
              </tr>
              <tr>
                <td>Ceilings</td>
                <td>Flat</td>
              </tr>
            </tbody>
          </table>
        </section>

        <p className="fin-disclaimer">
          Selections shown reflect the current design direction and are subject to change.
        </p>

        <section className="history-cta">
          <p>Want these finishes under your own timber beams?</p>
          <div className="history-cta-btns">
            <Link className="btn btn-primary" href="/#contact">Join the interest list</Link>
            <Link className="btn btn-secondary" href="/#plans">View floor plans</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Append to `app/site.css`** (after the `— history page —` block, before the responsive section) exactly:

```css
/* — finishes page — */
.fin-header { padding-block: 64px 8px; }
.fin-header h1 { font-size: clamp(40px, 5vw, 58px); margin: 18px 0 16px; }
.fin-lede { font-size: 19px; line-height: 1.6; color: var(--color-neutral-700); max-width: 56ch; margin: 0; }
.fin-hero { margin: 36px 0 0; }
.fin-hero img { width: 100%; height: auto; display: block; border-radius: calc(var(--radius-lg) * 1.4); box-shadow: var(--shadow-md); }
.fin-hero figcaption, .fin-fig figcaption { font-size: 13px; line-height: 1.5; color: var(--color-neutral-600); margin-top: 10px; }
.fin-section { padding-top: 72px; }
.fin-section h2 { font-size: 32px; margin: 12px 0 8px; }
.fin-blurb { font-size: 16px; line-height: 1.65; color: var(--color-neutral-700); max-width: 56ch; margin: 0 0 28px; }
.fin-row { display: grid; grid-template-columns: 0.95fr 1.05fr; gap: 56px; align-items: start; }
.fin-fig { margin: 0; }
.fin-fig img { width: auto; max-width: 100%; height: auto; display: block; margin-inline: auto; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); background: #fff; }
.fin-fig-wide { margin-top: 28px; }
.fin-selections { list-style: none; margin: 0; padding: 0; }
.fin-selections li { display: grid; grid-template-columns: 120px 1fr; gap: 2px 18px; padding-block: 14px; border-bottom: 1px solid var(--color-divider); }
.fin-selections li:first-child { border-top: 1px solid var(--color-divider); }
.fin-item { font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--color-neutral-600); padding-top: 3px; }
.fin-product { font-size: 16px; font-weight: 600; }
.fin-spec { grid-column: 2; font-size: 13px; color: var(--color-neutral-600); }
.fin-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 28px; }
.fin-card-media { background: #fff; border-radius: var(--radius-md); height: 200px; display: grid; place-items: center; padding: 18px; margin-bottom: 4px; }
.fin-card-media img { max-width: 100%; max-height: 164px; width: auto; height: auto; }
.fin-note { font-size: 14px; color: var(--color-neutral-700); margin: 22px 0 0; }
.fin-gallery { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; }
.fin-sheen { border-collapse: collapse; min-width: min(560px, 100%); }
.fin-sheen th, .fin-sheen td { text-align: left; padding: 12px 32px 12px 0; border-bottom: 1px solid var(--color-divider); font-size: 15px; }
.fin-sheen th { font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--color-neutral-600); }
.fin-disclaimer { font-size: 13px; color: var(--color-neutral-500); margin: 56px 0 0; }
.fin-teaser {
  margin-top: 88px; background: var(--color-accent-2-100);
  border-radius: calc(var(--radius-lg) * 1.6); padding: 40px 48px;
  display: grid; grid-template-columns: 220px 1fr auto; gap: 40px; align-items: center;
}
.fin-teaser-img { position: relative; height: 150px; border-radius: var(--radius-lg); overflow: hidden; }
.fin-teaser h2 { font-size: 28px; margin: 0 0 6px; }
.fin-teaser p { margin: 0; font-size: 15px; color: var(--color-neutral-700); max-width: 44ch; }
.fin-teaser .history-link { margin-top: 0; white-space: nowrap; }
@media (max-width: 768px) {
  .fin-header { padding-block: 40px 0; }
  .fin-section { padding-top: 48px; }
  .fin-row, .fin-cards, .fin-gallery { grid-template-columns: 1fr; gap: 24px; }
  .fin-row { gap: 28px; }
  .fin-teaser { grid-template-columns: 1fr; padding: 28px; gap: 20px; }
  .fin-teaser-img { height: 180px; }
}
```

- [ ] **Step 3: Build and verify**

```bash
npm run build
npm run lint
test -f out/finishes/index.html && echo FINISHES-OK
grep -o '<title>Finishes | Birken Lofts</title>' out/finishes/index.html
grep -o 'rel="canonical" href="https://birkenlofts.com/finishes/"' out/finishes/index.html
grep -o 'Charcoal Soapstone Eternal' out/finishes/index.html | head -1
grep -o 'Being finalized' out/finishes/index.html
grep -o 'subject to change' out/finishes/index.html
grep -c 'Option A\|Option B\|alternates\|3cm\|Open Items\|Available through' out/finishes/index.html || echo NO-INTERNAL-OK
grep -o 'fetchPriority' out/finishes/index.html | head -1
```

Expected: build + lint pass; `FINISHES-OK`; all greps match; `NO-INTERNAL-OK`; hero has fetchPriority.

- [ ] **Step 4: Commit**

```bash
git add app/finishes app/site.css
git commit -m "Add finishes page with curated selections from the options deck"
```

---

### Task 3: Teaser band, nav/footer links, sitemap, llms files, final verification

**Files:**
- Create: `components/home/FinishesTeaser.tsx`
- Modify: `components/Nav.tsx`, `components/Footer.tsx`, `app/page.tsx`, `public/sitemap.xml`, `public/llms.txt`, `public/llms-full.txt`

**Interfaces:**
- Consumes: `/finishes/` route (Task 2), `.fin-teaser`/`.fin-teaser-img` CSS (Task 2), `.history-link` CSS, `/images/finishes/kitchen-render.webp` (Task 1).
- Produces: home teaser + nav/footer links + crawl-file entries.

- [ ] **Step 1: Create `components/home/FinishesTeaser.tsx`** with exactly:

```tsx
import Image from 'next/image';
import Link from 'next/link';

export default function FinishesTeaser() {
  return (
    <section className="container" aria-label="Finishes preview">
      <div className="fin-teaser">
        <div className="fin-teaser-img">
          <Image
            src="/images/finishes/kitchen-render.webp"
            alt="Concept rendering of a Birken Lofts kitchen"
            fill
            className="img-cover"
            sizes="(max-width: 768px) 100vw, 220px"
          />
        </div>
        <div>
          <h2>Finishes</h2>
          <p>
            Charcoal stone, warm cabinetry, satin nickel &mdash; see what&rsquo;s going into
            the residences.
          </p>
        </div>
        <Link className="history-link" href="/finishes/">
          Explore the finish selections &rarr;
        </Link>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: `app/page.tsx`** — add the import (with the other `components/home` imports):

```tsx
import FinishesTeaser from '@/components/home/FinishesTeaser';
```

and render `<FinishesTeaser />` immediately after `<FloorPlans />` (before `<HistoryBand />`).

- [ ] **Step 3: `components/Nav.tsx`** — add after the `const onHistory = ...` line:

```tsx
  const onFinishes = pathname.startsWith('/finishes');
```

and insert into `links` between the Residences and History entries:

```tsx
    { href: '/finishes/', label: 'Finishes', current: onFinishes },
```

- [ ] **Step 4: `components/Footer.tsx`** — insert after the Residences link:

```tsx
        <Link href="/finishes/">Finishes</Link>
```

- [ ] **Step 5: `public/sitemap.xml`** — insert between the `/history/` block and the `/ohio-feeder-ramp-cam/` block:

```xml
  <url>
    <loc>https://birkenlofts.com/finishes/</loc>
    <lastmod>2026-07-15</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
```

- [ ] **Step 6: `public/llms.txt`** — insert a new section between `## Features & Amenities` and `## Timeline`:

```markdown
## Finishes

Interior finish selections (June 2026 design direction, subject to change): kitchens with Daltile Artigiano (Venice Statue) backsplash, Silestone Charcoal Soapstone Eternal countertops in a suede finish, Egger Pebble Grey flat-panel cabinetry, Amwell brushed satin nickel pulls, and Evolux Sevilla Oak 9"×60" plank floors. Baths with MSI Carrara Trigato counters, Egger Cashmere Gray cabinets, and Roca Limestone Blanco 12"×24" floors. CFG plumbing fixtures in polished chrome. Corridor and paint selections in progress. Details: https://birkenlofts.com/finishes/

```

- [ ] **Step 7: `public/llms-full.txt`** — read the `## Features & Amenities` section, then append at its END (after `### Restoration`'s content, before `## Location & Proximity`):

```markdown
### Finish Selections

Interior finish selections (June 2026 design direction, subject to change): kitchens with Daltile Artigiano (Venice Statue) backsplash, Silestone Charcoal Soapstone Eternal countertops (suede finish), Egger Pebble Grey flat-panel cabinetry, Amwell brushed satin nickel pulls, Evolux Sevilla Oak 9"×60" plank floors. Baths with MSI Carrara Trigato counters, Egger Cashmere Gray cabinets, Roca Limestone Blanco 12"×24" floors. CFG plumbing fixtures in polished chrome throughout. Corridor (woven wool runners, industrial pendants) and paint selections in progress. Full details: https://birkenlofts.com/finishes/

```

- [ ] **Step 8: Build, greps, headless verification**

```bash
npm run build && npm run lint
grep -o 'href="/finishes/"' out/index.html | head -1
grep -o 'Explore the finish selections' out/index.html
grep -c 'Finishes' out/index.html
grep -o 'finishes/' out/sitemap.xml
grep -o 'birkenlofts.com/finishes/' out/llms.txt out/llms-full.txt
grep -o 'aria-current' out/finishes/index.html | head -1
git status --porcelain package.json package-lock.json   # expect empty
```

Then serve and run the interactive check (`python3 -m http.server 4173 -d out &`; kill after):

```js
import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' });

// Teaser band navigates
await page.click('.fin-teaser a[href="/finishes/"]');
await page.waitForURL('**/finishes/');
if (!(await page.textContent('h1')).includes('Finishes')) throw new Error('h1 wrong');

// Nav highlights Finishes here
const cur = await page.getAttribute('nav.site-nav a[href="/finishes/"]', 'aria-current');
if (cur !== 'page') throw new Error('aria-current missing on Finishes');

// All images load AFTER scrolling (images below the fold are lazy)
await page.evaluate(async () => {
  for (let y = 0; y <= document.body.scrollHeight; y += 700) {
    window.scrollTo(0, y);
    await new Promise((r) => setTimeout(r, 150));
  }
});
await page.waitForTimeout(800);
const bad = await page.evaluate(() =>
  Array.from(document.querySelectorAll('main img')).filter(i => !i.complete || i.naturalWidth === 0).length);
if (bad > 0) throw new Error(`${bad} images failed to load`);

// CTA lands on home contact section
await page.click('.history-cta a[href="/#contact"]');
await page.waitForURL('**/#contact');
await page.waitForTimeout(600);
const seen = await page.evaluate(() => {
  const el = document.getElementById('contact');
  const r = el.getBoundingClientRect();
  return r.top >= 0 && r.top < 500;
});
if (!seen) throw new Error('CTA did not land on #contact');

// Nav doesn't overflow with the 7th item at a narrow desktop width
const nav = await browser.newPage({ viewport: { width: 950, height: 800 } });
await nav.goto('http://localhost:4173/', { waitUntil: 'networkidle' });
const fits = await nav.evaluate(() => {
  const el = document.querySelector('.site-nav');
  return el.scrollWidth <= window.innerWidth + 1;
});
if (!fits) throw new Error('nav overflows at 950px');

console.log('FINISHES-NAV-OK');
await browser.close();
```

Expected: `FINISHES-NAV-OK`.

- [ ] **Step 9: Commit**

```bash
git add components/home/FinishesTeaser.tsx components/Nav.tsx components/Footer.tsx app/page.tsx public/sitemap.xml public/llms.txt public/llms-full.txt
git commit -m "Link finishes page from nav, footer, home teaser, and crawl files"
```

---

## Final verification (controller/user, after all tasks)

- [ ] Controller visual pass: screenshots of `/finishes/` (desktop + mobile) and the home teaser band before handoff.
- [ ] User reviews in the browser; merge/push is the user's call (deploys live).
