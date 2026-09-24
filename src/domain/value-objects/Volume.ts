import type { Set } from '../entities/Set';

/**
 * Aggregated training volume for a collection of sets.
 * Volume is Σ (weightKg × reps) over completed working sets.
 */
export interface VolumeSummary {
  /** Total volume in kilograms. */
  total: number;
  /** Working sets (excludes warmup). */
  sets: number;
  reps: number;
  /** Volume per exercise id. */
  perExercise: Record<string, number>;
}

/**
 * A set counts toward volume when it is completed and not a warmup.
 */
export function isVolumeSet(set: Set): boolean {
  return set.completed && set.type !== 'warmup';
}
