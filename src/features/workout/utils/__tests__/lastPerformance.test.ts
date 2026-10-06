import type { Set } from '@domain/entities';

import { recentSessions, summarizeLastPerformance } from '../lastPerformance';

function set(overrides: Partial<Set>): Set {
  return {
    id: 's',
    exerciseId: 'e',
    workoutId: 'w1',
    weightKg: 80,
    reps: 8,
    type: 'normal',
    completed: true,
    completedAt: 1,
    order: 0,
    ...overrides,
  };
}

describe('summarizeLastPerformance', () => {
  it('lists weight and reps', () => {
    expect(summarizeLastPerformance([set({}), set({ reps: 7 })])).toBe('80kg × 8, 7');
  });

  it('drops the weight for unloaded sets', () => {
    expect(summarizeLastPerformance([set({ weightKg: 0, reps: 12 })])).toBe('12 reps');
  });

  it('marks per-side sets', () => {
    expect(summarizeLastPerformance([set({ weightKg: 30, perSide: true })])).toBe('30kg × 8 per side');
  });

  it('lists holds for timed sets, with any added load', () => {
    const holds = [set({ weightKg: 0, reps: 0, durationSec: 45 }), set({ weightKg: 0, reps: 0, durationSec: 40 })];
    expect(summarizeLastPerformance(holds)).toBe('0:45, 0:40');
    expect(summarizeLastPerformance([set({ weightKg: 10, reps: 0, durationSec: 60 })])).toBe('+10kg · 1:00');
  });

  it('returns null without history', () => {
    expect(summarizeLastPerformance([])).toBeNull();
  });
});

describe('recentSessions', () => {
  it('groups working sets by session, newest first, in set order', () => {
    const history = [
      set({ id: 'a1', workoutId: 'a', reps: 5 }),
      set({ id: 'b1', workoutId: 'b', reps: 6 }),
      set({ id: 'bw', workoutId: 'b', type: 'warmup' }),
      set({ id: 'b2', workoutId: 'b', reps: 7 }),
    ];

    expect(recentSessions(history, 3).map((session) => session.map((s) => s.id))).toEqual([
      ['b1', 'b2'],
      ['a1'],
    ]);
  });

  it('stops at the limit', () => {
    const history = ['a', 'b', 'c'].map((id) => set({ id, workoutId: id }));
    expect(recentSessions(history, 2).map((s) => s[0].id)).toEqual(['c', 'b']);
  });
});
