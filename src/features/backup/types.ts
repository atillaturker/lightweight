/**
 * Shapes of the backup feature: the full-account backup file, the data it
 * carries once read, and what an import added.
 */
import type { BodyWeightEntry, Exercise, Routine, Workout } from '@domain/entities';
import type { ScheduleOverrides } from '@domain/rules';
import type { BodyWeightDocument } from '@features/bodyweight';
import type { WorkoutDocument } from '@features/history';
import type { CustomExerciseDocument, ExerciseNote } from '@features/routines';

/** `format` tag of a backup file. */
export const BACKUP_FORMAT = 'kinetic-backup';

/** Current version of the backup file. */
export const BACKUP_VERSION = 1;

/** A backup file as written to disk. Weights are always kilograms. */
export interface BackupFile {
  format: typeof BACKUP_FORMAT;
  version: number;
  exportedAt: number;
  workouts: WorkoutDocument[];
  routines: Routine[];
  scheduleOverrides: ScheduleOverrides;
  customExercises: CustomExerciseDocument[];
  exerciseNotes: Record<string, ExerciseNote>;
  bodyWeight: BodyWeightDocument[];
}

/** The account data a backup holds, in domain types. */
export interface BackupData {
  workouts: Workout[];
  routines: Routine[];
  scheduleOverrides: ScheduleOverrides;
  customExercises: Exercise[];
  exerciseNotes: Record<string, ExerciseNote>;
  bodyWeight: BodyWeightEntry[];
}

/** A file read for import: a full backup or a shared routine file. */
export type ParsedImport =
  | { kind: 'backup'; data: BackupData; skipped: number }
  | { kind: 'routines'; data: Pick<BackupData, 'routines' | 'customExercises'>; skipped: number };

/** What an import added or updated, per kind of record. */
export interface ImportSummary {
  workouts: number;
  routines: number;
  customExercises: number;
  notes: number;
  bodyWeight: number;
  /** Malformed entries left out. */
  skipped: number;
}
