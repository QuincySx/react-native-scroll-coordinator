import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Text, View } from 'react-native';

import type { CoordinatorTabBarState } from '../../src/CoordinatorTabs.types';

type TabKey = 'first' | 'second';
type PagerProps = {
  onPageSelected: (event: { nativeEvent: { position: number } }) => void;
  onPageScrollStateChanged: (event: {
    nativeEvent: { pageScrollState: 'idle' | 'dragging' | 'settling' };
  }) => void;
};

const { getMockPagerProps, mockPagerCommands, resetMockPager } =
  require('react-native-pager-view') as {
    getMockPagerProps: () => PagerProps | null;
    mockPagerCommands: {
      setPage: jest.Mock;
      setPageWithoutAnimation: jest.Mock;
    };
    resetMockPager: () => void;
  };

jest.mock('../../src/Coordinator', () => {
  const ReactModule = require('react');
  const { View: NativeView } = require('react-native');
  let minimumHeaderHeight = 0;
  return {
    getMockMinimumHeaderHeight: () => minimumHeaderHeight,
    Coordinator: ({
      children,
      header,
      minimumHeaderHeight: nextMinimumHeaderHeight,
      tabBar,
    }: {
      children: React.ReactNode;
      header: React.ReactNode;
      minimumHeaderHeight: number;
      tabBar: React.ReactNode;
    }) => {
      minimumHeaderHeight = nextMinimumHeaderHeight;
      return ReactModule.createElement(
        NativeView,
        null,
        header,
        tabBar,
        children,
      );
    },
  };
});

import { useCoordinatorHeaderConfig } from '../../src/CoordinatorHeaderContext';
import { CoordinatorTabs } from '../../src/CoordinatorTabs.android';

const { getMockMinimumHeaderHeight } = require('../../src/Coordinator') as {
  getMockMinimumHeaderHeight: () => number;
};

const tabs = [
  {
    key: 'first' as const,
    label: 'First',
    render: () => <Text>First page</Text>,
  },
  {
    key: 'second' as const,
    label: 'Second',
    render: () => <Text>Second page</Text>,
  },
];

let frameId = 0;
let frameCallbacks = new Map<number, FrameRequestCallback>();

function flushAnimationFrames() {
  const callbacks = [...frameCallbacks.values()];
  frameCallbacks.clear();
  ReactTestRenderer.act(() => {
    callbacks.forEach(callback => callback(0));
  });
}

function emitScrollState(state: 'idle' | 'dragging' | 'settling') {
  ReactTestRenderer.act(() => {
    getMockPagerProps()!.onPageScrollStateChanged({
      nativeEvent: { pageScrollState: state },
    });
  });
}

function emitPageSelected(position: number) {
  ReactTestRenderer.act(() => {
    getMockPagerProps()!.onPageSelected({ nativeEvent: { position } });
  });
}

function renderTabs(
  activeTabKey?: TabKey,
  onTabChange?: jest.Mock,
): {
  getTabBarState: () => CoordinatorTabBarState<TabKey>;
  renderer: ReactTestRenderer.ReactTestRenderer;
} {
  let tabBarState: CoordinatorTabBarState<TabKey> | null = null;
  let renderer: ReactTestRenderer.ReactTestRenderer;
  ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(
      <CoordinatorTabs
        activeTabKey={activeTabKey}
        initialTabKey="first"
        onTabChange={onTabChange}
        renderHeader={() => <View />}
        renderTabBar={state => {
          tabBarState = state;
          return <View />;
        }}
        tabs={tabs}
      />,
    );
  });
  return {
    getTabBarState: () => tabBarState!,
    renderer: renderer!,
  };
}

beforeEach(() => {
  resetMockPager();
  frameId = 0;
  frameCallbacks = new Map();
  globalThis.requestAnimationFrame = jest.fn(callback => {
    frameId += 1;
    frameCallbacks.set(frameId, callback);
    return frameId;
  });
  globalThis.cancelAnimationFrame = jest.fn(id => {
    frameCallbacks.delete(id);
  });
});

test('lets a native swipe finish without commanding the pager again', () => {
  renderTabs();

  emitScrollState('dragging');
  emitPageSelected(1);
  emitScrollState('settling');
  emitScrollState('idle');
  flushAnimationFrames();

  expect(mockPagerCommands.setPage).not.toHaveBeenCalled();
  expect(mockPagerCommands.setPageWithoutAnimation).not.toHaveBeenCalled();
});

test('sends only one animated command when a tab is pressed', () => {
  const { getTabBarState } = renderTabs();

  ReactTestRenderer.act(() => {
    getTabBarState().selectTab('second');
  });
  expect(mockPagerCommands.setPage).toHaveBeenCalledTimes(1);
  expect(mockPagerCommands.setPage).toHaveBeenCalledWith(1);

  emitScrollState('settling');
  emitPageSelected(1);
  emitScrollState('idle');
  flushAnimationFrames();

  expect(mockPagerCommands.setPage).toHaveBeenCalledTimes(1);
});

test('waits for idle before restoring a rejected controlled swipe', () => {
  const onTabChange = jest.fn();
  renderTabs('first', onTabChange);

  emitScrollState('dragging');
  emitPageSelected(1);
  emitScrollState('settling');
  expect(mockPagerCommands.setPage).not.toHaveBeenCalled();

  emitScrollState('idle');
  expect(mockPagerCommands.setPage).not.toHaveBeenCalled();
  flushAnimationFrames();

  expect(onTabChange).toHaveBeenCalledTimes(1);
  expect(mockPagerCommands.setPage).toHaveBeenCalledTimes(1);
  expect(mockPagerCommands.setPage).toHaveBeenCalledWith(0);
});

test('uses the collapsed slot measurement as the automatic retained height', () => {
  function MeasuredHeader() {
    const { reportCollapsedHeight } = useCoordinatorHeaderConfig();
    React.useEffect(() => {
      reportCollapsedHeight(64);
    }, [reportCollapsedHeight]);
    return <View />;
  }

  ReactTestRenderer.act(() => {
    ReactTestRenderer.create(
      <CoordinatorTabs
        initialTabKey="first"
        renderHeader={() => <MeasuredHeader />}
        renderTabBar={() => <View />}
        tabs={tabs}
      />,
    );
  });

  expect(getMockMinimumHeaderHeight()).toBe(64);
});
