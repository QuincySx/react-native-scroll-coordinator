# Coordinator interaction lab

The example app is a scenario gallery for validating nested scrolling behavior on
Android, iOS, and Web. The home screen mounts no coordinator or long list. Opening
one card mounts only that scenario, so unrelated feeds do not distort memory or
scroll-performance results.

## Scenarios

The gallery contains 17 isolated entries in three groups.

The first six use the same FlatList and fixed TabBar. They cover the complete
`parallax on/off × resting behavior` matrix:

1. plain movement + full hide;
2. parallax background + full hide;
3. plain movement + retain 64 dp of the original Header layout;
4. parallax background + retain 64 dp of the original Header layout;
5. plain movement + replace the expanded layout with a separate 64 dp layout;
6. parallax background + replace the expanded layout with a separate 64 dp
   layout.

Another four Header entries isolate APIs and boundary behavior: measured
replacement height, snap, a fully fixed Header, and a no-Header case. Pure
numeric variants such as retained height, replacement height, parallax rate, and
transition timing remain supported configuration and automated-test concerns;
they do not duplicate cards on the gallery home page.

The remaining seven isolate integration and stress behavior: FlashList with a
Header Banner, nested FlatList carousels, mixed ScrollView content, a custom
VirtualizedList adapter, 12 scrollable tabs, controlled tabs with actions, and a
20k slow-loading feed. These retain the searchable labels **12-tab** and
**Controlled tabs** used by the release contract.

Each scenario has a stable `testID`. Returning from a scenario restores the
gallery to its previous scroll offset while still unmounting the scenario itself.
Every Banner card and shared list row opens a real second-level
detail overlay; dismissing it keeps the underlying scenario mounted and preserves
its scroll position.

## Run

From the package root:

```sh
corepack yarn workspace CoordinatorExample start
corepack yarn workspace CoordinatorExample android
corepack yarn workspace CoordinatorExample ios
corepack yarn workspace CoordinatorExample web
```

Build the Web version without starting a server:

```sh
corepack yarn workspace CoordinatorExample build:web
```

Run the scenario navigation contract tests:

```sh
corepack yarn --cwd example test --runInBand __tests__/App.test.tsx
```

## Manual gesture pass

For each scenario, verify:

- one upward drag collapses the header and continues into the active page;
- all 10 Header scenarios share the same list and fixed TabBar;
- parallax scenarios visibly separate the `1.00x` foreground from the marked
  `0.35x` background grid;
- retained modes keep the exact advertised portion of the original layout;
- replacement modes stop at 64/72 dp according to explicit or measured
  compact-layout geometry;
- snap, fixed-Header, and no-Header boundary cases match their labels;
- reversing direction does not reset or jump the list;
- tab presses and page swipes select the same page;
- taps remain responsive during and after vertical scrolling;
- tapping every Banner card and list row opens its second-level detail page, and
  returning preserves the current scenario and scroll position;
- dragging horizontally from a Banner card or vertically from a row does not
  accidentally open its detail page;
- a nested Banner owns horizontal movement while it can scroll;
- at the Banner's directional edge, the outer pager receives the next supported
  handoff gesture for that platform;
- switching away and back restores the page's vertical position.
- the 20k scenario shows 30 loaded rows initially, exposes a visible loading state
  for 1.5 seconds, and remains scrollable and tappable while a batch is pending.

See `../docs/CROSS_PLATFORM_CONTRACT.md` for intentional platform differences.
