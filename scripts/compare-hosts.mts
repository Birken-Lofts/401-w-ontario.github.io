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
  sitemapPaths, withoutTrailingSlash, normalizeLocation, normalizeBody, diffProbes,
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
  const raw = Buffer.from(await res.arrayBuffer());
  const body = (res.headers.get('content-type') ?? '').startsWith('text/')
    ? normalizeBody(raw.toString('utf8'))
    : raw;
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
