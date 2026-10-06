import type { Equipment, Exercise, MuscleGroup } from '@domain/entities';

import {
  filterExercises,
  toggleEquipment,
  visibleEquipment,
  type ExerciseFilter,
} from '../exerciseFilter';

function exercise(id: string, muscleGroup: MuscleGroup, equipment: Equipment): Exercise {
  return {
    id,
    name: id.replace(/-/g, ' '),
    muscleGroup,
    equipment,
    pictogramId: `ex-${id}`,
    isCustom: false,
    isArchived: false,
    createdAt: 0,
  };
}

const LIBRARY = [
  exercise('bench-press', 'chest', 'barbell'),
  exercise('dumbbell-fly', 'chest', 'dumbbell'),
  exercise('push-up', 'chest', 'bodyweight'),
  exercise('goblet-squat', 'legs', 'kettlebell'),
];

function filter(overrides: Partial<ExerciseFilter> = {}): ExerciseFilter {
  return { query: '', group: null, equipment: new Set(), ...overrides };
}

describe('filterExercises', () => {
  it('keeps only the selected equipment types', () => {
    const result = filterExercises(LIBRARY, filter({ equipment: new Set(['barbell', 'dumbbell']) }));
    expect(result.map((e) => e.id)).toEqual(['bench-press', 'dumbbell-fly']);
  });

  it('treats an empty equipment selection as any', () => {
    expect(filterExercises(LIBRARY, filter())).toHaveLength(4);
  });

  it('combines equipment with the muscle group and search', () => {
    const result = filterExercises(
      LIBRARY,
      filter({ group: 'chest', query: 'push', equipment: new Set(['bodyweight']) }),
    );
    expect(result.map((e) => e.id)).toEqual(['push-up']);
  });
});

describe('visibleEquipment', () => {
  it('offers only equipment that has results for the muscle group', () => {
    expect(visibleEquipment(LIBRARY, filter({ group: 'legs' }))).toEqual(['kettlebell']);
  });

  it('keeps a selected type visible so it can be turned off', () => {
    const shown = visibleEquipment(LIBRARY, filter({ group: 'legs', equipment: new Set(['barbell']) }));
    expect(shown).toEqual(['barbell', 'kettlebell']);
  });
});

describe('toggleEquipment', () => {
  it('adds and removes a type without mutating the input', () => {
    const empty = new Set<Equipment>();
    const added = toggleEquipment(empty, 'cable');
    expect([...added]).toEqual(['cable']);
    expect(empty.size).toBe(0);
    expect(toggleEquipment(added, 'cable').size).toBe(0);
  });
});
