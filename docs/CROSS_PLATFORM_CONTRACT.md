# Cross-platform contract

The package uses one product-level configuration and different platform scroll
engines. Sharing the contract does not mean forcing every platform to use the
same native hierarchy.

## Target configuration

```ts
type CoordinatorTab<TabKey extends string> = {
  key: TabKey;
  label: ReactNode;
  render: () => ReactElement;
};

type CoordinatorTabsProps<TabKey extends string> = {
  tabs: readonly CoordinatorTab<TabKey>[];
  renderHeader: () => ReactNode;
  renderTabBar: (state: {
    activeIndex: number;
    activeKey: TabKey;
    selectTab: (key: TabKey) => void;
    tabs: readonly CoordinatorTab<TabKey>[];
  }) => ReactNode;
  activeTabKey?: TabKey;
  initialTabKey?: TabKey;
  onTabChange?: (event: {
    index: number;
    previousIndex: number;
    key: TabKey;
    previousKey: TabKey;
  }) => void;
  headerHeight?: number;
  minimumHeaderHeight?: number;
  allowHeaderOverscroll?: boolean;
  snapEnabled?: boolean;
  swipeEnabled?: boolean;
  lazy?: boolean;
};
```

This uses an explicit, typed tab configuration instead of implicit child
inspection. The package supports controlled and uncontrolled tab state without
remounting the pager or active list.

## Alpha capability matrix

| Capability                          | Android             | iOS                  | Web                            |
| ----------------------------------- | ------------------- | -------------------- | ------------------------------ |
| Sticky tabs and collapsible header  | Native evaluation   | Experimental adapter | Experimental list-owned layout |
| `minimumHeaderHeight`               | Supported           | Supported            | Not yet supported              |
| `headerHeight` hint                 | Supported           | Supported            | Not yet supported              |
| `allowHeaderOverscroll`             | Development warning | Supported            | Not yet supported              |
| `snapEnabled`                       | Supported           | Supported            | Not yet supported              |
| `lazy`                              | Supported           | Supported            | Supported                      |
| Two-layer header parallax           | Native UI thread    | Reanimated UI thread | Layout fallback only           |
| Expanded/collapsed header crossfade | Native UI thread    | Reanimated UI thread | Expanded-layout fallback       |
| Nested banner edge arbitration      | Native evaluation   | Native at drag start | Native CSS scroll chaining     |

Unsupported alpha options emit a development warning instead of being silently
discarded. They must be implemented or removed before a cross-platform `1.0`.

## Public adapter roles

- `CoordinatorTabs` composes the collapsible header, sticky tabs, pager, and
  coordinated pages.
- `CoordinatorHeader` composes independent `Background`, `Expanded`, and
  optional `Collapsed` roles. `CoordinatorHeader.Container` is a compatibility
  alias. `Background` may move at a normalized
  `parallaxRate`; `Expanded` defines the open geometry; `Collapsed` defines the
  retained geometry and cross-fades over the configured transition range.
  Omitting `Collapsed` retains zero Header height. Both content layouts remain
  mounted throughout a transition.
- `CoordinatorFlatList`, `CoordinatorFlashList`, and `CoordinatorScrollView`
  are ready-made coordinated scroll hosts.
- `CoordinatorHorizontal` marks a nested horizontal region that keeps a drag
  while its descendant can scroll, then releases it to the outer pager at the
  descendant's directional edge.
- `CoordinatorVirtualList` supplies the platform-specific physical scroll host
  to a custom virtual-list engine. The engine still owns windowing and
  recycling, but must not create a second same-axis scroll owner.

## Behavioral invariants

- A single upward drag or fling can cross the header-collapse boundary and
  continue in the active list.
- A downward gesture expands the header before it overscrolls or refreshes the
  active list.
- The tab bar remains clickable and sticky throughout header movement.
- Horizontal page gestures do not trigger vertical collapse.
- A horizontal child scroller wins only after horizontal intent is established,
  and releases the drag to the outer pager at its directional edge.
- Switching tabs preserves each page's vertical position and reconciles it with
  the current header collapse.
- Header height changes do not remount pages or reset their offsets.
- Tab presses and pager gestures emit the same `onTabChange` event.
- Pull-to-refresh belongs to the active page and starts only at the fully
  expanded vertical boundary.

## Platform engines

### Android

- `CoordinatorLayout + AppBarLayout + ScrollingViewBehavior` owns header
  collapse and sticky placement.
- `ViewPager2`/`react-native-pager-view` owns horizontal paging.
- `CoordinatorFlatList` replaces the RN fling path with a
  `TYPE_NON_TOUCH` nested-scroll sequence, because RN 0.81's custom
  `ReactScrollView.fling()` does not dispatch per-frame nested pre-scroll.
- No per-frame values cross the JS/native boundary.
- `CoordinatorFlashList` uses FlashList's `renderScrollComponent` hook, so
  recycling does not replace or bypass the nested-scroll implementation.
- `CoordinatorHorizontal` marks the competing native region. The root
  `CoordinatorView`, which is the common ancestor of the banner and pager,
  performs hit testing and axis locking before dispatching each move. It then
  queries whether the marked descendant can continue in the drag direction
  and gives that first eligible move to either the child or `ViewPager2`.
  Per-frame positions never cross into JavaScript.
- Custom engines integrate through `CoordinatorVirtualList` and must expose an
  equivalent physical-scroll-component injection point.

### iOS

- The adapter uses `react-native-collapsible-tab-view` with its
  UI-thread/Reanimated engine.
- Each page must use that engine's registered list components so the active
  `UIScrollView` offset and shared header translation remain synchronized.
- The public tab configuration stays identical to Android; only the adapter
  maps pages into `Tabs.Container` and `Tabs.Tab`.
- `CoordinatorFlatList` and `CoordinatorFlashList` map to the library's
  registered list components instead of plain uncoordinated lists.
- `CoordinatorVirtualList` supplies the registered iOS scroll host to custom
  engines so the active `UIScrollView` remains part of the collapse protocol.
- `CoordinatorHorizontal` installs a native direction gate between its child
  `UIScrollView` and the ancestor pager. The child wins when it can scroll in
  the initial drag direction; the pager wins when that drag starts at the
  child's directional edge. UIKit does not support transferring the same
  already-recognized pan at a later frame, so same-finger mid-drag handoff is an
  explicit platform difference.

### Web

- Each tab's virtualized list is its page's only DOM vertical scroll owner.
- The adapter injects the shared header and CSS-sticky tab bar into that list;
  it never wraps the list in a second same-axis scroll container.
- The outer pager is a browser-native horizontal scroll-snap container.
  Nested horizontal scrollers use the browser's directional scroll chaining;
  no React state update drives per-frame movement. Visited pages stay mounted
  so their list offsets survive tab changes.
- Both FlatList and FlashList adapters preserve virtualization; rendering every
  row is not used as a fallback.
- Custom virtual engines receive the Web scroll host from
  `CoordinatorVirtualList`, preserving the single DOM vertical scroll owner.

## Delivery status

1. Android continuous drag/fling and refresh boundary: implemented and tested.
2. Shared typed tab configuration and state-machine tests: implemented.
3. Android nested-banner arbitration: implemented in the root native
   coordinator with edge, detachment, and active-pointer unit coverage; final
   device acceptance is pending.
4. iOS collapsible-tab adapter and native drag-start banner arbitration:
   implemented and Simulator-compiled; real-device acceptance is pending.
5. Web list-owned scrolling and native scroll-snap pager: implemented and
   production-built; retained minimum-header behavior and browser gesture
   acceptance are pending.
6. Tarball ESM/CommonJS exports and optional FlashList subpath: consumer install
   verified.
7. Cross-platform real-device gesture and performance baselines: required
   before `1.0`.
