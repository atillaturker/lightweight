import type { Routine, Weekday } from '../../entities/Routine';
import { hasWeeklyPlan, moveSession, nextPlannedDay, plannedRoutineId, weekPlan } from '../schedule';

function routine(id: string, days: Weekday[] = [], isArchived = false): Routine {
  return { id, name: id, exercises: [], createdAt: 0, updatedAt: 0, isArchived, days };
}

// Monday 15 April 2024 … Sunday 21 April.
const MON = new Date(2024, 3, 15).getTime();
const day = (offset: number) => new Date(2024, 3, 15 + offset, 9).getTime();
const ROUTINES = [routine('push', [1, 4]), routine('pull', [2, 5]), routine('legs', [3])];

describe('plannedRoutineId', () => {
  it('reads the weekly plan by weekday', () => {
    expect(plannedRoutineId(day(0), ROUTINES, {})).toBe('push');
    expect(plannedRoutineId(day(2), ROUTINES, {})).toBe('legs');
    expect(plannedRoutineId(day(5), ROUTINES, {})).toBeNull();
  });

  it('lets a one-off change win, including a rest day', () => {
    expect(plannedRoutineId(day(0), ROUTINES, { '2024-04-15': null })).toBeNull();
    expect(plannedRoutineId(day(5), ROUTINES, { '2024-04-20': 'legs' })).toBe('legs');
  });

  it('ignores archived routines', () => {
    expect(plannedRoutineId(day(0), [routine('push', [1], true)], {})).toBeNull();
    expect(hasWeeklyPlan([routine('push', [1], true), routine('free')])).toBe(false);
  });
});

describe('weekPlan', () => {
  it('lists seven days and marks moved ones', () => {
    const plan = weekPlan(MON, ROUTINES, { '2024-04-20': 'legs' });
    expect(plan.map((d) => d.routineId)).toEqual(['push', 'pull', 'legs', 'push', 'pull', 'legs', null]);
    expect(plan.map((d) => d.moved)).toEqual([false, false, false, false, false, true, false]);
  });
});

describe('nextPlannedDay', () => {
  it("returns today's session until today is trained", () => {
    expect(nextPlannedDay(day(0), ROUTINES, {}, false)).toEqual({ date: MON, routineId: 'push' });
    expect(nextPlannedDay(day(0), ROUTINES, {}, true)?.routineId).toBe('pull');
  });

  it('skips rest days', () => {
    expect(nextPlannedDay(day(5), ROUTINES, {}, false)).toEqual({ date: new Date(2024, 3, 22).getTime(), routineId: 'push' });
  });

  it('returns null without a plan', () => {
    expect(nextPlannedDay(day(0), [routine('free')], {}, false)).toBeNull();
  });
});

describe('moveSession', () => {
  it('moves a session to a rest day for that date only', () => {
    const overrides = moveSession({}, ROUTINES, day(0), day(5), day(0));
    expect(overrides).toEqual({ '2024-04-15': null, '2024-04-20': 'push' });
    expect(plannedRoutineId(new Date(2024, 3, 22).getTime(), ROUTINES, overrides)).toBe('push');
  });

  it('swaps with a session already on the target day', () => {
    const overrides = moveSession({}, ROUTINES, day(0), day(1), day(0));
    expect(overrides).toEqual({ '2024-04-15': 'pull', '2024-04-16': 'push' });
  });

  it('does nothing for a rest day or the same day', () => {
    const empty = {};
    expect(moveSession(empty, ROUTINES, day(5), day(6), day(0))).toBe(empty);
    expect(moveSession(empty, ROUTINES, day(0), day(0), day(0))).toBe(empty);
  });

  it('drops one-off changes older than two weeks', () => {
    const overrides = moveSession({ '2024-03-01': null }, ROUTINES, day(0), day(5), day(0));
    expect(Object.keys(overrides)).not.toContain('2024-03-01');
  });
});
