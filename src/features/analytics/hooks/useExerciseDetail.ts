/**
 * Exercise Detail read model hook.
 *
 * Resolves the exercise against the library seam, reads the display unit
 * from the same seam, and derives the whole screen through
 * {@link buildExerciseDetail}. Recomputes when history, the exercise, or the
 * selected metric changes.
 */
import { useMemo } from 'react';

import type { Exercise, WeightUnit } from '@domain/entities';
import { useHistoryStore } from '@features/history/store';
import { getExerciseLibrary, getWeightUnit } from '@features/workout';

import {
  buildExerciseDetail,
  type ExerciseDetailData,
  type ExerciseMetric,
} from '../utils';

/** Everything the Exercise Detail screen needs. */
export interface UseExerciseDetailResult {
  /** The library entry, or `null` when the id is unknown. */
  exercise: Exercise | null;
  /** The user's display unit for weights. */
  unit: WeightUnit;
  data: ExerciseDetailData;
}

/** Derive the Exercise Detail read model for one exercise and metric. */
export function useExerciseDetail(
  exerciseId: string,
  metric: ExerciseMetric,
): UseExerciseDetailResult {
  const sessions = useHistoryStore((state) => state.sessions);

  return useMemo((): UseExerciseDetailResult => {
    const exercise =
      getExerciseLibrary().find((entry) => entry.id === exerciseId) ?? null;
    return {
      exercise,
      unit: getWeightUnit(),
      data: buildExerciseDetail(sessions, exerciseId, metric, Date.now()),
    };
  }, [sessions, exerciseId, metric]);
}
