import type { Set } from '../../entities/Set';
import type { Workout } from '../../entities/Workout';
import {
  calculateVolume,
  startOfWeek,
  summarizeVolume,
  weeklyVolume,
} from '../volume';

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

/** Build a finished workout around the provided sets. */
function makeWorkout(startedAt: number, sets: Set[]): Workout {
  return {
    id: `w-${startedAt}`,
    routineId: null,
    routineName: 'Session',
    startedAt,
    finishedAt: startedAt + 3_600_000,
    sets,
  };
}

/** A stable reference timestamp: 2024-01-01T00:00:00Z (a Monday). */
const MONDAY = Date.UTC(2024, 0, 1);

describe('calculateVolume', () => {
  it('excludes warmup sets', () => {
    const sets = [
      makeSet({ id: 'a', type: 'warmup' }),
      makeSet({ id: 'b', weightKg: 100, reps: 5 }),
    ];

    expect(calculateVolume(sets)).toBe(500);
  });

  it('excludes uncompleted sets', () => {
    const sets = [
      makeSet({ id: 'a', completed: false }),
      makeSet({ id: 'b', weightKg: 80, reps: 10 }),
    ];

    expect(calculateVolume(sets)).toBe(800);
  });

  it('sums weight times reps across sets', () => {
    const sets = [
      makeSet({ id: 'a', weightKg: 60, reps: 10 }),
      makeSet({ id: 'b', weightKg: 100, reps: 5 }),
    ];

    expect(calculateVolume(sets)).toBe(1100);
  });
});

describe('summarizeVolume', () => {
  it('returns a correct per-exercise breakdown', () => {
    const sets = [
      makeSet({ id: 'a', exerciseId: 'bench', weightKg: 100, reps: 5 }),
      makeSet({ id: 'b', exerciseId: 'bench', weightKg: 80, reps: 5 }),
      makeSet({ id: 'c', exerciseId: 'row', weightKg: 50, reps: 10 }),
      makeSet({ id: 'd', exerciseId: 'row', type: 'warmup' }),
    ];

    expect(summarizeVolume(sets)).toEqual({
      total: 1400,
      sets: 3,
      reps: 20,
      perExercise: { bench: 900, row: 500 },
    });
  });
});

describe('weeklyVolume', () => {
  it('groups sessions by week', () => {
    const weekOne = makeWorkout(MONDAY, [
      makeSet({ id: 'a', weightKg: 100, reps: 5 }),
    ]);
    const weekTwo = makeWorkout(MONDAY + 7 * 24 * 60 * 60 * 1000, [
      makeSet({ id: 'b', weightKg: 100, reps: 10 }),
    ]);

    expect(weeklyVolume([weekOne, weekTwo], 'monday')).toEqual([
      { weekStartMs: MONDAY, volume: 500 },
      { weekStartMs: MONDAY + 7 * 24 * 60 * 60 * 1000, volume: 1000 },
    ]);
  });

  it('respects weekStart = sunday', () => {
    // 2024-01-01 is a Monday; with a Sunday week start its week begins
    // on 2023-12-31.
    const sunday = Date.UTC(2023, 11, 31);
    expect(startOfWeek(MONDAY, 'sunday')).toBe(sunday);
    expect(startOfWeek(MONDAY, 'monday')).toBe(MONDAY);
  });
});
