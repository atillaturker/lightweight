/**
 * Moving routine data in and out: share a routine as a file, and import
 * routines, custom exercises, notes and schedule changes from a share
 * file or a backup. Imports merge — nothing already stored is replaced,
 * except an older copy of a custom exercise or note.
 */
import { useCallback } from 'react';

import type { Exercise, Routine } from '@domain/entities';
import type { ScheduleOverrides } from '@domain/rules';
import { shareJsonFile } from '@infrastructure/files';

import {
  buildRoutineShare,
  mergeCustomExercises,
  routineShareFileName,
  syncCustomExerciseToCloud,
  toCustomExerciseDocument,
} from '../services';
import { useCustomExerciseStore, useExerciseNoteStore, useRoutineStore, type ExerciseNote } from '../store';

/** Routine data to merge in; every field is optional. */
export interface RoutineImport {
  routines?: Routine[];
  customExercises?: Exercise[];
  notes?: Record<string, ExerciseNote>;
  scheduleOverrides?: ScheduleOverrides;
}

/** How much of a {@link RoutineImport} was new. */
export interface RoutineImportResult {
  routines: number;
  customExercises: number;
  notes: number;
}

/** Actions returned by {@link useRoutineTransfer}. */
export interface RoutineTransfer {
  /** Open the share sheet with a file holding one routine. */
  shareRoutine: (routineId: string) => Promise<void>;
  /** Merge routine data in; custom exercises are mirrored to the cloud. */
  importRoutineData: (data: RoutineImport) => RoutineImportResult;
}

/** Merge custom exercises, newer edit winning, and mirror the changes. */
function importCustomExercises(exercises: Exercise[]): number {
  const store = useCustomExerciseStore.getState();
  const merge = mergeCustomExercises(exercises, store.exercises);
  if (merge.toUpload.length === 0) return 0;
  store.setExercises(merge.exercises);
  merge.toUpload.forEach(syncCustomExerciseToCloud);
  return merge.toUpload.length;
}

/** Share and import actions for routines. */
export function useRoutineTransfer(): RoutineTransfer {
  const shareRoutine = useCallback(async (routineId: string): Promise<void> => {
    const routine = useRoutineStore.getState().routines.find((entry) => entry.id === routineId);
    if (routine === undefined) return;
    const customs = useCustomExerciseStore.getState().exercises.map(toCustomExerciseDocument);
    const file = buildRoutineShare([routine], customs, Date.now());
    await shareJsonFile(routineShareFileName(routine.name), JSON.stringify(file, null, 2), `Share ${routine.name}`);
  }, []);

  const importRoutineData = useCallback((data: RoutineImport): RoutineImportResult => {
    const customExercises = importCustomExercises(data.customExercises ?? []);
    const routines = useRoutineStore.getState().importRoutines(data.routines ?? []).length;
    useRoutineStore.getState().importScheduleOverrides(data.scheduleOverrides ?? {});
    const notes = useExerciseNoteStore.getState().importNotes(data.notes ?? {});
    return { routines, customExercises, notes };
  }, []);

  return { shareRoutine, importRoutineData };
}
