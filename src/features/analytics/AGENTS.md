# AGENTS.md — Analytics feature

Progress, Exercise Detail, Session Detail. Read-only screens.
Pure computation sourced from `@domain/rules/`. Chart visuals follow
`/DESIGN.md` §5 (tokens, chart types, rules); this file adds only
analytics-specific behavior.

## Rules

- All calculations live in `@domain/rules/`. Zero math inside this feature.
- e1RM always uses `@domain/rules/e1rm.ts` (Epley formula), and only
  from sets of at most `E1RM_MAX_REPS` (12) reps (`isE1RMEligible`). The
  Exercise Detail hero names the set the estimate came from.
- Exercise Detail adapts to the exercise kind (`exerciseKind`): load →
  e1RM hero, 1RM/Volume/Reps; bodyweight → "Most reps" hero, Reps;
  timed → "Longest hold" hero, Hold. The read model returns the metrics
  offered and the one shown; display text lives in
  `utils/exerciseDetailFormat.ts`.
- Progress → "Muscles": the muscle map over the last week / month / 3
  months. Load per region comes from `@domain/rules/muscles` (a working
  set adds 1 to the exercise's target region, 0.5 to secondary ones;
  custom exercises fall back to their muscle group). Shading is relative
  to the most-trained region on the intensity scale; tapping a region
  shows its exact sets above the map; untrained regions are listed
  below. The figures are drawn for this app (`bodyMapShapes.ts`) — never
  copy body artwork from another project.
- The "Effort" metric (average RPE, `@domain/rules/effort.ts`) appears
  only once the exercise has a rated set. Unrated sets are skipped, never
  counted as zero.
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
