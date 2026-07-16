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
  parallaxRate?: WithDefault<Double, 0.5>;
  transitionEnd?: WithDefault<Double, 0.85>;
  transitionStart?: WithDefault<Double, 0.55>;
}

export default codegenNativeComponent<NativeProps>('RNCoordinatorHeader', {
  excludedPlatforms: ['iOS'],
}) as HostComponent<NativeProps>;
