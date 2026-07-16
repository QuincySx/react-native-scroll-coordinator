package com.scrollcoordinator;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

import android.content.Context;
import android.view.View;
import android.view.ViewGroup;
import android.widget.FrameLayout;

import androidx.annotation.NonNull;
import androidx.core.view.NestedScrollingParent3;
import androidx.core.view.ViewCompat;

import com.facebook.react.bridge.BridgeReactContext;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.robolectric.RobolectricTestRunner;
import org.robolectric.RuntimeEnvironment;
import org.robolectric.annotation.Config;
import org.robolectric.shadows.ShadowSystemClock;

import java.time.Duration;

@RunWith(RobolectricTestRunner.class)
@Config(sdk = 35)
public class ContinuousReactScrollViewTest {
  @Test
  public void oneNonTouchFlingCollapsesTheParentThenContinuesInTheList() {
    Context context = new BridgeReactContext(RuntimeEnvironment.getApplication());
    ConsumingNestedParent parent = new ConsumingNestedParent(context, 228);
    ContinuousReactScrollView scrollView =
        new ContinuousReactScrollView(context);
    View content = new View(context);
    scrollView.addView(
        content,
        new FrameLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT, 5000));
    parent.addView(
        scrollView,
        new FrameLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT, 1000));
    measureAndLayout(parent, 1080, 1000);
    measureAndLayout(content, 1080, 5000);
    assertEquals(1000, scrollView.getHeight());
    assertEquals(5000, content.getHeight());
    assertEquals(4000, scrollView.getScrollRange());

    assertTrue(
        scrollView.startNestedScroll(
            ViewCompat.SCROLL_AXIS_VERTICAL, ViewCompat.TYPE_NON_TOUCH));
    scrollView.stopNestedScroll(ViewCompat.TYPE_NON_TOUCH);
    scrollView.fling(6000);
    assertTrue(scrollView.hasNestedScrollingParent(ViewCompat.TYPE_NON_TOUCH));
    for (int frame = 0; frame < 120; frame += 1) {
      ShadowSystemClock.advanceBy(Duration.ofMillis(16));
      scrollView.computeScroll();
    }

    assertTrue(parent.sawNonTouchScroll);
    assertEquals(228, parent.totalConsumedY);
    assertTrue(scrollView.getScrollY() > 0);
  }

  @Test
  public void downwardFlingStaysInTheListUntilItReachesTheTop() {
    Context context = new BridgeReactContext(RuntimeEnvironment.getApplication());
    ConsumingNestedParent parent = new ConsumingNestedParent(context, 0);
    parent.consumeDownwardPreFling = true;
    parent.consumeDownwardNonTouchPreScroll = true;
    ContinuousReactScrollView scrollView =
        new ContinuousReactScrollView(context);
    View content = new View(context);
    scrollView.addView(
        content,
        new FrameLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT, 5000));
    parent.addView(
        scrollView,
        new FrameLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT, 1000));
    measureAndLayout(parent, 1080, 1000);
    measureAndLayout(content, 1080, 5000);
    scrollView.scrollTo(0, 3000);
    assertEquals(3000, scrollView.getScrollY());
    assertTrue(
        scrollView.startNestedScroll(
            ViewCompat.SCROLL_AXIS_VERTICAL, ViewCompat.TYPE_TOUCH));

    scrollView.fling(-6000);

    assertFalse(parent.sawDownwardPreFling);
    assertTrue(scrollView.hasNestedScrollingParent(ViewCompat.TYPE_NON_TOUCH));
    for (int frame = 0; frame < 10; frame += 1) {
      ShadowSystemClock.advanceBy(Duration.ofMillis(16));
      scrollView.computeScroll();
    }

    assertFalse(parent.sawDownwardNonTouchPreScroll);
    assertTrue(scrollView.getScrollY() < 3000);
  }

  @Test
  public void downwardTouchScrollStaysInTheListUntilItReachesTheTop() {
    Context context = new BridgeReactContext(RuntimeEnvironment.getApplication());
    ConsumingNestedParent parent = new ConsumingNestedParent(context, 0);
    parent.consumeDownwardTouchPreScroll = true;
    ContinuousReactScrollView scrollView =
        new ContinuousReactScrollView(context);
    View content = new View(context);
    scrollView.addView(
        content,
        new FrameLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT, 5000));
    parent.addView(
        scrollView,
        new FrameLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT, 1000));
    measureAndLayout(parent, 1080, 1000);
    measureAndLayout(content, 1080, 5000);
    scrollView.scrollTo(0, 3000);
    assertTrue(
        scrollView.startNestedScroll(
            ViewCompat.SCROLL_AXIS_VERTICAL, ViewCompat.TYPE_TOUCH));
    int[] consumed = new int[2];

    boolean parentHandled =
        scrollView.dispatchNestedPreScroll(
            0, -100, consumed, null, ViewCompat.TYPE_TOUCH);

    assertFalse(parentHandled);
    assertFalse(parent.sawDownwardTouchPreScroll);
    assertEquals(0, consumed[1]);
  }

  private static void measureAndLayout(View view, int width, int height) {
    view.measure(
        View.MeasureSpec.makeMeasureSpec(width, View.MeasureSpec.EXACTLY),
        View.MeasureSpec.makeMeasureSpec(height, View.MeasureSpec.EXACTLY));
    view.layout(0, 0, width, height);
  }

  private static final class ConsumingNestedParent extends FrameLayout
      implements NestedScrollingParent3 {
    private int remainingY;
    private int totalConsumedY;
    private boolean sawNonTouchScroll;
    private boolean consumeDownwardPreFling;
    private boolean sawDownwardPreFling;
    private boolean consumeDownwardNonTouchPreScroll;
    private boolean sawDownwardNonTouchPreScroll;
    private boolean consumeDownwardTouchPreScroll;
    private boolean sawDownwardTouchPreScroll;

    ConsumingNestedParent(Context context, int remainingY) {
      super(context);
      this.remainingY = remainingY;
    }

    @Override
    public boolean onStartNestedScroll(
        @NonNull View child,
        @NonNull View target,
        int axes,
        int type) {
      return (axes & ViewCompat.SCROLL_AXIS_VERTICAL) != 0;
    }

    @Override
    public void onNestedScrollAccepted(
        @NonNull View child,
        @NonNull View target,
        int axes,
        int type) {}

    @Override
    public void onStopNestedScroll(@NonNull View target, int type) {}

    @Override
    public void onNestedPreScroll(
        @NonNull View target,
        int dx,
        int dy,
        @NonNull int[] consumed,
        int type) {
      if (type == ViewCompat.TYPE_NON_TOUCH && dy > 0) {
        sawNonTouchScroll = true;
        int consumedY = Math.min(dy, remainingY);
        consumed[1] += consumedY;
        remainingY -= consumedY;
        totalConsumedY += consumedY;
      } else if (type == ViewCompat.TYPE_NON_TOUCH && dy < 0) {
        sawDownwardNonTouchPreScroll = true;
        if (consumeDownwardNonTouchPreScroll) {
          consumed[1] += dy;
        }
      } else if (type == ViewCompat.TYPE_TOUCH && dy < 0) {
        sawDownwardTouchPreScroll = true;
        if (consumeDownwardTouchPreScroll) {
          consumed[1] += dy;
        }
      }
    }

    @Override
    public void onNestedScroll(
        @NonNull View target,
        int dxConsumed,
        int dyConsumed,
        int dxUnconsumed,
        int dyUnconsumed,
        int type) {}

    @Override
    public void onNestedScroll(
        @NonNull View target,
        int dxConsumed,
        int dyConsumed,
        int dxUnconsumed,
        int dyUnconsumed,
        int type,
        @NonNull int[] consumed) {}

    @Override
    public boolean onNestedFling(
        @NonNull View target,
        float velocityX,
        float velocityY,
        boolean consumed) {
      return false;
    }

    @Override
    public boolean onNestedPreFling(
        @NonNull View target, float velocityX, float velocityY) {
      if (velocityY < 0) {
        sawDownwardPreFling = true;
        return consumeDownwardPreFling;
      }
      return false;
    }

    @Override
    public int getNestedScrollAxes() {
      return ViewCompat.SCROLL_AXIS_VERTICAL;
    }
  }
}
