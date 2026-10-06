# Cloudflare hosting migration — Design

**Date:** 2026-10-06
**Status:** Draft, awaiting review

## Goal

Serve birkenlofts.com from Cloudflare instead of GitHub Pages, with pushes to
`main` still deploying automatically — and with visitors and search engines
noticing nothing.

The site itself does not change: same Next.js 15 static export, same `out/`
folder, same URLs. The Astro question is a separate, later decision.

### Success criteria

1. Every URL returns the same status, redirect target and content as before:
   all sitemap URLs, `/history` → `/history/`, `www` → apex, `http` → `https`,
   `/robots.txt`, `/sitemap.xml`, `/llms.txt`, `/llms-full.txt`, the 404 page
   for unknown paths, and images.
2. No downtime during the switch.
3. A documented way back to GitHub Pages that takes minutes.
4. Every branch and pull request gets a preview link; previews are never
   indexed by search engines and never count in Google Analytics.

### Current state (verified 2026-10-06)

- DNS for `birkenlofts.com` is already on Cloudflare (`kai`/`tricia.ns.cloudflare.com`),
  proxied, in front of GitHub Pages. No MX records; one Google site-verification
  TXT record (must be kept).
- `.github/workflows/deploy.yml` builds with Node 22 (`npm ci && npm run build`)
  and publishes `out/` to Pages. `public/CNAME` and `public/.nojekyll` are
  Pages-only.
- `out/404.html` is produced by the build.
- `www` → apex and `http` → `https` redirects work today; whether Cloudflare
  or GitHub performs the `www` redirect is unknown until step 1.
- HTML is served with `cache-control: max-age=600` and is not edge-cached.
- Wrangler is logged in to the single account `Drew@monroeresidential.com's Account`.

### Out of scope

Any change to site content, design or framework; the `/progress/` page
(waits on the progress-photos service); changes to the CARTO key.

## Design

### Hosting product

**Cloudflare Workers with static assets** — no Worker script, assets only.
Cloudflare's recommended product for new static sites (Pages receives no new
features).

### Repo changes

**`wrangler.jsonc`**

```jsonc
{
  "name": "birken-lofts",
  "compatibility_date": "2026-10-01",
  "assets": {
    "directory": "./out",
    "html_handling": "auto-trailing-slash",   // /history → 301 /history/, matching today
    "not_found_handling": "404-page"          // serves out/404.html with status 404
  },
  "workers_dev": true,                        // set to false at cutover (step 3)
  "preview_urls": true
}
```

**`public/_headers`** (copied into `out/` by the build):

```
/_next/static/*
  Cache-Control: public, max-age=31536000, immutable

/images/*
  Cache-Control: public, max-age=604800

/*
  X-Content-Type-Options: nosniff
```

`_next/static` filenames are content-hashed, so a year is safe. Files under
`images/` keep stable names when regenerated, so they get 7 days. HTML keeps
Cloudflare's default revalidating behaviour so deploys show up immediately.

**`.node-version`**: `22`, so Cloudflare's build matches the current CI.

**`components/Analytics.tsx`**: load GA only when
`location.hostname === 'birkenlofts.com'`, so preview and local visits are
never counted.

**Removed at cleanup (step 5), not before:** `.github/workflows/deploy.yml`,
`public/CNAME`, `public/.nojekyll`.

### Build (Workers Builds)

Connected in the Cloudflare dashboard to `Birken-Lofts/401-w-ontario.github.io`:

| Setting | Value |
|---|---|
| Production branch | `main` |
| Build command | `npm run build` |
| Deploy command | `npx wrangler deploy` |
| Non-production branches | build + `npx wrangler versions upload` (preview link) |

Workers Builds installs dependencies from `package-lock.json` before the
build command. A failed build or typecheck deploys nothing, as today.

### Preview links

- **Indexing:** before relying on previews, confirm their responses carry
  `X-Robots-Tag: noindex`. If they do not, protect preview URLs with the
  existing Zero Trust Access org (the Workers "protect preview URLs" setting),
  which also keeps them private.
- **Map:** previews show no map tiles, because the CARTO key is restricted to
  `birkenlofts.com`. This is expected; add the preview hostname to the key's
  allowed list if map previews are ever needed.
- **Contact form:** submissions from a preview are real Formspree submissions.

## Cutover

### Step 1 — Record current state (no changes)

Export to `docs/superpowers/notes/2026-10-06-pre-migration-dns.md`: every DNS
record for the zone (type, name, content, proxied), every Redirect Rule, Page
Rule, Cache Rule and Transform Rule, and the SSL/TLS mode and "Always Use
HTTPS" setting. This is the rollback recipe and tells us who performs the
`www` redirect.

### Step 2 — Build and verify on `workers.dev` (live site untouched)

1. Merge the repo changes; connect Workers Builds; the first deploy serves at
   `birken-lofts.<subdomain>.workers.dev`. GitHub Pages keeps serving
   birkenlofts.com.
2. `scripts/compare-hosts.mjs` (new): for every URL in `out/sitemap.xml`
   plus the fixed list in Success criterion 1, a sample of 20 images, and
   one unknown path, request both hosts with redirects **not** followed and
   compare status, `Location` (normalised to a path) and a SHA-256 of the
   body. Prints a table; exits non-zero on any mismatch.
3. `npm run verify-guide` against the `workers.dev` URL.

### Step 3 — Switch (needs explicit go-ahead)

1. Add `birkenlofts.com` and `www.birkenlofts.com` as Custom Domains on the
   `birken-lofts` Worker. Cloudflare replaces the existing apex/`www` records;
   the Universal SSL certificate is already active, so there is no gap.
2. If step 1 showed GitHub was doing the `www` redirect, add a Redirect Rule:
   `www.birkenlofts.com/*` → `https://birkenlofts.com/${1}`, 301, preserve
   query string.
3. Set `workers_dev: false` and redeploy, so production exists only at
   birkenlofts.com.
4. Re-run `compare-hosts.mjs` with the live domain against the step-2
   `workers.dev` baseline, plus `verify-guide` against production; manually
   check the home map (tiles load with the key), a contact-form submission,
   and one PageSpeed Insights mobile run (take the median of 3, per the
   site's PSI notes).

### Step 4 — Fallback window (7 days)

The GitHub Pages workflow keeps deploying on every push, so the old copy
stays current. **Rollback:** remove the Custom Domains from the Worker and
restore the apex/`www` records from the step-1 export (proxied). Expected
time: a few minutes.

### Step 5 — Cleanup (after 7 clean days)

Delete `.github/workflows/deploy.yml`, `public/CNAME`, `public/.nojekyll`;
disable Pages in the repo settings; update `CLAUDE.md`/`AGENTS.md` Deploy
sections and the site-status memory.

## Risks

| Risk | Mitigation |
|---|---|
| Trailing-slash or 404 behaviour differs from Pages | `compare-hosts.mjs` checks every URL before the switch |
| `www` redirect silently disappears | Step 1 identifies who does it; step 3.2 recreates it if needed |
| Previews indexed by Google | Verify `X-Robots-Tag`; fall back to Access-protected previews |
| Stale images after regenerating with the same name | 7-day image cache; purge the zone cache when images are regenerated |
| Build differs on Cloudflare (Node version, missing tools) | `.node-version`; the build needs only Node — no Python, network or browser |
| Something unforeseen after the switch | 7-day fallback with a recorded DNS rollback |
