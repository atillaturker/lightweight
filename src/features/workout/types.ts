/**
 * Types for the workout feature.
 *
 * `ActiveSet` and `ActiveExercise` describe the session currently being
 * logged. They differ from the domain `Set` entity on purpose: an active
 * set carries an `isPR` flag that only means something while the session
 * is open, and it has no `workoutId`/`order` because those are derived
 * once the session finishes.
 */
import type { SetType } from '@domain/entities';

/** One set of the in-progress session. */
export interface ActiveSet {
  id: string;
  weightKg: number;
  reps: number;
  type: SetType;
  completed: boolean;
  /** Perceived exertion, 1-10. Optional. */
  rpe?: number;
  completedAt: number | null;
  /** Set by PR detection once the set is completed. */
  isPR: boolean;
}

/** One exercise block of the in-progress session. */
export interface ActiveExercise {
  exerciseId: string;
  /** Snapshot of the exercise name at the time the session started. */
  name: string;
  pictogramId: string;
  order: number;
  sets: ActiveSet[];
}

/**
 * Design-reference frame selector for the Active Workout screen.
 * `undefined` is the live screen; the other values exist so the three
 * specified frames can be reviewed without logging sets by hand.
 */
export type ActiveWorkoutPreview = 'default' | 'keyboard' | 'pr';

/** Which numeric cell of a set row is focused. */
export type NumericField = 'weight' | 'reps';

/** Identifies the currently focused numeric cell. */
export interface FocusedCell {
  setId: string;
  field: NumericField;
}
