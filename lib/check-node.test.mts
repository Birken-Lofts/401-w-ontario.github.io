import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkNodeVersion } from '../scripts/check-node.mjs';

const ok = (v: string) => assert.equal(checkNodeVersion(v).ok, true, `${v} should pass`);
const bad = (v: string) => assert.equal(checkNodeVersion(v).ok, false, `${v} should fail`);

test('patched floors pass on each supported line', () => {
  ok('v22.23.4');
  ok('v24.22.1');
  ok('v26.12.1');
});

test('anything newer on a supported line passes', () => {
  ok('v22.23.5');
  ok('v22.24.0');
  ok('v24.23.0');
  ok('v26.13.0');
  ok('v26.12.10');
});

test('one patch below the floor fails', () => {
  bad('v22.23.3');
  bad('v24.22.0');
  bad('v26.12.0');
});

test('older minors on a supported line fail', () => {
  bad('v22.19.0');
  bad('v24.9.0');
  bad('v26.0.0');
});

test('unsupported majors fail, even when newer than the floors', () => {
  bad('v20.19.5');
  bad('v18.20.8');
  bad('v23.11.1');
  bad('v25.0.0');
  bad('v28.0.0');
});

test('prerelease tags on a floor still pass; garbage fails', () => {
  ok('v22.23.4-rc.1');
  bad('');
  bad('nope');
  bad('v22');
});

test('message always names the version it was given', () => {
  assert.match(checkNodeVersion('v22.23.3').message, /22\.23\.3/);
  assert.match(checkNodeVersion('v22.23.4').message, /22\.23\.4/);
});
