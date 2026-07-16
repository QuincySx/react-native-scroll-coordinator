import { StyleSheet, View } from 'react-native';

import type { CoordinatorProps } from './Coordinator.types';

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
});

export function Coordinator({
  children,
  header,
  headerHeight: _headerHeight,
  tabBar,
  ...viewProps
}: CoordinatorProps) {
  return (
    <View {...viewProps}>
      <View collapsable={false}>{header}</View>
      <View collapsable={false}>{tabBar}</View>
      <View collapsable={false} style={styles.content}>
        {children}
      </View>
    </View>
  );
}
