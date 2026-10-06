import type { Routine, Workout } from '@domain/entities';

import { buildWeekPlan, isMovable, moveTargets } from '../weekPlan';

/** Wednesday 7 October 2026, 10:00 local. */
const NOW = new Date(2026, 9, 7, 10).getTime();
const day = (date: number, hour = 0): number => new Date(2026, 9, date, hour).getTime();

function routine(id: string, days: Routine['days']): Routine {
  return { id, name: id, exercises: [], createdAt: 0, updatedAt: 0, isArchived: false, days };
}

function session(startedAt: number): Workout {
  return { id: `s-${startedAt}`, routineId: null, routineName: '', startedAt, finishedAt: startedAt + 1, sets: [] };
}

describe('buildWeekPlan', () => {
  const routines = [routine('Push', [1, 5]), routine('Pull', [3])];

  it('lists Monday to Sunday with the planned routine names', () => {
    const plan = buildWeekPlan(NOW, routines, {}, []);
    expect(plan.map((entry) => entry.date)).toEqual([5, 6, 7, 8, 9, 10, 11].map((date) => day(date)));
    expect(plan.map((entry) => entry.routineName)).toEqual(['Push', null, 'Pull', null, 'Push', null, null]);
  });

  it('marks trained, missed, today, planned and rest days', () => {
    const plan = buildWeekPlan(NOW, routines, {}, [session(day(6, 18))]);
    expect(plan.map((entry) => entry.status)).toEqual([
      'missed', 'done', 'today', 'rest', 'planned', 'rest', 'rest',
    ]);
  });

  it('follows a one-off move and flags it', () => {
    const plan = buildWeekPlan(NOW, routines, { '2026-10-07': null, '2026-10-08': 'Pull' }, []);
    expect(plan[2]).toMatchObject({ status: 'rest', moved: true });
    expect(plan[3]).toMatchObject({ routineName: 'Pull', status: 'planned', moved: true });
  });
});

describe('isMovable', () => {
  it('allows only sessions not yet trained', () => {
    const plan = buildWeekPlan(NOW, [routine('Push', [1, 3])], {}, [session(day(5, 9))]);
    expect(isMovable(plan[0])).toBe(false);
    expect(isMovable(plan[2])).toBe(true);
    expect(isMovable(plan[1])).toBe(false);
  });
});

describe('moveTargets', () => {
  it('offers today and the six days after, minus the source day', () => {
    const targets = moveTargets(NOW, day(7), [routine('Push', [5])], {});
    expect(targets.map((target) => target.date)).toEqual([8, 9, 10, 11, 12, 13].map((date) => day(date)));
    expect(targets[1].routineName).toBe('Push');
  });

  it('steps calendar days across the end of daylight saving', () => {
    const late = new Date(2026, 10, 1, 10).getTime();
    const targets = moveTargets(late, day(5), [], {});
    expect(targets.map((target) => new Date(target.date).getDate())).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(targets.every((target) => new Date(target.date).getHours() === 0)).toBe(true);
  });
});
