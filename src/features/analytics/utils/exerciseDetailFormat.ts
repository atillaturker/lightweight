/**
 * Display text for the Exercise Detail screen: hero, chart labels, record
 * and recent-session rows, per exercise kind and the user's weight unit.
 * Pure string formatting over the read model in `exerciseDetail.ts`.
 */
import type { WeightUnit } from '@domain/entities';
import { Weight } from '@domain/value-objects';
import { formatClock, formatDecimal, formatInteger } from '@lib/format';

import type {
  ExerciseHeroData,
  ExerciseKind,
  ExerciseMetric,
  ExerciseRecordRow,
  RecentExerciseSet,
} from './exerciseDetail';

/** Tab label per metric. */
export const METRIC_LABELS: Record<ExerciseMetric, string> = {
  '1rm': '1RM',
  volume: 'Volume',
  reps: 'Reps',
  hold: 'Hold',
  rpe: 'Effort',
};

/** Chart title per metric. */
export const CHART_TITLES: Record<ExerciseMetric, string> = {
  '1rm': 'ESTIMATED 1RM · LAST 8 WEEKS',
  volume: 'VOLUME · LAST 8 WEEKS',
  reps: 'TOTAL REPS · LAST 8 WEEKS',
  hold: 'LONGEST HOLD · LAST 8 WEEKS',
  rpe: 'AVERAGE RPE · LAST 8 WEEKS',
};

const HERO_LABELS: Record<ExerciseKind, string> = {
  load: 'ESTIMATED 1RM',
  bodyweight: 'MOST REPS',
  timed: 'LONGEST HOLD',
};

/** Convert a stored kilogram value to a display figure for the unit. */
export function formatWeightText(kg: number, unit: WeightUnit): string {
  const weight = Weight.fromKg(Math.max(0, kg));
  return formatDecimal(unit === 'kg' ? weight.toKg() : weight.toLb(), 1);
}

/** Y-axis value formatter for the selected metric. */
export function formatChartValue(metric: ExerciseMetric, value: number): string {
  if (metric === 'reps') return formatInteger(value);
  if (metric === 'hold') return formatClock(value);
  // RPE is 1–10 in half steps: one decimal is exact enough.
  return formatDecimal(value, 1);
}

/** The hero's value in display form, for its kind. */
function heroNumber(kind: ExerciseKind, value: number, unit: WeightUnit): string {
  switch (kind) {
    case 'load':
      return formatWeightText(value, unit);
    case 'bodyweight':
      return formatInteger(value);
    case 'timed':
      return formatClock(value);
  }
}

/** Every text the hero renders. */
export interface HeroTexts {
  label: string;
  valueText: string | null;
  /** Unit beside the value; empty for a clock. */
  unit: string;
  deltaText: string | null;
  deltaPositive: boolean;
  sourceText: string | null;
}

/** Hero texts for an exercise of any kind. */
export function heroTexts(hero: ExerciseHeroData, unit: WeightUnit): HeroTexts {
  const valueUnit = hero.kind === 'load' ? unit : hero.kind === 'bodyweight' ? 'reps' : '';
  const delta = hero.delta;
  const deltaText =
    delta === null
      ? null
      : `${delta > 0 ? '▲' : '▼'} ${heroNumber(hero.kind, Math.abs(delta), unit)}${
          valueUnit === '' ? '' : ` ${valueUnit}`
        } over 8 weeks`;
  return {
    label: HERO_LABELS[hero.kind],
    valueText: hero.value === null ? null : heroNumber(hero.kind, hero.value, unit),
    unit: valueUnit,
    deltaText,
    deltaPositive: delta !== null && delta > 0,
    sourceText:
      hero.source === null
        ? null
        : `From ${formatWeightText(hero.source.weightKg, unit)} ${unit} × ${hero.source.reps}`,
  };
}

/** Right-hand value text for a record row, in the user's unit. */
export function recordValueText(row: ExerciseRecordRow, unit: WeightUnit): string {
  const weight = `${formatWeightText(row.weightKg, unit)} ${unit}`;
  switch (row.type) {
    case 'heaviest_set':
      return `${weight} × ${row.reps}`;
    case 'best_1rm':
      return weight;
    case 'most_reps':
      return row.weightKg > 0 ? `${row.reps} reps · ${weight}` : `${row.reps} reps`;
    case 'longest_hold':
      return formatClock(row.seconds);
  }
}

/** Set summary for a recent-session row: `80 kg × 8 × 3`, `0:45 × 3`. */
export function recentSummaryText(row: RecentExerciseSet, unit: WeightUnit): string {
  let base: string;
  if (row.durationSec !== undefined) base = formatClock(row.durationSec);
  else if (row.weightKg === 0) base = `${row.reps} reps`;
  else base = `${formatWeightText(row.weightKg, unit)} ${unit} × ${row.reps}`;
  return row.sets > 1 ? `${base} × ${row.sets}` : base;
}
