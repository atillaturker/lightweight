import type { Set } from '../entities/Set';
import type { Workout } from '../entities/Workout';
import type { WeekStart } from '../entities/User';
import type { VolumeSummary } from '../value-objects/Volume';
import { isWorkingSet } from './e1rm';

/**
 * Calculate total volume (kg) for a list of sets.
 * Warmup sets are excluded.
 * Uncompleted sets are excluded.
 */
export function calculateVolume(sets: Set[]): number {
  let total = 0;
  for (const set of sets) {
    if (isWorkingSet(set)) {
      total += set.weightKg * set.reps;
    }
  }
  return total;
}

/**
 * Full breakdown including per-exercise totals.
 */
export function summarizeVolume(sets: Set[]): VolumeSummary {
  const summary: VolumeSummary = { total: 0, sets: 0, reps: 0, perExercise: {} };
  for (const set of sets) {
    if (!isWorkingSet(set)) {
      continue;
    }
    const setVolume = set.weightKg * set.reps;
    summary.total += setVolume;
    summary.sets += 1;
    summary.reps += set.reps;
    summary.perExercise[set.exerciseId] =
      (summary.perExercise[set.exerciseId] ?? 0) + setVolume;
  }
  return summary;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Start of the week containing `timestamp`, aligned to the given week start.
 * Anchored to UTC midnight so grouping is stable across device timezones.
 */
export function startOfWeek(timestamp: number, weekStart: WeekStart): number {
  const date = new Date(timestamp);
  const day = date.getUTCDay();
  const offset = weekStart === 'monday' ? (day + 6) % 7 : day;
  const midnight = Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
  );
  return midnight - offset * DAY_MS;
}

/**
 * Group sessions by ISO week (respecting the given weekStart)
 * and return the total volume per week.
 * Result is ordered by ascending week start.
 */
export function weeklyVolume(
  sessions: Workout[],
  weekStart: WeekStart,
): Array<{ weekStartMs: number; volume: number }> {
  const byWeek = new Map<number, number>();
  for (const session of sessions) {
    const weekStartMs = startOfWeek(session.startedAt, weekStart);
    const volume = calculateVolume(session.sets);
    byWeek.set(weekStartMs, (byWeek.get(weekStartMs) ?? 0) + volume);
  }
  return Array.from(byWeek, ([weekStartMs, volume]) => ({
    weekStartMs,
    volume,
  })).sort((a, b) => a.weekStartMs - b.weekStartMs);
}
