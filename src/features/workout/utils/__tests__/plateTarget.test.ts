import type { ActiveExercise, ActiveSet } from '../../types';
import { initialPlateTarget } from '../plateTarget';

function set(weightKg: number, completed: boolean): ActiveSet {
  return { id: `${weightKg}-${completed}`, weightKg, reps: 5, type: 'normal', completed, completedAt: null, isPR: false };
}

function exercise(sets: ActiveSet[]): ActiveExercise {
  return { exerciseId: 'squat', name: 'Squat', pictogramId: '', order: 0, sets };
}

describe('initialPlateTarget', () => {
  it('uses the first set not yet completed', () => {
    expect(initialPlateTarget(exercise([set(80, true), set(100, false)]), 'kg')).toBe(100);
  });

  it('falls back to the last set once every set is done', () => {
    expect(initialPlateTarget(exercise([set(80, true), set(90, true)]), 'kg')).toBe(90);
  });

  it('converts to pounds and rounds to the 5 lb step', () => {
    expect(initialPlateTarget(exercise([set(100, false)]), 'lb')).toBe(220);
  });

  it('starts at the bar when no weight is set', () => {
    expect(initialPlateTarget(exercise([set(0, false)]), 'kg')).toBe(20);
    expect(initialPlateTarget(exercise([]), 'lb')).toBe(45);
  });
});
