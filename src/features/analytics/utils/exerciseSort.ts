/**
 * Orderings for Progress → "By exercise". The Sort action cycles through
 * them; the default is the most improved first.
 */
import type { ExerciseProgressRow } from './progressData';

/** How the exercise rows are ordered. */
export type ExerciseSortMode = 'improved' | 'volume' | 'name';

/** Cycle order of the Sort action. */
export const EXERCISE_SORT_MODES: readonly ExerciseSortMode[] = ['improved', 'volume', 'name'];

/** Label shown on the Sort action for each mode. */
export const EXERCISE_SORT_LABELS: Record<ExerciseSortMode, string> = {
  improved: 'Improved',
  volume: 'Volume',
  name: 'A–Z',
};

/** The mode after `mode` in the cycle. */
export function nextSortMode(mode: ExerciseSortMode): ExerciseSortMode {
  const index = EXERCISE_SORT_MODES.indexOf(mode);
  return EXERCISE_SORT_MODES[(index + 1) % EXERCISE_SORT_MODES.length];
}

/**
 * Rows in the requested order, as a new array. Rows without a delta sort
 * last when ordering by improvement.
 */
export function sortExerciseRows(
  rows: ExerciseProgressRow[],
  mode: ExerciseSortMode,
): ExerciseProgressRow[] {
  const sorted = [...rows];
  switch (mode) {
    case 'improved':
      return sorted.sort((a, b) => (b.deltaPercent ?? -Infinity) - (a.deltaPercent ?? -Infinity));
    case 'volume':
      return sorted.sort((a, b) => b.volumeShare - a.volumeShare);
    case 'name':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
  }
}
