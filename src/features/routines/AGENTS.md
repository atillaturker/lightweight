# AGENTS.md — Routines feature

Routine CRUD and exercise picker. Three screens.

## Screens

- `RoutinesScreen` — list of routines with active one marked.
- `RoutineEditorScreen` — edit routine name, exercise list, targets.
- `ExercisePickerScreen` — search, filter, select exercises.

## Rules

- The **active routine** is the one the Today screen will start next.
  Only one routine is active at a time. Finishing a workout advances it
  to the routine after the one trained, in list order, skipping archived
  routines and wrapping to the first (`routineAfter` in the workout
  feature). Marked with a 6px `colors.accent` dot
  next to the chevron. Never with a badge or pill.
- Routines with historical sessions attached cannot be deleted —
  archive them instead. This preserves history integrity.
- The estimated duration is computed as:
  `exercises × sets × 2.5 min + 10 min warmup`.
  Do not use a real timer.
- Routine editor is a working editor. Target cell (`3 × 8`) is tappable
  and opens a bottom sheet. The name is inline-editable via a pencil
  affordance. Rows drag-reorder via the grip handle on the right.
- The library is large (~1,170 exercises): exercise lists are
  virtualized (`FlatList`) with memoized rows. Never render the whole
  library in a `ScrollView`.
- Exercise picker is PICKER MODE only in this feature. The same layout
  becomes Library mode when opened from Profile — different header,
  different tap behavior.
- Exercise rows in the picker and the routine editor lead with
  `ExerciseThumb`: the exercise illustration (DESIGN.md §9), or an empty
  tile when there is none. Do not fall back to the muscle icon there.
  Never substitute with `@expo/vector-icons`.

## Custom exercises

- Created from the picker ("Create exercise", prefilled with the search
  text) on `CustomExerciseScreen`; the new exercise comes back selected.
- Stored in `useCustomExerciseStore` (per account, see `userScope.ts`),
  ids prefixed `custom-`, mirrored to Firestore through the
  `syncCustomExerciseToCloud` seam. Never deleted, only archived:
  Exercise Detail's "⋯" offers Archive / Restore for custom exercises
  (built-ins have no options menu). Archived ones leave the picker but
  keep naming their logged sets.
- Leaving a new routine without "Create routine" discards it if it has
  no exercises (`beforeRemove` in the editor), so no empty routines pile
  up.
- Screens read the library through `useExerciseLibrary()`: `pickable`
  (active custom exercises first, then built-ins) and `byId` (archived
  included). Never read `EXERCISE_LIBRARY` directly in a screen.

## Exercise notes

One note per exercise id (not per routine slot) in
`useExerciseNoteStore`: trimmed, at most `EXERCISE_NOTE_MAX_LENGTH`
characters, removed when saved blank. Per account (`userScope.ts`) and
local-only for now, like routines. Edited from Active Workout's
exercise options.

## Progression

A routine's `progression` (No progression / Linear / Double progression)
is chosen from the editor's meta line. It only affects how Active
Workout seeds sets; the rules and their reasons live in
`@domain/rules/progression`.

## Weekly plan

A routine's `days` (the editor's DAYS chips, `Date.getDay()` numbers)
put it on the weekly plan; its list meta line shows them
(`routineMeta`). On a weekday claimed by two routines, the first in
list order wins. Moving one session (`moveScheduledSession`) records a
one-off change for those two dates in `scheduleOverrides` (keyed
`YYYY-MM-DD`, `null` = rest) and never edits `days`; a move onto a
planned day swaps the two. Overrides older than
`OVERRIDE_RETENTION_DAYS` are pruned on the next move. The rules live in
`@domain/rules/schedule`. Like routines, the plan is local-only.

## Supersets

A superset is a run of consecutive slots sharing `supersetGroup` (stored
as a letter: A, B…; labeled A1, A2 in the UI). Built from the target
sheet ("Superset with next", "Remove from superset"). Every list
mutation goes through `reindex`, which calls `normalizeSupersets`, so a
reorder or removal never leaves a broken group (lone members are
cleared, runs relabeled in order).

## Set targets

Target format: `<sets> × <reps>`; timed exercises use `<sets> × <seconds>s`
(`RoutineExercise.targetSeconds`) and per-side ones `<sets> × <reps> / side`. Freeform. Only a suggestion — Active
Workout does not enforce it.

## Do not

- Do not add drag handles outside the Routine Editor.
- Do not add "recommended for you" suggestions.
- Do not add routine categories, tags, or folders.
- Do not auto-generate routines from workout history.
- Do not show swipe actions on the Routines list in a static frame —
  swipe reveal is a runtime gesture, not a default state.
