import {
  forwardRef,
  type ForwardedRef,
  type ReactElement,
  type RefAttributes,
} from 'react';
import { FlashList, type FlashListRef } from '@shopify/flash-list';

import type { CoordinatorFlashListProps } from './CoordinatorFlashList.types';
import { useCoordinatorWebListHeader } from './CoordinatorWebContext.web';

function CoordinatorFlashListInner<ItemT>(
  props: CoordinatorFlashListProps<ItemT>,
  ref: ForwardedRef<FlashListRef<ItemT>>,
) {
  const ListHeaderComponent = useCoordinatorWebListHeader(
    props.ListHeaderComponent,
  );
  return (
    <FlashList {...props} ref={ref} ListHeaderComponent={ListHeaderComponent} />
  );
}

export const CoordinatorFlashList = forwardRef(CoordinatorFlashListInner) as <
  ItemT,
>(
  props: CoordinatorFlashListProps<ItemT> & RefAttributes<FlashListRef<ItemT>>,
) => ReactElement;
