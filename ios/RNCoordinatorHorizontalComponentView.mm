#import "RNCoordinatorHorizontalComponentView.h"

#import <react/renderer/components/RNCoordinatorSpec/ComponentDescriptors.h>
#import <react/renderer/components/RNCoordinatorSpec/RCTComponentViewHelpers.h>

#import "RCTFabricComponentsPlugins.h"

using namespace facebook::react;

@interface RNCoordinatorHorizontalComponentView () <RCTRNCoordinatorHorizontalViewProtocol,
                                                       UIGestureRecognizerDelegate>
@end


@implementation RNCoordinatorHorizontalComponentView {
  UIPanGestureRecognizer *_directionGate;
  __weak UIScrollView *_childScrollView;
  __weak UIScrollView *_pagerScrollView;
}

+ (BOOL)shouldBeRecycled
{
  // Gesture failure relationships cannot be detached after UIKit installs them.
  return NO;
}

- (instancetype)initWithFrame:(CGRect)frame
{
  if (self = [super initWithFrame:frame]) {
    _directionGate = [[UIPanGestureRecognizer alloc] initWithTarget:self action:@selector(handleDirectionGate:)];
    _directionGate.cancelsTouchesInView = NO;
    _directionGate.delegate = self;
    [self addGestureRecognizer:_directionGate];
  }
  return self;
}

- (void)didMoveToWindow
{
  [super didMoveToWindow];
  [self configureGestureRelationships];
}

- (void)layoutSubviews
{
  [super layoutSubviews];
  [self configureGestureRelationships];
}

- (void)handleDirectionGate:(UIPanGestureRecognizer *)recognizer
{
  // Recognition state is the signal; movement remains owned by the UIScrollViews.
}

- (nullable UIScrollView *)horizontalScrollViewBelowView:(UIView *)view
{
  for (UIView *subview in view.subviews) {
    if ([subview isKindOfClass:UIScrollView.class]) {
      UIScrollView *scrollView = (UIScrollView *)subview;
      if (scrollView != _pagerScrollView &&
          (scrollView.alwaysBounceHorizontal ||
           scrollView.contentSize.width > scrollView.bounds.size.width + 0.5)) {
        return scrollView;
      }
    }
    UIScrollView *candidate = [self horizontalScrollViewBelowView:subview];
    if (candidate != nil) {
      return candidate;
    }
  }
  return nil;
}

- (nullable UIScrollView *)horizontalPagerAboveView:(UIView *)view
{
  UIView *ancestor = view.superview;
  while (ancestor != nil) {
    if ([ancestor isKindOfClass:UICollectionView.class]) {
      UICollectionView *collectionView = (UICollectionView *)ancestor;
      UICollectionViewLayout *layout = collectionView.collectionViewLayout;
      if (![layout isKindOfClass:UICollectionViewFlowLayout.class] ||
          ((UICollectionViewFlowLayout *)layout).scrollDirection == UICollectionViewScrollDirectionHorizontal) {
        return collectionView;
      }
    }
    ancestor = ancestor.superview;
  }
  return nil;
}

- (void)configureGestureRelationships
{
  if (self.window == nil) {
    _childScrollView = nil;
    _pagerScrollView = nil;
    return;
  }

  UIScrollView *child = [self horizontalScrollViewBelowView:self];
  UIScrollView *pager = [self horizontalPagerAboveView:self];
  if (child == nil || pager == nil || child == pager ||
      (child == _childScrollView && pager == _pagerScrollView)) {
    return;
  }

  _childScrollView = child;
  _pagerScrollView = pager;
  [pager.panGestureRecognizer requireGestureRecognizerToFail:_directionGate];
  [child.panGestureRecognizer requireGestureRecognizerToFail:pager.panGestureRecognizer];
}

- (BOOL)canChildScrollInVelocity:(CGPoint)velocity
{
  UIScrollView *child = _childScrollView;
  if (child == nil || !child.scrollEnabled) {
    return NO;
  }

  CGFloat minimumOffset = -child.adjustedContentInset.left;
  CGFloat maximumOffset = MAX(
      minimumOffset,
      child.contentSize.width - child.bounds.size.width + child.adjustedContentInset.right);
  if (velocity.x < 0) {
    return child.contentOffset.x < maximumOffset - 0.5;
  }
  if (velocity.x > 0) {
    return child.contentOffset.x > minimumOffset + 0.5;
  }
  return NO;
}

- (BOOL)gestureRecognizerShouldBegin:(UIGestureRecognizer *)gestureRecognizer
{
  if (gestureRecognizer != _directionGate) {
    return YES;
  }
  [self configureGestureRelationships];
  CGPoint velocity = [_directionGate velocityInView:self];
  if (fabs(velocity.x) <= fabs(velocity.y)) {
    return NO;
  }
  return [self canChildScrollInVelocity:velocity];
}

- (BOOL)gestureRecognizer:(UIGestureRecognizer *)gestureRecognizer
    shouldRecognizeSimultaneouslyWithGestureRecognizer:(UIGestureRecognizer *)otherGestureRecognizer
{
  return gestureRecognizer == _directionGate &&
      otherGestureRecognizer == _childScrollView.panGestureRecognizer;
}

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
  return concreteComponentDescriptorProvider<RNCoordinatorHorizontalComponentDescriptor>();
}

@end


Class<RCTComponentViewProtocol> RNCoordinatorHorizontalCls(void)
{
  return RNCoordinatorHorizontalComponentView.class;
}
