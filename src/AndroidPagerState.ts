export type AndroidPagerScrollState = 'idle' | 'dragging' | 'settling';

export type AndroidPagerSnapshot = {
  authoritativeIndex: number;
  nativeIndex: number;
  pendingCommandIndex: number | null;
  scrollState: AndroidPagerScrollState;
};

export function resolveAndroidPagerCommand({
  authoritativeIndex,
  nativeIndex,
  pendingCommandIndex,
  scrollState,
}: AndroidPagerSnapshot): number | null {
  if (
    authoritativeIndex < 0 ||
    scrollState !== 'idle' ||
    nativeIndex === authoritativeIndex ||
    pendingCommandIndex === authoritativeIndex
  ) {
    return null;
  }

  return authoritativeIndex;
}
