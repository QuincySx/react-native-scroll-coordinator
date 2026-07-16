import {
  Component,
  createRef,
  type ElementRef,
  type ReactElement,
  cloneElement,
} from 'react';
import {
  StyleSheet,
  UIManager,
  View,
  findNodeHandle,
  requireNativeComponent,
  type LayoutChangeEvent,
  type StyleProp,
  type ScrollViewProps,
  type ViewStyle,
} from 'react-native';

const NATIVE_NAME = 'RNCoordinatorScrollView';

const NativeScrollView = requireNativeComponent<ScrollViewProps>(NATIVE_NAME);

type NativeScrollViewRef = ElementRef<typeof NativeScrollView>;

export type CoordinatorScrollViewHandle = {
  flashScrollIndicators: () => void;
  getScrollRef: () => NativeScrollViewRef | null;
  getScrollableNode: () => number | null;
  scrollTo: (options: { animated?: boolean; x?: number; y?: number }) => void;
  scrollToEnd: (options?: { animated?: boolean }) => void;
  setNativeProps: NativeScrollViewRef['setNativeProps'];
  measureLayout: NativeScrollViewRef['measureLayout'];
};

const styles = StyleSheet.create({
  content: {
    flexDirection: 'column',
  },
  scrollView: {
    flexGrow: 1,
    flexShrink: 1,
    overflow: 'scroll',
  },
});

export class CoordinatorScrollView extends Component<ScrollViewProps> {
  private readonly nativeRef = createRef<NativeScrollViewRef>();

  public scrollTo = ({
    animated = true,
    x = 0,
    y = 0,
  }: {
    animated?: boolean;
    x?: number;
    y?: number;
  }) => {
    this.dispatchCommand('scrollTo', [x, y, animated]);
  };

  public scrollToEnd = ({ animated = true } = {}) => {
    this.dispatchCommand('scrollToEnd', [animated]);
  };

  public flashScrollIndicators = () => {
    this.dispatchCommand('flashScrollIndicators', []);
  };

  public getScrollableNode = () => findNodeHandle(this.nativeRef.current);

  public getScrollRef = () => this.nativeRef.current;

  public setNativeProps: NativeScrollViewRef['setNativeProps'] = (props) => {
    this.nativeRef.current?.setNativeProps(props);
  };

  public measureLayout: NativeScrollViewRef['measureLayout'] = (
    relativeToNativeComponentRef,
    onSuccess,
    onFail,
  ) => {
    this.nativeRef.current?.measureLayout(
      relativeToNativeComponentRef,
      onSuccess,
      onFail,
    );
  };

  private dispatchCommand(
    commandName: 'flashScrollIndicators' | 'scrollTo' | 'scrollToEnd',
    args: (boolean | number)[],
  ) {
    const node = findNodeHandle(this.nativeRef.current);
    const command =
      UIManager.getViewManagerConfig(NATIVE_NAME)?.Commands?.[commandName];
    if (node != null && command != null) {
      UIManager.dispatchViewManagerCommand(node, command, args);
    }
  }

  private handleContentLayout = (event: LayoutChangeEvent) => {
    const { height, width } = event.nativeEvent.layout;
    this.props.onContentSizeChange?.(width, height);
  };

  public render() {
    const {
      children,
      contentContainerStyle,
      onContentSizeChange: _onContentSizeChange,
      refreshControl,
      style,
      ...nativeProps
    } = this.props;

    const nativeScrollView = (
      <NativeScrollView
        {...nativeProps}
        ref={this.nativeRef}
        nestedScrollEnabled
        style={[styles.scrollView, style]}
      >
        <View
          collapsable={false}
          onLayout={this.handleContentLayout}
          style={[styles.content, contentContainerStyle]}
        >
          {children}
        </View>
      </NativeScrollView>
    );

    if (refreshControl != null) {
      return cloneElement(
        refreshControl as ReactElement<{
          children?: ReactElement;
          style?: StyleProp<ViewStyle>;
        }>,
        { style: [styles.scrollView, style, refreshControl.props.style] },
        nativeScrollView,
      );
    }

    return nativeScrollView;
  }
}
