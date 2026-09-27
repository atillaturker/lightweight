/**
 * Reconciliation policy tests: local wins on a conflicting id, remote-only
 * sessions are added, cloud tombstones remove local copies, and sessions
 * the cloud never saw are returned for upload.
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

import type { RemoteHistory } from '../firestoreWorkouts';
import { reconcileSessions } from '../historyMerge';

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

/** A complete (untruncated) cloud read. */
function remoteOf(
  workouts: Workout[],
  deletedIds: string[] = [],
  truncatedBefore: number | null = null,
): RemoteHistory {
  return { workouts, deletedIds, truncatedBefore };
}

/** Session ids in order. */
function ids(sessions: Workout[]): string[] {
  return sessions.map((session) => session.id);
}

describe('reconcileSessions', () => {
  it('keeps the local copy when ids collide', () => {
    const local = makeWorkout('shared', 2_000);
    const remote = { ...makeWorkout('shared', 2_000), routineName: 'remote' };

    const { sessions, toUpload } = reconcileSessions([local], remoteOf([remote]));

    expect(sessions).toHaveLength(1);
    expect(sessions[0].routineName).toBe('shared');
    expect(toUpload).toEqual([]);
  });

  it('adds remote-only sessions', () => {
    const remote = makeWorkout('remote-only', 3_000);

    const { sessions } = reconcileSessions([], remoteOf([remote]));

    expect(ids(sessions)).toEqual(['remote-only']);
  });

  it('keeps local-only sessions and returns them for upload', () => {
    const local = makeWorkout('local-only', 2_000);

    const { sessions, toUpload } = reconcileSessions([local], remoteOf([]));

    expect(ids(sessions)).toEqual(['local-only']);
    expect(ids(toUpload)).toEqual(['local-only']);
  });

  it('removes a local session the cloud has tombstoned', () => {
    const local = makeWorkout('deleted-elsewhere', 2_000);

    const { sessions, toUpload } = reconcileSessions(
      [local],
      remoteOf([], ['deleted-elsewhere']),
    );

    expect(sessions).toEqual([]);
    expect(toUpload).toEqual([]);
  });

  it('drops a live cloud copy whose id is deleted', () => {
    const { sessions } = reconcileSessions(
      [],
      remoteOf([makeWorkout('delete-queued', 2_000)], ['delete-queued']),
    );

    expect(sessions).toEqual([]);
  });

  it('does not upload sessions older than a truncated read', () => {
    const old = makeWorkout('old', 1_000);
    const recent = makeWorkout('recent', 5_000);

    const { sessions, toUpload } = reconcileSessions(
      [old, recent],
      remoteOf([makeWorkout('cloud', 4_000)], [], 3_000),
    );

    expect(ids(sessions)).toEqual(['recent', 'cloud', 'old']);
    expect(ids(toUpload)).toEqual(['recent']);
  });

  it('sorts newest first', () => {
    const older = makeWorkout('older', 1_000);
    const newer = makeWorkout('newer', 5_000);

    const { sessions } = reconcileSessions([older], remoteOf([newer]));

    expect(ids(sessions)).toEqual(['newer', 'older']);
  });
});
