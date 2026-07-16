const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const workspaceRoot = path.resolve(__dirname, '..');
const exampleNodeModules = path.resolve(__dirname, 'node_modules');
const config = {
  watchFolders: [workspaceRoot],
  resolver: {
    // The portal package is inside the workspace and has its own dev dependencies.
    // Resolve all runtime packages from the example to keep React a singleton.
    disableHierarchicalLookup: true,
    nodeModulesPaths: [exampleNodeModules],
    extraNodeModules: {
      react: path.join(exampleNodeModules, 'react'),
      'react-native': path.join(exampleNodeModules, 'react-native'),
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
