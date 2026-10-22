/**
 * Build-time guard: refuse to build on a Node release that predates the
 * 21 Oct 2026 security release (CVE-2026-111497 Brotli RCE, the TLS hostname
 * bypasses CVE-2026-106069 / CVE-2026-105483, and the eMudhra/emSign root CA
 * distrust, CVE-2026-111943). It runs as `prebuild`, so `npm run build` —
 * locally, in GitHub Actions and in Cloudflare Workers Builds — prints the
 * real Node version to the log and exits 1 if that version is unpatched.
 *
 * Deliberately plain .mjs with no imports: it must load and print a clear
 * message on any Node, including the old releases it exists to reject.
 *
 *   node scripts/check-node.mjs            # prints the version, exits 0/1
 *   npm test                               # lib/check-node.test.mts covers the logic
 */

/** Oldest patched release per supported line. Odd majors and ≤20 are never accepted. */
const FLOORS = {
  22: [22, 23, 4],
  24: [24, 22, 1],
  26: [26, 12, 1],
};

const floorsList = Object.values(FLOORS)
  .map((f) => f.join('.'))
  .join(', ');

/**
 * @param {string} version  e.g. process.version ("v22.23.4")
 * @returns {{ ok: boolean, message: string }}
 */
export function checkNodeVersion(version) {
  const m = /^v?(\d+)\.(\d+)\.(\d+)/.exec(version || '');
  if (!m) {
    return { ok: false, message: `Unrecognised Node version "${version}". Need one of ${floorsList} or newer on the same line.` };
  }
  const have = m.slice(1).map(Number);
  const floor = FLOORS[have[0]];
  if (!floor) {
    return {
      ok: false,
      message: `Node ${version} is on an unsupported line (${have[0]}): no security fix exists for it. Use ${floorsList} or newer on the same line.`,
    };
  }
  for (let i = 0; i < 3; i++) {
    if (have[i] > floor[i]) break;
    if (have[i] < floor[i]) {
      return {
        ok: false,
        message: `Node ${version} predates the 21 Oct 2026 security release. Need ${floor.join('.')} or newer on the ${have[0]} line (or ${floorsList}).`,
      };
    }
  }
  return { ok: true, message: `Node ${version} is a patched release (floor ${floor.join('.')}).` };
}

// Run only when executed directly, not when imported by the tests.
if (process.argv[1] && /check-node\.mjs$/.test(process.argv[1])) {
  console.log(`check-node: running Node ${process.version} (${process.platform} ${process.arch})`);
  const result = checkNodeVersion(process.version);
  if (result.ok) {
    console.log(`check-node: ${result.message}`);
  } else {
    console.error(`check-node: FAIL — ${result.message}`);
    process.exit(1);
  }
}
