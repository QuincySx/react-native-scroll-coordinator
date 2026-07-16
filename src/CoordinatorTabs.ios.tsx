import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Tabs, type CollapsibleRef } from 'react-native-collapsible-tab-view';

import { CoordinatorHeaderProvider } from './CoordinatorHeaderContext';
import type {
  CoordinatorTabBarState,
  CoordinatorTabsProps,
} from './CoordinatorTabs.types';
import { useCoordinatorTabsState } from './useCoordinatorTabsState';

const styles = StyleSheet.create({
  container: { flex: 1 },
});

export function CoordinatorTabs<TabKey extends string>(
  props: CoordinatorTabsProps<TabKey>,
) {
  const {
    activeTabKey,
    allowHeaderOverscroll,
    headerHeight,
    initialTabKey,
    lazy,
    minimumHeaderHeight,
    onTabChange,
    renderHeader,
    renderTabBar,
    snapEnabled,
    swipeEnabled = true,
    tabs,
    style,
    ...viewProps
  } = props;
  const containerRef = useRef<NonNullable<CollapsibleRef> | null>(null);
  const [automaticMinimumHeaderHeight, setAutomaticMinimumHeaderHeight] =
    useState(0);
  const state = useCoordinatorTabsState({
    activeTabKey,
    initialTabKey,
    onTabChange,
    tabs,
  });

  useEffect(() => {
    if (state.activeKey != null) {
      containerRef.current?.jumpToTab(state.activeKey);
    }
  }, [state.activeKey, state.syncRevision]);

  if (state.activeKey == null) {
    return <View {...viewProps} style={style} />;
  }

  const tabBarState: CoordinatorTabBarState<TabKey> = {
    activeIndex: state.activeIndex,
    activeKey: state.activeKey,
    selectTab: (key) => {
      containerRef.current?.jumpToTab(key);
    },
    tabs,
  };
  const resolvedMinimumHeaderHeight =
    minimumHeaderHeight ?? automaticMinimumHeaderHeight;

  return (
    <View {...viewProps} style={[styles.container, style]}>
      <Tabs.Container
        ref={containerRef}
        allowHeaderOverscroll={allowHeaderOverscroll}
        containerStyle={styles.container}
        headerHeight={headerHeight}
        initialTabName={state.activeKey}
        lazy={lazy}
        minHeaderHeight={resolvedMinimumHeaderHeight}
        onTabChange={({ index }) => state.commitIndex(index)}
        pagerProps={{ scrollEnabled: swipeEnabled }}
        renderHeader={() => (
          <CoordinatorHeaderProvider
            minimumHeaderHeight={resolvedMinimumHeaderHeight}
            onCollapsedHeightChange={
              minimumHeaderHeight == null
                ? setAutomaticMinimumHeaderHeight
                : undefined
            }
          >
            <View collapsable={false}>{renderHeader()}</View>
          </CoordinatorHeaderProvider>
        )}
        renderTabBar={() => (
          <View collapsable={false}>{renderTabBar(tabBarState)}</View>
        )}
        snapThreshold={snapEnabled ? 0.5 : null}
      >
        {tabs.map((tab) => (
          <Tabs.Tab key={tab.key} name={tab.key}>
            {tab.render()}
          </Tabs.Tab>
        ))}
      </Tabs.Container>
    </View>
  );
}
