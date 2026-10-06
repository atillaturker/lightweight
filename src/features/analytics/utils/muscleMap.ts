/**
 * Read model for the muscle map: training load per body region over a
 * recent window, its intensity steps, and the regions left untrained.
 * All math comes from `@domain/rules/muscles`.
 */
import type { Exercise, Workout } from '@domain/entities';
import {
  calculateMuscleLoad,
  exerciseRegions,
  intensityLevels,
  untrainedRegions,
  BODY_REGIONS,
  type BodyRegion,
  type ExerciseRegions,
  type IntensityLevel,
  type MuscleLoad,
} from '@domain/rules';

/** The window the map covers. */
export type MuscleWindow = 'week' | 'month' | 'quarter';

/** Days per window. */
export const MUSCLE_WINDOW_DAYS: Record<MuscleWindow, number> = {
  week: 7,
  month: 30,
  quarter: 90,
};

const DAY_MS = 24 * 60 * 60 * 1000;

/** Everything the muscle map section renders. */
export interface MuscleMapData {
  /** Sets per region (secondary work counts half). */
  load: MuscleLoad;
  levels: Record<BodyRegion, IntensityLevel>;
  /** Regions with no work in the window, in display order. */
  untrained: BodyRegion[];
  /** False when the window holds no resolvable working set. */
  hasData: boolean;
}

/** Build the muscle map for sessions started inside the window. */
export function buildMuscleMap(
  sessions: Workout[],
  library: Exercise[],
  span: MuscleWindow,
  now: number,
): MuscleMapData {
  const since = now - MUSCLE_WINDOW_DAYS[span] * DAY_MS;
  const sets = sessions.filter((session) => session.startedAt >= since).flatMap((s) => s.sets);
  const regions = new Map<string, ExerciseRegions>(
    library.map((exercise) => [exercise.id, exerciseRegions(exercise)]),
  );
  const load = calculateMuscleLoad(sets, (id) => regions.get(id) ?? null);
  const untrained = untrainedRegions(load);
  return {
    load,
    levels: intensityLevels(load),
    untrained,
    hasData: untrained.length < BODY_REGIONS.length,
  };
}
