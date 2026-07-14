# Ohio Feeder Ramp Live Cam Page — Design

**Date:** 2026-07-14
**Status:** Approved approach (Vite multi-page entry); pending final spec review

## Goal

Add a standalone page to birkenlofts.com embedding the live YouTube webcam of the
Ohio Street feeder ramp (https://www.youtube.com/live/DdyWM2B-FYQ). The page must
not appear on the home page or main navigation, but should be maximally
discoverable by search engines **and LLM crawlers**. SEO framing: a Chicago
traffic camera page (Ohio Street feeder ramp to the Kennedy Expressway, I-90/94),
targeting commuters searching for ramp/traffic conditions.

## Approach (chosen: Vite multi-page entry)

Vite supports multiple HTML entry points via `build.rollupOptions.input`. We add
a second entry at `ohio-feeder-ramp-cam/index.html` so the built site serves
`https://birkenlofts.com/ohio-feeder-ramp-cam/` as a real static HTML page.

Why this beats the alternatives:

- **Plain file in `public/`** — equally crawlable but can't use the Tailwind v4
  theme tokens or shared fonts; branding forks.
- **React Router SPA route** — requires the GitHub Pages 404-redirect hack and
  renders meta/content client-side; bad for search crawlers and useless for LLM
  crawlers, which mostly do not execute JavaScript.

The multi-page entry gives fully static `<head>` metadata **and** fully static
body copy in the raw HTML — readable by crawlers that never run JS.

## Page design

- **URL:** `/ohio-feeder-ramp-cam/` (keyword-rich path, trailing-slash directory)
- **Title:** `Ohio Street Feeder Ramp Live Cam — Chicago I-90/94 Traffic Camera | Birken Lofts`
- **Meta description:** live 24/7 traffic camera view of the Ohio Street feeder
  ramp to the Kennedy Expressway (I-90/94) in River North, Chicago.
- **Entry source:** `ohio-feeder-ramp-cam/index.html` at the repo root (sibling of
  `index.html`). Pure static HTML — no React and no JS entry. It links
  `/src/index.css` via a `<link rel="stylesheet">` that Vite processes at build
  time, so the page uses the same Tailwind v4 tokens and fonts (Tailwind v4's
  Vite plugin scans HTML entries for utility classes; confirm generated utilities
  during implementation). Page chrome: minimal branded header (monogram/wordmark
  linking back to `/`), the video, supporting copy, small footer. **All copy
  lives in the static HTML**, not injected by JS.
- **Embed:** `<iframe src="https://www.youtube-nocookie.com/embed/DdyWM2B-FYQ" loading="lazy" ...>`
  in a responsive 16:9 container, `title` attribute set, `allowfullscreen`.
- **Supporting copy:** 2–3 short paragraphs of real text — what the camera shows,
  what the Ohio feeder connects (Ontario/Ohio feeder ramps to the Kennedy,
  I-90/94), the River North vantage point near 401 W. Ontario. Plus a short FAQ
  (Is this live? What does it show? Where is the camera?) marked up with
  `FAQPage` JSON-LD.
- **Structured data:** `VideoObject` JSON-LD with `publication` →
  `BroadcastEvent` (`isLiveBroadcast: true`), `embedUrl`, `thumbnailUrl`
  (YouTube's `i.ytimg.com/vi/DdyWM2B-FYQ/maxresdefault.jpg`), plus the FAQPage
  block. Canonical `https://birkenlofts.com/ohio-feeder-ramp-cam/`, Open Graph
  (`og:type` video-appropriate), favicon, Google Analytics tag (same G-YVPGP24V3P).

## Site integration

- **Footer link only:** add a discreet "Live Traffic Cam" link in `Footer.tsx`
  pointing to `/ohio-feeder-ramp-cam/`. No nav link, no home-page section — the
  `Navbar`/`useScrollSpy` section-id contract is untouched.
- **Home page unchanged** otherwise.

## Crawlability (search + LLM)

- **`robots.txt`** — already `User-agent: * / Allow: /`, which permits GPTBot,
  ClaudeBot, PerplexityBot, Google-Extended, CCBot, etc. No change needed.
- **`sitemap.xml`** — add a `<url>` entry for `/ohio-feeder-ramp-cam/`
  (`changefreq: monthly`, `priority: 0.6`, lastmod = deploy date).
- **`llms.txt`** — add a "Live Traffic Camera" section: one-paragraph description
  and the page URL + YouTube stream URL.
- **`llms-full.txt`** — add a fuller section mirroring the page's on-page copy
  (camera description, what it shows, FAQ answers, URLs).
- **Static-first rendering** — because the copy is in the raw HTML, non-JS
  crawlers (most LLM bots) see the full content.

## Error handling

If the YouTube stream is offline, YouTube's embed shows its own "stream offline"
state inside the iframe — no custom handling needed. The FAQ copy notes the
stream runs continuously but may occasionally restart.

## Testing / verification

No test suite exists; `npm run build` is the gate. Verification:

1. `npm run build` passes (typecheck + bundle) and `dist/ohio-feeder-ramp-cam/index.html`
   exists with the static copy and JSON-LD present in the raw file.
2. `npm run preview` — page renders, embed loads, footer link navigates to it,
   home page unchanged.
3. Validate JSON-LD blocks (well-formed, parseable).
