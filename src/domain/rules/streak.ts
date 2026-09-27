import type { Workout } from '../entities/Workout';
import type { WeekStart } from '../entities/User';
import { isWorkingSet } from './e1rm';
import { addWeeks, startOfWeek } from './volume';

/** A "quick session" under 30 minutes does not count toward a streak. */
export const MIN_STREAK_DURATION_MS = 30 * 60 * 1000;

/**
 * A session counts toward a streak when it is finished, lasted at least
 * 30 minutes, and contains at least one completed working set.
 */
export function isStreakSession(session: Workout): boolean {
  if (session.finishedAt === null) {
    return false;
  }
  if (session.finishedAt - session.startedAt < MIN_STREAK_DURATION_MS) {
    return false;
  }
  return session.sets.some(isWorkingSet);
}

/** Distinct week starts (ascending) holding at least one streak session. */
function streakWeeks(sessions: Workout[], weekStart: WeekStart): number[] {
  const weeks = new Set<number>();
  for (const session of sessions) {
    if (isStreakSession(session)) {
      weeks.add(startOfWeek(session.startedAt, weekStart));
    }
  }
  return Array.from(weeks).sort((a, b) => a - b);
}

/**
 * Weekly streak. Consecutive ISO weeks (based on weekStart)
 * containing at least one finished workout.
 *
 * A "quick session" (under 30 minutes) does NOT count toward streak.
 * A workout with no completed working sets does NOT count.
 *
 * Returns 0 if there is no current streak.
 */
export function currentWeeklyStreak(
  sessions: Workout[],
  weekStart: WeekStart,
  now: number,
): number {
  const weeks = new Set(streakWeeks(sessions, weekStart));
  const currentWeek = startOfWeek(now, weekStart);
  if (!weeks.has(currentWeek)) {
    return 0;
  }
  let streak = 0;
  let cursor = currentWeek;
  while (weeks.has(cursor)) {
    streak += 1;
    cursor = addWeeks(cursor, -1);
  }
  return streak;
}

/**
 * Longest streak ever achieved.
 * Returns 0 when no session qualifies.
 */
export function longestWeeklyStreak(
  sessions: Workout[],
  weekStart: WeekStart,
): number {
  const weeks = streakWeeks(sessions, weekStart);
  let longest = 0;
  let run = 0;
  for (let index = 0; index < weeks.length; index += 1) {
    const isConsecutive = index > 0 && weeks[index] === addWeeks(weeks[index - 1], 1);
    run = isConsecutive ? run + 1 : 1;
    longest = Math.max(longest, run);
  }
  return longest;
}
