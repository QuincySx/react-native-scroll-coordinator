package com.scrollcoordinator;

import androidx.annotation.NonNull;

import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.views.scroll.ReactScrollView;
import com.facebook.react.views.scroll.ReactScrollViewManager;

public final class ContinuousReactScrollViewManager
    extends ReactScrollViewManager {
  public static final String NAME = "RNCoordinatorScrollView";

  @NonNull
  @Override
  public String getName() {
    return NAME;
  }

  @NonNull
  @Override
  public ReactScrollView createViewInstance(
      @NonNull ThemedReactContext reactContext) {
    return new ContinuousReactScrollView(reactContext);
  }
}
