import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  sitemapPaths, withoutTrailingSlash, normalizeLocation, normalizeBody, diffProbes,
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

test('normalizeBody masks commit SHAs (the build id) and nothing else', () => {
  const a = '<script src="/_next/static/0123456789abcdef0123456789abcdef01234567/_buildManifest.js">';
  const b = '<script src="/_next/static/fedcba9876543210fedcba9876543210fedcba98/_buildManifest.js">';
  assert.equal(normalizeBody(a), normalizeBody(b));
  assert.notEqual(normalizeBody('<p>Studio</p>'), normalizeBody('<p>Loft</p>'));
  assert.equal(normalizeBody('abc123'), 'abc123'); // short hex untouched
  // Next also emits the build id truncated to 24 chars in an HTML comment.
  assert.equal(normalizeBody('<!--77d8db9ae6fbcbc1001e7725-->'), normalizeBody('<!--0595d192165d6faa6d9c2f7e-->'));
});

test('normalizeBody masks per-build asset hashes and font class names', () => {
  // Same commit built on GitHub vs Cloudflare (verified 2026-10-06): only these differ.
  const gh = '<html class="__variable_623631 __variable_142199"><link href="/_next/static/css/88b50612fb0ffbce.css"/>'
    + '<script src="/_next/static/chunks/main-app-27055c4c9ac83587.js">';
  const cf = '<html class="__variable_623631 __variable_39f3b5"><link href="/_next/static/css/97b2e9f9b36e1b21.css"/>'
    + '<script src="/_next/static/chunks/main-app-2783456bfb8894de.js">';
  assert.equal(normalizeBody(gh), normalizeBody(cf));
  // A different chunk name is still a difference.
  assert.notEqual(
    normalizeBody('/_next/static/chunks/app/page-275765a881f40fc0.js'),
    normalizeBody('/_next/static/chunks/app/layout-275765a881f40fc0.js'),
  );
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
