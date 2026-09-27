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

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Start of the week containing `timestamp`: local midnight on the given
 * first day of the week.
 *
 * Weeks follow the device's calendar, like every other date label in the
 * app. A UTC anchor put a session at 01:00 on a Monday in UTC+3 into the
 * previous week.
 */
export function startOfWeek(timestamp: number, weekStart: WeekStart): number {
  const date = new Date(timestamp);
  const day = date.getDay();
  const offset = weekStart === 'monday' ? (day + 6) % 7 : day;
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() - offset).getTime();
}

/**
 * Shift a week start by `weeks` calendar weeks (negative moves back).
 * Stays on local midnight across daylight-saving changes, where a week is
 * 167 or 169 hours rather than a fixed 7 × 24.
 */
export function addWeeks(weekStartMs: number, weeks: number): number {
  const date = new Date(weekStartMs);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + 7 * weeks).getTime();
}

/**
 * Whole calendar weeks from one week start to another. Rounds, so the
 * hour a daylight-saving change adds or removes does not skew the result.
 */
export function weeksBetween(fromWeekStartMs: number, toWeekStartMs: number): number {
  return Math.round((toWeekStartMs - fromWeekStartMs) / WEEK_MS);
}

/**
 * Group sessions by ISO week (respecting the given weekStart)
 * and return the total volume per week.
 * Result is ordered by ascending week start.
 */
export function weeklyVolume(
  sessions: Workout[],
  weekStart: WeekStart,
): { weekStartMs: number; volume: number }[] {
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
