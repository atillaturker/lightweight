/**
 * Progress screen read model hook.
 *
 * Reads durable session history and derives the whole screen through
 * {@link buildProgressData}. Recomputes when history, the range, or the
 * selected metric changes.
 */
import { useMemo } from 'react';

import { useHistoryStore } from '@features/history';
import { getExerciseLibrary } from '@features/workout';

import {
  buildProgressData,
  type ProgressData,
  type ProgressMetric,
  type ProgressRange,
} from '../utils';

/** Derive the Progress read model for one range and metric. */
export function useProgressData(
  range: ProgressRange,
  metric: ProgressMetric,
): ProgressData {
  const sessions = useHistoryStore((state) => state.sessions);

  return useMemo((): ProgressData => {
    const names = new Map(
      getExerciseLibrary().map((exercise) => [exercise.id, exercise.name]),
    );
    return buildProgressData(sessions, range, metric, Date.now(), names);
  }, [sessions, range, metric]);
}
