export type CoordinatorTabChangeEvent<TabKey extends string> = {
  index: number;
  key: TabKey;
  previousIndex: number;
  previousKey: TabKey;
};

export function assertUniqueTabKeys<TabKey extends string>(
  keys: readonly TabKey[],
) {
  const seen = new Set<TabKey>();
  for (const key of keys) {
    if (seen.has(key)) {
      throw new Error(`Duplicate coordinator tab key: ${key}`);
    }
    seen.add(key);
  }
}

export function resolveActiveTabKey<TabKey extends string>(
  keys: readonly TabKey[],
  requestedKey?: TabKey,
): TabKey | undefined {
  if (requestedKey != null && keys.includes(requestedKey)) {
    return requestedKey;
  }
  return keys[0];
}

export function resolveTabIndex<TabKey extends string>(
  keys: readonly TabKey[],
  requestedKey?: string,
) {
  if (keys.length === 0) {
    return -1;
  }
  const resolvedKey = resolveActiveTabKey(
    keys,
    requestedKey as TabKey | undefined,
  );
  return resolvedKey == null ? -1 : keys.indexOf(resolvedKey);
}

export function createTabChangeEvent<TabKey extends string>(
  keys: readonly TabKey[],
  previousIndex: number,
  index: number,
): CoordinatorTabChangeEvent<TabKey> | null {
  if (
    previousIndex === index ||
    previousIndex < 0 ||
    index < 0 ||
    previousIndex >= keys.length ||
    index >= keys.length
  ) {
    return null;
  }

  return {
    index,
    key: keys[index],
    previousIndex,
    previousKey: keys[previousIndex],
  };
}

export function createTabSelection<TabKey extends string>(
  keys: readonly TabKey[],
  activeKey: TabKey | undefined,
  nextIndex: number,
  controlled: boolean,
) {
  const previousIndex = activeKey == null ? -1 : keys.indexOf(activeKey);
  const event = createTabChangeEvent(keys, previousIndex, nextIndex);
  return {
    event,
    nextActiveKey: event == null || controlled ? activeKey : event.key,
  };
}

export function resolveHorizontalSwipe(
  currentIndex: number,
  deltaX: number,
  deltaY: number,
  tabCount: number,
) {
  const isHorizontalIntent =
    Math.abs(deltaX) >= 48 && Math.abs(deltaX) > Math.abs(deltaY) * 1.25;
  if (!isHorizontalIntent || tabCount <= 0) {
    return currentIndex;
  }

  const direction = deltaX < 0 ? 1 : -1;
  return Math.max(0, Math.min(tabCount - 1, currentIndex + direction));
}

export function resolvePagerIndex(
  offsetX: number,
  pageWidth: number,
  tabCount: number,
) {
  if (pageWidth <= 0 || tabCount <= 0) {
    return -1;
  }
  return Math.max(0, Math.min(tabCount - 1, Math.round(offsetX / pageWidth)));
}
