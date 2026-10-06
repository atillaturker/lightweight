# AGENTS.md — Workout feature

The core logging flow. This is the heart of the product. Zero tolerance
for data loss or UI blocking. A dropped set is a broken product.

## Screens

- `HomeTodayScreen` — daily brief, Resume CTA if an active session exists.
- `ActiveWorkoutScreen` — set table, focused mode (no tab bar).
- `WorkoutSummaryScreen` — session end, conditional PR section.

## Rules

- Active workout state is persisted to MMKV on every mutation.
  There is NO "save" button. Every set log writes immediately.
- Never mutate `activeWorkoutStore` from outside its hooks.
  Access via `useActiveWorkout()`, `useSetLogger()`, `useRestTimer()`.
- After logging a set, schedule PR detection with
  `InteractionManager.runAfterInteractions`. Never block UI.
- Set logging never touches the network. A finished session is written
  to local history first, then mirrored to Firestore through the
  history feature's cloud seam, which queues on failure. Do not throw
  to the user.
- Finishing a session rotates the active routine to the next one in the
  list (`useWorkoutActions.finish` → `routineAfter`). Discarding does not.
- Leaving ActiveWorkoutScreen without finishing opens a bottom sheet:
  Finish / Discard / Keep training. Never silently close.

## Critical components

- `SetRow` — column alignment depends on `tabular-nums`.
- Rest timer — a thin line driven by `useRestTimerLine`, never an
  overlay card.
- `ExerciseBlock` — holds all sets for one exercise.
- PR marker — `Badge variant="pr"` in the `ExerciseBlock` title. No
  modal, no sound. Spec: appears for 3 seconds, then fades (NOT yet
  implemented; the badge currently stays).

## RPE and screen lock

- The set table shows an RPE column only while the "RPE field"
  preference is on (read through `getRpeEnabled()`). RPE is optional per
  set, rated 1–10 in half steps (`isValidRpe`); an unrated cell shows
  `EMPTY_CELL` and "Next" walks weight → reps → RPE.
- While a live session is open, `KeepScreenAwake` (expo-keep-awake)
  stops the phone from locking. It is not rendered in preview frames.

## Exercise kinds

Each block snapshots how its exercise is logged when the session starts
(`measure`, `perSide`, `bodyweight` on `ActiveExercise`):

- Timed (`measure: 'time'`): the second column is **Time** (field
  `duration`, whole seconds, shown as `m:ss`); reps stay 0. Sets seed
  from the last session, else the slot's `targetSeconds`, else
  `DEFAULT_HOLD_SECONDS`.
- Bodyweight (equipment `bodyweight`): weight is added load, headed
  **+kg**; 0 means none.
- Per side: reps are per side (**Reps/side**); the set carries
  `perSide: true` and volume counts both sides.

Active sets become domain sets only through `toDomainSet`, used by both
PR detection and finishing.

## Supersets

Blocks carry the slot's `supersetGroup`. A run of consecutive blocks with
the same group is logged round by round (A1 set 1, A2 set 1, A1 set 2…):
`logicalSetOrder` drives "Log set" and "Next", and `shouldRestAfter`
starts rest only after the last member of a round. Blocks show "A1",
"A2" before the title.

## Set model

Set types: `normal | warmup | drop | failure`.
Warmup sets are excluded from volume everywhere.
Set numbers auto-fill from the previous set. First set of an exercise
inherits from the same set index in the previous session.

## Do not

- Do not add a "Save" or "Done" button inside ActiveWorkout.
- Do not show a modal for PR achievements. Inline badge only.
- Do not block the keyboard while typing weight or reps.
- Do not use filled `colors.primary` circles for read-only historical views —
  those are neutral gray outlines.
- Do not compute volume or e1RM inline. Use `@domain/rules/`.
