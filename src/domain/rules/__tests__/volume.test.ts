import type { Set } from '../../entities/Set';
import type { Workout } from '../../entities/Workout';
import {
  addWeeks,
  calculateVolume,
  startOfWeek,
  summarizeVolume,
  weeklyVolume,
  weeksBetween,
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

/** Local midnight on 2024-01-01, a Monday. */
const MONDAY = new Date(2024, 0, 1).getTime();

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
    const weekTwo = makeWorkout(new Date(2024, 0, 8).getTime(), [
      makeSet({ id: 'b', weightKg: 100, reps: 10 }),
    ]);

    expect(weeklyVolume([weekOne, weekTwo], 'monday')).toEqual([
      { weekStartMs: MONDAY, volume: 500 },
      { weekStartMs: new Date(2024, 0, 8).getTime(), volume: 1000 },
    ]);
  });

  it('respects weekStart = sunday', () => {
    // 2024-01-01 is a Monday; with a Sunday week start its week begins
    // on 2023-12-31.
    const sunday = new Date(2023, 11, 31).getTime();
    expect(startOfWeek(MONDAY, 'sunday')).toBe(sunday);
    expect(startOfWeek(MONDAY, 'monday')).toBe(MONDAY);
  });
});

/**
 * The suite runs in America/New_York (see jest.globalSetup.js): west of
 * UTC and with daylight saving, so both local-calendar bugs surface on any
 * machine or CI runner.
 */
describe('startOfWeek local calendar', () => {
  it('keeps a late-Sunday session in the week ending that Sunday', () => {
    const sundayNight = new Date(2024, 0, 7, 21, 30).getTime();
    expect(startOfWeek(sundayNight, 'monday')).toBe(MONDAY);
  });

  it('puts an early-Monday session in the week starting that Monday', () => {
    const mondayEarly = new Date(2024, 0, 8, 1, 0).getTime();
    expect(startOfWeek(mondayEarly, 'monday')).toBe(new Date(2024, 0, 8).getTime());
  });

  it('returns local midnight', () => {
    const start = new Date(startOfWeek(new Date(2024, 0, 10, 15).getTime(), 'monday'));
    expect([start.getDay(), start.getHours(), start.getMinutes()]).toEqual([1, 0, 0]);
  });
});

describe('addWeeks', () => {
  it('lands on local midnight across a daylight-saving change', () => {
    const beforeChange = new Date(2024, 2, 4).getTime();
    expect(addWeeks(beforeChange, 1)).toBe(new Date(2024, 2, 11).getTime());
    expect(addWeeks(new Date(2024, 2, 11).getTime(), -1)).toBe(beforeChange);
  });
});

describe('weeksBetween', () => {
  it('counts whole weeks across a daylight-saving change', () => {
    const from = new Date(2024, 2, 4).getTime();
    expect(weeksBetween(from, new Date(2024, 2, 11).getTime())).toBe(1);
    expect(weeksBetween(from, new Date(2024, 2, 25).getTime())).toBe(3);
  });
});

