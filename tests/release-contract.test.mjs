import assert from 'node:assert/strict';
import { access, readdir, readFile } from 'node:fs/promises';
import test from 'node:test';

const packageRoot = new URL('../', import.meta.url);
const readText = (path) => readFile(new URL(path, packageRoot), 'utf8');

test('platform horizontal adapters resolve through explicit platform implementations', async () => {
  const [iosAdapter, webAdapter, sharedAdapter, nativeComponent] =
    await Promise.all([
      readText('src/CoordinatorHorizontal.ios.tsx'),
      readText('src/CoordinatorHorizontal.web.tsx'),
      readText('src/CoordinatorHorizontal.shared.tsx'),
      readText('src/CoordinatorHorizontalNativeComponent.ts'),
    ]);

  assert.match(iosAdapter, /CoordinatorHorizontalNativeComponent/);
  assert.match(webAdapter, /CoordinatorHorizontal\.shared/);
  assert.match(sharedAdapter, /function CoordinatorHorizontal/);
  assert.match(nativeComponent, /RNCoordinatorHorizontal/);
});

async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const url = new URL(entry.name, directory);
      return entry.isDirectory()
        ? listFiles(new URL(`${entry.name}/`, directory))
        : [url];
    }),
  );
  return files.flat();
}

test('compiled module graph contains only resolvable JavaScript files', async () => {
  const moduleDirectory = new URL('../lib/module/', import.meta.url);
  const files = await listFiles(moduleDirectory);
  const preservedTypeScript = files.filter((file) =>
    file.pathname.endsWith('.ts'),
  );
  assert.deepEqual(
    preservedTypeScript.map((file) => file.pathname.split('/').at(-1)),
    [
      'CoordinatorHeaderNativeComponent.ts',
      'CoordinatorHorizontalNativeComponent.ts',
      'CoordinatorNativeComponent.ts',
    ],
    'only Codegen specs may remain as TypeScript in module output',
  );

  const packageJson = JSON.parse(await readText('package.json'));
  assert.equal(
    packageJson.exports['.'].import.default,
    './lib/module/index.web.js',
  );
  await access(new URL(packageJson.exports['.'].import.default, packageRoot));

  for (const file of files.filter((entry) =>
    entry.pathname.endsWith('.web.js'),
  )) {
    const source = await readFile(file, 'utf8');
    const relativeSpecifiers = source.matchAll(
      /(?:from\s*|import\s*)["'](\.[^"']+)["']/g,
    );
    for (const [, specifier] of relativeSpecifiers) {
      await assert.doesNotReject(
        access(new URL(specifier, file)),
        `${file.pathname} references missing ${specifier}`,
      );
    }
  }
});

test('package exports separate ESM and CommonJS consumers', async () => {
  const packageJson = JSON.parse(await readText('package.json'));

  assert.equal(packageJson.main, './lib/commonjs/index.web.js');
  assert.equal(packageJson.module, './lib/module/index.web.js');
  assert.deepEqual(packageJson.exports['.'].import, {
    types: './lib/typescript/module/index.d.ts',
    default: './lib/module/index.web.js',
  });
  assert.deepEqual(packageJson.exports['.'].require, {
    types: './lib/typescript/commonjs/index.d.ts',
    default: './lib/commonjs/index.web.js',
  });
  assert.equal(
    packageJson.exports['./flash-list'].require.default,
    './lib/commonjs/flash-list.web.js',
  );
  await Promise.all([
    access(new URL(packageJson.main, packageRoot)),
    access(
      new URL(packageJson.exports['./flash-list'].require.default, packageRoot),
    ),
  ]);

  const metroShim = await readText('flash-list.js');
  assert.match(metroShim, /lib\/commonjs\/flash-list\.web\.js/);
});

test('FlashList integration is isolated behind an optional subpath', async () => {
  const packageJson = JSON.parse(await readText('package.json'));
  const publicEntry = await readText('src/index.ts');
  const flashListEntry = await readText('src/flash-list.ts');

  assert.doesNotMatch(publicEntry, /CoordinatorFlashList/);
  assert.match(flashListEntry, /CoordinatorFlashList/);
  assert.equal(
    packageJson.peerDependenciesMeta['@shopify/flash-list'].optional,
    true,
  );
});

test('Android lint treats actionable warnings as release failures', async () => {
  const androidBuild = await readText('android/build.gradle');

  assert.match(androidBuild, /warningsAsErrors true/);
  assert.match(androidBuild, /disable 'NewerVersionAvailable'/);
});

test('alpha package declares bounded compatibility and release governance', async () => {
  const packageJson = JSON.parse(await readText('package.json'));

  assert.match(packageJson.version, /-alpha\./);
  assert.equal(packageJson.engines.node, '>=20');
  assert.equal(packageJson.publishConfig.access, 'public');
  assert.equal(packageJson.peerDependencies['react-native'], '>=0.81 <0.82');
  assert.ok(packageJson.scripts.check);
  assert.ok(packageJson.scripts.lint);
  assert.ok(packageJson.scripts['format:check']);
  assert.ok(packageJson.scripts.prepublishOnly);

  await Promise.all(
    [
      'CHANGELOG.md',
      'CODE_OF_CONDUCT.md',
      'CONTRIBUTING.md',
      'SECURITY.md',
      'docs/COMPATIBILITY.md',
      'docs/PERFORMANCE.md',
      '.github/workflows/ci.yml',
      '.github/workflows/release.yml',
      'scripts/verify-publish.mjs',
    ].map((path) => access(new URL(path, packageRoot))),
  );
});

test('example documents every interaction-lab scenario', async () => {
  const exampleReadme = await readFile(
    new URL('../example/README.md', import.meta.url),
    'utf8',
  );
  for (const label of [
    'FlashList',
    'FlatList',
    'ScrollView',
    'VirtualizedList',
    '12-tab',
    'Controlled tabs',
    '20k slow-loading',
  ]) {
    assert.match(exampleReadme, new RegExp(label));
  }
});
