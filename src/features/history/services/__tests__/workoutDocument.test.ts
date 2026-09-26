/**
 * Round-trip tests for the workout document mapping.
 *
 * A document written to Firestore must decode back to the exact domain
 * `Workout`, including the persisted `isPR` flag, and must never carry an
 * `undefined` value (Firestore rejects it).
 */
import type { Workout } from '@domain/entities';

import {
  fromWorkoutDocument,
  isWorkoutDocument,
  toWorkoutDocument,
} from '../workoutDocument';

const WORKOUT: Workout = {
  id: 'session-1',
  routineId: 'routine-1',
  routineName: 'Upper / Lower',
  startedAt: 1_700_000_000_000,
  finishedAt: 1_700_000_600_000,
  note: 'felt strong',
  sets: [
    {
      id: 'set-1',
      exerciseId: 'bench-press',
      workoutId: 'session-1',
      weightKg: 80,
      reps: 8,
      type: 'normal',
      completed: true,
      rpe: 8,
      note: 'grindy',
      completedAt: 1_700_000_100_000,
      order: 0,
      isPR: true,
    },
    {
      id: 'set-2',
      exerciseId: 'barbell-row',
      workoutId: 'session-1',
      weightKg: 60,
      reps: 10,
      type: 'warmup',
      completed: true,
      completedAt: 1_700_000_200_000,
      order: 0,
      isPR: false,
    },
  ],
};

describe('toWorkoutDocument', () => {
  it('maps every field and preserves isPR', () => {
    const document = toWorkoutDocument(WORKOUT);

    expect(document).toMatchObject({
      id: 'session-1',
      routineId: 'routine-1',
      routineName: 'Upper / Lower',
      note: 'felt strong',
    });
    expect(document.sets[0]).toMatchObject({
      id: 'set-1',
      rpe: 8,
      isPR: true,
      order: 0,
    });
    expect(document.sets[1].isPR).toBe(false);
  });

  it('omits undefined optional fields', () => {
    const minimal: Workout = {
      id: 'session-2',
      routineId: null,
      routineName: 'Solo',
      startedAt: 1,
      finishedAt: null,
      sets: [
        {
          id: 'set-3',
          exerciseId: 'squat',
          workoutId: 'session-2',
          weightKg: 100,
          reps: 5,
          type: 'normal',
          completed: true,
          completedAt: 2,
          order: 0,
        },
      ],
    };

    const document = toWorkoutDocument(minimal);

    expect('note' in document).toBe(false);
    expect('rpe' in document.sets[0]).toBe(false);
    expect('isPR' in document.sets[0]).toBe(false);
  });
});

describe('fromWorkoutDocument', () => {
  it('round-trips a workout through a document', () => {
    const decoded = fromWorkoutDocument(
      WORKOUT.id,
      toWorkoutDocument(WORKOUT),
    );

    expect(decoded).toEqual(WORKOUT);
  });

  it('prefers the document id over the embedded id', () => {
    const decoded = fromWorkoutDocument(
      'document-id',
      toWorkoutDocument(WORKOUT),
    );

    expect(decoded.id).toBe('document-id');
    expect(decoded.sets[0].workoutId).toBe('document-id');
  });

  it('throws on an invalid document', () => {
    expect(() => fromWorkoutDocument('bad', { sets: 'nope' })).toThrow();
  });
});

describe('isWorkoutDocument', () => {
  it('accepts a mapped document and rejects junk', () => {
    expect(isWorkoutDocument(toWorkoutDocument(WORKOUT))).toBe(true);
    expect(isWorkoutDocument(null)).toBe(false);
    expect(isWorkoutDocument({ id: 'x' })).toBe(false);
  });
});
