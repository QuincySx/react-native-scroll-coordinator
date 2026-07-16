import {
  forwardRef,
  type ForwardedRef,
  type ReactElement,
  type RefAttributes,
} from 'react';
import { FlatList, type FlatListProps } from 'react-native';

import { useCoordinatorWebListHeader } from './CoordinatorWebContext.web';

function CoordinatorFlatListInner<ItemT>(
  props: FlatListProps<ItemT>,
  ref: ForwardedRef<FlatList<ItemT>>,
) {
  const ListHeaderComponent = useCoordinatorWebListHeader(
    props.ListHeaderComponent,
  );
  return (
    <FlatList {...props} ref={ref} ListHeaderComponent={ListHeaderComponent} />
  );
}

export const CoordinatorFlatList = forwardRef(CoordinatorFlatListInner) as <
  ItemT,
>(
  props: FlatListProps<ItemT> & RefAttributes<FlatList<ItemT>>,
) => ReactElement;
