module.exports = {
  root: true,
  extends: ['@react-native'],
  ignorePatterns: [
    'android/build/',
    'build/',
    'example/android/',
    'example/dist/',
    'example/ios/',
    'lib/',
    'node_modules/',
  ],
  overrides: [
    {
      files: ['scripts/**/*.mjs', 'tests/**/*.mjs'],
      env: { es2022: true, node: true },
      parser: require.resolve('espree'),
      parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
    },
    {
      files: ['**/*.mts'],
      parser: require.resolve('espree'),
      parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
    },
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': [
      'error',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
    ],
  },
};
