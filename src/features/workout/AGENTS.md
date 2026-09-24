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
- Network failures on set log enqueue via `useOfflineQueue`.
  Do not throw to the user.
- Leaving ActiveWorkoutScreen without finishing opens a bottom sheet:
  Finish / Discard / Keep training. Never silently close.

## Critical components

- `SetRow` — column alignment depends on `tabular-nums`.
- `RestTimerBar` — thin line, never an overlay card.
- `ExerciseBlock` — holds all sets for one exercise.
- `PRBadge` — appears for 3 seconds, then fades. No modal, no sound.

## Set model

Set types: `normal | warmup | drop | failure`.
Warmup sets are excluded from volume everywhere.
Set numbers auto-fill from the previous set. First set of an exercise
inherits from the same set index in the previous session.

## Do not

- Do not add a "Save" or "Done" button inside ActiveWorkout.
- Do not show a modal for PR achievements. Inline badge only.
- Do not block the keyboard while typing weight or reps.
- Do not use filled black circles for read-only historical views —
  those are neutral gray outlines.
- Do not compute volume or e1RM inline. Use `@domain/rules/`.
