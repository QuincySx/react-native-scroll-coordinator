import type { ReactNode } from 'react';
import type { ViewProps } from 'react-native';

export type CoordinatorProps = Omit<ViewProps, 'children'> & {
  children: ReactNode;
  header: ReactNode;
  headerHeight?: number;
  minimumHeaderHeight?: number;
  snapEnabled?: boolean;
  tabBar: ReactNode;
};
