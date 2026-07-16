import {
  type HostComponent,
  type ViewProps,
  codegenNativeComponent,
} from 'react-native';
import type {
  Double,
  WithDefault,
} from 'react-native/Libraries/Types/CodegenTypes';

export interface NativeProps extends ViewProps {
  headerHeight?: Double;
  minimumHeaderHeight?: Double;
  snapEnabled?: WithDefault<boolean, false>;
  tabBarHeight?: Double;
}

export default codegenNativeComponent<NativeProps>('RNCoordinator', {
  excludedPlatforms: ['iOS'],
}) as HostComponent<NativeProps>;
