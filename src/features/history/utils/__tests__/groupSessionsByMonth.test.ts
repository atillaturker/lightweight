/**
 * Tests for the month grouper behind the History list.
 *
 * Ordering is the whole point: sections descend by month, and sessions
 * within a month descend by start time regardless of input order.
 */
import type { Workout } from '@domain/entities';

import { groupSessionsByMonth } from '../groupSessionsByMonth';

/** Build a minimal finished workout. */
function makeWorkout(id: string, startedAt: number): Workout {
  return {
    id,
    routineId: null,
    routineName: `Routine ${id}`,
    startedAt,
    finishedAt: startedAt + 60_000,
    sets: [],
  };
}

const JANUARY = new Date(2026, 0, 15).getTime();
const FEBRUARY = new Date(2026, 1, 10).getTime();
const APRIL_EARLY = new Date(2026, 3, 1).getTime();
const APRIL_LATE = new Date(2026, 3, 20).getTime();

describe('groupSessionsByMonth', () => {
  it('groups by month, descending', () => {
    const sections = groupSessionsByMonth([
      makeWorkout('jan', JANUARY),
      makeWorkout('apr', APRIL_LATE),
      makeWorkout('feb', FEBRUARY),
    ]);

    expect(sections.map((section) => section.title)).toEqual([
      'APRIL 2026',
      'FEBRUARY 2026',
      'JANUARY 2026',
    ]);
  });

  it('orders sessions within a month most recent first', () => {
    const sections = groupSessionsByMonth([
      makeWorkout('early', APRIL_EARLY),
      makeWorkout('late', APRIL_LATE),
    ]);

    expect(sections).toHaveLength(1);
    expect(sections[0].data.map((session) => session.id)).toEqual([
      'late',
      'early',
    ]);
  });

  it('handles an empty list', () => {
    expect(groupSessionsByMonth([])).toEqual([]);
  });

  it('handles a single session', () => {
    const sections = groupSessionsByMonth([makeWorkout('solo', APRIL_EARLY)]);

    expect(sections).toHaveLength(1);
    expect(sections[0].key).toBe('2026-04');
    expect(sections[0].data).toHaveLength(1);
  });
});
