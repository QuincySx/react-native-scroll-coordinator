import { StyleSheet, View } from 'react-native';

import NativeCoordinatorHeader from './CoordinatorHeaderNativeComponent';
import { useCoordinatorHeaderRegistration } from './CoordinatorHeaderContext';
import {
  coordinatorHeaderSlots,
  resolveCoordinatorHeaderSlots,
} from './CoordinatorHeaderSlots';
import {
  normalizeHeaderTransition,
  normalizeParallaxRate,
} from './CoordinatorHeaderState';
import type { CoordinatorHeaderProps } from './CoordinatorHeader.types';

const styles = StyleSheet.create({
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  container: {
    overflow: 'hidden',
  },
  collapsed: {
    ...StyleSheet.absoluteFillObject,
  },
  collapsedContent: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
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
  transitionEnd,
  transitionStart,
  ...rest
}: CoordinatorHeaderProps) {
  const slots = resolveCoordinatorHeaderSlots({
    background,
    children,
    collapsed,
    parallaxRate,
  });
  const transition = normalizeHeaderTransition(transitionStart, transitionEnd);
  const handleCollapsedLayout = useCoordinatorHeaderRegistration(
    slots.collapsed != null,
    slots.collapsedHeight,
  );

  return (
    <NativeCoordinatorHeader
      {...rest}
      parallaxRate={normalizeParallaxRate(slots.parallaxRate)}
      style={[
        styles.container,
        style,
        slots.expandedHeight == null ? null : { height: slots.expandedHeight },
      ]}
      transitionEnd={transition.end}
      transitionStart={transition.start}
    >
      <View collapsable={false} pointerEvents="none" style={styles.background}>
        {slots.background}
      </View>
      <View collapsable={false} style={styles.foreground}>
        {slots.expanded}
      </View>
      {slots.collapsed == null ? null : (
        <View collapsable={false} style={styles.collapsed}>
          <View
            onLayout={handleCollapsedLayout}
            style={[
              styles.collapsedContent,
              slots.collapsedHeight == null
                ? null
                : { height: slots.collapsedHeight },
            ]}
          >
            {slots.collapsed}
          </View>
        </View>
      )}
    </NativeCoordinatorHeader>
  );
}

export const CoordinatorHeader = Object.assign(CoordinatorHeaderContainer, {
  Container: CoordinatorHeaderContainer,
  ...coordinatorHeaderSlots,
});
