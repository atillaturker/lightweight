/**
 * A planned exercise slot inside a routine.
 */
export interface RoutineExercise {
  exerciseId: string;
  targetSets: number;
  targetReps: number;
  order: number;
  /** Superset label, e.g. "A1", "A2". Undefined for straight sets. */
  supersetGroup?: string;
}

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
   * User-set duration override in minutes. When undefined, the editor
   * uses the calculated estimate.
   */
  estimatedMinutes?: number;
}
