import { type ReactElement } from 'react';
import { SectionList } from 'react-native';

import type { CoordinatorSectionListProps } from './CoordinatorSectionList.types';
import { useCoordinatorWebListHeader } from './CoordinatorWebContext.web';

export function CoordinatorSectionList<ItemT, SectionT>({
  ref,
  ...props
}: CoordinatorSectionListProps<ItemT, SectionT>): ReactElement {
  const ListHeaderComponent = useCoordinatorWebListHeader(
    props.ListHeaderComponent,
  );
  return (
    <SectionList
      {...props}
      ref={ref}
      ListHeaderComponent={ListHeaderComponent}
    />
  );
}
