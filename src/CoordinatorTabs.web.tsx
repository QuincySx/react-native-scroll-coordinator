import { useCallback, useEffect, useRef, useState } from 'react';
import {
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import type {
  CoordinatorTabBarState,
  CoordinatorTabsProps,
} from './CoordinatorTabs.types';
import { resolvePagerIndex } from './CoordinatorTabsState';
import { CoordinatorWebProvider } from './CoordinatorWebContext.web';
import { useCoordinatorTabsState } from './useCoordinatorTabsState';

const styles = StyleSheet.create({
  chromeTabBar: {
    position: 'sticky' as never,
    top: 0,
    zIndex: 1,
  },
  container: { flex: 1 },
  pager: { flex: 1 },
  page: { height: '100%' },
});

export function CoordinatorWebPage({
  children,
  chrome,
}: {
  children: React.ReactNode;
  chrome: React.ReactElement;
}) {
  return (
    <CoordinatorWebProvider chrome={chrome}>{children}</CoordinatorWebProvider>
  );
}

export function CoordinatorTabs<TabKey extends string>(
  props: CoordinatorTabsProps<TabKey>,
) {
  const {
    activeTabKey,
    allowHeaderOverscroll,
    headerHeight,
    initialTabKey,
    lazy = false,
    minimumHeaderHeight,
    onTabChange,
    renderHeader,
    renderTabBar,
    snapEnabled,
    swipeEnabled = true,
    tabs,
    ...viewProps
  } = props;
  const state = useCoordinatorTabsState({
    activeTabKey,
    initialTabKey,
    onTabChange,
    tabs,
  });
  const pagerRef = useRef<ScrollView>(null);
  const pendingPagerIndex = useRef<number | null>(null);
  const scrollEndTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [pageWidth, setPageWidth] = useState(0);
  useEffect(() => {
    if (
      __DEV__ &&
      (allowHeaderOverscroll != null ||
        headerHeight != null ||
        minimumHeaderHeight != null ||
        snapEnabled != null)
    ) {
      console.warn(
        'CoordinatorTabs: header overscroll, fixed heights, and snap are not supported on Web in this alpha.',
      );
    }
  }, [allowHeaderOverscroll, headerHeight, minimumHeaderHeight, snapEnabled]);
  const [visited, setVisited] = useState(
    () => new Set(state.activeKey == null ? [] : [state.activeKey]),
  );

  useEffect(() => {
    if (state.activeKey != null) {
      setVisited((current) => new Set(current).add(state.activeKey as TabKey));
    }
  }, [state.activeKey]);

  const selectIndex = useCallback(
    (index: number) => {
      if (index >= 0 && index < tabs.length) {
        if (scrollEndTimer.current != null) {
          clearTimeout(scrollEndTimer.current);
          scrollEndTimer.current = null;
        }
        setVisited((current) => new Set(current).add(tabs[index].key));
        pendingPagerIndex.current = index;
        pagerRef.current?.scrollTo({
          animated: true,
          x: index * pageWidth,
          y: 0,
        });
        state.commitIndex(index);
      }
    },
    [pageWidth, state, tabs],
  );
  const tabBarState: CoordinatorTabBarState<TabKey> | null =
    state.activeKey == null
      ? null
      : {
          activeIndex: state.activeIndex,
          activeKey: state.activeKey,
          selectTab: (key) => selectIndex(state.indexForKey(key)),
          tabs,
        };
  const chrome =
    tabBarState == null ? null : (
      <>
        <View>{renderHeader()}</View>
        <View style={styles.chromeTabBar}>{renderTabBar(tabBarState)}</View>
      </>
    );

  useEffect(() => {
    if (pageWidth > 0 && state.activeIndex >= 0) {
      if (pendingPagerIndex.current === state.activeIndex) {
        pendingPagerIndex.current = null;
        return;
      }
      pendingPagerIndex.current = null;
      pagerRef.current?.scrollTo({
        animated: false,
        x: state.activeIndex * pageWidth,
        y: 0,
      });
    }
  }, [pageWidth, state.activeIndex, state.syncRevision]);

  const handleLayout = useCallback(
    (event: LayoutChangeEvent) => {
      setPageWidth(event.nativeEvent.layout.width);
      viewProps.onLayout?.(event);
    },
    [viewProps],
  );

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetX = event.nativeEvent.contentOffset.x;
      if (scrollEndTimer.current != null) {
        clearTimeout(scrollEndTimer.current);
      }
      scrollEndTimer.current = setTimeout(() => {
        scrollEndTimer.current = null;
        const index = resolvePagerIndex(offsetX, pageWidth, tabs.length);
        if (index >= 0 && index !== state.activeIndex) {
          setVisited((current) => new Set(current).add(tabs[index].key));
          pendingPagerIndex.current = index;
          state.commitIndex(index);
        }
      }, 120);
    },
    [pageWidth, state, tabs],
  );

  useEffect(
    () => () => {
      if (scrollEndTimer.current != null) {
        clearTimeout(scrollEndTimer.current);
      }
    },
    [],
  );

  if (chrome == null) {
    return <View {...viewProps} />;
  }

  return (
    <View
      {...viewProps}
      onLayout={handleLayout}
      style={[styles.container, viewProps.style]}
    >
      <ScrollView
        contentOffset={{ x: state.activeIndex * pageWidth, y: 0 }}
        horizontal
        onScroll={handleScroll}
        pagingEnabled
        ref={pagerRef}
        scrollEnabled={swipeEnabled}
        scrollEventThrottle={32}
        showsHorizontalScrollIndicator={false}
        style={styles.pager}
      >
        {tabs.map((tab) => (
          <View key={tab.key} style={[styles.page, { width: pageWidth }]}>
            {!lazy || visited.has(tab.key) ? (
              <CoordinatorWebPage chrome={chrome}>
                {tab.render()}
              </CoordinatorWebPage>
            ) : null}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
