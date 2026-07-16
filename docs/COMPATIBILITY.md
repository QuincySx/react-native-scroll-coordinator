# Compatibility

## Alpha support matrix

| Target  | Verified baseline                              | Status       |
| ------- | ---------------------------------------------- | ------------ |
| Android | RN 0.81.5, New Architecture, Hermes, API 24–36 | Evaluation   |
| iOS     | RN 0.81.5 Simulator build                      | Experimental |
| Web     | React Native Web 0.21, Vite production build   | Experimental |

The npm peer range intentionally stops before RN 0.82 until CI and real-device
tests prove later versions. Expanding the range requires Android unit/lint/APK,
iOS build, Web production build, tarball consumer, and gesture acceptance runs.

Android owns per-frame header, vertical nested scroll, fling, and horizontal
edge arbitration on the UI thread. iOS performs drag-start edge arbitration in
UIKit, while Web uses browser-native scroll snap and scroll chaining. iOS does
not claim Android's uninterrupted same-finger handoff after a drag starts in
the middle of a banner. Web does not yet implement retained minimum-header or
header-snap behavior.

`CoordinatorHeader` parallax is native-offset driven on Android and
UI-thread/Reanimated driven on iOS. Web currently renders the same clipped
background/foreground structure with standard header movement; compositor-only
Web parallax remains pending.

Its optional expanded/collapsed layout cross-fade follows the same Android and
iOS UI-thread paths. Web keeps the expanded layout until retained minimum-header
behavior is implemented.

Required peers are React, React Native, react-native-pager-view,
react-native-collapsible-tab-view, and react-native-reanimated. FlashList 2 is
optional and is imported from `react-native-scroll-coordinator/flash-list`.
