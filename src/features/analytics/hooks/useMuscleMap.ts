/**
 * Muscle map read model for one window. Recomputes when history changes;
 * exercises resolve through the workout feature's library seam, so custom
 * exercises count too.
 */
import { useMemo } from 'react';

import { useHistoryStore } from '@features/history';
import { getExerciseLibrary } from '@features/workout';

import { buildMuscleMap, type MuscleMapData, type MuscleWindow } from '../utils/muscleMap';

/** Load, intensity and untrained regions for the window. */
export function useMuscleMap(span: MuscleWindow): MuscleMapData {
  const sessions = useHistoryStore((state) => state.sessions);
  return useMemo(
    () => buildMuscleMap(sessions, getExerciseLibrary(), span, Date.now()),
    [sessions, span],
  );
}
