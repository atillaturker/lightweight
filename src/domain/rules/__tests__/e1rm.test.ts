import type { Set } from '../../entities/Set';
import { bestE1RM, calculateE1RM } from '../e1rm';

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

describe('calculateE1RM', () => {
  it('returns the raw weight for a single rep', () => {
    expect(calculateE1RM(100, 1)).toBe(100);
  });

  it('applies the Epley formula for multiple reps', () => {
    expect(calculateE1RM(100, 10)).toBeCloseTo(133.333, 3);
  });

  it('throws when reps is zero or negative', () => {
    expect(() => calculateE1RM(100, 0)).toThrow('reps must be positive');
    expect(() => calculateE1RM(100, -3)).toThrow('reps must be positive');
  });

  it('throws on a negative weight', () => {
    expect(() => calculateE1RM(-5, 5)).toThrow('weightKg cannot be negative');
  });
});

describe('bestE1RM', () => {
  it('ignores warmup sets', () => {
    const sets = [
      makeSet({ id: 'a', type: 'warmup', weightKg: 200, reps: 5 }),
      makeSet({ id: 'b', weightKg: 100, reps: 5 }),
    ];

    expect(bestE1RM(sets)?.value).toBeCloseTo(116.667, 3);
  });

  it('ignores uncompleted sets', () => {
    const sets = [
      makeSet({ id: 'a', completed: false, weightKg: 200, reps: 5 }),
      makeSet({ id: 'b', weightKg: 100, reps: 5 }),
    ];

    expect(bestE1RM(sets)?.value).toBeCloseTo(116.667, 3);
  });

  it('returns the best estimate and its source set', () => {
    const sets = [
      makeSet({ id: 'a', weightKg: 100, reps: 5 }),
      makeSet({ id: 'b', weightKg: 120, reps: 3 }),
    ];

    expect(bestE1RM(sets)).toEqual({
      value: calculateE1RM(120, 3),
      sourceSet: { weightKg: 120, reps: 3 },
    });
  });

  it('returns null for empty input', () => {
    expect(bestE1RM([])).toBeNull();
  });
});
