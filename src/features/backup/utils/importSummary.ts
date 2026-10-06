/**
 * The lines of the "Import complete" message: one per kind of record
 * that changed, each a whole sentence so it can move into a message
 * catalog later.
 */
import type { ImportSummary } from '../types';

/** One line per non-zero count, or a single line when nothing was new. */
export function importSummaryLines(summary: ImportSummary): string[] {
  const lines = [
    summary.workouts > 0 ? `Workouts added: ${summary.workouts}` : null,
    summary.routines > 0 ? `Routines added: ${summary.routines}` : null,
    summary.customExercises > 0 ? `Custom exercises added or updated: ${summary.customExercises}` : null,
    summary.notes > 0 ? `Exercise notes added or updated: ${summary.notes}` : null,
    summary.bodyWeight > 0 ? `Body weight days added or updated: ${summary.bodyWeight}` : null,
  ].filter((line): line is string => line !== null);
  if (lines.length === 0) lines.push('Everything in this file is already here.');
  if (summary.skipped > 0) lines.push(`Entries skipped as unreadable: ${summary.skipped}`);
  return lines;
}
