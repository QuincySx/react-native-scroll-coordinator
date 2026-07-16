import type { ReactElement } from 'react';
import type { ScrollViewProps } from 'react-native';

import { CoordinatorScrollView } from './CoordinatorScrollView';

export type CoordinatorVirtualListBindings = {
  renderScrollComponent: (
    props: ScrollViewProps,
  ) => ReactElement<ScrollViewProps>;
};

export type CoordinatorVirtualListProps = {
  children: (bindings: CoordinatorVirtualListBindings) => ReactElement;
};

function renderCoordinatorScrollComponent(
  props: ScrollViewProps,
): ReactElement<ScrollViewProps> {
  return <CoordinatorScrollView {...props} />;
}

export function CoordinatorVirtualList({
  children,
}: CoordinatorVirtualListProps) {
  return children({ renderScrollComponent: renderCoordinatorScrollComponent });
}
