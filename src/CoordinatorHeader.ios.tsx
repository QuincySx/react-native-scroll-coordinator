import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useHeaderMeasurements } from 'react-native-collapsible-tab-view';
import Animated, {
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useDerivedValue,
} from 'react-native-reanimated';

import {
  useCoordinatorHeaderConfig,
  useCoordinatorHeaderRegistration,
} from './CoordinatorHeaderContext';
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
  const { height, top } = useHeaderMeasurements();
  const { minimumHeaderHeight } = useCoordinatorHeaderConfig();
  const [collapsedOwnsInteraction, setCollapsedOwnsInteraction] =
    useState(false);
  const rate = normalizeParallaxRate(slots.parallaxRate);
  const transition = normalizeHeaderTransition(transitionStart, transitionEnd);
  const collapseRange = Math.max(1, height - minimumHeaderHeight);
  const hasCollapsedLayout = slots.collapsed != null;
  const handleCollapsedLayout = useCoordinatorHeaderRegistration(
    hasCollapsedLayout,
    slots.collapsedHeight,
  );
  const transitionProgress = useDerivedValue(() => {
    const collapseProgress = Math.max(
      0,
      Math.min(1, -top.value / collapseRange),
    );
    return Math.max(
      0,
      Math.min(
        1,
        (collapseProgress - transition.start) /
          (transition.end - transition.start),
      ),
    );
  }, [collapseRange, top, transition.end, transition.start]);
  const backgroundStyle = useAnimatedStyle(
    () => ({
      transform: [{ translateY: -top.value * (1 - rate) }],
    }),
    [rate, top],
  );
  const expandedStyle = useAnimatedStyle(
    () => ({ opacity: hasCollapsedLayout ? 1 - transitionProgress.value : 1 }),
    [hasCollapsedLayout, transitionProgress],
  );
  const collapsedStyle = useAnimatedStyle(
    () => ({ opacity: transitionProgress.value }),
    [transitionProgress],
  );

  useAnimatedReaction(
    () => hasCollapsedLayout && transitionProgress.value >= 0.5,
    (isCollapsed, wasCollapsed) => {
      if (isCollapsed !== wasCollapsed) {
        runOnJS(setCollapsedOwnsInteraction)(isCollapsed);
      }
    },
    [hasCollapsedLayout, transitionProgress],
  );

  return (
    <View
      {...rest}
      style={[
        styles.container,
        style,
        slots.expandedHeight == null ? null : { height: slots.expandedHeight },
      ]}
    >
      <Animated.View
        pointerEvents="none"
        style={[styles.background, backgroundStyle]}
      >
        {slots.background}
      </Animated.View>
      <Animated.View
        accessibilityElementsHidden={collapsedOwnsInteraction}
        importantForAccessibility={
          collapsedOwnsInteraction ? 'no-hide-descendants' : 'auto'
        }
        pointerEvents={collapsedOwnsInteraction ? 'none' : 'box-none'}
        style={[styles.foreground, expandedStyle]}
      >
        {slots.expanded}
      </Animated.View>
      {slots.collapsed == null ? null : (
        <Animated.View
          accessibilityElementsHidden={!collapsedOwnsInteraction}
          importantForAccessibility={
            collapsedOwnsInteraction ? 'auto' : 'no-hide-descendants'
          }
          pointerEvents={collapsedOwnsInteraction ? 'box-none' : 'none'}
          style={[styles.collapsed, collapsedStyle]}
        >
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
        </Animated.View>
      )}
    </View>
  );
}

export const CoordinatorHeader = Object.assign(CoordinatorHeaderContainer, {
  Container: CoordinatorHeaderContainer,
  ...coordinatorHeaderSlots,
});
