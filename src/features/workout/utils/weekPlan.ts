/**
 * The Home "This week" plan: each day of the current week with its
 * planned routine and whether it was trained, missed, or is still ahead.
 */
import type { Routine, Workout } from '@domain/entities';
import {
  addDays,
  isoDay,
  plannedRoutineId,
  startOfDay,
  startOfWeek,
  weekPlan,
  type ScheduleOverrides,
} from '@domain/rules';

/** Days ahead of today a session can be moved to. */
export const MOVE_WINDOW_DAYS = 7;

/**
 * `done`: a session was logged that day, planned or not. `today`: planned
 * for today, not yet trained. `missed`: planned in the past, not trained.
 * `planned`: planned for a later day. `rest`: nothing planned or logged.
 */
export type PlanDayStatus = 'done' | 'today' | 'missed' | 'planned' | 'rest';

/** One day of the week plan, ready to render. */
export interface WeekPlanDay {
  /** Local midnight. */
  date: number;
  routineId: string | null;
  /** Planned routine's name; `null` on a rest day. */
  routineName: string | null;
  status: PlanDayStatus;
  /** True when a one-off move, not the weekly plan, decides this day. */
  moved: boolean;
}

function statusOf(date: number, today: number, planned: boolean, trained: boolean): PlanDayStatus {
  if (trained) return 'done';
  if (!planned) return 'rest';
  if (date < today) return 'missed';
  return date === today ? 'today' : 'planned';
}

/** The current week, Monday first, with each day's plan and outcome. */
export function buildWeekPlan(
  now: number,
  routines: Routine[],
  overrides: ScheduleOverrides,
  sessions: Workout[],
): WeekPlanDay[] {
  const today = startOfDay(now);
  const trainedDays = new Set(sessions.map((session) => isoDay(session.startedAt)));
  const names = new Map(routines.map((routine) => [routine.id, routine.name]));
  return weekPlan(startOfWeek(now, 'monday'), routines, overrides).map((day) => ({
    date: day.date,
    routineId: day.routineId,
    routineName: day.routineId === null ? null : (names.get(day.routineId) ?? null),
    status: statusOf(day.date, today, day.routineId !== null, trainedDays.has(isoDay(day.date))),
    moved: day.moved,
  }));
}

/** Whether a day's session can still be moved: planned, not yet trained. */
export function isMovable(day: WeekPlanDay): boolean {
  return day.status === 'today' || day.status === 'planned' || day.status === 'missed';
}

/** A day a session can move to, with what is planned there now. */
export interface MoveTarget {
  /** Local midnight. */
  date: number;
  /** Routine already planned that day (it swaps in), or `null` for rest. */
  routineName: string | null;
}

/** Days a session on `from` can move to: today and the week ahead, minus `from`. */
export function moveTargets(
  now: number,
  from: number,
  routines: Routine[],
  overrides: ScheduleOverrides,
): MoveTarget[] {
  const today = startOfDay(now);
  const names = new Map(routines.map((routine) => [routine.id, routine.name]));
  return Array.from({ length: MOVE_WINDOW_DAYS }, (_, offset) => addDays(today, offset))
    .filter((date) => date !== startOfDay(from))
    .map((date) => {
      const routineId = plannedRoutineId(date, routines, overrides);
      return { date, routineName: routineId === null ? null : (names.get(routineId) ?? null) };
    });
}
