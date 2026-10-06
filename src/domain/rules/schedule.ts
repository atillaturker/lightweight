import type { Routine, Weekday } from '../entities/Routine';
import { addDays, isoDay, startOfDay } from './activity';

/**
 * The weekly plan: routines assigned to weekdays, plus one-off changes
 * for specific dates (a session moved to another day) that leave the
 * plan itself untouched.
 */

/** One-off changes by `YYYY-MM-DD`: a routine id, or `null` for rest. */
export type ScheduleOverrides = Readonly<Record<string, string | null>>;

/** One day of a week's plan. */
export interface PlannedDay {
  /** Local midnight. */
  date: number;
  routineId: string | null;
  /** True when a one-off change, not the weekly plan, decides this day. */
  moved: boolean;
}

/** Days ahead searched for the next planned session. */
export const SCHEDULE_HORIZON_DAYS = 14;

/** One-off changes older than this many days are dropped on write. */
export const OVERRIDE_RETENTION_DAYS = 14;

function activeRoutines(routines: Routine[]): Routine[] {
  return routines.filter((routine) => !routine.isArchived);
}

/** Whether any routine is on the weekly plan. */
export function hasWeeklyPlan(routines: Routine[]): boolean {
  return activeRoutines(routines).some((routine) => (routine.days ?? []).length > 0);
}

/**
 * The routine planned for the day containing `date`: a one-off change
 * if there is one, else the first active routine planned on that
 * weekday, else `null` (rest).
 */
export function plannedRoutineId(
  date: number,
  routines: Routine[],
  overrides: ScheduleOverrides,
): string | null {
  const key = isoDay(date);
  if (Object.prototype.hasOwnProperty.call(overrides, key)) return overrides[key] ?? null;
  const weekday = new Date(date).getDay() as Weekday;
  return activeRoutines(routines).find((routine) => (routine.days ?? []).includes(weekday))?.id ?? null;
}

/** The seven planned days starting at `weekStart` (local midnight). */
export function weekPlan(
  weekStart: number,
  routines: Routine[],
  overrides: ScheduleOverrides,
): PlannedDay[] {
  return Array.from({ length: 7 }, (_, offset) => {
    const date = addDays(weekStart, offset);
    return {
      date,
      routineId: plannedRoutineId(date, routines, overrides),
      moved: Object.prototype.hasOwnProperty.call(overrides, isoDay(date)),
    };
  });
}

/**
 * The next planned session from today: today's, unless today is already
 * trained, else the first planned day ahead within the horizon.
 */
export function nextPlannedDay(
  now: number,
  routines: Routine[],
  overrides: ScheduleOverrides,
  trainedToday: boolean,
): { date: number; routineId: string } | null {
  const today = startOfDay(now);
  for (let offset = trainedToday ? 1 : 0; offset <= SCHEDULE_HORIZON_DAYS; offset += 1) {
    const date = addDays(today, offset);
    const routineId = plannedRoutineId(date, routines, overrides);
    if (routineId !== null) return { date, routineId };
  }
  return null;
}

/**
 * Move the session planned on `from` to `to` for those dates only. If
 * `to` already had a session, the two swap, so nothing is lost. One-off
 * changes older than {@link OVERRIDE_RETENTION_DAYS} are dropped.
 */
export function moveSession(
  overrides: ScheduleOverrides,
  routines: Routine[],
  from: number,
  to: number,
  now: number,
): ScheduleOverrides {
  const moving = plannedRoutineId(from, routines, overrides);
  if (moving === null || isoDay(from) === isoDay(to)) return overrides;
  const displaced = plannedRoutineId(to, routines, overrides);
  const oldest = isoDay(addDays(startOfDay(now), -OVERRIDE_RETENTION_DAYS));
  const kept = Object.fromEntries(Object.entries(overrides).filter(([key]) => key >= oldest));
  return { ...kept, [isoDay(from)]: displaced, [isoDay(to)]: moving };
}
