package com.scrollcoordinator;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

import android.content.Context;
import android.view.View;
import android.widget.FrameLayout;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.robolectric.RobolectricTestRunner;
import org.robolectric.RuntimeEnvironment;
import org.robolectric.annotation.Config;

@RunWith(RobolectricTestRunner.class)
@Config(sdk = 35)
public class CoordinatorHorizontalViewTest {
  @Test
  public void reportsThatDescendantCanScrollForward() {
    TestHierarchy hierarchy = new TestHierarchy(true, false);

    assertTrue(hierarchy.boundary.canScrollInDirection(1));
    assertFalse(hierarchy.boundary.canScrollInDirection(-1));
  }

  @Test
  public void reportsThatDescendantIsAtItsDirectionalEdges() {
    TestHierarchy hierarchy = new TestHierarchy(false, false);

    assertFalse(hierarchy.boundary.canScrollInDirection(1));
    assertFalse(hierarchy.boundary.canScrollInDirection(-1));
  }

  @Test
  public void forwardsAncestorInterceptionControlWithoutJs() {
    TestHierarchy hierarchy = new TestHierarchy(false, false);

    hierarchy.boundary.setAncestorInterceptionDisabled(true);
    assertTrue(hierarchy.parent.disallowIntercept);
    hierarchy.boundary.setAncestorInterceptionDisabled(false);
    assertFalse(hierarchy.parent.disallowIntercept);
  }

  private static final class TestHierarchy {
    private final RecordingParent parent;
    private final CoordinatorHorizontalView boundary;

    TestHierarchy(boolean canScrollForward, boolean canScrollBackward) {
      Context context = RuntimeEnvironment.getApplication();
      parent = new RecordingParent(context);
      boundary = new CoordinatorHorizontalView(context);
      boundary.addView(
          new DirectionalChild(
              context, canScrollForward, canScrollBackward),
          new FrameLayout.LayoutParams(1000, 300));
      parent.addView(boundary, new FrameLayout.LayoutParams(1000, 300));
      parent.measure(
          View.MeasureSpec.makeMeasureSpec(1000, View.MeasureSpec.EXACTLY),
          View.MeasureSpec.makeMeasureSpec(300, View.MeasureSpec.EXACTLY));
      parent.layout(0, 0, 1000, 300);
    }

  }

  private static final class RecordingParent extends FrameLayout {
    private boolean disallowIntercept;

    RecordingParent(Context context) {
      super(context);
    }

    @Override
    public void requestDisallowInterceptTouchEvent(boolean disallowIntercept) {
      this.disallowIntercept = disallowIntercept;
    }
  }

  private static final class DirectionalChild extends View {
    private final boolean canScrollForward;
    private final boolean canScrollBackward;

    DirectionalChild(
        Context context,
        boolean canScrollForward,
        boolean canScrollBackward) {
      super(context);
      this.canScrollForward = canScrollForward;
      this.canScrollBackward = canScrollBackward;
    }

    @Override
    public boolean canScrollHorizontally(int direction) {
      return direction > 0 ? canScrollForward : canScrollBackward;
    }
  }
}
