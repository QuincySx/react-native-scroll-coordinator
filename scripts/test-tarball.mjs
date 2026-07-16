import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const packResult = JSON.parse(
  execFileSync('npm', ['pack', '--ignore-scripts', '--json'], {
    cwd: root,
    encoding: 'utf8',
  }),
)[0];
const tarball = path.join(root, packResult.filename);
const consumer = await mkdtemp(
  path.join(tmpdir(), 'scroll-coordinator-consumer-'),
);

try {
  await writeFile(
    path.join(consumer, 'package.json'),
    JSON.stringify({ name: 'consumer', private: true }),
  );
  execFileSync(
    'npm',
    [
      'install',
      '--ignore-scripts',
      '--legacy-peer-deps',
      '--no-audit',
      '--no-fund',
      '--package-lock=false',
      tarball,
    ],
    { cwd: consumer, stdio: 'pipe' },
  );

  const require = createRequire(path.join(consumer, 'package.json'));
  assert.match(
    require.resolve('react-native-scroll-coordinator'),
    /lib\/commonjs\/index\.web\.js$/,
  );
  assert.match(
    require.resolve('react-native-scroll-coordinator/flash-list'),
    /lib\/commonjs\/flash-list\.web\.js$/,
  );

  const installedManifest = JSON.parse(
    await readFile(
      require.resolve('react-native-scroll-coordinator/package.json'),
      'utf8',
    ),
  );
  assert.equal(installedManifest.version, '0.1.0-alpha.0');
  console.log('Packed consumer install contract passed.');
} finally {
  await Promise.all([
    rm(consumer, { force: true, recursive: true }),
    rm(tarball, { force: true }),
  ]);
}
