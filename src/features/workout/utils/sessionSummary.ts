/**
 * Weekly roll-ups for the Home summary strip.
 *
 * Pure functions over the finished-session list. Every calculation is
 * delegated to `@domain/rules` — this module only decides which slices of
 * history a given metric compares.
 */
import type { WeekStart, Workout } from '@domain/entities';
import {
  addWeeks,
  calculateDelta,
  calculateVolume,
  currentWeeklyStreak,
  startOfWeek,
} from '@domain/rules';

/** The four figures the Home strip renders. */
export interface WeeklySummary {
  /** Sessions started in the current week. */
  sessionsThisWeek: number;
  /** Total volume this week, in kilograms. */
  volumeThisWeek: number;
  /** Total volume in the previous week, in kilograms. */
  volumeLastWeek: number;
  /** Percent change against last week, or `null` with no comparison data. */
  volumeDeltaPercent: number | null;
  /** Consecutive weeks with at least one qualifying session. */
  streakWeeks: number;
}

/** Sessions whose `startedAt` falls inside `[from, to)`. */
function sessionsBetween(
  sessions: Workout[],
  from: number,
  to: number,
): Workout[] {
  return sessions.filter(
    (session) => session.startedAt >= from && session.startedAt < to,
  );
}

/** Total volume of a session list, warmups excluded by the domain rule. */
function volumeOf(sessions: Workout[]): number {
  return sessions.reduce(
    (total, session) => total + calculateVolume(session.sets),
    0,
  );
}

/**
 * Roll the finished-session history up into the Home weekly strip.
 * `now` is injected so the result is deterministic in tests.
 */
export function summarizeWeeks(
  sessions: Workout[],
  weekStart: WeekStart,
  now: number,
): WeeklySummary {
  const currentWeekStart = startOfWeek(now, weekStart);
  const nextWeekStart = addWeeks(currentWeekStart, 1);
  const previousWeekStart = addWeeks(currentWeekStart, -1);

  const thisWeek = sessionsBetween(sessions, currentWeekStart, nextWeekStart);
  const lastWeek = sessionsBetween(
    sessions,
    previousWeekStart,
    currentWeekStart,
  );

  const volumeThisWeek = volumeOf(thisWeek);
  const volumeLastWeek = volumeOf(lastWeek);

  return {
    sessionsThisWeek: thisWeek.length,
    volumeThisWeek,
    volumeLastWeek,
    volumeDeltaPercent: calculateDelta(volumeThisWeek, volumeLastWeek),
    streakWeeks: currentWeeklyStreak(sessions, weekStart, now),
  };
}

/** The most recent sessions, newest first, capped at `limit`. */
export function recentSessions(sessions: Workout[], limit: number): Workout[] {
  return [...sessions]
    .sort((a, b) => b.startedAt - a.startedAt)
    .slice(0, limit);
}
