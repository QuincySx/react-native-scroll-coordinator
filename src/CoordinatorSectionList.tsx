import { type ReactElement, useCallback } from 'react';
import {
  RefreshControl,
  SectionList,
  type ScrollViewProps,
} from 'react-native';

import { CoordinatorScrollView } from './CoordinatorScrollView';
import type { CoordinatorSectionListProps } from './CoordinatorSectionList.types';

export function CoordinatorSectionList<ItemT, SectionT>({
  nestedScrollEnabled: _nestedScrollEnabled,
  onRefresh,
  progressViewOffset,
  ref,
  refreshControl,
  refreshing,
  ...props
}: CoordinatorSectionListProps<ItemT, SectionT>): ReactElement {
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
    <SectionList
      {...props}
      ref={ref}
      nestedScrollEnabled
      renderScrollComponent={renderScrollComponent}
    />
  );
}
