import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  type ReactNode,
} from 'react';
import type { LayoutChangeEvent } from 'react-native';

import { resolveHeaderRetainedHeight } from './CoordinatorHeaderState';

const ignoreHeight = (_height: number) => {};
const CoordinatorHeaderContext = createContext({
  minimumHeaderHeight: 0,
  reportCollapsedHeight: ignoreHeight,
});

export function CoordinatorHeaderProvider({
  children,
  minimumHeaderHeight = 0,
  onCollapsedHeightChange,
}: {
  children: ReactNode;
  minimumHeaderHeight?: number;
  onCollapsedHeightChange?: (height: number) => void;
}) {
  const value = useMemo(
    () => ({
      minimumHeaderHeight: Math.max(0, minimumHeaderHeight),
      reportCollapsedHeight: onCollapsedHeightChange ?? ignoreHeight,
    }),
    [minimumHeaderHeight, onCollapsedHeightChange],
  );
  return (
    <CoordinatorHeaderContext.Provider value={value}>
      {children}
    </CoordinatorHeaderContext.Provider>
  );
}

export function useCoordinatorHeaderConfig() {
  return useContext(CoordinatorHeaderContext);
}

export function useCoordinatorHeaderRegistration(
  hasCollapsedLayout: boolean,
  configuredHeight?: number,
) {
  const { reportCollapsedHeight } = useCoordinatorHeaderConfig();

  useLayoutEffect(() => {
    if (!hasCollapsedLayout || configuredHeight != null) {
      reportCollapsedHeight(
        resolveHeaderRetainedHeight(
          hasCollapsedLayout,
          configuredHeight,
          undefined,
        ),
      );
    }
  }, [configuredHeight, hasCollapsedLayout, reportCollapsedHeight]);

  useEffect(
    () => () => {
      reportCollapsedHeight(0);
    },
    [reportCollapsedHeight],
  );

  const handleLayout = useCallback(
    (event: LayoutChangeEvent) => {
      reportCollapsedHeight(
        resolveHeaderRetainedHeight(
          hasCollapsedLayout,
          configuredHeight,
          event.nativeEvent.layout.height,
        ),
      );
    },
    [configuredHeight, hasCollapsedLayout, reportCollapsedHeight],
  );

  return hasCollapsedLayout && configuredHeight == null
    ? handleLayout
    : undefined;
}
