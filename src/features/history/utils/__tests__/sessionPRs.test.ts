/**
 * Tests for the PR replay behind the "PR only" filter.
 *
 * The domain `Set` does not persist the live PR flag, so records are
 * recomputed against prior history. These pin that a session is flagged
 * only when one of its sets actually beats what came before it.
 */
import type { Set, Workout } from '@domain/entities';

import { sessionIdsWithPRs } from '../sessionPRs';

/** Build one completed working set. */
function makeSet(
  id: string,
  exerciseId: string,
  workoutId: string,
  weightKg: number,
  reps: number,
  completedAt: number,
): Set {
  return {
    id,
    exerciseId,
    workoutId,
    weightKg,
    reps,
    type: 'normal',
    completed: true,
    completedAt,
    order: 0,
  };
}

/** Build a workout from its sets. */
function makeWorkout(id: string, startedAt: number, sets: Set[]): Workout {
  return {
    id,
    routineId: null,
    routineName: id,
    startedAt,
    finishedAt: startedAt + 60_000,
    sets,
  };
}

describe('sessionIdsWithPRs', () => {
  it('flags a session only when a set beats prior history', () => {
    const first = makeWorkout('first', 1_000, [
      makeSet('a', 'bench', 'first', 80, 5, 1_000),
    ]);
    const second = makeWorkout('second', 2_000, [
      makeSet('b', 'bench', 'second', 70, 5, 2_000),
    ]);

    const prIds = sessionIdsWithPRs([second, first]);

    expect(prIds.has('first')).toBe(true);
    expect(prIds.has('second')).toBe(false);
  });

  it('flags a session when a later set sets a record', () => {
    const first = makeWorkout('first', 1_000, [
      makeSet('a', 'bench', 'first', 80, 5, 1_000),
    ]);
    const second = makeWorkout('second', 2_000, [
      makeSet('b', 'bench', 'second', 85, 5, 2_000),
    ]);

    const prIds = sessionIdsWithPRs([second, first]);

    expect(prIds.has('second')).toBe(true);
  });

  it('ignores warmup sets', () => {
    const warmup = makeSet('a', 'bench', 'first', 120, 5, 1_000);
    const session = makeWorkout('first', 1_000, [
      { ...warmup, type: 'warmup' },
    ]);

    expect(sessionIdsWithPRs([session]).size).toBe(0);
  });
});
