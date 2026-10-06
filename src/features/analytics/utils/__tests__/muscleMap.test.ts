import type { Exercise, Set as DomainSet, Workout } from '@domain/entities';

import { buildMuscleMap } from '../muscleMap';

const NOW = new Date(2026, 3, 13, 12).getTime();
const DAY = 24 * 60 * 60 * 1000;

const LIBRARY: Exercise[] = [
  {
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
  },
];

function session(id: string, daysAgo: number, sets: number): Workout {
  const startedAt = NOW - daysAgo * DAY;
  const list: DomainSet[] = Array.from({ length: sets }, (_, index) => ({
    id: `${id}-${index}`,
    exerciseId: 'bench-press',
    workoutId: id,
    weightKg: 80,
    reps: 8,
    type: 'normal',
    completed: true,
    completedAt: startedAt,
    order: index,
  }));
  return { id, routineId: null, routineName: 'Push', startedAt, finishedAt: startedAt + 1, sets: list };
}

describe('buildMuscleMap', () => {
  it('counts only sessions inside the window', () => {
    const sessions = [session('recent', 2, 3), session('old', 20, 5)];

    expect(buildMuscleMap(sessions, LIBRARY, 'week', NOW).load.chest).toBe(3);
    expect(buildMuscleMap(sessions, LIBRARY, 'month', NOW).load.chest).toBe(8);
  });

  it('shades primary work darker than secondary work', () => {
    const { levels, load } = buildMuscleMap([session('s', 1, 4)], LIBRARY, 'week', NOW);

    expect(load.triceps).toBe(2);
    expect(levels.chest).toBe(4);
    expect(levels.triceps).toBe(2);
  });

  it('lists the untrained regions and reports no data without sessions', () => {
    const empty = buildMuscleMap([], LIBRARY, 'week', NOW);
    expect(empty.hasData).toBe(false);

    const trained = buildMuscleMap([session('s', 1, 1)], LIBRARY, 'week', NOW);
    expect(trained.hasData).toBe(true);
    expect(trained.untrained).not.toContain('chest');
    expect(trained.untrained).toContain('calves');
  });
});
