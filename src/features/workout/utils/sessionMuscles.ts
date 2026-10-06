/**
 * Which body regions a finished session trained, for the summary's
 * "Muscles worked" map. All math is `@domain/rules/muscles`.
 */
import type { Exercise, Set } from '@domain/entities';
import {
  BODY_REGIONS,
  calculateMuscleLoad,
  exerciseRegions,
  intensityLevels,
  type BodyRegion,
  type IntensityLevel,
} from '@domain/rules';

/** Shading per region and the regions that got any work, most first. */
export interface SessionMuscles {
  levels: Record<BodyRegion, IntensityLevel>;
  trained: BodyRegion[];
}

/** Muscle shading for one session's sets. */
export function sessionMuscles(sets: Set[], library: Exercise[]): SessionMuscles {
  const byId = new Map(library.map((exercise) => [exercise.id, exercise]));
  const load = calculateMuscleLoad(sets, (id) => {
    const exercise = byId.get(id);
    return exercise === undefined ? null : exerciseRegions(exercise);
  });
  const trained = BODY_REGIONS.filter((region) => load[region] > 0).sort(
    (a, b) => load[b] - load[a],
  );
  return { levels: intensityLevels(load), trained };
}
