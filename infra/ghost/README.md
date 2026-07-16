# Local Ghost editor

A local, editor-only Ghost instance for writing the Birken Lofts Journal. Visitors never reach it — you write and publish posts here, then `npm run sync-posts` pulls the published posts into the repo as static content, which is what actually ships. All Ghost content (posts, images, your account) persists in `~/.birken-ghost` on this machine; it is **not** part of the repo.

## Quick start

```bash
docker compose -f infra/ghost/docker-compose.yml up -d
node scripts/setup-ghost.mjs   # one time only
```

The setup script waits for Ghost to boot (~30–60s on first run), prompts for an owner name/email/password, creates the account, creates a "Site Sync" custom integration, and writes its API keys to `.env.local` at the repo root. `.env.local` is gitignored — never commit it.

## Manual setup

If Ghost already has an owner account (the script detects this and prints these steps), generate the keys by hand:

1. Open http://localhost:2368/ghost and sign in
2. Settings → Advanced → Integrations → Add custom integration → "Site Sync"
3. Copy the keys into `.env.local` at the repo root:

```
GHOST_URL=http://localhost:2368
GHOST_CONTENT_KEY=<content key>
GHOST_ADMIN_KEY=<admin key>
```

## Publishing workflow

1. Write and **publish** the post in the Ghost admin at http://localhost:2368/ghost (drafts are ignored by the sync)
2. `npm run sync-posts` — pulls published posts and their images into the repo
3. Commit `content/` and `public/images/blog/`, then push — the normal deploy takes it live

## Pushing a draft from a file

To seed a post from an existing HTML file instead of writing it in the editor:

```bash
node scripts/push-draft.mjs path/to/post.html --title "Post Title" [--excerpt "..."] [--tags a,b]
```

This creates a **draft** in Ghost (it prints the editor URL) — review and publish it in the admin, then sync as above.

## Troubleshooting

- **Ghost won't come up / setup script times out** — check the container: `docker logs birken-ghost`. First boot after a fresh pull takes a while.
- **Start over from scratch** — stop the container, delete `~/.birken-ghost`, and bring it up again; then rerun `node scripts/setup-ghost.mjs`. This destroys all local posts and the owner account.
- **Lost or rotated keys** — follow the manual setup steps above to create a fresh integration and rewrite `.env.local`.
