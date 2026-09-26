/**
 * Month grouping for the History list.
 *
 * Sessions are bucketed by the calendar month of their start time and the
 * buckets are ordered most recent first. Within a month the sessions are
 * ordered most recent first as well, independent of the input order.
 */
import type { Workout } from '@domain/entities';
import { formatMonthYear } from '@lib/format';

/** One sticky-header section of the History list. */
export interface MonthSection {
  /** Stable sort key, e.g. `2026-04`. */
  key: string;
  /** Uppercase label, e.g. `APRIL 2026`. */
  title: string;
  /** Sessions in this month, most recent first. */
  data: Workout[];
}

/** `YYYY-MM` key for a timestamp, in local time. */
function monthKey(timestamp: number): string {
  const date = new Date(timestamp);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * Group a list of sessions by month, descending. Returns an empty array
 * for an empty input.
 */
export function groupSessionsByMonth(sessions: Workout[]): MonthSection[] {
  const byMonth = new Map<string, Workout[]>();

  for (const session of sessions) {
    const key = monthKey(session.startedAt);
    const bucket = byMonth.get(key);
    if (bucket === undefined) {
      byMonth.set(key, [session]);
    } else {
      bucket.push(session);
    }
  }

  return Array.from(byMonth, ([key, data]) => ({
    key,
    title: formatMonthYear(data[0].startedAt).toUpperCase(),
    data: [...data].sort((a, b) => b.startedAt - a.startedAt),
  })).sort((a, b) => b.key.localeCompare(a.key));
}
