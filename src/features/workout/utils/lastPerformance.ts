/**
 * Display helpers for "last time" and exercise-block subtitles.
 *
 * Reads the exercise history provider and reduces the most recent session
 * into the single line shown under an exercise title, e.g.
 * `Last time · 80kg × 8, 8, 7`. Returns `null` when the exercise has no
 * history, so the caller hides the line rather than printing a placeholder.
 */
import type { Set } from '@domain/entities';
import { isTimedSet } from '@domain/rules';
import { formatClock, formatWeightKg } from '@lib/format';

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

/** `0:45, 0:40`, prefixed with any added load: `+10kg · 0:45, 0:40`. */
function summarizeHolds(sets: Set[], weightKg: number): string {
  const holds = sets.map((set) => formatClock(set.durationSec ?? 0)).join(', ');
  return weightKg > 0 ? `+${formatWeightKg(weightKg)}kg · ${holds}` : holds;
}

/**
 * `80kg × 8, 8, 7` for the last session, or `null` when there is no
 * history. Warmup sets are included here — this line describes what was
 * actually performed, not what counted toward volume.
 *
 * Unloaded sets read `8, 8, 7 reps`, per-side sets add `per side`, and
 * timed sets list their holds.
 */
export function summarizeLastPerformance(history: Set[]): string | null {
  const sets = lastSessionSets(history);
  const first = sets[0];
  if (first === undefined) return null;
  if (isTimedSet(first)) return summarizeHolds(sets, first.weightKg);

  const reps = sets.map((set) => String(set.reps)).join(', ');
  const side = first.perSide === true ? ' per side' : '';
  if (first.weightKg === 0) return `${reps} reps${side}`;
  return `${formatWeightKg(first.weightKg)}kg × ${reps}${side}`;
}

/** The full line under an exercise title, or `null` with no history. */
export function lastTimeLine(history: Set[]): string | null {
  const summary = summarizeLastPerformance(history);
  return summary === null ? null : `Last time · ${summary}`;
}
