import assert from 'node:assert/strict';

import { resolveAndroidPagerCommand } from '../src/AndroidPagerState.ts';

const idleMismatch = {
  authoritativeIndex: 2,
  nativeIndex: 1,
  pendingCommandIndex: null,
  scrollState: 'idle',
};

assert.equal(resolveAndroidPagerCommand(idleMismatch), 2);
assert.equal(
  resolveAndroidPagerCommand({ ...idleMismatch, scrollState: 'dragging' }),
  null,
);
assert.equal(
  resolveAndroidPagerCommand({ ...idleMismatch, scrollState: 'settling' }),
  null,
);
assert.equal(
  resolveAndroidPagerCommand({ ...idleMismatch, nativeIndex: 2 }),
  null,
);
assert.equal(
  resolveAndroidPagerCommand({ ...idleMismatch, pendingCommandIndex: 2 }),
  null,
);
assert.equal(
  resolveAndroidPagerCommand({ ...idleMismatch, authoritativeIndex: -1 }),
  null,
);

console.log('Android pager state contract passed.');
