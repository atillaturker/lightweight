/**
 * Discriminates the intent of a logged set.
 * `warmup` sets are excluded from volume and never count as PRs.
 */
export type SetType = 'normal' | 'warmup' | 'drop' | 'failure';

/**
 * A single logged set belonging to a workout.
 */
export interface Set {
  id: string;
  exerciseId: string;
  workoutId: string;
  /** Always kilograms — unit conversion happens at the UI edge. */
  weightKg: number;
  reps: number;
  type: SetType;
  completed: boolean;
  /** Perceived exertion, 1-10. Optional. */
  rpe?: number;
  note?: string;
  completedAt: number | null;
  /** Position within its exercise. */
  order: number;
  /**
   * Whether this set achieved a personal record when it was logged.
   *
   * Computed against the user's full session history at finish time and
   * persisted, so read-only views never have to replay detection (which,
   * against a session alone, marks the first working set of every exercise
   * as a record). Optional because sessions recorded before this flag
   * existed carry no value.
   */
  isPR?: boolean;
}
