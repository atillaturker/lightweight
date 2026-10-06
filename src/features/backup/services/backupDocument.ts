/**
 * Build and read import/export files. Pure: no I/O, no stores. Reading is
 * defensive — the file comes from outside the app — and every entry is
 * checked with the same validators the cloud sync uses.
 */
import { isoDay, type ScheduleOverrides } from '@domain/rules';
import {
  fromBodyWeightDocument,
  isBodyWeightDocument,
  toBodyWeightDocument,
} from '@features/bodyweight';
import { fromWorkoutDocument, isWorkoutDocument, toWorkoutDocument } from '@features/history';
import {
  fromCustomExerciseDocument,
  isCustomExerciseDocument,
  parseRoutine,
  parseRoutineShare,
  toCustomExerciseDocument,
  type ExerciseNote,
} from '@features/routines';

import { BACKUP_FORMAT, BACKUP_VERSION, type BackupData, type BackupFile, type ParsedImport } from '../types';

const DAY_KEY = /^\d{4}-\d{2}-\d{2}$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

/** Serialize account data into a backup file. */
export function buildBackup(data: BackupData, now: number): BackupFile {
  return {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    exportedAt: now,
    workouts: data.workouts.map(toWorkoutDocument),
    routines: data.routines,
    scheduleOverrides: data.scheduleOverrides,
    customExercises: data.customExercises.map(toCustomExerciseDocument),
    exerciseNotes: data.exerciseNotes,
    bodyWeight: data.bodyWeight.map(toBodyWeightDocument),
  };
}

/** File name for a backup made at `now`, e.g. `kinetic-backup-2026-10-06.json`. */
export function backupFileName(now: number): string {
  return `kinetic-backup-${isoDay(now)}.json`;
}

/** Keep the entries `guard` accepts, counting the rest. */
function keep<T>(values: unknown[], guard: (value: unknown) => value is T): { kept: T[]; skipped: number } {
  const kept = values.filter(guard);
  return { kept, skipped: values.length - kept.length };
}

function isNote(value: unknown): value is ExerciseNote {
  return isRecord(value) && typeof value.text === 'string' && typeof value.updatedAt === 'number';
}

/** Valid schedule changes only: day keys mapped to a routine id or rest. */
function parseOverrides(value: unknown): ScheduleOverrides {
  if (!isRecord(value)) return {};
  return Object.fromEntries(
    Object.entries(value).filter(([key, id]) => DAY_KEY.test(key) && (id === null || typeof id === 'string')),
  ) as ScheduleOverrides;
}

function parseNotes(value: unknown): { notes: Record<string, ExerciseNote>; skipped: number } {
  const entries = isRecord(value) ? Object.entries(value) : [];
  const valid = entries.filter(([, note]) => isNote(note)) as [string, ExerciseNote][];
  return { notes: Object.fromEntries(valid), skipped: entries.length - valid.length };
}

/** Read a backup file's body; `null` when it is not a usable backup. */
function parseBackup(value: Record<string, unknown>): ParsedImport | null {
  if (typeof value.version !== 'number' || value.version > BACKUP_VERSION) return null;
  const workouts = keep(asArray(value.workouts), isWorkoutDocument);
  const exercises = keep(asArray(value.customExercises), isCustomExerciseDocument);
  const weights = keep(asArray(value.bodyWeight), isBodyWeightDocument);
  const rawRoutines = asArray(value.routines);
  const routines = rawRoutines.map(parseRoutine).filter((routine) => routine !== null);
  const notes = parseNotes(value.exerciseNotes);
  const skipped =
    workouts.skipped + exercises.skipped + weights.skipped + notes.skipped + rawRoutines.length - routines.length;
  const data: BackupData = {
    workouts: workouts.kept.map((document) => fromWorkoutDocument(document.id, document)),
    routines,
    scheduleOverrides: parseOverrides(value.scheduleOverrides),
    customExercises: exercises.kept.map(fromCustomExerciseDocument),
    exerciseNotes: notes.notes,
    bodyWeight: weights.kept.map(fromBodyWeightDocument),
  };
  return { kind: 'backup', data, skipped };
}

/**
 * Read an import file's text: a backup or a routine share file. `null`
 * when the text is not JSON, not one of the two formats, or from a newer
 * app version.
 */
export function parseImportFile(text: string): ParsedImport | null {
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    return null;
  }
  if (!isRecord(value)) return null;
  if (value.format === BACKUP_FORMAT) return parseBackup(value);
  const share = parseRoutineShare(value);
  if (share === null) return null;
  return {
    kind: 'routines',
    data: { routines: share.routines, customExercises: share.customExercises.map(fromCustomExerciseDocument) },
    skipped: share.skipped,
  };
}
