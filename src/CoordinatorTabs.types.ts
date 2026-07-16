import type { ReactElement, ReactNode } from 'react';
import type { ViewProps } from 'react-native';

import type { CoordinatorTabChangeEvent } from './CoordinatorTabsState';

export type CoordinatorTab<TabKey extends string> = {
  key: TabKey;
  label: ReactNode;
  render: () => ReactElement;
};

export type CoordinatorTabBarState<TabKey extends string> = {
  activeIndex: number;
  activeKey: TabKey;
  selectTab: (key: TabKey) => void;
  tabs: readonly CoordinatorTab<TabKey>[];
};

export type CoordinatorTabsProps<TabKey extends string> = Omit<
  ViewProps,
  'children'
> & {
  activeTabKey?: TabKey;
  allowHeaderOverscroll?: boolean;
  headerHeight?: number;
  initialTabKey?: TabKey;
  lazy?: boolean;
  minimumHeaderHeight?: number;
  onTabChange?: (event: CoordinatorTabChangeEvent<TabKey>) => void;
  renderHeader: () => ReactNode;
  renderTabBar: (state: CoordinatorTabBarState<TabKey>) => ReactNode;
  snapEnabled?: boolean;
  swipeEnabled?: boolean;
  tabs: readonly CoordinatorTab<TabKey>[];
};
