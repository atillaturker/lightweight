/**
 * Display helpers for finished sessions.
 *
 * Turns a domain `Workout` into the strings the rows and strips render.
 * All arithmetic goes through `@domain/rules`; all formatting goes through
 * `@lib/format`. Nothing here touches React or the stores.
 */
import type { Workout } from '@domain/entities';
import { calculateVolume } from '@domain/rules';
import {
  formatMinutesBetween,
  formatTonnage,
  formatWeekdayShort,
} from '@lib/format';

import type { RecentSessionRow } from '../components';

/** Distinct exercises that have at least one set in the session. */
export function countSessionExercises(session: Workout): number {
  const ids = new Set(session.sets.map((set) => set.exerciseId));
  return ids.size;
}

/** Completed sets in the session. */
export function countSessionSets(session: Workout): number {
  return session.sets.filter((set) => set.completed).length;
}

/** Total reps across the session's working sets. */
export function countSessionReps(session: Workout): number {
  return session.sets
    .filter((set) => set.completed && set.type !== 'warmup')
    .reduce((total, set) => total + set.reps, 0);
}

/** Session volume in kilograms, warmups excluded by the domain rule. */
export function sessionVolumeKg(session: Workout): number {
  return calculateVolume(session.sets);
}

/** Session duration in whole minutes, measured from start to finish. */
export function sessionMinutes(session: Workout, now: number): number {
  return formatMinutesBetween(session.startedAt, session.finishedAt, now);
}

/**
 * Build the row shown in Home's recent-activity list.
 * Sessions started without a routine fall back to a generic label.
 */
export function toRecentSessionRow(
  session: Workout,
  now: number,
): RecentSessionRow {
  const title =
    session.routineName.trim() === '' ? 'Session' : session.routineName;
  const meta = [
    formatWeekdayShort(session.startedAt),
    `${countSessionExercises(session)} exercises`,
    `${sessionMinutes(session, now)} min`,
  ].join(' · ');

  return {
    id: session.id,
    title,
    meta,
    volume: formatTonnage(sessionVolumeKg(session)),
  };
}
