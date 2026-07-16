import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { CoordinatorTabsProps } from './CoordinatorTabs.types';
import {
  assertUniqueTabKeys,
  createTabSelection,
  resolveActiveTabKey,
} from './CoordinatorTabsState';

export function useCoordinatorTabsState<TabKey extends string>(
  props: Pick<
    CoordinatorTabsProps<TabKey>,
    'activeTabKey' | 'initialTabKey' | 'onTabChange' | 'tabs'
  >,
) {
  const { activeTabKey, initialTabKey, onTabChange, tabs } = props;
  const keys = useMemo(() => {
    const nextKeys = tabs.map((tab) => tab.key);
    assertUniqueTabKeys(nextKeys);
    return nextKeys;
  }, [tabs]);
  const controlled = activeTabKey != null;
  if (controlled && keys.length > 0 && !keys.includes(activeTabKey)) {
    throw new Error(`Unknown controlled coordinator tab key: ${activeTabKey}`);
  }

  const [uncontrolledKey, setUncontrolledKey] = useState(() =>
    resolveActiveTabKey(keys, initialTabKey),
  );
  const activeKey = controlled
    ? activeTabKey
    : resolveActiveTabKey(keys, uncontrolledKey);
  const activeIndex = activeKey == null ? -1 : keys.indexOf(activeKey);
  const activeKeyRef = useRef(activeKey);
  activeKeyRef.current = activeKey;
  const [syncRevision, setSyncRevision] = useState(0);

  useEffect(() => {
    if (!controlled && uncontrolledKey !== activeKey) {
      setUncontrolledKey(activeKey);
    }
  }, [activeKey, controlled, uncontrolledKey]);

  const commitIndex = useCallback(
    (nextIndex: number) => {
      const selection = createTabSelection(
        keys,
        activeKeyRef.current,
        nextIndex,
        controlled,
      );
      const { event } = selection;
      if (event == null) {
        return;
      }
      if (controlled) {
        setSyncRevision((value) => value + 1);
      } else {
        activeKeyRef.current = selection.nextActiveKey;
        setUncontrolledKey(selection.nextActiveKey);
      }
      onTabChange?.(event);
    },
    [controlled, keys, onTabChange],
  );

  const indexForKey = useCallback((key: TabKey) => keys.indexOf(key), [keys]);

  return {
    activeIndex,
    activeKey,
    commitIndex,
    indexForKey,
    keys,
    syncRevision,
  };
}
