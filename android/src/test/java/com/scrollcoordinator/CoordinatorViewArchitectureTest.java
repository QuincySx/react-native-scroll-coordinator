package com.scrollcoordinator;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertSame;
import static org.junit.Assert.assertTrue;

import android.content.Context;
import android.graphics.Rect;
import android.view.ContextThemeWrapper;
import android.view.View;
import android.view.View.MeasureSpec;
import android.widget.FrameLayout;

import androidx.coordinatorlayout.widget.CoordinatorLayout;

import com.google.android.material.appbar.AppBarLayout;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.robolectric.RobolectricTestRunner;
import org.robolectric.RuntimeEnvironment;
import org.robolectric.Shadows;
import org.robolectric.annotation.Config;

@RunWith(RobolectricTestRunner.class)
@Config(sdk = 35)
public class CoordinatorViewArchitectureTest {
  private static Context createContext() {
    return new ContextThemeWrapper(
        RuntimeEnvironment.getApplication(),
        com.google.android.material.R.style.Theme_MaterialComponents);
  }

  @Test
  public void usesTheStandardCoordinatorAndAppBarHierarchy() {
    assertTrue(
        CoordinatorLayout.class.isAssignableFrom(CoordinatorView.class));

    CoordinatorView view = new CoordinatorView(createContext());

    assertEquals(2, view.getChildCount());
    assertTrue(view.getChildAt(0) instanceof AppBarLayout);
    assertTrue(view.getChildAt(1) instanceof FrameLayout);
  }

  @Test
  public void routesFabricChildrenIntoNativeCoordinatorSlots() {
    CoordinatorView view = new CoordinatorView(createContext());
    View header = new View(view.getContext());
    View sticky = new View(view.getContext());
    View content = new View(view.getContext());

    view.addCoordinatorChild(header, 0);
    view.addCoordinatorChild(sticky, 1);
    view.addCoordinatorChild(content, 2);

    AppBarLayout appBarLayout = (AppBarLayout) view.getChildAt(0);
    assertSame(header, ((FrameLayout) appBarLayout.getChildAt(0)).getChildAt(0));
    assertSame(sticky, ((FrameLayout) appBarLayout.getChildAt(1)).getChildAt(0));
    assertSame(content, ((FrameLayout) view.getChildAt(1)).getChildAt(0));
  }

  @Test
  public void delegatesCollapseSnapAndContentPlacementToMaterialBehaviors() {
    CoordinatorView view = new CoordinatorView(createContext());

    view.setHeaderHeightPx(300);
    view.setTabBarHeightPx(52);
    view.setMinimumHeaderHeightPx(72);
    view.setSnapEnabled(true);

    AppBarLayout appBarLayout = (AppBarLayout) view.getChildAt(0);
    FrameLayout headerContainer = (FrameLayout) appBarLayout.getChildAt(0);
    FrameLayout stickyContainer = (FrameLayout) appBarLayout.getChildAt(1);
    AppBarLayout.LayoutParams headerParams =
        (AppBarLayout.LayoutParams) headerContainer.getLayoutParams();
    AppBarLayout.LayoutParams stickyParams =
        (AppBarLayout.LayoutParams) stickyContainer.getLayoutParams();
    CoordinatorLayout.LayoutParams contentParams =
        (CoordinatorLayout.LayoutParams) view.getChildAt(1).getLayoutParams();

    int expectedScrollFlags =
        AppBarLayout.LayoutParams.SCROLL_FLAG_SCROLL
            | AppBarLayout.LayoutParams.SCROLL_FLAG_EXIT_UNTIL_COLLAPSED
            | AppBarLayout.LayoutParams.SCROLL_FLAG_SNAP;
    assertEquals(300, headerParams.height);
    assertEquals(72, headerContainer.getMinimumHeight());
    assertEquals(expectedScrollFlags, headerParams.getScrollFlags());
    assertEquals(52, stickyParams.height);
    assertEquals(0, stickyParams.getScrollFlags());
    assertTrue(
        contentParams.getBehavior()
            instanceof AppBarLayout.ScrollingViewBehavior);
  }

  @Test
  public void refreshesTheNativeHierarchyAfterDynamicHeightUpdates() {
    CoordinatorView view = new CoordinatorView(createContext());
    view.setHeaderHeightPx(300);
    view.setTabBarHeightPx(52);
    measureAndLayout(view, 1080, 1920);

    AppBarLayout appBarLayout = (AppBarLayout) view.getChildAt(0);
    assertEquals(352, appBarLayout.getMeasuredHeight());

    view.setHeaderHeightPx(176);
    Shadows.shadowOf(android.os.Looper.getMainLooper()).idle();

    assertEquals(228, appBarLayout.getMeasuredHeight());
  }

  @Test
  public void clipsTheCollapsingAppBarToTheCoordinatorBounds() {
    Context context = createContext();
    FrameLayout outer = new FrameLayout(context);
    outer.setClipChildren(false);
    CoordinatorView coordinator = new CoordinatorView(context);
    coordinator.setClipChildren(false);
    View header = new View(context);

    coordinator.addCoordinatorChild(header, 0);
    coordinator.addCoordinatorChild(new View(context), 1);
    coordinator.addCoordinatorChild(new View(context), 2);
    coordinator.setHeaderHeightPx(100);
    coordinator.setTabBarHeightPx(0);

    FrameLayout.LayoutParams coordinatorParams =
        new FrameLayout.LayoutParams(100, 100);
    coordinatorParams.topMargin = 50;
    outer.addView(coordinator, coordinatorParams);
    measureAndLayout(outer, 100, 150);

    AppBarLayout appBarLayout =
        (AppBarLayout) coordinator.getChildAt(0);
    appBarLayout.offsetTopAndBottom(-50);
    assertEquals(50, coordinator.getTop());
    assertEquals(-50, appBarLayout.getTop());

    assertEquals(new Rect(0, 0, 100, 100), coordinator.getClipBounds());
  }

  @Test
  public void routesHeaderLayersAndAppliesParallaxToTheBackgroundOnly() {
    CoordinatorHeaderView header = new CoordinatorHeaderView(createContext());
    View background = new View(header.getContext());
    View foreground = new View(header.getContext());

    header.addCoordinatorChild(background, 0);
    header.addCoordinatorChild(foreground, 1);
    header.setParallaxRate(0.4f);
    header.setCollapseOffsetPx(100);

    FrameLayout backgroundLayer = (FrameLayout) header.getChildAt(0);
    FrameLayout foregroundLayer = (FrameLayout) header.getChildAt(1);
    assertSame(background, backgroundLayer.getChildAt(0));
    assertSame(foreground, foregroundLayer.getChildAt(0));
    assertEquals(60f, backgroundLayer.getTranslationY(), 0.001f);
    assertEquals(0f, foregroundLayer.getTranslationY(), 0.001f);
  }

  @Test
  public void crossFadesExpandedAndCollapsedHeaderLayoutsFromNativeOffset() {
    CoordinatorHeaderView header = new CoordinatorHeaderView(createContext());
    View background = new View(header.getContext());
    View expanded = new View(header.getContext());
    View collapsed = new View(header.getContext());

    header.addCoordinatorChild(background, 0);
    header.addCoordinatorChild(expanded, 1);
    header.addCoordinatorChild(collapsed, 2);
    header.setTransitionStart(0.25f);
    header.setTransitionEnd(0.75f);
    header.setCollapseRangePx(200);
    header.setCollapseOffsetPx(100);

    FrameLayout expandedLayer = (FrameLayout) expanded.getParent();
    FrameLayout collapsedLayer = (FrameLayout) collapsed.getParent();
    assertEquals(0.5f, expandedLayer.getAlpha(), 0.001f);
    assertEquals(0.5f, collapsedLayer.getAlpha(), 0.001f);

    header.setCollapseOffsetPx(200);

    assertEquals(View.INVISIBLE, expandedLayer.getVisibility());
    assertEquals(View.VISIBLE, collapsedLayer.getVisibility());
    assertEquals(1f, collapsedLayer.getAlpha(), 0.001f);
  }

  private static void measureAndLayout(View view, int width, int height) {
    view.measure(
        MeasureSpec.makeMeasureSpec(width, MeasureSpec.EXACTLY),
        MeasureSpec.makeMeasureSpec(height, MeasureSpec.EXACTLY));
    view.layout(0, 0, width, height);
  }

}
