package com.scrollcoordinator;

import android.content.Context;
import android.graphics.Rect;
import android.view.Choreographer;
import android.view.MotionEvent;
import android.view.View;
import android.view.ViewConfiguration;
import android.view.ViewGroup;
import android.view.ViewParent;
import android.widget.FrameLayout;

import androidx.annotation.NonNull;
import androidx.coordinatorlayout.widget.CoordinatorLayout;

import com.google.android.material.appbar.AppBarLayout;

import java.util.ArrayList;
import java.util.List;

public final class CoordinatorView extends CoordinatorLayout {
  private final AppBarLayout appBarLayout;
  private final FrameLayout headerContainer;
  private final FrameLayout stickyContainer;
  private final FrameLayout contentContainer;
  private final List<View> coordinatorChildren = new ArrayList<>(3);
  private final List<CoordinatorHeaderView> coordinatorHeaders =
      new ArrayList<>();
  private final Rect drawingClipBounds = new Rect();
  private final int horizontalTouchSlop;
  private final Choreographer.FrameCallback layoutRefreshCallback =
      frameTimeNanos -> refreshLayoutForFabricParent();

  private int headerHeightPx;
  private int tabBarHeightPx;
  private int minimumHeaderHeightPx;
  private boolean snapEnabled;
  private boolean layoutRefreshPosted;
  private boolean refreshingLayout;
  private int activeHorizontalPointerId = -1;
  private float horizontalGestureInitialX;
  private float horizontalGestureInitialY;
  private CoordinatorHorizontalView activeHorizontalBoundary;
  private int currentCollapseOffsetPx;

  public CoordinatorView(@NonNull Context context) {
    super(context);

    horizontalTouchSlop =
        ViewConfiguration.get(context).getScaledTouchSlop();

    appBarLayout = new AppBarLayout(context);
    headerContainer = createSlotContainer(context);
    stickyContainer = createSlotContainer(context);
    contentContainer = createSlotContainer(context);

    appBarLayout.addView(
        headerContainer,
        new AppBarLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, 0));
    appBarLayout.addView(
        stickyContainer,
        new AppBarLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, 0));

    CoordinatorLayout.LayoutParams appBarParams =
        new CoordinatorLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.WRAP_CONTENT);
    super.addView(appBarLayout, appBarParams);

    CoordinatorLayout.LayoutParams contentParams =
        new CoordinatorLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.MATCH_PARENT);
    contentParams.setBehavior(new AppBarLayout.ScrollingViewBehavior());
    super.addView(contentContainer, contentParams);

    appBarLayout.addOnOffsetChangedListener(
        (layout, verticalOffset) -> {
          currentCollapseOffsetPx = Math.abs(verticalOffset);
          for (CoordinatorHeaderView header : coordinatorHeaders) {
            header.setCollapseOffsetPx(currentCollapseOffsetPx);
          }
        });

    updateAppBarConfiguration();
  }

  void registerCoordinatorHeader(@NonNull CoordinatorHeaderView header) {
    if (!coordinatorHeaders.contains(header)) {
      coordinatorHeaders.add(header);
    }
    header.setCollapseRangePx(getHeaderCollapseRangePx());
    header.setCollapseOffsetPx(currentCollapseOffsetPx);
  }

  void unregisterCoordinatorHeader(@NonNull CoordinatorHeaderView header) {
    coordinatorHeaders.remove(header);
  }

  @Override
  public boolean dispatchTouchEvent(MotionEvent event) {
    switch (event.getActionMasked()) {
      case MotionEvent.ACTION_DOWN:
        activeHorizontalPointerId = event.getPointerId(0);
        horizontalGestureInitialX = event.getX(0);
        horizontalGestureInitialY = event.getY(0);
        activeHorizontalBoundary =
            findHorizontalBoundaryAt(
                this,
                horizontalGestureInitialX,
                horizontalGestureInitialY);
        boolean handled = super.dispatchTouchEvent(event);
        if (activeHorizontalBoundary != null) {
          activeHorizontalBoundary.setAncestorInterceptionDisabled(true);
        }
        return handled;
      case MotionEvent.ACTION_MOVE:
        arbitrateHorizontalGesture(event);
        return super.dispatchTouchEvent(event);
      case MotionEvent.ACTION_POINTER_UP:
        updateActiveHorizontalPointer(event);
        return super.dispatchTouchEvent(event);
      case MotionEvent.ACTION_UP:
      case MotionEvent.ACTION_CANCEL:
        boolean finished = super.dispatchTouchEvent(event);
        releaseHorizontalBoundary();
        return finished;
      default:
        return super.dispatchTouchEvent(event);
    }
  }

  private void arbitrateHorizontalGesture(@NonNull MotionEvent event) {
    CoordinatorHorizontalView boundary = activeHorizontalBoundary;
    if (boundary == null) {
      return;
    }
    if (boundary.getParent() == null) {
      releaseHorizontalBoundary();
      return;
    }

    int pointerIndex = event.findPointerIndex(activeHorizontalPointerId);
    if (pointerIndex < 0) {
      releaseHorizontalBoundary();
      return;
    }
    float deltaX = event.getX(pointerIndex) - horizontalGestureInitialX;
    float deltaY = event.getY(pointerIndex) - horizontalGestureInitialY;
    if (Math.abs(deltaX) <= horizontalTouchSlop
        && Math.abs(deltaY) <= horizontalTouchSlop) {
      return;
    }

    if (Math.abs(deltaY) > Math.abs(deltaX)) {
      boundary.setAncestorInterceptionDisabled(false);
      return;
    }

    int direction = deltaX < 0 ? 1 : -1;
    boundary.setAncestorInterceptionDisabled(
        boundary.canScrollInDirection(direction));
  }

  private void updateActiveHorizontalPointer(@NonNull MotionEvent event) {
    int liftedIndex = event.getActionIndex();
    if (event.getPointerId(liftedIndex) != activeHorizontalPointerId) {
      return;
    }

    int replacementIndex = liftedIndex == 0 ? 1 : 0;
    if (replacementIndex >= event.getPointerCount()) {
      releaseHorizontalBoundary();
      return;
    }

    CoordinatorHorizontalView previousBoundary = activeHorizontalBoundary;
    float replacementX = event.getX(replacementIndex);
    float replacementY = event.getY(replacementIndex);
    CoordinatorHorizontalView replacementBoundary =
        findHorizontalBoundaryAt(this, replacementX, replacementY);
    if (previousBoundary != replacementBoundary) {
      releaseHorizontalBoundary();
      activeHorizontalBoundary = replacementBoundary;
      if (replacementBoundary != null) {
        replacementBoundary.setAncestorInterceptionDisabled(true);
      }
    }
    activeHorizontalPointerId = event.getPointerId(replacementIndex);
    horizontalGestureInitialX = replacementX;
    horizontalGestureInitialY = replacementY;
  }

  private void releaseHorizontalBoundary() {
    if (activeHorizontalBoundary != null
        && activeHorizontalBoundary.getParent() != null) {
      activeHorizontalBoundary.setAncestorInterceptionDisabled(false);
    } else {
      requestDisallowInterceptTouchEvent(false);
    }
    activeHorizontalBoundary = null;
    activeHorizontalPointerId = -1;
  }

  private static CoordinatorHorizontalView findHorizontalBoundaryAt(
      @NonNull View view, float x, float y) {
    if (view.getVisibility() != View.VISIBLE
        || x < 0
        || y < 0
        || x >= view.getWidth()
        || y >= view.getHeight()) {
      return null;
    }
    if (view instanceof CoordinatorHorizontalView) {
      return (CoordinatorHorizontalView) view;
    }
    if (!(view instanceof ViewGroup)) {
      return null;
    }

    ViewGroup group = (ViewGroup) view;
    for (int index = group.getChildCount() - 1; index >= 0; index -= 1) {
      View child = group.getChildAt(index);
      float childX =
          x + group.getScrollX() - child.getLeft() - child.getTranslationX();
      float childY =
          y + group.getScrollY() - child.getTop() - child.getTranslationY();
      CoordinatorHorizontalView boundary =
          findHorizontalBoundaryAt(child, childX, childY);
      if (boundary != null) {
        return boundary;
      }
    }
    return null;
  }

  private static FrameLayout createSlotContainer(@NonNull Context context) {
    FrameLayout container = new FrameLayout(context);
    container.setClipChildren(false);
    container.setClipToPadding(false);
    return container;
  }

  private void updateDrawingClipBounds() {
    drawingClipBounds.set(0, 0, getWidth(), getHeight());
    setClipBounds(drawingClipBounds);
  }

  public void addCoordinatorChild(@NonNull View child, int index) {
    CoordinatorChildRole.fromIndex(index);
    coordinatorChildren.add(index, child);
    syncCoordinatorChildren();
  }

  public void removeCoordinatorChild(@NonNull View child) {
    coordinatorChildren.remove(child);
    syncCoordinatorChildren();
  }

  public void removeCoordinatorChildAt(int index) {
    coordinatorChildren.remove(index);
    syncCoordinatorChildren();
  }

  public void removeAllCoordinatorChildren() {
    coordinatorChildren.clear();
    syncCoordinatorChildren();
  }

  public int getCoordinatorChildCount() {
    return coordinatorChildren.size();
  }

  public View getCoordinatorChildAt(int index) {
    return coordinatorChildren.get(index);
  }

  public void setHeaderHeightPx(int value) {
    headerHeightPx = Math.max(0, value);
    updateAppBarConfiguration();
  }

  public void setTabBarHeightPx(int value) {
    tabBarHeightPx = Math.max(0, value);
    updateAppBarConfiguration();
  }

  public void setMinimumHeaderHeightPx(int value) {
    minimumHeaderHeightPx = Math.max(0, value);
    updateAppBarConfiguration();
  }

  public void setSnapEnabled(boolean value) {
    snapEnabled = value;
    updateAppBarConfiguration();
  }

  private void syncCoordinatorChildren() {
    headerContainer.removeAllViews();
    stickyContainer.removeAllViews();
    contentContainer.removeAllViews();

    if (!coordinatorChildren.isEmpty()) {
      addSlotChild(headerContainer, coordinatorChildren.get(0));
    }
    if (coordinatorChildren.size() > 1) {
      addSlotChild(stickyContainer, coordinatorChildren.get(1));
    }
    if (coordinatorChildren.size() > 2) {
      addSlotChild(contentContainer, coordinatorChildren.get(2));
    }
    scheduleLayoutRefresh();
  }

  private static void addSlotChild(
      @NonNull FrameLayout container, @NonNull View child) {
    ViewParent parent = child.getParent();
    if (parent instanceof ViewGroup) {
      ((ViewGroup) parent).removeView(child);
    }
    container.addView(
        child,
        new FrameLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.MATCH_PARENT));
  }

  private void updateAppBarConfiguration() {
    int retainedHeaderHeight =
        Math.min(headerHeightPx, minimumHeaderHeightPx);
    headerContainer.setMinimumHeight(retainedHeaderHeight);

    AppBarLayout.LayoutParams headerParams =
        (AppBarLayout.LayoutParams) headerContainer.getLayoutParams();
    headerParams.height = headerHeightPx;
    int flags =
        AppBarLayout.LayoutParams.SCROLL_FLAG_SCROLL
            | AppBarLayout.LayoutParams.SCROLL_FLAG_EXIT_UNTIL_COLLAPSED;
    if (snapEnabled) {
      flags |= AppBarLayout.LayoutParams.SCROLL_FLAG_SNAP;
    }
    headerParams.setScrollFlags(flags);
    headerContainer.setLayoutParams(headerParams);

    AppBarLayout.LayoutParams stickyParams =
        (AppBarLayout.LayoutParams) stickyContainer.getLayoutParams();
    stickyParams.height = tabBarHeightPx;
    stickyParams.setScrollFlags(0);
    stickyContainer.setLayoutParams(stickyParams);

    appBarLayout.requestLayout();
    contentContainer.requestLayout();
    for (CoordinatorHeaderView header : coordinatorHeaders) {
      header.setCollapseRangePx(getHeaderCollapseRangePx());
      header.setCollapseOffsetPx(currentCollapseOffsetPx);
    }
    scheduleLayoutRefresh();
  }

  private int getHeaderCollapseRangePx() {
    return Math.max(
        0, headerHeightPx - Math.min(headerHeightPx, minimumHeaderHeightPx));
  }

  private void scheduleLayoutRefresh() {
    if (layoutRefreshPosted || getWidth() == 0 || getHeight() == 0) {
      return;
    }
    layoutRefreshPosted = true;
    Choreographer.getInstance().postFrameCallback(layoutRefreshCallback);
  }

  private void refreshLayoutForFabricParent() {
    layoutRefreshPosted = false;
    if (refreshingLayout || getWidth() == 0 || getHeight() == 0) {
      return;
    }

    refreshingLayout = true;
    try {
      int width = getWidth();
      int height = getHeight();
      measure(
          MeasureSpec.makeMeasureSpec(width, MeasureSpec.EXACTLY),
          MeasureSpec.makeMeasureSpec(height, MeasureSpec.EXACTLY));
      layout(getLeft(), getTop(), getRight(), getBottom());
    } finally {
      refreshingLayout = false;
    }
  }

  @Override
  protected void onLayout(
      boolean changed, int left, int top, int right, int bottom) {
    super.onLayout(changed, left, top, right, bottom);
    updateDrawingClipBounds();
  }

  @Override
  public void onDetachedFromWindow() {
    if (layoutRefreshPosted) {
      Choreographer.getInstance().removeFrameCallback(layoutRefreshCallback);
      layoutRefreshPosted = false;
    }
    super.onDetachedFromWindow();
  }
}
