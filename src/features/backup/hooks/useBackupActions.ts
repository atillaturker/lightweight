/**
 * Export the account's data to a file, and import a backup or a shared
 * routine file. Import merges into what is stored — it never deletes or
 * overwrites a newer record — and every added record goes through its
 * feature's own action, so it is mirrored to the cloud like any other
 * change.
 */
import { useCallback } from 'react';

import { useBodyWeightActions, useBodyWeightStore } from '@features/bodyweight';
import { useHistoryStore, useSessionActions } from '@features/history';
import {
  useCustomExerciseStore,
  useExerciseNoteStore,
  useRoutineStore,
  useRoutineTransfer,
} from '@features/routines';
import { pickJsonFile, shareJsonFile } from '@infrastructure/files';

import { backupFileName, buildBackup, parseImportFile } from '../services';
import type { BackupData, ImportSummary, ParsedImport } from '../types';

/** Thrown when the picked file is not a backup or routine file. */
export const UNREADABLE_IMPORT_MESSAGE = 'This file is not a Kinetic backup or routine file.';

/** Actions returned by {@link useBackupActions}. */
export interface BackupActions {
  /** Write a backup of the signed-in account and open the share sheet. */
  exportBackup: () => Promise<void>;
  /**
   * Let the user pick a file and merge it in. Resolves with what was
   * added, or `null` when the picker was cancelled. Rejects with
   * {@link UNREADABLE_IMPORT_MESSAGE} for a file it cannot read.
   */
  importFromFile: () => Promise<ImportSummary | null>;
}

/** Everything the account holds right now. */
function snapshot(): BackupData {
  const routines = useRoutineStore.getState();
  return {
    workouts: useHistoryStore.getState().sessions,
    routines: routines.routines,
    scheduleOverrides: routines.scheduleOverrides,
    customExercises: useCustomExerciseStore.getState().exercises,
    exerciseNotes: useExerciseNoteStore.getState().notes,
    bodyWeight: useBodyWeightStore.getState().entries,
  };
}

/** Backup export and import. */
export function useBackupActions(): BackupActions {
  const { importSessions } = useSessionActions();
  const { importEntries } = useBodyWeightActions();
  const { importRoutineData } = useRoutineTransfer();

  const exportBackup = useCallback(async (): Promise<void> => {
    const now = Date.now();
    const file = buildBackup(snapshot(), now);
    await shareJsonFile(backupFileName(now), JSON.stringify(file), 'Export data');
  }, []);

  const apply = useCallback(
    (parsed: ParsedImport): ImportSummary => {
      // Exercises and routines first, so imported workouts resolve their names.
      if (parsed.kind === 'routines') {
        const routines = importRoutineData(parsed.data);
        return { ...routines, workouts: 0, bodyWeight: 0, skipped: parsed.skipped };
      }
      const { exerciseNotes, ...rest } = parsed.data;
      const routines = importRoutineData({ ...rest, notes: exerciseNotes });
      const workouts = importSessions(parsed.data.workouts);
      const bodyWeight = importEntries(parsed.data.bodyWeight);
      return { ...routines, workouts, bodyWeight, skipped: parsed.skipped };
    },
    [importEntries, importRoutineData, importSessions],
  );

  const importFromFile = useCallback(async (): Promise<ImportSummary | null> => {
    const text = await pickJsonFile();
    if (text === null) return null;
    const parsed = parseImportFile(text);
    if (parsed === null) throw new Error(UNREADABLE_IMPORT_MESSAGE);
    return apply(parsed);
  }, [apply]);

  return { exportBackup, importFromFile };
}
