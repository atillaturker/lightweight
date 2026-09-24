import type { Set } from '../../entities/Set';
import type { Workout } from '../../entities/Workout';
import { currentWeeklyStreak, longestWeeklyStreak } from '../streak';

const DAY = 24 * 60 * 60 * 1000;
const WEEK = 7 * DAY;

/** A stable reference timestamp: 2024-01-01T00:00:00Z (a Monday). */
const MONDAY = Date.UTC(2024, 0, 1);

/** Build a completed working set. */
function makeSet(overrides: Partial<Set> = {}): Set {
  return {
    id: 's1',
    exerciseId: 'bench',
    workoutId: 'w1',
    weightKg: 100,
    reps: 5,
    type: 'normal',
    completed: true,
    completedAt: MONDAY,
    order: 0,
    ...overrides,
  };
}

/** Build a finished 60-minute workout starting at `startedAt`. */
function makeWorkout(startedAt: number, sets: Set[] = [makeSet()]): Workout {
  return {
    id: `w-${startedAt}`,
    routineId: null,
    routineName: 'Session',
    startedAt,
    finishedAt: startedAt + 60 * 60 * 1000,
    sets,
  };
}

describe('currentWeeklyStreak', () => {
  it('returns 0 with no sessions', () => {
    expect(currentWeeklyStreak([], 'monday', MONDAY)).toBe(0);
  });

  it('returns 1 for a single current-week session', () => {
    const sessions = [makeWorkout(MONDAY + 2 * DAY)];
    expect(currentWeeklyStreak(sessions, 'monday', MONDAY + 3 * DAY)).toBe(1);
  });

  it('counts consecutive weeks', () => {
    const sessions = [
      makeWorkout(MONDAY),
      makeWorkout(MONDAY + WEEK),
      makeWorkout(MONDAY + 2 * WEEK),
    ];
    expect(currentWeeklyStreak(sessions, 'monday', MONDAY + 2 * WEEK)).toBe(3);
  });

  it('breaks on a missing week', () => {
    const sessions = [
      makeWorkout(MONDAY),
      makeWorkout(MONDAY + 2 * WEEK),
    ];
    expect(currentWeeklyStreak(sessions, 'monday', MONDAY + 2 * WEEK)).toBe(1);
  });

  it('ignores sessions under 30 minutes', () => {
    const quick = makeWorkout(MONDAY);
    quick.finishedAt = quick.startedAt + 20 * 60 * 1000;
    expect(currentWeeklyStreak([quick], 'monday', MONDAY)).toBe(0);
  });

  it('ignores sessions with no completed working sets', () => {
    const empty = makeWorkout(MONDAY, [makeSet({ completed: false })]);
    expect(currentWeeklyStreak([empty], 'monday', MONDAY)).toBe(0);
  });

  it('returns 0 when the current week has no session', () => {
    const sessions = [makeWorkout(MONDAY)];
    expect(currentWeeklyStreak(sessions, 'monday', MONDAY + 2 * WEEK)).toBe(0);
  });
});

describe('longestWeeklyStreak', () => {
  it('finds the historical maximum', () => {
    const sessions = [
      makeWorkout(MONDAY),
      makeWorkout(MONDAY + WEEK),
      makeWorkout(MONDAY + 3 * WEEK),
      makeWorkout(MONDAY + 4 * WEEK),
      makeWorkout(MONDAY + 5 * WEEK),
    ];
    expect(longestWeeklyStreak(sessions, 'monday')).toBe(3);
  });

  it('returns 0 with no qualifying sessions', () => {
    expect(longestWeeklyStreak([], 'monday')).toBe(0);
  });
});
