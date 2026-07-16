package com.scrollcoordinator;

import android.annotation.SuppressLint;
import android.content.Context;
import android.view.MotionEvent;
import android.view.View;
import android.widget.OverScroller;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.core.view.NestedScrollingChild3;
import androidx.core.view.NestedScrollingChildHelper;
import androidx.core.view.ViewCompat;

import com.facebook.react.views.scroll.ReactScrollView;

final class ContinuousReactScrollView extends ReactScrollView
    implements NestedScrollingChild3 {
  private final OverScroller nestedFlingScroller;
  private final NestedScrollingChildHelper nestedScrollingChildHelper;
  private final int[] parentConsumed = new int[2];
  private final int[] parentConsumedAfterScroll = new int[2];

  private int lastScrollerY;
  private boolean nestedFlingRunning;

  ContinuousReactScrollView(@NonNull Context context) {
    super(context);
    nestedFlingScroller = new OverScroller(context);
    nestedScrollingChildHelper = new NestedScrollingChildHelper(this);
    setNestedScrollingEnabled(true);
  }

  @Override
  public void setNestedScrollingEnabled(boolean enabled) {
    nestedScrollingChildHelper.setNestedScrollingEnabled(enabled);
  }

  @Override
  public boolean isNestedScrollingEnabled() {
    return nestedScrollingChildHelper.isNestedScrollingEnabled();
  }

  @Override
  public boolean startNestedScroll(int axes) {
    return nestedScrollingChildHelper.startNestedScroll(axes);
  }

  @Override
  public boolean startNestedScroll(int axes, int type) {
    return nestedScrollingChildHelper.startNestedScroll(axes, type);
  }

  @Override
  public void stopNestedScroll() {
    nestedScrollingChildHelper.stopNestedScroll();
  }

  @Override
  public void stopNestedScroll(int type) {
    nestedScrollingChildHelper.stopNestedScroll(type);
  }

  @Override
  public boolean hasNestedScrollingParent() {
    return nestedScrollingChildHelper.hasNestedScrollingParent();
  }

  @Override
  public boolean hasNestedScrollingParent(int type) {
    return nestedScrollingChildHelper.hasNestedScrollingParent(type);
  }

  @Override
  public boolean dispatchNestedScroll(
      int dxConsumed,
      int dyConsumed,
      int dxUnconsumed,
      int dyUnconsumed,
      @Nullable int[] offsetInWindow) {
    return nestedScrollingChildHelper.dispatchNestedScroll(
        dxConsumed,
        dyConsumed,
        dxUnconsumed,
        dyUnconsumed,
        offsetInWindow);
  }

  @Override
  public boolean dispatchNestedScroll(
      int dxConsumed,
      int dyConsumed,
      int dxUnconsumed,
      int dyUnconsumed,
      @Nullable int[] offsetInWindow,
      int type) {
    return nestedScrollingChildHelper.dispatchNestedScroll(
        dxConsumed,
        dyConsumed,
        dxUnconsumed,
        dyUnconsumed,
        offsetInWindow,
        type);
  }

  @Override
  public void dispatchNestedScroll(
      int dxConsumed,
      int dyConsumed,
      int dxUnconsumed,
      int dyUnconsumed,
      @Nullable int[] offsetInWindow,
      int type,
      @NonNull int[] consumed) {
    nestedScrollingChildHelper.dispatchNestedScroll(
        dxConsumed,
        dyConsumed,
        dxUnconsumed,
        dyUnconsumed,
        offsetInWindow,
        type,
        consumed);
  }

  @Override
  public boolean dispatchNestedPreScroll(
      int dx,
      int dy,
      @Nullable int[] consumed,
      @Nullable int[] offsetInWindow) {
    if (dy < 0 && getScrollY() > 0) {
      return false;
    }
    return nestedScrollingChildHelper.dispatchNestedPreScroll(
        dx, dy, consumed, offsetInWindow);
  }

  @Override
  public boolean dispatchNestedPreScroll(
      int dx,
      int dy,
      @Nullable int[] consumed,
      @Nullable int[] offsetInWindow,
      int type) {
    if (dy < 0 && getScrollY() > 0) {
      return false;
    }
    return nestedScrollingChildHelper.dispatchNestedPreScroll(
        dx, dy, consumed, offsetInWindow, type);
  }

  @Override
  public boolean dispatchNestedFling(
      float velocityX, float velocityY, boolean consumed) {
    return nestedScrollingChildHelper.dispatchNestedFling(
        velocityX, velocityY, consumed);
  }

  @Override
  public boolean dispatchNestedPreFling(float velocityX, float velocityY) {
    return nestedScrollingChildHelper.dispatchNestedPreFling(
        velocityX, velocityY);
  }

  @Override
  public void fling(int velocityY) {
    abortContinuousFling();

    boolean canFling =
        (getScrollY() > 0 || velocityY > 0)
            && (getScrollY() < getScrollRange() || velocityY < 0);
    boolean listMustConsumeDownwardFling = velocityY < 0 && getScrollY() > 0;
    if (!listMustConsumeDownwardFling
        && ViewCompat.dispatchNestedPreFling(this, 0, velocityY)) {
      return;
    }

    ViewCompat.dispatchNestedFling(this, 0, velocityY, canFling);
    if (!canFling) {
      return;
    }

    ViewCompat.startNestedScroll(
        this, ViewCompat.SCROLL_AXIS_VERTICAL, ViewCompat.TYPE_NON_TOUCH);
    nestedFlingRunning = true;
    lastScrollerY = getScrollY();
    nestedFlingScroller.fling(
        getScrollX(),
        getScrollY(),
        0,
        velocityY,
        0,
        0,
        Integer.MIN_VALUE,
        Integer.MAX_VALUE,
        0,
        getHeight() / 2);
    ViewCompat.postInvalidateOnAnimation(this);
  }

  @Override
  public void computeScroll() {
    if (!nestedFlingRunning) {
      super.computeScroll();
      return;
    }

    if (!nestedFlingScroller.computeScrollOffset()) {
      finishContinuousFling();
      return;
    }

    int scrollerY = nestedFlingScroller.getCurrY();
    int deltaY = scrollerY - lastScrollerY;
    lastScrollerY = scrollerY;

    parentConsumed[0] = 0;
    parentConsumed[1] = 0;
    boolean listMustConsumeDownwardScroll = deltaY < 0 && getScrollY() > 0;
    if (!listMustConsumeDownwardScroll) {
      ViewCompat.dispatchNestedPreScroll(
          this,
          0,
          deltaY,
          parentConsumed,
          null,
          ViewCompat.TYPE_NON_TOUCH);
    }
    deltaY -= parentConsumed[1];

    int oldScrollY = getScrollY();
    scrollBy(0, deltaY);
    int consumedY = getScrollY() - oldScrollY;
    int unconsumedY = deltaY - consumedY;

    parentConsumedAfterScroll[0] = 0;
    parentConsumedAfterScroll[1] = 0;
    ViewCompat.dispatchNestedScroll(
        this,
        0,
        consumedY,
        0,
        unconsumedY,
        null,
        ViewCompat.TYPE_NON_TOUCH,
        parentConsumedAfterScroll);

    int remainingY = unconsumedY - parentConsumedAfterScroll[1];
    if (remainingY != 0 && consumedY == 0 && parentConsumed[1] == 0) {
      finishContinuousFling();
      return;
    }

    ViewCompat.postInvalidateOnAnimation(this);
  }

  @Override
  public boolean onInterceptTouchEvent(MotionEvent event) {
    if (event.getActionMasked() == MotionEvent.ACTION_DOWN) {
      abortContinuousFling();
    }
    return super.onInterceptTouchEvent(event);
  }

  @Override
  @SuppressLint("ClickableViewAccessibility")
  public boolean onTouchEvent(MotionEvent event) {
    if (event.getActionMasked() == MotionEvent.ACTION_DOWN) {
      abortContinuousFling();
    }
    return super.onTouchEvent(event);
  }

  @Override
  public void abortAnimation() {
    abortContinuousFling();
    super.abortAnimation();
  }

  @Override
  public void setDecelerationRate(float decelerationRate) {
    super.setDecelerationRate(decelerationRate);
    nestedFlingScroller.setFriction(1.0f - decelerationRate);
  }

  int getScrollRange() {
    if (getChildCount() == 0) {
      return 0;
    }
    View content = getChildAt(0);
    int viewportHeight = getHeight() - getPaddingTop() - getPaddingBottom();
    return Math.max(0, content.getHeight() - viewportHeight);
  }

  private void abortContinuousFling() {
    if (!nestedFlingScroller.isFinished()) {
      nestedFlingScroller.abortAnimation();
    }
    finishContinuousFling();
  }

  private void finishContinuousFling() {
    if (!nestedFlingRunning) {
      return;
    }
    nestedFlingRunning = false;
    ViewCompat.stopNestedScroll(this, ViewCompat.TYPE_NON_TOUCH);
  }

  @Override
  protected void onDetachedFromWindow() {
    abortContinuousFling();
    super.onDetachedFromWindow();
  }
}
