import type { Exercise, MuscleGroup } from '../entities/Exercise';
import type { Set } from '../entities/Set';
import { isWorkingSet } from './e1rm';

/** A drawable region of the body diagram. */
export type BodyRegion =
  | 'chest'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'forearms'
  | 'abs'
  | 'obliques'
  | 'traps'
  | 'upperBack'
  | 'lats'
  | 'lowerBack'
  | 'glutes'
  | 'quads'
  | 'hamstrings'
  | 'adductors'
  | 'abductors'
  | 'calves';

/** Every region, in display order (front to back, top to bottom). */
export const BODY_REGIONS: readonly BodyRegion[] = [
  'chest',
  'shoulders',
  'biceps',
  'triceps',
  'forearms',
  'abs',
  'obliques',
  'traps',
  'upperBack',
  'lats',
  'lowerBack',
  'glutes',
  'quads',
  'hamstrings',
  'adductors',
  'abductors',
  'calves',
];

/**
 * Dataset muscle names → regions. Names with no drawable region (ankles,
 * feet, cardiovascular system) are absent and ignored.
 */
const NAME_TO_REGION: Readonly<Record<string, BodyRegion>> = {
  pectorals: 'chest',
  chest: 'chest',
  'upper chest': 'chest',
  'serratus anterior': 'chest',
  delts: 'shoulders',
  deltoids: 'shoulders',
  shoulders: 'shoulders',
  'rear deltoids': 'shoulders',
  'rotator cuff': 'shoulders',
  biceps: 'biceps',
  brachialis: 'biceps',
  triceps: 'triceps',
  forearms: 'forearms',
  wrists: 'forearms',
  'wrist extensors': 'forearms',
  'wrist flexors': 'forearms',
  'grip muscles': 'forearms',
  hands: 'forearms',
  abs: 'abs',
  abdominals: 'abs',
  'lower abs': 'abs',
  core: 'abs',
  'hip flexors': 'abs',
  obliques: 'obliques',
  traps: 'traps',
  trapezius: 'traps',
  'levator scapulae': 'traps',
  'upper back': 'upperBack',
  rhomboids: 'upperBack',
  back: 'upperBack',
  lats: 'lats',
  'latissimus dorsi': 'lats',
  spine: 'lowerBack',
  'lower back': 'lowerBack',
  glutes: 'glutes',
  quads: 'quads',
  quadriceps: 'quads',
  hamstrings: 'hamstrings',
  adductors: 'adductors',
  'inner thighs': 'adductors',
  groin: 'adductors',
  abductors: 'abductors',
  calves: 'calves',
  soleus: 'calves',
  shins: 'calves',
};

/** Regions for an exercise that names no muscles (a custom one). */
const GROUP_REGIONS: Readonly<Record<MuscleGroup, readonly BodyRegion[]>> = {
  chest: ['chest'],
  back: ['lats', 'upperBack'],
  shoulders: ['shoulders'],
  arms: ['biceps', 'triceps'],
  legs: ['quads', 'hamstrings', 'glutes'],
  core: ['abs'],
};

/** The regions an exercise trains: primary (target) and secondary. */
export interface ExerciseRegions {
  primary: BodyRegion[];
  secondary: BodyRegion[];
}

/** Map a muscle name from the dataset to a region, or `null`. */
export function regionOfMuscle(name: string): BodyRegion | null {
  return NAME_TO_REGION[name.trim().toLowerCase()] ?? null;
}

/**
 * Regions an exercise trains. Uses the target and secondary muscles when
 * known, else falls back to the muscle group. A region is never both
 * primary and secondary.
 */
export function exerciseRegions(
  exercise: Pick<Exercise, 'targetMuscle' | 'secondaryMuscles' | 'muscleGroup'>,
): ExerciseRegions {
  const target = exercise.targetMuscle === undefined ? null : regionOfMuscle(exercise.targetMuscle);
  const primary = target === null ? [...GROUP_REGIONS[exercise.muscleGroup]] : [target];
  const secondary = new Set<BodyRegion>();
  for (const name of exercise.secondaryMuscles ?? []) {
    const region = regionOfMuscle(name);
    if (region !== null && !primary.includes(region)) secondary.add(region);
  }
  return { primary, secondary: [...secondary] };
}

/** Training load per region, in sets. */
export type MuscleLoad = Record<BodyRegion, number>;

/** How much a secondary region gets from one working set. */
export const SECONDARY_SHARE = 0.5;

/** A load with every region at zero. */
export function emptyMuscleLoad(): MuscleLoad {
  const load = {} as MuscleLoad;
  for (const region of BODY_REGIONS) load[region] = 0;
  return load;
}

/**
 * Sets of work per region: each working set adds 1 to its exercise's
 * primary regions and {@link SECONDARY_SHARE} to its secondary ones. Sets
 * whose exercise cannot be resolved are skipped.
 */
export function calculateMuscleLoad(
  sets: Set[],
  regionsOf: (exerciseId: string) => ExerciseRegions | null,
): MuscleLoad {
  const load = emptyMuscleLoad();
  for (const set of sets) {
    if (!isWorkingSet(set)) continue;
    const regions = regionsOf(set.exerciseId);
    if (regions === null) continue;
    for (const region of regions.primary) load[region] += 1;
    for (const region of regions.secondary) load[region] += SECONDARY_SHARE;
  }
  return load;
}

/**
 * Planned load of a routine: each slot adds its target sets to the
 * exercise's primary regions and {@link SECONDARY_SHARE} of them to its
 * secondary ones. Previews what a routine trains before it is run.
 */
export function routineMuscleLoad(
  slots: { exerciseId: string; targetSets: number }[],
  regionsOf: (exerciseId: string) => ExerciseRegions | null,
): MuscleLoad {
  const load = emptyMuscleLoad();
  for (const slot of slots) {
    const regions = regionsOf(slot.exerciseId);
    if (regions === null) continue;
    for (const region of regions.primary) load[region] += slot.targetSets;
    for (const region of regions.secondary) load[region] += slot.targetSets * SECONDARY_SHARE;
  }
  return load;
}

/** Intensity step 0–4 for drawing: 0 untrained, 4 the most-trained region. */
export type IntensityLevel = 0 | 1 | 2 | 3 | 4;

/**
 * Each region's step relative to the most-trained region: any work is at
 * least 1, the maximum is 4. Relative, so a light week still shows where
 * the work went.
 */
export function intensityLevels(load: MuscleLoad): Record<BodyRegion, IntensityLevel> {
  const max = Math.max(...BODY_REGIONS.map((region) => load[region]));
  const levels = {} as Record<BodyRegion, IntensityLevel>;
  for (const region of BODY_REGIONS) {
    const value = load[region];
    levels[region] = value <= 0 || max <= 0 ? 0 : (Math.min(4, Math.max(1, Math.ceil((value / max) * 4))) as IntensityLevel);
  }
  return levels;
}

/** Regions with no work at all, in display order. */
export function untrainedRegions(load: MuscleLoad): BodyRegion[] {
  return BODY_REGIONS.filter((region) => load[region] <= 0);
}
