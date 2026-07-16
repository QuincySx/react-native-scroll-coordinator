import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import path from 'node:path';

const require = createRequire(import.meta.url);
const metroConfig = require('../example/metro.config.js');
const exampleNodeModules = path.resolve(
  import.meta.dirname,
  '../example/node_modules',
);

assert.equal(metroConfig.resolver.disableHierarchicalLookup, true);
assert.deepEqual(metroConfig.resolver.nodeModulesPaths, [exampleNodeModules]);
assert.equal(
  metroConfig.resolver.extraNodeModules.react,
  path.join(exampleNodeModules, 'react'),
);
assert.equal(
  metroConfig.resolver.extraNodeModules['react-native'],
  path.join(exampleNodeModules, 'react-native'),
);

console.log('Metro singleton dependency contract passed.');
