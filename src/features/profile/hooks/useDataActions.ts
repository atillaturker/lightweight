/**
 * The Profile "Data" rows: export, import and delete-all, each reporting
 * its outcome in a system alert. The work itself belongs to the backup
 * and history features.
 */
import { useCallback } from 'react';
import { Alert } from 'react-native';

import { importSummaryLines, UNREADABLE_IMPORT_MESSAGE, useBackupActions } from '@features/backup';
import { useSessionActions } from '@features/history';

/** Handlers returned by {@link useDataActions}. */
export interface DataActions {
  onExport: () => void;
  onImport: () => void;
  onDeleteAll: () => void;
}

/** Bound handlers for the Data section. */
export function useDataActions(): DataActions {
  const { exportBackup, importFromFile } = useBackupActions();
  const { removeAllSessions } = useSessionActions();

  const onExport = useCallback((): void => {
    exportBackup().catch(() => {
      Alert.alert('Export failed', 'The backup file could not be shared. Try again.');
    });
  }, [exportBackup]);

  const onImport = useCallback((): void => {
    importFromFile()
      .then((summary) => {
        if (summary !== null) Alert.alert('Import complete', importSummaryLines(summary).join('\n'));
      })
      .catch((error: unknown) => {
        const unreadable = error instanceof Error && error.message === UNREADABLE_IMPORT_MESSAGE;
        Alert.alert('Import failed', unreadable ? UNREADABLE_IMPORT_MESSAGE : 'The file could not be read. Try again.');
      });
  }, [importFromFile]);

  const onDeleteAll = useCallback((): void => {
    Alert.alert(
      'Delete all workouts?',
      'Every workout is removed from this device and your account. Routines, notes and body weight stay. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: removeAllSessions },
      ],
    );
  }, [removeAllSessions]);

  return { onExport, onImport, onDeleteAll };
}
