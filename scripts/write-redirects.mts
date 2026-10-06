/** Post-build: writes out/_redirects (301 for each sitemap page without its slash). */
import { readFileSync, writeFileSync } from 'node:fs';
import { sitemapPaths } from '../lib/compare-hosts.ts';
import { trailingSlashRedirects } from '../lib/redirects.ts';

writeFileSync('out/_redirects', trailingSlashRedirects(sitemapPaths(readFileSync('out/sitemap.xml', 'utf8'))));
