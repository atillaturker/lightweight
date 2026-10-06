/**
 * The exercise library as screens see it: the built-in catalog plus the
 * user's own exercises, kept live as custom exercises are created or
 * synced in.
 */
import { useMemo } from 'react';

import type { Exercise } from '@domain/entities';

import { EXERCISE_LIBRARY } from '../services';
import { useCustomExerciseStore } from '../store';

/** What {@link useExerciseLibrary} returns. */
export interface ExerciseLibraryView {
  /** What the picker lists: active custom exercises (newest first), then built-ins. */
  pickable: Exercise[];
  /** Every exercise by id, archived custom ones included, for resolving slots. */
  byId: Map<string, Exercise>;
}

/** Built-in plus custom exercises. */
export function useExerciseLibrary(): ExerciseLibraryView {
  const custom = useCustomExerciseStore((state) => state.exercises);
  return useMemo((): ExerciseLibraryView => {
    const active = custom
      .filter((exercise) => !exercise.isArchived)
      .sort((a, b) => b.createdAt - a.createdAt);
    const all = [...EXERCISE_LIBRARY, ...custom];
    return {
      pickable: [...active, ...EXERCISE_LIBRARY],
      byId: new Map(all.map((exercise) => [exercise.id, exercise])),
    };
  }, [custom]);
}
