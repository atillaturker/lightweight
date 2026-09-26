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
