import { test } from 'node:test';
import assert from 'node:assert/strict';
import { shouldLoadAnalytics } from './analytics.ts';

test('loads on the production host', () => {
  assert.equal(shouldLoadAnalytics('birkenlofts.com'), true);
});

test('skips previews, workers.dev, www and local', () => {
  for (const host of [
    'birken-lofts.example.workers.dev',
    'abc123-birken-lofts.example.workers.dev',
    'www.birkenlofts.com',
    'localhost',
    '127.0.0.1',
    '',
  ]) {
    assert.equal(shouldLoadAnalytics(host), false, host);
  }
});
