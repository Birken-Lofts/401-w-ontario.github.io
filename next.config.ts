import type { NextConfig } from 'next';
import { execFileSync } from 'node:child_process';

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  // Build id = commit SHA, so GitHub's and Cloudflare's builds of the same
  // commit emit identical HTML (scripts/compare-hosts.mts compares by hash).
  generateBuildId: async () => {
    try {
      return execFileSync('git', ['rev-parse', 'HEAD'], { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
    } catch {
      return null; // no git: fall back to Next's random id
    }
  },
};

export default nextConfig;
