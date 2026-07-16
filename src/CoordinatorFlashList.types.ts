import type { FlashListProps } from '@shopify/flash-list';

export type CoordinatorFlashListProps<ItemT> = Omit<
  FlashListProps<ItemT>,
  'renderScrollComponent'
>;
