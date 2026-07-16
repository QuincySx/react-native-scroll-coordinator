import type { ReactNode } from 'react';
import type { ViewProps } from 'react-native';

export type CoordinatorHeaderProps = Omit<ViewProps, 'children'> & {
  background?: ReactNode;
  children?: ReactNode;
  collapsed?: ReactNode;
  parallaxRate?: number;
  transitionEnd?: number;
  transitionStart?: number;
};

export type CoordinatorHeaderBackgroundProps = {
  children: ReactNode;
  parallaxRate?: number;
};

export type CoordinatorHeaderContentProps = {
  children: ReactNode;
  height?: number;
};
