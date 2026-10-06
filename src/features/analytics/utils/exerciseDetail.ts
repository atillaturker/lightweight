/**
 * Read model for the Exercise Detail screen.
 *
 * Answers "am I getting stronger on this lift?" for one exercise: the
 * current estimated-1RM hero, an 8-week series for the selected metric, the
 * three historical best records, and the recent sessions that trained it.
 * Every metric comes from `@domain/rules`; the caller supplies the sessions,
 * the exercise id, the selected metric, and the current time.
 */
import type { Exercise, Set as DomainSet, Workout } from '@domain/entities';
import {
  addWeeks,
  averageRpe,
  bestE1RM,
  bestRecordsForExercise,
  calculateVolume,
  hasRpeData,
  isBodyweightExercise,
  isTimedExercise,
  isTimedSet,
  isWorkingSet,
  startOfWeek,
  totalReps,
  type PRRecord,
  type PRType,
} from '@domain/rules';

/**
 * How an exercise is measured, for the screen's purposes: external load
 * (e1RM is meaningful), bodyweight (reps are the progress), or timed
 * (hold length is the progress).
 */
export type ExerciseKind = 'load' | 'bodyweight' | 'timed';

/** The chart metrics. `rpe` is offered only when the exercise has ratings. */
export type ExerciseMetric = '1rm' | 'volume' | 'reps' | 'hold' | 'rpe';

/** Metrics each kind offers, default first. `rpe` is added when rated. */
const KIND_METRICS: Record<ExerciseKind, readonly ExerciseMetric[]> = {
  load: ['1rm', 'volume', 'reps'],
  bodyweight: ['reps'],
  timed: ['hold'],
};

/** The kind of a library exercise; unknown exercises count as load. */
export function exerciseKind(
  exercise: Pick<Exercise, 'measure' | 'equipment'> | null,
): ExerciseKind {
  if (exercise === null) return 'load';
  if (isTimedExercise(exercise)) return 'timed';
  return isBodyweightExercise(exercise) ? 'bodyweight' : 'load';
}

/** The hero: the one number that says whether the exercise is progressing. */
export interface ExerciseHeroData {
  kind: ExerciseKind;
  /** e1RM (kg), most reps in a set, or longest hold (s); `null` without data. */
  value: number | null;
  /** Change vs the previous 8 weeks, same unit as `value`, or `null`. */
  delta: number | null;
  /** For `load`: the set the e1RM is estimated from. */
  source: { weightKg: number; reps: number } | null;
}

/** The record types the screen renders, in order. */
export type ExerciseRecordType = Extract<
  PRType,
  'heaviest_set' | 'best_1rm' | 'most_reps' | 'longest_hold'
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
  /** Seconds held, for `longest_hold`; 0 otherwise. */
  seconds: number;
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
  /** Longest hold of the session, for a timed exercise. */
  durationSec?: number;
}

/** Everything the Exercise Detail screen renders. */
export interface ExerciseDetailData {
  /** True when the exercise has at least one completed working set. */
  hasHistory: boolean;
  hero: ExerciseHeroData;
  /** The metric the series was built for (falls back to the kind's default). */
  metric: ExerciseMetric;
  /** Metrics the screen offers for this exercise, default first. */
  metrics: ExerciseMetric[];
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
  longest_hold: 'Longest hold',
};

const RECORD_ORDER: ExerciseRecordType[] = [
  'heaviest_set',
  'best_1rm',
  'most_reps',
  'longest_hold',
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

/** Longest timed hold among the sets, in seconds, or `null` when none. */
function longestHold(sets: DomainSet[]): number | null {
  const holds = sets.filter(isTimedSet).map((set) => set.durationSec ?? 0);
  return holds.length === 0 ? null : Math.max(...holds);
}

/** Most reps in a single set, or `null` when there are no rep sets. */
function mostReps(sets: DomainSet[]): number | null {
  const reps = sets.filter((set) => !isTimedSet(set)).map((set) => set.reps);
  return reps.length === 0 ? null : Math.max(...reps);
}

/** The hero number of one window for an exercise kind. */
function heroValue(sets: DomainSet[], kind: ExerciseKind): number | null {
  switch (kind) {
    case 'load':
      return bestE1RM(sets)?.value ?? null;
    case 'bodyweight':
      return mostReps(sets);
    case 'timed':
      return longestHold(sets);
  }
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
      return sets.reduce((total, set) => total + totalReps(set), 0);
    case 'hold':
      return longestHold(sets);
    case 'rpe':
      return averageRpe(sets);
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

/** One records row; what `value` means depends on the record type. */
function toRecordRow(
  type: ExerciseRecordType,
  record: PRRecord,
  sets: DomainSet[],
): ExerciseRecordRow {
  const base = { type, label: RECORD_LABELS[type], achievedAt: record.achievedAt };
  switch (type) {
    case 'most_reps':
      return { ...base, weightKg: heaviestWeightForReps(sets, record.value), reps: record.value, seconds: 0 };
    case 'longest_hold':
      return { ...base, weightKg: 0, reps: 0, seconds: record.value };
    default:
      return { ...base, weightKg: record.value, reps: record.repsAtWeight ?? 0, seconds: 0 };
  }
}

/** Collapse the domain records into the screen's rows, in order. */
function buildRecords(sets: DomainSet[]): ExerciseRecordRow[] {
  const records = bestRecordsForExercise(sets);
  const byType = new Map<PRType, PRRecord>(
    records.map((record) => [record.type, record]),
  );

  const rows: ExerciseRecordRow[] = [];
  for (const type of RECORD_ORDER) {
    const record = byType.get(type);
    if (record === undefined) continue;

    rows.push(toRecordRow(type, record, sets));
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
      const hold = longestHold(sets);
      return {
        sessionId: session.id,
        startedAt: session.startedAt,
        weightKg: representative.weightKg,
        reps: representative.reps,
        sets: sets.length,
        ...(hold !== null ? { durationSec: hold } : {}),
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

/** The kind's metrics plus `rpe` when rated; the requested one if offered. */
function resolveMetrics(
  kind: ExerciseKind,
  rated: boolean,
  requested: ExerciseMetric,
): { metric: ExerciseMetric; metrics: ExerciseMetric[] } {
  const metrics = rated ? [...KIND_METRICS[kind], 'rpe' as const] : [...KIND_METRICS[kind]];
  return { metric: metrics.includes(requested) ? requested : metrics[0], metrics };
}

/**
 * Build the Exercise Detail read model for one exercise and metric. A
 * metric the exercise does not offer falls back to its kind's default.
 */
export function buildExerciseDetail(
  sessions: Workout[],
  exerciseId: string,
  requestedMetric: ExerciseMetric,
  now: number,
  kind: ExerciseKind = 'load',
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
  const { metric, metrics } = resolveMetrics(kind, hasRpeData(allSets), requestedMetric);
  const heroNow = heroValue(currentSets, kind);

  return {
    hasHistory: allSets.length > 0,
    hero: {
      kind,
      value: heroNow,
      delta: difference(heroNow, heroValue(previousSets, kind)),
      source: kind === 'load' ? (bestE1RM(currentSets)?.sourceSet ?? null) : null,
    },
    metric,
    metrics,
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
