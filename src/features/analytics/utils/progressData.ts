/**
 * Read model for the Progress screen.
 *
 * Aggregates durable session history into the screen's five metrics, a
 * current-vs-previous bucket series for the trend chart, the per-exercise
 * delta rows, and the period's PR count. Pure — the caller supplies the
 * sessions, the selected metric, the current time, and the exercise-name
 * lookup. Every metric formula comes from `@domain/rules`.
 */
import type { Set as DomainSet, Workout } from '@domain/entities';
import {
  calculateDelta,
  calculateVolume,
  detectPRs,
  isWorkingSet,
  startOfWeek,
  summarizeVolume,
} from '@domain/rules';
import { formatMinutesBetween, formatMonthShort } from '@lib/format';

/** The four selectable time windows. */
export type ProgressRange = '4W' | '12W' | '6M' | '1Y';

/** The five selectable hero metrics. */
export type ProgressMetric = 'volume' | 'sets' | 'reps' | 'time' | 'sessions';

/** Totals for one period, in the metric's base unit (kg / minutes / count). */
export interface ProgressTotals {
  volume: number;
  sets: number;
  reps: number;
  time: number;
  sessions: number;
}

/** One bucket of the grouped trend chart, for the selected metric. */
export interface ProgressBucket {
  /** Per-bucket axis label, e.g. `W3` or `Apr`. */
  label: string;
  /** Current-period value for this bucket. */
  current: number;
  /** Previous-period value for the same position. */
  previous: number;
}

/** One row of the "By exercise" list. */
export interface ExerciseProgressRow {
  exerciseId: string;
  name: string;
  /** Percent change vs the previous period, or `null` with no comparison. */
  deltaPercent: number | null;
  /** Share of the period's total volume, 0..1. Drives the micro-bar. */
  volumeShare: number;
}

/** Everything the Progress screen renders. */
export interface ProgressData {
  /** True when the user has any session at all. */
  hasHistory: boolean;
  /** True when the selected period contains at least one session. */
  hasPeriod: boolean;
  totals: ProgressTotals;
  previousTotals: ProgressTotals;
  /** Percent change per metric, `null` when the previous period is empty. */
  deltas: Record<ProgressMetric, number | null>;
  buckets: ProgressBucket[];
  /** Exactly three x-axis labels, taken from `buckets`. */
  bucketLabels: string[];
  /** Indices of `buckets` that `bucketLabels` were taken from. */
  bucketLabelIndices: number[];
  /** Selected-metric total divided by the bucket count. */
  avgPerBucket: number;
  /** Highest current-period bucket value. */
  peak: number;
  /** Label of the peak bucket. */
  peakLabel: string;
  /** Exercises with 3+ sessions in the period, fastest-improving first. */
  exerciseRows: ExerciseProgressRow[];
  /** Personal records achieved within the period. */
  prCount: number;
}

const WEEK_START = 'monday' as const;
const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_MS = 7 * DAY_MS;
const MAX_EXERCISE_ROWS = 5;

/** Bucket count and unit for each range. */
const RANGE_CONFIG: Record<ProgressRange, { count: number; unit: 'week' | 'month' }> = {
  '4W': { count: 4, unit: 'week' },
  '12W': { count: 12, unit: 'week' },
  '6M': { count: 6, unit: 'month' },
  '1Y': { count: 12, unit: 'month' },
};

/** The derived boundaries of a range: current buckets plus the prior run. */
interface Period {
  count: number;
  unit: 'week' | 'month';
  currentStart: number;
  currentEnd: number;
  previousStart: number;
  labels: string[];
  /** Bucket index for a session start within the current period, else null. */
  bucketIndex: (startedAt: number) => number | null;
  /** Bucket index for a session start within the previous period, else null. */
  previousBucketIndex: (startedAt: number) => number | null;
}

/** First instant of the calendar month containing `timestamp`, local time. */
function monthStart(timestamp: number): number {
  const date = new Date(timestamp);
  return new Date(date.getFullYear(), date.getMonth(), 1).getTime();
}

/** First instant of the month `count` months from `timestamp`. */
function addMonths(timestamp: number, count: number): number {
  const date = new Date(timestamp);
  return new Date(date.getFullYear(), date.getMonth() + count, 1).getTime();
}

/** Sortable absolute month number for a timestamp. */
function monthIndex(timestamp: number): number {
  const date = new Date(timestamp);
  return date.getFullYear() * 12 + date.getMonth();
}

/** Build the current and previous bucket boundaries for a range. */
function buildPeriod(range: ProgressRange, now: number): Period {
  const { count, unit } = RANGE_CONFIG[range];

  if (unit === 'week') {
    const anchor = startOfWeek(now, WEEK_START);
    const currentStart = anchor - (count - 1) * WEEK_MS;
    const previousStart = currentStart - count * WEEK_MS;
    return {
      count,
      unit,
      currentStart,
      currentEnd: anchor + WEEK_MS,
      previousStart,
      labels: Array.from({ length: count }, (_, index) => `W${index + 1}`),
      bucketIndex: (startedAt) => {
        const index = (startOfWeek(startedAt, WEEK_START) - currentStart) / WEEK_MS;
        return index >= 0 && index < count ? index : null;
      },
      previousBucketIndex: (startedAt) => {
        const index = (startOfWeek(startedAt, WEEK_START) - previousStart) / WEEK_MS;
        return index >= 0 && index < count ? index : null;
      },
    };
  }

  const anchor = monthStart(now);
  const currentStart = addMonths(anchor, -(count - 1));
  const previousStart = addMonths(currentStart, -count);
  return {
    count,
    unit,
    currentStart,
    currentEnd: addMonths(anchor, 1),
    previousStart,
    labels: Array.from({ length: count }, (_, index) =>
      formatMonthShort(addMonths(currentStart, index)),
    ),
    bucketIndex: (startedAt) => {
      const index = monthIndex(startedAt) - monthIndex(currentStart);
      return index >= 0 && index < count ? index : null;
    },
    previousBucketIndex: (startedAt) => {
      const index = monthIndex(startedAt) - monthIndex(previousStart);
      return index >= 0 && index < count ? index : null;
    },
  };
}

/** True when a session starts inside `[start, end)`. */
function inWindow(session: Workout, start: number, end: number): boolean {
  return session.startedAt >= start && session.startedAt < end;
}

/** Sum the four base metrics and the session count for a set of sessions. */
function summarizeTotals(sessions: Workout[], now: number): ProgressTotals {
  let volume = 0;
  let sets = 0;
  let reps = 0;
  let time = 0;

  for (const session of sessions) {
    const summary = summarizeVolume(session.sets);
    volume += summary.total;
    sets += summary.sets;
    reps += summary.reps;
    time += formatMinutesBetween(session.startedAt, session.finishedAt, now);
  }

  return { volume, sets, reps, time, sessions: sessions.length };
}

/** One session's contribution to the selected metric. */
function sessionMetricValue(
  session: Workout,
  metric: ProgressMetric,
  now: number,
): number {
  switch (metric) {
    case 'volume':
      return calculateVolume(session.sets);
    case 'sets':
      return summarizeVolume(session.sets).sets;
    case 'reps':
      return summarizeVolume(session.sets).reps;
    case 'time':
      return formatMinutesBetween(session.startedAt, session.finishedAt, now);
    case 'sessions':
      return 1;
  }
}

/** Per-exercise session counts and working volume for one set of sessions. */
function exerciseVolumeBySession(
  sessions: Workout[],
): Map<string, { sessions: number; volume: number }> {
  const byExercise = new Map<string, { sessions: number; volume: number }>();
  for (const session of sessions) {
    const { perExercise } = summarizeVolume(session.sets);
    for (const [exerciseId, volume] of Object.entries(perExercise)) {
      const entry = byExercise.get(exerciseId) ?? { sessions: 0, volume: 0 };
      entry.sessions += 1;
      entry.volume += volume;
      byExercise.set(exerciseId, entry);
    }
  }
  return byExercise;
}

/**
 * Build the "By exercise" rows: exercises with 3+ sessions in the current
 * period, compared against the previous period, fastest-improving first.
 */
function buildExerciseRows(
  current: Workout[],
  previous: Workout[],
  totalVolume: number,
  names: Map<string, string>,
): ExerciseProgressRow[] {
  const currentByExercise = exerciseVolumeBySession(current);
  const previousVolume = new Map<string, number>();
  for (const [exerciseId, entry] of exerciseVolumeBySession(previous)) {
    previousVolume.set(exerciseId, entry.volume);
  }

  return Array.from(currentByExercise.entries())
    .filter(([, entry]) => entry.sessions >= 3)
    .map(([exerciseId, entry]) => ({
      exerciseId,
      name: names.get(exerciseId) ?? 'Unknown exercise',
      deltaPercent: calculateDelta(entry.volume, previousVolume.get(exerciseId) ?? 0),
      volumeShare: totalVolume > 0 ? entry.volume / totalVolume : 0,
    }))
    .sort(
      (a, b) => (b.deltaPercent ?? -Infinity) - (a.deltaPercent ?? -Infinity),
    )
    .slice(0, MAX_EXERCISE_ROWS);
}

/** Individual PR records achieved by sessions starting in the window. */
function countPeriodPRs(sessions: Workout[], start: number, end: number): number {
  const chronological = [...sessions].sort((a, b) => a.startedAt - b.startedAt);
  const history = new Map<string, DomainSet[]>();
  let count = 0;

  for (const session of chronological) {
    const inPeriod = inWindow(session, start, end);
    const ordered = [...session.sets].sort(
      (a, b) => (a.completedAt ?? 0) - (b.completedAt ?? 0),
    );

    for (const set of ordered) {
      const prior = history.get(set.exerciseId) ?? [];
      if (inPeriod) count += detectPRs(prior, set).length;
      if (isWorkingSet(set)) history.set(set.exerciseId, [...prior, set]);
    }
  }

  return count;
}

/** The three x-axis label indices for a bucket count. */
function labelIndices(count: number): number[] {
  if (count <= 2) return Array.from({ length: count }, (_, index) => index);
  return [0, Math.floor((count - 1) / 2), count - 1];
}

/** Percent change per metric, null when the previous period is empty. */
function buildDeltas(
  totals: ProgressTotals,
  previous: ProgressTotals,
): Record<ProgressMetric, number | null> {
  return {
    volume: calculateDelta(totals.volume, previous.volume),
    sets: calculateDelta(totals.sets, previous.sets),
    reps: calculateDelta(totals.reps, previous.reps),
    time: calculateDelta(totals.time, previous.time),
    sessions: calculateDelta(totals.sessions, previous.sessions),
  };
}

/** Aggregate sessions into current and previous buckets for the metric. */
function buildBuckets(
  sessions: Workout[],
  period: Period,
  metric: ProgressMetric,
  now: number,
): { buckets: ProgressBucket[]; currentValues: number[] } {
  const currentValues = new Array<number>(period.count).fill(0);
  const previousValues = new Array<number>(period.count).fill(0);

  for (const session of sessions) {
    const currentIndex = period.bucketIndex(session.startedAt);
    if (currentIndex !== null) {
      currentValues[currentIndex] += sessionMetricValue(session, metric, now);
    }
    const previousIndex = period.previousBucketIndex(session.startedAt);
    if (previousIndex !== null) {
      previousValues[previousIndex] += sessionMetricValue(session, metric, now);
    }
  }

  const buckets = period.labels.map((label, index) => ({
    label,
    current: currentValues[index],
    previous: previousValues[index],
  }));
  return { buckets, currentValues };
}

/** Index of the highest current-period bucket, or 0 when all are zero. */
function peakIndex(values: number[]): number {
  return values.reduce(
    (best, value, index) => (value > values[best] ? index : best),
    0,
  );
}

/** Build the full Progress read model for one range and metric. */
export function buildProgressData(
  sessions: Workout[],
  range: ProgressRange,
  metric: ProgressMetric,
  now: number,
  names: Map<string, string>,
): ProgressData {
  const period = buildPeriod(range, now);
  const current = sessions.filter((session) =>
    inWindow(session, period.currentStart, period.currentEnd),
  );
  const previous = sessions.filter((session) =>
    inWindow(session, period.previousStart, period.currentStart),
  );

  const totals = summarizeTotals(current, now);
  const previousTotals = summarizeTotals(previous, now);
  const { buckets, currentValues } = buildBuckets(sessions, period, metric, now);
  const indices = labelIndices(period.count);
  const peakAt = peakIndex(currentValues);

  return {
    hasHistory: sessions.length > 0,
    hasPeriod: current.length > 0,
    totals,
    previousTotals,
    deltas: buildDeltas(totals, previousTotals),
    buckets,
    bucketLabels: indices.map((index) => buckets[index].label),
    bucketLabelIndices: indices,
    avgPerBucket: totals[metric] / period.count,
    peak: currentValues[peakAt],
    peakLabel: buckets[peakAt].label,
    exerciseRows: buildExerciseRows(current, previous, totals.volume, names),
    prCount: countPeriodPRs(sessions, period.currentStart, period.currentEnd),
  };
}
