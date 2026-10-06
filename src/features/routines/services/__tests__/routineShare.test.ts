import type { Routine } from '@domain/entities';

import type { CustomExerciseDocument } from '../customExerciseDocument';
import {
  buildRoutineShare,
  parseRoutine,
  parseRoutineShare,
  ROUTINE_SHARE_FORMAT,
  routineShareFileName,
} from '../routineShare';

const routine: Routine = {
  id: 'r1',
  name: 'Push Day',
  exercises: [
    { exerciseId: 'bench-press', targetSets: 3, targetReps: 8, order: 0, supersetGroup: 'A' },
    { exerciseId: 'custom-dip', targetSets: 3, targetReps: 10, order: 1 },
  ],
  createdAt: 1,
  updatedAt: 2,
  isArchived: false,
  progression: 'linear',
  days: [1, 4],
};

function custom(id: string): CustomExerciseDocument {
  return {
    id,
    name: id,
    muscleGroup: 'chest',
    equipment: 'bodyweight',
    measure: 'reps',
    perSide: false,
    isArchived: false,
    createdAt: 1,
    updatedAt: 1,
  };
}

describe('parseRoutine', () => {
  it('rebuilds a valid routine', () => {
    expect(parseRoutine(JSON.parse(JSON.stringify(routine)))).toEqual(routine);
  });

  it('drops fields it does not know', () => {
    expect(parseRoutine({ ...routine, extra: 'x' })).toEqual(routine);
  });

  it('rejects a slot with a non-numeric target', () => {
    const broken = { ...routine, exercises: [{ ...routine.exercises[0], targetSets: '3' }] };
    expect(parseRoutine(broken)).toBeNull();
  });

  it('rejects a weekday out of range and an unknown progression', () => {
    expect(parseRoutine({ ...routine, days: [7] })).toBeNull();
    expect(parseRoutine({ ...routine, progression: 'wave' })).toBeNull();
  });
});

describe('buildRoutineShare', () => {
  it('includes only the custom exercises the routine uses', () => {
    const file = buildRoutineShare([routine], [custom('custom-dip'), custom('custom-other')], 5);
    expect(file.customExercises.map((exercise) => exercise.id)).toEqual(['custom-dip']);
    expect(file).toMatchObject({ format: ROUTINE_SHARE_FORMAT, version: 1, exportedAt: 5 });
  });
});

describe('parseRoutineShare', () => {
  it('reads back what it built and counts malformed entries', () => {
    const file = JSON.parse(JSON.stringify(buildRoutineShare([routine], [custom('custom-dip')], 5)));
    file.routines.push({ id: 'bad' });
    const parsed = parseRoutineShare(file);
    expect(parsed?.routines).toEqual([routine]);
    expect(parsed?.customExercises).toHaveLength(1);
    expect(parsed?.skipped).toBe(1);
  });

  it('rejects another format and a newer version', () => {
    expect(parseRoutineShare({ format: 'other', version: 1 })).toBeNull();
    expect(parseRoutineShare({ format: ROUTINE_SHARE_FORMAT, version: 2 })).toBeNull();
  });
});

describe('routineShareFileName', () => {
  it('slugs the routine name', () => {
    expect(routineShareFileName('Push Day / Heavy!')).toBe('push-day-heavy.routine.json');
    expect(routineShareFileName('***')).toBe('routine.routine.json');
  });
});
