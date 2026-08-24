import { type ReactElement, type Ref } from 'react';
import { FlashList, type FlashListRef } from '@shopify/flash-list';

import type { CoordinatorFlashListProps } from './CoordinatorFlashList.types';
import { useCoordinatorWebListHeader } from './CoordinatorWebContext.web';

type CoordinatorFlashListWithRefProps<ItemT> =
  CoordinatorFlashListProps<ItemT> & {
    ref?: Ref<FlashListRef<ItemT>>;
  };

export function CoordinatorFlashList<ItemT>({
  ref,
  ...props
}: CoordinatorFlashListWithRefProps<ItemT>): ReactElement {
  const ListHeaderComponent = useCoordinatorWebListHeader(
    props.ListHeaderComponent,
  );
  return (
    <FlashList {...props} ref={ref} ListHeaderComponent={ListHeaderComponent} />
  );
}
