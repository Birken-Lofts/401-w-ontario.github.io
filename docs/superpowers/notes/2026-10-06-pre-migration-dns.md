# birkenlofts.com — state before the Cloudflare move (2026-10-06)

Rollback record for `docs/superpowers/plans/2026-10-06-cloudflare-migration.md`.

## Redirect behaviour (captured 2026-10-06)

```
http://birkenlofts.com/                   -> 301 https://birkenlofts.com/
https://www.birkenlofts.com/              -> 301 https://birkenlofts.com/
https://www.birkenlofts.com/history/?x=1  -> 301 https://birkenlofts.com/history/?x=1
https://birkenlofts.com/history           -> 301 https://birkenlofts.com/history/
```

**Who performs the `www` redirect: GitHub Pages** — the `www` 301 carries
`x-github-request-id`. It preserves path and query. So the cutover must add a
Cloudflare Redirect Rule for `www` (plan Task 7, step 2), or `www` breaks when
Pages is disabled.

**Who performs `http` → `https`: also GitHub Pages** (the 301 carries
`x-github-request-id`), so Cloudflare's Always Use HTTPS is off. It must be
turned on before the cutover (plan Task 7, step 1b).

Apex responses also carry `x-github-request-id` (served by GitHub Pages
through the Cloudflare proxy).

## DNS records

Exported from the Cloudflare dashboard 2026-10-06 17:17 (SOA/NS omitted).

```
birkenlofts.com.      1     IN A     185.199.108.153 ; proxied
birkenlofts.com.      1     IN A     185.199.109.153 ; proxied
birkenlofts.com.      1     IN A     185.199.110.153 ; proxied
birkenlofts.com.      1     IN A     185.199.111.153 ; proxied
www.birkenlofts.com.  1     IN CNAME birkenlofts.github.io. ; proxied
birkenlofts.com.      3600  IN TXT   "google-site-verification=iYw8KJTD2Cv_4o1qcwoTjGYjxDm_zZoT2VTgC39_5Z8"
_github-pages-challenge-birkenlofts.birkenlofts.com. 1 IN TXT "65b679c20826ef285212bbffa55070"
```

- Apex: GitHub Pages' four IPs, proxied. `www`: CNAME to `birkenlofts.github.io`, proxied.
- **Keep both TXT records.** The Google one ties the site to Search Console. The
  `_github-pages-challenge-birkenlofts` record verifies the domain to the
  `birkenlofts` GitHub org, which stops anyone else's Pages site claiming it —
  keep it after Pages is disabled too.
- No MX records (no email on this domain).

**Rollback** never needs these restored: the cutover adds a Worker route and
leaves DNS alone. They matter for Task 8, which replaces the apex/`www`
records with proxied `AAAA 100::`.

## Rules and SSL

- SSL/TLS mode: **Full** (user, 2026-10-06). Irrelevant once the Worker route serves the site — there is no origin fetch.
- Always Use HTTPS: was **off** (GitHub did the http→https 301); turned **on** 2026-10-06 before cutover, verified (301 without `x-github-request-id`, path + query kept).
- Rules: Page Rule `www.birkenlofts.com/*` → Forwarding URL 301 `https://birkenlofts.com/$1` added 2026-10-06 before cutover (GitHub did the `www` redirect); verified served by Cloudflare, path + query kept, `http://www` now one hop. Other pre-existing rules: none reported.
