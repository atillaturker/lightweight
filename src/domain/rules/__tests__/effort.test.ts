import type { Set } from '../../entities/Set';
import { averageRpe, hasRpeData, isValidRpe } from '../effort';

/** Build a completed working set with sensible defaults. */
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

describe('isValidRpe', () => {
  it('accepts whole and half steps from 1 to 10', () => {
    expect([1, 7.5, 8, 10].every(isValidRpe)).toBe(true);
  });

  it('rejects values off the scale', () => {
    expect(isValidRpe(0)).toBe(false);
    expect(isValidRpe(10.5)).toBe(false);
  });

  it('rejects values between half steps', () => {
    expect(isValidRpe(8.3)).toBe(false);
  });
});

describe('averageRpe', () => {
  it('averages the rated working sets', () => {
    expect(averageRpe([makeSet({ rpe: 7 }), makeSet({ rpe: 9 })])).toBe(8);
  });

  it('skips unrated sets instead of counting them as zero', () => {
    expect(averageRpe([makeSet({ rpe: 8 }), makeSet()])).toBe(8);
  });

  it('ignores warmup and incomplete sets', () => {
    const sets = [
      makeSet({ rpe: 9 }),
      makeSet({ rpe: 4, type: 'warmup' }),
      makeSet({ rpe: 4, completed: false }),
    ];
    expect(averageRpe(sets)).toBe(9);
  });

  it('returns null when nothing is rated', () => {
    expect(averageRpe([makeSet()])).toBeNull();
  });
});

describe('hasRpeData', () => {
  it('reports whether any working set is rated', () => {
    expect(hasRpeData([makeSet()])).toBe(false);
    expect(hasRpeData([makeSet(), makeSet({ rpe: 8 })])).toBe(true);
  });
});
