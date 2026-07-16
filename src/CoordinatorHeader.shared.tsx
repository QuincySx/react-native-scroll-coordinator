import { StyleSheet, View } from 'react-native';

import {
  coordinatorHeaderSlots,
  resolveCoordinatorHeaderSlots,
} from './CoordinatorHeaderSlots';
import type { CoordinatorHeaderProps } from './CoordinatorHeader.types';

const styles = StyleSheet.create({
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  container: {
    overflow: 'hidden',
  },
  foreground: {
    flexGrow: 1,
  },
});

function CoordinatorHeaderContainer({
  background,
  children,
  collapsed,
  parallaxRate,
  style,
  transitionEnd: _transitionEnd,
  transitionStart: _transitionStart,
  ...rest
}: CoordinatorHeaderProps) {
  const slots = resolveCoordinatorHeaderSlots({
    background,
    children,
    collapsed,
    parallaxRate,
  });
  return (
    <View
      {...rest}
      style={[
        styles.container,
        style,
        slots.expandedHeight == null ? null : { height: slots.expandedHeight },
      ]}
    >
      <View pointerEvents="none" style={styles.background}>
        {slots.background}
      </View>
      <View style={styles.foreground}>{slots.expanded}</View>
    </View>
  );
}

export const CoordinatorHeader = Object.assign(CoordinatorHeaderContainer, {
  Container: CoordinatorHeaderContainer,
  ...coordinatorHeaderSlots,
});
