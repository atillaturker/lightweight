/**
 * Merge policy tests: local wins on a conflicting id, remote-only sessions
 * are added, and the result is newest-first.
 */
// In-memory MMKV double, matching the pattern used across the suite.
jest.mock('react-native-mmkv', () => ({
  createMMKV: () => ({
    getString: () => undefined,
    set: () => undefined,
    remove: () => undefined,
  }),
}));

import type { Workout } from '@domain/entities';

import { mergeSessions } from '../historyMerge';

/** A workout with only the identity fields the merge reads. */
function makeWorkout(id: string, startedAt: number): Workout {
  return {
    id,
    routineId: null,
    routineName: id,
    startedAt,
    finishedAt: startedAt + 1,
    sets: [],
  };
}

describe('mergeSessions', () => {
  it('keeps the local copy when ids collide', () => {
    const local = makeWorkout('shared', 2_000);
    const remote = { ...makeWorkout('shared', 2_000), routineName: 'remote' };

    const merged = mergeSessions([local], [remote]);

    expect(merged).toHaveLength(1);
    expect(merged[0].routineName).toBe('shared');
  });

  it('adds remote-only sessions and keeps local-only ones', () => {
    const local = makeWorkout('local-only', 2_000);
    const remote = makeWorkout('remote-only', 3_000);

    const merged = mergeSessions([local], [remote]);

    expect(merged.map((session) => session.id)).toEqual([
      'remote-only',
      'local-only',
    ]);
  });

  it('sorts newest first', () => {
    const older = makeWorkout('older', 1_000);
    const newer = makeWorkout('newer', 5_000);

    const merged = mergeSessions([older], [newer]);

    expect(merged.map((session) => session.id)).toEqual(['newer', 'older']);
  });
});
