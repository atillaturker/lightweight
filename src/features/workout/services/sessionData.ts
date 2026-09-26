/**
 * Data seams for the workout feature.
 *
 * The feature needs read-only views it does not own: the exercise library
 * (to resolve routine slots into named blocks), an exercise's past working
 * sets (for PR detection), the finished sessions themselves (for the Home
 * weekly strip and recent-activity list), and the user's preferred rest
 * duration. There is also a write-side seam: a recorder that receives each
 * finished workout so a durable history can persist it. Each sits behind a
 * swappable provider that defaults to an empty/neutral source, so the
 * workout feature never imports another feature directly.
 * `app/providers/registerDataProviders` is the single place the real
 * sources are wired in at startup.
 */
import type { Exercise, Set, WeightUnit, Workout } from '@domain/entities';

import { DEFAULT_REST_SECONDS } from '../config';

/** Supplies the full exercise library. */
export type ExerciseLibraryProvider = () => Exercise[];

/** Supplies an exercise's past working sets, in any order. */
export type ExerciseHistoryProvider = (exerciseId: string) => Set[];

/** Supplies finished sessions, most recent first. */
export type SessionHistoryProvider = () => Workout[];

/** Supplies the rest period, in seconds, started after a completed set. */
export type RestTimerSecondsProvider = () => number;

/** Supplies the display unit for weights. */
export type WeightUnitProvider = () => WeightUnit;

/** Receives every finished workout so history can persist it. */
export type SessionRecorderProvider = (workout: Workout) => void;

const NO_EXERCISES: readonly Exercise[] = [];
const NO_SETS: readonly Set[] = [];
const NO_SESSIONS: readonly Workout[] = [];
const DEFAULT_REST_TIMER: RestTimerSecondsProvider = () => DEFAULT_REST_SECONDS;
const DEFAULT_WEIGHT_UNIT: WeightUnitProvider = () => 'kg';
const NOOP_RECORDER: SessionRecorderProvider = () => undefined;

let exerciseLibraryProvider: ExerciseLibraryProvider = () => [...NO_EXERCISES];
let exerciseHistoryProvider: ExerciseHistoryProvider = () => [...NO_SETS];
let sessionHistoryProvider: SessionHistoryProvider = () => [...NO_SESSIONS];
let restTimerSecondsProvider: RestTimerSecondsProvider = DEFAULT_REST_TIMER;
let weightUnitProvider: WeightUnitProvider = DEFAULT_WEIGHT_UNIT;
let sessionRecorderProvider: SessionRecorderProvider = NOOP_RECORDER;

/** Register the source of the exercise library. */
export function setExerciseLibraryProvider(
  provider: ExerciseLibraryProvider,
): void {
  exerciseLibraryProvider = provider;
}

/** Register the source of an exercise's historical sets. */
export function setExerciseHistoryProvider(
  provider: ExerciseHistoryProvider,
): void {
  exerciseHistoryProvider = provider;
}

/** Register the source of finished sessions. */
export function setSessionHistoryProvider(
  provider: SessionHistoryProvider,
): void {
  sessionHistoryProvider = provider;
}

/** Register the source of the user's preferred rest duration. */
export function setRestTimerSecondsProvider(
  provider: RestTimerSecondsProvider,
): void {
  restTimerSecondsProvider = provider;
}

/** Register the source of the user's display unit. */
export function setWeightUnitProvider(provider: WeightUnitProvider): void {
  weightUnitProvider = provider;
}

/** Register the sink that persists every finished workout. */
export function setSessionRecorder(
  provider: SessionRecorderProvider,
): void {
  sessionRecorderProvider = provider;
}

/** The exercise library. Empty when no source is registered. */
export function getExerciseLibrary(): Exercise[] {
  return exerciseLibraryProvider();
}

/** Past working sets for one exercise. Empty when no source is registered. */
export function getExerciseHistory(exerciseId: string): Set[] {
  return exerciseHistoryProvider(exerciseId);
}

/** Finished sessions, most recent first. Empty when no source is registered. */
export function getSessionHistory(): Workout[] {
  return sessionHistoryProvider();
}

/**
 * Rest period, in seconds, to start after a completed set. Falls back to
 * the feature default until a preference source is registered.
 */
export function getRestTimerSeconds(): number {
  return restTimerSecondsProvider();
}

/** The user's display unit for weights. Defaults to kilograms. */
export function getWeightUnit(): WeightUnit {
  return weightUnitProvider();
}

/**
 * Hand a finished workout to the recorder. A no-op until a source is
 * registered, so finishing never depends on history being wired up.
 */
export function recordSession(workout: Workout): void {
  sessionRecorderProvider(workout);
}

/**
 * Reset every provider to its empty default. Used by tests so a
 * registered source never leaks into another suite.
 */
export function resetSessionDataProviders(): void {
  exerciseLibraryProvider = () => [...NO_EXERCISES];
  exerciseHistoryProvider = () => [...NO_SETS];
  sessionHistoryProvider = () => [...NO_SESSIONS];
  restTimerSecondsProvider = DEFAULT_REST_TIMER;
  weightUnitProvider = DEFAULT_WEIGHT_UNIT;
  sessionRecorderProvider = NOOP_RECORDER;
}
