/**
 * Behavior tests for the Progress read model.
 *
 * These pin the five metric totals, the null delta when the previous period
 * is empty, the 3+ session filter on the "By exercise" list, and its
 * fastest-improving sort order. No rendering is involved.
 */
import type { Set as DomainSet, Workout } from '@domain/entities';

import { buildProgressData } from '../progressData';

const NAMES = new Map<string, string>([
  ['bench-press', 'Bench Press'],
  ['barbell-row', 'Barbell Row'],
  ['squat', 'Squat'],
]);

/** Fixed Monday-ish reference point; fixtures use whole-week offsets. */
const NOW = Date.UTC(2026, 3, 13, 12, 0, 0);

const DAY_MS = 24 * 60 * 60 * 1000;

/** One completed working set. */
function makeSet(
  exerciseId: string,
  weightKg: number,
  reps: number,
  completedAt: number,
): DomainSet {
  return {
    id: `${exerciseId}-${completedAt}`,
    exerciseId,
    workoutId: 'session',
    weightKg,
    reps,
    type: 'normal',
    completed: true,
    completedAt,
    order: 0,
  };
}

/** A 30-minute session started `daysAgo` before NOW. */
function makeSession(
  id: string,
  daysAgo: number,
  sets: DomainSet[],
): Workout {
  const startedAt = NOW - daysAgo * DAY_MS;
  return {
    id,
    routineId: 'routine-1',
    routineName: 'Push',
    startedAt,
    finishedAt: startedAt + 30 * 60_000,
    sets: sets.map((set) => ({ ...set, workoutId: id })),
  };
}

/** A session holding one exercise at a fixed weight and rep count. */
function sessionOf(
  id: string,
  daysAgo: number,
  lifts: Array<{ exerciseId: string; weightKg: number; reps: number }>,
): Workout {
  const startedAt = NOW - daysAgo * DAY_MS;
  const sets = lifts.map((lift) =>
    makeSet(lift.exerciseId, lift.weightKg, lift.reps, startedAt),
  );
  return makeSession(id, daysAgo, sets);
}

describe('buildProgressData totals', () => {
  it('returns the correct total for each of the five metrics', () => {
    const sessions = [
      sessionOf('s1', 0, [{ exerciseId: 'bench-press', weightKg: 100, reps: 10 }]),
      sessionOf('s2', 7, [{ exerciseId: 'bench-press', weightKg: 100, reps: 10 }]),
    ];

    const data = buildProgressData(sessions, '4W', 'volume', NOW, NAMES);

    expect(data.totals).toEqual({
      volume: 2000,
      sets: 2,
      reps: 20,
      time: 60,
      sessions: 2,
    });
  });

  it('exposes three weekly and three monthly axis labels', () => {
    const sessions = [sessionOf('s1', 0, [])];

    const weekly = buildProgressData(sessions, '4W', 'volume', NOW, NAMES);
    expect(weekly.bucketLabels).toEqual(['W1', 'W2', 'W4']);

    const monthly = buildProgressData(sessions, '6M', 'volume', NOW, NAMES);
    expect(monthly.bucketLabels).toHaveLength(3);
  });
});

describe('buildProgressData deltas', () => {
  it('computes a null delta when the previous period is empty', () => {
    const sessions = [
      sessionOf('s1', 0, [{ exerciseId: 'bench-press', weightKg: 100, reps: 10 }]),
    ];

    const data = buildProgressData(sessions, '4W', 'volume', NOW, NAMES);

    expect(data.deltas.volume).toBeNull();
    expect(data.deltas.sets).toBeNull();
    expect(data.deltas.reps).toBeNull();
    expect(data.deltas.time).toBeNull();
    expect(data.deltas.sessions).toBeNull();
  });

  it('computes a percent delta when the previous period has data', () => {
    const sessions = [
      sessionOf('s1', 0, [{ exerciseId: 'bench-press', weightKg: 100, reps: 10 }]),
      sessionOf('p1', 28, [{ exerciseId: 'bench-press', weightKg: 50, reps: 10 }]),
    ];

    const data = buildProgressData(sessions, '4W', 'volume', NOW, NAMES);

    expect(data.deltas.volume).toBe(100);
  });
});

describe('buildProgressData exercise rows', () => {
  it('filters to exercises with 3+ sessions in the period', () => {
    const sessions = [
      sessionOf('s1', 0, [
        { exerciseId: 'bench-press', weightKg: 100, reps: 10 },
        { exerciseId: 'squat', weightKg: 120, reps: 5 },
      ]),
      sessionOf('s2', 7, [
        { exerciseId: 'bench-press', weightKg: 100, reps: 10 },
        { exerciseId: 'squat', weightKg: 120, reps: 5 },
      ]),
      sessionOf('s3', 14, [{ exerciseId: 'bench-press', weightKg: 100, reps: 10 }]),
    ];

    const data = buildProgressData(sessions, '4W', 'volume', NOW, NAMES);

    expect(data.exerciseRows.map((row) => row.exerciseId)).toEqual([
      'bench-press',
    ]);
  });

  it('orders the fastest-improving lift first', () => {
    const current = [0, 7, 14].map((daysAgo, index) =>
      sessionOf(`c${index}`, daysAgo, [
        { exerciseId: 'bench-press', weightKg: 100, reps: 10 },
        { exerciseId: 'barbell-row', weightKg: 60, reps: 10 },
      ]),
    );
    const previous = [28, 35, 42].map((daysAgo, index) =>
      sessionOf(`p${index}`, daysAgo, [
        { exerciseId: 'bench-press', weightKg: 50, reps: 10 },
        { exerciseId: 'barbell-row', weightKg: 90, reps: 10 },
      ]),
    );

    const data = buildProgressData(
      [...current, ...previous],
      '4W',
      'volume',
      NOW,
      NAMES,
    );

    expect(data.exerciseRows.map((row) => row.exerciseId)).toEqual([
      'bench-press',
      'barbell-row',
    ]);
    expect(data.exerciseRows[0].deltaPercent).toBeGreaterThan(
      data.exerciseRows[1].deltaPercent ?? -Infinity,
    );
  });
});

describe('buildProgressData period state', () => {
  it('reports no period when only older sessions exist', () => {
    const sessions = [
      sessionOf('p1', 28, [{ exerciseId: 'bench-press', weightKg: 100, reps: 10 }]),
    ];

    const data = buildProgressData(sessions, '4W', 'volume', NOW, NAMES);

    expect(data.hasHistory).toBe(true);
    expect(data.hasPeriod).toBe(false);
    expect(data.totals.sessions).toBe(0);
  });
});
