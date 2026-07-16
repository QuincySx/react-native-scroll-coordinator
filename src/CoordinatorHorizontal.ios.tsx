import type { CoordinatorHorizontalProps } from './CoordinatorHorizontal.types';
import NativeCoordinatorHorizontal from './CoordinatorHorizontalNativeComponent';

export function CoordinatorHorizontal(props: CoordinatorHorizontalProps) {
  return <NativeCoordinatorHorizontal {...props} />;
}
