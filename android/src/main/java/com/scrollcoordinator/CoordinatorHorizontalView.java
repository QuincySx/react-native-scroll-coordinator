package com.scrollcoordinator;

import android.content.Context;
import android.view.View;
import android.view.ViewGroup;
import android.widget.FrameLayout;

import androidx.annotation.NonNull;

final class CoordinatorHorizontalView extends FrameLayout {
  CoordinatorHorizontalView(@NonNull Context context) {
    super(context);
  }

  void setAncestorInterceptionDisabled(boolean disabled) {
    if (getParent() != null) {
      getParent().requestDisallowInterceptTouchEvent(disabled);
    }
  }

  boolean canScrollInDirection(int direction) {
    return canDescendantScrollHorizontally(this, direction);
  }

  private static boolean canDescendantScrollHorizontally(
      @NonNull View view, int direction) {
    if (view.canScrollHorizontally(direction)) {
      return true;
    }
    if (!(view instanceof ViewGroup)) {
      return false;
    }
    ViewGroup group = (ViewGroup) view;
    for (int index = group.getChildCount() - 1; index >= 0; index -= 1) {
      if (canDescendantScrollHorizontally(group.getChildAt(index), direction)) {
        return true;
      }
    }
    return false;
  }
}
