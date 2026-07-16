import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const packageRoot = new URL('../', import.meta.url);
const readText = (path) => readFile(new URL(path, packageRoot), 'utf8');

const packageJson = JSON.parse(await readText('package.json'));

assert.equal(packageJson.name, 'react-native-scroll-coordinator');
assert.equal(packageJson.codegenConfig.name, 'RNCoordinatorSpec');
assert.equal(packageJson.codegenConfig.type, 'components');
assert.equal(
  packageJson.codegenConfig.android.javaPackageName,
  'com.scrollcoordinator',
);

const nativeSpec = await readText('src/CoordinatorNativeComponent.ts');
assert.match(nativeSpec, /codegenNativeComponent/);
assert.match(nativeSpec, /RNCoordinator/);

const publicEntry = await readText('src/index.ts');
assert.match(publicEntry, /CoordinatorFlatList/);
assert.match(publicEntry, /CoordinatorHeader/);
assert.match(publicEntry, /CoordinatorScrollView/);
assert.doesNotMatch(publicEntry, /CoordinatorFlashList/);
assert.doesNotMatch(publicEntry, /HomeCoordinator/);

const androidBuild = await readText('android/build.gradle');
assert.match(androidBuild, /com\.facebook\.react/);
assert.match(androidBuild, /com\.google\.android\.material:material/);
assert.doesNotMatch(androidBuild, /app-monorepo/);

const standaloneSettings = await readText('settings.gradle');
assert.doesNotMatch(standaloneSettings, /app-monorepo/);

const androidView = await readText(
  'android/src/main/java/com/scrollcoordinator/CoordinatorView.java',
);
assert.match(androidView, /extends CoordinatorLayout/);
assert.match(androidView, /AppBarLayout\.ScrollingViewBehavior/);

const androidHeaderManager = await readText(
  'android/src/main/java/com/scrollcoordinator/CoordinatorHeaderViewManager.java',
);
assert.match(androidHeaderManager, /RNCoordinatorHeader/);

const continuousManager = await readText(
  'android/src/main/java/com/scrollcoordinator/ContinuousReactScrollViewManager.java',
);
assert.match(continuousManager, /RNCoordinatorScrollView/);

const neutralBrandFiles = await Promise.all(
  [
    'package.json',
    'README.md',
    'LICENSE',
    'react-native.config.js',
    'android/build.gradle',
    'src/CoordinatorNativeComponent.ts',
    'src/CoordinatorScrollView.android.tsx',
    'example/App.tsx',
    'example/package.json',
  ].map(readText),
);
assert.doesNotMatch(neutralBrandFiles.join('\n'), /onekey|home.?coordinator/i);

const exampleApp = await readText('example/App.tsx');
assert.match(exampleApp, /ScenarioGallery/);
const scenarioRegistry = await readText('example/src/scenarios/index.tsx');
assert.match(scenarioRegistry, /CoordinatorFlashList/);
assert.match(scenarioRegistry, /CoordinatorTabs/);

const crossPlatformContract = await readText('docs/CROSS_PLATFORM_CONTRACT.md');
assert.match(crossPlatformContract, /Android/);
assert.match(crossPlatformContract, /iOS/);
assert.match(crossPlatformContract, /Web/);

console.log('Standalone package contract passed.');
