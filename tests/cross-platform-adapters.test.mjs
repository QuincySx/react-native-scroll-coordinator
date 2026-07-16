import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const packageRoot = new URL('../', import.meta.url);
const readText = (path) => readFile(new URL(path, packageRoot), 'utf8');

const publicEntry = await readText('src/index.ts');
assert.match(publicEntry, /CoordinatorTabs/);
assert.doesNotMatch(publicEntry, /CoordinatorFlashList/);
assert.match(publicEntry, /CoordinatorVirtualList/);
assert.match(publicEntry, /CoordinatorHorizontal/);

const virtualList = await readText('src/CoordinatorVirtualList.tsx');
assert.match(virtualList, /CoordinatorScrollView/);
assert.match(virtualList, /renderScrollComponent/);

const androidHorizontal = await readText(
  'src/CoordinatorHorizontal.android.tsx',
);
assert.match(androidHorizontal, /CoordinatorHorizontalNativeComponent/);
const horizontalNativeComponent = await readText(
  'src/CoordinatorHorizontalNativeComponent.ts',
);
assert.match(horizontalNativeComponent, /RNCoordinatorHorizontal/);

const androidHeader = await readText('src/CoordinatorHeader.android.tsx');
assert.match(androidHeader, /CoordinatorHeaderNativeComponent/);
assert.match(androidHeader, /background/);
assert.match(androidHeader, /collapsed/);
assert.match(androidHeader, /Container: CoordinatorHeaderContainer/);
assert.match(androidHeader, /resolveCoordinatorHeaderSlots/);
const iosHeader = await readText('src/CoordinatorHeader.ios.tsx');
assert.match(iosHeader, /useHeaderMeasurements/);
assert.match(iosHeader, /useAnimatedStyle/);
assert.match(iosHeader, /useAnimatedReaction/);
assert.match(iosHeader, /collapsed/);
const webHeader = await readText('src/CoordinatorHeader.web.tsx');
assert.match(webHeader, /CoordinatorHeader\.shared/);
const sharedHeader = await readText('src/CoordinatorHeader.shared.tsx');
assert.match(sharedHeader, /background/);
assert.match(sharedHeader, /resolveCoordinatorHeaderSlots/);

const iosHorizontal = await readText('src/CoordinatorHorizontal.ios.tsx');
assert.match(iosHorizontal, /CoordinatorHorizontalNativeComponent/);
const iosHorizontalView = await readText(
  'ios/RNCoordinatorHorizontalComponentView.mm',
);
assert.match(iosHorizontalView, /requireGestureRecognizerToFail/);
assert.match(iosHorizontalView, /canChildScrollInVelocity/);
assert.match(iosHorizontalView, /shouldBeRecycled/);

const flashListEntry = await readText('src/flash-list.ts');
assert.match(flashListEntry, /CoordinatorFlashList/);

const androidTabs = await readText('src/CoordinatorTabs.android.tsx');
assert.match(androidTabs, /PagerView/);
assert.match(androidTabs, /Coordinator/);
assert.doesNotMatch(androidTabs, /lazy: _lazy/);
assert.match(androidTabs, /visited/);
assert.match(androidTabs, /onPageScrollStateChanged/);
assert.match(androidTabs, /resolveAndroidPagerCommand/);
assert.doesNotMatch(androidTabs, /setPageWithoutAnimation/);
assert.match(androidTabs, /CoordinatorHeaderProvider/);
assert.match(androidTabs, /automaticMinimumHeaderHeight/);

const iosTabs = await readText('src/CoordinatorTabs.ios.tsx');
assert.match(iosTabs, /react-native-collapsible-tab-view/);
assert.match(iosTabs, /CoordinatorHeaderProvider/);

const webTabs = await readText('src/CoordinatorTabs.web.tsx');
assert.match(webTabs, /CoordinatorWebPage/);
assert.match(webTabs, /pagingEnabled/);
assert.match(webTabs, /resolvePagerIndex/);
assert.match(webTabs, /scrollEndTimer/);
assert.match(webTabs, /pendingPagerIndex/);
assert.doesNotMatch(webTabs, /PanResponder/);

const androidFlashList = await readText('src/CoordinatorFlashList.android.tsx');
assert.match(androidFlashList, /CoordinatorScrollView/);
assert.match(androidFlashList, /renderScrollComponent/);
assert.match(androidFlashList, /maintainVisibleContentPosition/);
assert.match(androidFlashList, /disabled: true/);

const iosFlashList = await readText('src/CoordinatorFlashList.ios.tsx');
assert.match(iosFlashList, /Tabs\.FlashList/);

const webFlashList = await readText('src/CoordinatorFlashList.web.tsx');
assert.match(webFlashList, /FlashList/);

const exampleApp = await readText('example/App.tsx');
assert.match(exampleApp, /ScenarioGallery/);
const scenarioCatalog = await readText('example/src/scenarios/catalog.ts');
for (const id of [
  'flash-banner',
  'flatlist-nested',
  'scrollview-content',
  'virtual-adapter',
  'many-tabs',
  'custom-tab-actions',
  'slow-huge-list',
]) {
  assert.match(scenarioCatalog, new RegExp(id));
}
const scenarioRegistry = await readText('example/src/scenarios/index.tsx');
assert.match(scenarioRegistry, /CoordinatorTabs/);
assert.match(scenarioRegistry, /CoordinatorFlashList/);
assert.match(scenarioRegistry, /CoordinatorFlatList/);
assert.match(scenarioRegistry, /CoordinatorScrollView/);
assert.match(scenarioRegistry, /CoordinatorVirtualList/);
assert.match(scenarioRegistry, /CoordinatorHorizontal/);

const examplePackage = JSON.parse(await readText('example/package.json'));
assert.ok(examplePackage.scripts['build:web']);
const webEntry = await readText('example/index.web.tsx');
assert.match(webEntry, /createRoot/);
const viteConfig = await readText('example/vite.config.mts');
assert.match(viteConfig, /react-native-web/);

const packageJson = JSON.parse(await readText('package.json'));
assert.equal(packageJson.peerDependencies['@shopify/flash-list'], '>=2 <3');
assert.ok(packageJson.exports['./flash-list']);
assert.ok(packageJson.files.includes('flash-list.js'));
assert.ok(packageJson.files.includes('ios'));
assert.ok(
  packageJson.files.includes('react-native-scroll-coordinator.podspec'),
);
const metroFlashListShim = await readText('flash-list.js');
assert.match(metroFlashListShim, /lib\/commonjs\/flash-list\.web\.js/);

console.log('Cross-platform adapter contract passed.');
