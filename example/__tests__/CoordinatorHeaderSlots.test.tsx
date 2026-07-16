import React from 'react';
import type { LayoutChangeEvent } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';

import {
  CoordinatorHeaderProvider,
  useCoordinatorHeaderRegistration,
} from '../../src/CoordinatorHeaderContext';
import {
  CoordinatorHeaderBackground,
  CoordinatorHeaderCollapsed,
  CoordinatorHeaderExpanded,
  resolveCoordinatorHeaderSlots,
} from '../../src/CoordinatorHeaderSlots';
import { CoordinatorHeader } from '../../src/CoordinatorHeader.shared';

test('uses the callable CoordinatorHeader root while keeping Container as an alias', () => {
  expect(typeof CoordinatorHeader).toBe('function');
  expect(CoordinatorHeader.Container).toBe(CoordinatorHeader);
});

test.each([
  [false, false],
  [false, true],
  [true, false],
  [true, true],
])(
  'resolves conditional compound slots (background=%s, collapsed=%s)',
  (includeBackground, includeCollapsed) => {
    const slots = resolveCoordinatorHeaderSlots({
      children: (
        <>
          {includeBackground ? (
            <CoordinatorHeaderBackground>
              background
            </CoordinatorHeaderBackground>
          ) : null}
          <CoordinatorHeaderExpanded height={240}>
            expanded
          </CoordinatorHeaderExpanded>
          {includeCollapsed ? (
            <CoordinatorHeaderCollapsed height={64}>
              collapsed
            </CoordinatorHeaderCollapsed>
          ) : null}
          {false}
          {undefined}
        </>
      ),
    });

    expect(slots).toMatchObject({
      background: includeBackground ? 'background' : undefined,
      collapsed: includeCollapsed ? 'collapsed' : undefined,
      collapsedHeight: includeCollapsed ? 64 : undefined,
      expanded: 'expanded',
      expandedHeight: 240,
    });
  },
);

test('keeps renderable ordinary children while ignoring empty placeholders', () => {
  const slots = resolveCoordinatorHeaderSlots({
    children: [null, false, 0, 'copy', undefined],
  });

  expect(slots.expanded).toEqual([0, 'copy']);
});

test('registers an explicit collapsed height without attaching a layout measurement', () => {
  const reportCollapsedHeight = jest.fn();
  let handleLayout: ((event: LayoutChangeEvent) => void) | undefined;

  function RegistrationProbe() {
    handleLayout = useCoordinatorHeaderRegistration(true, 64);
    return null;
  }

  ReactTestRenderer.act(() => {
    ReactTestRenderer.create(
      <CoordinatorHeaderProvider
        onCollapsedHeightChange={reportCollapsedHeight}
      >
        <RegistrationProbe />
      </CoordinatorHeaderProvider>,
    );
  });

  expect(reportCollapsedHeight).toHaveBeenCalledWith(64);
  expect(handleLayout).toBeUndefined();
});
