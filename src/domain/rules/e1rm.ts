import type { Set } from '../entities/Set';
import type { E1RMResult } from '../value-objects/E1RM';
import { isTimedSet } from './exerciseKind';

/**
 * Estimate 1RM using the Epley formula.
 * Single-rep sets return the raw weight.
 * Throws if reps <= 0 or weightKg < 0.
 */
export function calculateE1RM(weightKg: number, reps: number): number {
  if (reps <= 0) {
    throw new Error('reps must be positive');
  }
  if (weightKg < 0) {
    throw new Error('weightKg cannot be negative');
  }
  if (reps === 1) {
    return weightKg;
  }
  return weightKg * (1 + reps / 30);
}

/**
 * A set counts as a working set when it is completed, not a warmup, and
 * carries work: at least one rep, or for a timed set at least one second.
 * A zero-rep untimed set carries no work.
 */
export function isWorkingSet(set: Set): boolean {
  if (!set.completed || set.type === 'warmup') return false;
  return isTimedSet(set) ? (set.durationSec ?? 0) >= 1 : set.reps >= 1;
}

/**
 * Highest rep count an e1RM is estimated from. Rep-max formulas lose
 * accuracy fast beyond ~10–12 reps, so a 20-rep set would produce a
 * misleading number; such sets simply do not feed e1RM.
 */
export const E1RM_MAX_REPS = 12;

/**
 * Whether a set can produce an e1RM: an untimed working set of 1 to
 * {@link E1RM_MAX_REPS} reps.
 */
export function isE1RMEligible(set: Set): boolean {
  return (
    isWorkingSet(set) &&
    !isTimedSet(set) &&
    set.reps >= 1 &&
    set.reps <= E1RM_MAX_REPS
  );
}

/**
 * Find the best estimated 1RM across a list of sets, and the set it came
 * from. Only e1RM-eligible sets count ({@link isE1RMEligible}).
 * Returns null if no eligible set exists.
 */
export function bestE1RM(sets: Set[]): E1RMResult | null {
  let best: E1RMResult | null = null;
  for (const set of sets) {
    if (!isE1RMEligible(set)) {
      continue;
    }
    const value = calculateE1RM(set.weightKg, set.reps);
    if (best === null || value > best.value) {
      best = { value, sourceSet: { weightKg: set.weightKg, reps: set.reps } };
    }
  }
  return best;
}
