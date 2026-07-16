import {
  forwardRef,
  type ForwardedRef,
  type ReactElement,
  type RefAttributes,
} from 'react';
import {
  ScrollView,
  type ScrollView as ScrollViewHandle,
  type ScrollViewProps,
} from 'react-native';

import { useCoordinatorWebChrome } from './CoordinatorWebContext.web';

export type CoordinatorScrollViewHandle = ScrollViewHandle;

function CoordinatorScrollViewInner(
  { children, ...props }: ScrollViewProps,
  ref: ForwardedRef<ScrollViewHandle>,
) {
  const chrome = useCoordinatorWebChrome();
  return (
    <ScrollView {...props} ref={ref}>
      {chrome}
      {children}
    </ScrollView>
  );
}

export const CoordinatorScrollView = forwardRef(CoordinatorScrollViewInner) as (
  props: ScrollViewProps & RefAttributes<ScrollViewHandle>,
) => ReactElement;
