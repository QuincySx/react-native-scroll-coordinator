/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: require('react-native').View,
  SafeAreaView: require('react-native').View,
}));

jest.mock('react-native-scroll-coordinator', () => {
  const ReactModule = require('react');
  const { ScrollView, View } = require('react-native');
  const HeaderSlot = ({ children }: { children: unknown }) =>
    ReactModule.createElement(View, null, children);
  const HeaderContainer = ({ children }: { children: unknown }) =>
    ReactModule.createElement(View, null, children);
  const CoordinatorHeader = Object.assign(HeaderContainer, {
    Background: HeaderSlot,
    Collapsed: HeaderSlot,
    Container: HeaderContainer,
    Expanded: HeaderSlot,
  });
  return {
    CoordinatorHeader,
    CoordinatorTabs: ({
      renderHeader,
      renderTabBar,
      tabs,
    }: {
      renderHeader: () => unknown;
      renderTabBar: (state: unknown) => unknown;
      tabs: Array<{ key: string; render: () => unknown }>;
    }) =>
      ReactModule.createElement(
        View,
        null,
        renderHeader(),
        renderTabBar({
          activeIndex: 0,
          activeKey: tabs[0]?.key,
          selectTab: jest.fn(),
          tabs,
        }),
        tabs[0]?.render(),
      ),
    CoordinatorHorizontal: View,
    CoordinatorFlatList: require('react-native').FlatList,
    CoordinatorScrollView: ScrollView,
    CoordinatorVirtualList: ({
      children,
    }: {
      children: (value: object) => unknown;
    }) =>
      children({
        renderScrollComponent: (props: object) =>
          ReactModule.createElement(ScrollView, props),
      }),
  };
});

jest.mock('react-native-scroll-coordinator/flash-list', () => {
  const { FlatList } = require('react-native');
  return { CoordinatorFlashList: FlatList };
});

import App from '../App';
import {
  type HeaderDemoCase,
  headerDemoCases,
  headerModeDefinitions,
  headerScenarioIds,
  scenarioCatalog,
} from '../src/scenarios/catalog';

const scenarioIds = [
  ...headerScenarioIds,
  'flash-banner',
  'flatlist-nested',
  'scrollview-content',
  'virtual-adapter',
  'many-tabs',
  'custom-tab-actions',
  'slow-huge-list',
] as const;

test('covers the header and tab interaction matrix', () => {
  expect(new Set(scenarioCatalog.map(scenario => scenario.headerMode))).toEqual(
    new Set([
      'plain-hide',
      'plain-retain',
      'plain-switch',
      'parallax-hide',
      'parallax-retain',
      'parallax-switch',
    ]),
  );
  expect(new Set(scenarioCatalog.map(scenario => scenario.tabMode))).toEqual(
    new Set(['controlled', 'fixed', 'scrollable']),
  );
  const headerScenarios = scenarioCatalog.filter(scenario =>
    scenario.group.startsWith('header-'),
  );
  expect(headerScenarios).toHaveLength(10);
  expect(new Set(headerScenarios.map(scenario => scenario.tabMode))).toEqual(
    new Set(['fixed']),
  );
  const behaviorSignatures = headerDemoCases.map((demoCase: HeaderDemoCase) =>
    JSON.stringify([
      demoCase.mode,
      demoCase.openHeight,
      demoCase.minimumHeaderHeight,
      demoCase.collapsedHeight,
      demoCase.collapsedMeasuredHeight,
      demoCase.parallaxRate,
      demoCase.snapEnabled,
      demoCase.transitionStart,
      demoCase.transitionEnd,
      demoCase.headerHeight,
      demoCase.showRetainedArea,
    ]),
  );
  expect(new Set(behaviorSignatures).size).toBe(headerDemoCases.length);
});

test.each(headerDemoCases)(
  'renders $id with its own Header configuration',
  async (demoCase: HeaderDemoCase) => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(<App />);
    });

    await ReactTestRenderer.act(() => {
      renderer!.root
        .findByProps({ testID: `scenario-entry-${demoCase.id}` })
        .props.onPress();
    });

    const definition = headerModeDefinitions[demoCase.mode];
    const scenario = renderer!.root.findByProps({
      testID: `demo-${demoCase.id}`,
    });
    expect(scenario.props.headerHeight).toBe(demoCase.headerHeight);
    expect(scenario.props.minimumHeaderHeight).toBe(
      demoCase.minimumHeaderHeight,
    );
    expect(scenario.props.snapEnabled).toBe(demoCase.snapEnabled);
    const shell = renderer!.root.findByProps({
      testID: `demo-header-${demoCase.id}-shell`,
    });
    expect(shell.props.transitionStart).toBe(demoCase.transitionStart ?? 0.5);
    expect(shell.props.transitionEnd).toBe(demoCase.transitionEnd ?? 0.86);
    expect(
      renderer!.root.findAllByProps({ height: demoCase.openHeight }).length,
    ).toBeGreaterThan(0);
    expect(
      renderer!.root.findByProps({
        testID: `demo-header-${demoCase.id}-expanded`,
      }),
    ).toBeTruthy();
    expect(
      renderer!.root.findByProps({
        testID: `demo-header-${demoCase.id}-outcome`,
      }).props.children,
    ).toBe(`收起后：${demoCase.restingState}`);
    expect(
      renderer!.root.findAllByProps({
        testID: `demo-header-${demoCase.id}-background`,
      }).length > 0,
    ).toBe(definition.hasParallaxBackground);
    expect(
      renderer!.root.findAllByProps({
        testID: `demo-header-${demoCase.id}-collapsed`,
      }).length > 0,
    ).toBe(definition.hasCollapsedLayout);
    if (definition.hasCollapsedLayout) {
      const collapsed = renderer!.root.findAllByProps({
        testID: `demo-header-${demoCase.id}-collapsed`,
      })[0]!;
      expect(
        require('react-native').StyleSheet.flatten(collapsed.props.style)
          .height,
      ).toBe(
        demoCase.collapsedHeight === 'measure'
          ? demoCase.collapsedMeasuredHeight
          : demoCase.collapsedHeight,
      );
    }
    expect(
      renderer!.root.findAllByProps({
        testID: `demo-header-${demoCase.id}-retained`,
      }).length > 0,
    ).toBe(demoCase.showRetainedArea === true);
    if (definition.hasParallaxBackground) {
      expect(
        renderer!.root.findByProps({
          testID: `demo-header-${demoCase.id}-speed`,
        }).props.children,
      ).toBe(`背景刻度层 · ${(demoCase.parallaxRate ?? 0.35).toFixed(2)}×`);
    }
    await ReactTestRenderer.act(() => renderer!.unmount());
  },
);

test('renders a gallery with every coordinator scenario', async () => {
  let renderer: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(<App />);
  });

  expect(
    renderer!.root.findByProps({ testID: 'scenario-gallery' }),
  ).toBeTruthy();
  for (const id of scenarioIds) {
    expect(
      renderer!.root.findByProps({ testID: `scenario-entry-${id}` }),
    ).toBeTruthy();
  }
});

test.each(scenarioIds)('opens the %s scenario independently', async id => {
  let renderer: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(<App />);
  });

  await ReactTestRenderer.act(() => {
    renderer!.root
      .findByProps({ testID: `scenario-entry-${id}` })
      .props.onPress();
  });
  const scenario = renderer!.root.findByProps({ testID: `demo-${id}` });
  expect(scenario).toBeTruthy();
  expect(
    require('react-native').StyleSheet.flatten(scenario.props.style),
  ).toMatchObject({
    flex: 1,
  });
  await ReactTestRenderer.act(() => renderer!.unmount());
});

test('opens a scenario from the gallery and returns home', async () => {
  let renderer: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(<App />);
  });

  await ReactTestRenderer.act(() => {
    renderer!.root
      .findByProps({ testID: 'scenario-entry-many-tabs' })
      .props.onPress();
  });
  expect(renderer!.root.findByProps({ testID: 'demo-many-tabs' })).toBeTruthy();

  await ReactTestRenderer.act(() => {
    renderer!.root.findByProps({ testID: 'scenario-back' }).props.onPress();
  });
  expect(
    renderer!.root.findByProps({ testID: 'scenario-gallery' }),
  ).toBeTruthy();
});

test('restores the gallery scroll offset after returning from a scenario', async () => {
  let renderer: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(<App />);
  });

  await ReactTestRenderer.act(() => {
    renderer!.root
      .findByProps({ testID: 'scenario-gallery' })
      .props.onScroll({ nativeEvent: { contentOffset: { x: 0, y: 720 } } });
    renderer!.root
      .findByProps({ testID: 'scenario-entry-header-snap' })
      .props.onPress();
  });

  await ReactTestRenderer.act(() => {
    renderer!.root.findByProps({ testID: 'scenario-back' }).props.onPress();
  });

  expect(
    renderer!.root.findByProps({ testID: 'scenario-gallery' }).props
      .contentOffset,
  ).toEqual({ x: 0, y: 720 });
});

test('exposes a real custom action alongside controlled tabs', async () => {
  let renderer: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(<App />);
  });

  await ReactTestRenderer.act(() => {
    renderer!.root
      .findByProps({ testID: 'scenario-entry-custom-tab-actions' })
      .props.onPress();
  });
  expect(
    renderer!.root.findByProps({ testID: 'custom-tab-action' }),
  ).toBeTruthy();
  await ReactTestRenderer.act(() => renderer!.unmount());
});

test('opens detail pages from banner cards and list items without unmounting the scenario', async () => {
  let renderer: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(<App />);
  });

  await ReactTestRenderer.act(() => {
    renderer!.root
      .findByProps({ testID: 'scenario-entry-flash-banner' })
      .props.onPress();
  });

  await ReactTestRenderer.act(() => {
    renderer!.root
      .findByProps({ testID: 'Wallet-banner-card-1' })
      .props.onPress();
  });
  expect(renderer!.root.findByProps({ testID: 'detail-screen' })).toBeTruthy();
  expect(
    renderer!.root.findByProps({ testID: 'detail-kind' }).props.children,
  ).toBe('BANNER CARD');

  await ReactTestRenderer.act(() => {
    renderer!.root.findByProps({ testID: 'detail-back' }).props.onPress();
  });
  expect(
    renderer!.root.findByProps({ testID: 'demo-flash-banner' }),
  ).toBeTruthy();
  expect(
    renderer!.root.findAllByProps({ testID: 'detail-screen' }),
  ).toHaveLength(0);

  await ReactTestRenderer.act(() => {
    renderer!.root.findByProps({ testID: 'row-Wallet-0' }).props.onPress();
  });
  expect(
    renderer!.root.findByProps({ testID: 'detail-kind' }).props.children,
  ).toBe('LIST ITEM');
  await ReactTestRenderer.act(() => renderer!.unmount());
});

test('simulates a deliberately slow batch in the huge-list scenario', async () => {
  jest.useFakeTimers();
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
  try {
    await ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(<App />);
    });
    await ReactTestRenderer.act(() => {
      renderer!.root
        .findByProps({ testID: 'scenario-entry-slow-huge-list' })
        .props.onPress();
    });

    expect(
      renderer!.root.findByProps({ testID: 'slow-list-count' }).props.children,
    ).toBe('30 / 20,000');

    await ReactTestRenderer.act(() => {
      renderer!.root
        .findByProps({ testID: 'slow-list-load-more' })
        .props.onPress();
    });
    expect(
      renderer!.root.findByProps({ testID: 'slow-list-loading' }),
    ).toBeTruthy();

    await ReactTestRenderer.act(() => {
      jest.advanceTimersByTime(1500);
    });
    expect(
      renderer!.root.findByProps({ testID: 'slow-list-count' }).props.children,
    ).toBe('60 / 20,000');
  } finally {
    if (renderer != null) {
      ReactTestRenderer.act(() => renderer?.unmount());
    }
    jest.useRealTimers();
  }
});
