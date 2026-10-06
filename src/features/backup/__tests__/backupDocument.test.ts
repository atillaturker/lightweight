jest.mock('react-native-mmkv', () => ({
  createMMKV: () => ({ getString: () => undefined, set: () => undefined, remove: () => undefined }),
}));

import type { Workout } from '@domain/entities';

import { backupFileName, buildBackup, parseImportFile } from '../services';
import type { BackupData } from '../types';

const workout: Workout = {
  id: 'w1',
  routineId: 'r1',
  routineName: 'Push',
  startedAt: new Date(2026, 9, 5, 18).getTime(),
  finishedAt: new Date(2026, 9, 5, 19).getTime(),
  sets: [
    {
      id: 's1',
      exerciseId: 'bench-press',
      workoutId: 'w1',
      weightKg: 80,
      reps: 8,
      type: 'normal',
      completed: true,
      completedAt: 2,
      order: 0,
    },
  ],
};

const data: BackupData = {
  workouts: [workout],
  routines: [
    {
      id: 'r1',
      name: 'Push',
      exercises: [{ exerciseId: 'bench-press', targetSets: 3, targetReps: 8, order: 0 }],
      createdAt: 1,
      updatedAt: 1,
      isArchived: false,
      days: [1],
    },
  ],
  scheduleOverrides: { '2026-10-07': null },
  customExercises: [
    {
      id: 'custom-dip',
      name: 'Ring Dip',
      muscleGroup: 'chest',
      equipment: 'bodyweight',
      pictogramId: 'ex-custom-dip',
      isCustom: true,
      isArchived: false,
      createdAt: 1,
      updatedAt: 1,
    },
  ],
  exerciseNotes: { 'bench-press': { text: 'Seat 4', updatedAt: 3 } },
  bodyWeight: [{ date: '2026-10-05', weightKg: 80.5, updatedAt: 4 }],
};

/** Write and read back through JSON, as the file does. */
function roundTrip(value: unknown): string {
  return JSON.stringify(value);
}

describe('parseImportFile', () => {
  it('reads back a backup it built', () => {
    const parsed = parseImportFile(roundTrip(buildBackup(data, 9)));
    expect(parsed?.kind).toBe('backup');
    expect(parsed?.skipped).toBe(0);
    expect(parsed?.data).toMatchObject({
      routines: data.routines,
      scheduleOverrides: data.scheduleOverrides,
      exerciseNotes: data.exerciseNotes,
      bodyWeight: data.bodyWeight,
    });
    expect(parsed?.data.customExercises).toEqual(data.customExercises);
    expect(parsed?.kind === 'backup' ? parsed.data.workouts[0].sets[0].weightKg : null).toBe(80);
  });

  it('skips and counts malformed entries', () => {
    const file = JSON.parse(roundTrip(buildBackup(data, 9)));
    file.workouts.push({ id: 'broken' });
    file.bodyWeight.push({ date: 'yesterday', weightKg: 80, updatedAt: 1, deleted: false });
    file.exerciseNotes.squat = { text: 3 };
    const parsed = parseImportFile(JSON.stringify(file));
    expect(parsed?.skipped).toBe(3);
    expect(parsed?.kind === 'backup' ? parsed.data.workouts : []).toHaveLength(1);
  });

  it('recognizes a shared routine file', () => {
    const share = { format: 'kinetic-routines', version: 1, exportedAt: 1, routines: data.routines, customExercises: [] };
    expect(parseImportFile(JSON.stringify(share))?.kind).toBe('routines');
  });

  it('rejects text that is not a known file', () => {
    expect(parseImportFile('not json')).toBeNull();
    expect(parseImportFile('[]')).toBeNull();
    expect(parseImportFile(JSON.stringify({ format: 'kinetic-backup', version: 99 }))).toBeNull();
  });
});

describe('backupFileName', () => {
  it('names the file after the local day', () => {
    expect(backupFileName(new Date(2026, 9, 6, 23, 30).getTime())).toBe('kinetic-backup-2026-10-06.json');
  });
});
