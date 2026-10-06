import { EXERCISE_MEDIA } from '../../data/exerciseMedia';
import {
  buildExerciseLibrary,
  EXERCISE_LIBRARY,
  isCatalogEntry,
  TEMPLATE_EXERCISE_IDS,
} from '../exerciseLibrary';

const ROW = {
  id: 'bench-press',
  name: 'Bench Press',
  muscleGroup: 'chest',
  equipment: 'barbell',
  instructions: ['Lie on the bench.'],
  source: { dataset: 'exercises-dataset', id: '0025' },
};

describe('isCatalogEntry', () => {
  it('accepts a row with the optional dataset fields', () => {
    expect(isCatalogEntry(ROW)).toBe(true);
  });

  it('accepts a row without any optional field', () => {
    expect(
      isCatalogEntry({ id: 'face-pull', name: 'Face Pull', muscleGroup: 'shoulders', equipment: 'cable' }),
    ).toBe(true);
  });

  it('rejects an unknown muscle group or equipment', () => {
    expect(isCatalogEntry({ ...ROW, muscleGroup: 'neck' })).toBe(false);
    expect(isCatalogEntry({ ...ROW, equipment: 'bosu ball' })).toBe(false);
  });

  it('rejects malformed optional fields', () => {
    expect(isCatalogEntry({ ...ROW, measure: 'distance' })).toBe(false);
    expect(isCatalogEntry({ ...ROW, perSide: 'yes' })).toBe(false);
    expect(isCatalogEntry({ ...ROW, instructions: 'Lie down.' })).toBe(false);
    expect(isCatalogEntry({ ...ROW, source: { dataset: 'x' } })).toBe(false);
  });
});

describe('buildExerciseLibrary', () => {
  it('completes each row into a built-in exercise', () => {
    const [exercise] = buildExerciseLibrary([ROW]);
    expect(exercise).toMatchObject({
      ...ROW,
      pictogramId: 'ex-bench-press',
      isCustom: false,
      isArchived: false,
    });
  });

  it('throws on a malformed row instead of skipping it', () => {
    expect(() => buildExerciseLibrary([ROW, { id: 'x' }])).toThrow('row 1');
  });

  it('throws on a duplicate id', () => {
    expect(() => buildExerciseLibrary([ROW, ROW])).toThrow('duplicate');
  });

  it('throws when the catalog is not an array', () => {
    expect(() => buildExerciseLibrary({})).toThrow('array');
  });
});

describe('EXERCISE_LIBRARY', () => {
  const ids = EXERCISE_LIBRARY.map((exercise) => exercise.id);

  it('has unique ids', () => {
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('keeps the original exercise ids that history is keyed on', () => {
    expect(ids.slice(0, 3)).toEqual(['bench-press', 'incline-bench-press', 'dumbbell-fly']);
  });

  it('resolves every starter template exercise', () => {
    const known = new Set(ids);
    const templateIds = Object.values(TEMPLATE_EXERCISE_IDS).flat();
    expect(templateIds.filter((id) => !known.has(id))).toEqual([]);
  });

  it('only has illustrations for exercises in the library', () => {
    const known = new Set(ids);
    expect(Object.keys(EXERCISE_MEDIA).filter((id) => !known.has(id))).toEqual([]);
  });

  it('carries instructions for dataset-backed exercises', () => {
    const bench = EXERCISE_LIBRARY.find((exercise) => exercise.id === 'bench-press');
    expect(bench?.instructions?.length).toBeGreaterThan(0);
  });

  it('marks timed and per-side exercises', () => {
    const byId = new Map(EXERCISE_LIBRARY.map((exercise) => [exercise.id, exercise]));
    expect(byId.get('weighted-front-plank')?.measure).toBe('time');
    expect(byId.get('bulgarian-split-squat')?.perSide).toBe(true);
    expect(byId.get('bench-press')?.measure).toBeUndefined();
  });
});
