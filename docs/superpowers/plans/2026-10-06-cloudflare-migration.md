# Cloudflare Hosting Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Serve birkenlofts.com from a Cloudflare Worker (static assets) instead of GitHub Pages, with identical URLs and behaviour, preview links per branch, and a one-step rollback.

**Architecture:** An assets-only Worker (`birken-lofts`) serves the existing Next.js static export in `out/`, built and deployed by Cloudflare Workers Builds on every push. At cutover a Worker route `birkenlofts.com/*` is placed in front of the existing proxied DNS records, so no DNS changes are needed. A comparison script proves the new host serves byte-identical responses before and after the switch.

**Tech Stack:** Next.js 15 (`output: 'export'`), Cloudflare Workers static assets, Wrangler 4, Workers Builds, Node 22, `node --test`.

**Spec:** `docs/superpowers/specs/2026-10-06-cloudflare-migration-design.md`

## Global Constraints

- No change to site content, design, framework or URLs.
- Worker name: `birken-lofts`. `compatibility_date`: `2026-10-01`.
- Assets: `directory: ./out`, `html_handling: auto-trailing-slash`, `not_found_handling: 404-page`.
- Caching: `/_next/static/*` → `public, max-age=31536000, immutable`; `/images/*` → `public, max-age=604800`; HTML must never be `immutable`.
- Node 22 (`.node-version`).
- GA loads only when `location.hostname === 'birkenlofts.com'`.
- Keep the `google-site-verification` TXT record.
- The GitHub Pages workflow, `public/CNAME` and `public/.nojekyll` stay until Task 8 (7 clean days after cutover).
- **Task 7 changes the live site — it needs the user's explicit go-ahead.** Tasks 1 and 6 need the user's dashboard clicks.
- No other site changes are merged between Task 6 and Task 7 (the Task 6 snapshot must match the commit being switched).
- `npm run build` stays the gate; `npm test` must pass.

## Review Focus

1. **Campaign links with query strings** (`/?utm_source=…`) must return the same page, not a redirect or 404 → `/?utm_source=compare-hosts` is in the fixed path list (Task 4).
2. **Every page without its trailing slash** (`/blog/<slug>`) must 301 to the slash form, not just `/history` → Task 4 derives a no-slash variant of every sitemap path.
3. **Deep `www` links with query strings** (`www.birkenlofts.com/history/?x=1`) must land on the same path and query on the apex → redirect checks in Task 4, baselined against today's behaviour in Task 1.
4. **Unknown URLs must return status 404**, not a soft-404 200 → `/this-page-does-not-exist/` in the fixed list, compared by status and body (Task 4), and asserted locally (Task 5).
5. **A wrong `_headers` glob that makes HTML `immutable`** would pin stale pages in browsers for a year → `cacheProblem()` flags any non-`_next/static` path carrying `immutable` (Task 4), run against local, `workers.dev` and production (Tasks 5–7).

---

## File Structure

| File | Responsibility |
|---|---|
| `docs/superpowers/notes/2026-10-06-pre-migration-dns.md` (create) | Snapshot of DNS, rules and redirect behaviour — the rollback record |
| `next.config.ts` (modify) | Deterministic build id = git SHA |
| `lib/analytics.ts` (create) + `lib/analytics.test.mts` | `shouldLoadAnalytics(hostname)` |
| `components/Analytics.tsx` (modify) | Calls the gate before wiring listeners |
| `lib/compare-hosts.ts` (create) + `lib/compare-hosts.test.mts` | Pure helpers: path lists, Location normalisation, diffs, redirect and cache checks |
| `scripts/compare-hosts.mts` (create) | CLI: probes hosts, compares, saves snapshots |
| `wrangler.jsonc` (create) | Worker + assets config; routes added at cutover |
| `public/_headers` (create) | Cache headers |
| `.node-version` (create) | `22` |
| `package.json` (modify) | `wrangler` devDependency, `compare-hosts` script |
| `.github/workflows/deploy.yml`, `public/CNAME`, `public/.nojekyll` (delete in Task 8) | GitHub Pages only |
| `CLAUDE.md`, `AGENTS.md` (modify in Task 8) | Deploy section |

---

### Task 1: Record the current state

**Files:**
- Create: `docs/superpowers/notes/2026-10-06-pre-migration-dns.md`

**Interfaces:** Produces the rollback record and the answer to "who does the `www` redirect?" used in Task 7.

- [ ] **Step 1: Ask the user to export DNS and list rules**

Ask the user to, in the Cloudflare dashboard for `birkenlofts.com`:
1. **DNS → Records → Import and Export → Export** and paste the file contents.
2. Screenshot or list anything under **Rules → Overview** (Redirect Rules, Page Rules, Cache Rules, Transform Rules), and report **SSL/TLS → Overview** mode and **SSL/TLS → Edge Certificates → Always Use HTTPS**.

- [ ] **Step 2: Capture today's redirect behaviour**

Run:
```bash
for u in http://birkenlofts.com/ https://www.birkenlofts.com/ "https://www.birkenlofts.com/history/?x=1" https://birkenlofts.com/history; do
  printf '%s -> ' "$u"; curl -s -o /dev/null -w '%{http_code} %{redirect_url}\n' "$u"
done
curl -sI https://www.birkenlofts.com/ | grep -i -E '^(server|x-github-request-id)'
```
Expected: four 301 lines. If the `www` response carries `x-github-request-id`, GitHub performs the `www` redirect; if a Redirect Rule for `www` appears in Step 1's list, Cloudflare does.

- [ ] **Step 3: Write the notes file**

Record: the exported DNS records (verbatim, in a code block), the rules list, SSL mode, Always Use HTTPS, the Step 2 output, and one line stating **who performs the `www` redirect** and **whether it preserves path and query**.

- [ ] **Step 4: Commit**

```bash
git add docs/superpowers/notes/2026-10-06-pre-migration-dns.md
git commit -m "Record birkenlofts.com DNS and redirect state before the Cloudflare move"
```

---

### Task 2: Deterministic build id

**Files:**
- Modify: `next.config.ts`

**Interfaces:** Produces byte-identical `out/` for two builds of the same commit (relied on by Tasks 6–7).

- [ ] **Step 1: Show the problem**

```bash
npm run build && cp -R out /tmp/out-a && npm run build && diff -rq /tmp/out-a out | head
```
Expected: differences (HTML files containing the random build id).

- [ ] **Step 2: Implement**

`next.config.ts`:
```ts
import type { NextConfig } from 'next';
import { execSync } from 'node:child_process';

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  // Build id = commit SHA, so GitHub's and Cloudflare's builds of the same
  // commit emit identical HTML (scripts/compare-hosts.mts compares by hash).
  generateBuildId: async () => {
    try {
      return execSync('git rev-parse HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
    } catch {
      return null; // no git: fall back to Next's random id
    }
  },
};

export default nextConfig;
```

- [ ] **Step 3: Verify**

```bash
rm -rf /tmp/out-a && npm run build && cp -R out /tmp/out-a && npm run build && diff -rq /tmp/out-a out && echo IDENTICAL
```
Expected: `IDENTICAL`. If differences remain, list the differing files and stop to investigate before continuing — Task 6's comparison depends on this.

- [ ] **Step 4: Commit**

```bash
git add next.config.ts
git commit -m "Use the commit SHA as the Next build id so builds are reproducible"
```

---

### Task 3: Load GA only on the production host

**Files:**
- Create: `lib/analytics.ts`, `lib/analytics.test.mts`
- Modify: `components/Analytics.tsx`

**Interfaces:**
- Produces: `export const PRODUCTION_HOST = 'birkenlofts.com'`; `export function shouldLoadAnalytics(hostname: string): boolean`

- [ ] **Step 1: Write the failing test** — `lib/analytics.test.mts`

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { shouldLoadAnalytics } from './analytics.ts';

test('loads on the production host', () => {
  assert.equal(shouldLoadAnalytics('birkenlofts.com'), true);
});

test('skips previews, workers.dev, www and local', () => {
  for (const host of [
    'birken-lofts.example.workers.dev',
    'abc123-birken-lofts.example.workers.dev',
    'www.birkenlofts.com',
    'localhost',
    '127.0.0.1',
    '',
  ]) {
    assert.equal(shouldLoadAnalytics(host), false, host);
  }
});
```

- [ ] **Step 2: Run it, expect failure**

Run: `npm test`
Expected: FAIL — cannot find module `./analytics.ts`.

- [ ] **Step 3: Implement** — `lib/analytics.ts`

```ts
export const PRODUCTION_HOST = 'birkenlofts.com';

/** GA runs only on the real site — never on previews, workers.dev or localhost. */
export function shouldLoadAnalytics(hostname: string): boolean {
  return hostname === PRODUCTION_HOST;
}
```

- [ ] **Step 4: Run tests, expect pass**

Run: `npm test`
Expected: all tests PASS (guide tests + 2 new).

- [ ] **Step 5: Wire it in** — `components/Analytics.tsx`

Add the import below the existing `react` import:
```ts
import { shouldLoadAnalytics } from '@/lib/analytics';
```
and make the first line of the `useEffect` body:
```ts
    if (!shouldLoadAnalytics(location.hostname)) return;
```

- [ ] **Step 6: Build**

Run: `npm run build`
Expected: succeeds.

- [ ] **Step 7: Commit**

```bash
git add lib/analytics.ts lib/analytics.test.mts components/Analytics.tsx
git commit -m "Load Google Analytics only on birkenlofts.com"
```

---

### Task 4: Host comparison tool

**Files:**
- Create: `lib/compare-hosts.ts`, `lib/compare-hosts.test.mts`, `scripts/compare-hosts.mts`
- Modify: `package.json` (add `"compare-hosts": "node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON scripts/compare-hosts.mts"`)

**Interfaces:**
- Produces (`lib/compare-hosts.ts`):
  - `type Probe = { path: string; status: number; location: string | null; sha256: string | null; cacheControl: string | null }`
  - `sitemapPaths(xml: string): string[]`
  - `withoutTrailingSlash(paths: string[]): string[]`
  - `normalizeLocation(location: string | null, origin: string): string | null`
  - `diffProbes(a: Probe, b: Probe): string[]`
  - `redirectProblem(status: number, location: string | null, expected: string): string | null`
  - `cacheProblem(path: string, cacheControl: string | null): string | null`
- Produces (CLI): `npm run compare-hosts -- [--a <origin|snapshot.json>] [--b <origin>] [--save <file>] [--headers <origin>] [--redirects]`; exits 1 on any problem.

- [ ] **Step 1: Write the failing tests** — `lib/compare-hosts.test.mts`

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  sitemapPaths, withoutTrailingSlash, normalizeLocation, diffProbes,
  redirectProblem, cacheProblem, type Probe,
} from './compare-hosts.ts';

test('sitemapPaths extracts pathnames from <loc>', () => {
  const xml = `<urlset><url><loc>https://birkenlofts.com/</loc></url>
    <url><loc> https://birkenlofts.com/blog/hello/ </loc></url></urlset>`;
  assert.deepEqual(sitemapPaths(xml), ['/', '/blog/hello/']);
});

test('withoutTrailingSlash strips the slash and skips the root', () => {
  assert.deepEqual(withoutTrailingSlash(['/', '/history/', '/robots.txt']), ['/history']);
});

test('normalizeLocation keeps same-origin redirects as path+query', () => {
  assert.equal(normalizeLocation('/history/', 'https://a.dev'), '/history/');
  assert.equal(normalizeLocation('https://a.dev/history/?x=1', 'https://a.dev'), '/history/?x=1');
  assert.equal(normalizeLocation('https://other.dev/x', 'https://a.dev'), 'https://other.dev/x');
  assert.equal(normalizeLocation(null, 'https://a.dev'), null);
});

const p = (o: Partial<Probe>): Probe =>
  ({ path: '/', status: 200, location: null, sha256: 'h', cacheControl: null, ...o });

test('diffProbes reports each differing field', () => {
  assert.deepEqual(diffProbes(p({}), p({})), []);
  assert.deepEqual(diffProbes(p({ status: 200 }), p({ status: 404 })), ['status 200 ≠ 404']);
  assert.deepEqual(diffProbes(p({ location: '/a/' }), p({ location: null })), ['location /a/ ≠ null']);
  assert.deepEqual(diffProbes(p({ sha256: 'x' }), p({ sha256: 'y' })), ['body differs']);
});

test('redirectProblem accepts 301/308 to the exact target only', () => {
  assert.equal(redirectProblem(301, 'https://birkenlofts.com/', 'https://birkenlofts.com/'), null);
  assert.equal(redirectProblem(308, 'https://birkenlofts.com/', 'https://birkenlofts.com/'), null);
  assert.match(redirectProblem(302, 'https://birkenlofts.com/', 'https://birkenlofts.com/')!, /expected 301/);
  assert.match(redirectProblem(301, 'https://birkenlofts.com/', 'https://birkenlofts.com/?x=1')!, /expected Location/);
});

test('cacheProblem: hashed assets immutable, everything else not', () => {
  assert.equal(cacheProblem('/_next/static/chunks/a.js', 'public, max-age=31536000, immutable'), null);
  assert.match(cacheProblem('/_next/static/chunks/a.js', 'max-age=600')!, /expected immutable/);
  assert.equal(cacheProblem('/', 'public, max-age=0, must-revalidate'), null);
  assert.equal(cacheProblem('/history/', null), null);
  assert.match(cacheProblem('/', 'public, max-age=31536000, immutable')!, /must not be immutable/);
  assert.match(cacheProblem('/images/guide/a-480w.webp', 'immutable')!, /must not be immutable/);
});
```

- [ ] **Step 2: Run, expect failure**

Run: `npm test`
Expected: FAIL — cannot find module `./compare-hosts.ts`.

- [ ] **Step 3: Implement** — `lib/compare-hosts.ts`

```ts
export type Probe = {
  path: string;
  status: number;
  location: string | null; // normalised with normalizeLocation
  sha256: string | null;   // body hash for 2xx and 404, else null
  cacheControl: string | null;
};

export function sitemapPaths(xml: string): string[] {
  return [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => new URL(m[1]).pathname);
}

export function withoutTrailingSlash(paths: string[]): string[] {
  return paths.filter((p) => p !== '/' && p.endsWith('/')).map((p) => p.slice(0, -1));
}

/** Same-origin redirects become path+query so two hosts can be compared. */
export function normalizeLocation(location: string | null, origin: string): string | null {
  if (location === null) return null;
  const url = new URL(location, origin);
  return url.origin === new URL(origin).origin ? url.pathname + url.search : url.href;
}

export function diffProbes(a: Probe, b: Probe): string[] {
  const out: string[] = [];
  if (a.status !== b.status) out.push(`status ${a.status} ≠ ${b.status}`);
  if (a.location !== b.location) out.push(`location ${a.location} ≠ ${b.location}`);
  if (a.sha256 !== b.sha256) out.push('body differs');
  return out;
}

export function redirectProblem(status: number, location: string | null, expected: string): string | null {
  if (status !== 301 && status !== 308) return `expected 301/308, got ${status}`;
  if (location !== expected) return `expected Location ${expected}, got ${location}`;
  return null;
}

/** Only content-hashed Next assets may be immutable; HTML and images must not be. */
export function cacheProblem(path: string, cacheControl: string | null): string | null {
  const immutable = /\bimmutable\b/.test(cacheControl ?? '');
  if (path.startsWith('/_next/static/')) return immutable ? null : `expected immutable, got ${cacheControl}`;
  return immutable ? `must not be immutable, got ${cacheControl}` : null;
}
```

- [ ] **Step 4: Run tests, expect pass**

Run: `npm test`
Expected: all PASS.

- [ ] **Step 5: Implement the CLI** — `scripts/compare-hosts.mts`

```ts
/**
 * Compares two hosts serving this site, response by response.
 *
 *   npm run compare-hosts -- --a https://birkenlofts.com --b https://x.workers.dev --save snap.json
 *   npm run compare-hosts -- --a snap.json --b https://birkenlofts.com
 *   npm run compare-hosts -- --headers https://x.workers.dev
 *   npm run compare-hosts -- --redirects
 *
 * Paths come from the local build (out/), so run `npm run build` at the same
 * commit the hosts are serving. Exits 1 on any problem.
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { parseArgs } from 'node:util';
import {
  sitemapPaths, withoutTrailingSlash, normalizeLocation, diffProbes,
  redirectProblem, cacheProblem, type Probe,
} from '../lib/compare-hosts.ts';

const { values: args } = parseArgs({
  options: {
    a: { type: 'string' },
    b: { type: 'string' },
    save: { type: 'string' },
    headers: { type: 'string' },
    redirects: { type: 'boolean', default: false },
  },
});

const FIXED = [
  '/', '/history', '/?utm_source=compare-hosts', '/robots.txt', '/sitemap.xml',
  '/llms.txt', '/llms-full.txt', '/favicon.svg', '/this-page-does-not-exist/',
];

const REDIRECTS: [string, string][] = [
  ['http://birkenlofts.com/', 'https://birkenlofts.com/'],
  ['https://www.birkenlofts.com/', 'https://birkenlofts.com/'],
  ['https://www.birkenlofts.com/history/?x=1', 'https://birkenlofts.com/history/?x=1'],
  ['https://birkenlofts.com/history', 'https://birkenlofts.com/history/'],
];

function imagePaths(n = 20): string[] {
  const all = readdirSync('out/images/guide').filter((f) => f.endsWith('.webp')).sort();
  const step = Math.ceil(all.length / n);
  return all.filter((_, i) => i % step === 0).map((f) => `/images/guide/${f}`);
}

function nextStaticPath(): string {
  const f = readdirSync('out/_next/static/chunks').find((x) => x.endsWith('.js'));
  if (!f) throw new Error('no chunk in out/_next/static/chunks — run npm run build');
  return `/_next/static/chunks/${f}`;
}

function allPaths(): string[] {
  const pages = sitemapPaths(readFileSync('out/sitemap.xml', 'utf8'));
  return [...new Set([...pages, ...withoutTrailingSlash(pages), ...FIXED, ...imagePaths(), nextStaticPath()])];
}

async function probe(origin: string, path: string): Promise<Probe> {
  const res = await fetch(origin + path, { redirect: 'manual' });
  const body = Buffer.from(await res.arrayBuffer());
  const hashed = (res.status >= 200 && res.status < 300) || res.status === 404;
  return {
    path,
    status: res.status,
    location: normalizeLocation(res.headers.get('location'), origin),
    sha256: hashed ? createHash('sha256').update(body).digest('hex') : null,
    cacheControl: res.headers.get('cache-control'),
  };
}

async function probeAll(src: string, paths: string[]): Promise<Map<string, Probe>> {
  if (src.endsWith('.json')) {
    const saved: Probe[] = JSON.parse(readFileSync(src, 'utf8'));
    return new Map(saved.map((p) => [p.path, p]));
  }
  const out = new Map<string, Probe>();
  for (const path of paths) out.set(path, await probe(src.replace(/\/$/, ''), path));
  return out;
}

let problems = 0;
const report = (what: string, msgs: string[]) => {
  for (const m of msgs) console.log(`✗ ${what}: ${m}`);
  problems += msgs.length;
};

const paths = allPaths();

if (args.a && args.b) {
  const [a, b] = [await probeAll(args.a, paths), await probeAll(args.b, paths)];
  if (args.save) writeFileSync(args.save, JSON.stringify([...a.values()], null, 2) + '\n');
  for (const path of paths) {
    const pa = a.get(path), pb = b.get(path);
    if (!pa || !pb) { report(path, [`missing from ${pa ? 'b' : 'a'}`]); continue; }
    report(path, diffProbes(pa, pb));
  }
  console.log(`compared ${paths.length} paths: ${args.a} vs ${args.b}`);
}

if (args.headers) {
  const h = await probeAll(args.headers, paths);
  for (const p of h.values()) if (p.status === 200) {
    const msg = cacheProblem(p.path, p.cacheControl);
    if (msg) report(`${p.path} (cache)`, [msg]);
  }
  console.log(`checked cache headers on ${args.headers}`);
}

if (args.redirects) {
  for (const [from, to] of REDIRECTS) {
    const res = await fetch(from, { redirect: 'manual' });
    const loc = res.headers.get('location');
    const msg = redirectProblem(res.status, loc && new URL(loc, from).href, to);
    if (msg) report(from, [msg]);
  }
  console.log(`checked ${REDIRECTS.length} redirects`);
}

if (!args.redirects && !args.headers && !(args.a && args.b)) {
  console.error('nothing to do — pass --a/--b, --headers or --redirects');
  process.exit(2);
}
console.log(problems ? `${problems} problem(s)` : 'OK');
process.exit(problems ? 1 : 0);
```

Add to `package.json` `scripts`:
```json
"compare-hosts": "node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON scripts/compare-hosts.mts",
```

- [ ] **Step 6: Baseline today's redirects**

Run: `npm run compare-hosts -- --redirects`
Expected: `OK`. If the `www … ?x=1` line fails, today's `www` redirect drops the query or path — record that in the Task 1 notes, and change that `REDIRECTS` entry to match today's actual behaviour (the goal is "no change", not "better").

- [ ] **Step 7: Smoke-test the comparison against itself**

Run: `npm run build && npm run compare-hosts -- --a https://birkenlofts.com --b https://birkenlofts.com`
Expected: `OK` (proves the path list resolves and probing works). A host compared with itself can only differ if its responses vary between requests — if that happens, find out which paths and why before relying on the tool.

- [ ] **Step 8: Commit**

```bash
git add lib/compare-hosts.ts lib/compare-hosts.test.mts scripts/compare-hosts.mts package.json
git commit -m "Add compare-hosts to diff the site across hosts before and after the move"
```

---

### Task 5: Cloudflare config, verified locally

**Files:**
- Create: `wrangler.jsonc`, `public/_headers`, `.node-version`
- Modify: `package.json`, `package-lock.json` (`wrangler` devDependency)

**Interfaces:** Consumes `compare-hosts --headers` (Task 4). Produces the deployable Worker config used by Task 6.

- [ ] **Step 1: Add wrangler**

Run: `npm i -D wrangler@4`

- [ ] **Step 2: Create `wrangler.jsonc`**

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "birken-lofts",
  "compatibility_date": "2026-10-01",
  "assets": {
    "directory": "./out",
    "html_handling": "auto-trailing-slash",
    "not_found_handling": "404-page"
  },
  "workers_dev": true,
  "preview_urls": true
}
```

- [ ] **Step 3: Create `public/_headers`**

```
/_next/static/*
  Cache-Control: public, max-age=31536000, immutable

/images/*
  Cache-Control: public, max-age=604800

/*
  X-Content-Type-Options: nosniff
```

- [ ] **Step 4: Create `.node-version`**

```
22
```

- [ ] **Step 5: Build and serve locally**

Run: `npm run build && npx wrangler dev --port 8787` (in the background), then:
```bash
curl -s -o /dev/null -w '%{http_code} %{redirect_url}\n' http://localhost:8787/history
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:8787/
curl -s -o /dev/null -w '%{http_code}\n' "http://localhost:8787/?utm_source=x"
curl -s -w '\n%{http_code}\n' http://localhost:8787/this-page-does-not-exist/ | tail -1
curl -s http://localhost:8787/this-page-does-not-exist/ | diff -q - out/404.html && echo SAME-404
npm run compare-hosts -- --headers http://localhost:8787
```
Expected: `301 http://localhost:8787/history/`, `200`, `200`, `404`, `SAME-404`, and `OK` from the header check. Stop the dev server afterwards.

- [ ] **Step 6: Run the gates**

Run: `npm test && npm run build`
Expected: both pass.

- [ ] **Step 7: Commit**

```bash
git add wrangler.jsonc public/_headers .node-version package.json package-lock.json
git commit -m "Add Cloudflare Workers static-assets config"
```

---

### Task 6: Connect Workers Builds and verify on workers.dev

**Files:** none (dashboard + verification). Produces `docs/superpowers/notes/2026-10-06-gh-pages-snapshot.json`.

**Interfaces:** Consumes Tasks 2–5 on `main`. Produces the snapshot Task 7 compares against.

- [ ] **Step 1: Push Tasks 1–5**

Run: `git push origin main`. This also redeploys GitHub Pages (expected and harmless: same site, now with the SHA build id and the GA host gate).

- [ ] **Step 2: User connects the repo**

Ask the user, in the Cloudflare dashboard: **Workers & Pages → Create → Import a repository** → GitHub → `Birken-Lofts/401-w-ontario.github.io`. Settings:
- Project name: `birken-lofts`
- Build command: `npm run build`
- Deploy command: `npx wrangler deploy`
- Non-production branch builds: **enabled**, deploy command `npx wrangler versions upload`

Then wait for the first build to finish and note the `workers.dev` URL (`WD` below).

- [ ] **Step 3: Confirm both hosts serve the same commit**

```bash
gh run list --workflow deploy.yml --limit 1 --json headSha,conclusion
git rev-parse HEAD
```
And check the Cloudflare build shows the same commit. Expected: same SHA, both successful.

- [ ] **Step 4: Compare and save the snapshot**

```bash
npm run build
npm run compare-hosts -- --a https://birkenlofts.com --b "$WD" --save docs/superpowers/notes/2026-10-06-gh-pages-snapshot.json
npm run compare-hosts -- --headers "$WD"
```
Expected: `OK` from both. Any mismatch is a blocker — investigate before continuing.

- [ ] **Step 5: Run the guide browser suite against workers.dev**

```bash
npm i --no-save playwright && npx playwright install chromium
URL="$WD/things-to-do-river-north/" npm run verify-guide
```
Expected: all 53 checks pass.

- [ ] **Step 6: Check previews are not indexable**

Push a throwaway branch to get a preview URL (`PV`):
```bash
git switch -c preview-check && git commit --allow-empty -m "Preview check" && git push -u origin preview-check
```
After its build finishes (URL in the build log), run: `curl -sI "$PV" | grep -i -E '^x-robots-tag|^HTTP|^location'`
- If `X-Robots-Tag: noindex` is present → fine.
- If not → ask the user to enable **Cloudflare Access for preview URLs** (Worker → Settings → Domains & Routes → Preview URLs) and re-run; expected a `302` to `*.cloudflareaccess.com`.

Clean up: `git switch main && git push origin --delete preview-check && git branch -D preview-check`.

- [ ] **Step 7: Commit the snapshot**

```bash
git add docs/superpowers/notes/2026-10-06-gh-pages-snapshot.json
git commit -m "Snapshot GitHub Pages responses as the cutover baseline"
```
Do **not** push yet if pushing would change the site — this commit only adds a doc, so pushing is safe but not required before Task 7.

---

### Task 7: Cutover (requires the user's go-ahead)

**Files:**
- Modify: `wrangler.jsonc`

**Interfaces:** Consumes the Task 1 notes (who does `www`) and the Task 6 snapshot.

- [ ] **Step 1: Get explicit go-ahead from the user.** Do not proceed without it.

- [ ] **Step 1b: Turn on Always Use HTTPS first**

GitHub Pages performs today's `http` → `https` 301 (it carries `x-github-request-id`), so once the Worker route is live, plain-HTTP requests would get a 200 over HTTP. Ask the user: **SSL/TLS → Edge Certificates → Always Use HTTPS → On**. Verify: `curl -sI http://birkenlofts.com/ | grep -i -E '^HTTP|^location|x-github'` → `301`, `Location: https://birkenlofts.com/`, and **no** `x-github-request-id`.

- [ ] **Step 2: If GitHub performs the `www` redirect (Task 1 notes), add the Redirect Rule first**

Ask the user: **Rules → Redirect Rules → Create** — *When* hostname equals `www.birkenlofts.com`; *Then* Dynamic, expression `concat("https://birkenlofts.com", http.request.uri.path)`, status 301, **preserve query string** on. Verify: `npm run compare-hosts -- --redirects` → `OK`.

- [ ] **Step 3: Add the route and disable workers.dev** — `wrangler.jsonc`

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "birken-lofts",
  "compatibility_date": "2026-10-01",
  "assets": {
    "directory": "./out",
    "html_handling": "auto-trailing-slash",
    "not_found_handling": "404-page"
  },
  "routes": [{ "pattern": "birkenlofts.com/*", "zone_name": "birkenlofts.com" }],
  "workers_dev": false,
  "preview_urls": true
}
```

- [ ] **Step 4: Commit and push**

```bash
git add wrangler.jsonc
git commit -m "Serve birkenlofts.com from the Cloudflare Worker"
git push origin main
```
Wait for the Workers Build to finish.

- [ ] **Step 5: Confirm the Worker is serving**

Run: `curl -sI https://birkenlofts.com/ | grep -i -E '^x-github-request-id|^x-content-type-options'`
Expected: `x-content-type-options: nosniff` present and **no** `x-github-request-id`.

- [ ] **Step 6: Verify against the baseline**

```bash
npm run build
npm run compare-hosts -- --a docs/superpowers/notes/2026-10-06-gh-pages-snapshot.json --b https://birkenlofts.com --headers https://birkenlofts.com --redirects
URL=https://birkenlofts.com/things-to-do-river-north/ npm run verify-guide
```
Expected: `OK`; 53/53. (The build must be at the Task 6 commit's content — the cutover commit changed only `wrangler.jsonc`, which is not in `out/`.)

- [ ] **Step 7: Manual checks**

- Home page map at ≥1024px: tiles load (CARTO key works on the Worker).
- Contact form: submit one test message; confirm it arrives.
- PageSpeed Insights mobile for `https://birkenlofts.com/`: median of 3 runs, compare with the baseline in the site-status memory.

- [ ] **Step 8: If anything fails — rollback**

Ask the user: Worker `birken-lofts` → **Settings → Domains & Routes** → delete the `birkenlofts.com/*` route (traffic returns to GitHub Pages immediately). Then `git revert HEAD && git push origin main`.

---

### Task 8: Cleanup (after 7 days without issues)

**Files:**
- Delete: `.github/workflows/deploy.yml`, `public/CNAME`, `public/.nojekyll`
- Modify: `CLAUDE.md`, `AGENTS.md`

- [ ] **Step 1: Remove GitHub Pages files**

```bash
git rm .github/workflows/deploy.yml public/CNAME public/.nojekyll
```

- [ ] **Step 2: Update the Deploy docs**

In `CLAUDE.md` and `AGENTS.md`, replace the Deploy section with:

```markdown
## Deploy

Pushing to `main` triggers Cloudflare Workers Builds, which runs `npm run build` and deploys `out/` as the assets-only Worker `birken-lofts` (`wrangler.jsonc`). It serves birkenlofts.com through the route `birkenlofts.com/*`; `www` is a Cloudflare Redirect Rule to the apex. Every other branch gets a preview URL (no map tiles there — the CARTO key is locked to birkenlofts.com — and GA is off off-production). Cache headers live in `public/_headers`. `npm run compare-hosts` diffs two hosts response by response.
```
Also update the overview sentence that says "Deployed to GitHub Pages" and the CI line under Commands ("CI runs only `npm ci && npm run build`" → "Cloudflare's build runs only `npm run build`").

- [ ] **Step 3: Build, commit, push**

```bash
npm run build
git add -A CLAUDE.md AGENTS.md
git commit -m "Retire GitHub Pages; document the Cloudflare deploy"
git push origin main
```
Confirm the Workers Build succeeds and no GitHub Actions run is triggered.

- [ ] **Step 4: Disable Pages and retire the GitHub IPs**

- `gh api -X DELETE repos/Birken-Lofts/401-w-ontario.github.io/pages`
- Ask the user, in **DNS → Records**: replace the apex and `www` records that point at GitHub (`185.199.x.x` / `*.github.io`) with **AAAA `100::`, proxied** for both names. **Keep both TXT records** — `google-site-verification` and `_github-pages-challenge-birkenlofts` (the GitHub org domain verification that blocks takeover).
- Re-run: `npm run compare-hosts -- --headers https://birkenlofts.com --redirects` → `OK`, and spot-check `https://birkenlofts.com/`.

- [ ] **Step 5: Update memory**

Update the site-status memory: hosting is Cloudflare Workers (`birken-lofts`), deploy via Workers Builds, rollback no longer applicable.
