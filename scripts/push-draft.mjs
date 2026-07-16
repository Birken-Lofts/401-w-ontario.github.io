// Push an HTML file into the local Ghost as a DRAFT post.
// Usage: node scripts/push-draft.mjs <file.html> --title "Title" [--excerpt "..."] [--tags a,b]
import { readFileSync, existsSync } from 'node:fs';
import { createHmac } from 'node:crypto';

function loadEnv() {
  const envPath = new URL('../.env.local', import.meta.url).pathname;
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}
loadEnv();

const GHOST_URL = process.env.GHOST_URL || 'http://localhost:2368';
const ADMIN_KEY = process.env.GHOST_ADMIN_KEY;
if (!ADMIN_KEY) throw new Error('GHOST_ADMIN_KEY missing — run scripts/setup-ghost.mjs first.');

export function adminToken(key) {
  const [id, secret] = key.split(':');
  const now = Math.floor(Date.now() / 1000);
  const b64 = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url');
  const header = b64({ alg: 'HS256', typ: 'JWT', kid: id });
  const payload = b64({ iat: now, exp: now + 300, aud: '/admin/' });
  const signature = createHmac('sha256', Buffer.from(secret, 'hex'))
    .update(`${header}.${payload}`)
    .digest('base64url');
  return `${header}.${payload}.${signature}`;
}

const [file] = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const flag = (name) => {
  const i = process.argv.indexOf(`--${name}`);
  return i === -1 ? undefined : process.argv[i + 1];
};
const title = flag('title');
if (!file || !title) throw new Error('Usage: node scripts/push-draft.mjs <file.html> --title "Title" [--excerpt "..."] [--tags a,b]');

const post = {
  title,
  html: readFileSync(file, 'utf8'),
  status: 'draft',
  ...(flag('excerpt') ? { custom_excerpt: flag('excerpt') } : {}),
  ...(flag('tags') ? { tags: flag('tags').split(',').map((t) => ({ name: t.trim() })) } : {}),
};

const res = await fetch(`${GHOST_URL}/ghost/api/admin/posts/?source=html`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Authorization: `Ghost ${adminToken(ADMIN_KEY)}` },
  body: JSON.stringify({ posts: [post] }),
});
if (!res.ok) throw new Error(`Draft push failed: ${res.status} ${await res.text()}`);
const created = (await res.json()).posts[0];
console.log(`Draft created: "${created.title}" (${created.slug}) — edit at ${GHOST_URL}/ghost/#/editor/post/${created.id}`);
