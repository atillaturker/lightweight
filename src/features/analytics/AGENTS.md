# AGENTS.md — Analytics feature

Progress, Exercise Detail, Session Detail. Read-only screens.
Pure computation sourced from `@domain/rules/`. Chart visuals follow
`/DESIGN.md` §5 (tokens, chart types, rules); this file adds only
analytics-specific behavior.

## Rules

- All calculations live in `@domain/rules/`. Zero math inside this feature.
- e1RM always uses `@domain/rules/e1rm.ts` (Epley formula).
- Warmup sets are excluded from volume (`Set.type !== 'warmup'`).
- Delta computation returns `null` when no comparison data exists —
  never `0`. The UI hides the delta line on `null`.
- Negative delta uses `colors.textMuted`, not `colors.error`. A dip in
  training is not an error state.
- Filtering for delta lists: only exercises with 3+ sessions appear.
  Fewer sessions produce misleading percentages.

## Chart behavior

- Every chart is fed by a pure series builder in `utils/` that is unit
  tested; components only draw.
- Empty and sparse data: fewer than 2 points shows the empty state, not
  a one-point line. Effort charts need at least 5 rated sets in range.
- Time ranges come from one shared range type so every chart's
  SegmentedControl offers the same options.
- Activity heatmaps and muscle maps shade by the intensity scale and
  always expose the exact value on tap.

## Screens

- `ProgressScreen` — hero metric, chart, PR strip, exercise list.
- `ExerciseDetailScreen` — hero e1RM, line chart, PRs, recent sets.
- `SessionDetailScreen` — read-only session record, four-metric strip,
  exercise blocks with neutral set numbers.

## Do not

- Do not use `colors.error` for negative deltas.
- Do not wrap a chart in a card of its own.
- Do not show a chart without the number it is about.
- Do not use `tabular-nums` inconsistently — every numeric value in a
  stat strip, table or axis uses it.
