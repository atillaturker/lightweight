/**
 * A planned exercise slot inside a routine.
 */
export interface RoutineExercise {
  exerciseId: string;
  targetSets: number;
  targetReps: number;
  /**
   * Suggested seconds per set for a timed exercise. Absent means
   * `DEFAULT_HOLD_SECONDS`; ignored for rep-based exercises.
   */
  targetSeconds?: number;
  order: number;
  /** Superset label, e.g. "A1", "A2". Undefined for straight sets. */
  supersetGroup?: string;
}

/**
 * How a routine moves exercises forward between sessions; the rules live
 * in `@domain/rules/progression`.
 */
export type ProgressionPolicy = 'off' | 'linear' | 'double';

/**
 * A reusable training template.
 */
export interface Routine {
  id: string;
  name: string;
  exercises: RoutineExercise[];
  createdAt: number;
  updatedAt: number;
  isArchived: boolean;
  /**
   * How exercises move forward between sessions. Absent means `off`:
   * sets repeat what was done last time.
   */
  progression?: ProgressionPolicy;
  /**
   * User-set duration override in minutes. When undefined, the editor
   * uses the calculated estimate.
   */
  estimatedMinutes?: number;
}
