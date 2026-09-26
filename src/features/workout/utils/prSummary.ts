/**
 * Personal-record roll-up for the post-workout summary.
 *
 * Two sources of truth are combined here:
 *
 * - The persisted `isPR` flag on each set, written when the workout was
 *   finished against the user's full history. It is authoritative.
 * - Replayed detection seeded with the sets from *earlier* sessions, used
 *   both to describe a flagged set (which record type, what value) and as a
 *   fallback for sessions recorded before the flag existed.
 *
 * Replaying against a session alone is wrong — it marks the first working
 * set of every exercise as a record — which is why the caller must supply
 * the prior history rather than leaving it empty.
 *
 * All detection is delegated to `@domain/rules/pr` — no thresholds or
 * comparisons are reimplemented here.
 */
import type { Set } from '@domain/entities';
import { detectPRs, type PRRecord, type PRType } from '@domain/rules';
import { isWorkingSet } from '@domain/rules/e1rm';
import { formatDecimal, formatWeightKg } from '@lib/format';

/** One row of the summary's personal-records section. */
export interface PRSummaryRow {
  exerciseId: string;
  /** Exercise name, resolved from the library. */
  exerciseName: string;
  /** e.g. `Heaviest set · 80kg × 8`. */
  description: string;
}

/**
 * Which record to show when an exercise sets more than one. A heavier bar
 * is the most legible headline, so it outranks an estimate, which in turn
 * outranks a rep record.
 */
const PRIORITY: readonly PRType[] = ['heaviest_set', 'best_1rm', 'most_reps'];

/** Human-readable description of a single record. */
function describe(record: PRRecord): string {
  switch (record.type) {
    case 'heaviest_set':
      return `Heaviest set · ${formatWeightKg(record.value)}kg × ${record.repsAtWeight ?? 0}`;
    case 'best_1rm':
      return `Best e1RM · ${formatDecimal(record.value)}kg`;
    case 'most_reps':
      return `Most reps · ${record.value}`;
    case 'best_session_volume':
      return `Session volume · ${formatWeightKg(record.value)}kg`;
    default:
      return 'Personal record';
  }
}

/** Higher is better within a record type; used to pick the best per type. */
function keepBest(
  best: Map<string, PRRecord>,
  record: PRRecord,
): void {
  const key = `${record.exerciseId}:${record.type}`;
  const current = best.get(key);
  if (current === undefined || record.value > current.value) {
    best.set(key, record);
  }
}

/**
 * Collapse the per-type records into one row per exercise, choosing the
 * highest-priority record that exercise achieved.
 */
function toRows(
  best: Map<string, PRRecord>,
  exerciseNames: Map<string, string>,
): PRSummaryRow[] {
  const byExercise = new Map<string, PRRecord>();
  for (const record of best.values()) {
    const current = byExercise.get(record.exerciseId);
    if (
      current === undefined ||
      PRIORITY.indexOf(record.type) < PRIORITY.indexOf(current.type)
    ) {
      byExercise.set(record.exerciseId, record);
    }
  }

  return Array.from(byExercise.values()).map((record) => ({
    exerciseId: record.exerciseId,
    exerciseName:
      exerciseNames.get(record.exerciseId) ?? 'Unknown exercise',
    description: describe(record),
  }));
}

/** Seed the per-exercise working-set history from earlier sessions. */
function seedHistory(priorSets: Set[]): Map<string, Set[]> {
  const byExercise = new Map<string, Set[]>();
  for (const set of priorSets) {
    if (!isWorkingSet(set)) continue;
    const existing = byExercise.get(set.exerciseId);
    if (existing === undefined) byExercise.set(set.exerciseId, [set]);
    else existing.push(set);
  }
  return byExercise;
}

/**
 * Every record the session achieved, one row per exercise.
 *
 * `priorSets` must hold the working sets of every session that came before
 * this one. A set counts as a record when its persisted `isPR` flag is set,
 * or — for sessions recorded before the flag existed — when replaying
 * detection against `priorSets` produces one.
 */
export function summarizeSessionPRs(
  sets: Set[],
  exerciseNames: Map<string, string>,
  priorSets: Set[] = [],
): PRSummaryRow[] {
  const ordered = [...sets].sort(
    (a, b) => (a.completedAt ?? 0) - (b.completedAt ?? 0),
  );

  const historyByExercise = seedHistory(priorSets);
  const best = new Map<string, PRRecord>();

  for (const set of ordered) {
    const history = historyByExercise.get(set.exerciseId) ?? [];
    const replayed = detectPRs(history, set);
    const isRecord =
      set.isPR === true || (set.isPR === undefined && replayed.length > 0);

    if (isRecord) {
      for (const record of replayed) {
        if (record.type !== 'best_session_volume') keepBest(best, record);
      }
    }

    if (isWorkingSet(set)) {
      historyByExercise.set(set.exerciseId, [...history, set]);
    }
  }

  return toRows(best, exerciseNames);
}
