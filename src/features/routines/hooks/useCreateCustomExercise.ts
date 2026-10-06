/**
 * Create a custom exercise: store it locally first, then hand it to the
 * cloud seam, which writes or queues it. Never blocks on the network.
 */
import { useCallback } from 'react';

import type { Exercise } from '@domain/entities';

import { syncCustomExerciseToCloud } from '../services';
import { useCustomExerciseStore, type NewCustomExercise } from '../store';

/** Returns a function that creates and mirrors one exercise. */
export function useCreateCustomExercise(): (input: NewCustomExercise) => Exercise {
  const createExercise = useCustomExerciseStore((state) => state.createExercise);
  return useCallback(
    (input: NewCustomExercise): Exercise => {
      const exercise = createExercise(input);
      syncCustomExerciseToCloud(exercise);
      return exercise;
    },
    [createExercise],
  );
}
