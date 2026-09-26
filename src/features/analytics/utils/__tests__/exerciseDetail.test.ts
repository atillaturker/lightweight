/**
 * Behavior tests for the Exercise Detail read model.
 *
 * These pin the 8-week window, the null delta when the previous 8 weeks are
 * empty, handling of 0/1/many sessions, the three historical records derived
 * from the domain rule, and the empty-records case. No rendering involved.
 */
import type { Set as DomainSet, Workout } from '@domain/entities';

import { buildExerciseDetail } from '../exerciseDetail';

const NOW = Date.UTC(2026, 3, 13, 12, 0, 0);
const DAY_MS = 24 * 60 * 60 * 1000;

/** One completed working set at `at`. */
function makeSet(
  exerciseId: string,
  weightKg: number,
  reps: number,
  at: number,
): DomainSet {
  return {
    id: `${exerciseId}-${at}-${weightKg}-${reps}`,
    exerciseId,
    workoutId: 'session',
    weightKg,
    reps,
    type: 'normal',
    completed: true,
    completedAt: at,
    order: 0,
  };
}

/** A session started `daysAgo` before NOW holding the given sets. */
function makeSession(
  id: string,
  daysAgo: number,
  sets: DomainSet[],
): Workout {
  return {
    id,
    routineId: 'routine-1',
    routineName: 'Push',
    startedAt: NOW - daysAgo * DAY_MS,
    finishedAt: NOW - daysAgo * DAY_MS + 30 * 60_000,
    sets,
  };
}

describe('buildExerciseDetail 8-week window', () => {
  it('puts each session in the correct week for the selected metric', () => {
    const sessions = [
      makeSession('a', 0, [makeSet('bench-press', 100, 5, NOW)]),
      makeSession('b', 7, [makeSet('bench-press', 80, 5, NOW - 7 * DAY_MS)]),
    ];

    const oneRm = buildExerciseDetail(sessions, 'bench-press', '1rm', NOW);

    expect(oneRm.points).toHaveLength(8);
    expect(oneRm.points[7]).toBeCloseTo(116.6667, 3);
    expect(oneRm.points[6]).toBeCloseTo(93.3333, 3);
    expect(oneRm.points[0]).toBeNull();
  });

  it('aggregates volume and reps for their metrics', () => {
    const sessions = [
      makeSession('a', 0, [makeSet('bench-press', 100, 10, NOW)]),
    ];

    expect(buildExerciseDetail(sessions, 'bench-press', 'volume', NOW).points[7]).toBe(
      1000,
    );
    expect(buildExerciseDetail(sessions, 'bench-press', 'reps', NOW).points[7]).toBe(
      10,
    );
  });
});

describe('buildExerciseDetail delta', () => {
  it('returns a null delta when the previous 8 weeks are empty', () => {
    const sessions = [
      makeSession('a', 0, [makeSet('bench-press', 100, 10, NOW)]),
    ];

    const data = buildExerciseDetail(sessions, 'bench-press', 'volume', NOW);

    expect(data.delta).toBeNull();
    expect(data.heroDeltaKg).toBeNull();
  });

  it('compares the current window against the previous one', () => {
    const sessions = [
      makeSession('a', 0, [makeSet('bench-press', 100, 10, NOW)]),
      makeSession('b', 56, [makeSet('bench-press', 50, 10, NOW - 56 * DAY_MS)]),
    ];

    const data = buildExerciseDetail(sessions, 'bench-press', 'volume', NOW);

    expect(data.delta).toBe(500);
  });
});

describe('buildExerciseDetail session counts', () => {
  it('handles zero sessions', () => {
    const data = buildExerciseDetail([], 'bench-press', '1rm', NOW);

    expect(data.hasHistory).toBe(false);
    expect(data.heroE1RMKg).toBeNull();
    expect(data.points.every((point) => point === null)).toBe(true);
    expect(data.records).toEqual([]);
    expect(data.recentSets).toEqual([]);
  });

  it('handles a single session', () => {
    const sessions = [
      makeSession('a', 0, [makeSet('bench-press', 100, 5, NOW)]),
    ];

    const data = buildExerciseDetail(sessions, 'bench-press', '1rm', NOW);

    expect(data.recentSets).toHaveLength(1);
    expect(data.hasHistory).toBe(true);
  });

  it('caps recent sessions at six across many weeks', () => {
    const sessions = Array.from({ length: 10 }, (_, index) =>
      makeSession(`s${index}`, index * 7, [
        makeSet('bench-press', 100, 5, NOW - index * 7 * DAY_MS),
      ]),
    );

    const data = buildExerciseDetail(sessions, 'bench-press', '1rm', NOW);

    expect(data.points).toHaveLength(8);
    expect(data.recentSets).toHaveLength(6);
  });
});

describe('buildExerciseDetail records', () => {
  it('returns the three historical bests from the domain rule', () => {
    const sessions = [
      makeSession('a', 0, [makeSet('bench-press', 100, 5, NOW)]),
    ];

    const { records } = buildExerciseDetail(sessions, 'bench-press', '1rm', NOW);

    expect(records.map((row) => row.type)).toEqual([
      'heaviest_set',
      'best_1rm',
      'most_reps',
    ]);
    expect(records[0].weightKg).toBe(100);
    expect(records[0].reps).toBe(5);
    expect(records[1].weightKg).toBeCloseTo(116.6667, 3);
    expect(records[2].reps).toBe(5);
    expect(records[2].weightKg).toBe(100);
  });

  it('returns an empty records list with no history', () => {
    const data = buildExerciseDetail([], 'bench-press', '1rm', NOW);

    expect(data.records).toEqual([]);
  });
});
