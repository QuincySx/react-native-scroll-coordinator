module.exports = {
  root: true,
  extends: '@react-native',
  overrides: [
    {
      files: ['*.mts'],
      env: { es2022: true, node: true },
      parser: require.resolve('espree'),
      parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
    },
  ],
};
