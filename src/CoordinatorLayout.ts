export function getCoordinatorLayout(
  measuredHeaderHeight: number,
  measuredTabBarHeight: number,
  minimumHeaderHeight: number,
) {
  const headerHeight = Math.max(0, measuredHeaderHeight);
  const tabBarHeight = Math.max(0, measuredTabBarHeight);
  const retainedHeaderHeight = Math.min(
    headerHeight,
    Math.max(0, minimumHeaderHeight),
  );

  return {
    contentTop: retainedHeaderHeight + tabBarHeight,
    tabBarTop: headerHeight,
  };
}
