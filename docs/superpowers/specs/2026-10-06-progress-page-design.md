# /progress/ page — Design pointer

The construction-progress photo feed is a shared Monroe service, designed and
built in a separate repo: **monroeresidential/progress-photos-app**
(`docs/specs/2026-10-06-progress-photos-design.md`), served from
`https://progress.monroeresidential.com`.

This site's side is small: an `app/progress/page.tsx` route that embeds
`<progress-feed project="birken-lofts">` themed with the site's tokens, plus a
nav link and a sitemap entry. See "Birken Lofts integration" in that spec.
