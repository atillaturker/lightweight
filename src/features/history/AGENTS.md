# AGENTS.md — History feature

Session history list and read-only session detail. Two screens.

## Screens

- `HistoryScreen` — sessions grouped by month, sticky headers.
- `SessionDetailScreen` — full record of a single session, plus a
  "Repeat this workout" CTA.

## Rules

- Sessions are grouped by month. Sticky month headers use `#FFFFFF`
  background with a 1px `#E5E7EB` bottom hairline. No shadow, no
  tint, no chip.
- Month header label: `Inter 13px / 500 #6B7280`, uppercase,
  `0.04em` tracking. Example: "APRIL 2026".
- Rows are plain. 56px height. Hairline between rows only — never
  above the first row of a month, never below the last. The next
  month's sticky header provides the separation.
- Volume column right-aligned, tabular-nums.
- Swipe-to-repeat is a runtime gesture. Do not render it in static
  frames.
- `SessionDetailScreen` is READ-ONLY. Set numbers use neutral gray
  outlines, never filled black circles — that treatment belongs to
  Active Workout.
- Session Detail shows a four-metric strip: Volume, Sets, Reps, Time.
- Header on Session Detail has no centered title. The routine name
  appears in the content as the primary heading.

## Do not

- Do not add thumbnails, day badges, or circular date icons.
- Do not add a calendar view.
- Do not add "Load more" — infinite scroll is the pattern.
- Do not show a PR badge on every PR row. It appears only when the
  record was set within the last 30 days.
