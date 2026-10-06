/**
 * The routine share file: one or more routines plus the custom exercises
 * they use, so a plan can be sent to another person (or device) and
 * imported there. Validation is strict and rebuilds each routine from
 * known fields only, since the file comes from outside the app.
 */
import type { ProgressionPolicy, Routine, RoutineExercise, Weekday } from '@domain/entities';

import { isCustomExerciseDocument, type CustomExerciseDocument } from './customExerciseDocument';

/** `format` tag of a routine share file. */
export const ROUTINE_SHARE_FORMAT = 'kinetic-routines';

/** Current version of the share file. */
export const ROUTINE_SHARE_VERSION = 1;

/** Longest routine name accepted from a file. */
const ROUTINE_NAME_MAX = 80;

const PROGRESSIONS: readonly ProgressionPolicy[] = ['off', 'linear', 'double'];

/** A routine share file as written to disk. */
export interface RoutineShareFile {
  format: typeof ROUTINE_SHARE_FORMAT;
  version: number;
  exportedAt: number;
  routines: Routine[];
  customExercises: CustomExerciseDocument[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isCount(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0;
}

/** Rebuild one slot from known fields, or `null` when it is invalid. */
function toSlot(value: unknown): RoutineExercise | null {
  if (!isRecord(value)) return null;
  const { exerciseId, targetSets, targetReps, order, targetSeconds, supersetGroup } = value;
  if (typeof exerciseId !== 'string' || !isCount(targetSets) || !isCount(targetReps) || !isCount(order)) return null;
  if (targetSeconds !== undefined && !isCount(targetSeconds)) return null;
  if (supersetGroup !== undefined && typeof supersetGroup !== 'string') return null;
  return {
    exerciseId,
    targetSets,
    targetReps,
    order,
    ...(targetSeconds !== undefined ? { targetSeconds } : {}),
    ...(supersetGroup !== undefined ? { supersetGroup } : {}),
  };
}

/** Planned weekdays, or `null` when the field is malformed. */
function toDays(value: unknown): Weekday[] | null {
  if (!Array.isArray(value)) return null;
  const valid = value.every((day) => Number.isInteger(day) && day >= 0 && day <= 6);
  return valid ? (value as Weekday[]) : null;
}

/** Optional fields of a routine, or `null` when one is malformed. */
function toOptionals(value: Record<string, unknown>): Partial<Routine> | null {
  const { progression, days, estimatedMinutes } = value;
  if (progression !== undefined && !PROGRESSIONS.includes(progression as ProgressionPolicy)) return null;
  if (estimatedMinutes !== undefined && !isCount(estimatedMinutes)) return null;
  const parsedDays = days === undefined ? undefined : toDays(days);
  if (parsedDays === null) return null;
  return {
    ...(progression !== undefined ? { progression: progression as ProgressionPolicy } : {}),
    ...(parsedDays !== undefined ? { days: parsedDays } : {}),
    ...(estimatedMinutes !== undefined ? { estimatedMinutes } : {}),
  };
}

/** Rebuild a routine from untrusted data, or `null` when it is invalid. */
export function parseRoutine(value: unknown): Routine | null {
  if (!isRecord(value)) return null;
  const { id, name, exercises, createdAt, updatedAt, isArchived } = value;
  if (typeof id !== 'string' || id === '' || typeof name !== 'string') return null;
  if (name.trim() === '' || name.length > ROUTINE_NAME_MAX || !Array.isArray(exercises)) return null;
  if (typeof createdAt !== 'number' || typeof updatedAt !== 'number' || typeof isArchived !== 'boolean') return null;
  const slots = exercises.map(toSlot);
  const optionals = toOptionals(value);
  if (slots.some((slot) => slot === null) || optionals === null) return null;
  return { id, name, exercises: slots as RoutineExercise[], createdAt, updatedAt, isArchived, ...optionals };
}

/** Build the share file for `routines` and the custom exercises they use. */
export function buildRoutineShare(
  routines: Routine[],
  customExercises: CustomExerciseDocument[],
  now: number,
): RoutineShareFile {
  const used = new Set(routines.flatMap((routine) => routine.exercises.map((slot) => slot.exerciseId)));
  return {
    format: ROUTINE_SHARE_FORMAT,
    version: ROUTINE_SHARE_VERSION,
    exportedAt: now,
    routines,
    customExercises: customExercises.filter((exercise) => used.has(exercise.id)),
  };
}

/** Routines and exercises read from a share file. */
export interface ParsedRoutineShare {
  routines: Routine[];
  customExercises: CustomExerciseDocument[];
  /** Entries dropped because they were malformed. */
  skipped: number;
}

/**
 * Read a share file. `null` when `value` is not one (or is from a newer
 * version); malformed entries inside a valid file are skipped and counted.
 */
export function parseRoutineShare(value: unknown): ParsedRoutineShare | null {
  if (!isRecord(value) || value.format !== ROUTINE_SHARE_FORMAT) return null;
  if (typeof value.version !== 'number' || value.version > ROUTINE_SHARE_VERSION) return null;
  const rawRoutines = Array.isArray(value.routines) ? value.routines : [];
  const rawExercises = Array.isArray(value.customExercises) ? value.customExercises : [];
  const routines = rawRoutines.map(parseRoutine).filter((routine): routine is Routine => routine !== null);
  const customExercises = rawExercises.filter(isCustomExerciseDocument);
  const skipped = rawRoutines.length - routines.length + rawExercises.length - customExercises.length;
  return { routines, customExercises, skipped };
}

/** File name for sharing a routine, e.g. `push-day.routine.json`. */
export function routineShareFileName(name: string): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${slug === '' ? 'routine' : slug}.routine.json`;
}
