import { useCallback, useMemo, useState } from 'react';
import { type LayoutChangeEvent, StyleSheet, View } from 'react-native';

import type { CoordinatorProps } from './Coordinator.types';
import { getCoordinatorLayout } from './CoordinatorLayout';
import NativeCoordinator from './CoordinatorNativeComponent';

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  contentSlot: {
    bottom: 0,
  },
  headerSlot: {
    top: 0,
  },
  slot: {
    left: 0,
    position: 'absolute',
    right: 0,
  },
});

export function Coordinator({
  children,
  header,
  headerHeight: providedHeaderHeight,
  minimumHeaderHeight = 0,
  snapEnabled = false,
  style,
  tabBar,
  ...rest
}: CoordinatorProps) {
  const [measuredHeaderHeight, setMeasuredHeaderHeight] = useState(0);
  const [tabBarHeight, setTabBarHeight] = useState(0);
  const headerHeight = providedHeaderHeight ?? measuredHeaderHeight;

  const handleHeaderLayout = useCallback((event: LayoutChangeEvent) => {
    const height = event.nativeEvent.layout.height;
    setMeasuredHeaderHeight((current) =>
      current === height ? current : height,
    );
  }, []);

  const handleTabBarLayout = useCallback((event: LayoutChangeEvent) => {
    const height = event.nativeEvent.layout.height;
    setTabBarHeight((current) => (current === height ? current : height));
  }, []);

  const layout = useMemo(
    () => getCoordinatorLayout(headerHeight, tabBarHeight, minimumHeaderHeight),
    [headerHeight, minimumHeaderHeight, tabBarHeight],
  );

  return (
    <NativeCoordinator
      {...rest}
      headerHeight={headerHeight}
      minimumHeaderHeight={minimumHeaderHeight}
      snapEnabled={snapEnabled}
      style={[styles.container, style]}
      tabBarHeight={tabBarHeight}
    >
      <View
        collapsable={false}
        onLayout={handleHeaderLayout}
        style={[styles.slot, styles.headerSlot]}
      >
        {header}
      </View>
      <View
        collapsable={false}
        onLayout={handleTabBarLayout}
        style={[styles.slot, { top: layout.tabBarTop }]}
      >
        {tabBar}
      </View>
      <View
        collapsable={false}
        style={[styles.slot, styles.contentSlot, { top: layout.contentTop }]}
      >
        {children}
      </View>
    </NativeCoordinator>
  );
}
