const DEFAULT_PARALLAX_RATE = 0.5;
const DEFAULT_TRANSITION_START = 0.55;
const DEFAULT_TRANSITION_END = 0.85;

function clampUnit(value: number) {
  return Math.max(0, Math.min(1, value));
}

export function normalizeParallaxRate(value?: number) {
  if (value == null || !Number.isFinite(value)) {
    return DEFAULT_PARALLAX_RATE;
  }
  return clampUnit(value);
}

export function normalizeHeaderTransition(start?: number, end?: number) {
  const normalizedStart =
    start == null || !Number.isFinite(start)
      ? DEFAULT_TRANSITION_START
      : clampUnit(start);
  const normalizedEnd =
    end == null || !Number.isFinite(end)
      ? DEFAULT_TRANSITION_END
      : clampUnit(end);

  if (normalizedEnd <= normalizedStart) {
    return {
      end: DEFAULT_TRANSITION_END,
      start: DEFAULT_TRANSITION_START,
    };
  }
  return { end: normalizedEnd, start: normalizedStart };
}

export function getHeaderTransitionProgress(
  collapseProgress: number,
  start: number,
  end: number,
) {
  return clampUnit((collapseProgress - start) / (end - start));
}

export function resolveHeaderRetainedHeight(
  hasCollapsedLayout: boolean,
  configuredHeight?: number,
  measuredHeight?: number,
) {
  if (!hasCollapsedLayout) {
    return 0;
  }
  const value =
    configuredHeight != null && Number.isFinite(configuredHeight)
      ? configuredHeight
      : measuredHeight;
  return value == null || !Number.isFinite(value) ? 0 : Math.max(0, value);
}

export function normalizeHeaderHeight(value?: number) {
  return value == null || !Number.isFinite(value)
    ? undefined
    : Math.max(0, value);
}
