import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildId } from './build-id.ts';

const git = () => 'from-git';

test('prefers the Cloudflare Workers Builds commit', () => {
  assert.equal(buildId({ WORKERS_CI_COMMIT_SHA: 'cf', GITHUB_SHA: 'gh' }, git), 'cf');
});

test('then the GitHub Actions commit', () => {
  assert.equal(buildId({ GITHUB_SHA: 'gh' }, git), 'gh');
});

test('then git, then null (Next falls back to a random id)', () => {
  assert.equal(buildId({}, git), 'from-git');
  assert.equal(buildId({}, () => { throw new Error('no git'); }), null);
});
