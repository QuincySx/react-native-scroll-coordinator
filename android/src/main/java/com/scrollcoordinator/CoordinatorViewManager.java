package com.scrollcoordinator;

import android.view.View;

import androidx.annotation.NonNull;

import com.facebook.react.module.annotations.ReactModule;
import com.facebook.react.uimanager.PixelUtil;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.ViewGroupManager;
import com.facebook.react.uimanager.ViewManagerDelegate;
import com.facebook.react.viewmanagers.RNCoordinatorManagerDelegate;
import com.facebook.react.viewmanagers.RNCoordinatorManagerInterface;

@ReactModule(name = CoordinatorViewManager.NAME)
public final class CoordinatorViewManager
    extends ViewGroupManager<CoordinatorView>
    implements RNCoordinatorManagerInterface<CoordinatorView> {
  public static final String NAME = "RNCoordinator";

  private final ViewManagerDelegate<CoordinatorView> delegate =
      new RNCoordinatorManagerDelegate<>(this);

  @Override
  protected ViewManagerDelegate<CoordinatorView> getDelegate() {
    return delegate;
  }

  @NonNull
  @Override
  public String getName() {
    return NAME;
  }

  @NonNull
  @Override
  protected CoordinatorView createViewInstance(
      @NonNull ThemedReactContext reactContext) {
    return new CoordinatorView(reactContext);
  }

  @Override
  public void addView(
      @NonNull CoordinatorView parent, View child, int index) {
    parent.addCoordinatorChild(child, index);
  }

  @Override
  public int getChildCount(@NonNull CoordinatorView parent) {
    return parent.getCoordinatorChildCount();
  }

  @Override
  public View getChildAt(@NonNull CoordinatorView parent, int index) {
    return parent.getCoordinatorChildAt(index);
  }

  @Override
  public void removeView(@NonNull CoordinatorView parent, View view) {
    parent.removeCoordinatorChild(view);
  }

  @Override
  public void removeViewAt(@NonNull CoordinatorView parent, int index) {
    parent.removeCoordinatorChildAt(index);
  }

  @Override
  public void removeAllViews(@NonNull CoordinatorView parent) {
    parent.removeAllCoordinatorChildren();
  }

  @Override
  public void setHeaderHeight(CoordinatorView view, double value) {
    view.setHeaderHeightPx(Math.round(PixelUtil.toPixelFromDIP(value)));
  }

  @Override
  public void setMinimumHeaderHeight(CoordinatorView view, double value) {
    view.setMinimumHeaderHeightPx(Math.round(PixelUtil.toPixelFromDIP(value)));
  }

  @Override
  public void setSnapEnabled(CoordinatorView view, boolean value) {
    view.setSnapEnabled(value);
  }

  @Override
  public void setTabBarHeight(CoordinatorView view, double value) {
    view.setTabBarHeightPx(Math.round(PixelUtil.toPixelFromDIP(value)));
  }

  @Override
  public boolean needsCustomLayoutForChildren() {
    return true;
  }
}
