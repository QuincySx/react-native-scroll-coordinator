import assert from 'node:assert/strict';

import {
  getHeaderTransitionProgress,
  normalizeHeaderHeight,
  normalizeHeaderTransition,
  normalizeParallaxRate,
  resolveHeaderRetainedHeight,
} from '../src/CoordinatorHeaderState.ts';

assert.equal(normalizeParallaxRate(), 0.5);
assert.equal(normalizeParallaxRate(0.35), 0.35);
assert.equal(normalizeParallaxRate(-1), 0);
assert.equal(normalizeParallaxRate(2), 1);
assert.equal(normalizeParallaxRate(Number.NaN), 0.5);

assert.deepEqual(normalizeHeaderTransition(), { end: 0.85, start: 0.55 });
assert.deepEqual(normalizeHeaderTransition(0.25, 0.75), {
  end: 0.75,
  start: 0.25,
});
assert.deepEqual(normalizeHeaderTransition(-1, 2), { end: 1, start: 0 });
assert.deepEqual(normalizeHeaderTransition(0.9, 0.2), {
  end: 0.85,
  start: 0.55,
});

assert.equal(getHeaderTransitionProgress(0.2, 0.25, 0.75), 0);
assert.equal(getHeaderTransitionProgress(0.5, 0.25, 0.75), 0.5);
assert.equal(getHeaderTransitionProgress(0.9, 0.25, 0.75), 1);

assert.equal(resolveHeaderRetainedHeight(false, 64, 72), 0);
assert.equal(resolveHeaderRetainedHeight(true, 64, 72), 64);
assert.equal(resolveHeaderRetainedHeight(true, undefined, 72), 72);
assert.equal(resolveHeaderRetainedHeight(true, -1, undefined), 0);
assert.equal(resolveHeaderRetainedHeight(true, Number.NaN, 56), 56);
assert.equal(normalizeHeaderHeight(), undefined);
assert.equal(normalizeHeaderHeight(64), 64);
assert.equal(normalizeHeaderHeight(-1), 0);
assert.equal(normalizeHeaderHeight(Number.NaN), undefined);

console.log('Header effect contract passed.');
