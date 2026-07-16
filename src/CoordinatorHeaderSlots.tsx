import { Children, Fragment, isValidElement, type ReactNode } from 'react';

import type {
  CoordinatorHeaderBackgroundProps,
  CoordinatorHeaderContentProps,
} from './CoordinatorHeader.types';
import { normalizeHeaderHeight } from './CoordinatorHeaderState';

export function CoordinatorHeaderBackground({
  children,
}: CoordinatorHeaderBackgroundProps) {
  return <>{children}</>;
}

export function CoordinatorHeaderExpanded({
  children,
}: CoordinatorHeaderContentProps) {
  return <>{children}</>;
}

export function CoordinatorHeaderCollapsed({
  children,
}: CoordinatorHeaderContentProps) {
  return <>{children}</>;
}

type ResolveCoordinatorHeaderSlotsOptions = {
  background?: ReactNode;
  children?: ReactNode;
  collapsed?: ReactNode;
  parallaxRate?: number;
};

export function resolveCoordinatorHeaderSlots({
  background,
  children,
  collapsed,
  parallaxRate,
}: ResolveCoordinatorHeaderSlotsOptions) {
  let backgroundNode = background;
  let expandedNode: ReactNode;
  let collapsedNode = collapsed;
  let expandedHeight: number | undefined;
  let collapsedHeight: number | undefined;
  let resolvedParallaxRate = parallaxRate;
  const ordinaryChildren: ReactNode[] = [];

  const visit = (nodes: ReactNode) => {
    Children.forEach(nodes, (child) => {
      if (child == null || typeof child === 'boolean') {
        return;
      }
      if (
        isValidElement<{ children?: ReactNode }>(child) &&
        child.type === Fragment
      ) {
        visit(child.props.children);
        return;
      }
      if (isValidElement<CoordinatorHeaderBackgroundProps>(child)) {
        if (child.type === CoordinatorHeaderBackground) {
          if (backgroundNode != null) {
            throw new Error('CoordinatorHeader accepts one Background slot.');
          }
          backgroundNode = child.props.children;
          resolvedParallaxRate = child.props.parallaxRate ?? parallaxRate;
          return;
        }
      }
      if (isValidElement<CoordinatorHeaderContentProps>(child)) {
        if (child.type === CoordinatorHeaderExpanded) {
          if (expandedNode != null) {
            throw new Error('CoordinatorHeader accepts one Expanded slot.');
          }
          expandedNode = child.props.children;
          expandedHeight = normalizeHeaderHeight(child.props.height);
          return;
        }
        if (child.type === CoordinatorHeaderCollapsed) {
          if (collapsedNode != null) {
            throw new Error('CoordinatorHeader accepts one Collapsed slot.');
          }
          collapsedNode = child.props.children;
          collapsedHeight = normalizeHeaderHeight(child.props.height);
          return;
        }
      }
      ordinaryChildren.push(child);
    });
  };
  visit(children);

  if (expandedNode != null && ordinaryChildren.length > 0) {
    throw new Error(
      'CoordinatorHeader cannot mix an Expanded slot with ordinary children.',
    );
  }
  if (expandedNode == null) {
    expandedNode = ordinaryChildren;
  }

  return {
    background: backgroundNode,
    collapsed: collapsedNode,
    collapsedHeight,
    expanded: expandedNode,
    expandedHeight,
    parallaxRate: resolvedParallaxRate,
  };
}

export const coordinatorHeaderSlots = {
  Background: CoordinatorHeaderBackground,
  Collapsed: CoordinatorHeaderCollapsed,
  Expanded: CoordinatorHeaderExpanded,
};
