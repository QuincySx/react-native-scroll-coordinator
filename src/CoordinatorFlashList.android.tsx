import { type ReactElement, type Ref } from 'react';
import { FlashList, type FlashListRef } from '@shopify/flash-list';

import type { CoordinatorFlashListProps } from './CoordinatorFlashList.types';
import { CoordinatorScrollView } from './CoordinatorScrollView';

type CoordinatorFlashListWithRefProps<ItemT> =
  CoordinatorFlashListProps<ItemT> & {
    ref?: Ref<FlashListRef<ItemT>>;
  };

export function CoordinatorFlashList<ItemT>({
  ref,
  ...props
}: CoordinatorFlashListWithRefProps<ItemT>): ReactElement {
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
