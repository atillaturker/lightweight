import type { Exercise } from '@domain/entities';

import {
  fromCustomExerciseDocument,
  isCustomExerciseDocument,
  mergeCustomExercises,
  toCustomExerciseDocument,
} from '../customExerciseDocument';

function custom(id: string, overrides: Partial<Exercise> = {}): Exercise {
  return {
    id: `custom-${id}`,
    name: `Exercise ${id}`,
    muscleGroup: 'back',
    equipment: 'machine',
    pictogramId: `ex-custom-${id}`,
    isCustom: true,
    isArchived: false,
    createdAt: 1,
    updatedAt: 1,
    ...overrides,
  };
}

describe('custom exercise documents', () => {
  it('round-trips an exercise, including timed and per-side', () => {
    const exercise = custom('a', { measure: 'time', perSide: true, updatedAt: 5 });
    const document = toCustomExerciseDocument(exercise);

    expect(isCustomExerciseDocument(document)).toBe(true);
    expect(fromCustomExerciseDocument(document)).toEqual(exercise);
  });

  it('rejects a document without the custom id prefix or with a bad field', () => {
    const document = toCustomExerciseDocument(custom('a'));
    expect(isCustomExerciseDocument({ ...document, id: 'bench-press' })).toBe(false);
    expect(isCustomExerciseDocument({ ...document, muscleGroup: 'neck' })).toBe(false);
    expect(isCustomExerciseDocument({ ...document, name: '   ' })).toBe(false);
  });
});

describe('mergeCustomExercises', () => {
  it('unions both sides and uploads what the cloud lacks', () => {
    const merge = mergeCustomExercises([custom('local')], [custom('cloud')]);

    expect(merge.exercises.map((e) => e.id).sort()).toEqual(['custom-cloud', 'custom-local']);
    expect(merge.toUpload.map((e) => e.id)).toEqual(['custom-local']);
  });

  it('keeps the newer edit of the same exercise', () => {
    const local = custom('a', { name: 'Local', updatedAt: 10 });
    const remote = custom('a', { name: 'Cloud', updatedAt: 5 });

    const merge = mergeCustomExercises([local], [remote]);

    expect(merge.exercises[0].name).toBe('Local');
    expect(merge.toUpload).toEqual([local]);
  });

  it('adopts a newer cloud edit without uploading', () => {
    const merge = mergeCustomExercises(
      [custom('a', { name: 'Local', updatedAt: 5 })],
      [custom('a', { name: 'Cloud', updatedAt: 10 })],
    );

    expect(merge.exercises[0].name).toBe('Cloud');
    expect(merge.toUpload).toEqual([]);
  });
});
