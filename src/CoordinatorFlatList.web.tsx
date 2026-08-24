import { type ReactElement, type Ref } from 'react';
import { FlatList, type FlatListProps } from 'react-native';

import { useCoordinatorWebListHeader } from './CoordinatorWebContext.web';

export type CoordinatorFlatListProps<ItemT> = FlatListProps<ItemT> & {
  ref?: Ref<FlatList<ItemT>>;
};

export function CoordinatorFlatList<ItemT>({
  ref,
  ...props
}: CoordinatorFlatListProps<ItemT>): ReactElement {
  const ListHeaderComponent = useCoordinatorWebListHeader(
    props.ListHeaderComponent,
  );
  return (
    <FlatList {...props} ref={ref} ListHeaderComponent={ListHeaderComponent} />
  );
}
