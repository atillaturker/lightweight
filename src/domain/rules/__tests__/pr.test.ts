import type { Set } from '../../entities/Set';
import { bestRecordsForExercise, detectPRs } from '../pr';

/** Build a working set with sensible defaults for the fields under test. */
function makeSet(overrides: Partial<Set> = {}): Set {
  return {
    id: 's1',
    exerciseId: 'bench',
    workoutId: 'w1',
    weightKg: 100,
    reps: 5,
    type: 'normal',
    completed: true,
    completedAt: 1_700_000_000_000,
    order: 0,
    ...overrides,
  };
}

/** The PR types present in a record list. */
function types(records: Set[] | ReturnType<typeof detectPRs>): string[] {
  return records.map((record) => record.type);
}

describe('detectPRs', () => {
  it('detects heaviest_set on a first-ever set', () => {
    const records = detectPRs([], makeSet({ weightKg: 100, reps: 5 }));

    expect(types(records)).toContain('heaviest_set');
    expect(records.find((r) => r.type === 'heaviest_set')?.value).toBe(100);
  });

  it('does not detect heaviest_set on a lighter set', () => {
    const history = [makeSet({ id: 'a', weightKg: 120, reps: 3 })];
    const records = detectPRs(history, makeSet({ id: 'b', weightKg: 100, reps: 5 }));

    expect(types(records)).not.toContain('heaviest_set');
  });

  it('detects best_1rm only when the estimate beats the prior best', () => {
    const history = [makeSet({ id: 'a', weightKg: 100, reps: 10 })];
    const beaten = detectPRs(history, makeSet({ id: 'b', weightKg: 120, reps: 10 }));
    const notBeaten = detectPRs(history, makeSet({ id: 'c', weightKg: 90, reps: 5 }));

    expect(types(beaten)).toContain('best_1rm');
    expect(types(notBeaten)).not.toContain('best_1rm');
  });

  it('detects most_reps at a new heaviest weight', () => {
    const history = [makeSet({ id: 'a', weightKg: 100, reps: 5 })];
    const records = detectPRs(history, makeSet({ id: 'b', weightKg: 110, reps: 1 }));

    expect(types(records)).toContain('most_reps');
  });

  it('does not detect most_reps for fewer reps at a lighter weight', () => {
    const history = [makeSet({ id: 'a', weightKg: 120, reps: 8 })];
    const records = detectPRs(history, makeSet({ id: 'b', weightKg: 80, reps: 5 }));

    expect(types(records)).not.toContain('most_reps');
  });

  it('never counts warmup sets', () => {
    const history = [makeSet({ id: 'a', weightKg: 150, reps: 1 })];
    const records = detectPRs(
      history,
      makeSet({ id: 'b', type: 'warmup', weightKg: 200, reps: 10 }),
    );

    expect(records).toEqual([]);
  });

  it('returns an empty array when no PR is achieved', () => {
    const history = [makeSet({ id: 'a', weightKg: 150, reps: 10 })];
    const records = detectPRs(history, makeSet({ id: 'b', weightKg: 100, reps: 2 }));

    expect(records).toEqual([]);
  });
});

describe('bestRecordsForExercise', () => {
  it('returns one all-time record per type', () => {
    const sets = [
      makeSet({ id: 'a', weightKg: 100, reps: 5, completedAt: 1 }),
      makeSet({ id: 'b', weightKg: 120, reps: 3, completedAt: 2 }),
      makeSet({ id: 'c', weightKg: 120, reps: 8, completedAt: 3 }),
    ];

    const records = bestRecordsForExercise(sets);
    expect(records.map((r) => r.type).sort()).toEqual([
      'best_1rm',
      'heaviest_set',
      'most_reps',
    ]);
    expect(records.find((r) => r.type === 'heaviest_set')?.value).toBe(120);
  });

  it('returns an empty array for no valid history', () => {
    expect(bestRecordsForExercise([makeSet({ type: 'warmup' })])).toEqual([]);
  });
});
