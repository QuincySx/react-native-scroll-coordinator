package com.scrollcoordinator;

import android.content.Context;
import android.view.View;
import android.view.ViewGroup;
import android.view.ViewParent;
import android.widget.FrameLayout;

import androidx.annotation.NonNull;

import java.util.ArrayList;
import java.util.List;

final class CoordinatorHeaderView extends FrameLayout {
  private static final float DEFAULT_TRANSITION_START = 0.55f;
  private static final float DEFAULT_TRANSITION_END = 0.85f;

  private final FrameLayout backgroundContainer;
  private final FrameLayout expandedContainer;
  private final FrameLayout collapsedContainer;
  private final List<View> coordinatorChildren = new ArrayList<>(3);

  private CoordinatorView coordinatorView;
  private float parallaxRate = 0.5f;
  private int collapseOffsetPx;
  private int collapseRangePx;
  private float transitionStart = DEFAULT_TRANSITION_START;
  private float transitionEnd = DEFAULT_TRANSITION_END;
  private boolean collapsedOwnsInteraction;
  private boolean interactionOwnerInitialized;

  CoordinatorHeaderView(@NonNull Context context) {
    super(context);
    setClipChildren(true);
    setClipToPadding(true);

    backgroundContainer = createLayer(context);
    expandedContainer = createLayer(context);
    collapsedContainer = createLayer(context);
    collapsedContainer.setVisibility(INVISIBLE);
    super.addView(backgroundContainer, matchParentLayoutParams());
    super.addView(expandedContainer, matchParentLayoutParams());
    super.addView(collapsedContainer, matchParentLayoutParams());
  }

  private static FrameLayout createLayer(@NonNull Context context) {
    FrameLayout layer = new FrameLayout(context);
    layer.setClipChildren(false);
    layer.setClipToPadding(false);
    return layer;
  }

  private static FrameLayout.LayoutParams matchParentLayoutParams() {
    return new FrameLayout.LayoutParams(
        ViewGroup.LayoutParams.MATCH_PARENT,
        ViewGroup.LayoutParams.MATCH_PARENT);
  }

  void addCoordinatorChild(@NonNull View child, int index) {
    if (index < 0 || index > coordinatorChildren.size() || index >= 3) {
      throw new IllegalArgumentException(
          "CoordinatorHeader accepts background, expanded, and collapsed children.");
    }
    coordinatorChildren.add(index, child);
    syncCoordinatorChildren();
  }

  void removeCoordinatorChild(@NonNull View child) {
    coordinatorChildren.remove(child);
    syncCoordinatorChildren();
  }

  void removeCoordinatorChildAt(int index) {
    coordinatorChildren.remove(index);
    syncCoordinatorChildren();
  }

  void removeAllCoordinatorChildren() {
    coordinatorChildren.clear();
    syncCoordinatorChildren();
  }

  int getCoordinatorChildCount() {
    return coordinatorChildren.size();
  }

  View getCoordinatorChildAt(int index) {
    return coordinatorChildren.get(index);
  }

  void setParallaxRate(float value) {
    if (Float.isNaN(value) || Float.isInfinite(value)) {
      parallaxRate = 0.5f;
    } else {
      parallaxRate = Math.max(0f, Math.min(1f, value));
    }
    applyParallaxTranslation();
  }

  void setCollapseOffsetPx(int value) {
    collapseOffsetPx = Math.max(0, value);
    applyHeaderEffects();
  }

  void setCollapseRangePx(int value) {
    collapseRangePx = Math.max(0, value);
    applyHeaderEffects();
  }

  void setTransitionStart(float value) {
    transitionStart = normalizeUnit(value, DEFAULT_TRANSITION_START);
    applyHeaderEffects();
  }

  void setTransitionEnd(float value) {
    transitionEnd = normalizeUnit(value, DEFAULT_TRANSITION_END);
    applyHeaderEffects();
  }

  private void applyParallaxTranslation() {
    backgroundContainer.setTranslationY(
        collapseOffsetPx * (1f - parallaxRate));
  }

  private void applyHeaderEffects() {
    applyParallaxTranslation();
    if (coordinatorChildren.size() < 3) {
      expandedContainer.setAlpha(1f);
      expandedContainer.setVisibility(VISIBLE);
      collapsedContainer.setAlpha(0f);
      collapsedContainer.setVisibility(INVISIBLE);
      if (interactionOwnerInitialized) {
        updateInteractionOwner(false);
      } else {
        expandedContainer.setImportantForAccessibility(
            IMPORTANT_FOR_ACCESSIBILITY_AUTO);
        collapsedContainer.setImportantForAccessibility(
            IMPORTANT_FOR_ACCESSIBILITY_NO_HIDE_DESCENDANTS);
      }
      return;
    }

    float start = transitionStart;
    float end = transitionEnd;
    if (end <= start) {
      start = DEFAULT_TRANSITION_START;
      end = DEFAULT_TRANSITION_END;
    }
    float collapseProgress =
        collapseRangePx == 0
            ? 0f
            : clampUnit((float) collapseOffsetPx / collapseRangePx);
    float transitionProgress =
        clampUnit((collapseProgress - start) / (end - start));

    expandedContainer.setAlpha(1f - transitionProgress);
    collapsedContainer.setAlpha(transitionProgress);
    expandedContainer.setVisibility(
        transitionProgress >= 1f ? INVISIBLE : VISIBLE);
    collapsedContainer.setVisibility(
        transitionProgress <= 0f ? INVISIBLE : VISIBLE);

    updateInteractionOwner(transitionProgress >= 0.5f);
  }

  private void updateInteractionOwner(boolean collapsedOwns) {
    if (interactionOwnerInitialized
        && collapsedOwnsInteraction == collapsedOwns) {
      return;
    }
    interactionOwnerInitialized = true;
    collapsedOwnsInteraction = collapsedOwns;
    expandedContainer.setImportantForAccessibility(
        collapsedOwns
            ? IMPORTANT_FOR_ACCESSIBILITY_NO_HIDE_DESCENDANTS
            : IMPORTANT_FOR_ACCESSIBILITY_AUTO);
    collapsedContainer.setImportantForAccessibility(
        collapsedOwns
            ? IMPORTANT_FOR_ACCESSIBILITY_AUTO
            : IMPORTANT_FOR_ACCESSIBILITY_NO_HIDE_DESCENDANTS);
    if (collapsedOwns) {
      collapsedContainer.bringToFront();
    } else {
      expandedContainer.bringToFront();
    }
  }

  private static float normalizeUnit(float value, float fallback) {
    if (Float.isNaN(value) || Float.isInfinite(value)) {
      return fallback;
    }
    return clampUnit(value);
  }

  private static float clampUnit(float value) {
    return Math.max(0f, Math.min(1f, value));
  }

  private void syncCoordinatorChildren() {
    backgroundContainer.removeAllViews();
    expandedContainer.removeAllViews();
    collapsedContainer.removeAllViews();
    if (!coordinatorChildren.isEmpty()) {
      addLayerChild(backgroundContainer, coordinatorChildren.get(0));
    }
    if (coordinatorChildren.size() > 1) {
      addLayerChild(expandedContainer, coordinatorChildren.get(1));
    }
    if (coordinatorChildren.size() > 2) {
      addLayerChild(collapsedContainer, coordinatorChildren.get(2));
    }
    applyHeaderEffects();
  }

  private static void addLayerChild(
      @NonNull FrameLayout layer, @NonNull View child) {
    ViewParent parent = child.getParent();
    if (parent instanceof ViewGroup) {
      ((ViewGroup) parent).removeView(child);
    }
    layer.addView(child, matchParentLayoutParams());
  }

  @Override
  protected void onAttachedToWindow() {
    super.onAttachedToWindow();
    ViewParent ancestor = getParent();
    while (ancestor != null && !(ancestor instanceof CoordinatorView)) {
      ancestor = ancestor.getParent();
    }
    if (ancestor instanceof CoordinatorView) {
      coordinatorView = (CoordinatorView) ancestor;
      coordinatorView.registerCoordinatorHeader(this);
    }
  }

  @Override
  protected void onDetachedFromWindow() {
    if (coordinatorView != null) {
      coordinatorView.unregisterCoordinatorHeader(this);
      coordinatorView = null;
    }
    super.onDetachedFromWindow();
  }
}
