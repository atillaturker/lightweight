/**
 * Read model for the activity heatmap: the last N weeks as columns of
 * seven days (Monday first), each day with its minutes, shade step and
 * session names, plus month labels for the columns where a month begins.
 */
import type { Workout } from '@domain/entities';
import {
  activityLevel,
  addDays,
  addWeeks,
  dailyActivityMinutes,
  dayKey,
  startOfDay,
  startOfWeek,
  type ActivityLevel,
} from '@domain/rules';

/** One day cell. */
export interface ActivityDay {
  /** Local midnight. */
  date: number;
  key: string;
  minutes: number;
  level: ActivityLevel;
  /** Routine names of the sessions that day, in start order. */
  sessions: string[];
  /** After today: drawn empty and not selectable. */
  future: boolean;
}

/** A week column, Monday to Sunday. */
export interface ActivityWeek {
  start: number;
  days: ActivityDay[];
}

/** The whole grid. */
export interface ActivityGrid {
  weeks: ActivityWeek[];
  /** Column index → month label, where a month's first day falls. */
  monthLabels: { column: number; label: string }[];
  /** Days with any training in the grid. */
  activeDays: number;
}

const WEEK_START = 'monday' as const;

/** Routine names per day, in start order. */
function sessionNamesByDay(sessions: Workout[]): Map<string, string[]> {
  const names = new Map<string, string[]>();
  for (const session of [...sessions].sort((a, b) => a.startedAt - b.startedAt)) {
    const key = dayKey(session.startedAt);
    names.set(key, [...(names.get(key) ?? []), session.routineName || 'Workout']);
  }
  return names;
}

/** Build `weeks` columns ending with the week that contains `now`. */
export function buildActivityGrid(
  sessions: Workout[],
  now: number,
  weeks: number,
  monthShort: (timestamp: number) => string,
): ActivityGrid {
  const minutes = dailyActivityMinutes(sessions);
  const names = sessionNamesByDay(sessions);
  const today = startOfDay(now);
  const first = addWeeks(startOfWeek(now, WEEK_START), -(weeks - 1));
  const columns: ActivityWeek[] = [];
  const monthLabels: ActivityGrid['monthLabels'] = [];
  let activeDays = 0;

  for (let column = 0; column < weeks; column += 1) {
    const start = addWeeks(first, column);
    const days = Array.from({ length: 7 }, (_, offset): ActivityDay => {
      const date = addDays(start, offset);
      const key = dayKey(date);
      const dayMinutes = minutes.get(key) ?? 0;
      if (dayMinutes > 0 && date <= today) activeDays += 1;
      return { date, key, minutes: dayMinutes, level: activityLevel(dayMinutes), sessions: names.get(key) ?? [], future: date > today };
    });
    const firstOfMonth = days.find((day) => new Date(day.date).getDate() === 1);
    if (firstOfMonth !== undefined) monthLabels.push({ column, label: monthShort(firstOfMonth.date) });
    columns.push({ start, days });
  }
  return { weeks: columns, monthLabels, activeDays };
}
