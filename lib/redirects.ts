/**
 * Cloudflare's auto-trailing-slash answers /history with a 307; GitHub Pages
 * (and SEO) want a permanent 301. A _redirects line per page wins over it.
 */
export function trailingSlashRedirects(pages: string[]): string {
  return pages
    .filter((p) => p !== '/' && p.endsWith('/'))
    .map((p) => `${p.slice(0, -1)} ${p} 301\n`)
    .join('');
}
