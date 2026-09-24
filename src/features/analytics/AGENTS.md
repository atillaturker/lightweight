# AGENTS.md — Analytics feature

Progress, Exercise Detail, Session Detail. Read-only screens.
Pure computation sourced from `@domain/rules/`.

## Rules

- All calculations live in `@domain/rules/`. Zero math inside this feature.
- e1RM always uses `@domain/rules/e1rm.ts` (Epley formula).
- Warmup sets are excluded from volume (`Set.type !== 'warmup'`).
- Delta computation returns `null` when no comparison data exists —
  never `0`. The UI hides the delta line on `null`.
- Negative delta uses `#6B7280`, not `#EF4444`. A dip in training is
  not an error state.
- Filtering for delta lists: only exercises with 3+ sessions appear.
  Fewer sessions produce misleading percentages.

## Chart rules

- Y-axis: minimum labels (2-3 values). Never one label per data point.
- Single highlight per chart: one 6px `#3B82F6` circle.
- No chart container card. Charts sit directly on white.
- Chart height: 180px. Never taller.
- X-axis: exactly three labels (left, center, right). No more.
- Bar charts: current period `#111111`, previous period `#E5E7EB`,
  4px wide bars, 2px top corner radius.

## Screens

- `ProgressScreen` — hero metric, chart, PR strip, exercise list.
- `ExerciseDetailScreen` — hero e1RM, line chart, PRs, recent sets.
- `SessionDetailScreen` — read-only session record, four-metric strip,
  exercise blocks with neutral set numbers.

## Do not

- Do not add KPI grids, donut charts, or heatmaps.
- Do not use `#EF4444` for negative deltas.
- Do not wrap charts in cards.
- Do not add legends or legend swatches.
- Do not use `tabular-nums` inconsistently — every numeric value in a
  stat strip or table uses it.
