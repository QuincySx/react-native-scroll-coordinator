import type { ComponentType, ReactElement } from 'react';
import type { ScrollViewProps } from 'react-native';

import { CoordinatorScrollView } from './CoordinatorScrollView.web';

export type CoordinatorVirtualListBindings = {
  renderScrollComponent: ComponentType<ScrollViewProps>;
};

export type CoordinatorVirtualListProps = {
  children: (bindings: CoordinatorVirtualListBindings) => ReactElement;
};

export function CoordinatorVirtualList({
  children,
}: CoordinatorVirtualListProps) {
  return children({ renderScrollComponent: CoordinatorScrollView });
}
