/**
 * Coarse muscle grouping used for filtering, analytics roll-ups, and the
 * shared `MuscleIcon` pictogram set.
 */
export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'legs'
  | 'shoulders'
  | 'arms'
  | 'core';

/**
 * Equipment required to perform an exercise.
 */
export type Equipment =
  | 'barbell'
  | 'dumbbell'
  | 'cable'
  | 'machine'
  | 'bodyweight'
  | 'kettlebell'
  | 'band';

/**
 * Where a built-in exercise's data came from, so it can be traced back
 * to (and refreshed from) its dataset.
 */
export interface ExerciseSource {
  dataset: string;
  id: string;
}

/**
 * A trainable movement in the exercise library.
 */
export interface Exercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  equipment: Equipment;
  /** Primary muscle in the dataset's vocabulary, e.g. "pectorals". */
  targetMuscle?: string;
  secondaryMuscles?: string[];
  /** Ordered how-to steps, in English. */
  instructions?: string[];
  source?: ExerciseSource;
  /** Key for the SVG sprite, e.g. "ex-bench-press". */
  pictogramId: string;
  isCustom: boolean;
  isArchived: boolean;
  createdAt: number;
}
