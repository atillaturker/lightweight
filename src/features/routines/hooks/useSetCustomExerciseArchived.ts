/**
 * Archive or restore a custom exercise locally, then mirror the change
 * (a newer `updatedAt`, so it wins the next sync merge on every device).
 */
import { useCallback } from 'react';

import { syncCustomExerciseToCloud } from '../services';
import { useCustomExerciseStore } from '../store';

/** Returns `(exerciseId, archived) => void`. */
export function useSetCustomExerciseArchived(): (exerciseId: string, archived: boolean) => void {
  const setArchived = useCustomExerciseStore((state) => state.setArchived);
  return useCallback(
    (exerciseId: string, archived: boolean): void => {
      const updated = setArchived(exerciseId, archived);
      if (updated !== null) syncCustomExerciseToCloud(updated);
    },
    [setArchived],
  );
}
