import {
  forwardRef,
  type ForwardedRef,
  type ReactElement,
  type RefAttributes,
  useCallback,
} from 'react';
import {
  FlatList,
  RefreshControl,
  type FlatListProps,
  type ScrollViewProps,
} from 'react-native';

import { CoordinatorScrollView } from './CoordinatorScrollView';

function CoordinatorFlatListInner<ItemT>(
  {
    nestedScrollEnabled: _nestedScrollEnabled,
    onRefresh,
    progressViewOffset,
    refreshControl,
    refreshing,
    ...props
  }: FlatListProps<ItemT>,
  ref: ForwardedRef<FlatList<ItemT>>,
) {
  const renderScrollComponent = useCallback(
    (scrollProps: ScrollViewProps) => (
      <CoordinatorScrollView
        {...scrollProps}
        refreshControl={
          refreshControl ??
          (onRefresh != null ? (
            <RefreshControl
              onRefresh={onRefresh}
              progressViewOffset={progressViewOffset}
              refreshing={refreshing === true}
            />
          ) : undefined)
        }
      />
    ),
    [onRefresh, progressViewOffset, refreshControl, refreshing],
  );

  return (
    <FlatList
      {...props}
      ref={ref}
      nestedScrollEnabled
      renderScrollComponent={renderScrollComponent}
    />
  );
}

export const CoordinatorFlatList = forwardRef(CoordinatorFlatListInner) as <
  ItemT,
>(
  props: FlatListProps<ItemT> & RefAttributes<FlatList<ItemT>>,
) => ReactElement;
