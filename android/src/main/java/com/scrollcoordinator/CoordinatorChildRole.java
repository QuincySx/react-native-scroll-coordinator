package com.scrollcoordinator;

enum CoordinatorChildRole {
  HEADER,
  STICKY,
  CONTENT;

  static CoordinatorChildRole fromIndex(int index) {
    CoordinatorChildRole[] roles = values();
    if (index < 0 || index >= roles.length) {
      throw new IllegalArgumentException(
          "Coordinator accepts exactly three children.");
    }
    return roles[index];
  }
}
