import { type ReactElement, type Ref } from 'react';
import {
  ScrollView,
  type ScrollView as ScrollViewHandle,
  type ScrollViewProps,
} from 'react-native';

import { useCoordinatorWebChrome } from './CoordinatorWebContext.web';

export type CoordinatorScrollViewHandle = ScrollViewHandle;

export type CoordinatorScrollViewProps = ScrollViewProps & {
  ref?: Ref<ScrollViewHandle>;
};

export function CoordinatorScrollView({
  children,
  ref,
  ...props
}: CoordinatorScrollViewProps): ReactElement {
  const chrome = useCoordinatorWebChrome();
  return (
    <ScrollView {...props} ref={ref}>
      {chrome}
      {children}
    </ScrollView>
  );
}
