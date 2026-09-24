/**
 * Coarse muscle grouping used for filtering and analytics roll-ups.
 */
export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'legs'
  | 'shoulders'
  | 'arms';

/**
 * Equipment required to perform an exercise.
 */
export type Equipment =
  | 'barbell'
  | 'dumbbell'
  | 'cable'
  | 'machine'
  | 'bodyweight';

/**
 * A trainable movement in the exercise library.
 */
export interface Exercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  equipment: Equipment;
  /** Key for the SVG sprite, e.g. "ex-bench-press". */
  pictogramId: string;
  isCustom: boolean;
  isArchived: boolean;
  createdAt: number;
}
