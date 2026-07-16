const React = require('react');
const { View } = require('react-native');

const mockPagerCommands = {
  setPage: jest.fn(),
  setPageWithoutAnimation: jest.fn(),
};
let mockPagerProps = null;

const MockPagerView = React.forwardRef((props, ref) => {
  React.useImperativeHandle(ref, () => mockPagerCommands);
  mockPagerProps = props;
  return React.createElement(View, { testID: 'pager-view' });
});

function getMockPagerProps() {
  return mockPagerProps;
}

function resetMockPager() {
  mockPagerCommands.setPage.mockReset();
  mockPagerCommands.setPageWithoutAnimation.mockReset();
  mockPagerProps = null;
}

module.exports = {
  __esModule: true,
  default: MockPagerView,
  getMockPagerProps,
  mockPagerCommands,
  resetMockPager,
};
