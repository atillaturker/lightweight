/**
 * Write-side hook for the set table.
 *
 * Every action funnels through the store, so persistence happens on the
 * same tick as the UI update. PR detection is scheduled through
 * `InteractionManager.runAfterInteractions`, which defers it until the
 * frame the user just caused has settled — logging a set never waits on
 * a comparison against history.
 */
import { useCallback } from 'react';
import { InteractionManager } from 'react-native';

import type { Set } from '@domain/entities';
import { detectPRs } from '@domain/rules';

import { getExerciseHistory } from '../services';
import { useActiveWorkoutStore, type NewActiveSet } from '../store';
import type { ActiveSet } from '../types';

/** Actions returned by {@link useSetLogger}. */
export interface SetLoggerActions {
  /** Append a set. Returns the generated set id. */
  logSet: (exerciseId: string, set: NewActiveSet) => string;
  /** Mark a set complete and run PR detection on it. */
  completeSet: (exerciseId: string, setId: string) => void;
  /** Patch a set in place. */
  updateSet: (
    exerciseId: string,
    setId: string,
    patch: Partial<ActiveSet>,
  ) => void;
  /** Remove a set. */
  removeSet: (exerciseId: string, setId: string) => void;
  /** Append a clone of the exercise's last set. */
  addSet: (exerciseId: string) => void;
}

/** Convert an active set into the domain `Set` PR detection expects. */
function toDomainSet(
  set: ActiveSet,
  exerciseId: string,
  workoutId: string,
  order: number,
): Set {
  return {
    id: set.id,
    exerciseId,
    workoutId,
    weightKg: set.weightKg,
    reps: set.reps,
    type: set.type,
    completed: set.completed,
    rpe: set.rpe,
    completedAt: set.completedAt,
    order,
  };
}

/**
 * Compare one completed set against the exercise's history and flag it
 * when it sets a record. Runs after interactions settle; never throws,
 * because a failed check must not disturb the logging loop.
 */
function detectAndFlagPR(exerciseId: string, setId: string): void {
  InteractionManager.runAfterInteractions(() => {
    try {
      const state = useActiveWorkoutStore.getState();
      const block = state.exercises.find(
        (entry) => entry.exerciseId === exerciseId,
      );
      const index = block?.sets.findIndex((entry) => entry.id === setId) ?? -1;
      if (block === undefined || index < 0) return;

      const active = block.sets[index];
      if (!active.completed || active.type === 'warmup') return;

      const candidate = toDomainSet(
        active,
        exerciseId,
        state.sessionId ?? '',
        index,
      );
      const history = getExerciseHistory(exerciseId);
      if (detectPRs(history, candidate).length === 0) return;

      state.markSetPR(exerciseId, setId);
    } catch {
      // History is a best-effort comparison; a failure is not a data loss.
    }
  });
}

/**
 * Set-table actions bound to the active workout store. Use this instead of
 * touching the store directly — it keeps PR detection in one place.
 */
export function useSetLogger(): SetLoggerActions {
  const logSetAction = useActiveWorkoutStore((state) => state.logSet);
  const completeSetAction = useActiveWorkoutStore((state) => state.completeSet);
  const updateSetAction = useActiveWorkoutStore((state) => state.updateSet);
  const removeSetAction = useActiveWorkoutStore((state) => state.removeSet);
  const addSetAction = useActiveWorkoutStore((state) => state.addSet);

  const logSet = useCallback(
    (exerciseId: string, set: NewActiveSet): string => {
      logSetAction(exerciseId, set);
      const block = useActiveWorkoutStore
        .getState()
        .exercises.find((entry) => entry.exerciseId === exerciseId);
      const created = block?.sets.at(-1);
      if (created === undefined) return '';

      if (created.completed) detectAndFlagPR(exerciseId, created.id);
      return created.id;
    },
    [logSetAction],
  );

  const completeSet = useCallback(
    (exerciseId: string, setId: string): void => {
      completeSetAction(exerciseId, setId);
      detectAndFlagPR(exerciseId, setId);
    },
    [completeSetAction],
  );

  const updateSet = useCallback(
    (exerciseId: string, setId: string, patch: Partial<ActiveSet>): void => {
      updateSetAction(exerciseId, setId, patch);
    },
    [updateSetAction],
  );

  const removeSet = useCallback(
    (exerciseId: string, setId: string): void => {
      removeSetAction(exerciseId, setId);
    },
    [removeSetAction],
  );

  const addSet = useCallback(
    (exerciseId: string): void => {
      addSetAction(exerciseId);
    },
    [addSetAction],
  );

  return { logSet, completeSet, updateSet, removeSet, addSet };
}
