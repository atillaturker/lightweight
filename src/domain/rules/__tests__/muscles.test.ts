import type { Set } from '../../entities/Set';
import {
  calculateMuscleLoad,
  emptyMuscleLoad,
  exerciseRegions,
  intensityLevels,
  regionOfMuscle,
  routineMuscleLoad,
  untrainedRegions,
} from '../muscles';

function makeSet(exerciseId: string, overrides: Partial<Set> = {}): Set {
  return {
    id: `${exerciseId}-${Math.random()}`,
    exerciseId,
    workoutId: 'w',
    weightKg: 60,
    reps: 8,
    type: 'normal',
    completed: true,
    completedAt: 1,
    order: 0,
    ...overrides,
  };
}

describe('regionOfMuscle', () => {
  it('maps dataset names case-insensitively and ignores undrawable ones', () => {
    expect(regionOfMuscle('Pectorals')).toBe('chest');
    expect(regionOfMuscle('rhomboids')).toBe('upperBack');
    expect(regionOfMuscle('ankles')).toBeNull();
  });
});

describe('exerciseRegions', () => {
  it('uses target and secondary muscles, never repeating a primary', () => {
    const regions = exerciseRegions({
      muscleGroup: 'chest',
      targetMuscle: 'pectorals',
      secondaryMuscles: ['triceps', 'shoulders', 'chest'],
    });
    expect(regions).toEqual({ primary: ['chest'], secondary: ['triceps', 'shoulders'] });
  });

  it('falls back to the muscle group for a custom exercise', () => {
    expect(exerciseRegions({ muscleGroup: 'back' })).toEqual({ primary: ['lats', 'upperBack'], secondary: [] });
  });
});

describe('calculateMuscleLoad', () => {
  const regionsOf = (id: string) =>
    id === 'bench' ? { primary: ['chest' as const], secondary: ['triceps' as const] } : null;

  it('adds a full set to primary and half to secondary regions', () => {
    const load = calculateMuscleLoad([makeSet('bench'), makeSet('bench')], regionsOf);
    expect(load.chest).toBe(2);
    expect(load.triceps).toBe(1);
  });

  it('skips warmups and unknown exercises', () => {
    const load = calculateMuscleLoad([makeSet('bench', { type: 'warmup' }), makeSet('mystery')], regionsOf);
    expect(load.chest).toBe(0);
  });
});

describe('intensityLevels', () => {
  it('scales relative to the most-trained region, with any work at least 1', () => {
    const load = { ...emptyMuscleLoad(), chest: 12, triceps: 1, lats: 6 };
    const levels = intensityLevels(load);
    expect(levels.chest).toBe(4);
    expect(levels.lats).toBe(2);
    expect(levels.triceps).toBe(1);
    expect(levels.calves).toBe(0);
  });

  it('is all zero without training', () => {
    expect(Object.values(intensityLevels(emptyMuscleLoad())).every((level) => level === 0)).toBe(true);
  });
});

describe('untrainedRegions', () => {
  it('lists regions with no work in display order', () => {
    const load = { ...emptyMuscleLoad(), chest: 1 };
    const untrained = untrainedRegions(load);
    expect(untrained).not.toContain('chest');
    expect(untrained[0]).toBe('shoulders');
  });
});

describe('routineMuscleLoad', () => {
  it('weights each slot by its target sets', () => {
    const regionsOf = (id: string) =>
      id === 'bench' ? { primary: ['chest' as const], secondary: ['triceps' as const] } : null;
    const load = routineMuscleLoad([{ exerciseId: 'bench', targetSets: 4 }, { exerciseId: 'x', targetSets: 3 }], regionsOf);
    expect(load.chest).toBe(4);
    expect(load.triceps).toBe(2);
  });
});
