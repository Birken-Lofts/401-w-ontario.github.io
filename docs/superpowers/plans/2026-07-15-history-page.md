# "The House of Birkenstein" History Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A full-story history page at `/history/`, sourced from the PDIL narrative with historic artifact images, linked from the top nav, footer, and the home history band.

**Architecture:** One new server-component route `app/history/page.tsx` (metadata + Article JSON-LD + six prose sections with captioned figures). Assets are extracted from the PDIL photos PDF with `pdfimages` into `public/images/history/`. Navigation repoints "History" from `/#history` to `/history/`; the home band keeps its place and gains a "Read the building's story →" link. `sitemap.xml` and the llms crawl files gain the page.

**Tech Stack:** Next.js 15 static export, React 19, plain CSS in `app/site.css`, `next/image` (unoptimized, explicit width/height), `pdfimages`/`pdftoppm` + `sips` for assets.

**Spec:** `docs/superpowers/specs/2026-07-15-history-page-design.md`
**Sources (repo root, untracked — do NOT commit the PDFs):** `S. Birkenstein and Sons Building -PDIL Narrative.pdf` (facts), `S. Birkenstein and Sons Building -PDIL Photos.pdf` (images).

## Global Constraints

- Branch `reskin-organic`. Gate: `npm run build` + `npm run lint` exit 0 (only the pre-existing `@next/next/no-img-element` warning at `components/ImageSlot.tsx`).
- Do not run `npm run dev`. Interactive checks serve `out/` (`python3 -m http.server 4173 -d out`) and kill the server after.
- No new package.json dependencies; `package-lock.json` unchanged.
- `robots.txt`, `public/CNAME`, `favicon.svg`, `icons.svg`, existing images: untouched. (`sitemap.xml` and `llms*.txt` ARE modified this time, exactly as specified in Task 3.)
- Page copy below is final — transcribe verbatim (including `&rsquo;`, `&ldquo;`, `&mdash;` entities). Every historical claim in it was checked against the narrative PDF; do not reword facts.
- The two source PDFs stay untracked (repo-root PDFs are not in `.gitignore`, so never `git add -A`; stage files explicitly).

---

### Task 1: History image assets from the photos PDF

**Files:**
- Create: `public/images/history/sanborn-map-1906.webp`, `public/images/history/louis-birkenstein-1919.webp`, `public/images/history/hey-joe-ad-1916.webp`, `public/images/history/house-of-birkenstein-ad-1920.webp`, `public/images/history/timber-ceiling.webp`

**Interfaces:**
- Consumes: `S. Birkenstein and Sons Building -PDIL Photos.pdf` (19 pages). Contents by PDF page: p3 = 1906 Sanborn map ("Image 3"), p4 = Louis Birkenstein portrait ("Image 4"), p5 = 1916 "Hey Joe! Label that Car" ad ("Image 5"), p6 = 1918 Wizard Bronze ad (not used), p7 = 1920 "The House of Birkenstein" ad, p18 = photos 18–19 (photo 19, bottom = "Third floor, detail of exposed ceiling structure" — the timber-ceiling source).
- Produces: the five webp files above (exact names — Task 2 hardcodes them), each ≤ 400 KB, long edge ≤ 1600px, plus a report listing each file's final pixel dimensions (Task 2 needs them for `next/image` width/height).

This task is visual-iterative: view images with the Read tool at every step.

- [ ] **Step 1: Try native extraction with `pdfimages`**

```bash
TMP=$(mktemp -d)
pdfimages -list "S. Birkenstein and Sons Building -PDIL Photos.pdf" | head -30
pdfimages -all -f 3 -l 7 "S. Birkenstein and Sons Building -PDIL Photos.pdf" "$TMP/art"
pdfimages -all -f 18 -l 18 "S. Birkenstein and Sons Building -PDIL Photos.pdf" "$TMP/int"
ls -la "$TMP"
```

View each extracted file (Read tool) and map it to its target (Sanborn map / portrait / 1916 ad / 1920 ad; from p18 pick the ceiling-structure photo, not the office corridor). Native extraction preserves original resolution — prefer it. If a page yields multiple fragments or unusable output (masks, tiles), fall back for that image to `pdftoppm -png -r 300 -f <page> -l <page> ...` and crop the image area with `sips -c`/`--cropOffset` or pdftoppm `-x/-y/-W/-H`, iterating visually as was done for the floor-plan assets.

- [ ] **Step 2: Normalize and encode**

For each of the five images: downscale so the long edge is ≤ 1600px (`sips --resampleHeightWidthMax 1600` — skip if already smaller), encode webp:

```bash
sips -s format webp -s formatOptions 80 "$TMP/<src>.png" --out "public/images/history/<name>.webp"
```

(If a source extracted as `.jpg`, `sips` converts it the same way. If webp encoding fails, use `cwebp -q 80`; if neither works, keep `.jpg`/`.png` with the same basenames and report the substitution prominently — Task 2 must then adjust extensions.)

View each final file: legible, not over-compressed (the ads and Sanborn map have fine text — if text is mushy at webp q80, re-encode at q90).

- [ ] **Step 3: Record dimensions, verify, commit**

```bash
for f in public/images/history/*.webp; do sips -g pixelWidth -g pixelHeight "$f"; done
ls -la public/images/history/
git status --porcelain   # expect ONLY the five new files (PDFs stay untracked)
git add public/images/history
git commit -m "Add historic image assets for the House of Birkenstein page"
```

Report each file's width×height — Task 2 consumes these numbers.

---

### Task 2: The history page and its styles

**Files:**
- Create: `app/history/page.tsx`
- Modify: `app/site.css` (append one block after the `— floor-plan lightbox —` block, before the responsive section)

**Interfaces:**
- Consumes: the five image paths from Task 1 and their actual pixel dimensions (from Task 1's report; verify with `sips -g pixelWidth -g pixelHeight` yourself). Existing CSS: `.container`, `.tag`, `.tag-accent`, `.btn`, `.btn-primary`, `.btn-secondary`, design tokens.
- Produces: static page at `out/history/index.html`; CSS classes `.history-header`, `.history-lede`, `.history-row`, `.history-row.rev`, `.history-prose`, `.history-fig`, `.history-solo`, `.history-cta`, `.history-cta-btns`, `.history-link` (`.history-link` is also used by Task 3's home-band link).

- [ ] **Step 1: Create `app/history/page.tsx`** with exactly the following — EXCEPT the `width={0} height={0}` pairs on each `<Image>`, which you must replace with that file's actual pixel dimensions from Task 1:

```tsx
import type { Metadata } from 'next';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'The House of Birkenstein | Birken Lofts',
  description:
    'The story of 401 W. Ontario Street: built in 1905 for S. Birkenstein & Sons, one of Chicago’s largest scrap dealers, and home to a century of Smokey Hollow industry before becoming Birken Lofts.',
  alternates: { canonical: 'https://birkenlofts.com/history/' },
  openGraph: {
    title: 'The House of Birkenstein',
    description:
      'Built in 1905 for S. Birkenstein & Sons at the height of Smokey Hollow’s industrial boom — the story of the building that became Birken Lofts.',
    type: 'article',
    url: 'https://birkenlofts.com/history/',
    images: ['https://birkenlofts.com/images/elevations/401-W-Ontario-No-Signs-1024w.webp'],
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'The House of Birkenstein',
  description:
    'The history of the S. Birkenstein & Sons Building at 401 W. Ontario Street, Chicago — from 1905 scrap-trade headquarters to Birken Lofts.',
  image: 'https://birkenlofts.com/images/elevations/401-W-Ontario-No-Signs-1024w.webp',
  mainEntityOfPage: 'https://birkenlofts.com/history/',
  author: { '@type': 'Organization', name: 'Birken Lofts', url: 'https://birkenlofts.com' },
  publisher: { '@type': 'Organization', name: 'Birken Lofts', url: 'https://birkenlofts.com' },
  about: {
    '@type': 'Place',
    name: 'S. Birkenstein & Sons Building',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '401 W. Ontario Street',
      addressLocality: 'Chicago',
      addressRegion: 'IL',
      postalCode: '60654',
      addressCountry: 'US',
    },
  },
};

export default function HistoryPage() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <header className="history-header container">
        <span className="tag tag-accent">Since 1905</span>
        <h1>The House of Birkenstein</h1>
        <p className="history-lede">
          Before it held lofts, 401 W. Ontario held rags, rubber and iron &mdash; the
          headquarters of one of Chicago&rsquo;s largest scrap houses, run by a family that
          helped turn America&rsquo;s cast-offs into industry.
        </p>
      </header>
      <article className="container">
        <section className="history-row">
          <div className="history-prose">
            <h2>Smokey Hollow</h2>
            <p>
              The blocks west of Michigan Avenue weren&rsquo;t always galleries and riverwalks.
              The Near North Side grew up early as a working district: by the late 1850s the
              river and the rail lines had drawn heavy industry &mdash; the McCormick Reaper
              works among them &mdash; and Irish, German and Swedish immigrants settled the
              surrounding blocks in small frame cottages. The Great Fire of 1871 leveled it
              all; industry rebuilt along the same lines and pressed further west once the
              Northwestern railway arrived. By the turn of the century the district had a name
              that told you everything about it: Smokey Hollow, for the haze the riverside
              factories kept overhead.
            </p>
            <p>
              The east side of the neighborhood turned fashionable after Potter Palmer built
              his lakefront mansion in 1882, and the Michigan Avenue Bridge brought luxury
              shopping north in 1920. But Smokey Hollow stayed industrial deep into the
              twentieth century &mdash; until a real estate developer named Albert Friedman
              rechristened it &ldquo;River North&rdquo; in the late 1970s and began filling its
              old factories with artists and galleries.
            </p>
          </div>
          <figure className="history-fig">
            <Image
              src="/images/history/sanborn-map-1906.webp"
              alt="1906 Sanborn fire-insurance map showing the block bounded by Ontario and Ohio Streets"
              width={0}
              height={0}
            />
            <figcaption>
              The 1906 Sanborn fire-insurance map &mdash; the building at center, labeled
              &ldquo;J. Birkenstein &amp; Sons, Junk &amp; Rags.&rdquo;
            </figcaption>
          </figure>
        </section>
        <section className="history-row rev">
          <div className="history-prose">
            <h2>A rag peddler&rsquo;s empire</h2>
            <p>
              Sigmund Birkenstein was born in Kissingen, Germany, and came to America in 1857
              &mdash; Richmond first, then Hannibal, Missouri, then Chicago in 1866, where the
              city directories list him as a peddler in the rag trade. By the late 1870s he had
              a partner, Moses Kaufman, a firm &mdash; S. Birkenstein &amp; Co. &mdash; and a
              building on Kinzie Street west of the river. Within a decade he had bought
              Kaufman out. His son Louis joined in 1890, and Henry, Albert and Milton followed;
              by the time Sigmund died in 1900, the letterhead read S. Birkenstein &amp; Sons.
            </p>
            <p>
              It was a familiar arc, written large. Scrap collectors &mdash; many of them, like
              Birkenstein, Jewish immigrants from Europe &mdash; had long worked at a
              peddler&rsquo;s scale. Industrialization changed the math: America&rsquo;s mills
              wanted iron, rubber and cotton faster than the country could supply them new, and
              the dealers who could gather and grade the old stuff built substantial
              businesses.
            </p>
          </div>
          <figure className="history-fig">
            <Image
              src="/images/history/louis-birkenstein-1919.webp"
              alt="Portrait of Louis Birkenstein"
              width={0}
              height={0}
            />
            <figcaption>
              Louis Birkenstein, company president, in <em>The Rubber Age and Tire News</em>,
              1919.
            </figcaption>
          </figure>
        </section>
        <section className="history-row">
          <div className="history-prose">
            <h2>The house that Birkenstein built</h2>
            <p>
              Under Louis, the firm outgrew rags and paper stock and moved hard into scrap
              metal and rubber &mdash; the automobile and the modern steel industry saw to the
              demand. In 1905 the company put up a purpose-built headquarters at 401 W. Ontario
              Street: offices and shipping on the first floor, storage and baling on the
              second, sorting above. Business kept growing, and in 1912 architect H. M.
              Eichberg added a fourth story so seamlessly you have to squint to find the seam.
            </p>
            <p>
              It was a working warehouse with front-parlor manners: red face brick across eight
              bays, segmental-arch windows, a limestone sill course, brick piers trimmed with
              Prairie-style ornament and a corbeled frieze below the cornice &mdash; and inside,
              the heavy timber posts and beams that carry the building to this day.
            </p>
            <p>
              The trade press called it the House of Birkenstein, and the firm leaned into the
              name. &ldquo;Label that car to Birkenstein &amp; Sons, Chicago&rdquo; &mdash; a
              1916 advertisement claimed the phrase was in daily use among thousands of
              shippers across the country.
            </p>
          </div>
          <figure className="history-fig">
            <Image
              src="/images/history/hey-joe-ad-1916.webp"
              alt="1916 S. Birkenstein & Sons advertisement reading Hey Joe! Label that Car to S. Birkenstein & Sons, Chicago"
              width={0}
              height={0}
            />
            <figcaption>
              &ldquo;Hey Joe! Label that Car&rdquo; &mdash; <em>Hide and Leather</em>, February
              1916, with the building sketched at lower left.
            </figcaption>
          </figure>
        </section>
        <section className="history-row rev">
          <div className="history-prose">
            <h2>War and the scrap boom</h2>
            <p>
              America&rsquo;s entry into the First World War made scrap a strategic material,
              and by the late 1910s the waste trade was a billion-dollar industry. S.
              Birkenstein &amp; Sons opened offices in New York, Philadelphia and Minneapolis,
              and Louis Birkenstein became the industry&rsquo;s public face: tapped in 1917 to
              lead the Waste Materials Branch of the Quartermaster&rsquo;s salvage effort,
              appointed head of the Army&rsquo;s Surplus Property Division in 1919, and elected
              to four consecutive terms as president of the National Association of Waste
              Material Dealers.
            </p>
          </div>
          <figure className="history-fig">
            <Image
              src="/images/history/house-of-birkenstein-ad-1920.webp"
              alt="1920 advertisement showing the building above the script signature The House of Birkenstein"
              width={0}
              height={0}
            />
            <figcaption>
              &ldquo;The House of Birkenstein&rdquo; &mdash; <em>The Rubber Age and Tire
              News</em>, April 1920. This page takes its name from the signature.
            </figcaption>
          </figure>
        </section>
        <section className="history-solo">
          <h2>After Birkenstein</h2>
          <p>
            Success eventually moved the firm out. In 1920 S. Birkenstein &amp; Sons decamped
            to a new headquarters at North Avenue and Kingsbury Street and leased 401 W.
            Ontario to the Chicago Mill Paper Stock Company. Sanborn maps show the building as
            a cork-and-seal warehouse by mid-century, and late in the century it was carved
            into offices &mdash; its timber frame and brick walls left standing through every
            change of use.
          </p>
        </section>
        <section className="history-row">
          <div className="history-prose">
            <h2>Birken Lofts today</h2>
            <p>
              A century of industry left the building remarkably intact &mdash; its massing,
              roofline and window pattern are still the ones Smokey Hollow knew. The conversion
              to Birken Lofts carries that record forward: fifty-seven residences set among the
              original posts, beams and brick, a block from the river that started it all.
            </p>
          </div>
          <figure className="history-fig">
            <Image
              src="/images/history/timber-ceiling.webp"
              alt="Exposed heavy-timber beams and joists at the ceiling of an upper floor"
              width={0}
              height={0}
            />
            <figcaption>The original heavy-timber frame, still carrying the building.</figcaption>
          </figure>
        </section>
        <section className="history-cta">
          <p>See what the House of Birkenstein holds now.</p>
          <div className="history-cta-btns">
            <a className="btn btn-primary" href="/#plans">View floor plans</a>
            <a className="btn btn-secondary" href="/#contact">Contact us</a>
          </div>
        </section>
      </article>
    </main>
  );
}
```

`next/image` note: with `images: { unoptimized: true }` and explicit `width`/`height`, the CSS below (`width: 100%; height: auto`) makes the images responsive while the attributes reserve aspect-ratio space (no CLS). Set each pair to the file's true pixel dimensions.

- [ ] **Step 2: Append to `app/site.css`** (after the lightbox block, before the responsive section) exactly:

```css
/* — history page — */
.history-header { padding-block: 64px 8px; }
.history-header h1 { font-size: clamp(40px, 5vw, 58px); margin: 18px 0 16px; }
.history-lede { font-size: 19px; line-height: 1.6; color: var(--color-neutral-700); max-width: 56ch; margin: 0; }
.history-row { display: grid; grid-template-columns: 1.05fr 0.95fr; gap: 56px; align-items: center; padding-block: 44px; }
.history-row.rev .history-prose { order: 2; }
.history-row.rev .history-fig { order: 1; }
.history-prose h2 { font-size: 32px; margin: 0 0 14px; }
.history-prose p { font-size: 16px; line-height: 1.7; color: var(--color-neutral-800); max-width: 58ch; margin: 0 0 16px; }
.history-prose p:last-child { margin-bottom: 0; }
.history-fig { margin: 0; }
.history-fig img {
  width: 100%; height: auto; display: block;
  border-radius: var(--radius-lg); box-shadow: var(--shadow-md); background: #fff;
}
.history-fig figcaption { font-size: 13px; line-height: 1.5; color: var(--color-neutral-600); margin-top: 10px; }
.history-solo { padding-block: 12px 32px; max-width: 720px; }
.history-solo h2 { font-size: 32px; margin: 0 0 14px; }
.history-solo p { font-size: 16px; line-height: 1.7; color: var(--color-neutral-800); margin: 0; }
.history-cta {
  margin-block: 44px 88px; background: var(--color-accent-100);
  border-radius: calc(var(--radius-lg) * 1.6); padding: 44px 56px;
  display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 24px;
}
.history-cta p { font-family: var(--font-heading); font-size: 26px; margin: 0; max-width: 24ch; }
.history-cta-btns { display: flex; gap: 14px; flex-wrap: wrap; }
.history-link { display: inline-block; margin-top: 18px; color: var(--color-accent); font-weight: 600; text-decoration: none; }
.history-link:hover { text-decoration: underline; }
@media (max-width: 768px) {
  .history-header { padding-block: 40px 0; }
  .history-row { grid-template-columns: 1fr; gap: 22px; padding-block: 28px; }
  .history-row.rev .history-prose { order: 0; }
  .history-row.rev .history-fig { order: 0; }
  .history-cta { padding: 32px; }
}
```

- [ ] **Step 3: Fact-check pass (required, do not skip)**

Read the narrative PDF (`S. Birkenstein and Sons Building -PDIL Narrative.pdf`, pages 1–5) with the Read tool and verify every name, date, and claim in the page copy against it (Kissingen; 1857/1866; Kaufman/Kinzie Street; 1890 Louis; Henry/Albert/Milton; 1900; 1905 floor uses; 1912 H. M. Eichberg; architecture details; $1B industry; NY/Philadelphia/Minneapolis; 1917/1919 roles; four terms; 1920 lease to Chicago Mill Paper Stock Company; North & Kingsbury; cork-and-seal by 1950; office conversion late in the century; 57 residences from the home page). If any claim in the plan's copy contradicts the PDF, STOP and report DONE_WITH_CONCERNS quoting both.

- [ ] **Step 4: Build and verify**

```bash
npm run build
npm run lint
test -f out/history/index.html && echo HISTORY-OK
grep -o '<title>The House of Birkenstein | Birken Lofts</title>' out/history/index.html
grep -o 'rel="canonical" href="https://birkenlofts.com/history/"' out/history/index.html
grep -o '"@type":"Article"' out/history/index.html
grep -c 'history-row' out/history/index.html
grep -o 'Sigmund Birkenstein' out/history/index.html | head -1
grep -o 'images/history/sanborn-map-1906.webp' out/history/index.html | head -1
```

Expected: build + lint pass; `HISTORY-OK`; all greps match (`history-row` count ≥ 5).

- [ ] **Step 5: Commit**

```bash
git add app/history app/site.css
git commit -m "Add The House of Birkenstein history page"
```

---

### Task 3: Navigation repoint, home-band link, sitemap, llms files, final verification

**Files:**
- Modify: `components/Nav.tsx`, `components/Footer.tsx`, `hooks/useScrollSpy.ts`, `components/home/HistoryBand.tsx`, `public/sitemap.xml`, `public/llms.txt`, `public/llms-full.txt`

**Interfaces:**
- Consumes: the `/history/` route (Task 2) and `.history-link` CSS (Task 2).
- Produces: nav/footer/band links to `/history/`; crawl files describing the page.

- [ ] **Step 1: `components/Nav.tsx`** — add after the `const onCam = ...` line:

```tsx
  const onHistory = pathname.startsWith('/history');
```

and change the History entry in `links` from

```tsx
    { href: '/#history', label: 'History', current: onHome && active === 'history' },
```

to

```tsx
    { href: '/history/', label: 'History', current: onHistory },
```

- [ ] **Step 2: `hooks/useScrollSpy.ts`** — change the `sections` array to:

```ts
const sections = ['plans', 'amenities', 'neighborhood', 'schedule', 'contact'];
```

- [ ] **Step 3: `components/Footer.tsx`** — change `<Link href="/#history">History</Link>` to `<Link href="/history/">History</Link>`.

- [ ] **Step 4: `components/home/HistoryBand.tsx`** — add `import Link from 'next/link';` as the first line, and insert after the closing `</p>` of the paragraph (inside the same `<div>`):

```tsx
          <Link className="history-link" href="/history/">
            Read the building&rsquo;s story &rarr;
          </Link>
```

- [ ] **Step 5: `public/sitemap.xml`** — insert between the `/` url block and the `/ohio-feeder-ramp-cam/` url block:

```xml
  <url>
    <loc>https://birkenlofts.com/history/</loc>
    <lastmod>2026-07-15</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
```

- [ ] **Step 6: `public/llms.txt`** — insert a new section between `## Timeline` and `## Live Traffic Camera`:

```markdown
## Building History

The building is the S. Birkenstein & Sons Building, constructed in 1905 for one of Chicago's largest scrap-material dealers (rags, rubber, scrap metals, paper stock) and expanded with a fourth story in 1912 (architect H. M. Eichberg). Trade press of the 1910s called it "The House of Birkenstein." The firm moved to a new headquarters in 1920; the building later served as a paper-stock and cork-and-seal warehouse, then offices, before its conversion to residences. Full story: https://birkenlofts.com/history/

```

- [ ] **Step 7: `public/llms-full.txt`** — read the `## About the Building` section first, then append to the END of that section (before the next `##` heading):

```markdown
Detailed building history (Smokey Hollow, the Birkenstein family firm, the 1905 construction and 1912 fourth-story addition, the WWI scrap boom, and the building's later uses) is published at https://birkenlofts.com/history/
```

- [ ] **Step 8: Build, greps, and headless verification**

```bash
npm run build && npm run lint
grep -c '/#history' out/index.html || echo NO-HASH-HISTORY-OK
grep -o 'href="/history/"' out/index.html | head -1
grep -o "Read the building" out/index.html
grep -o 'history/' out/sitemap.xml
grep -o 'birkenlofts.com/history/' out/llms.txt out/llms-full.txt
grep -o 'aria-current' out/history/index.html | head -1
git status --porcelain package.json package-lock.json   # expect empty
```

Expected: no `/#history` anywhere (`NO-HASH-HISTORY-OK`); nav/band links present; sitemap + both llms files reference the page; History nav item has `aria-current="page"` server-rendered on the history page itself.

Then serve and run the interactive check:

```bash
python3 -m http.server 4173 -d out &
SERVER_PID=$!
```

Script (playwright importable from repo node_modules; if absent, `npm i --no-save playwright`):

```js
import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' });

// Home band link navigates to the page
await page.click('a.history-link');
await page.waitForURL('**/history/');
if (!(await page.textContent('h1')).includes('The House of Birkenstein')) throw new Error('h1 wrong');

// Nav highlights History here
const cur = await page.getAttribute('nav.site-nav a[href="/history/"]', 'aria-current');
if (cur !== 'page') throw new Error('aria-current missing on History');

// All images load
const bad = await page.evaluate(() =>
  Array.from(document.querySelectorAll('main img')).filter(i => !i.complete || i.naturalWidth === 0).length);
if (bad > 0) throw new Error(`${bad} images failed to load`);

// CTA lands on the home plans section
await page.click('.history-cta a[href="/#plans"]');
await page.waitForURL('**/#plans');
await page.waitForTimeout(600);
const seen = await page.evaluate(() => {
  const el = document.getElementById('plans');
  const r = el.getBoundingClientRect();
  return r.top >= 0 && r.top < 400;
});
if (!seen) throw new Error('CTA did not land on #plans');

// Nav History from home navigates
await page.click('nav.site-nav a[href="/history/"]');
await page.waitForURL('**/history/');
console.log('HISTORY-NAV-OK');
await browser.close();
```

```bash
node <script>
kill $SERVER_PID
```

Expected: `HISTORY-NAV-OK`.

- [ ] **Step 9: Commit**

```bash
git add components/Nav.tsx components/Footer.tsx hooks/useScrollSpy.ts components/home/HistoryBand.tsx public/sitemap.xml public/llms.txt public/llms-full.txt
git commit -m "Link The House of Birkenstein page from nav, footer, home band, and crawl files"
```

---

## Final verification (controller/user, after all tasks)

- [ ] User reviews `/history/` in the browser (`npm run dev`, run by the user): copy reads well, figures/captions render, alternating layout, mobile stacking, nav highlighting, band link, CTAs.
- [ ] Controller updates `CLAUDE.md`'s Architecture section route list (add `/history/`) if the user merges — deferred to branch finish, not a task here.
