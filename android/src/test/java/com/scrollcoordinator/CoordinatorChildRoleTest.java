package com.scrollcoordinator;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertThrows;

import org.junit.Test;

public class CoordinatorChildRoleTest {
  @Test
  public void mapsTheThreeFabricChildrenToStableNativeSlots() {
    assertEquals(
        CoordinatorChildRole.HEADER,
        CoordinatorChildRole.fromIndex(0));
    assertEquals(
        CoordinatorChildRole.STICKY,
        CoordinatorChildRole.fromIndex(1));
    assertEquals(
        CoordinatorChildRole.CONTENT,
        CoordinatorChildRole.fromIndex(2));
    assertThrows(
        IllegalArgumentException.class,
        () -> CoordinatorChildRole.fromIndex(3));
  }
}
