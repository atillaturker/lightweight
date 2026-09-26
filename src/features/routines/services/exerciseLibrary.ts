/**
 * The built-in exercise library and the exercises each starter routine
 * materialises.
 *
 * This module is the concrete source behind the workout feature's
 * {@link ExerciseLibraryProvider} seam. Routines reference exercises by
 * id, and the active-workout store resolves those ids against the
 * library to build the exercise blocks the set table renders. Until a
 * real library is registered and the templates reference real ids, every
 * routine resolves to zero blocks — the empty Active Workout screen.
 *
 * Ids are stable slugs (`bench-press`) because they are the identity an
 * exercise keeps across sessions: history and personal records are keyed
 * on them. `pictogramId` names the SVG sprite key the design system uses,
 * authored on the shared 24-unit grid.
 *
 * Static and in-memory by design — no I/O, no network. A later library
 * batch can register a user-extended provider through
 * `setExerciseLibraryProvider` without touching this list.
 */
import type { Exercise } from '@domain/entities';

import type { RoutineTemplateId } from '@features/onboarding/types';

/** Fixed creation stamp so the catalog is deterministic across runs. */
const LIBRARY_EPOCH = 1_700_000_000_000;

/** Build one library entry, filling the fields that never vary here. */
function exercise(
  id: string,
  name: string,
  muscleGroup: Exercise['muscleGroup'],
  equipment: Exercise['equipment'],
): Exercise {
  return {
    id,
    name,
    muscleGroup,
    equipment,
    pictogramId: `ex-${id}`,
    isCustom: false,
    isArchived: false,
    createdAt: LIBRARY_EPOCH,
  };
}

/**
 * Every exercise the app ships with, grouped by muscle group. Routine
 * order is decided by the routine, never by this list.
 */
export const EXERCISE_LIBRARY: Exercise[] = [
  // Chest
  exercise('bench-press', 'Bench Press', 'chest', 'barbell'),
  exercise('incline-bench-press', 'Incline Bench Press', 'chest', 'barbell'),
  exercise('dumbbell-fly', 'Dumbbell Fly', 'chest', 'dumbbell'),
  exercise('cable-crossover', 'Cable Crossover', 'chest', 'cable'),
  exercise('push-up', 'Push-up', 'chest', 'bodyweight'),

  // Back
  exercise('deadlift', 'Deadlift', 'back', 'barbell'),
  exercise('barbell-row', 'Barbell Row', 'back', 'barbell'),
  exercise('pull-up', 'Pull Up', 'back', 'bodyweight'),
  exercise('lat-pulldown', 'Lat Pulldown', 'back', 'cable'),
  exercise('seated-cable-row', 'Seated Cable Row', 'back', 'cable'),

  // Legs
  exercise('back-squat', 'Back Squat', 'legs', 'barbell'),
  exercise('romanian-deadlift', 'Romanian Deadlift', 'legs', 'barbell'),
  exercise('leg-press', 'Leg Press', 'legs', 'machine'),
  exercise('leg-curl', 'Leg Curl', 'legs', 'machine'),
  exercise('leg-extension', 'Leg Extension', 'legs', 'machine'),
  exercise('calf-raise', 'Calf Raise', 'legs', 'machine'),
  exercise('bulgarian-split-squat', 'Bulgarian Split Squat', 'legs', 'dumbbell'),

  // Shoulders
  exercise('overhead-press', 'Overhead Press', 'shoulders', 'barbell'),
  exercise(
    'dumbbell-shoulder-press',
    'Dumbbell Shoulder Press',
    'shoulders',
    'dumbbell',
  ),
  exercise('lateral-raise', 'Lateral Raise', 'shoulders', 'dumbbell'),
  exercise('face-pull', 'Face Pull', 'shoulders', 'cable'),

  // Arms
  exercise('barbell-curl', 'Barbell Curl', 'arms', 'barbell'),
  exercise('dumbbell-curl', 'Dumbbell Curl', 'arms', 'dumbbell'),
  exercise('hammer-curl', 'Hammer Curl', 'arms', 'dumbbell'),
  exercise('tricep-pushdown', 'Tricep Pushdown', 'arms', 'cable'),
  exercise('skullcrusher', 'Skullcrusher', 'arms', 'barbell'),
  exercise(
    'overhead-tricep-extension',
    'Overhead Tricep Extension',
    'arms',
    'dumbbell',
  ),
  exercise('dip', 'Dip', 'arms', 'bodyweight'),
];

/**
 * Ordered exercise ids for each starter template. Every id resolves
 * against {@link EXERCISE_LIBRARY}; the routines store turns each entry
 * into a slot with the shared default set/rep targets.
 */
export const TEMPLATE_EXERCISE_IDS: Record<RoutineTemplateId, string[]> = {
  ppl: [
    // Push
    'bench-press',
    'incline-bench-press',
    'overhead-press',
    'dumbbell-shoulder-press',
    'tricep-pushdown',
    'lateral-raise',
    // Pull
    'deadlift',
    'barbell-row',
    'pull-up',
    'lat-pulldown',
    'seated-cable-row',
    'dumbbell-curl',
    // Legs
    'back-squat',
    'romanian-deadlift',
    'leg-press',
    'leg-curl',
    'leg-extension',
    'calf-raise',
  ],
  'upper-lower': [
    'bench-press',
    'barbell-row',
    'overhead-press',
    'pull-up',
    'barbell-curl',
    'tricep-pushdown',
    'back-squat',
    'romanian-deadlift',
    'leg-press',
    'leg-curl',
    'lateral-raise',
    'calf-raise',
  ],
  'full-body': [
    'back-squat',
    'bench-press',
    'barbell-row',
    'overhead-press',
    'romanian-deadlift',
    'pull-up',
    'dumbbell-curl',
    'tricep-pushdown',
    'leg-press',
    'lat-pulldown',
    'lateral-raise',
    'calf-raise',
    'hammer-curl',
    'skullcrusher',
    'dip',
  ],
};
