# AGENTS.md — Routines feature

Routine CRUD and exercise picker. Three screens.

## Screens

- `RoutinesScreen` — list of routines with active one marked.
- `RoutineEditorScreen` — edit routine name, exercise list, targets.
- `ExercisePickerScreen` — search, filter, select exercises.

## Rules

- The **active routine** is the one the Today screen will start next.
  Only one routine is active at a time. Marked with a 6px `#3B82F6` dot
  next to the chevron. Never with a badge or pill.
- Routines with historical sessions attached cannot be deleted —
  archive them instead. This preserves history integrity.
- The estimated duration is computed as:
  `exercises × sets × 2.5 min + 10 min warmup`.
  Do not use a real timer.
- Routine editor is a working editor. Target cell (`3 × 8`) is tappable
  and opens a bottom sheet. The name is inline-editable via a pencil
  affordance. Rows drag-reorder via the grip handle on the right.
- Exercise picker is PICKER MODE only in this feature. The same layout
  becomes Library mode when opened from Profile — different header,
  different tap behavior.
- Every exercise has a pictogram. Pictograms are monoline SVGs defined
  in `assets/pictograms/`. Never substitute with `@expo/vector-icons`.

## Set targets

Target format: `<sets> × <reps>`. Freeform. Only a suggestion — Active
Workout does not enforce it.

## Do not

- Do not add drag handles outside the Routine Editor.
- Do not add "recommended for you" suggestions.
- Do not add routine categories, tags, or folders.
- Do not auto-generate routines from workout history.
- Do not show swipe actions on the Routines list in a static frame —
  swipe reveal is a runtime gesture, not a default state.
