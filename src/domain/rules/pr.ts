import type { Set } from '../entities/Set';
import { calculateE1RM, isE1RMEligible, isWorkingSet } from './e1rm';
import { isTimedSet } from './exerciseKind';

/**
 * The kinds of personal record tracked by the app.
 * `best_session_volume` is only detected after a session ends and is never
 * returned by `detectPRs`.
 */
export type PRType =
  | 'heaviest_set'
  | 'best_1rm'
  | 'most_reps'
  | 'longest_hold'
  | 'best_session_volume';

/**
 * A single personal-record achievement.
 */
export interface PRRecord {
  type: PRType;
  exerciseId: string;
  /**
   * Kilograms for weight-based records, reps for `most_reps`, seconds for
   * `longest_hold`.
   */
  value: number;
  /** For `heaviest_set`: reps achieved at that weight. */
  repsAtWeight?: number;
  achievedAt: number;
}

/** Highest weight among historical working sets, or 0 when there are none. */
function maxWeight(history: Set[]): number {
  let max = 0;
  for (const set of history) {
    if (isWorkingSet(set)) {
      max = Math.max(max, set.weightKg);
    }
  }
  return max;
}

/** Highest Epley estimate among historical eligible sets, or 0 when none. */
function maxE1RM(history: Set[]): number {
  let max = 0;
  for (const set of history) {
    if (isE1RMEligible(set)) {
      max = Math.max(max, calculateE1RM(set.weightKg, set.reps));
    }
  }
  return max;
}

/**
 * Highest reps ever performed at a weight at least as heavy as `weightKg`.
 * Returns 0 when no historical working set meets the weight threshold.
 */
function maxRepsAtLeastWeight(history: Set[], weightKg: number): number {
  let max = 0;
  for (const set of history) {
    if (isWorkingSet(set) && set.weightKg >= weightKg) {
      max = Math.max(max, set.reps);
    }
  }
  return max;
}

/** Longest hold among historical timed working sets, or 0 when none. */
function maxDuration(history: Set[]): number {
  let max = 0;
  for (const set of history) {
    if (isWorkingSet(set) && isTimedSet(set)) {
      max = Math.max(max, set.durationSec ?? 0);
    }
  }
  return max;
}

/** A timed set's only record: holding longer than ever before. */
function detectTimedPRs(history: Set[], newSet: Set): PRRecord[] {
  const seconds = newSet.durationSec ?? 0;
  if (seconds <= maxDuration(history)) return [];
  return [
    {
      type: 'longest_hold',
      exerciseId: newSet.exerciseId,
      value: seconds,
      achievedAt: newSet.completedAt ?? 0,
    },
  ];
}

/**
 * Given historical sets for an exercise and a new set,
 * return the PRs the new set achieves. Empty array if none.
 * Warmup sets never count.
 *
 * Timed sets only compete with timed sets, for `longest_hold`; the rep
 * and weight records ignore timed history.
 *
 * - `heaviest_set` — a strictly heavier completed working set.
 * - `best_1rm` — a strictly higher Epley estimate, from a set of at most
 *   `E1RM_MAX_REPS` reps.
 * - `most_reps` — more reps than any prior working set at an equal or
 *   heavier weight (not a naive global rep maximum).
 */
export function detectPRs(allHistory: Set[], newSet: Set): PRRecord[] {
  if (!isWorkingSet(newSet)) {
    return [];
  }
  if (isTimedSet(newSet)) {
    return detectTimedPRs(allHistory, newSet);
  }
  const historicalSets = allHistory.filter((set) => !isTimedSet(set));
  const records: PRRecord[] = [];
  const achievedAt = newSet.completedAt ?? 0;

  if (newSet.weightKg > maxWeight(historicalSets)) {
    records.push({
      type: 'heaviest_set',
      exerciseId: newSet.exerciseId,
      value: newSet.weightKg,
      repsAtWeight: newSet.reps,
      achievedAt,
    });
  }

  if (
    isE1RMEligible(newSet) &&
    calculateE1RM(newSet.weightKg, newSet.reps) > maxE1RM(historicalSets)
  ) {
    records.push({
      type: 'best_1rm',
      exerciseId: newSet.exerciseId,
      value: calculateE1RM(newSet.weightKg, newSet.reps),
      repsAtWeight: newSet.reps,
      achievedAt,
    });
  }

  const priorReps = maxRepsAtLeastWeight(historicalSets, newSet.weightKg);
  if (newSet.reps > priorReps) {
    records.push({
      type: 'most_reps',
      exerciseId: newSet.exerciseId,
      value: newSet.reps,
      repsAtWeight: newSet.reps,
      achievedAt,
    });
  }

  return records;
}

/** Order sets chronologically, falling back to insertion order. */
function chronologically(sets: Set[]): Set[] {
  return sets
    .map((set, index) => ({ set, index }))
    .sort((a, b) => {
      const at = a.set.completedAt ?? Infinity;
      const bt = b.set.completedAt ?? Infinity;
      return at === bt ? a.index - b.index : at - bt;
    })
    .map((entry) => entry.set);
}

/** Keep the record with the higher value for each PR type. */
function mergeRecord(best: Map<PRType, PRRecord>, record: PRRecord): void {
  const current = best.get(record.type);
  if (current === undefined || record.value > current.value) {
    best.set(record.type, record);
  }
}

/**
 * Return all-time PR records for one exercise, one per PR type.
 * `best_session_volume` is excluded — it requires a finished session.
 * Returns an empty array if the exercise has no valid history.
 */
export function bestRecordsForExercise(sets: Set[]): PRRecord[] {
  const ordered = chronologically(sets);
  const best = new Map<PRType, PRRecord>();
  const history: Set[] = [];
  for (const set of ordered) {
    for (const record of detectPRs(history, set)) {
      if (record.type !== 'best_session_volume') {
        mergeRecord(best, record);
      }
    }
    if (isWorkingSet(set)) {
      history.push(set);
    }
  }
  return Array.from(best.values());
}
