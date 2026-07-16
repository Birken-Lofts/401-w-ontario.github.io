// One-time bootstrap for the local Ghost editor.
// Usage:  node scripts/setup-ghost.mjs
// Prompts for the owner account (or reads GHOST_SETUP_NAME/EMAIL/PASSWORD env),
// creates it, creates a "Site Sync" integration, and writes .env.local.
// Idempotent: if Ghost is already set up, prints manual instructions instead.
import { createInterface } from 'node:readline/promises';
import { writeFileSync, readFileSync, existsSync, chmodSync } from 'node:fs';

const GHOST_URL = process.env.GHOST_URL || 'http://localhost:2368';

async function waitForGhost() {
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch(`${GHOST_URL}/ghost/api/admin/authentication/setup/`);
      if (r.ok) return (await r.json()).setup[0].status;
    } catch {
      /* not up yet */
    }
    await new Promise((res) => setTimeout(res, 2000));
    process.stdout.write('.');
  }
  throw new Error(`Ghost did not come up at ${GHOST_URL} — is docker compose running?`);
}

async function ask(question, hide = false) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  if (hide) {
    // Mask input by intercepting readline's echo. `_writeToOutput` is internal
    // API, but acceptable for a local bootstrap script.
    const orig = rl._writeToOutput.bind(rl);
    rl._writeToOutput = (s) => orig(s.includes(question) ? s : '*');
  }
  const answer = await rl.question(question);
  rl.close();
  if (hide) process.stdout.write('\n');
  return answer.trim();
}

const alreadySetUp = await waitForGhost();
console.log(`\nGhost is up at ${GHOST_URL}`);

let name = process.env.GHOST_SETUP_NAME;
let email = process.env.GHOST_SETUP_EMAIL;
let password = process.env.GHOST_SETUP_PASSWORD;

if (alreadySetUp) {
  console.log(`This Ghost instance already has an owner account.
To (re)generate API keys manually:
  1. Open ${GHOST_URL}/ghost and sign in
  2. Settings -> Advanced -> Integrations -> Add custom integration -> "Site Sync"
  3. Copy the Content API key and Admin API key into .env.local:
       GHOST_URL=${GHOST_URL}
       GHOST_CONTENT_KEY=<content key>
       GHOST_ADMIN_KEY=<admin key>`);
  if (!email || !password) process.exit(0);
  console.log('Credentials provided via env — attempting to create the integration…');
} else {
  if (!name) name = await ask('Owner name: ');
  if (!email) email = await ask('Owner email: ');
  if (!password) password = await ask('Owner password (10+ chars): ', true);
  // Narrow the setup race: re-check right before claiming ownership in case
  // someone else completed setup while we were prompting.
  const recheck = await fetch(`${GHOST_URL}/ghost/api/admin/authentication/setup/`);
  if (recheck.ok && (await recheck.json()).setup[0].status) {
    throw new Error('Ghost was set up by someone else since the check — investigate before proceeding.');
  }
  const res = await fetch(`${GHOST_URL}/ghost/api/admin/authentication/setup/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ setup: [{ name, email, password, blogTitle: 'Birken Lofts Journal' }] }),
  });
  if (!res.ok) throw new Error(`Setup failed: ${res.status} ${await res.text()}`);
  console.log('Owner account created.');
}

const login = await fetch(`${GHOST_URL}/ghost/api/admin/session/`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Origin: GHOST_URL },
  body: JSON.stringify({ username: email, password }),
});
if (!login.ok) throw new Error(`Login failed: ${login.status} ${await login.text()}`);
const cookie = login.headers.get('set-cookie');

const integration = await fetch(`${GHOST_URL}/ghost/api/admin/integrations/?include=api_keys`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Origin: GHOST_URL, Cookie: cookie },
  body: JSON.stringify({ integrations: [{ name: 'Site Sync' }] }),
});
if (!integration.ok) throw new Error(`Integration creation failed: ${integration.status} ${await integration.text()}`);

// Outbound link tagging appends ?ref=<site-host> (i.e. ?ref=localhost) to
// external links in rendered posts — noise the sync would have to strip.
const linkTagging = await fetch(`${GHOST_URL}/ghost/api/admin/settings/`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json', Origin: GHOST_URL, Cookie: cookie },
  body: JSON.stringify({ settings: [{ key: 'outbound_link_tagging', value: false }] }),
});
if (linkTagging.ok) console.log('Disabled outbound link tagging (no ?ref= noise on external links).');
else console.log('WARN: could not disable outbound link tagging — turn it off manually: Ghost Settings -> Analytics.');
const keys = (await integration.json()).integrations[0].api_keys;
const contentKey = keys.find((k) => k.type === 'content').secret;
const adminKey = keys.find((k) => k.type === 'admin');
// Ghost ≥5.130 returns the admin secret already in `id:secret` form; older versions return the bare secret.
const adminKeyString = adminKey.secret.includes(':') ? adminKey.secret : `${adminKey.id}:${adminKey.secret}`;

const envPath = new URL('../.env.local', import.meta.url).pathname;
const fresh = { GHOST_URL, GHOST_CONTENT_KEY: contentKey, GHOST_ADMIN_KEY: adminKeyString };
let existing = existsSync(envPath) ? readFileSync(envPath, 'utf8') : '';
if (existing && !existing.endsWith('\n')) existing += '\n';
const kept = existing
  .split('\n')
  .filter((l) => l && !/^GHOST_(URL|CONTENT_KEY|ADMIN_KEY)=/.test(l));
const lines = [...kept, ...Object.entries(fresh).map(([k, v]) => `${k}=${v}`)].join('\n') + '\n';
writeFileSync(envPath, lines, { mode: 0o600 });
chmodSync(envPath, 0o600); // keys are secrets — owner read/write only
console.log(`Wrote Ghost keys to .env.local — you're ready: write at ${GHOST_URL}/ghost, then \`npm run sync-posts\`.`);
