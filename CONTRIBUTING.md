# Contributing

Contributions are welcome after an issue describes the behavior, affected
platforms, and acceptance criteria. Gesture or layout changes must include a
regression test before implementation.

## Development

Requirements: Node.js 20+, Yarn 4 through Corepack, JDK 21, Android SDK 36,
and Xcode with CocoaPods for iOS.

```sh
corepack yarn install --immutable
corepack yarn check
```

Android native verification:

```sh
./example/android/gradlew -p example/android \
  :react-native-scroll-coordinator:testDebugUnitTest \
  :react-native-scroll-coordinator:lintDebug \
  :app:assembleDebug
```

Keep JavaScript out of per-frame Android gesture and scroll arbitration. Add
platform-specific files when behavior differs, preserve precise TypeScript
types, and keep source comments in English.

Commits should be small and use `type: description`, for example
`fix: release pager gesture at banner edge`.
