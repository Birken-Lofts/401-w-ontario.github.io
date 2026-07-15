# Handoff: Birken Lofts — Marketing Website Redesign

## Overview
Redesign of birkenlofts.com — the leasing/marketing site for Birken Lofts, 57 residences in the historic 1905 S. Birkenstein & Sons Building, 401 W. Ontario Street, River North, Chicago. Conversion-focused (lease units), with the building's history as a supporting theme. Two pages are designed so far: **Home** and **Traffic Cam**. More pages (History, Gallery, Amenities detail, Neighborhood) will follow the same system.

## About the Design Files
The files in this bundle are **design references created in HTML** — prototypes showing intended look and behavior, NOT production code to copy directly. The task is to **recreate these designs in a Next.js (App Router) codebase** — the client's chosen framework — using idiomatic React components. If starting fresh, scaffold with `create-next-app` (TypeScript, App Router).

`home.dc.html` and `traffic-cam.dc.html` are the design sources (custom single-file component format; readable as plain HTML — the markup between `<x-dc>` tags is the page, `{{ }}` holes are template variables). `styles.css` is the design system stylesheet — port its `:root` tokens and component classes faithfully.

## Fidelity
**High-fidelity.** Colors, typography, spacing, radii and copy are final unless marked `[TBD]`. Recreate pixel-faithfully. All photography areas are drag-and-drop placeholders — real photos don't exist yet; implement as `next/image` with placeholder assets.

## Client Requirements (important)
- **Framework**: Next.js (React) — chosen for SEO. Use App Router, one route per page, file-based routing so new pages are trivial to add.
- **SEO**: server-render everything; per-page `metadata` exports (title, description, OpenGraph), semantic HTML (`<nav>`, `<main>`, `<section>`, single `<h1>` per page), sitemap.xml + robots.txt.
- **Blog**: a Ghost blog will be added later. Reserve the `Blog` nav item; plan for either Ghost Content API rendered at `/blog` or a subdomain link — do not build it now.
- **No "Schedule a tour"** anywhere — the property is pre-construction. All CTAs are "Contact us" → the contact form section.
- **Router**: standard Next.js `<Link>` between pages; in-page anchors for home sections.

## Design System — "Organic"
Warm, rounded, a little playful. Left-aligned asymmetric layouts, over-rounded containers, pill buttons, soft circular/blob shapes. All tokens live in `styles.css` (`:root`).

Key tokens:
- Ground `--color-bg: #f5ead8` (warm cream); text `--color-text: #201e1d`
- Accent (terracotta) `--color-accent: #c67139`; second accent (sage) `--color-accent-2: #7a8a5e`
- Each role has a 100–900 OKLCH tonal ramp (`--color-neutral-100`…`--color-accent-2-900`). Light steps = tinted fills; 500 = base; dark steps = text-on-tint/pressed.
- Headings: **Caprasimo** (Google Fonts, 400 only). Body: **Figtree** (400/600/700). Load via `next/font/google`.
- Radii: `--radius-md/lg` (16px base); buttons/inputs/tags are full pills (`border-radius: 999px`); cards ≈ 18px+; hero/section containers 22–36px.
- Shadows `--shadow-sm/md/lg` (see styles.css).
- Icons: Lucide, stroke-width 2.75.
- Photography: wrap in a "washed" treatment — `filter: saturate(0.6) contrast(0.85) brightness(1.1) opacity(0.94)` — with rounded edges.
- Interaction: hover = one ramp step darker (e.g. `--color-accent-600` on primary buttons); focus = `outline: 2px solid var(--color-accent); outline-offset: 2px`; `::selection` accent tint; disabled 45% opacity.

## Screens / Views

### 1. Home (`/`) — see `home.dc.html`
Max content width ~1280px, page padding 48px, sections separated by 88px vertical rhythm.

1. **Nav** (`.nav`): brand "Birken Lofts" (Caprasimo 18px) left; right group (flex, gap 26px, 14px links): Residences, History, Amenities, Neighborhood, Gallery, Traffic Cam, Blog, Contact, "Resident Portal" (13px, accent-700), pill button "Contact us" (solid terracotta). Links hover to accent; `aria-current="page"` gets accent color.
2. **Hero**: 2-col grid (1.05fr / 1fr, gap 56px), padding 64px 48px 72px. Left: sage tag "401 W. Ontario Street · River North, Chicago"; H1 58px/1.06 "Historic timber lofts in the heart of River North" (max 12ch); body 18px neutral-700 (max 46ch): "Fifty-seven residences inside the 1905 S. Birkenstein & Sons Building — original brick and heavy timber, a block from the Brown Line, steps from the river."; buttons "View floor plans" (primary) + "Contact us" (secondary). Right: 480px-tall image in an organic blob mask (`border-radius: 46% 54% 52% 48% / 44% 46% 54% 56%`), washed.
3. **Stats band**: sage-100 fill, radius ~22px, flex gap 64px, padding 36px 48px. Four stats — Caprasimo 38px figure over 13px neutral-700 label: 1905 / Built for S. Birkenstein & Sons · 57 / Loft residences · 4 / Stories of brick & heavy timber · 0.2 mi / To the Chicago River.
4. **Floor plans** (`#plans`): H2 38px "Floor plans", intro line, 3-col card grid (gap 28px). Each `.card` (surface fill, radius ~18px, shadow-sm): 200px washed image, sage tag "Interest list open", title 22px (Studio / One bedroom / Two bedroom), body line (sq ft + 2 features: "550–700 sq ft · oversized windows · in-unit laundry" / "750–1,000 sq ft · exposed brick · walk-in closet" / "1,100–1,400 sq ft · corner exposures · original timber posts"), secondary pill "Inquire" → contact.
5. **History band** (`#history`): terracotta-100 fill, radius ~26px, padding 56px, grid 1fr/380px. Tag "Since 1905", H2 36px "The House of Birkenstein", paragraph about the 1905 scrap-trade firm & Smokey Hollow, ghost link "Read the building's story →" (→ future History page). Right: 340px circle image (washed), archival photo slot.
6. **Amenities** (`#amenities`): H2, 3-col grid (gap 20px/40px). Six rows: sage-200 40px circle with white check icon + 16px label — Exposed brick & heavy timber, Oversized windows, In-unit laundry, Fitness center, Garage parking, Pet friendly.
7. **Neighborhood** (`#neighborhood`): H2 "River North", intro paragraph. Grid 1.5fr/1fr: left an **embedded interactive map** (OpenStreetMap iframe in prototype; use any map embed, marker at 41.8935, -87.6389, min-height 420px, rounded 22px, 1px divider border); right 3 stacked cards — Eat & drink / Transit / Outside (copy in file).
8. **Construction schedule** (`#schedule`): H2 "Construction schedule", 3 cards: "Construction begins — October 2026" (tag "Next", terracotta), then "Interiors & amenities" and "First move-ins" both `[date TBD — confirm with client]` (tag "Planned", neutral).
9. **Contact** (`#contact`): surface-fill container radius ~26px padding 56px, grid 1fr/1.2fr. Left: H2 "Contact us", blurb, address block (401 W. Ontario Street / Chicago, IL 60654 / leasing@birkenlofts.com `[confirm email]`). Right: form, 2-col grid gap 18px — Name, Email, Phone, Interested in, Message (textarea, full row), primary pill "Send message". Pill inputs (999px radius, 1px divider border, accent caret/focus). Wire to the client's form handler (none specified yet — a simple API route + email is fine).
10. **Footer**: neutral-900 ground, cream brand text, 13px: brand + "S. Birkenstein & Sons Building · Built 1905 / 401 W. Ontario Street, Chicago, IL 60654"; link row: Residences, History, Gallery, Traffic Cam, Blog, Resident Portal, Contact.

### 2. Traffic Cam (`/traffic-cam`) — see `traffic-cam.dc.html`
Same nav (Traffic Cam gets `aria-current`) and footer.
- Header: sage tag "Live · 24/7", H1 50px "Ohio Feeder Ramp Cam".
- Full-width (page padding only) 16:9 video container, radius ~22px, neutral-900 background: a YouTube live embed (`https://www.youtube.com/embed/<VIDEO_ID>?autoplay=1&mute=1`, allowfullscreen). **VIDEO_ID `[TBD]`** — it's the existing stream on birkenlofts.com/ohio-feeder-ramp-cam/; get the ID from the current site's embed. Show a striped placeholder panel until configured.
- Below the video, full-width text stack (gap 14px): 18px "Live view of the Ohio Street feeder ramp to the Kennedy Expressway, looking west from the south elevation of the S. Birkenstein & Sons Building." · 16px neutral-700 "The camera streams 24/7. Refresh the page if the stream stalls." · 13px neutral-500 "Stream provided for neighborhood traffic awareness. Footage is not recorded."

## Interactions & Behavior
- Nav/footer links: internal anchors on home; `<Link>` across pages. Hover: accent color on text links, ramp-step-darker on buttons.
- Form: client-side required validation on Name + Email; success state = inline confirmation replacing the form (design not drawn — keep simple, same card).
- Map: interactive embed, non-blocking (lazy-load below the fold).
- No animations required; optional gentle fade-up on section entry is acceptable but not designed.
- Responsive behavior is **not designed yet** (desktop 1280–1440 reference). Use sensible stacking (grids → single column ≤ 768px, nav collapses to a menu). Flag anything ambiguous rather than inventing.

## State Management
Minimal: contact form state (fields, submitting, success/error). Everything else is static content — prefer server components. Tour/scheduling functionality is explicitly out of scope.

## Assets
- No photography exists yet — every image area is a placeholder slot. Aspect/masks per section above. When photos arrive, apply the washed filter treatment.
- History section expects an archival image (1916 advertisement or period photo — client has these in an SHPO PDF).
- Fonts: Caprasimo + Figtree (Google Fonts).
- Icons: Lucide (`lucide-react`).

## Files
- `home.dc.html` — Home page design source
- `traffic-cam.dc.html` — Traffic Cam page design source
- `styles.css` — Organic design-system tokens + component classes (source of truth for all values)

An alternate "Classical" direction was explored and rejected; only this Organic direction should be implemented.
