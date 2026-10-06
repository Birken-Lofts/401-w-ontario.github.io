/**
 * Next build id = the commit being built, so GitHub's and Cloudflare's builds
 * of one commit emit identical HTML (scripts/compare-hosts.mts compares by
 * hash). CI env vars first: git can be missing or shallow on a build image.
 */
export function buildId(
  env: Record<string, string | undefined>,
  gitHead: () => string,
): string | null {
  const sha = env.WORKERS_CI_COMMIT_SHA || env.GITHUB_SHA;
  if (sha) return sha;
  try {
    return gitHead();
  } catch {
    return null; // Next falls back to a random id
  }
}
