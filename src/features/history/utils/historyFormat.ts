/**
 * Display formatting for a History row.
 *
 * Kept out of the screen so the row's strings are pure and testable. All
 * arithmetic goes through `@domain/rules`; all formatting through
 * `@lib/format`.
 */
import type { Workout } from '@domain/entities';
import { calculateVolume } from '@domain/rules';
import {
  formatMinutesBetween,
  formatTonnage,
  formatWeekdayShort,
} from '@lib/format';

/** The strings a single History row renders. */
export interface HistoryRowModel {
  id: string;
  /** Routine name, or "Session" when the workout had no routine. */
  title: string;
  /** e.g. `Tue · 5 exercises · 48 min`. */
  meta: string;
  /** Session volume, already unit-formatted, e.g. `8.4t`. */
  volume: string;
}

/** Distinct exercises that have at least one set in the session. */
export function countSessionExercises(session: Workout): number {
  return new Set(session.sets.map((set) => set.exerciseId)).size;
}

/** Session volume in kilograms, warmups excluded by the domain rule. */
export function sessionVolumeKg(session: Workout): number {
  return calculateVolume(session.sets);
}

/** Build the row model for one finished session. */
export function toHistoryRow(
  session: Workout,
  now: number,
): HistoryRowModel {
  const title =
    session.routineName.trim() === '' ? 'Session' : session.routineName;
  const meta = [
    formatWeekdayShort(session.startedAt),
    `${countSessionExercises(session)} exercises`,
    `${formatMinutesBetween(session.startedAt, session.finishedAt, now)} min`,
  ].join(' · ');

  return {
    id: session.id,
    title,
    meta,
    volume: formatTonnage(sessionVolumeKg(session)),
  };
}
