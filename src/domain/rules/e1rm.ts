import type { Set } from '../entities/Set';
import type { E1RMResult } from '../value-objects/E1RM';

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
 * has at least one rep. A zero-rep set carries no work and has no e1RM,
 * so letting it through would make every e1RM caller throw.
 */
export function isWorkingSet(set: Set): boolean {
  return set.completed && set.type !== 'warmup' && set.reps >= 1;
}

/**
 * Find the best estimated 1RM across a list of sets.
 * Ignores warmup sets and uncompleted sets.
 * Returns null if no valid sets exist.
 */
export function bestE1RM(sets: Set[]): E1RMResult | null {
  let best: E1RMResult | null = null;
  for (const set of sets) {
    if (!isWorkingSet(set)) {
      continue;
    }
    const value = calculateE1RM(set.weightKg, set.reps);
    if (best === null || value > best.value) {
      best = { value, sourceSet: { weightKg: set.weightKg, reps: set.reps } };
    }
  }
  return best;
}
