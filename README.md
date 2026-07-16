# react-native-scroll-coordinator

Cross-platform React Native scroll coordination primitives for a collapsible
header, sticky tab bar, horizontal pager, and one virtualized vertical list per
page. The API is not tied to a home screen: business code uses one typed
configuration while each platform keeps its appropriate scroll engine.

> `0.1.0-alpha.0` is intended for production evaluation, not an unconditional
> `1.0` compatibility promise. Android owns the complete native coordination
> path. iOS and Web adapters remain experimental while their real-device
> acceptance matrices are completed; see
> [`docs/COMPATIBILITY.md`](docs/COMPATIBILITY.md).

## Architecture

The Android hierarchy uses the Material Components contract directly:

```text
CoordinatorLayout
├── AppBarLayout
│   ├── header: SCROLL | EXIT_UNTIL_COLLAPSED | optional SNAP
│   └── tab bar: sticky, no scroll flags
└── content: AppBarLayout.ScrollingViewBehavior
    └── PagerView
        └── FlatList / ScrollView per page
```

JavaScript reports header and tab-bar heights only when React Native layout
changes. Android owns nested scrolling, fling continuation, collapse limits,
sticky placement, and snap on the UI thread. No per-frame scroll values cross
the JS/native boundary.

## Installation

```sh
yarn add react-native-scroll-coordinator \
  react-native-pager-view react-native-collapsible-tab-view \
  react-native-reanimated
```

The alpha is verified against React Native 0.81 with the New Architecture and
Hermes enabled. Android autolinking registers the Fabric component descriptor
and native view managers. Later React Native versions are intentionally outside
the peer range until the compatibility CI and device suite pass.

FlashList is optional. Install it only when using the adapter subpath:

```sh
yarn add @shopify/flash-list
```

For local workspace development, add it as a portal dependency pointing to:

```text
../react-native-scroll-coordinator
```

## Cross-platform usage

```tsx
import { CoordinatorTabs } from 'react-native-scroll-coordinator';

<CoordinatorTabs
  tabs={[
    { key: 'wallet', label: 'Wallet', render: () => <WalletPage /> },
    { key: 'history', label: 'History', render: () => <HistoryPage /> },
  ]}
  renderHeader={() => <Header />}
  renderTabBar={({ activeKey, selectTab, tabs }) => (
    <TabBar activeKey={activeKey} onSelect={selectTab} tabs={tabs} />
  )}
  minimumHeaderHeight={72}
  snapEnabled
/>;
```

Tab keys must be unique and stable. Selection is reconciled by key when tabs
are reordered; removing the active uncontrolled tab falls back to the first
remaining tab. An unknown controlled key and duplicate keys throw explicit
configuration errors.

`CoordinatorHeader` uses role-based slots so geometry, content transitions, and
background effects can be combined independently:

```tsx
import {
  CoordinatorHeader,
  CoordinatorTabs,
} from 'react-native-scroll-coordinator';

<CoordinatorTabs
  renderHeader={() => (
    <CoordinatorHeader transitionEnd={0.85} transitionStart={0.55}>
      <CoordinatorHeader.Background parallaxRate={0.5}>
        <HeaderImage />
      </CoordinatorHeader.Background>
      <CoordinatorHeader.Expanded height={240}>
        <HeaderContent />
      </CoordinatorHeader.Expanded>
      <CoordinatorHeader.Collapsed height={64}>
        <CompactHeaderContent />
      </CoordinatorHeader.Collapsed>
    </CoordinatorHeader>
  )}
  // ...
/>;
```

`Expanded` determines the open height. When `Collapsed` exists, its explicit or
measured height automatically becomes the retained height; it does not need to
be repeated on `CoordinatorTabs`. Omitting `Collapsed` makes the Header hide
completely while the TabBar remains sticky. Heights are optional when the slot
content has an intrinsic layout, and explicit values avoid a first-layout
measurement update.

`Background` does not participate in geometry. Its `parallaxRate` is clamped to
`0...1` and defaults to `0.5`. Android applies parallax and cross-fade from the
native AppBar offset; iOS uses the collapsible-header SharedValue on the UI
thread. Neither path sends per-frame offsets through JavaScript. Web currently
keeps the expanded layout with standard header movement.

The previous flat `background`, `children`, and `collapsed` props remain
available for compatibility, and `CoordinatorHeader.Container` remains an alias
for `CoordinatorHeader`. The root compound-component syntax above is
recommended.

Use `CoordinatorFlatList` for the built-in virtualized list. For heavier
cards, use the FlashList adapter:

```tsx
import { CoordinatorFlashList } from 'react-native-scroll-coordinator/flash-list';

<CoordinatorFlashList
  data={items}
  keyExtractor={(item) => item.id}
  renderItem={renderItem}
/>;
```

On Android the adapter supplies `CoordinatorScrollView` through
FlashList's `renderScrollComponent`; FlashList still owns recycling and item
layout. On iOS it maps to `Tabs.FlashList`. On Web it injects the header and
sticky tab bar into the virtualized list, so the list remains the only vertical
scroll owner. Do not wrap any of these lists in another same-axis `ScrollView`.

For a custom virtual-list engine, use the generic adapter and make its physical
scroll host the supplied `renderScrollComponent`:

```tsx
import { CoordinatorVirtualList } from 'react-native-scroll-coordinator';

<CoordinatorVirtualList>
  {({ renderScrollComponent }) => (
    <CustomVirtualList
      data={items}
      renderItem={renderItem}
      renderScrollComponent={renderScrollComponent}
    />
  )}
</CoordinatorVirtualList>;
```

The custom engine may own windowing, recycling, measurement, and item reuse,
but it must use the supplied component as its only vertical scroll owner and
forward the normal scroll ref, events, content size, and refresh props. This is
the same integration seam used by the FlashList adapter; FlashList itself is
not required.

Wrap a nested horizontal scroller, such as a banner carousel, with
`CoordinatorHorizontal`. The child consumes horizontal drags while it can
scroll in that direction. At its first or last item, the drag is released to
the outer tab pager. Vertical intent is released immediately to the page's
vertical coordinator. On Android, `CoordinatorHorizontal` is only a native
region marker: the root native coordinator performs hit testing, axis locking,
directional edge queries, and pager arbitration on the UI thread before the
event reaches `ViewPager2`. JavaScript receives no per-frame scroll or gesture
events for this protocol.

```tsx
import { CoordinatorHorizontal } from 'react-native-scroll-coordinator';
import { CoordinatorFlashList } from 'react-native-scroll-coordinator/flash-list';

<CoordinatorFlashList
  data={items}
  ListHeaderComponent={
    <CoordinatorHorizontal>
      <ScrollView horizontal nestedScrollEnabled>
        {banners.map(renderBanner)}
      </ScrollView>
    </CoordinatorHorizontal>
  }
/>;
```

Only horizontal regions that compete with the outer pager need this boundary;
ordinary buttons and vertical list items require no extra wrapper.

On iOS, `CoordinatorHorizontal` is a Fabric component that creates native
gesture-failure relationships between its descendant `UIScrollView` and the
ancestor pager. A drag that begins while the banner can continue stays with the
banner; a new drag that begins at its directional edge goes to the pager. UIKit
cannot transfer an already-recognized pan from the middle of a banner to the
third-party pager without replacing that pager, so uninterrupted same-finger
mid-gesture handoff is not claimed on iOS.

On Web, the outer tabs use a native CSS scroll-snap container instead of a
page-level `PanResponder`. Browser scroll chaining lets the nested banner keep
the gesture until its directional edge and then offer it to the outer pager.

The common Android/iOS/Web configuration and platform invariants are in
[`docs/CROSS_PLATFORM_CONTRACT.md`](docs/CROSS_PLATFORM_CONTRACT.md).

## Example

The runnable React Native app lives in `example`. It includes dynamic header
height, sticky tab presses, horizontal pager gestures, nested banners on the
Wallet and History pages, long virtualized lists, pull-to-refresh, and the
continuous-fling acceptance case.

Run it with `yarn workspace CoordinatorExample android`, `ios`, or `web`.

## Verification

```sh
yarn test
yarn typecheck
yarn build
yarn test:release
yarn test:tarball
yarn workspace CoordinatorExample build:web

# The standalone example owns the Gradle wrapper and autolinks this package:
./example/android/gradlew -p example/android \
  :react-native-scroll-coordinator:testDebugUnitTest \
  :app:assembleDebug
```

`yarn check` is the local release gate. Publishing also verifies the configured
`repository`, `homepage`, and `bugs` URLs before creating a package.
