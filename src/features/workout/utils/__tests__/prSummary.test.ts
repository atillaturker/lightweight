import type { Set } from '@domain/entities';

import { summarizeSessionPRs } from '../prSummary';

function hold(id: string, durationSec: number, completedAt: number): Set {
  return {
    id,
    exerciseId: 'plank',
    workoutId: 'w',
    weightKg: 0,
    reps: 0,
    durationSec,
    type: 'normal',
    completed: true,
    completedAt,
    order: 0,
  };
}

describe('summarizeSessionPRs', () => {
  it('describes a longest-hold record as a clock', () => {
    const rows = summarizeSessionPRs(
      [hold('b', 75, 2)],
      new Map([['plank', 'Plank']]),
      [hold('a', 60, 1)],
    );

    expect(rows).toEqual([
      { exerciseId: 'plank', exerciseName: 'Plank', description: 'Longest hold · 1:15' },
    ]);
  });
});
