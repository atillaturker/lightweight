import type { Equipment } from '../entities/Exercise';
import type { ProgressionPolicy } from '../entities/Routine';
import type { Set } from '../entities/Set';
import type { WeightUnit } from '../entities/User';

/**
 * How a routine moves an exercise forward from one session to the next.
 *
 * - `linear`: hit every target rep on every set → add weight; miss → hold;
 *   miss {@link STALL_SESSIONS} sessions running at the same weight →
 *   deload by 10%.
 * - timed exercises add {@link HOLD_INCREMENT_SECONDS} once every planned
 *   set was done; unloaded bodyweight ones add a rep instead of weight.
 * - `double`: work up a rep range (target reps to target + 4). Every set
 *   at the top of the range → add weight and drop back to the bottom;
 *   otherwise aim one rep more than the weakest set managed.
 * - `off`: no prescription; sets repeat what was done last time.
 */
export type { ProgressionPolicy };

/** What the exercise loads: a weight, the body, or time held. */
export type ProgressionKind = 'load' | 'bodyweight' | 'timed';

/** Reps above the target that a double-progression range reaches. */
export const DOUBLE_PROGRESSION_SPAN = 4;

/** Missed sessions at one weight before a linear deload. */
export const STALL_SESSIONS = 3;

/** A deload keeps this share of the weight. */
export const DELOAD_FACTOR = 0.9;

/** Seconds a timed exercise gains after every set hit its target. */
export const HOLD_INCREMENT_SECONDS = 5;

const KG_PER_LB = 0.45359237;

/** Why the next session is prescribed the way it is. */
export type PrescriptionReason =
  | 'progressed' // more weight
  | 'reps_up' // more reps at the same weight
  | 'hold_up' // more seconds
  | 'held' // same as last time
  | 'deload'; // lighter after a stall

/** Targets for the next session of one exercise. */
export interface Prescription {
  weightKg: number;
  /** Reps per set; 0 for a timed exercise. */
  reps: number;
  /** Seconds per set, for a timed exercise. */
  durationSec?: number;
  reason: PrescriptionReason;
  /** Signed change vs last time, in kg, reps or seconds. */
  change: number;
}

/** Everything the rule needs about one exercise in one routine. */
export interface ProgressionInput {
  policy: ProgressionPolicy;
  kind: ProgressionKind;
  targetSets: number;
  /** Linear target, or the bottom of the double-progression range. */
  targetReps: number;
  /** Top of the double-progression range; defaults to target + span. */
  repRangeMax?: number;
  incrementKg: number;
  /**
   * Working sets of past sessions, most recent session first, each in set
   * order.
   */
  sessions: Set[][];
}

/** Weight step for an exercise, in kg, in the user's unit's natural step. */
export function defaultIncrementKg(equipment: Equipment, unit: WeightUnit): number {
  if (unit === 'lb') return 5 * KG_PER_LB;
  return equipment === 'dumbbell' || equipment === 'kettlebell' ? 2 : 2.5;
}

function topWeight(sets: Set[]): number {
  return Math.max(0, ...sets.map((set) => set.weightKg));
}

function minReps(sets: Set[]): number {
  return Math.min(...sets.map((set) => set.reps));
}

/** Whether a session did at least `count` sets, each of at least `reps`. */
function hitEverySet(sets: Set[], count: number, reps: number): boolean {
  return sets.length >= count && sets.every((set) => set.reps >= reps);
}

/** Linear: add weight, hold, or deload after a stall. */
function linear(input: ProgressionInput, last: Set[]): Prescription {
  const weight = topWeight(last);
  const reps = input.targetReps;
  if (hitEverySet(last, input.targetSets, reps)) {
    return { weightKg: weight + input.incrementKg, reps, reason: 'progressed', change: input.incrementKg };
  }
  const recent = input.sessions.slice(0, STALL_SESSIONS);
  const stalled =
    recent.length === STALL_SESSIONS &&
    recent.every((sets) => topWeight(sets) === weight && !hitEverySet(sets, input.targetSets, reps));
  if (stalled) {
    const lighter = Math.round(weight * DELOAD_FACTOR * 2) / 2;
    return { weightKg: lighter, reps, reason: 'deload', change: lighter - weight };
  }
  return { weightKg: weight, reps, reason: 'held', change: 0 };
}

/** Double progression: reps up through the range, then weight. */
function double(input: ProgressionInput, last: Set[]): Prescription {
  const weight = topWeight(last);
  const bottom = input.targetReps;
  const top = input.repRangeMax ?? bottom + DOUBLE_PROGRESSION_SPAN;
  if (hitEverySet(last, input.targetSets, top)) {
    return { weightKg: weight + input.incrementKg, reps: bottom, reason: 'progressed', change: input.incrementKg };
  }
  const weakest = minReps(last);
  const reps = Math.min(top, Math.max(bottom, weakest + 1));
  return reps > weakest
    ? { weightKg: weight, reps, reason: 'reps_up', change: reps - weakest }
    : { weightKg: weight, reps, reason: 'held', change: 0 };
}

/** Unloaded bodyweight: one more rep on the weakest set, up to any cap. */
function bodyweight(input: ProgressionInput, last: Set[]): Prescription {
  const weakest = minReps(last);
  const cap = input.policy === 'double' ? (input.repRangeMax ?? input.targetReps + DOUBLE_PROGRESSION_SPAN) : Infinity;
  const reps = Math.min(cap, weakest + 1);
  return reps > weakest
    ? { weightKg: 0, reps, reason: 'reps_up', change: reps - weakest }
    : { weightKg: 0, reps, reason: 'held', change: 0 };
}

/**
 * Timed: five seconds more than the shortest hold once every planned set
 * was done; otherwise hold at what was managed.
 */
function timed(input: ProgressionInput, last: Set[]): Prescription {
  const weight = topWeight(last);
  const shortest = Math.min(...last.map((set) => set.durationSec ?? 0));
  if (last.length >= input.targetSets) {
    const seconds = shortest + HOLD_INCREMENT_SECONDS;
    return { weightKg: weight, reps: 0, durationSec: seconds, reason: 'hold_up', change: HOLD_INCREMENT_SECONDS };
  }
  return { weightKg: weight, reps: 0, durationSec: shortest, reason: 'held', change: 0 };
}

/**
 * Targets for the next session, or `null` when the policy is off or the
 * exercise has no history to build on (the session then seeds as usual).
 * A bodyweight exercise logged with added load progresses like a loaded
 * one.
 */
export function nextPrescription(input: ProgressionInput): Prescription | null {
  const last = input.sessions[0];
  if (input.policy === 'off' || last === undefined || last.length === 0) return null;
  if (input.kind === 'timed') return timed(input, last);
  if (input.kind === 'bodyweight' && topWeight(last) === 0) return bodyweight(input, last);
  return input.policy === 'linear' ? linear(input, last) : double(input, last);
}
