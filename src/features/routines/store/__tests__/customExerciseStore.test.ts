import { buildCustomExercise, useCustomExerciseStore } from '../customExerciseStore';

const INPUT = {
  name: '  Landmine Press  ',
  muscleGroup: 'shoulders' as const,
  equipment: 'barbell' as const,
  measure: 'reps' as const,
  perSide: true,
};

beforeEach(() => useCustomExerciseStore.setState({ exercises: [] }));

describe('buildCustomExercise', () => {
  it('builds a custom, active exercise with a prefixed id and trimmed name', () => {
    const exercise = buildCustomExercise(INPUT, 42);

    expect(exercise.id.startsWith('custom-')).toBe(true);
    expect(exercise).toMatchObject({
      name: 'Landmine Press',
      perSide: true,
      isCustom: true,
      isArchived: false,
      createdAt: 42,
      updatedAt: 42,
    });
    expect(exercise.measure).toBeUndefined();
  });

  it('marks a timed exercise', () => {
    expect(buildCustomExercise({ ...INPUT, measure: 'time' }, 1).measure).toBe('time');
  });
});

describe('useCustomExerciseStore', () => {
  it('stores created exercises', () => {
    const created = useCustomExerciseStore.getState().createExercise(INPUT, 1);
    expect(useCustomExerciseStore.getState().exercises).toEqual([created]);
  });
});
