import {
  forwardRef,
  type ForwardedRef,
  type ReactElement,
  type RefAttributes,
} from 'react';
import { FlashList, type FlashListRef } from '@shopify/flash-list';

import type { CoordinatorFlashListProps } from './CoordinatorFlashList.types';
import { CoordinatorScrollView } from './CoordinatorScrollView';

function CoordinatorFlashListInner<ItemT>(
  props: CoordinatorFlashListProps<ItemT>,
  ref: ForwardedRef<FlashListRef<ItemT>>,
) {
  const { maintainVisibleContentPosition = { disabled: true }, ...listProps } =
    props;

  return (
    <FlashList
      {...listProps}
      maintainVisibleContentPosition={maintainVisibleContentPosition}
      ref={ref}
      renderScrollComponent={CoordinatorScrollView}
    />
  );
}

export const CoordinatorFlashList = forwardRef(CoordinatorFlashListInner) as <
  ItemT,
>(
  props: CoordinatorFlashListProps<ItemT> & RefAttributes<FlashListRef<ItemT>>,
) => ReactElement;
