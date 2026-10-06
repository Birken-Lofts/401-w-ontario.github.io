import type { NextConfig } from 'next';
import { execFileSync } from 'node:child_process';
import { buildId } from './lib/build-id';

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  generateBuildId: async () =>
    buildId(process.env, () =>
      execFileSync('git', ['rev-parse', 'HEAD'], { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim(),
    ),
};

export default nextConfig;
