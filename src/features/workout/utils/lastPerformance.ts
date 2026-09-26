/**
 * Display helpers for "last time" and exercise-block subtitles.
 *
 * Reads the exercise history provider and reduces the most recent session
 * into the single line shown under an exercise title, e.g.
 * `Last time · 80kg × 8, 8, 7`. Returns `null` when the exercise has no
 * history, so the caller hides the line rather than printing a placeholder.
 */
import type { Set } from '@domain/entities';
import { formatWeightKg } from '@lib/format';

/** Reps performed, in order, for one exercise in one session. */
const HISTORY_LIMIT = 24;

/**
 * Keep only the most recently completed sets belonging to the last
 * session that logged this exercise.
 */
function lastSessionSets(sets: Set[]): Set[] {
  const completed = sets
    .filter((set) => set.completed)
    .slice(-HISTORY_LIMIT);
  if (completed.length === 0) return [];

  const lastWorkoutId = completed.at(-1)?.workoutId ?? '';
  return completed.filter((set) => set.workoutId === lastWorkoutId);
}

/**
 * `80kg × 8, 8, 7` for the last session, or `null` when there is no
 * history. Warmup sets are included here — this line describes what was
 * actually performed, not what counted toward volume.
 */
export function summarizeLastPerformance(history: Set[]): string | null {
  const sets = lastSessionSets(history);
  const first = sets[0];
  if (first === undefined) return null;

  const reps = sets.map((set) => String(set.reps)).join(', ');
  return `${formatWeightKg(first.weightKg)}kg × ${reps}`;
}

/** The full line under an exercise title, or `null` with no history. */
export function lastTimeLine(history: Set[]): string | null {
  const summary = summarizeLastPerformance(history);
  return summary === null ? null : `Last time · ${summary}`;
}
