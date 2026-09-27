/**
 * Firestore workout service tests.
 *
 * The Firebase SDK is fully mocked — these assert the mapping between the
 * domain `Workout` and the stored document, and that a bad document is
 * skipped rather than failing the whole read.
 */
import type { Workout } from '@domain/entities';

const mockSetDoc = jest.fn();
const mockGetDocs = jest.fn();
const mockDeleteDoc = jest.fn();

jest.mock('firebase/firestore', () => ({
  collection: jest.fn((_db: unknown, ...segments: string[]) => ({
    path: segments.join('/'),
  })),
  doc: jest.fn((_db: unknown, ...segments: string[]) => ({
    path: segments.join('/'),
  })),
  deleteDoc: (...args: unknown[]) => mockDeleteDoc(...args),
  getDocs: (...args: unknown[]) => mockGetDocs(...args),
  limit: jest.fn((value: number) => ({ limit: value })),
  orderBy: jest.fn((field: string, direction: string) => ({ field, direction })),
  query: jest.fn((ref: unknown, ...constraints: unknown[]) => ({
    ref,
    constraints,
  })),
  setDoc: (...args: unknown[]) => mockSetDoc(...args),
}));

jest.mock('@/services/firebase/config', () => ({ db: { name: 'test-db' } }));

import {
  deleteWorkoutFromFirestore,
  fetchWorkoutsFromFirestore,
  saveWorkoutToFirestore,
} from '../firestoreWorkouts';
import { toWorkoutDocument } from '../workoutDocument';

const WORKOUT: Workout = {
  id: 'session-1',
  routineId: null,
  routineName: 'Push',
  startedAt: 1_700_000_000_000,
  finishedAt: 1_700_000_600_000,
  sets: [
    {
      id: 'set-1',
      exerciseId: 'bench-press',
      workoutId: 'session-1',
      weightKg: 80,
      reps: 8,
      type: 'normal',
      completed: true,
      completedAt: 1_700_000_100_000,
      order: 0,
      isPR: true,
    },
  ],
};

beforeEach(() => {
  jest.clearAllMocks();
  mockSetDoc.mockResolvedValue(undefined);
  mockDeleteDoc.mockResolvedValue(undefined);
});

describe('saveWorkoutToFirestore', () => {
  it('rejects an empty uid instead of silently skipping the write', async () => {
    await expect(saveWorkoutToFirestore('', WORKOUT)).rejects.toThrow(
      /signed-in uid/,
    );
    expect(mockSetDoc).not.toHaveBeenCalled();
  });

  it('writes the mapped document under the user path with merge', async () => {
    await saveWorkoutToFirestore('uid-1', WORKOUT);

    expect(mockSetDoc).toHaveBeenCalledTimes(1);
    const [ref, document, options] = mockSetDoc.mock.calls[0];
    expect(ref.path).toBe('users/uid-1/workouts/session-1');
    expect(document).toEqual(toWorkoutDocument(WORKOUT));
    expect(options).toEqual({ merge: true });
  });
});

describe('deleteWorkoutFromFirestore', () => {
  it('replaces the document with a tombstone when the start time is known', async () => {
    await deleteWorkoutFromFirestore('uid-1', 'session-1', 1_700_000_000_000);

    expect(mockDeleteDoc).not.toHaveBeenCalled();
    const [ref, data, options] = mockSetDoc.mock.calls[0];
    expect(ref.path).toBe('users/uid-1/workouts/session-1');
    expect(data).toEqual({
      id: 'session-1',
      startedAt: 1_700_000_000_000,
      deletedAt: expect.any(Number),
    });
    // A full replace, so no training data survives the delete.
    expect(options).toBeUndefined();
  });

  it('removes the document outright for a legacy queued delete', async () => {
    await deleteWorkoutFromFirestore('uid-1', 'session-1');

    expect(mockDeleteDoc).toHaveBeenCalledTimes(1);
    const [ref] = mockDeleteDoc.mock.calls[0];
    expect(ref.path).toBe('users/uid-1/workouts/session-1');
  });
});

describe('fetchWorkoutsFromFirestore', () => {
  it('maps stored documents back to workouts', async () => {
    mockGetDocs.mockResolvedValue({
      docs: [
        { id: 'session-1', data: () => toWorkoutDocument(WORKOUT) },
      ],
    });

    const remote = await fetchWorkoutsFromFirestore('uid-1');

    expect(remote).toEqual({ workouts: [WORKOUT], deletedIds: [], truncatedBefore: null });
  });

  it('skips invalid documents instead of failing', async () => {
    mockGetDocs.mockResolvedValue({
      docs: [
        { id: 'bad', data: () => ({ nope: true }) },
        { id: 'session-1', data: () => toWorkoutDocument(WORKOUT) },
      ],
    });

    const remote = await fetchWorkoutsFromFirestore('uid-1');

    expect(remote.workouts).toEqual([WORKOUT]);
  });

  it('reports tombstones as deleted ids', async () => {
    mockGetDocs.mockResolvedValue({
      docs: [
        { id: 'gone', data: () => ({ id: 'gone', startedAt: 5, deletedAt: 9 }) },
        { id: 'session-1', data: () => toWorkoutDocument(WORKOUT) },
      ],
    });

    const remote = await fetchWorkoutsFromFirestore('uid-1');

    expect(remote.deletedIds).toEqual(['gone']);
    expect(remote.workouts).toEqual([WORKOUT]);
  });

  it('marks a read that hit the limit as truncated at its oldest document', async () => {
    mockGetDocs.mockResolvedValue({
      docs: [
        { id: 'gone', data: () => ({ id: 'gone', startedAt: 1_800_000_000_000, deletedAt: 9 }) },
        { id: 'session-1', data: () => toWorkoutDocument(WORKOUT) },
      ],
    });

    const remote = await fetchWorkoutsFromFirestore('uid-1', 2);

    expect(remote.truncatedBefore).toBe(WORKOUT.startedAt);
  });
});
