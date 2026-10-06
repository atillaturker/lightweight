/**
 * Integration test of export and import: a backup written from one
 * account's stores merges into another's, every added record is mirrored
 * through its feature's cloud seam, and importing twice adds nothing.
 */
const mockMemory = new Map<string, string>();

jest.mock('react-native-mmkv', () => ({
  createMMKV: () => ({
    getString: (key: string) => mockMemory.get(key),
    set: (key: string, value: string) => {
      mockMemory.set(key, value);
    },
    remove: (key: string) => {
      mockMemory.delete(key);
    },
  }),
}));

const mockShareJsonFile = jest.fn<Promise<void>, [string, string, string]>(async () => undefined);
const mockPickJsonFile = jest.fn<Promise<string | null>, []>(async () => null);
jest.mock('@infrastructure/files', () => ({
  shareJsonFile: (...args: [string, string, string]) => mockShareJsonFile(...args),
  pickJsonFile: () => mockPickJsonFile(),
}));

import { act, renderHook } from '@testing-library/react-native';

import type { Workout } from '@domain/entities';
import { resetBodyWeightCloud, setCloudBodyWeightWriter, useBodyWeightStore } from '@features/bodyweight';
import { useHistoryStore } from '@features/history';
import { resetCloudSyncSeams, setCloudWorkoutWriter } from '@features/history/services';
import { useExerciseNoteStore, useRoutineStore } from '@features/routines';

import { UNREADABLE_IMPORT_MESSAGE, useBackupActions } from '../hooks';

function workout(id: string, day: number): Workout {
  return {
    id,
    routineId: null,
    routineName: 'Push',
    startedAt: new Date(2026, 9, day, 18).getTime(),
    finishedAt: new Date(2026, 9, day, 19).getTime(),
    sets: [],
  };
}

const uploadedWorkouts = jest.fn();
const uploadedWeights = jest.fn();

beforeEach(() => {
  mockMemory.clear();
  mockShareJsonFile.mockClear();
  uploadedWorkouts.mockClear();
  uploadedWeights.mockClear();
  useHistoryStore.setState({ sessions: [] });
  useBodyWeightStore.setState({ entries: [] });
  useRoutineStore.setState({ routines: [], activeRoutineId: null, scheduleOverrides: {} });
  useExerciseNoteStore.setState({ notes: {} });
  setCloudWorkoutWriter(uploadedWorkouts);
  setCloudBodyWeightWriter(uploadedWeights);
});

afterEach(() => {
  resetCloudSyncSeams();
  resetBodyWeightCloud();
});

/** Export the current stores and return the written file's text. */
async function exportText(): Promise<string> {
  const { result } = renderHook(() => useBackupActions());
  await act(() => result.current.exportBackup());
  return mockShareJsonFile.mock.calls[0][1];
}

describe('useBackupActions', () => {
  it('restores an exported backup into an empty account and mirrors it', async () => {
    useHistoryStore.setState({ sessions: [workout('w2', 6), workout('w1', 5)] });
    useBodyWeightStore.getState().logWeight(80);
    useRoutineStore.getState().createRoutine('Push');
    useExerciseNoteStore.getState().setNote('bench-press', 'Seat 4');
    const text = await exportText();
    expect(mockShareJsonFile.mock.calls[0][0]).toMatch(/^kinetic-backup-\d{4}-\d{2}-\d{2}\.json$/);

    useHistoryStore.setState({ sessions: [workout('w1', 5)] });
    useBodyWeightStore.setState({ entries: [] });
    useRoutineStore.setState({ routines: [] });
    useExerciseNoteStore.setState({ notes: {} });
    mockPickJsonFile.mockResolvedValueOnce(text);
    const { result } = renderHook(() => useBackupActions());
    let summary = null;
    await act(async () => {
      summary = await result.current.importFromFile();
    });

    expect(summary).toEqual({ workouts: 1, routines: 1, customExercises: 0, notes: 1, bodyWeight: 1, skipped: 0 });
    expect(useHistoryStore.getState().sessions.map((session) => session.id)).toEqual(['w2', 'w1']);
    expect(uploadedWorkouts).toHaveBeenCalledTimes(1);
    expect(uploadedWeights).toHaveBeenCalledTimes(1);
    expect(useExerciseNoteStore.getState().notes['bench-press']?.text).toBe('Seat 4');
  });

  it('adds nothing when the same backup is imported again', async () => {
    useHistoryStore.setState({ sessions: [workout('w1', 5)] });
    useRoutineStore.getState().createRoutine('Push');
    mockPickJsonFile.mockResolvedValueOnce(await exportText());
    const { result } = renderHook(() => useBackupActions());

    let summary = null;
    await act(async () => {
      summary = await result.current.importFromFile();
    });

    expect(summary).toMatchObject({ workouts: 0, routines: 0, notes: 0, bodyWeight: 0 });
    expect(uploadedWorkouts).not.toHaveBeenCalled();
  });

  it('resolves null when the picker is cancelled', async () => {
    mockPickJsonFile.mockResolvedValueOnce(null);
    const { result } = renderHook(() => useBackupActions());
    await expect(result.current.importFromFile()).resolves.toBeNull();
  });

  it('rejects a file that is not a backup', async () => {
    mockPickJsonFile.mockResolvedValueOnce('{"hello":1}');
    const { result } = renderHook(() => useBackupActions());
    await expect(result.current.importFromFile()).rejects.toThrow(UNREADABLE_IMPORT_MESSAGE);
  });
});
