import { test } from 'node:test';
import assert from 'node:assert/strict';
import { trailingSlashRedirects } from './redirects.ts';

test('one permanent redirect per page, slashless → slashed', () => {
  assert.equal(
    trailingSlashRedirects(['/', '/history/', '/blog/a-post/']),
    '/history /history/ 301\n/blog/a-post /blog/a-post/ 301\n',
  );
});

test('no pages, empty file', () => {
  assert.equal(trailingSlashRedirects(['/']), '');
});
