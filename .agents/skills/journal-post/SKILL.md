---
name: journal-post
description: Use when asked to write, draft, publish, or update a Birken Lofts Journal/blog post, or to add content under /blog/.
---

# Journal Post

Posts are authored in the **local Ghost editor**, synced into the repo, and deployed with the site. This recipe produces an SEO-complete draft for the user's review. `content/posts/` is machine-owned by the sync — never hand-write files there (the next sync deletes them).

## Recipe (in order)

1. **Editor up.** `docker compose -f infra/ghost/docker-compose.yml up -d`; wait for `http://localhost:2368`. API keys are in `.env.local`; if missing, the user must run `node scripts/setup-ghost.mjs` (interactive). Full pipeline docs: `infra/ghost/README.md`.
2. **Ask the user** before drafting: the angle (if unclear) and **2–4 SEO keywords/phrases to target** — propose candidates from the topic so they can just pick.
3. **Draft** ≤700 words of clean HTML (`h2`/`p`/`blockquote` only), in the site's voice. Facts come ONLY from repo sources (site pages, `data/`, `reference/`, published posts) — never invent dates, prices, or availability. Front-load the primary keyword in the title; use it in the first paragraph and one `h2`, naturally — no stuffing.
4. **Images.** Feature image + at least one captioned inline figure. Reuse `public/images/` assets or ask the user for new ones; upload via the Admin API images endpoint (JWT pattern lives in `scripts/push-draft.mjs`). Every image gets descriptive alt text (keyword only where honest).
5. **Create the draft.** `node scripts/push-draft.mjs <file.html> --title "…" --excerpt "…" --tags X`, then `PUT /ghost/api/admin/posts/<id>/` to set `feature_image`, `feature_image_alt`, and `meta_description` (≤155 chars, contains the primary keyword, worded differently than the excerpt).
6. **Hand off.** Give the user the Ghost edit URL. Publishing stays THEIR click. After they publish: `npm run sync-posts` → build preview → commit `content/` + `public/images/blog/` → merge/push deploys.

## Required in every draft

- [ ] Target keywords confirmed with the user
- [ ] Title, excerpt, and meta_description each carry the primary keyword
- [ ] Feature image (with alt) + ≥1 captioned inline figure
- [ ] ≥1 internal link to a site page (`/history/`, `/finishes/`, `/#neighborhood`, …)
- [ ] Every fact traceable to a repo source
- [ ] Post status is `draft`; nothing committed to the repo at this stage

## Gotchas

- Fresh Ghost instances seed sample posts ("Coming soon") — never publish or sync them.
- If the sync guard aborts on a localhost leak: outbound link tagging got re-enabled — turn it off (Ghost Settings → Analytics; `setup-ghost.mjs` does this automatically).
- Slugs come from titles; edit the slug in Ghost post settings if the title is long.
