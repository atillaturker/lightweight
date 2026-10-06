# AGENTS.md — History feature

Session history list, the durable history store, and its cloud sync
services (Firestore documents, tombstones, reconciliation, queued
writes).

## Screens

- `HistoryScreen` — sessions grouped by month, sticky headers.
- `SessionDetailScreen` lives in the analytics feature and is pushed
  from the History stack. Its rules below still apply.

## Rules

- Sessions are grouped by month. Sticky month headers use a
  `colors.canvas` background with a 1px `colors.hairline` bottom
  hairline. No shadow, no tint, no chip.
- Month header label: `type.label`, `colors.textMuted`, uppercase,
  `0.04em` tracking. Example: "APRIL 2026".
- Rows are plain. 56px height. Hairline between rows only — never
  above the first row of a month, never below the last. The next
  month's sticky header provides the separation.
- Volume column right-aligned, tabular-nums.
- Swipe-to-repeat is a runtime gesture. Do not render it in static
  frames.
- `SessionDetailScreen` is READ-ONLY. Set numbers use neutral gray
  outlines, never filled `colors.primary` circles — that treatment belongs to
  Active Workout.
- Session Detail shows a four-metric strip: Volume, Sets, Reps, Time.
- Header on Session Detail has no centered title. The routine name
  appears in the content as the primary heading.

## Do not

- Do not add thumbnails, day badges, or circular date icons.
  The one permitted leading visual is the 40px letter tile
  (`IconTile variant="letter"`, DESIGN.md §8): surface fill, routine's
  first letter. Never an image, never colored, never a date.
- Do not turn the History list into a calendar. Calendar-style views
  (the activity heatmap) belong to analytics and may link into a
  session here.
- Do not add "Load more" — infinite scroll is the pattern.
- Do not show a PR badge on every PR row. It appears only when the
  record was set within the last 30 days.
