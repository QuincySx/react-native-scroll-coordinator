package com.scrollcoordinator;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

import android.content.Context;
import android.view.ContextThemeWrapper;
import android.view.InputDevice;
import android.view.MotionEvent;
import android.view.View;
import android.widget.FrameLayout;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.robolectric.RobolectricTestRunner;
import org.robolectric.RuntimeEnvironment;
import org.robolectric.annotation.Config;

@RunWith(RobolectricTestRunner.class)
@Config(sdk = 35)
public class CoordinatorNativeHorizontalArbitrationTest {
  @Test
  public void pagerInterceptsTheFirstHorizontalMoveWhenBannerIsAtItsEdge() {
    TestHierarchy hierarchy = new TestHierarchy(false);

    hierarchy.dispatch(down(800, 500));
    hierarchy.dispatch(move(500, 505));

    assertTrue(hierarchy.pager.sawDown);
    assertTrue(hierarchy.pager.interceptedMove);
  }

  @Test
  public void bannerKeepsTheFirstHorizontalMoveWhileItCanScroll() {
    TestHierarchy hierarchy = new TestHierarchy(true);

    hierarchy.dispatch(down(800, 500));
    hierarchy.dispatch(move(500, 505));

    assertTrue(hierarchy.pager.sawDown);
    assertFalse(hierarchy.pager.interceptedMove);
  }

  @Test
  public void releasesAncestorsWhenVirtualizationDetachesTheActiveBanner() {
    TestHierarchy hierarchy = new TestHierarchy(true);

    hierarchy.dispatch(down(800, 500));
    assertTrue(hierarchy.outer.disallowIntercept);

    hierarchy.pager.removeView(hierarchy.boundary);
    hierarchy.dispatch(move(500, 505));

    assertFalse(hierarchy.outer.disallowIntercept);
  }

  @Test
  public void resetsGestureOriginWhenTheActivePointerChanges() {
    TestHierarchy hierarchy = new TestHierarchy(false);

    hierarchy.dispatch(down(800, 500));
    hierarchy.dispatch(pointerDown(800, 500, 200, 500));
    hierarchy.dispatch(pointerUp(800, 500, 200, 500, 0));
    hierarchy.dispatch(singlePointerMove(1, 205, 500));

    assertFalse(hierarchy.pager.interceptedMove);
    assertTrue(hierarchy.outer.disallowIntercept);
  }

  private static MotionEvent down(float x, float y) {
    return MotionEvent.obtain(0, 0, MotionEvent.ACTION_DOWN, x, y, 0);
  }

  private static MotionEvent move(float x, float y) {
    return MotionEvent.obtain(0, 16, MotionEvent.ACTION_MOVE, x, y, 0);
  }

  private static MotionEvent pointerDown(
      float firstX, float firstY, float secondX, float secondY) {
    return multiPointerEvent(
        MotionEvent.ACTION_POINTER_DOWN
            | (1 << MotionEvent.ACTION_POINTER_INDEX_SHIFT),
        new int[] {0, 1},
        new float[] {firstX, secondX},
        new float[] {firstY, secondY});
  }

  private static MotionEvent pointerUp(
      float firstX,
      float firstY,
      float secondX,
      float secondY,
      int actionIndex) {
    return multiPointerEvent(
        MotionEvent.ACTION_POINTER_UP
            | (actionIndex << MotionEvent.ACTION_POINTER_INDEX_SHIFT),
        new int[] {0, 1},
        new float[] {firstX, secondX},
        new float[] {firstY, secondY});
  }

  private static MotionEvent singlePointerMove(
      int pointerId, float x, float y) {
    return multiPointerEvent(
        MotionEvent.ACTION_MOVE,
        new int[] {pointerId},
        new float[] {x},
        new float[] {y});
  }

  private static MotionEvent multiPointerEvent(
      int action, int[] pointerIds, float[] xs, float[] ys) {
    MotionEvent.PointerProperties[] properties =
        new MotionEvent.PointerProperties[pointerIds.length];
    MotionEvent.PointerCoords[] coordinates =
        new MotionEvent.PointerCoords[pointerIds.length];
    for (int index = 0; index < pointerIds.length; index += 1) {
      MotionEvent.PointerProperties property =
          new MotionEvent.PointerProperties();
      property.id = pointerIds[index];
      property.toolType = MotionEvent.TOOL_TYPE_FINGER;
      properties[index] = property;

      MotionEvent.PointerCoords coordinate = new MotionEvent.PointerCoords();
      coordinate.x = xs[index];
      coordinate.y = ys[index];
      coordinate.pressure = 1;
      coordinate.size = 1;
      coordinates[index] = coordinate;
    }
    return MotionEvent.obtain(
        0,
        16,
        action,
        pointerIds.length,
        properties,
        coordinates,
        0,
        0,
        1,
        1,
        0,
        0,
        InputDevice.SOURCE_TOUCHSCREEN,
        0);
  }

  private static Context createContext() {
    return new ContextThemeWrapper(
        RuntimeEnvironment.getApplication(),
        com.google.android.material.R.style.Theme_MaterialComponents);
  }

  private static final class TestHierarchy {
    private final CoordinatorView coordinator;
    private final RecordingAncestor outer;
    private final RecordingPager pager;
    private final CoordinatorHorizontalView boundary;

    TestHierarchy(boolean bannerCanScrollForward) {
      Context context = createContext();
      outer = new RecordingAncestor(context);
      coordinator = new CoordinatorView(context);
      pager = new RecordingPager(context);

      boundary = new CoordinatorHorizontalView(context);
      boundary.addView(
          new DirectionalTouchView(context, bannerCanScrollForward),
          new FrameLayout.LayoutParams(1000, 1000));
      pager.addView(
          boundary, new FrameLayout.LayoutParams(1000, 1000));

      coordinator.addCoordinatorChild(new View(context), 0);
      coordinator.addCoordinatorChild(new View(context), 1);
      coordinator.addCoordinatorChild(pager, 2);
      coordinator.setHeaderHeightPx(0);
      coordinator.setTabBarHeightPx(0);
      outer.addView(
          coordinator, new FrameLayout.LayoutParams(1000, 1000));
      outer.measure(
          View.MeasureSpec.makeMeasureSpec(1000, View.MeasureSpec.EXACTLY),
          View.MeasureSpec.makeMeasureSpec(1000, View.MeasureSpec.EXACTLY));
      outer.layout(0, 0, 1000, 1000);
    }

    void dispatch(MotionEvent event) {
      coordinator.dispatchTouchEvent(event);
      event.recycle();
    }
  }

  private static final class RecordingAncestor extends FrameLayout {
    private boolean disallowIntercept;

    RecordingAncestor(Context context) {
      super(context);
    }

    @Override
    public void requestDisallowInterceptTouchEvent(boolean disallowIntercept) {
      this.disallowIntercept = disallowIntercept;
      super.requestDisallowInterceptTouchEvent(disallowIntercept);
    }
  }

  private static final class RecordingPager extends FrameLayout {
    private boolean sawDown;
    private boolean interceptedMove;

    RecordingPager(Context context) {
      super(context);
    }

    @Override
    public boolean onInterceptTouchEvent(MotionEvent event) {
      if (event.getActionMasked() == MotionEvent.ACTION_DOWN) {
        sawDown = true;
        return false;
      }
      if (event.getActionMasked() == MotionEvent.ACTION_MOVE) {
        interceptedMove = true;
        return true;
      }
      return false;
    }
  }

  private static final class DirectionalTouchView extends View {
    private final boolean canScrollForward;

    DirectionalTouchView(Context context, boolean canScrollForward) {
      super(context);
      this.canScrollForward = canScrollForward;
    }

    @Override
    public boolean canScrollHorizontally(int direction) {
      return direction > 0 && canScrollForward;
    }

    @Override
    public boolean onTouchEvent(MotionEvent event) {
      return true;
    }
  }
}
