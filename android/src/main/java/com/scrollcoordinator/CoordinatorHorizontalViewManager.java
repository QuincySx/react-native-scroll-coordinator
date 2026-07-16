package com.scrollcoordinator;

import androidx.annotation.NonNull;

import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.ViewGroupManager;

public final class CoordinatorHorizontalViewManager
    extends ViewGroupManager<CoordinatorHorizontalView> {
  public static final String NAME = "RNCoordinatorHorizontal";

  @NonNull
  @Override
  public String getName() {
    return NAME;
  }

  @NonNull
  @Override
  protected CoordinatorHorizontalView createViewInstance(
      @NonNull ThemedReactContext reactContext) {
    return new CoordinatorHorizontalView(reactContext);
  }
}
