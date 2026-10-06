import type { Set } from '../entities/Set';
import { isWorkingSet } from './e1rm';

/** Lowest rating on the RPE scale. */
export const RPE_MIN = 1;

/** Highest rating on the RPE scale: no reps left in reserve. */
export const RPE_MAX = 10;

/** RPE is rated in half steps (7, 7.5, 8 …). */
export const RPE_STEP = 0.5;

/**
 * Whether `value` is a rating on the RPE scale: between
 * {@link RPE_MIN} and {@link RPE_MAX}, in steps of {@link RPE_STEP}.
 */
export function isValidRpe(value: number): boolean {
  if (!Number.isFinite(value) || value < RPE_MIN || value > RPE_MAX) return false;
  return Number.isInteger(value / RPE_STEP);
}

/** Whether a working set carries an RPE rating. */
function isRatedWorkingSet(set: Set): set is Set & { rpe: number } {
  return isWorkingSet(set) && set.rpe !== undefined;
}

/**
 * Mean RPE of the rated working sets, or `null` when none is rated.
 * Unrated sets are skipped rather than counted as zero, so turning the
 * RPE field on halfway through a session does not drag the average down.
 */
export function averageRpe(sets: Set[]): number | null {
  const rated = sets.filter(isRatedWorkingSet);
  if (rated.length === 0) return null;
  return rated.reduce((total, set) => total + set.rpe, 0) / rated.length;
}

/** Whether any working set carries an RPE rating. */
export function hasRpeData(sets: Set[]): boolean {
  return sets.some(isRatedWorkingSet);
}
