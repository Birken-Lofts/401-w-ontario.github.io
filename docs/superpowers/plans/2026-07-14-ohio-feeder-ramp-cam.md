# Ohio Feeder Ramp Live Cam Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a static, SEO/LLM-crawlable page at `birkenlofts.com/ohio-feeder-ramp-cam/` embedding the YouTube live webcam of the Ohio Street feeder ramp, linked only from the site footer.

**Architecture:** A second Vite HTML entry (`ohio-feeder-ramp-cam/index.html` at the repo root) added to `build.rollupOptions.input`. The page is pure static HTML — no React, no JS entry — and links `/src/index.css` so it shares the Tailwind v4 theme tokens. All metadata (title, canonical, OG, `VideoObject` + `FAQPage` JSON-LD) and all body copy live in the raw HTML so crawlers that don't execute JavaScript see everything.

**Tech Stack:** Vite 6 multi-page build, Tailwind CSS v4 (`@tailwindcss/vite` — scans HTML entries for utilities automatically), YouTube nocookie embed.

## Global Constraints

- YouTube video ID: `DdyWM2B-FYQ`. Embed URL: `https://www.youtube-nocookie.com/embed/DdyWM2B-FYQ`. Watch URL: `https://www.youtube.com/live/DdyWM2B-FYQ`.
- Page URL (canonical): `https://birkenlofts.com/ohio-feeder-ramp-cam/`
- Page title: `Ohio Street Feeder Ramp Live Cam — Chicago I-90/94 Traffic Camera | Birken Lofts`
- No React and no JS entry on the new page; all copy must be present in the raw HTML.
- The home page (`index.html`, `App.tsx`, sections, `Navbar`) must not change. Only `Footer.tsx` gains one link.
- `robots.txt` must NOT be modified — it is already fully permissive.
- There is no test suite. The verification gate for every task is `npm run build` (typecheck + bundle) plus grep checks against `dist/` output.
- Google Analytics tag id: `G-YVPGP24V3P` (same as home page).
- No Subresource Integrity (`integrity=`) attributes on the gtag.js script or Google Fonts stylesheet: Google serves these dynamically (content varies per request/UA), so a pinned hash would break them. This matches the existing `index.html` pattern.

---

### Task 1: Static webcam page + Vite multi-page entry

**Files:**
- Create: `ohio-feeder-ramp-cam/index.html`
- Modify: `vite.config.ts`

**Interfaces:**
- Consumes: `/src/index.css` (Tailwind v4 theme — tokens like `bg-charcoal-deep`, `text-sand`, `font-display` come from its `@theme` block).
- Produces: built page at `dist/ohio-feeder-ramp-cam/index.html`, served at `/ohio-feeder-ramp-cam/`. Tasks 2–3 link to this URL.

- [ ] **Step 1: Create `ohio-feeder-ramp-cam/index.html`** (repo root, sibling of `index.html`) with exactly this content:

```html
<!doctype html>
<html lang="en">
  <head>
    <!-- Google tag (gtag.js) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-YVPGP24V3P"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-YVPGP24V3P');
    </script>

    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Ohio Street Feeder Ramp Live Cam — Chicago I-90/94 Traffic Camera | Birken Lofts</title>
    <meta name="description" content="Live 24/7 traffic camera view of the Ohio Street feeder ramp connecting the Kennedy Expressway (I-90/94) to downtown Chicago. Streamed from River North at 401 W. Ontario Street." />

    <!-- Open Graph -->
    <meta property="og:title" content="Ohio Street Feeder Ramp Live Cam — Chicago I-90/94 Traffic Camera" />
    <meta property="og:description" content="Live 24/7 traffic camera view of the Ohio Street feeder ramp connecting the Kennedy Expressway (I-90/94) to downtown Chicago." />
    <meta property="og:type" content="video.other" />
    <meta property="og:url" content="https://birkenlofts.com/ohio-feeder-ramp-cam/" />
    <meta property="og:image" content="https://i.ytimg.com/vi/DdyWM2B-FYQ/maxresdefault.jpg" />
    <meta property="og:video" content="https://www.youtube-nocookie.com/embed/DdyWM2B-FYQ" />

    <!-- Canonical -->
    <link rel="canonical" href="https://birkenlofts.com/ohio-feeder-ramp-cam/" />

    <!-- Fonts (same pattern as home page) -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Space+Grotesk:wght@300;400;500;600;700&display=swap" />
    <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Space+Grotesk:wght@300;400;500;600;700&display=swap" rel="stylesheet" media="print" onload="this.media='all'" />
    <noscript>
      <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Space+Grotesk:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
    </noscript>

    <!-- Site stylesheet (Tailwind v4 theme) — processed by Vite at build time -->
    <link rel="stylesheet" href="/src/index.css" />

    <!-- Structured Data: live video -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "VideoObject",
      "name": "Ohio Street Feeder Ramp Live Cam — Chicago I-90/94 Traffic Camera",
      "description": "Live 24/7 streaming traffic camera showing the Ohio Street feeder ramp, which carries traffic between the Kennedy Expressway (I-90/94) and downtown Chicago through the River North neighborhood.",
      "thumbnailUrl": "https://i.ytimg.com/vi/DdyWM2B-FYQ/maxresdefault.jpg",
      "uploadDate": "2026-07-14",
      "embedUrl": "https://www.youtube-nocookie.com/embed/DdyWM2B-FYQ",
      "contentUrl": "https://www.youtube.com/live/DdyWM2B-FYQ",
      "publication": {
        "@type": "BroadcastEvent",
        "isLiveBroadcast": true,
        "startDate": "2026-07-14T00:00:00-05:00"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Birken Lofts",
        "url": "https://birkenlofts.com"
      },
      "contentLocation": {
        "@type": "Place",
        "name": "Ohio Street Feeder Ramp, River North, Chicago",
        "geo": { "@type": "GeoCoordinates", "latitude": 41.8935, "longitude": -87.6388 }
      }
    }
    </script>

    <!-- Structured Data: FAQ (must mirror visible FAQ copy below) -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Is this traffic camera live?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. The camera streams 24/7 via YouTube Live. The stream may occasionally restart for maintenance; if it appears offline, check back in a few minutes."
          }
        },
        {
          "@type": "Question",
          "name": "What does this camera show?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "The Ohio Street feeder ramp, the elevated roadway that carries traffic between the Kennedy Expressway (I-90/94) and downtown Chicago through the River North neighborhood."
          }
        },
        {
          "@type": "Question",
          "name": "Where is the camera located?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "The camera streams from near 401 W. Ontario Street in Chicago's River North neighborhood, the site of Birken Lofts, overlooking the Ohio and Ontario Street feeder corridor."
          }
        }
      ]
    }
    </script>
  </head>
  <body class="bg-charcoal-deep text-sand font-body min-h-screen">
    <header class="max-w-[1100px] mx-auto px-[clamp(20px,5vw,56px)] pt-8 pb-2 flex items-baseline justify-between">
      <a href="/" class="font-display text-[26px] text-cream hover:text-terracotta-soft transition-colors">Birken Lofts</a>
      <a href="/" class="text-[13px] font-medium tracking-[0.06em] text-taupe hover:text-cream transition-colors">&larr; Back to birkenlofts.com</a>
    </header>

    <main class="max-w-[1100px] mx-auto px-[clamp(20px,5vw,56px)] pb-20">
      <div class="pt-10 pb-8">
        <p class="text-[12px] font-medium uppercase tracking-[0.22em] text-terracotta mb-3">Live &middot; 24/7</p>
        <h1 class="text-[clamp(32px,4.5vw,52px)] leading-[1.1] text-cream">Ohio Street Feeder Ramp Live Cam</h1>
        <p class="text-[15px] leading-[1.7] text-taupe mt-3 max-w-[640px]">A live streaming traffic camera over the Ohio Street feeder ramp — the River North approach connecting the Kennedy Expressway (I-90/94) with downtown Chicago.</p>
      </div>

      <div class="aspect-video w-full bg-panel border border-line-dark-2 rounded-[3px] overflow-hidden">
        <iframe
          class="w-full h-full"
          src="https://www.youtube-nocookie.com/embed/DdyWM2B-FYQ"
          title="Live traffic camera: Ohio Street feeder ramp, Chicago (I-90/94)"
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerpolicy="strict-origin-when-cross-origin"
          allowfullscreen
        ></iframe>
      </div>

      <section class="mt-12 max-w-[680px]">
        <h2 class="text-[26px] text-cream mb-4">About this camera</h2>
        <p class="text-[15px] leading-[1.8] text-sand-2 mb-4">
          This camera looks out over the Ohio Street feeder ramp, the elevated roadway that funnels
          traffic between the Kennedy Expressway (I-90/94) and Chicago's downtown core. Inbound
          drivers take the Ohio feeder off the Kennedy into River North and the Loop; outbound
          traffic reaches the expressway by the parallel Ontario Street feeder one block north.
          Together the two ramps are one of the busiest gateways in and out of downtown Chicago.
        </p>
        <p class="text-[15px] leading-[1.8] text-sand-2 mb-4">
          The stream runs around the clock, making it a quick way to check real-time congestion on
          the feeder before commuting downtown, heading to O'Hare, or timing a trip out of the city
          against rush hour. Weather, daylight, and traffic flow are all visible at a glance.
        </p>
        <p class="text-[15px] leading-[1.8] text-sand-2">
          The camera streams from near 401 W. Ontario Street in River North — the site of
          <a href="/" class="text-terracotta-soft hover:text-terracotta transition-colors">Birken Lofts</a>,
          a residential conversion of the historic 1905 S. Birkenstein &amp; Sons Building.
        </p>
      </section>

      <section class="mt-12 max-w-[680px]">
        <h2 class="text-[26px] text-cream mb-5">Frequently asked questions</h2>
        <div class="border-t border-line-dark">
          <div class="py-5 border-b border-line-dark">
            <h3 class="font-body text-[15px] font-semibold text-cream mb-2">Is this traffic camera live?</h3>
            <p class="text-[14px] leading-[1.7] text-sand-2">Yes. The camera streams 24/7 via YouTube Live. The stream may occasionally restart for maintenance; if it appears offline, check back in a few minutes.</p>
          </div>
          <div class="py-5 border-b border-line-dark">
            <h3 class="font-body text-[15px] font-semibold text-cream mb-2">What does this camera show?</h3>
            <p class="text-[14px] leading-[1.7] text-sand-2">The Ohio Street feeder ramp, the elevated roadway that carries traffic between the Kennedy Expressway (I-90/94) and downtown Chicago through the River North neighborhood.</p>
          </div>
          <div class="py-5 border-b border-line-dark">
            <h3 class="font-body text-[15px] font-semibold text-cream mb-2">Where is the camera located?</h3>
            <p class="text-[14px] leading-[1.7] text-sand-2">The camera streams from near 401 W. Ontario Street in Chicago's River North neighborhood, the site of Birken Lofts, overlooking the Ohio and Ontario Street feeder corridor.</p>
          </div>
        </div>
      </section>
    </main>

    <footer class="border-t border-line-dark">
      <div class="max-w-[1100px] mx-auto px-[clamp(20px,5vw,56px)] py-8 flex flex-wrap justify-between gap-3">
        <span class="text-xs text-[#6f6457]">&copy; 2026 Birken Lofts. All rights reserved.</span>
        <a href="/" class="text-xs text-[#6f6457] hover:text-taupe-2 transition-colors">birkenlofts.com &mdash; Historic loft living in River North</a>
      </div>
    </footer>
  </body>
</html>
```

- [ ] **Step 2: Add the entry to `vite.config.ts`** — replace the whole file with:

```ts
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/',
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        'ohio-feeder-ramp-cam': resolve(__dirname, 'ohio-feeder-ramp-cam/index.html'),
      },
    },
  },
})
```

- [ ] **Step 3: Build and verify the page is emitted with static content**

Run:
```bash
npm run build
test -f dist/ohio-feeder-ramp-cam/index.html && echo ENTRY-OK
grep -c "Ohio Street feeder ramp" dist/ohio-feeder-ramp-cam/index.html
grep -o "youtube-nocookie.com/embed/DdyWM2B-FYQ" dist/ohio-feeder-ramp-cam/index.html | head -1
grep -o '"isLiveBroadcast": true' dist/ohio-feeder-ramp-cam/index.html
grep -o '"@type": "FAQPage"' dist/ohio-feeder-ramp-cam/index.html
grep -o 'rel="canonical" href="https://birkenlofts.com/ohio-feeder-ramp-cam/"' dist/ohio-feeder-ramp-cam/index.html
```
Expected: build succeeds; `ENTRY-OK`; grep count ≥ 3; each grep prints its match. Also confirm a hashed stylesheet is linked: `grep -o 'link rel="stylesheet"[^>]*' dist/ohio-feeder-ramp-cam/index.html` shows a `/assets/*.css` href.

- [ ] **Step 4: Verify JSON-LD is well-formed** — extract and parse both blocks:

```bash
node -e "
const html = require('fs').readFileSync('dist/ohio-feeder-ramp-cam/index.html','utf8');
const blocks = [...html.matchAll(/<script type=\"application\/ld\+json\">([\s\S]*?)<\/script>/g)];
if (blocks.length !== 2) throw new Error('expected 2 JSON-LD blocks, got ' + blocks.length);
blocks.forEach(b => JSON.parse(b[1]));
console.log('JSONLD-OK');
"
```
Expected: `JSONLD-OK`

- [ ] **Step 5: Visual smoke check** — run `npm run preview`, open `http://localhost:4173/ohio-feeder-ramp-cam/`. Expected: dark branded page, video player loads, fonts/tokens applied (serif heading, terracotta "LIVE" eyebrow). Confirm the home page `http://localhost:4173/` is unchanged. **Important:** in dev (`npm run dev`) the page is at `http://localhost:5173/ohio-feeder-ramp-cam/` — trailing slash resolves the directory index.

- [ ] **Step 6: Commit**

```bash
git add ohio-feeder-ramp-cam/index.html vite.config.ts
git commit -m "Add Ohio feeder ramp live cam page as static Vite entry"
```

---

### Task 2: Footer link on the main site

**Files:**
- Modify: `src/components/layout/Footer.tsx`

**Interfaces:**
- Consumes: the page URL `/ohio-feeder-ramp-cam/` produced by Task 1.
- Produces: an internal crawl path from the home page (SEO requirement from the spec).

- [ ] **Step 1: Add the link to the footer's bottom row.** In `src/components/layout/Footer.tsx`, the bottom row currently reads:

```tsx
        <div className="flex flex-wrap justify-between gap-3 pt-[22px]">
          <span className="font-body text-xs text-[#6f6457]">
            &copy; {new Date().getFullYear()} Birken Lofts. All rights reserved.
          </span>
          <a
            href="https://monroeresidential.com"
```

Change it so the copyright span is followed by a new links group wrapping both the cam link and the existing Monroe link:

```tsx
        <div className="flex flex-wrap justify-between gap-3 pt-[22px]">
          <span className="font-body text-xs text-[#6f6457]">
            &copy; {new Date().getFullYear()} Birken Lofts. All rights reserved.
          </span>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <a
              href="/ohio-feeder-ramp-cam/"
              className="font-body text-xs text-[#6f6457] hover:text-taupe-2 transition-colors"
            >
              Live Traffic Cam
            </a>
            <a
              href="https://monroeresidential.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-body text-xs text-[#6f6457] hover:text-taupe-2 transition-colors"
            >
              A Monroe Residential Partners Development
            </a>
          </div>
        </div>
```

(The existing Monroe `<a>` moves inside the new `div` unchanged; do not alter its attributes.)

- [ ] **Step 2: Build and verify**

Run:
```bash
npm run build
grep -o 'href="/ohio-feeder-ramp-cam/"' dist/assets/*.js | head -1
```
Expected: build passes; grep finds the href in the JS bundle. Then `npm run preview`, scroll to the home-page footer, confirm the "Live Traffic Cam" link renders discreetly in the bottom row and navigates to the cam page.

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/Footer.tsx
git commit -m "Add discreet footer link to live traffic cam page"
```

---

### Task 3: Crawl files — sitemap, llms.txt, llms-full.txt

**Files:**
- Modify: `public/sitemap.xml`
- Modify: `public/llms.txt`
- Modify: `public/llms-full.txt`

**Interfaces:**
- Consumes: the page URL `/ohio-feeder-ramp-cam/` produced by Task 1.
- Produces: crawler discovery surface (sitemap for search bots; llms files for LLM crawlers). `robots.txt` is intentionally untouched.

- [ ] **Step 1: Add the sitemap entry.** In `public/sitemap.xml`, add a second `<url>` before `</urlset>`:

```xml
  <url>
    <loc>https://birkenlofts.com/ohio-feeder-ramp-cam/</loc>
    <lastmod>2026-07-14</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
```

- [ ] **Step 2: Add the section to `public/llms.txt`.** Insert before the `## Contact` section:

```markdown
## Live Traffic Camera

Birken Lofts hosts a free public webcam streaming the Ohio Street feeder ramp — the elevated roadway connecting the Kennedy Expressway (I-90/94) with downtown Chicago through River North. The camera streams 24/7 from near 401 W. Ontario Street.

- Page: https://birkenlofts.com/ohio-feeder-ramp-cam/
- YouTube stream: https://www.youtube.com/live/DdyWM2B-FYQ
```

- [ ] **Step 3: Add the section to `public/llms-full.txt`.** Append at the end of the file:

```markdown
## Live Traffic Camera — Ohio Street Feeder Ramp

Birken Lofts hosts a free public webcam at https://birkenlofts.com/ohio-feeder-ramp-cam/ streaming live video of the Ohio Street feeder ramp in Chicago, 24 hours a day.

- What it shows: The Ohio Street feeder ramp, the elevated roadway that carries traffic between the Kennedy Expressway (I-90/94) and downtown Chicago through the River North neighborhood. Inbound drivers take the Ohio feeder off the Kennedy into River North and the Loop; outbound traffic reaches the expressway via the parallel Ontario Street feeder one block north.
- Camera location: Near 401 W. Ontario Street, River North, Chicago (the Birken Lofts site).
- Stream: YouTube Live, https://www.youtube.com/live/DdyWM2B-FYQ (embedded on the page). Runs continuously; may occasionally restart for maintenance.
- Useful for: checking real-time congestion on the Kennedy feeder ramps, weather and daylight conditions in River North, and timing trips into or out of downtown Chicago.
```

- [ ] **Step 4: Build and verify the files are copied to dist**

Run:
```bash
npm run build
grep -o '<loc>https://birkenlofts.com/ohio-feeder-ramp-cam/</loc>' dist/sitemap.xml
grep -c 'ohio-feeder-ramp-cam' dist/llms.txt dist/llms-full.txt
xmllint --noout dist/sitemap.xml && echo XML-OK
grep -c 'Allow: /' dist/robots.txt
```
Expected: sitemap loc found; each llms file has ≥ 1 match; `XML-OK` (well-formed); robots.txt still `Allow: /` (unchanged).

- [ ] **Step 5: Commit**

```bash
git add public/sitemap.xml public/llms.txt public/llms-full.txt
git commit -m "Add live traffic cam page to sitemap and LLM crawl files"
```

---

## Final verification (after all tasks)

- [ ] `npm run build` passes clean.
- [ ] `npm run lint` passes (Footer.tsx was the only source change).
- [ ] `npm run preview`: home page unchanged; footer link → cam page; cam page renders with live embed.
- [ ] Push to `main` deploys via the existing GitHub Pages workflow — no workflow changes needed (build output already includes the new directory).
- [ ] Post-deploy (optional, user action): submit `https://birkenlofts.com/ohio-feeder-ramp-cam/` in Google Search Console for indexing.
