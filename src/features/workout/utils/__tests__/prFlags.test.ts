/**
 * Tests that persisted PR flags are computed against the user's full
 * history, not against the session being closed.
 *
 * The regression these pin: replaying detection over a session alone marks
 * the first working set of every exercise as a record, so every session
 * appeared to contain a PR.
 */
import type { Set as DomainSet, SetType, Workout } from '@domain/entities';

import { applyPRFlags } from '../prFlags';

/** Build one completed working set. */
function makeSet(
  id: string,
  exerciseId: string,
  workoutId: string,
  weightKg: number,
  reps: number,
  completedAt: number,
  type: SetType = 'normal',
): DomainSet {
  return {
    id,
    exerciseId,
    workoutId,
    weightKg,
    reps,
    type,
    completed: true,
    completedAt,
    order: 0,
  };
}

/** Build a workout from its sets. */
function makeWorkout(id: string, startedAt: number, sets: DomainSet[]): Workout {
  return {
    id,
    routineId: null,
    routineName: id,
    startedAt,
    finishedAt: startedAt + 60_000,
    sets,
  };
}

describe('applyPRFlags', () => {
  it('does not flag a lighter first set when prior history is heavier', () => {
    const first = makeWorkout('first', 1_000, [
      makeSet('a', 'bench', 'first', 80, 5, 1_000),
    ]);
    const second = makeWorkout('second', 2_000, [
      makeSet('b', 'bench', 'second', 70, 5, 2_000),
    ]);

    const flagged = applyPRFlags(second, [first, second]);

    expect(flagged.sets[0].isPR).toBe(false);
  });

  it('flags a set that beats the full prior history', () => {
    const first = makeWorkout('first', 1_000, [
      makeSet('a', 'bench', 'first', 80, 5, 1_000),
    ]);
    const second = makeWorkout('second', 2_000, [
      makeSet('b', 'bench', 'second', 85, 5, 2_000),
    ]);

    const flagged = applyPRFlags(second, [first, second]);

    expect(flagged.sets[0].isPR).toBe(true);
  });

  it('flags a heavier set later in the same session', () => {
    const only = makeWorkout('only', 1_000, [
      makeSet('a', 'bench', 'only', 70, 5, 1_000),
      makeSet('b', 'bench', 'only', 90, 1, 1_100),
    ]);

    const flagged = applyPRFlags(only, [only]);

    expect(flagged.sets.map((set) => set.isPR)).toEqual([true, true]);
  });

  it('ignores warmup sets', () => {
    const only = makeWorkout('only', 1_000, [
      makeSet('a', 'bench', 'only', 120, 5, 1_000, 'warmup'),
    ]);

    const flagged = applyPRFlags(only, [only]);

    expect(flagged.sets[0].isPR).toBe(false);
  });

  it('ignores a history entry with the same id as the workout', () => {
    const session = makeWorkout('same', 1_000, [
      makeSet('a', 'bench', 'same', 80, 5, 1_000),
    ]);

    // Passing only the workout itself must not use its own sets as history.
    const flagged = applyPRFlags(session, [session]);

    expect(flagged.sets[0].isPR).toBe(true);
  });
});
