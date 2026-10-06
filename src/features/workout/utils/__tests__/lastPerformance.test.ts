import type { Set } from '@domain/entities';

import { summarizeLastPerformance } from '../lastPerformance';

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
