/**
 * Tuning constants for the routines feature.
 *
 * Kept out of the store so tests, the onboarding seeder, and the editor
 * all read the same numbers. The editor's "Add exercise" action stamps
 * these onto every new slot, and the duration estimate is derived from
 * {@link DEFAULT_TARGET_SETS} so the two can never drift apart.
 */

/** Sets assigned to a newly added exercise slot. */
export const DEFAULT_TARGET_SETS = 3;

/** Reps assigned to a newly added exercise slot. */
export const DEFAULT_TARGET_REPS = 8;

/** Name given to a routine created with no explicit name. */
export const DEFAULT_ROUTINE_NAME = "My Routine";

/** Minutes assumed per working set when estimating routine duration. */
export const MINUTES_PER_SET = 2.5;

/** Fixed warm-up allowance, in minutes, added to every duration estimate. */
export const WARMUP_MINUTES = 10;

/**
 * Estimated routine duration in whole minutes:
 * `exercises × sets × minutes-per-set + warm-up`.
 *
 * An estimate, never a timer — the Routine Editor shows it as meta text
 * under the routine name.
 */
export function estimateDurationMinutes(exerciseCount: number): number {
  return (
    Math.round(exerciseCount * DEFAULT_TARGET_SETS * MINUTES_PER_SET) +
    WARMUP_MINUTES
  );
}
