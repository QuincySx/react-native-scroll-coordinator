import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import PagerView from 'react-native-pager-view';

import {
  type AndroidPagerScrollState,
  resolveAndroidPagerCommand,
} from './AndroidPagerState';
import { Coordinator } from './Coordinator';
import { CoordinatorHeaderProvider } from './CoordinatorHeaderContext';
import type {
  CoordinatorTabBarState,
  CoordinatorTabsProps,
} from './CoordinatorTabs.types';
import { useCoordinatorTabsState } from './useCoordinatorTabsState';

const styles = StyleSheet.create({
  page: { flex: 1 },
  pager: { flex: 1 },
});

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
  const pagerRef = useRef<PagerView>(null);
  const [automaticMinimumHeaderHeight, setAutomaticMinimumHeaderHeight] =
    useState(0);
  const state = useCoordinatorTabsState({
    activeTabKey,
    initialTabKey,
    onTabChange,
    tabs,
  });
  const [visited, setVisited] = useState(
    () => new Set(state.activeKey == null ? [] : [state.activeKey]),
  );
  const authoritativeIndexRef = useRef(state.activeIndex);
  const nativeIndexRef = useRef(state.activeIndex);
  const pendingCommandIndexRef = useRef<number | null>(null);
  const scrollStateRef = useRef<AndroidPagerScrollState>('idle');
  const reconciliationFrameRef = useRef<number | null>(null);
  authoritativeIndexRef.current = state.activeIndex;

  useEffect(() => {
    if (__DEV__ && allowHeaderOverscroll === true) {
      console.warn(
        'CoordinatorTabs: allowHeaderOverscroll is currently supported on iOS only.',
      );
    }
  }, [allowHeaderOverscroll]);
  const markVisitedIndex = useCallback(
    (index: number) => {
      const key = tabs[index]?.key;
      if (key != null) {
        setVisited((current) => {
          if (current.has(key)) {
            return current;
          }
          return new Set(current).add(key);
        });
      }
    },
    [tabs],
  );

  const requestPage = useCallback(
    (index: number) => {
      if (
        index < 0 ||
        nativeIndexRef.current === index ||
        pendingCommandIndexRef.current === index
      ) {
        return;
      }

      const pager = pagerRef.current;
      if (pager == null) {
        return;
      }

      markVisitedIndex(index);
      pendingCommandIndexRef.current = index;
      pager.setPage(index);
    },
    [markVisitedIndex],
  );

  const reconcilePager = useCallback(() => {
    const commandIndex = resolveAndroidPagerCommand({
      authoritativeIndex: authoritativeIndexRef.current,
      nativeIndex: nativeIndexRef.current,
      pendingCommandIndex: pendingCommandIndexRef.current,
      scrollState: scrollStateRef.current,
    });
    if (commandIndex != null) {
      requestPage(commandIndex);
    }
  }, [requestPage]);

  const schedulePagerReconciliation = useCallback(() => {
    if (reconciliationFrameRef.current != null) {
      cancelAnimationFrame(reconciliationFrameRef.current);
    }
    reconciliationFrameRef.current = requestAnimationFrame(() => {
      reconciliationFrameRef.current = null;
      reconcilePager();
    });
  }, [reconcilePager]);

  useEffect(
    () => () => {
      if (reconciliationFrameRef.current != null) {
        cancelAnimationFrame(reconciliationFrameRef.current);
      }
    },
    [],
  );

  useEffect(() => {
    if (state.activeIndex >= 0) {
      markVisitedIndex(state.activeIndex);
      reconcilePager();
    }
  }, [markVisitedIndex, reconcilePager, state.activeIndex, state.syncRevision]);

  if (state.activeKey == null) {
    return <View {...viewProps} />;
  }

  const tabBarState: CoordinatorTabBarState<TabKey> = {
    activeIndex: state.activeIndex,
    activeKey: state.activeKey,
    selectTab: (key) => {
      const index = state.indexForKey(key);
      if (index >= 0) {
        requestPage(index);
      }
    },
    tabs,
  };
  const resolvedMinimumHeaderHeight =
    minimumHeaderHeight ?? automaticMinimumHeaderHeight;

  return (
    <Coordinator
      {...viewProps}
      header={
        <CoordinatorHeaderProvider
          minimumHeaderHeight={resolvedMinimumHeaderHeight}
          onCollapsedHeightChange={
            minimumHeaderHeight == null
              ? setAutomaticMinimumHeaderHeight
              : undefined
          }
        >
          {renderHeader()}
        </CoordinatorHeaderProvider>
      }
      headerHeight={headerHeight}
      minimumHeaderHeight={resolvedMinimumHeaderHeight}
      snapEnabled={snapEnabled}
      tabBar={renderTabBar(tabBarState)}
    >
      <PagerView
        ref={pagerRef}
        initialPage={state.activeIndex}
        onPageSelected={(event) => {
          const index = event.nativeEvent.position;
          nativeIndexRef.current = index;
          pendingCommandIndexRef.current = null;
          markVisitedIndex(index);
          state.commitIndex(index);
        }}
        onPageScrollStateChanged={(event) => {
          const scrollState = event.nativeEvent.pageScrollState;
          scrollStateRef.current = scrollState;
          if (scrollState === 'idle') {
            schedulePagerReconciliation();
          } else if (reconciliationFrameRef.current != null) {
            cancelAnimationFrame(reconciliationFrameRef.current);
            reconciliationFrameRef.current = null;
          }
        }}
        scrollEnabled={swipeEnabled}
        style={styles.pager}
      >
        {tabs.map((tab) => (
          <View key={tab.key} collapsable={false} style={styles.page}>
            {!lazy || visited.has(tab.key) ? tab.render() : null}
          </View>
        ))}
      </PagerView>
    </Coordinator>
  );
}
