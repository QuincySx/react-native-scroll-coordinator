package com.scrollcoordinator;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.facebook.react.BaseReactPackage;
import com.facebook.react.ViewManagerOnDemandReactPackage;
import com.facebook.react.bridge.ModuleSpec;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.module.model.ReactModuleInfoProvider;
import com.facebook.react.uimanager.ViewManager;

import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;
import java.util.List;

public final class CoordinatorPackage extends BaseReactPackage
    implements ViewManagerOnDemandReactPackage {
  @Nullable
  @Override
  public NativeModule getModule(
      @NonNull String name, @NonNull ReactApplicationContext reactContext) {
    return null;
  }

  @NonNull
  @Override
  public ReactModuleInfoProvider getReactModuleInfoProvider() {
    return Collections::emptyMap;
  }

  @NonNull
  @Override
  protected List<ModuleSpec> getViewManagers(
      @NonNull ReactApplicationContext reactContext) {
    return Arrays.asList(
        ModuleSpec.viewManagerSpec(CoordinatorViewManager::new),
        ModuleSpec.viewManagerSpec(CoordinatorHeaderViewManager::new),
        ModuleSpec.viewManagerSpec(CoordinatorHorizontalViewManager::new),
        ModuleSpec.viewManagerSpec(ContinuousReactScrollViewManager::new));
  }

  @NonNull
  @Override
  public Collection<String> getViewManagerNames(
      @NonNull ReactApplicationContext reactContext) {
    return Arrays.asList(
        CoordinatorViewManager.NAME,
        CoordinatorHeaderViewManager.NAME,
        CoordinatorHorizontalViewManager.NAME,
        ContinuousReactScrollViewManager.NAME);
  }

  @Nullable
  @Override
  @SuppressWarnings("rawtypes")
  public ViewManager createViewManager(
      @NonNull ReactApplicationContext reactContext,
      @NonNull String viewManagerName) {
    if (CoordinatorHorizontalViewManager.NAME.equals(viewManagerName)) {
      return new CoordinatorHorizontalViewManager();
    }
    if (CoordinatorHeaderViewManager.NAME.equals(viewManagerName)) {
      return new CoordinatorHeaderViewManager();
    }
    if (!CoordinatorViewManager.NAME.equals(viewManagerName)) {
      if (ContinuousReactScrollViewManager.NAME.equals(viewManagerName)) {
        return new ContinuousReactScrollViewManager();
      }
      return null;
    }
    return new CoordinatorViewManager();
  }
}
