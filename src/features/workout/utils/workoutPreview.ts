/**
 * Reference-frame data for the Active Workout screen.
 *
 * The design specifies three static frames — default, keyboard-open, and
 * PR-achieved. The live screen reaches the default frame on its own, but
 * the other two require having logged sets by hand, which makes them slow
 * to review. This module supplies a placeholder session and a pure
 * transform for the PR frame so both can be rendered on demand.
 *
 * Nothing here is reachable without an explicit `preview` prop, so a real
 * session can never be replaced by this data.
 */
import type { ActiveExercise, ActiveSet, ActiveWorkoutPreview } from '../types';

/** Sets in the placeholder block, matching the frame's four rows. */
const PREVIEW_SET_COUNT = 4;

/** Sets shown as completed in the PR frame: rows 1-3, with row 4 active. */
const PR_COMPLETED_SETS = 3;

/** Weight and reps the placeholder rows are seeded with. */
const PREVIEW_WEIGHT_KG = 80;
const PREVIEW_REPS = 8;

/** Build one pending placeholder set. */
function previewSet(id: string, overrides: Partial<ActiveSet> = {}): ActiveSet {
  return {
    id,
    weightKg: PREVIEW_WEIGHT_KG,
    reps: PREVIEW_REPS,
    type: 'normal',
    completed: false,
    completedAt: null,
    isPR: false,
    ...overrides,
  };
}

/**
 * A two-exercise placeholder session. The second block exists so the
 * frame shows the next exercise beginning below the fold.
 */
export const PREVIEW_EXERCISES: ActiveExercise[] = [
  {
    exerciseId: 'preview-bench',
    name: 'Bench Press',
    pictogramId: 'ex-bench-press',
    order: 0,
    sets: Array.from({ length: PREVIEW_SET_COUNT }, (_, index) =>
      previewSet(`preview-bench-${index}`),
    ),
  },
  {
    exerciseId: 'preview-incline',
    name: 'Incline Dumbbell Press',
    pictogramId: 'ex-incline-press',
    order: 1,
    sets: Array.from({ length: 3 }, (_, index) =>
      previewSet(`preview-incline-${index}`, { weightKg: 30, reps: 10 }),
    ),
  },
];

/** History line the PR frame shows under the exercise title. */
export const PREVIEW_LAST_TIME = 'Last time · 80kg × 8, 8, 7';

/**
 * Mark the leading sets of the first block completed and flag the last of
 * them as a record, so the PR pill and the following active row both
 * render — exactly the PR frame's state.
 */
export function applyPRFrame(exercises: ActiveExercise[]): ActiveExercise[] {
  return exercises.map((block, blockIndex) => {
    if (blockIndex !== 0) return block;

    return {
      ...block,
      sets: block.sets.map((set, setIndex) => {
        if (setIndex >= PR_COMPLETED_SETS) return set;
        return {
          ...set,
          completed: true,
          completedAt: 1_700_000_000_000 + setIndex,
          isPR: setIndex === PR_COMPLETED_SETS - 1,
        };
      }),
    };
  });
}

/**
 * Resolve the exercise list to render for a frame. The live screen passes
 * `undefined` and gets its data back untouched.
 */
export function resolveFrameExercises(
  live: ActiveExercise[],
  preview: ActiveWorkoutPreview | undefined,
): ActiveExercise[] {
  if (preview === undefined) return live;
  return preview === 'pr' ? applyPRFrame(PREVIEW_EXERCISES) : PREVIEW_EXERCISES;
}
