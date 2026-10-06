import type { Exercise } from '../entities/Exercise';
import type { Set } from '../entities/Set';

/** Whether sets of the exercise are measured in seconds held. */
export function isTimedExercise(exercise: Pick<Exercise, 'measure'>): boolean {
  return exercise.measure === 'time';
}

/**
 * Whether the exercise moves the body rather than an external load. Its
 * logged weight is added load (a dip belt), 0 when none.
 */
export function isBodyweightExercise(exercise: Pick<Exercise, 'equipment'>): boolean {
  return exercise.equipment === 'bodyweight';
}

/** Whether a logged set was timed. */
export function isTimedSet(set: Pick<Set, 'durationSec'>): boolean {
  return set.durationSec !== undefined;
}

/** How many sides a set's reps were performed on: 2 for per-side sets. */
export function sideCount(set: Pick<Set, 'perSide'>): 1 | 2 {
  return set.perSide === true ? 2 : 1;
}
