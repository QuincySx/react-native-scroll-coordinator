import type { ComponentPropsWithRef } from 'react';
import { SectionList } from 'react-native';

export type CoordinatorSectionListProps<ItemT, SectionT> =
  ComponentPropsWithRef<typeof SectionList<ItemT, SectionT>>;
