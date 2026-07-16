# Performance acceptance

Performance claims require repeatable release-mode measurements; debug builds
and visual inspection are not acceptance evidence.

## Required scenarios

- Three, five, and ten tabs with preserved page offsets.
- One thousand recycled rows per tab with representative heavy cards.
- A twenty-thousand-row logical feed with delayed incremental batches, including
  scroll and navigation while a batch is pending.
- Dynamic header height, pull-to-refresh, banner edge handoff, rapid tab
  switching, background/foreground, rotation, and data insertion/removal.
- Banner-card and row-item taps must open detail only for a completed tap; a
  horizontal or vertical drag beginning on the same target must not navigate.
- Android 60 Hz low-tier and 120 Hz current devices; current iOS hardware; and
  Chrome production builds.

## Release budgets

- No ANR, crash, offset reset, or wrong gesture owner in the acceptance suite.
- No per-frame Android or iOS JS bridge traffic for native gesture
  arbitration; no React state-driven Web pager animation.
- No frozen frames in scripted Android interactions and no sustained memory
  growth after repeated tab cycles.
- Frame and hitch metrics must be recorded before and after behavior changes;
  regressions require an explicit release decision.

Store device model, OS, refresh rate, build type, dataset, trace, and raw
results with each baseline. Android Studio system traces and Xcode Instruments
are the reference profilers.
