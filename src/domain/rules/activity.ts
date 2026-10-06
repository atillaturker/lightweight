import type { Workout } from '../entities/Workout';

/**
 * Daily training activity for the calendar heatmap: minutes trained per
 * local calendar day, and the shade step each amount maps to.
 */

/** Minutes a session counts for when it has no finish time. */
export const UNFINISHED_SESSION_MINUTES = 1;

/**
 * Upper bounds (exclusive) of shade steps 1–3, in minutes; anything at or
 * above the last bound is step 4. Fixed rather than relative, so a day's
 * shade means the same thing all year.
 */
export const ACTIVITY_THRESHOLDS: readonly [number, number, number] = [30, 60, 90];

/** Shade step of a day: 0 rest, 1–4 more training. */
export type ActivityLevel = 0 | 1 | 2 | 3 | 4;

/** Key of the local calendar day containing `timestamp`: `YYYY-M-D`. */
export function dayKey(timestamp: number): string {
  const date = new Date(timestamp);
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

/** `YYYY-MM-DD` of the local day containing `timestamp`. */
export function isoDay(timestamp: number): string {
  const date = new Date(timestamp);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

/** Local midnight of an `YYYY-MM-DD` day. */
export function dayStartOf(isoDate: string): number {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day).getTime();
}

/** Local midnight of the day containing `timestamp`. */
export function startOfDay(timestamp: number): number {
  const date = new Date(timestamp);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

/**
 * Local midnight `days` calendar days from `dayStart` (negative goes
 * back). Uses the calendar, not 24h steps, so daylight-saving changes
 * never skip or repeat a day.
 */
export function addDays(dayStart: number, days: number): number {
  const date = new Date(dayStart);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days).getTime();
}

/** Minutes of one session, at least 1 so a logged day never reads as rest. */
function sessionMinutes(session: Workout): number {
  if (session.finishedAt === null) return UNFINISHED_SESSION_MINUTES;
  return Math.max(1, Math.round((session.finishedAt - session.startedAt) / 60_000));
}

/** Minutes trained per local day, keyed by {@link dayKey}. */
export function dailyActivityMinutes(sessions: Workout[]): Map<string, number> {
  const minutes = new Map<string, number>();
  for (const session of sessions) {
    const key = dayKey(session.startedAt);
    minutes.set(key, (minutes.get(key) ?? 0) + sessionMinutes(session));
  }
  return minutes;
}

/** Shade step for a day's minutes. */
export function activityLevel(minutes: number): ActivityLevel {
  if (minutes <= 0) return 0;
  const [first, second, third] = ACTIVITY_THRESHOLDS;
  if (minutes < first) return 1;
  if (minutes < second) return 2;
  if (minutes < third) return 3;
  return 4;
}
