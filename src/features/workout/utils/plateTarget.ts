/**
 * Starting weight for the plate calculator: the set the user is about to
 * lift, in their display unit.
 */
import type { WeightUnit } from '@domain/entities';
import { BAR_WEIGHTS } from '@domain/rules';
import { Weight } from '@domain/value-objects';

import type { ActiveExercise } from '../types';

/** Step of the calculator's −/+ controls, per unit. */
export const PLATE_TARGET_STEP: Readonly<Record<WeightUnit, number>> = { kg: 2.5, lb: 5 };

/**
 * The first incomplete set's weight (else the last set's), converted to
 * `unit` and rounded to the step. Falls back to the default bar when the
 * block carries no weight yet.
 */
export function initialPlateTarget(exercise: ActiveExercise, unit: WeightUnit): number {
  const set = exercise.sets.find((candidate) => !candidate.completed) ?? exercise.sets[exercise.sets.length - 1];
  const kg = set?.weightKg ?? 0;
  if (kg <= 0) return BAR_WEIGHTS[unit][0];
  const weight = Weight.fromKg(kg);
  const value = unit === 'kg' ? weight.toKg() : weight.toLb();
  const step = PLATE_TARGET_STEP[unit];
  return Math.round(value / step) * step;
}
