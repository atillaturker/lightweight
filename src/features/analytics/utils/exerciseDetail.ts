/**
 * Read model for the Exercise Detail screen.
 *
 * Answers "am I getting stronger on this lift?" for one exercise: the
 * current estimated-1RM hero, an 8-week series for the selected metric, the
 * three historical best records, and the recent sessions that trained it.
 * Every metric comes from `@domain/rules`; the caller supplies the sessions,
 * the exercise id, the selected metric, and the current time.
 */
import type { Set as DomainSet, Workout } from '@domain/entities';
import {
  addWeeks,
  bestE1RM,
  bestRecordsForExercise,
  calculateVolume,
  isWorkingSet,
  startOfWeek,
  type PRRecord,
  type PRType,
} from '@domain/rules';

/** The three chart metrics. */
export type ExerciseMetric = '1rm' | 'volume' | 'reps';

/** The record types the screen renders, in order. */
export type ExerciseRecordType = Extract<
  PRType,
  'heaviest_set' | 'best_1rm' | 'most_reps'
>;

/** One row of the Personal records section. */
export interface ExerciseRecordRow {
  type: ExerciseRecordType;
  label: string;
  achievedAt: number;
  /** Bar weight, except `best_1rm`, where it is the estimated 1RM value. */
  weightKg: number;
  /** Reps achieved; 0 when the record does not carry a rep count. */
  reps: number;
}

/** One row of the Recent sets section. */
export interface RecentExerciseSet {
  sessionId: string;
  startedAt: number;
  /** Weight of the session's representative (heaviest) working set. */
  weightKg: number;
  reps: number;
  /** Completed working sets for this exercise in that session. */
  sets: number;
}

/** Everything the Exercise Detail screen renders. */
export interface ExerciseDetailData {
  /** True when the exercise has at least one completed working set. */
  hasHistory: boolean;
  /** Best estimated 1RM over the last 8 weeks, in kg, or `null`. */
  heroE1RMKg: number | null;
  /** Change in best e1RM vs the previous 8 weeks, in kg, or `null`. */
  heroDeltaKg: number | null;
  /** Eight weekly values for the selected metric; `null` where no data. */
  points: (number | null)[];
  /** Change vs the previous 8 weeks for the selected metric, or `null`. */
  delta: number | null;
  /** Sessions in the window that trained this exercise. */
  sessionCount: number;
  /** The three historical best records, in display order. */
  records: ExerciseRecordRow[];
  /** Up to six recent sessions, most recent first. */
  recentSets: RecentExerciseSet[];
}

const WEEKS = 8;
const RECENT_LIMIT = 6;
const WEEK_START = 'monday' as const;

const RECORD_LABELS: Record<ExerciseRecordType, string> = {
  heaviest_set: 'Heaviest set',
  best_1rm: 'Best 1RM',
  most_reps: 'Most reps',
};

const RECORD_ORDER: ExerciseRecordType[] = [
  'heaviest_set',
  'best_1rm',
  'most_reps',
];

/** The exercise's completed working sets within one session. */
function workingSetsFor(session: Workout, exerciseId: string): DomainSet[] {
  return session.sets.filter(
    (set) => set.exerciseId === exerciseId && isWorkingSet(set),
  );
}

/** Every completed working set the exercise has, across all sessions. */
function allWorkingSets(sessions: Workout[], exerciseId: string): DomainSet[] {
  return sessions.flatMap((session) => workingSetsFor(session, exerciseId));
}

/** Working sets for the exercise in sessions started inside `[start, end)`. */
function setsInWindow(
  sessions: Workout[],
  exerciseId: string,
  start: number,
  end: number,
): DomainSet[] {
  return sessions
    .filter((session) => session.startedAt >= start && session.startedAt < end)
    .flatMap((session) => workingSetsFor(session, exerciseId));
}

/** One aggregate for the selected metric, or `null` when there are no sets. */
function metricValue(sets: DomainSet[], metric: ExerciseMetric): number | null {
  if (sets.length === 0) return null;
  switch (metric) {
    case '1rm':
      return bestE1RM(sets)?.value ?? null;
    case 'volume':
      return calculateVolume(sets);
    case 'reps':
      return sets.reduce((total, set) => total + set.reps, 0);
  }
}

/** Difference between two window aggregates, or `null` when either is absent. */
function difference(current: number | null, previous: number | null): number | null {
  if (current === null || previous === null) return null;
  return current - previous;
}

/** Heaviest working-set weight recorded at exactly `reps`, or 0. */
function heaviestWeightForReps(sets: DomainSet[], reps: number): number {
  let heaviest = 0;
  for (const set of sets) {
    if (set.reps === reps && set.weightKg > heaviest) heaviest = set.weightKg;
  }
  return heaviest;
}

/** Collapse the domain records into the screen's three rows, in order. */
function buildRecords(sets: DomainSet[]): ExerciseRecordRow[] {
  const records = bestRecordsForExercise(sets);
  const byType = new Map<PRType, PRRecord>(
    records.map((record) => [record.type, record]),
  );

  const rows: ExerciseRecordRow[] = [];
  for (const type of RECORD_ORDER) {
    const record = byType.get(type);
    if (record === undefined) continue;

    if (type === 'most_reps') {
      rows.push({
        type,
        label: RECORD_LABELS[type],
        achievedAt: record.achievedAt,
        weightKg: heaviestWeightForReps(sets, record.value),
        reps: record.value,
      });
      continue;
    }

    rows.push({
      type,
      label: RECORD_LABELS[type],
      achievedAt: record.achievedAt,
      weightKg: record.value,
      reps: record.repsAtWeight ?? 0,
    });
  }
  return rows;
}

/** Up to six recent sessions that trained the exercise, most recent first. */
function buildRecentSets(
  sessions: Workout[],
  exerciseId: string,
): RecentExerciseSet[] {
  return sessions
    .filter((session) => workingSetsFor(session, exerciseId).length > 0)
    .sort((a, b) => b.startedAt - a.startedAt)
    .slice(0, RECENT_LIMIT)
    .map((session) => {
      const sets = workingSetsFor(session, exerciseId);
      const representative = sets.reduce((best, set) =>
        set.weightKg > best.weightKg ||
        (set.weightKg === best.weightKg && set.reps > best.reps)
          ? set
          : best,
      );
      return {
        sessionId: session.id,
        startedAt: session.startedAt,
        weightKg: representative.weightKg,
        reps: representative.reps,
        sets: sets.length,
      };
    });
}

/** One weekly aggregate per week, oldest first; `null` for empty weeks. */
function buildPoints(
  sessions: Workout[],
  exerciseId: string,
  metric: ExerciseMetric,
  currentStart: number,
): (number | null)[] {
  return Array.from({ length: WEEKS }, (_, index) => {
    const start = addWeeks(currentStart, index);
    return metricValue(
      setsInWindow(sessions, exerciseId, start, addWeeks(start, 1)),
      metric,
    );
  });
}

/** Sessions in the current window that trained the exercise. */
function currentWindowSessions(
  sessions: Workout[],
  exerciseId: string,
  start: number,
  end: number,
): Workout[] {
  return sessions.filter(
    (session) =>
      session.startedAt >= start &&
      session.startedAt < end &&
      workingSetsFor(session, exerciseId).length > 0,
  );
}

/** Build the Exercise Detail read model for one exercise and metric. */
export function buildExerciseDetail(
  sessions: Workout[],
  exerciseId: string,
  metric: ExerciseMetric,
  now: number,
): ExerciseDetailData {
  const anchor = startOfWeek(now, WEEK_START);
  const currentStart = addWeeks(anchor, -(WEEKS - 1));
  const currentEnd = addWeeks(anchor, 1);
  const previousStart = addWeeks(currentStart, -WEEKS);

  const allSets = allWorkingSets(sessions, exerciseId);
  const currentSets = setsInWindow(sessions, exerciseId, currentStart, currentEnd);
  const previousSets = setsInWindow(
    sessions,
    exerciseId,
    previousStart,
    currentStart,
  );
  const currentE1RM = metricValue(currentSets, '1rm');

  return {
    hasHistory: allSets.length > 0,
    heroE1RMKg: currentE1RM,
    heroDeltaKg: difference(currentE1RM, metricValue(previousSets, '1rm')),
    points: buildPoints(sessions, exerciseId, metric, currentStart),
    delta: difference(
      metricValue(currentSets, metric),
      metricValue(previousSets, metric),
    ),
    sessionCount: currentWindowSessions(
      sessions,
      exerciseId,
      currentStart,
      currentEnd,
    ).length,
    records: buildRecords(allSets),
    recentSets: buildRecentSets(sessions, exerciseId),
  };
}
