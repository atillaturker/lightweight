/**
 * Routine selection and per-routine estimates for the Home screen.
 *
 * Pure functions over the routine list — no store access, so they are
 * trivially testable and can be reused by the routines feature.
 */
import type { Exercise, Routine } from '@domain/entities';

/** Minutes of work per set, per the routines spec. */
const MINUTES_PER_SET = 2.5;

/** Fixed warm-up allowance added to every estimate, per the routines spec. */
const WARMUP_MINUTES = 10;

/**
 * The routine the Today screen starts next.
 *
 * The user's explicitly marked active routine always wins. When no active
 * routine is set (or the active one was deleted or archived), it falls
 * back to the most recently created non-archived routine. Returns `null`
 * when there is nothing to train.
 */
export function selectNextRoutine(
  routines: Routine[],
  activeRoutineId: string | null = null,
): Routine | null {
  const candidates = routines.filter((routine) => !routine.isArchived);
  if (candidates.length === 0) return null;

  const active = candidates.find((routine) => routine.id === activeRoutineId);
  if (active !== undefined) return active;

  return candidates.reduce((newest, routine) =>
    routine.createdAt > newest.createdAt ? routine : newest,
  );
}

/**
 * The routine to train after finishing `finishedRoutineId`: the next
 * non-archived routine in list order, wrapping from the last back to the
 * first. With a single routine that is the same routine again.
 *
 * Returns `null` when the finished routine is no longer in the list (it was
 * deleted mid-session) or nothing is trainable — the caller then leaves the
 * active routine alone.
 */
export function routineAfter(
  routines: Routine[],
  finishedRoutineId: string,
): Routine | null {
  const index = routines.findIndex((routine) => routine.id === finishedRoutineId);
  if (index < 0) return null;

  for (let step = 1; step <= routines.length; step += 1) {
    const candidate = routines[(index + step) % routines.length];
    if (!candidate.isArchived) return candidate;
  }
  return null;
}

/** Total prescribed sets across a routine's slots. */
export function countRoutineSets(routine: Routine): number {
  return routine.exercises.reduce((total, slot) => total + slot.targetSets, 0);
}

/**
 * Estimated session duration in minutes:
 * `total sets × 2.5 + 10 min warm-up`. Deliberately an estimate — the
 * Active Workout screen never enforces it.
 */
export function estimateRoutineMinutes(routine: Routine): number {
  return Math.round(countRoutineSets(routine) * MINUTES_PER_SET + WARMUP_MINUTES);
}

/**
 * Resolve a routine's slots into library exercises, in routine order.
 * Slots whose exercise is missing are dropped, matching the store.
 */
export function resolveRoutineExercises(
  routine: Routine,
  library: Exercise[],
): Exercise[] {
  const byId = new Map(library.map((exercise) => [exercise.id, exercise]));
  return [...routine.exercises]
    .sort((a, b) => a.order - b.order)
    .map((slot) => byId.get(slot.exerciseId))
    .filter((exercise): exercise is Exercise => exercise !== undefined);
}
