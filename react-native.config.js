module.exports = {
  dependency: {
    platforms: {
      ios: {},
      android: {
        componentDescriptors: ['RNCoordinatorComponentDescriptor'],
        packageImportPath: 'import com.scrollcoordinator.CoordinatorPackage;',
        packageInstance: 'new CoordinatorPackage()',
      },
    },
  },
};
