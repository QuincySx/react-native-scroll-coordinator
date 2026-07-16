package com.scrollcoordinator;

import android.view.View;

import androidx.annotation.NonNull;

import com.facebook.react.module.annotations.ReactModule;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.ViewGroupManager;
import com.facebook.react.uimanager.ViewManagerDelegate;
import com.facebook.react.viewmanagers.RNCoordinatorHeaderManagerDelegate;
import com.facebook.react.viewmanagers.RNCoordinatorHeaderManagerInterface;

@ReactModule(name = CoordinatorHeaderViewManager.NAME)
public final class CoordinatorHeaderViewManager
    extends ViewGroupManager<CoordinatorHeaderView>
    implements RNCoordinatorHeaderManagerInterface<CoordinatorHeaderView> {
  public static final String NAME = "RNCoordinatorHeader";

  private final ViewManagerDelegate<CoordinatorHeaderView> delegate =
      new RNCoordinatorHeaderManagerDelegate<>(this);

  @Override
  protected ViewManagerDelegate<CoordinatorHeaderView> getDelegate() {
    return delegate;
  }

  @NonNull
  @Override
  public String getName() {
    return NAME;
  }

  @NonNull
  @Override
  protected CoordinatorHeaderView createViewInstance(
      @NonNull ThemedReactContext reactContext) {
    return new CoordinatorHeaderView(reactContext);
  }

  @Override
  public void addView(
      @NonNull CoordinatorHeaderView parent, View child, int index) {
    parent.addCoordinatorChild(child, index);
  }

  @Override
  public int getChildCount(@NonNull CoordinatorHeaderView parent) {
    return parent.getCoordinatorChildCount();
  }

  @Override
  public View getChildAt(@NonNull CoordinatorHeaderView parent, int index) {
    return parent.getCoordinatorChildAt(index);
  }

  @Override
  public void removeView(@NonNull CoordinatorHeaderView parent, View view) {
    parent.removeCoordinatorChild(view);
  }

  @Override
  public void removeViewAt(@NonNull CoordinatorHeaderView parent, int index) {
    parent.removeCoordinatorChildAt(index);
  }

  @Override
  public void removeAllViews(@NonNull CoordinatorHeaderView parent) {
    parent.removeAllCoordinatorChildren();
  }

  @Override
  public void setParallaxRate(CoordinatorHeaderView view, double value) {
    view.setParallaxRate((float) value);
  }

  @Override
  public void setTransitionEnd(CoordinatorHeaderView view, double value) {
    view.setTransitionEnd((float) value);
  }

  @Override
  public void setTransitionStart(CoordinatorHeaderView view, double value) {
    view.setTransitionStart((float) value);
  }

  @Override
  public boolean needsCustomLayoutForChildren() {
    return true;
  }
}
