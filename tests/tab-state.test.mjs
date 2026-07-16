import assert from 'node:assert/strict';

import {
  assertUniqueTabKeys,
  createTabChangeEvent,
  createTabSelection,
  resolveActiveTabKey,
  resolveHorizontalSwipe,
  resolvePagerIndex,
  resolveTabIndex,
} from '../src/CoordinatorTabsState.ts';

const keys = ['wallet', 'history', 'defi'];

assert.equal(resolveTabIndex(keys, 'history'), 1);
assert.equal(resolveTabIndex(keys, 'missing'), 0);
assert.equal(resolveTabIndex([], 'missing'), -1);
assert.equal(resolveActiveTabKey(keys, 'history'), 'history');
assert.equal(
  resolveActiveTabKey(['defi', 'wallet', 'history'], 'history'),
  'history',
);
assert.equal(resolveActiveTabKey(['wallet', 'defi'], 'history'), 'wallet');
assert.equal(resolveActiveTabKey([], 'history'), undefined);
assert.doesNotThrow(() => assertUniqueTabKeys(keys));
assert.throws(
  () => assertUniqueTabKeys(['wallet', 'wallet']),
  /Duplicate coordinator tab key: wallet/,
);

assert.deepEqual(createTabChangeEvent(keys, 0, 2), {
  index: 2,
  key: 'defi',
  previousIndex: 0,
  previousKey: 'wallet',
});
assert.equal(createTabChangeEvent(keys, 1, 1), null);

assert.deepEqual(createTabSelection(keys, 'history', 2, false), {
  event: {
    index: 2,
    key: 'defi',
    previousIndex: 1,
    previousKey: 'history',
  },
  nextActiveKey: 'defi',
});
assert.deepEqual(createTabSelection(keys, 'history', 2, true), {
  event: {
    index: 2,
    key: 'defi',
    previousIndex: 1,
    previousKey: 'history',
  },
  nextActiveKey: 'history',
});

assert.equal(resolveHorizontalSwipe(0, -80, 8, 3), 1);
assert.equal(resolveHorizontalSwipe(2, 90, 5, 3), 1);
assert.equal(resolveHorizontalSwipe(1, 25, 40, 3), 1);
assert.equal(resolveHorizontalSwipe(0, 90, 5, 3), 0);

assert.equal(resolvePagerIndex(0, 390, 3), 0);
assert.equal(resolvePagerIndex(389, 390, 3), 1);
assert.equal(resolvePagerIndex(810, 390, 3), 2);
assert.equal(resolvePagerIndex(-20, 390, 3), 0);
assert.equal(resolvePagerIndex(2000, 390, 3), 2);
assert.equal(resolvePagerIndex(200, 0, 3), -1);
assert.equal(resolvePagerIndex(200, 390, 0), -1);

console.log('Tab state contract passed.');
