module.exports = {
  moduleNameMapper: {
    '^react$': '<rootDir>/node_modules/react',
    '^react/(.*)$': '<rootDir>/node_modules/react/$1',
    '^react-native$': '<rootDir>/node_modules/react-native',
    '^react-native-pager-view$':
      '<rootDir>/__mocks__/react-native-pager-view.js',
  },
  preset: 'react-native',
};
