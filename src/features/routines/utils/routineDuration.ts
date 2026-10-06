/**
 * Routine duration helpers.
 *
 * The editor and the routines list both show an estimated duration under
 * the routine name. The estimate comes from the shared formula in
 * `config`; a user may override it, in which case the stored value wins.
 * Keeping the two paths here means neither screen re-implements the
 * fallback.
 */
import type { Routine } from '@domain/entities';

import { estimateDurationMinutes } from '../config';

/** Pure calculated estimate — no override considered. */
export function calculatedRoutineMinutes(routine: Routine): number {
  return estimateDurationMinutes(routine.exercises.length);
}

/**
 * Uses the user override when present, else the calculated estimate.
 */
export function routineDurationMinutes(routine: Routine): number {
  return routine.estimatedMinutes ?? calculatedRoutineMinutes(routine);
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

/**
 * The routine's list meta line: `5 exercises · ~45 min`, plus its planned
 * days Monday first (`· Mon, Thu`) when it is on the weekly plan.
 */
export function routineMeta(routine: Routine): string {
  const base = `${routine.exercises.length} exercises · ~${routineDurationMinutes(routine)} min`;
  const days = [...(routine.days ?? [])].sort((a, b) => ((a + 6) % 7) - ((b + 6) % 7));
  return days.length === 0 ? base : `${base} · ${days.map((day) => DAY_LABELS[day]).join(', ')}`;
}
