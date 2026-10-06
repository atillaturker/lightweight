import type { Exercise, Set } from '@domain/entities';

import { sessionMuscles } from '../sessionMuscles';

const BENCH: Exercise = {
  id: 'bench-press',
  name: 'Bench Press',
  muscleGroup: 'chest',
  equipment: 'barbell',
  targetMuscle: 'pectorals',
  secondaryMuscles: ['triceps'],
  pictogramId: '',
  isCustom: false,
  isArchived: false,
  createdAt: 0,
};

function set(id: string): Set {
  return {
    id,
    exerciseId: 'bench-press',
    workoutId: 'w',
    weightKg: 80,
    reps: 8,
    type: 'normal',
    completed: true,
    completedAt: 1,
    order: 0,
  };
}

describe('sessionMuscles', () => {
  it('shades the session regions and lists them most-trained first', () => {
    const result = sessionMuscles([set('a'), set('b')], [BENCH]);

    expect(result.trained).toEqual(['chest', 'triceps']);
    expect(result.levels.chest).toBe(4);
    expect(result.levels.calves).toBe(0);
  });

  it('trains nothing for unknown exercises', () => {
    expect(sessionMuscles([set('a')], []).trained).toEqual([]);
  });
});
