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

/**
 * Mask what legitimately differs between two builds of the same content:
 * - the build id, which is the commit SHA (next.config.ts);
 * - content-hashed `_next/static` filenames and next/font class names, which
 *   hash the build machine's absolute path, so GitHub's and Cloudflare's
 *   builds of one commit never match byte for byte.
 */
export function normalizeBody(text: string): string {
  return text
    .replace(/\b[0-9a-f]{40}\b/g, '<sha>')
    .replace(/\b[0-9a-f]{16}\.(js|css)\b/g, '<hash>.$1')
    .replace(/\b(__variable|__className)_[0-9a-f]{6}\b/g, '$1_<hash>');
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
